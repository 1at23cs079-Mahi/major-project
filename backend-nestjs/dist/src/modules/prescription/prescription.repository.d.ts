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
export declare class PrescriptionRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.PrescriptionUncheckedCreateInput, items: Array<{
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
        instructions?: string;
        refillsAllowed?: number;
    }>): Promise<PrescriptionWithRelations>;
    findById(id: string): Promise<PrescriptionWithRelations | null>;
    findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.PrescriptionWhereInput;
        orderBy?: Prisma.PrescriptionOrderByWithRelationInput;
    }): Promise<PrescriptionWithRelations[]>;
    count(where?: Prisma.PrescriptionWhereInput): Promise<number>;
    update(id: string, data: Prisma.PrescriptionUpdateInput): Promise<PrescriptionWithRelations>;
    fillPrescription(id: string, pharmacyId: string): Promise<PrescriptionWithRelations>;
    incrementRefill(itemId: string): Promise<void>;
    buildWhereClause(query: {
        status?: PrescriptionStatus;
        patientId?: string;
        doctorId?: string;
        fromDate?: string;
        toDate?: string;
    }): Prisma.PrescriptionWhereInput;
}
