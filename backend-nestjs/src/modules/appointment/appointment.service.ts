import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto,
  AppointmentQueryDto,
} from './dto/appointment.dto';
import { createPaginatedResponse, PaginatedResponse } from '@common/dto/pagination.dto';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { AppointmentStatus, UserRole } from '@common/constants';
import { PrismaService } from '@common/prisma/prisma.service';

const CACHE_TTL = 300;
const CACHE_PREFIX = 'appointment:';

@Injectable()
export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private prisma: PrismaService,
    private redisService: RedisService,
    private logger: WinstonLoggerService,
  ) {
    this.logger.setContext('AppointmentService');
  }

  async create(dto: CreateAppointmentDto, currentUser: { id: string; role: UserRole }) {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: dto.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check access - patients can only book for themselves
    if (currentUser.role === UserRole.PATIENT && patient.userId !== currentUser.id) {
      throw new ForbiddenException('You can only book appointments for yourself');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    const duration = dto.duration || 30;

    // Check if the appointment is in the future
    if (scheduledAt <= new Date()) {
      throw new BadRequestException('Appointment must be scheduled in the future');
    }

    // Check for scheduling conflicts
    const hasConflict = await this.appointmentRepository.checkConflict(
      dto.doctorId,
      scheduledAt,
      duration,
    );

    if (hasConflict) {
      throw new ConflictException('This time slot is not available');
    }

    const appointment = await this.appointmentRepository.create({
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      scheduledAt,
      duration,
      type: dto.type,
      reason: dto.reason,
      symptoms: JSON.stringify(dto.symptoms || []),
    });

    this.logger.log(`Appointment created: ${appointment.id}`, 'AppointmentService');

    return appointment;
  }

  async findAll(
    query: AppointmentQueryDto,
    currentUser: { id: string; role: UserRole },
  ): Promise<PaginatedResponse<any>> {
    let where = this.appointmentRepository.buildWhereClause({
      status: query.status,
      type: query.type,
      patientId: query.patientId,
      doctorId: query.doctorId,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });

    // Patients can only see their own appointments
    if (currentUser.role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: currentUser.id },
      });
      if (patient) {
        where = { ...where, patientId: patient.id };
      }
    }

    // Doctors can only see their own appointments
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (doctor) {
        where = { ...where, doctorId: doctor.id };
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'scheduledAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const skip = (page - 1) * limit;
    const take = limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [appointments, total] = await Promise.all([
      this.appointmentRepository.findAll({
        skip,
        take,
        where,
        orderBy,
      }),
      this.appointmentRepository.count(where),
    ]);

    return createPaginatedResponse(appointments, total, page, limit);
  }

  async findById(id: string, currentUser: { id: string; role: UserRole }) {
    const cacheKey = `${CACHE_PREFIX}${id}`;
    const cached = await this.redisService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check access
    await this.checkAccess(appointment, currentUser);

    await this.redisService.set(cacheKey, appointment, CACHE_TTL);

    return appointment;
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    currentUser: { id: string; role: UserRole },
  ) {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.checkAccess(appointment, currentUser);

    // Cannot update cancelled or completed appointments
    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException('Cannot update a cancelled or completed appointment');
    }

    // Check for conflicts if rescheduling
    if (dto.scheduledAt) {
      const scheduledAt = new Date(dto.scheduledAt);
      const duration = dto.duration || appointment.duration;

      if (scheduledAt <= new Date()) {
        throw new BadRequestException('Appointment must be scheduled in the future');
      }

      const hasConflict = await this.appointmentRepository.checkConflict(
        appointment.doctorId,
        scheduledAt,
        duration,
        id,
      );

      if (hasConflict) {
        throw new ConflictException('This time slot is not available');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.scheduledAt) {
      updateData.scheduledAt = new Date(dto.scheduledAt);
    }
    if (dto.duration !== undefined) {
      updateData.duration = dto.duration;
    }
    if (dto.type !== undefined) {
      updateData.type = dto.type;
    }
    if (dto.reason !== undefined) {
      updateData.reason = dto.reason;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }
    if (dto.symptoms !== undefined) {
      updateData.symptoms = JSON.stringify(dto.symptoms);
    }

    const updated = await this.appointmentRepository.update(id, updateData);

    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Appointment updated: ${id}`, 'AppointmentService');

    return updated;
  }

  async cancel(
    id: string,
    dto: CancelAppointmentDto,
    currentUser: { id: string; role: UserRole },
  ) {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.checkAccess(appointment, currentUser);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    const updated = await this.appointmentRepository.update(id, {
      status: AppointmentStatus.CANCELLED,
      cancelReason: dto.reason,
      cancelledAt: new Date(),
    });

    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Appointment cancelled: ${id}`, 'AppointmentService');

    return updated;
  }

  async confirm(id: string, currentUser: { id: string; role: UserRole }) {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only doctors or admins can confirm
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only doctors can confirm appointments');
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new BadRequestException('Only scheduled appointments can be confirmed');
    }

    const updated = await this.appointmentRepository.update(id, {
      status: AppointmentStatus.CONFIRMED,
    });

    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    return updated;
  }

  async complete(
    id: string,
    notes: string,
    currentUser: { id: string; role: UserRole },
  ) {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only doctors or admins can complete
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only doctors can complete appointments');
    }

    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new BadRequestException('Only confirmed or in-progress appointments can be completed');
    }

    const updated = await this.appointmentRepository.update(id, {
      status: AppointmentStatus.COMPLETED,
      notes,
      completedAt: new Date(),
    });

    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Appointment completed: ${id}`, 'AppointmentService');

    return updated;
  }

  async getDoctorAvailability(doctorId: string, date: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointments = await this.appointmentRepository.getDoctorAvailability(
      doctorId,
      new Date(date),
    );

    // Generate available slots (9 AM to 5 PM, 30-minute slots)
    const slots: { time: string; available: boolean }[] = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minutes of [0, 30]) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minutes, 0, 0);

        const isBooked = appointments.some((apt) => {
          const aptStart = new Date(apt.scheduledAt);
          const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
          return slotTime >= aptStart && slotTime < aptEnd;
        });

        slots.push({
          time: slotTime.toISOString(),
          available: !isBooked && slotTime > new Date(),
        });
      }
    }

    return {
      doctor: {
        id: doctor.id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
      },
      date,
      slots,
    };
  }

  private async checkAccess(
    appointment: any,
    currentUser: { id: string; role: UserRole },
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: currentUser.id },
      });
      if (!patient || appointment.patientId !== patient.id) {
        throw new ForbiddenException('You do not have access to this appointment');
      }
    }

    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!doctor || appointment.doctorId !== doctor.id) {
        throw new ForbiddenException('You do not have access to this appointment');
      }
    }
  }
}
