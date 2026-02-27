import { PatientRepository } from './patient.repository';
import { UpdatePatientDto, PatientQueryDto } from './dto/patient.dto';
import { PaginatedResponse } from '@common/dto/pagination.dto';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { UserRole } from '@common/constants';
export declare class PatientService {
    private patientRepository;
    private redisService;
    private logger;
    constructor(patientRepository: PatientRepository, redisService: RedisService, logger: WinstonLoggerService);
    findAll(query: PatientQueryDto): Promise<PaginatedResponse<any>>;
    findById(id: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<any>;
    findByUserId(userId: string): Promise<import("./patient.repository").PatientWithUser>;
    update(id: string, dto: UpdatePatientDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./patient.repository").PatientWithUser>;
    softDelete(id: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<{
        message: string;
    }>;
    getMedicalHistory(patientId: string, currentUser: {
        id: string;
        role: UserRole;
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
    }[]>;
    getAppointmentHistory(patientId: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<({
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
    getPrescriptionHistory(patientId: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<({
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
    addMedicalRecord(patientId: string, data: {
        recordType: string;
        title: string;
        description?: string;
        fileUrl?: string;
        recordDate: Date;
        metadata?: Record<string, unknown>;
    }, currentUser: {
        id: string;
        role: UserRole;
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
    private checkAccess;
}
