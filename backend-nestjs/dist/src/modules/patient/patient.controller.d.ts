import { PatientService } from './patient.service';
import { UpdatePatientDto, PatientQueryDto } from './dto/patient.dto';
import { UserRole } from '@common/constants';
export declare class PatientController {
    private readonly patientService;
    constructor(patientService: PatientService);
    findAll(query: PatientQueryDto): Promise<import("../../common/dto").PaginatedResponse<any>>;
    getMyProfile(userId: string): Promise<import("./patient.repository").PatientWithUser>;
    findById(id: string, user: {
        id: string;
        role: UserRole;
    }): Promise<any>;
    update(id: string, dto: UpdatePatientDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./patient.repository").PatientWithUser>;
    delete(id: string, user: {
        id: string;
        role: UserRole;
    }): Promise<{
        message: string;
    }>;
    getMedicalHistory(id: string, user: {
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
    getAppointments(id: string, user: {
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
    getPrescriptions(id: string, user: {
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
    addMedicalRecord(id: string, data: {
        recordType: string;
        title: string;
        description?: string;
        fileUrl?: string;
        recordDate: string;
        metadata?: Record<string, unknown>;
    }, user: {
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
}
