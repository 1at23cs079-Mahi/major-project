import { PrismaService } from '@common/prisma/prisma.service';
import { Patient, Prisma } from '@prisma/client';
export interface PatientWithUser extends Patient {
    user?: {
        email: string;
        status: string;
    };
}
export declare class PatientRepository {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<PatientWithUser | null>;
    findByUserId(userId: string): Promise<PatientWithUser | null>;
    findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.PatientWhereInput;
        orderBy?: Prisma.PatientOrderByWithRelationInput;
    }): Promise<PatientWithUser[]>;
    count(where?: Prisma.PatientWhereInput): Promise<number>;
    update(id: string, data: Prisma.PatientUpdateInput): Promise<PatientWithUser>;
    softDelete(id: string): Promise<Patient>;
    getMedicalHistory(patientId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        recordType: string;
        title: string;
        description: string | null;
        fileUrl: string | null;
        recordDate: Date;
        metadata: string | null;
    }[]>;
    getAppointmentHistory(patientId: string): Promise<({
        doctor: {
            firstName: string;
            lastName: string;
            specialization: string;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        scheduledAt: Date;
        duration: number;
        type: string;
        reason: string | null;
        notes: string | null;
        symptoms: string | null;
        cancelReason: string | null;
        cancelledAt: Date | null;
        completedAt: Date | null;
        patientId: string;
        doctorId: string;
    })[]>;
    getPrescriptionHistory(patientId: string): Promise<({
        doctor: {
            firstName: string;
            lastName: string;
            specialization: string;
        };
        items: {
            id: string;
            duration: string;
            medicineName: string;
            dosage: string;
            frequency: string;
            quantity: number;
            instructions: string | null;
            refillsAllowed: number;
            refillsUsed: number;
            prescriptionId: string;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        patientId: string;
        doctorId: string;
        diagnosis: string | null;
        validUntil: Date | null;
        filledAt: Date | null;
        appointmentId: string | null;
        pharmacyId: string | null;
    })[]>;
    addMedicalRecord(data: {
        patientId: string;
        recordType: string;
        title: string;
        description?: string;
        fileUrl?: string;
        recordDate: Date;
        metadata?: Record<string, unknown>;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        recordType: string;
        title: string;
        description: string | null;
        fileUrl: string | null;
        recordDate: Date;
        metadata: string | null;
    }>;
    buildWhereClause(query: {
        search?: string;
        gender?: string;
        bloodType?: string;
        city?: string;
    }): Prisma.PatientWhereInput;
}
