import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrescriptionRepository } from './prescription.repository';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  FillPrescriptionDto,
  PrescriptionQueryDto,
} from './dto/prescription.dto';
import { createPaginatedResponse, PaginatedResponse } from '@common/dto/pagination.dto';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { PrescriptionStatus, UserRole } from '@common/constants';

const CACHE_TTL = 300;
const CACHE_PREFIX = 'prescription:';

@Injectable()
export class PrescriptionService {
  constructor(
    private prescriptionRepository: PrescriptionRepository,
    private prisma: PrismaService,
    private redisService: RedisService,
    private logger: WinstonLoggerService,
  ) {
    this.logger.setContext('PrescriptionService');
  }

  async create(
    dto: CreatePrescriptionDto,
    currentUser: { id: string; role: UserRole },
  ) {
    // Only doctors can create prescriptions
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Only doctors can create prescriptions');
    }

    // Get doctor ID from user
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: currentUser.id },
    });

    if (!doctor && currentUser.role === UserRole.DOCTOR) {
      throw new BadRequestException('Doctor profile not found');
    }

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify appointment if provided
    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: dto.appointmentId },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (appointment.patientId !== dto.patientId) {
        throw new BadRequestException('Appointment does not belong to this patient');
      }
    }

    if (!doctor?.id) {
      throw new ForbiddenException('Doctor profile not found');
    }

    const prescription = await this.prescriptionRepository.create(
      {
        patientId: dto.patientId,
        doctorId: doctor.id,
        appointmentId: dto.appointmentId,
        diagnosis: dto.diagnosis,
        notes: dto.notes,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
      dto.items,
    );

    this.logger.log(`Prescription created: ${prescription.id}`, 'PrescriptionService');

    return prescription;
  }

  async findAll(
    query: PrescriptionQueryDto,
    currentUser: { id: string; role: UserRole },
  ): Promise<PaginatedResponse<any>> {
    let where = this.prescriptionRepository.buildWhereClause({
      status: query.status,
      patientId: query.patientId,
      doctorId: query.doctorId,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });

    // Patients can only see their own prescriptions
    if (currentUser.role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: currentUser.id },
      });
      if (patient) {
        where = { ...where, patientId: patient.id };
      }
    }

    // Doctors can only see prescriptions they created
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (doctor) {
        where = { ...where, doctorId: doctor.id };
      }
    }

    // SECURITY FIX: Pharmacies can only see prescriptions explicitly shared with them
    // They should NOT have access to ALL active prescriptions - this is a HIPAA violation
    if (currentUser.role === UserRole.PHARMACY) {
      const pharmacy = await this.prisma.pharmacy.findUnique({
        where: { userId: currentUser.id },
      });
      if (pharmacy) {
        // Only show prescriptions where patient has granted consent to this specific pharmacy
        // or prescriptions that were explicitly sent to this pharmacy
        where = { 
          ...where, 
          status: PrescriptionStatus.ACTIVE,
          OR: [
            { pharmacyId: pharmacy.id }, // Prescriptions sent to this pharmacy
            // Add additional consent-based filtering as needed
          ],
        };
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const skip = (page - 1) * limit;
    const take = limit;

    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [prescriptions, total] = await Promise.all([
      this.prescriptionRepository.findAll({
        skip,
        take,
        where,
        orderBy,
      }),
      this.prescriptionRepository.count(where),
    ]);

    return createPaginatedResponse(prescriptions, total, page, limit);
  }

  async findById(id: string, currentUser: { id: string; role: UserRole }) {
    const cacheKey = `${CACHE_PREFIX}${id}`;
    const cached = await this.redisService.get<any>(cacheKey);
    
    if (cached) {
      // SECURITY FIX: Always check access permissions, even for cached data
      await this.checkAccess(cached, currentUser);
      return cached;
    }

    const prescription = await this.prescriptionRepository.findById(id);

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Check access
    await this.checkAccess(prescription, currentUser);

    await this.redisService.set(cacheKey, prescription, CACHE_TTL);

    return prescription;
  }

  async update(
    id: string,
    dto: UpdatePrescriptionDto,
    currentUser: { id: string; role: UserRole },
  ) {
    const prescription = await this.prescriptionRepository.findById(id);

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only the prescribing doctor or admin can update
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!doctor || prescription.doctorId !== doctor.id) {
        throw new ForbiddenException('You can only update your own prescriptions');
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only doctors can update prescriptions');
    }

    // Cannot update filled or cancelled prescriptions
    if (
      prescription.status === PrescriptionStatus.FILLED ||
      prescription.status === PrescriptionStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot update a filled or cancelled prescription');
    }

    const updated = await this.prescriptionRepository.update(id, {
      ...dto,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    });

    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Prescription updated: ${id}`, 'PrescriptionService');

    return updated;
  }

  async fill(
    id: string,
    dto: FillPrescriptionDto,
    currentUser: { id: string; role: UserRole },
  ) {
    const prescription = await this.prescriptionRepository.findById(id);

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only pharmacies or admins can fill prescriptions
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.PHARMACY) {
      throw new ForbiddenException('Only pharmacies can fill prescriptions');
    }

    if (prescription.status !== PrescriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active prescriptions can be filled');
    }

    // Check if expired
    if (prescription.validUntil && new Date(prescription.validUntil) < new Date()) {
      throw new BadRequestException('Prescription has expired');
    }

    // Verify pharmacy exists
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: dto.pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    const filled = await this.prescriptionRepository.fillPrescription(id, dto.pharmacyId);

    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Prescription filled: ${id} by pharmacy ${dto.pharmacyId}`, 'PrescriptionService');

    return filled;
  }

  async cancel(id: string, currentUser: { id: string; role: UserRole }) {
    const prescription = await this.prescriptionRepository.findById(id);

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only the prescribing doctor or admin can cancel
    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!doctor || prescription.doctorId !== doctor.id) {
        throw new ForbiddenException('You can only cancel your own prescriptions');
      }
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only doctors can cancel prescriptions');
    }

    if (prescription.status === PrescriptionStatus.FILLED) {
      throw new BadRequestException('Cannot cancel a filled prescription');
    }

    const cancelled = await this.prescriptionRepository.update(id, {
      status: PrescriptionStatus.CANCELLED,
    });

    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Prescription cancelled: ${id}`, 'PrescriptionService');

    return cancelled;
  }

  async refillItem(
    prescriptionId: string,
    itemId: string,
    currentUser: { id: string; role: UserRole },
  ) {
    const prescription = await this.prescriptionRepository.findById(prescriptionId);

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    // Only pharmacies or admins can process refills
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.PHARMACY) {
      throw new ForbiddenException('Only pharmacies can process refills');
    }

    const item = prescription.items?.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException('Prescription item not found');
    }

    if (item.refillsUsed >= item.refillsAllowed) {
      throw new BadRequestException('No refills remaining for this item');
    }

    await this.prescriptionRepository.incrementRefill(itemId);

    await this.redisService.del(`${CACHE_PREFIX}${prescriptionId}`);

    this.logger.log(`Refill processed for item ${itemId}`, 'PrescriptionService');

    return { message: 'Refill processed successfully' };
  }

  private async checkAccess(
    prescription: any,
    currentUser: { id: string; role: UserRole },
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: { userId: currentUser.id },
      });
      if (!patient || prescription.patientId !== patient.id) {
        throw new ForbiddenException('You do not have access to this prescription');
      }
    }

    if (currentUser.role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!doctor || prescription.doctorId !== doctor.id) {
        throw new ForbiddenException('You do not have access to this prescription');
      }
    }

    // Pharmacies can access active prescriptions
    if (currentUser.role === UserRole.PHARMACY) {
      if (prescription.status !== PrescriptionStatus.ACTIVE) {
        throw new ForbiddenException('You can only access active prescriptions');
      }
    }
  }
}
