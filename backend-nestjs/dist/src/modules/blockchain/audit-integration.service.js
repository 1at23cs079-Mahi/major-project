"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BlockchainAuditIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainAuditIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const audit_log_contract_1 = require("./contracts/audit-log.contract");
const hashing_service_1 = require("./hashing.service");
const blockchain_service_1 = require("./blockchain.service");
let BlockchainAuditIntegrationService = BlockchainAuditIntegrationService_1 = class BlockchainAuditIntegrationService {
    constructor(prisma, blockchainService, auditLogContract, hashingService) {
        this.prisma = prisma;
        this.blockchainService = blockchainService;
        this.auditLogContract = auditLogContract;
        this.hashingService = hashingService;
        this.logger = new common_1.Logger(BlockchainAuditIntegrationService_1.name);
        this.pendingEntries = [];
        this.batchTimeout = null;
        this.BATCH_SIZE = 10;
        this.BATCH_DELAY_MS = 5000;
    }
    async onModuleInit() {
        if (this.blockchainService.isEnabled()) {
            this.logger.log('Blockchain audit integration initialized');
        }
    }
    async logPatientCreated(patient, actorId) {
        await this.queueAuditEntry({
            recordData: this.hashingService.hashPatientRecord(patient),
            entityId: patient.id,
            actionType: audit_log_contract_1.AuditActionType.PATIENT_CREATED,
            actorId,
        });
    }
    async logPatientUpdated(patient, actorId) {
        await this.queueAuditEntry({
            recordData: this.hashingService.hashPatientRecord(patient),
            entityId: patient.id,
            actionType: audit_log_contract_1.AuditActionType.PATIENT_UPDATED,
            actorId,
        });
    }
    async logPrescriptionCreated(prescription, actorId) {
        await this.queueAuditEntry({
            recordData: prescription,
            entityId: prescription.id,
            actionType: audit_log_contract_1.AuditActionType.PRESCRIPTION_CREATED,
            actorId,
        });
    }
    async logPrescriptionFilled(prescription, actorId) {
        await this.queueAuditEntry({
            recordData: prescription,
            entityId: prescription.id,
            actionType: audit_log_contract_1.AuditActionType.PRESCRIPTION_FILLED,
            actorId,
        });
    }
    async logPrescriptionCancelled(prescriptionId, actorId) {
        await this.queueAuditEntry({
            recordData: { prescriptionId, cancelledAt: new Date().toISOString() },
            entityId: prescriptionId,
            actionType: audit_log_contract_1.AuditActionType.PRESCRIPTION_CANCELLED,
            actorId,
        });
    }
    async logAppointmentCreated(appointment, actorId) {
        await this.queueAuditEntry({
            recordData: this.hashingService.hashAppointment(appointment),
            entityId: appointment.id,
            actionType: audit_log_contract_1.AuditActionType.APPOINTMENT_CREATED,
            actorId,
        });
    }
    async logAppointmentUpdated(appointment, actorId) {
        await this.queueAuditEntry({
            recordData: this.hashingService.hashAppointment(appointment),
            entityId: appointment.id,
            actionType: audit_log_contract_1.AuditActionType.APPOINTMENT_UPDATED,
            actorId,
        });
    }
    async logAppointmentCancelled(appointmentId, actorId) {
        await this.queueAuditEntry({
            recordData: { appointmentId, cancelledAt: new Date().toISOString() },
            entityId: appointmentId,
            actionType: audit_log_contract_1.AuditActionType.APPOINTMENT_CANCELLED,
            actorId,
        });
    }
    async logMedicalRecordCreated(record, actorId) {
        await this.queueAuditEntry({
            recordData: this.hashingService.hashMedicalRecord(record),
            entityId: record.id,
            actionType: audit_log_contract_1.AuditActionType.MEDICAL_RECORD_CREATED,
            actorId,
        });
    }
    async logMedicalRecordUpdated(record, actorId) {
        await this.queueAuditEntry({
            recordData: this.hashingService.hashMedicalRecord(record),
            entityId: record.id,
            actionType: audit_log_contract_1.AuditActionType.MEDICAL_RECORD_UPDATED,
            actorId,
        });
    }
    async logConsentGranted(consentId, patientId, granteeId, actorId) {
        await this.queueAuditEntry({
            recordData: { consentId, patientId, granteeId, grantedAt: new Date().toISOString() },
            entityId: consentId,
            actionType: audit_log_contract_1.AuditActionType.CONSENT_GRANTED,
            actorId,
        });
    }
    async logConsentRevoked(consentId, actorId) {
        await this.queueAuditEntry({
            recordData: { consentId, revokedAt: new Date().toISOString() },
            entityId: consentId,
            actionType: audit_log_contract_1.AuditActionType.CONSENT_REVOKED,
            actorId,
        });
    }
    async logEmergencyAccess(entityId, entityType, actorId, reason) {
        await this.queueAuditEntry({
            recordData: { entityId, entityType, accessedAt: new Date().toISOString(), reason },
            entityId,
            actionType: audit_log_contract_1.AuditActionType.EMERGENCY_ACCESS,
            actorId,
        });
    }
    async queueAuditEntry(entry) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.debug('Blockchain disabled, skipping audit entry');
            return;
        }
        this.pendingEntries.push(entry);
        this.logger.debug(`Queued audit entry (pending: ${this.pendingEntries.length})`);
        if (this.pendingEntries.length >= this.BATCH_SIZE) {
            await this.flushPendingEntries();
        }
        else {
            this.scheduleBatchFlush();
        }
    }
    scheduleBatchFlush() {
        if (this.batchTimeout) {
            return;
        }
        this.batchTimeout = setTimeout(async () => {
            await this.flushPendingEntries();
        }, this.BATCH_DELAY_MS);
    }
    async flushPendingEntries() {
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
                await this.auditLogContract.createAuditEntry(entries[0]);
                this.logger.log('Created single blockchain audit entry');
            }
            else {
                await this.auditLogContract.createBatchAuditEntries(entries);
                this.logger.log(`Created ${entries.length} blockchain audit entries in batch`);
            }
            for (const entry of entries) {
                await this.createOffChainAuditRecord(entry);
            }
        }
        catch (error) {
            this.logger.error(`Failed to flush audit entries: ${error instanceof Error ? error.message : "Unknown error"}`);
            this.pendingEntries = [...entries, ...this.pendingEntries];
        }
    }
    async createOffChainAuditRecord(entry) {
        try {
            const actionMap = {
                [audit_log_contract_1.AuditActionType.PATIENT_CREATED]: 'CREATE',
                [audit_log_contract_1.AuditActionType.PATIENT_UPDATED]: 'UPDATE',
                [audit_log_contract_1.AuditActionType.PRESCRIPTION_CREATED]: 'CREATE',
                [audit_log_contract_1.AuditActionType.PRESCRIPTION_FILLED]: 'UPDATE',
                [audit_log_contract_1.AuditActionType.PRESCRIPTION_CANCELLED]: 'DELETE',
                [audit_log_contract_1.AuditActionType.APPOINTMENT_CREATED]: 'CREATE',
                [audit_log_contract_1.AuditActionType.APPOINTMENT_UPDATED]: 'UPDATE',
                [audit_log_contract_1.AuditActionType.APPOINTMENT_CANCELLED]: 'DELETE',
                [audit_log_contract_1.AuditActionType.MEDICAL_RECORD_CREATED]: 'CREATE',
                [audit_log_contract_1.AuditActionType.MEDICAL_RECORD_UPDATED]: 'UPDATE',
                [audit_log_contract_1.AuditActionType.CONSENT_GRANTED]: 'CREATE',
                [audit_log_contract_1.AuditActionType.CONSENT_REVOKED]: 'DELETE',
                [audit_log_contract_1.AuditActionType.ACCESS_GRANTED]: 'CREATE',
                [audit_log_contract_1.AuditActionType.ACCESS_REVOKED]: 'DELETE',
                [audit_log_contract_1.AuditActionType.EMERGENCY_ACCESS]: 'READ',
            };
            const entityTypeMap = {
                [audit_log_contract_1.AuditActionType.PATIENT_CREATED]: 'Patient',
                [audit_log_contract_1.AuditActionType.PATIENT_UPDATED]: 'Patient',
                [audit_log_contract_1.AuditActionType.PRESCRIPTION_CREATED]: 'Prescription',
                [audit_log_contract_1.AuditActionType.PRESCRIPTION_FILLED]: 'Prescription',
                [audit_log_contract_1.AuditActionType.PRESCRIPTION_CANCELLED]: 'Prescription',
                [audit_log_contract_1.AuditActionType.APPOINTMENT_CREATED]: 'Appointment',
                [audit_log_contract_1.AuditActionType.APPOINTMENT_UPDATED]: 'Appointment',
                [audit_log_contract_1.AuditActionType.APPOINTMENT_CANCELLED]: 'Appointment',
                [audit_log_contract_1.AuditActionType.MEDICAL_RECORD_CREATED]: 'MedicalRecord',
                [audit_log_contract_1.AuditActionType.MEDICAL_RECORD_UPDATED]: 'MedicalRecord',
                [audit_log_contract_1.AuditActionType.CONSENT_GRANTED]: 'Consent',
                [audit_log_contract_1.AuditActionType.CONSENT_REVOKED]: 'Consent',
                [audit_log_contract_1.AuditActionType.ACCESS_GRANTED]: 'Access',
                [audit_log_contract_1.AuditActionType.ACCESS_REVOKED]: 'Access',
                [audit_log_contract_1.AuditActionType.EMERGENCY_ACCESS]: 'Emergency',
            };
            await this.prisma.auditLog.create({
                data: {
                    userId: entry.actorId,
                    action: actionMap[entry.actionType] || 'UNKNOWN',
                    entityType: entityTypeMap[entry.actionType] || 'Unknown',
                    entityId: entry.entityId,
                    metadata: JSON.stringify({
                        blockchainEnabled: true,
                        actionType: audit_log_contract_1.AuditActionType[entry.actionType],
                        recordHash: this.hashingService.hashData(entry.recordData),
                    }),
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to create off-chain audit record: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async forceFlush() {
        await this.flushPendingEntries();
    }
};
exports.BlockchainAuditIntegrationService = BlockchainAuditIntegrationService;
exports.BlockchainAuditIntegrationService = BlockchainAuditIntegrationService = BlockchainAuditIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blockchain_service_1.BlockchainService,
        audit_log_contract_1.AuditLogContractService,
        hashing_service_1.HashingService])
], BlockchainAuditIntegrationService);
//# sourceMappingURL=audit-integration.service.js.map