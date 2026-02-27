export declare class HashingService {
    hashData(data: unknown): string;
    hashEntityId(entityId: string): string;
    hashPatientRecord(patient: {
        id: string;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | string;
        gender: string;
        phone?: string | null;
        address?: string | null;
        bloodType?: string | null;
        allergies?: string | null;
        chronicConditions?: string | null;
    }): string;
    hashPrescription(prescription: {
        id: string;
        patientId: string;
        doctorId: string;
        diagnosis?: string | null;
        notes?: string | null;
        items: Array<{
            medicineName: string;
            dosage: string;
            frequency: string;
            duration: string;
            quantity: number;
            instructions?: string | null;
        }>;
    }): string;
    hashAppointment(appointment: {
        id: string;
        patientId: string;
        doctorId: string;
        scheduledAt: Date | string;
        duration: number;
        type: string;
        status: string;
        reason?: string | null;
    }): string;
    hashMedicalRecord(record: {
        id: string;
        patientId: string;
        recordType: string;
        title: string;
        description?: string | null;
        recordDate: Date | string;
        metadata?: string | null;
    }): string;
    hashConsentPurpose(purpose: string): string;
    verifyHash(data: unknown, hash: string): boolean;
    generateNonce(): string;
    private sortedReplacer;
}
