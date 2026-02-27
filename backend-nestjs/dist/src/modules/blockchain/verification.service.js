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
var BlockchainVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const hashing_service_1 = require("./hashing.service");
const audit_log_contract_1 = require("./contracts/audit-log.contract");
const prescription_contract_1 = require("./contracts/prescription.contract");
let BlockchainVerificationService = BlockchainVerificationService_1 = class BlockchainVerificationService {
    constructor(prisma, hashingService, auditLogContract, prescriptionContract) {
        this.prisma = prisma;
        this.hashingService = hashingService;
        this.auditLogContract = auditLogContract;
        this.prescriptionContract = prescriptionContract;
        this.logger = new common_1.Logger(BlockchainVerificationService_1.name);
    }
    async verifyPatient(patientId) {
        try {
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
            const entryIds = await this.auditLogContract.getEntityHistory(patientId);
            if (entryIds.length === 0) {
                return {
                    entityType: 'patient',
                    entityId: patientId,
                    verified: false,
                    message: 'No blockchain record found for this patient',
                };
            }
            const latestEntryId = entryIds[entryIds.length - 1];
            const currentHash = this.hashingService.hashPatientRecord(patient);
            const verification = await this.auditLogContract.verifyRecordIntegrity(latestEntryId, patient);
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
        }
        catch (error) {
            this.logger.error(`Patient verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return {
                entityType: 'patient',
                entityId: patientId,
                verified: false,
                message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    async verifyPrescription(prescriptionId) {
        try {
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
            const verification = await this.prescriptionContract.verifyPrescription(prescriptionId, prescriptionData);
            const statusMap = {
                [prescription_contract_1.BlockchainPrescriptionStatus.ACTIVE]: 'ACTIVE',
                [prescription_contract_1.BlockchainPrescriptionStatus.FILLED]: 'FILLED',
                [prescription_contract_1.BlockchainPrescriptionStatus.PARTIALLY_FILLED]: 'PARTIALLY_FILLED',
                [prescription_contract_1.BlockchainPrescriptionStatus.CANCELLED]: 'CANCELLED',
                [prescription_contract_1.BlockchainPrescriptionStatus.EXPIRED]: 'EXPIRED',
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
        }
        catch (error) {
            this.logger.error(`Prescription verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return {
                entityType: 'prescription',
                entityId: prescriptionId,
                verified: false,
                message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    async verifyAppointment(appointmentId) {
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
            const verification = await this.auditLogContract.verifyRecordIntegrity(latestEntryId, this.hashingService.hashAppointment(appointment));
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
        }
        catch (error) {
            this.logger.error(`Appointment verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return {
                entityType: 'appointment',
                entityId: appointmentId,
                verified: false,
                message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    async verifyMedicalRecord(recordId) {
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
            const verification = await this.auditLogContract.verifyRecordIntegrity(latestEntryId, this.hashingService.hashMedicalRecord(record));
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
        }
        catch (error) {
            this.logger.error(`Medical record verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            return {
                entityType: 'medical_record',
                entityId: recordId,
                verified: false,
                message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            };
        }
    }
    async verify(type, id) {
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
};
exports.BlockchainVerificationService = BlockchainVerificationService;
exports.BlockchainVerificationService = BlockchainVerificationService = BlockchainVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        hashing_service_1.HashingService,
        audit_log_contract_1.AuditLogContractService,
        prescription_contract_1.PrescriptionContractService])
], BlockchainVerificationService);
//# sourceMappingURL=verification.service.js.map