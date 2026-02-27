import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

/**
 * Hashing service for creating tamper-proof hashes of records
 * Uses SHA256 for consistency with blockchain verification
 */
@Injectable()
export class HashingService {
  /**
   * Create SHA256 hash of data
   * @param data - Data to hash (object will be JSON stringified)
   * @returns bytes32 compatible hash string
   */
  hashData(data: unknown): string {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data, this.sortedReplacer);
    const hash = createHash('sha256').update(stringData).digest('hex');
    return '0x' + hash;
  }

  /**
   * Create hash of entity ID for privacy-preserving storage
   * @param entityId - Entity ID from database
   * @returns bytes32 compatible hash string
   */
  hashEntityId(entityId: string): string {
    const hash = createHash('sha256').update(entityId).digest('hex');
    return '0x' + hash;
  }

  /**
   * Create hash of patient record for integrity verification
   * Excludes timestamp fields to allow comparison
   */
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
  }): string {
    const recordData = {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth instanceof Date 
        ? patient.dateOfBirth.toISOString().split('T')[0] 
        : patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone || null,
      address: patient.address || null,
      bloodType: patient.bloodType || null,
      allergies: patient.allergies || null,
      chronicConditions: patient.chronicConditions || null,
    };

    return this.hashData(recordData);
  }

  /**
   * Create hash of prescription for authenticity verification
   */
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
  }): string {
    const recordData = {
      id: prescription.id,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      diagnosis: prescription.diagnosis || null,
      notes: prescription.notes || null,
      items: prescription.items.map(item => ({
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions || null,
      })).sort((a, b) => a.medicineName.localeCompare(b.medicineName)),
    };

    return this.hashData(recordData);
  }

  /**
   * Create hash of appointment for integrity verification
   */
  hashAppointment(appointment: {
    id: string;
    patientId: string;
    doctorId: string;
    scheduledAt: Date | string;
    duration: number;
    type: string;
    status: string;
    reason?: string | null;
  }): string {
    const recordData = {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      scheduledAt: appointment.scheduledAt instanceof Date 
        ? appointment.scheduledAt.toISOString() 
        : appointment.scheduledAt,
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      reason: appointment.reason || null,
    };

    return this.hashData(recordData);
  }

  /**
   * Create hash of medical record for integrity verification
   */
  hashMedicalRecord(record: {
    id: string;
    patientId: string;
    recordType: string;
    title: string;
    description?: string | null;
    recordDate: Date | string;
    metadata?: string | null;
  }): string {
    const recordData = {
      id: record.id,
      patientId: record.patientId,
      recordType: record.recordType,
      title: record.title,
      description: record.description || null,
      recordDate: record.recordDate instanceof Date 
        ? record.recordDate.toISOString().split('T')[0] 
        : record.recordDate,
      metadata: record.metadata || null,
    };

    return this.hashData(recordData);
  }

  /**
   * Create consent purpose hash
   */
  hashConsentPurpose(purpose: string): string {
    return this.hashData({ purpose });
  }

  /**
   * Verify hash matches data
   * @param data - Original data
   * @param hash - Hash to verify against
   * @returns true if hashes match
   */
  verifyHash(data: unknown, hash: string): boolean {
    const computedHash = this.hashData(data);
    return computedHash.toLowerCase() === hash.toLowerCase();
  }

  /**
   * Generate a random nonce for additional entropy
   */
  generateNonce(): string {
    return '0x' + randomBytes(32).toString('hex');
  }

  /**
   * Sorted replacer for consistent JSON stringification
   */
  private sortedReplacer(key: string, value: unknown): unknown {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value as object)
        .sort()
        .reduce((sorted: Record<string, unknown>, k) => {
          sorted[k] = (value as Record<string, unknown>)[k];
          return sorted;
        }, {});
    }
    return value;
  }
}
