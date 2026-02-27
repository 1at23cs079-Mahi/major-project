import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { Prescription, Prisma } from '@prisma/client';
import { PrescriptionStatus } from '@common/constants';

export interface PrescriptionWithRelations extends Prescription {
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  pharmacy?: {
    id: string;
    name: string;
  } | null;
  items?: Array<{
    id: string;
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string | null;
    refillsAllowed: number;
    refillsUsed: number;
  }>;
}

@Injectable()
export class PrescriptionRepository {
  constructor(private prisma: PrismaService) {}

  async create(
    data: Prisma.PrescriptionUncheckedCreateInput,
    items: Array<{
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
      refillsAllowed?: number;
    }>,
  ): Promise<PrescriptionWithRelations> {
    return this.prisma.prescription.create({
      data: {
        ...data,
        items: {
          create: items.map((item) => ({
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
            refillsAllowed: item.refillsAllowed || 0,
          })),
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        pharmacy: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });
  }

  async findById(id: string): Promise<PrescriptionWithRelations | null> {
    return this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        pharmacy: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PrescriptionWhereInput;
    orderBy?: Prisma.PrescriptionOrderByWithRelationInput;
  }): Promise<PrescriptionWithRelations[]> {
    const { skip, take, where, orderBy } = params;

    return this.prisma.prescription.findMany({
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
        pharmacy: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });
  }

  async count(where?: Prisma.PrescriptionWhereInput): Promise<number> {
    return this.prisma.prescription.count({ where });
  }

  async update(
    id: string,
    data: Prisma.PrescriptionUpdateInput,
  ): Promise<PrescriptionWithRelations> {
    return this.prisma.prescription.update({
      where: { id },
      data,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        pharmacy: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });
  }

  async fillPrescription(
    id: string,
    pharmacyId: string,
  ): Promise<PrescriptionWithRelations> {
    return this.prisma.prescription.update({
      where: { id },
      data: {
        pharmacyId,
        status: PrescriptionStatus.FILLED,
        filledAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
        pharmacy: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
    });
  }

  async incrementRefill(itemId: string): Promise<void> {
    await this.prisma.prescriptionItem.update({
      where: { id: itemId },
      data: {
        refillsUsed: { increment: 1 },
      },
    });
  }

  buildWhereClause(query: {
    status?: PrescriptionStatus;
    patientId?: string;
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
  }): Prisma.PrescriptionWhereInput {
    const where: Prisma.PrescriptionWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) {
        where.createdAt.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.createdAt.lte = new Date(query.toDate);
      }
    }

    return where;
  }
}
