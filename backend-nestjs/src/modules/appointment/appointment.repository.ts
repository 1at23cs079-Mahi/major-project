import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { Appointment, Prisma } from '@prisma/client';
import { AppointmentStatus, AppointmentType } from '@common/constants';

export interface AppointmentWithRelations extends Appointment {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

@Injectable()
export class AppointmentRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AppointmentUncheckedCreateInput): Promise<AppointmentWithRelations> {
    return this.prisma.appointment.create({
      data,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<AppointmentWithRelations | null> {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AppointmentWhereInput;
    orderBy?: Prisma.AppointmentOrderByWithRelationInput;
  }): Promise<AppointmentWithRelations[]> {
    const { skip, take, where, orderBy } = params;

    return this.prisma.appointment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.AppointmentWhereInput): Promise<number> {
    return this.prisma.appointment.count({ where });
  }

  async update(id: string, data: Prisma.AppointmentUpdateInput): Promise<AppointmentWithRelations> {
    return this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });
  }

  async checkConflict(
    doctorId: string,
    scheduledAt: Date,
    duration: number,
    excludeId?: string,
  ): Promise<boolean> {
    const newAppointmentStart = scheduledAt;
    const newAppointmentEnd = new Date(scheduledAt.getTime() + duration * 60000);

    // BUGFIX: Proper overlap detection that considers existing appointment durations
    // Two appointments overlap if: new_start < existing_end AND new_end > existing_start
    const conflictingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
      },
    });

    // Check for overlap with each existing appointment
    for (const existing of conflictingAppointments) {
      const existingStart = existing.scheduledAt;
      const existingEnd = new Date(existing.scheduledAt.getTime() + existing.duration * 60000);
      
      // Overlap condition: new_start < existing_end AND new_end > existing_start
      if (newAppointmentStart < existingEnd && newAppointmentEnd > existingStart) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }

  async getDoctorAvailability(doctorId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
      },
      select: {
        scheduledAt: true,
        duration: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  buildWhereClause(query: {
    status?: AppointmentStatus;
    type?: AppointmentType;
    patientId?: string;
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
  }): Prisma.AppointmentWhereInput {
    const where: Prisma.AppointmentWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }

    if (query.fromDate || query.toDate) {
      where.scheduledAt = {};
      if (query.fromDate) {
        where.scheduledAt.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.scheduledAt.lte = new Date(query.toDate);
      }
    }

    return where;
  }
}
