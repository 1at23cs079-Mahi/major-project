import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { Patient, Prisma } from '@prisma/client';
import { Gender } from '@common/constants';

export interface PatientWithUser extends Patient {
  user?: {
    email: string;
    status: string;
  };
}

@Injectable()
export class PatientRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<PatientWithUser | null> {
    return this.prisma.patient.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<PatientWithUser | null> {
    return this.prisma.patient.findUnique({
      where: { userId, deletedAt: null },
      include: {
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PatientWhereInput;
    orderBy?: Prisma.PatientOrderByWithRelationInput;
  }): Promise<PatientWithUser[]> {
    const { skip, take, where, orderBy } = params;

    return this.prisma.patient.findMany({
      where: { ...where, deletedAt: null },
      skip,
      take,
      orderBy,
      include: {
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.PatientWhereInput): Promise<number> {
    return this.prisma.patient.count({
      where: { ...where, deletedAt: null },
    });
  }

  async update(
    id: string,
    data: Prisma.PatientUpdateInput,
  ): Promise<PatientWithUser> {
    return this.prisma.patient.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            email: true,
            status: true,
          },
        },
      },
    });
  }

  async softDelete(id: string): Promise<Patient> {
    return this.prisma.patient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getMedicalHistory(patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { recordDate: 'desc' },
    });
  }

  async getAppointmentHistory(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getPrescriptionHistory(patientId: string) {
    return this.prisma.prescription.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addMedicalRecord(data: {
    patientId: string;
    recordType: string;
    title: string;
    description?: string;
    fileUrl?: string;
    recordDate: Date;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        recordType: data.recordType,
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        recordDate: data.recordDate,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });
  }

  buildWhereClause(query: {
    search?: string;
    gender?: string;
    bloodType?: string;
    city?: string;
  }): Prisma.PatientWhereInput {
    const where: Prisma.PatientWhereInput = {};

    if (query.search) {
      // SQLite doesn't support 'mode: insensitive', use LOWER() via raw or simple contains
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
      ];
    }

    if (query.gender) {
      where.gender = query.gender;
    }

    if (query.bloodType) {
      where.bloodType = query.bloodType;
    }

    if (query.city) {
      where.city = { contains: query.city };
    }

    return where;
  }
}
