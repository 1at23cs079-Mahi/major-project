export declare class CanonicalHashService {
    private readonly hashSalt;
    constructor();
    hash(data: unknown, useSalt?: boolean): string;
    createVersionHash(recordHash: string, previousHash: string | null, timestamp: Date): string;
    verify(data: unknown, expectedHash: string, useSalt?: boolean): boolean;
    canonicalize(data: unknown): string;
    private sortObject;
    extractPatientIntegrityFields(patient: {
        id: string;
        firstName: string;
        lastName: string;
        dateOfBirth: Date | string;
        gender: string;
        bloodType?: string | null;
        allergies?: string | null;
        chronicConditions?: string | null;
        emergencyContact?: string | null;
        emergencyPhone?: string | null;
    }): Record<string, unknown>;
    extractPrescriptionIntegrityFields(prescription: {
        id: string;
        patientId: string;
        doctorId: string;
        diagnosis?: string | null;
        notes?: string | null;
        validUntil?: Date | string | null;
        items: Array<{
            medicineName: string;
            dosage: string;
            frequency: string;
            duration: string;
            quantity: number;
            instructions?: string | null;
            refillsAllowed: number;
        }>;
    }): Record<string, unknown>;
    extractMedicalRecordIntegrityFields(record: {
        id: string;
        patientId: string;
        recordType: string;
        title: string;
        description?: string | null;
        recordDate: Date | string;
        metadata?: string | null;
    }): Record<string, unknown>;
    extractAppointmentIntegrityFields(appointment: {
        id: string;
        patientId: string;
        doctorId: string;
        scheduledAt: Date | string;
        duration: number;
        type: string;
        status: string;
        reason?: string | null;
        notes?: string | null;
        symptoms?: string | null;
    }): Record<string, unknown>;
    hashPatient(patient: Parameters<typeof this.extractPatientIntegrityFields>[0]): string;
    hashPrescription(prescription: Parameters<typeof this.extractPrescriptionIntegrityFields>[0]): string;
    hashMedicalRecord(record: Parameters<typeof this.extractMedicalRecordIntegrityFields>[0]): string;
    hashAppointment(appointment: Parameters<typeof this.extractAppointmentIntegrityFields>[0]): string;
    private normalizeDate;
    private parseJsonField;
    hashEntityId(entityId: string): string;
    hashMultiple(hashes: string[]): string;
}
