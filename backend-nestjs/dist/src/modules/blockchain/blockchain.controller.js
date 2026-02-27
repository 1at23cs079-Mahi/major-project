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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const blockchain_service_1 = require("./blockchain.service");
const verification_service_1 = require("./verification.service");
const audit_log_contract_1 = require("./contracts/audit-log.contract");
const consent_contract_1 = require("./contracts/consent.contract");
const prescription_contract_1 = require("./contracts/prescription.contract");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const canonical_hash_service_1 = require("./services/canonical-hash.service");
const version_tracking_service_1 = require("./services/version-tracking.service");
const merkle_batch_service_1 = require("./services/merkle-batch.service");
class GrantConsentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrantConsentDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrantConsentDto.prototype, "granteeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GrantConsentDto.prototype, "consentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GrantConsentDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrantConsentDto.prototype, "purpose", void 0);
class RevokeConsentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RevokeConsentDto.prototype, "consentId", void 0);
class CheckConsentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckConsentDto.prototype, "patientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckConsentDto.prototype, "granteeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CheckConsentDto.prototype, "requiredType", void 0);
let BlockchainController = class BlockchainController {
    constructor(blockchainService, verificationService, auditLogContract, consentContract, prescriptionContract, canonicalHashService, versionTrackingService, merkleBatchService) {
        this.blockchainService = blockchainService;
        this.verificationService = verificationService;
        this.auditLogContract = auditLogContract;
        this.consentContract = consentContract;
        this.prescriptionContract = prescriptionContract;
        this.canonicalHashService = canonicalHashService;
        this.versionTrackingService = versionTrackingService;
        this.merkleBatchService = merkleBatchService;
    }
    async getHealth() {
        return this.blockchainService.healthCheck();
    }
    async getStatus() {
        const health = await this.blockchainService.healthCheck();
        let auditStats = { totalEntries: 0 };
        let consentStats = { totalConsents: 0 };
        let prescriptionStats = { total: 0, filled: 0 };
        if (health.connected) {
            try {
                auditStats.totalEntries = await this.auditLogContract.getTotalEntries();
                consentStats.totalConsents = await this.consentContract.getTotalConsents();
                prescriptionStats = await this.prescriptionContract.getStats();
            }
            catch (error) {
            }
        }
        return {
            ...health,
            statistics: {
                auditEntries: auditStats.totalEntries,
                consents: consentStats.totalConsents,
                prescriptions: prescriptionStats,
            },
        };
    }
    async verifyRecord(type, id) {
        return this.verificationService.verify(type, id);
    }
    async verifyPatient(id) {
        return this.verificationService.verifyPatient(id);
    }
    async verifyPrescription(id) {
        return this.verificationService.verifyPrescription(id);
    }
    async verifyAppointment(id) {
        return this.verificationService.verifyAppointment(id);
    }
    async verifyMedicalRecord(id) {
        return this.verificationService.verifyMedicalRecord(id);
    }
    async getAuditTotal() {
        const total = await this.auditLogContract.getTotalEntries();
        return { totalEntries: total };
    }
    async getAuditEntry(entryId) {
        const entry = await this.auditLogContract.getAuditEntry(entryId);
        if (!entry) {
            return { error: 'Audit entry not found' };
        }
        const actionNames = {
            [audit_log_contract_1.AuditActionType.PATIENT_CREATED]: 'PATIENT_CREATED',
            [audit_log_contract_1.AuditActionType.PATIENT_UPDATED]: 'PATIENT_UPDATED',
            [audit_log_contract_1.AuditActionType.PRESCRIPTION_CREATED]: 'PRESCRIPTION_CREATED',
            [audit_log_contract_1.AuditActionType.PRESCRIPTION_FILLED]: 'PRESCRIPTION_FILLED',
            [audit_log_contract_1.AuditActionType.PRESCRIPTION_CANCELLED]: 'PRESCRIPTION_CANCELLED',
            [audit_log_contract_1.AuditActionType.APPOINTMENT_CREATED]: 'APPOINTMENT_CREATED',
            [audit_log_contract_1.AuditActionType.APPOINTMENT_UPDATED]: 'APPOINTMENT_UPDATED',
            [audit_log_contract_1.AuditActionType.APPOINTMENT_CANCELLED]: 'APPOINTMENT_CANCELLED',
            [audit_log_contract_1.AuditActionType.MEDICAL_RECORD_CREATED]: 'MEDICAL_RECORD_CREATED',
            [audit_log_contract_1.AuditActionType.MEDICAL_RECORD_UPDATED]: 'MEDICAL_RECORD_UPDATED',
            [audit_log_contract_1.AuditActionType.CONSENT_GRANTED]: 'CONSENT_GRANTED',
            [audit_log_contract_1.AuditActionType.CONSENT_REVOKED]: 'CONSENT_REVOKED',
            [audit_log_contract_1.AuditActionType.ACCESS_GRANTED]: 'ACCESS_GRANTED',
            [audit_log_contract_1.AuditActionType.ACCESS_REVOKED]: 'ACCESS_REVOKED',
            [audit_log_contract_1.AuditActionType.EMERGENCY_ACCESS]: 'EMERGENCY_ACCESS',
        };
        return {
            ...entry,
            actionTypeName: actionNames[entry.actionType] || 'UNKNOWN',
            timestampReadable: new Date(entry.timestamp * 1000).toISOString(),
        };
    }
    async getEntityAuditHistory(entityId) {
        const entryIds = await this.auditLogContract.getEntityHistory(entityId);
        return {
            entityId,
            totalEntries: entryIds.length,
            entryIds,
        };
    }
    async grantConsent(dto) {
        const result = await this.consentContract.grantConsent({
            patientId: dto.patientId,
            granteeId: dto.granteeId,
            consentType: dto.consentType,
            expiresAt: dto.expiresAt,
            purpose: dto.purpose,
        });
        return {
            success: !!result,
            consent: result,
        };
    }
    async revokeConsent(dto) {
        return this.consentContract.revokeConsent(dto.consentId);
    }
    async checkConsent(dto) {
        const result = await this.consentContract.checkConsent(dto.patientId, dto.granteeId, dto.requiredType);
        const consentTypeNames = {
            [consent_contract_1.ConsentType.FULL_ACCESS]: 'FULL_ACCESS',
            [consent_contract_1.ConsentType.PRESCRIPTION_ONLY]: 'PRESCRIPTION_ONLY',
            [consent_contract_1.ConsentType.APPOINTMENT_ONLY]: 'APPOINTMENT_ONLY',
            [consent_contract_1.ConsentType.LAB_RESULTS_ONLY]: 'LAB_RESULTS_ONLY',
            [consent_contract_1.ConsentType.EMERGENCY_ONLY]: 'EMERGENCY_ONLY',
            [consent_contract_1.ConsentType.INSURANCE_SHARING]: 'INSURANCE_SHARING',
            [consent_contract_1.ConsentType.RESEARCH_PARTICIPATION]: 'RESEARCH_PARTICIPATION',
        };
        return {
            ...result,
            requiredTypeName: consentTypeNames[dto.requiredType] || 'UNKNOWN',
        };
    }
    async getConsent(consentId) {
        return this.consentContract.getConsent(consentId);
    }
    async getPatientConsents(patientId) {
        const consentIds = await this.consentContract.getPatientConsents(patientId);
        return {
            patientId,
            totalConsents: consentIds.length,
            consentIds,
        };
    }
    async getPrescriptionBlockchain(prescriptionId) {
        return this.prescriptionContract.getPrescription(prescriptionId);
    }
    async getPrescriptionRefills(prescriptionId) {
        const remaining = await this.prescriptionContract.getRemainingRefills(prescriptionId);
        return { prescriptionId, remainingRefills: remaining };
    }
    async getPrescriptionStats() {
        return this.prescriptionContract.getStats();
    }
    async getVersionHistory(entityType, entityId) {
        const history = await this.versionTrackingService.getVersionHistory(entityType, entityId);
        return {
            entityType,
            entityId,
            totalVersions: history.length,
            versions: history.map((v) => ({
                version: v.version,
                recordHash: v.recordHash,
                previousHash: v.previousHash,
                versionHash: v.versionHash,
                changeType: v.changeType,
                createdBy: v.createdBy,
                createdAt: v.createdAt,
                batchId: v.batchId,
                hasBlockchainProof: !!v.merkleProof,
            })),
        };
    }
    async getVersion(entityType, entityId, version) {
        const versionData = await this.versionTrackingService.getVersion(entityType, entityId, parseInt(version));
        if (!versionData) {
            return { error: 'Version not found' };
        }
        return {
            ...versionData,
            hasBlockchainProof: !!versionData.merkleProof,
            blockchain: versionData.merkleProof
                ? {
                    batchId: versionData.merkleProof.batchId,
                    merkleRoot: versionData.merkleProof.batch?.merkleRoot,
                    txHash: versionData.merkleProof.batch?.txHash,
                    blockNumber: versionData.merkleProof.batch?.blockNumber,
                    status: versionData.merkleProof.batch?.status,
                }
                : null,
        };
    }
    async verifyVersionChain(entityType, entityId) {
        return this.versionTrackingService.verifyVersionChain(entityType, entityId);
    }
    async getVersionStats() {
        return this.versionTrackingService.getStatistics();
    }
    async getBatchStats() {
        return this.merkleBatchService.getBatchStatistics();
    }
    async getBatch(batchId) {
        const batch = await this.merkleBatchService.getBatch(batchId);
        if (!batch) {
            return { error: 'Batch not found' };
        }
        return batch;
    }
    async processBatch() {
        return this.merkleBatchService.processPendingBatch();
    }
    async retryFailedBatches() {
        return this.merkleBatchService.retryFailedBatches();
    }
    async verifyBlockchainProof(entityType, entityId, version) {
        const result = await this.merkleBatchService.verifyRecordProof(entityType, entityId, version ? parseInt(version) : undefined);
        return {
            entityType,
            entityId,
            ...result,
            status: result.verified ? 'VERIFIED_ON_BLOCKCHAIN' : 'PENDING_SUBMISSION',
        };
    }
    async testHash(data) {
        if (process.env.NODE_ENV === 'production') {
            return { error: 'Not available in production' };
        }
        const canonical = this.canonicalHashService.canonicalize(data);
        const hash = this.canonicalHashService.hash(data);
        return {
            original: data,
            canonical,
            hash,
        };
    }
};
exports.BlockchainController = BlockchainController;
__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check blockchain connection health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Blockchain health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blockchain module status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Blockchain status and statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('verify/:type/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify record integrity against blockchain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification result' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyRecord", null);
__decorate([
    (0, common_1.Get)('verify/patient/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify patient record integrity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient verification result' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyPatient", null);
__decorate([
    (0, common_1.Get)('verify/prescription/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify prescription authenticity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription verification result' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyPrescription", null);
__decorate([
    (0, common_1.Get)('verify/appointment/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify appointment record integrity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointment verification result' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyAppointment", null);
__decorate([
    (0, common_1.Get)('verify/medical-record/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify medical record integrity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medical record verification result' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyMedicalRecord", null);
__decorate([
    (0, common_1.Get)('audit/total'),
    (0, swagger_1.ApiOperation)({ summary: 'Get total audit entries count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Total audit entries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getAuditTotal", null);
__decorate([
    (0, common_1.Get)('audit/entry/:entryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit entry details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audit entry details' }),
    __param(0, (0, common_1.Param)('entryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getAuditEntry", null);
__decorate([
    (0, common_1.Get)('audit/entity/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit history for an entity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entity audit history' }),
    __param(0, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getEntityAuditHistory", null);
__decorate([
    (0, common_1.Post)('consent/grant'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Grant consent from patient to provider' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Consent granted' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GrantConsentDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "grantConsent", null);
__decorate([
    (0, common_1.Post)('consent/revoke'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke an existing consent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consent revoked' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RevokeConsentDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "revokeConsent", null);
__decorate([
    (0, common_1.Post)('consent/check'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check if provider has valid consent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consent check result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CheckConsentDto]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "checkConsent", null);
__decorate([
    (0, common_1.Get)('consent/:consentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get consent record details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consent details' }),
    __param(0, (0, common_1.Param)('consentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getConsent", null);
__decorate([
    (0, common_1.Get)('consent/patient/:patientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all consents for a patient' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient consents' }),
    __param(0, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getPatientConsents", null);
__decorate([
    (0, common_1.Get)('prescription/:prescriptionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get prescription blockchain record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription blockchain details' }),
    __param(0, (0, common_1.Param)('prescriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getPrescriptionBlockchain", null);
__decorate([
    (0, common_1.Get)('prescription/:prescriptionId/refills'),
    (0, swagger_1.ApiOperation)({ summary: 'Get remaining refills for prescription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Remaining refills count' }),
    __param(0, (0, common_1.Param)('prescriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getPrescriptionRefills", null);
__decorate([
    (0, common_1.Get)('prescription/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get prescription blockchain statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getPrescriptionStats", null);
__decorate([
    (0, common_1.Get)('versions/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get version history for an entity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Entity version history' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getVersionHistory", null);
__decorate([
    (0, common_1.Get)('versions/:entityType/:entityId/:version'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific version details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Version details' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Param)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getVersion", null);
__decorate([
    (0, common_1.Get)('versions/:entityType/:entityId/chain/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify version chain integrity' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chain verification result' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyVersionChain", null);
__decorate([
    (0, common_1.Get)('versions/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get version tracking statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Version statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getVersionStats", null);
__decorate([
    (0, common_1.Get)('batches/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Merkle batch statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getBatchStats", null);
__decorate([
    (0, common_1.Get)('batches/:batchId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get batch details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch details' }),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "getBatch", null);
__decorate([
    (0, common_1.Post)('batches/process'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger batch processing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch processing result' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "processBatch", null);
__decorate([
    (0, common_1.Post)('batches/retry-failed'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retry failed batch submissions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Retry results' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "retryFailedBatches", null);
__decorate([
    (0, common_1.Get)('proof/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify record blockchain proof with Merkle verification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Blockchain proof verification' }),
    (0, swagger_1.ApiQuery)({ name: 'version', required: false, description: 'Specific version to verify' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)('version')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "verifyBlockchainProof", null);
__decorate([
    (0, common_1.Post)('hash/test'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Test canonical hashing (development only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hash result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BlockchainController.prototype, "testHash", null);
exports.BlockchainController = BlockchainController = __decorate([
    (0, swagger_1.ApiTags)('Blockchain'),
    (0, common_1.Controller)('blockchain'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        verification_service_1.BlockchainVerificationService,
        audit_log_contract_1.AuditLogContractService,
        consent_contract_1.ConsentContractService,
        prescription_contract_1.PrescriptionContractService,
        canonical_hash_service_1.CanonicalHashService,
        version_tracking_service_1.VersionTrackingService,
        merkle_batch_service_1.MerkleBatchService])
], BlockchainController);
//# sourceMappingURL=blockchain.controller.js.map