import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Production-Grade Canonical Hashing Service
 * 
 * Implements HIPAA-safe, deterministic hashing strategy:
 * - Canonical JSON (sorted keys, deterministic)
 * - Only integrity-relevant fields (no UI/cache/timestamps)
 * - SHA-256 for cryptographic security
 * - Optional salting for extra privacy
 */
@Injectable()
export class CanonicalHashService {
  private readonly hashSalt: string;

  constructor() {
    // Optional salt for extra privacy (prevents dictionary attacks)
    this.hashSalt = process.env.HASH_SALT || '';
  }

  // ============================================
  // CORE HASHING METHODS
  // ============================================

  /**
   * Create SHA-256 hash of canonicalized data
   * @param data - Data to hash (will be canonicalized)
   * @param useSalt - Whether to apply salt
   * @returns Hex string hash with 0x prefix
   */
  hash(data: unknown, useSalt = false): string {
    const canonical = this.canonicalize(data);
    const toHash = useSalt && this.hashSalt 
      ? canonical + this.hashSalt 
      : canonical;
    
    const hash = createHash('sha256').update(toHash).digest('hex');
    return '0x' + hash;
  }

  /**
   * Create version hash (chain link)
   * versionHash = SHA256(recordHash + previousHash + timestamp)
   */
  createVersionHash(recordHash: string, previousHash: string | null, timestamp: Date): string {
    const data = {
      recordHash,
      previousHash: previousHash || '0x0',
      timestamp: timestamp.toISOString(),
    };
    return this.hash(data);
  }

  /**
   * Verify a hash matches data
   */
  verify(data: unknown, expectedHash: string, useSalt = false): boolean {
    const computedHash = this.hash(data, useSalt);
    return computedHash.toLowerCase() === expectedHash.toLowerCase();
  }

  // ============================================
  // CANONICALIZATION
  // ============================================

  /**
   * Canonicalize data for deterministic hashing
   * - Sorts object keys alphabetically (recursive)
   * - Handles arrays, nested objects
   * - Removes undefined values
   * - Normalizes dates to ISO strings
   */
  canonicalize(data: unknown): string {
    return JSON.stringify(this.sortObject(data));
  }

  /**
   * Recursively sort object keys alphabetically
   */
  private sortObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObject(item));
    }

    if (typeof obj === 'object') {
      const sorted: Record<string, unknown> = {};
      const keys = Object.keys(obj as object).sort();
      
      for (const key of keys) {
        const value = (obj as Record<string, unknown>)[key];
        if (value !== undefined) {
          sorted[key] = this.sortObject(value);
        }
      }
      
      return sorted;
    }

    return obj;
  }

  // ============================================
  // ENTITY-SPECIFIC EXTRACTORS
  // ============================================

  /**
   * Extract integrity-relevant fields from Patient
   * ❌ Excludes: createdAt, updatedAt, deletedAt, user relation
   * ✅ Includes: medical data, identifiers
   */
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
  }): Record<string, unknown> {
    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: this.normalizeDate(patient.dateOfBirth),
      gender: patient.gender,
      bloodType: patient.bloodType || null,
      allergies: this.parseJsonField(patient.allergies),
      chronicConditions: this.parseJsonField(patient.chronicConditions),
      emergencyContact: patient.emergencyContact || null,
      emergencyPhone: patient.emergencyPhone || null,
    };
  }

  /**
   * Extract integrity-relevant fields from Prescription
   * ❌ Excludes: updatedAt, filledAt, pharmacy relation
   * ✅ Includes: diagnosis, medications, prescriber
   */
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
  }): Record<string, unknown> {
    return {
      id: prescription.id,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      diagnosis: prescription.diagnosis || null,
      notes: prescription.notes || null,
      validUntil: this.normalizeDate(prescription.validUntil),
      items: prescription.items
        .map(item => ({
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions || null,
          refillsAllowed: item.refillsAllowed,
        }))
        .sort((a, b) => a.medicineName.localeCompare(b.medicineName)),
    };
  }

  /**
   * Extract integrity-relevant fields from MedicalRecord
   * ❌ Excludes: updatedAt, fileUrl (binary reference)
   * ✅ Includes: diagnosis data, patient, type
   */
  extractMedicalRecordIntegrityFields(record: {
    id: string;
    patientId: string;
    recordType: string;
    title: string;
    description?: string | null;
    recordDate: Date | string;
    metadata?: string | null;
  }): Record<string, unknown> {
    return {
      id: record.id,
      patientId: record.patientId,
      recordType: record.recordType,
      title: record.title,
      description: record.description || null,
      recordDate: this.normalizeDate(record.recordDate),
      metadata: this.parseJsonField(record.metadata),
    };
  }

  /**
   * Extract integrity-relevant fields from Appointment
   * ❌ Excludes: cancelledAt, completedAt, updatedAt
   * ✅ Includes: schedule, participants, reason
   */
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
  }): Record<string, unknown> {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      scheduledAt: this.normalizeDate(appointment.scheduledAt),
      duration: appointment.duration,
      type: appointment.type,
      status: appointment.status,
      reason: appointment.reason || null,
      notes: appointment.notes || null,
      symptoms: this.parseJsonField(appointment.symptoms),
    };
  }

  // ============================================
  // HASH SPECIFIC ENTITY TYPES
  // ============================================

  /**
   * Hash a patient record
   */
  hashPatient(patient: Parameters<typeof this.extractPatientIntegrityFields>[0]): string {
    const fields = this.extractPatientIntegrityFields(patient);
    return this.hash(fields);
  }

  /**
   * Hash a prescription record
   */
  hashPrescription(prescription: Parameters<typeof this.extractPrescriptionIntegrityFields>[0]): string {
    const fields = this.extractPrescriptionIntegrityFields(prescription);
    return this.hash(fields);
  }

  /**
   * Hash a medical record
   */
  hashMedicalRecord(record: Parameters<typeof this.extractMedicalRecordIntegrityFields>[0]): string {
    const fields = this.extractMedicalRecordIntegrityFields(record);
    return this.hash(fields);
  }

  /**
   * Hash an appointment record
   */
  hashAppointment(appointment: Parameters<typeof this.extractAppointmentIntegrityFields>[0]): string {
    const fields = this.extractAppointmentIntegrityFields(appointment);
    return this.hash(fields);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Normalize date to ISO date string (YYYY-MM-DD)
   */
  private normalizeDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toISOString().split('T')[0];
  }

  /**
   * Parse JSON field (allergies, symptoms, etc.)
   */
  private parseJsonField(field: string | null | undefined): unknown {
    if (!field) return null;
    
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }

  /**
   * Hash entity ID for privacy-preserving blockchain storage
   */
  hashEntityId(entityId: string): string {
    return this.hash({ entityId }, true);
  }

  /**
   * Create a combined hash for multiple records (for batch verification)
   */
  hashMultiple(hashes: string[]): string {
    const sorted = [...hashes].sort();
    return this.hash(sorted);
  }
}
