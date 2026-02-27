import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { VersionTrackingService, VersionedEntityType, ChangeType } from './version-tracking.service';

/**
 * Entity Hooks Service
 * 
 * Provides methods to automatically create version entries
 * when entities are created or updated.
 * 
 * Usage in other services:
 * ```
 * // After creating a patient
 * await this.entityHooks.onPatientCreated(patient, userId);
 * 
 * // After updating a prescription
 * await this.entityHooks.onPrescriptionUpdated(prescription, userId);
 * ```
 */
@Injectable()
export class EntityHooksService {
  private readonly logger = new Logger(EntityHooksService.name);
  private isEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly versionTracking: VersionTrackingService,
  ) {
    this.isEnabled = process.env.BLOCKCHAIN_ENABLED === 'true';
  }

  // ============================================
  // PATIENT HOOKS
  // ============================================

  async onPatientCreated(patient: any, userId: string) {
    if (!this.isEnabled) return;
    
    try {
      await this.versionTracking.createVersion(
        'patient',
        patient.id,
        patient,
        userId,
        'CREATE',
      );
      this.logger.debug(`Created version for new patient: ${patient.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for patient ${patient.id}:`, error);
    }
  }

  async onPatientUpdated(patient: any, userId: string) {
    if (!this.isEnabled) return;

    try {
      await this.versionTracking.createVersion(
        'patient',
        patient.id,
        patient,
        userId,
        'UPDATE',
      );
      this.logger.debug(`Created version for updated patient: ${patient.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for patient ${patient.id}:`, error);
    }
  }

  async onPatientDeleted(patientId: string, userId: string) {
    if (!this.isEnabled) return;

    try {
      // For delete, we store a tombstone version
      await this.versionTracking.createVersion(
        'patient',
        patientId,
        { id: patientId, deleted: true, deletedAt: new Date() },
        userId,
        'DELETE',
      );
      this.logger.debug(`Created delete version for patient: ${patientId}`);
    } catch (error) {
      this.logger.error(`Failed to create delete version for patient ${patientId}:`, error);
    }
  }

  // ============================================
  // PRESCRIPTION HOOKS
  // ============================================

  async onPrescriptionCreated(prescription: any, userId: string) {
    if (!this.isEnabled) return;

    try {
      // Include prescription items if available
      const fullPrescription = prescription.items 
        ? prescription 
        : await this.prisma.prescription.findUnique({
            where: { id: prescription.id },
            include: { items: true },
          });

      await this.versionTracking.createVersion(
        'prescription',
        prescription.id,
        fullPrescription,
        userId,
        'CREATE',
      );
      this.logger.debug(`Created version for new prescription: ${prescription.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for prescription ${prescription.id}:`, error);
    }
  }

  async onPrescriptionUpdated(prescription: any, userId: string) {
    if (!this.isEnabled) return;

    try {
      const fullPrescription = prescription.items 
        ? prescription 
        : await this.prisma.prescription.findUnique({
            where: { id: prescription.id },
            include: { items: true },
          });

      await this.versionTracking.createVersion(
        'prescription',
        prescription.id,
        fullPrescription,
        userId,
        'UPDATE',
      );
      this.logger.debug(`Created version for updated prescription: ${prescription.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for prescription ${prescription.id}:`, error);
    }
  }

  async onPrescriptionFilled(prescriptionId: string, pharmacyId: string, userId: string) {
    if (!this.isEnabled) return;

    try {
      const prescription = await this.prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: { items: true },
      });

      await this.versionTracking.createVersion(
        'prescription',
        prescriptionId,
        { ...prescription, filledBy: pharmacyId },
        userId,
        'UPDATE',
      );
      this.logger.debug(`Created fill version for prescription: ${prescriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to create fill version for prescription ${prescriptionId}:`, error);
    }
  }

  // ============================================
  // MEDICAL RECORD HOOKS
  // ============================================

  async onMedicalRecordCreated(record: any, userId: string) {
    if (!this.isEnabled) return;

    try {
      await this.versionTracking.createVersion(
        'medicalRecord',
        record.id,
        record,
        userId,
        'CREATE',
      );
      this.logger.debug(`Created version for new medical record: ${record.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for medical record ${record.id}:`, error);
    }
  }

  async onMedicalRecordUpdated(record: any, userId: string) {
    if (!this.isEnabled) return;

    try {
      await this.versionTracking.createVersion(
        'medicalRecord',
        record.id,
        record,
        userId,
        'UPDATE',
      );
      this.logger.debug(`Created version for updated medical record: ${record.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for medical record ${record.id}:`, error);
    }
  }

  // ============================================
  // APPOINTMENT HOOKS
  // ============================================

  async onAppointmentCreated(appointment: any, userId: string) {
    if (!this.isEnabled) return;

    try {
      await this.versionTracking.createVersion(
        'appointment',
        appointment.id,
        appointment,
        userId,
        'CREATE',
      );
      this.logger.debug(`Created version for new appointment: ${appointment.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for appointment ${appointment.id}:`, error);
    }
  }

  async onAppointmentUpdated(appointment: any, userId: string) {
    if (!this.isEnabled) return;

    try {
      await this.versionTracking.createVersion(
        'appointment',
        appointment.id,
        appointment,
        userId,
        'UPDATE',
      );
      this.logger.debug(`Created version for updated appointment: ${appointment.id}`);
    } catch (error) {
      this.logger.error(`Failed to create version for appointment ${appointment.id}:`, error);
    }
  }

  async onAppointmentCancelled(appointmentId: string, userId: string, reason?: string) {
    if (!this.isEnabled) return;

    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      await this.versionTracking.createVersion(
        'appointment',
        appointmentId,
        { ...appointment, cancelledAt: new Date(), cancellationReason: reason },
        userId,
        'UPDATE',
      );
      this.logger.debug(`Created cancellation version for appointment: ${appointmentId}`);
    } catch (error) {
      this.logger.error(`Failed to create cancellation version for appointment ${appointmentId}:`, error);
    }
  }

  // ============================================
  // GENERIC HOOK
  // ============================================

  /**
   * Generic hook for any entity type
   */
  async onEntityChange(
    entityType: VersionedEntityType,
    entityId: string,
    data: Record<string, unknown>,
    userId: string,
    changeType: ChangeType = 'UPDATE',
  ) {
    if (!this.isEnabled) return;

    try {
      await this.versionTracking.createVersion(
        entityType,
        entityId,
        data,
        userId,
        changeType,
      );
      this.logger.debug(`Created version for ${entityType}: ${entityId} (${changeType})`);
    } catch (error) {
      this.logger.error(`Failed to create version for ${entityType} ${entityId}:`, error);
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Enable/disable version tracking at runtime
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    this.logger.log(`Entity hooks ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if version tracking is enabled
   */
  get enabled(): boolean {
    return this.isEnabled;
  }
}
