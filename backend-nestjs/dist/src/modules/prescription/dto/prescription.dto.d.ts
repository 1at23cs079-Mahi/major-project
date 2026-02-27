import { PrescriptionStatus } from '@common/constants';
export declare class PrescriptionItemDto {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions?: string;
    refillsAllowed?: number;
}
export declare class CreatePrescriptionDto {
    patientId: string;
    appointmentId?: string;
    diagnosis?: string;
    notes?: string;
    validUntil?: string;
    items: PrescriptionItemDto[];
}
export declare class UpdatePrescriptionDto {
    diagnosis?: string;
    notes?: string;
    validUntil?: string;
    status?: PrescriptionStatus;
}
export declare class FillPrescriptionDto {
    pharmacyId: string;
}
export declare class PrescriptionQueryDto {
    status?: PrescriptionStatus;
    patientId?: string;
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
