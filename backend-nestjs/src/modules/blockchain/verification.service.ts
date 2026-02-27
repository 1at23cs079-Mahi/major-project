import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { HashingService } from './hashing.service';
import { AuditLogContractService } from './contracts/audit-log.contract';
import { PrescriptionContractService, BlockchainPrescriptionStatus } from './contracts/prescription.contract';

export interface VerificationResult {
  entityType: string;
  entityId: string;
  verified: boolean;
  blockchainHash?: string;
  currentHash?: string;
  timestamp?: number;
  message: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class BlockchainVerificationService {
  private readonly logger = new Logger(BlockchainVerificationService.name);

  constructor(
    private prisma: PrismaService,
    private hashingService: HashingService,
    private auditLogContract: AuditLogContractService,
    private prescriptionContract: PrescriptionContractService,
  ) {}

  /**
   * Verify patient record integrity
   */
  async verifyPatient(patientId: string): Promise<VerificationResult> {
    try {
      // Fetch patient from database
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        return {
          entityType: 'patient',
          entityId: patientId,
          verified: false,
          message: 'Patient not found in database',
        };
      }

      // Get blockchain audit entries for this entity
      const entryIds = await this.auditLogContract.getEntityHistory(patientId);

      if (entryIds.length === 0) {
        return {
          entityType: 'patient',
          entityId: patientId,
          verified: false,
          message: 'No blockchain record found for this patient',
        };
      }

      // Get the latest audit entry
      const latestEntryId = entryIds[entryIds.length - 1];
      const currentHash = this.hashingService.hashPatientRecord(patient);

      // Verify against blockchain
      const verification = await this.auditLogContract.verifyRecordIntegrity(
        latestEntryId,
        patient,
      );

      return {
        entityType: 'patient',
        entityId: patientId,
        verified: verification.isValid,
        blockchainHash: verification.originalHash,
        currentHash: verification.currentHash,
        timestamp: verification.timestamp,
        message: verification.isValid 
          ? 'Patient record integrity verified successfully' 
          : 'ALERT: Patient record may have been tampered with!',
        details: {
          totalAuditEntries: entryIds.length,
          latestEntryId,
          verifiedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Patient verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {
        entityType: 'patient',
        entityId: patientId,
        verified: false,
        message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Verify prescription authenticity
   */
  async verifyPrescription(prescriptionId: string): Promise<VerificationResult> {
    try {
      // Fetch prescription from database with items
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: { items: true },
      });

      if (!prescription) {
        return {
          entityType: 'prescription',
          entityId: prescriptionId,
          verified: false,
          message: 'Prescription not found in database',
        };
      }

      // Prepare prescription data for hashing
      const prescriptionData = {
        id: prescription.id,
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        diagnosis: prescription.diagnosis ?? undefined,
        notes: prescription.notes ?? undefined,
        items: prescription.items.map(item => ({
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions ?? undefined,
        })),
      };

      // Verify against blockchain
      const verification = await this.prescriptionContract.verifyPrescription(
        prescriptionId,
        prescriptionData,
      );

      const statusMap: Record<number, string> = {
        [BlockchainPrescriptionStatus.ACTIVE]: 'ACTIVE',
        [BlockchainPrescriptionStatus.FILLED]: 'FILLED',
        [BlockchainPrescriptionStatus.PARTIALLY_FILLED]: 'PARTIALLY_FILLED',
        [BlockchainPrescriptionStatus.CANCELLED]: 'CANCELLED',
        [BlockchainPrescriptionStatus.EXPIRED]: 'EXPIRED',
      };

      return {
        entityType: 'prescription',
        entityId: prescriptionId,
        verified: verification.isValid,
        blockchainHash: verification.originalHash,
        currentHash: verification.currentHash,
        timestamp: verification.validUntil,
        message: verification.isValid 
          ? 'Prescription authenticity verified successfully' 
          : 'ALERT: Prescription may have been tampered with or is invalid!',
        details: {
          blockchainStatus: statusMap[verification.status] || 'UNKNOWN',
          validUntil: new Date(verification.validUntil * 1000).toISOString(),
          verifiedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Prescription verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {
        entityType: 'prescription',
        entityId: prescriptionId,
        verified: false,
        message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Verify appointment integrity
   */
  async verifyAppointment(appointmentId: string): Promise<VerificationResult> {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        return {
          entityType: 'appointment',
          entityId: appointmentId,
          verified: false,
          message: 'Appointment not found in database',
        };
      }

      // Get blockchain audit entries
      const entryIds = await this.auditLogContract.getEntityHistory(appointmentId);

      if (entryIds.length === 0) {
        return {
          entityType: 'appointment',
          entityId: appointmentId,
          verified: false,
          message: 'No blockchain record found for this appointment',
        };
      }

      const latestEntryId = entryIds[entryIds.length - 1];

      // Verify against blockchain
      const verification = await this.auditLogContract.verifyRecordIntegrity(
        latestEntryId,
        this.hashingService.hashAppointment(appointment),
      );

      return {
        entityType: 'appointment',
        entityId: appointmentId,
        verified: verification.isValid,
        blockchainHash: verification.originalHash,
        currentHash: verification.currentHash,
        timestamp: verification.timestamp,
        message: verification.isValid 
          ? 'Appointment record integrity verified successfully' 
          : 'ALERT: Appointment record may have been tampered with!',
        details: {
          totalAuditEntries: entryIds.length,
          latestEntryId,
          verifiedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Appointment verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {
        entityType: 'appointment',
        entityId: appointmentId,
        verified: false,
        message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Verify medical record integrity
   */
  async verifyMedicalRecord(recordId: string): Promise<VerificationResult> {
    try {
      const record = await this.prisma.medicalRecord.findUnique({
        where: { id: recordId },
      });

      if (!record) {
        return {
          entityType: 'medical_record',
          entityId: recordId,
          verified: false,
          message: 'Medical record not found in database',
        };
      }

      const entryIds = await this.auditLogContract.getEntityHistory(recordId);

      if (entryIds.length === 0) {
        return {
          entityType: 'medical_record',
          entityId: recordId,
          verified: false,
          message: 'No blockchain record found for this medical record',
        };
      }

      const latestEntryId = entryIds[entryIds.length - 1];

      const verification = await this.auditLogContract.verifyRecordIntegrity(
        latestEntryId,
        this.hashingService.hashMedicalRecord(record),
      );

      return {
        entityType: 'medical_record',
        entityId: recordId,
        verified: verification.isValid,
        blockchainHash: verification.originalHash,
        currentHash: verification.currentHash,
        timestamp: verification.timestamp,
        message: verification.isValid 
          ? 'Medical record integrity verified successfully' 
          : 'ALERT: Medical record may have been tampered with!',
        details: {
          totalAuditEntries: entryIds.length,
          latestEntryId,
          verifiedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Medical record verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {
        entityType: 'medical_record',
        entityId: recordId,
        verified: false,
        message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Generic verification endpoint
   */
  async verify(type: string, id: string): Promise<VerificationResult> {
    switch (type.toLowerCase()) {
      case 'patient':
        return this.verifyPatient(id);
      case 'prescription':
        return this.verifyPrescription(id);
      case 'appointment':
        return this.verifyAppointment(id);
      case 'medical_record':
      case 'medicalrecord':
        return this.verifyMedicalRecord(id);
      default:
        return {
          entityType: type,
          entityId: id,
          verified: false,
          message: `Unknown entity type: ${type}. Supported types: patient, prescription, appointment, medical_record`,
        };
    }
  }
}
