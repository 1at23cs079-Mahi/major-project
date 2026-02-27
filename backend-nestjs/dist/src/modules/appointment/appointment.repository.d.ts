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
export declare class AppointmentRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.AppointmentUncheckedCreateInput): Promise<AppointmentWithRelations>;
    findById(id: string): Promise<AppointmentWithRelations | null>;
    findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.AppointmentWhereInput;
        orderBy?: Prisma.AppointmentOrderByWithRelationInput;
    }): Promise<AppointmentWithRelations[]>;
    count(where?: Prisma.AppointmentWhereInput): Promise<number>;
    update(id: string, data: Prisma.AppointmentUpdateInput): Promise<AppointmentWithRelations>;
    checkConflict(doctorId: string, scheduledAt: Date, duration: number, excludeId?: string): Promise<boolean>;
    getDoctorAvailability(doctorId: string, date: Date): Promise<{
        scheduledAt: Date;
        duration: number;
    }[]>;
    buildWhereClause(query: {
        status?: AppointmentStatus;
        type?: AppointmentType;
        patientId?: string;
        doctorId?: string;
        fromDate?: string;
        toDate?: string;
    }): Prisma.AppointmentWhereInput;
}
