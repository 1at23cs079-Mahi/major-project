import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditLogContractService, AuditActionType, CreateAuditEntryDto } from './contracts/audit-log.contract';
import { HashingService } from './hashing.service';
import { BlockchainService } from './blockchain.service';

/**
 * Decorator to automatically create blockchain audit entries
 * This service provides integration between off-chain audit logs and blockchain
 */
@Injectable()
export class BlockchainAuditIntegrationService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainAuditIntegrationService.name);
  private pendingEntries: CreateAuditEntryDto[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY_MS = 5000; // 5 seconds

  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private auditLogContract: AuditLogContractService,
    private hashingService: HashingService,
  ) {}

  async onModuleInit() {
    if (this.blockchainService.isEnabled()) {
      this.logger.log('Blockchain audit integration initialized');
    }
  }

  /**
   * Log patient creation to blockchain
   */
  async logPatientCreated(patient: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: this.hashingService.hashPatientRecord(patient),
      entityId: patient.id,
      actionType: AuditActionType.PATIENT_CREATED,
      actorId,
    });
  }

  /**
   * Log patient update to blockchain
   */
  async logPatientUpdated(patient: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: this.hashingService.hashPatientRecord(patient),
      entityId: patient.id,
      actionType: AuditActionType.PATIENT_UPDATED,
      actorId,
    });
  }

  /**
   * Log prescription creation to blockchain
   */
  async logPrescriptionCreated(prescription: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: prescription,
      entityId: prescription.id,
      actionType: AuditActionType.PRESCRIPTION_CREATED,
      actorId,
    });
  }

  /**
   * Log prescription filled to blockchain
   */
  async logPrescriptionFilled(prescription: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: prescription,
      entityId: prescription.id,
      actionType: AuditActionType.PRESCRIPTION_FILLED,
      actorId,
    });
  }

  /**
   * Log prescription cancelled to blockchain
   */
  async logPrescriptionCancelled(prescriptionId: string, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: { prescriptionId, cancelledAt: new Date().toISOString() },
      entityId: prescriptionId,
      actionType: AuditActionType.PRESCRIPTION_CANCELLED,
      actorId,
    });
  }

  /**
   * Log appointment creation to blockchain
   */
  async logAppointmentCreated(appointment: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: this.hashingService.hashAppointment(appointment),
      entityId: appointment.id,
      actionType: AuditActionType.APPOINTMENT_CREATED,
      actorId,
    });
  }

  /**
   * Log appointment update to blockchain
   */
  async logAppointmentUpdated(appointment: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: this.hashingService.hashAppointment(appointment),
      entityId: appointment.id,
      actionType: AuditActionType.APPOINTMENT_UPDATED,
      actorId,
    });
  }

  /**
   * Log appointment cancelled to blockchain
   */
  async logAppointmentCancelled(appointmentId: string, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: { appointmentId, cancelledAt: new Date().toISOString() },
      entityId: appointmentId,
      actionType: AuditActionType.APPOINTMENT_CANCELLED,
      actorId,
    });
  }

  /**
   * Log medical record creation to blockchain
   */
  async logMedicalRecordCreated(record: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: this.hashingService.hashMedicalRecord(record),
      entityId: record.id,
      actionType: AuditActionType.MEDICAL_RECORD_CREATED,
      actorId,
    });
  }

  /**
   * Log medical record update to blockchain
   */
  async logMedicalRecordUpdated(record: any, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: this.hashingService.hashMedicalRecord(record),
      entityId: record.id,
      actionType: AuditActionType.MEDICAL_RECORD_UPDATED,
      actorId,
    });
  }

  /**
   * Log consent granted to blockchain
   */
  async logConsentGranted(consentId: string, patientId: string, granteeId: string, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: { consentId, patientId, granteeId, grantedAt: new Date().toISOString() },
      entityId: consentId,
      actionType: AuditActionType.CONSENT_GRANTED,
      actorId,
    });
  }

  /**
   * Log consent revoked to blockchain
   */
  async logConsentRevoked(consentId: string, actorId: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: { consentId, revokedAt: new Date().toISOString() },
      entityId: consentId,
      actionType: AuditActionType.CONSENT_REVOKED,
      actorId,
    });
  }

  /**
   * Log emergency access to blockchain
   */
  async logEmergencyAccess(entityId: string, entityType: string, actorId: string, reason: string): Promise<void> {
    await this.queueAuditEntry({
      recordData: { entityId, entityType, accessedAt: new Date().toISOString(), reason },
      entityId,
      actionType: AuditActionType.EMERGENCY_ACCESS,
      actorId,
    });
  }

  /**
   * Queue an audit entry for batching
   */
  private async queueAuditEntry(entry: CreateAuditEntryDto): Promise<void> {
    if (!this.blockchainService.isEnabled()) {
      this.logger.debug('Blockchain disabled, skipping audit entry');
      return;
    }

    this.pendingEntries.push(entry);
    this.logger.debug(`Queued audit entry (pending: ${this.pendingEntries.length})`);

    // If batch is full, flush immediately
    if (this.pendingEntries.length >= this.BATCH_SIZE) {
      await this.flushPendingEntries();
    } else {
      // Otherwise, schedule a delayed flush
      this.scheduleBatchFlush();
    }
  }

  /**
   * Schedule a batch flush after delay
   */
  private scheduleBatchFlush(): void {
    if (this.batchTimeout) {
      return; // Already scheduled
    }

    this.batchTimeout = setTimeout(async () => {
      await this.flushPendingEntries();
    }, this.BATCH_DELAY_MS);
  }

  /**
   * Flush all pending entries to blockchain
   */
  private async flushPendingEntries(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.pendingEntries.length === 0) {
      return;
    }

    const entries = [...this.pendingEntries];
    this.pendingEntries = [];

    try {
      if (entries.length === 1) {
        // Single entry
        await this.auditLogContract.createAuditEntry(entries[0]);
        this.logger.log('Created single blockchain audit entry');
      } else {
        // Batch entries
        await this.auditLogContract.createBatchAuditEntries(entries);
        this.logger.log(`Created ${entries.length} blockchain audit entries in batch`);
      }

      // Also create off-chain audit records linking to blockchain
      for (const entry of entries) {
        await this.createOffChainAuditRecord(entry);
      }
    } catch (error) {
      this.logger.error(`Failed to flush audit entries: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Re-queue entries for retry
      this.pendingEntries = [...entries, ...this.pendingEntries];
    }
  }

  /**
   * Create off-chain audit record with blockchain reference
   */
  private async createOffChainAuditRecord(entry: CreateAuditEntryDto): Promise<void> {
    try {
      const actionMap: Record<AuditActionType, string> = {
        [AuditActionType.PATIENT_CREATED]: 'CREATE',
        [AuditActionType.PATIENT_UPDATED]: 'UPDATE',
        [AuditActionType.PRESCRIPTION_CREATED]: 'CREATE',
        [AuditActionType.PRESCRIPTION_FILLED]: 'UPDATE',
        [AuditActionType.PRESCRIPTION_CANCELLED]: 'DELETE',
        [AuditActionType.APPOINTMENT_CREATED]: 'CREATE',
        [AuditActionType.APPOINTMENT_UPDATED]: 'UPDATE',
        [AuditActionType.APPOINTMENT_CANCELLED]: 'DELETE',
        [AuditActionType.MEDICAL_RECORD_CREATED]: 'CREATE',
        [AuditActionType.MEDICAL_RECORD_UPDATED]: 'UPDATE',
        [AuditActionType.CONSENT_GRANTED]: 'CREATE',
        [AuditActionType.CONSENT_REVOKED]: 'DELETE',
        [AuditActionType.ACCESS_GRANTED]: 'CREATE',
        [AuditActionType.ACCESS_REVOKED]: 'DELETE',
        [AuditActionType.EMERGENCY_ACCESS]: 'READ',
      };

      const entityTypeMap: Record<AuditActionType, string> = {
        [AuditActionType.PATIENT_CREATED]: 'Patient',
        [AuditActionType.PATIENT_UPDATED]: 'Patient',
        [AuditActionType.PRESCRIPTION_CREATED]: 'Prescription',
        [AuditActionType.PRESCRIPTION_FILLED]: 'Prescription',
        [AuditActionType.PRESCRIPTION_CANCELLED]: 'Prescription',
        [AuditActionType.APPOINTMENT_CREATED]: 'Appointment',
        [AuditActionType.APPOINTMENT_UPDATED]: 'Appointment',
        [AuditActionType.APPOINTMENT_CANCELLED]: 'Appointment',
        [AuditActionType.MEDICAL_RECORD_CREATED]: 'MedicalRecord',
        [AuditActionType.MEDICAL_RECORD_UPDATED]: 'MedicalRecord',
        [AuditActionType.CONSENT_GRANTED]: 'Consent',
        [AuditActionType.CONSENT_REVOKED]: 'Consent',
        [AuditActionType.ACCESS_GRANTED]: 'Access',
        [AuditActionType.ACCESS_REVOKED]: 'Access',
        [AuditActionType.EMERGENCY_ACCESS]: 'Emergency',
      };

      await this.prisma.auditLog.create({
        data: {
          userId: entry.actorId,
          action: actionMap[entry.actionType] || 'UNKNOWN',
          entityType: entityTypeMap[entry.actionType] || 'Unknown',
          entityId: entry.entityId,
          metadata: JSON.stringify({
            blockchainEnabled: true,
            actionType: AuditActionType[entry.actionType],
            recordHash: this.hashingService.hashData(entry.recordData),
          }),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create off-chain audit record: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Force flush all pending entries (for shutdown)
   */
  async forceFlush(): Promise<void> {
    await this.flushPendingEntries();
  }
}
