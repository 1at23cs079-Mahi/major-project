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
var ConsentContractService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentContractService = exports.ConsentStatus = exports.ConsentType = void 0;
const common_1 = require("@nestjs/common");
const blockchain_service_1 = require("../blockchain.service");
const hashing_service_1 = require("../hashing.service");
var ConsentType;
(function (ConsentType) {
    ConsentType[ConsentType["FULL_ACCESS"] = 0] = "FULL_ACCESS";
    ConsentType[ConsentType["PRESCRIPTION_ONLY"] = 1] = "PRESCRIPTION_ONLY";
    ConsentType[ConsentType["APPOINTMENT_ONLY"] = 2] = "APPOINTMENT_ONLY";
    ConsentType[ConsentType["LAB_RESULTS_ONLY"] = 3] = "LAB_RESULTS_ONLY";
    ConsentType[ConsentType["EMERGENCY_ONLY"] = 4] = "EMERGENCY_ONLY";
    ConsentType[ConsentType["INSURANCE_SHARING"] = 5] = "INSURANCE_SHARING";
    ConsentType[ConsentType["RESEARCH_PARTICIPATION"] = 6] = "RESEARCH_PARTICIPATION";
})(ConsentType || (exports.ConsentType = ConsentType = {}));
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus[ConsentStatus["PENDING"] = 0] = "PENDING";
    ConsentStatus[ConsentStatus["GRANTED"] = 1] = "GRANTED";
    ConsentStatus[ConsentStatus["REVOKED"] = 2] = "REVOKED";
    ConsentStatus[ConsentStatus["EXPIRED"] = 3] = "EXPIRED";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
let ConsentContractService = ConsentContractService_1 = class ConsentContractService {
    constructor(blockchainService, hashingService) {
        this.blockchainService = blockchainService;
        this.hashingService = hashingService;
        this.logger = new common_1.Logger(ConsentContractService_1.name);
    }
    async grantConsent(dto) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping consent grant.');
            return null;
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            this.logger.error('ConsentManager contract not initialized');
            return null;
        }
        try {
            const patientIdHash = this.hashingService.hashEntityId(dto.patientId);
            const granteeIdHash = this.hashingService.hashEntityId(dto.granteeId);
            const purposeHash = this.hashingService.hashConsentPurpose(dto.purpose);
            const expiresAt = dto.expiresAt || 0;
            this.logger.log(`Granting consent: patient=${dto.patientId}, grantee=${dto.granteeId}, type=${ConsentType[dto.consentType]}`);
            const tx = await contract.grantConsent(patientIdHash, granteeIdHash, dto.consentType, expiresAt, purposeHash);
            this.logger.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);
            const event = receipt.logs
                .map((log) => {
                try {
                    return contract.interface.parseLog(log);
                }
                catch {
                    return null;
                }
            })
                .find((e) => e?.name === 'ConsentGranted');
            if (!event) {
                this.logger.error('Could not find ConsentGranted event');
                return null;
            }
            return {
                consentId: event.args.consentId,
                patientId: patientIdHash,
                granteeId: granteeIdHash,
                consentType: dto.consentType,
                status: ConsentStatus.GRANTED,
                grantedAt: Number(event.args.timestamp),
                expiresAt: Number(event.args.expiresAt),
                revokedAt: 0,
                purposeHash,
                txHash: tx.hash,
            };
        }
        catch (error) {
            this.logger.error(`Failed to grant consent: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async revokeConsent(consentId) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping consent revocation.');
            return { success: false };
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            this.logger.error('ConsentManager contract not initialized');
            return { success: false };
        }
        try {
            this.logger.log(`Revoking consent: ${consentId}`);
            const tx = await contract.revokeConsent(consentId);
            const receipt = await tx.wait();
            this.logger.log(`Consent revoked in block ${receipt.blockNumber}`);
            return { success: true, txHash: tx.hash };
        }
        catch (error) {
            this.logger.error(`Failed to revoke consent: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async isConsentValid(consentId) {
        if (!this.blockchainService.isEnabled()) {
            throw new Error('Blockchain is disabled');
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            throw new Error('ConsentManager contract not initialized');
        }
        try {
            const [isValid, consentType] = await contract.isConsentValid(consentId);
            return { isValid, consentType: Number(consentType) };
        }
        catch (error) {
            this.logger.error(`Failed to check consent validity: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async checkConsent(patientId, granteeId, requiredType) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Checking consent from database fallback.');
            return { hasConsent: false, consentId: null };
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            throw new Error('ConsentManager contract not initialized');
        }
        try {
            const patientIdHash = this.hashingService.hashEntityId(patientId);
            const granteeIdHash = this.hashingService.hashEntityId(granteeId);
            const [hasConsent, consentId] = await contract.checkConsent(patientIdHash, granteeIdHash, requiredType);
            return {
                hasConsent,
                consentId: hasConsent ? consentId : null,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check consent: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async getConsent(consentId) {
        if (!this.blockchainService.isEnabled()) {
            throw new Error('Blockchain is disabled');
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            throw new Error('ConsentManager contract not initialized');
        }
        try {
            const [patientId, granteeId, consentType, status, grantedAt, expiresAt, revokedAt, purposeHash,] = await contract.getConsent(consentId);
            return {
                consentId,
                patientId,
                granteeId,
                consentType: Number(consentType),
                status: Number(status),
                grantedAt: Number(grantedAt),
                expiresAt: Number(expiresAt),
                revokedAt: Number(revokedAt),
                purposeHash,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get consent: ${error instanceof Error ? error.message : "Unknown error"}`);
            return null;
        }
    }
    async getPatientConsents(patientId) {
        if (!this.blockchainService.isEnabled()) {
            return [];
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            return [];
        }
        const patientIdHash = this.hashingService.hashEntityId(patientId);
        return await contract.getPatientConsents(patientIdHash);
    }
    async getGranteeConsents(granteeId) {
        if (!this.blockchainService.isEnabled()) {
            return [];
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            return [];
        }
        const granteeIdHash = this.hashingService.hashEntityId(granteeId);
        return await contract.getGranteeConsents(granteeIdHash);
    }
    async getTotalConsents() {
        if (!this.blockchainService.isEnabled()) {
            return 0;
        }
        const contract = this.blockchainService.getConsentManagerContract();
        if (!contract) {
            return 0;
        }
        const total = await contract.getTotalConsents();
        return Number(total);
    }
};
exports.ConsentContractService = ConsentContractService;
exports.ConsentContractService = ConsentContractService = ConsentContractService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        hashing_service_1.HashingService])
], ConsentContractService);
//# sourceMappingURL=consent.contract.js.map