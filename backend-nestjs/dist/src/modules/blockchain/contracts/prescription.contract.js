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
var PrescriptionContractService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionContractService = exports.BlockchainPrescriptionStatus = void 0;
const common_1 = require("@nestjs/common");
const blockchain_service_1 = require("../blockchain.service");
const hashing_service_1 = require("../hashing.service");
var BlockchainPrescriptionStatus;
(function (BlockchainPrescriptionStatus) {
    BlockchainPrescriptionStatus[BlockchainPrescriptionStatus["ACTIVE"] = 0] = "ACTIVE";
    BlockchainPrescriptionStatus[BlockchainPrescriptionStatus["FILLED"] = 1] = "FILLED";
    BlockchainPrescriptionStatus[BlockchainPrescriptionStatus["PARTIALLY_FILLED"] = 2] = "PARTIALLY_FILLED";
    BlockchainPrescriptionStatus[BlockchainPrescriptionStatus["CANCELLED"] = 3] = "CANCELLED";
    BlockchainPrescriptionStatus[BlockchainPrescriptionStatus["EXPIRED"] = 4] = "EXPIRED";
})(BlockchainPrescriptionStatus || (exports.BlockchainPrescriptionStatus = BlockchainPrescriptionStatus = {}));
let PrescriptionContractService = PrescriptionContractService_1 = class PrescriptionContractService {
    constructor(blockchainService, hashingService) {
        this.blockchainService = blockchainService;
        this.hashingService = hashingService;
        this.logger = new common_1.Logger(PrescriptionContractService_1.name);
    }
    async registerPrescription(dto) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping prescription registration.');
            return null;
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            this.logger.error('PrescriptionRegistry contract not initialized');
            return null;
        }
        try {
            const prescriptionIdHash = this.hashingService.hashEntityId(dto.prescriptionId);
            const prescriptionHash = this.hashingService.hashPrescription(dto.prescriptionData);
            const patientIdHash = this.hashingService.hashEntityId(dto.prescriptionData.patientId);
            const prescriberIdHash = this.hashingService.hashEntityId(dto.prescriptionData.doctorId);
            this.logger.log(`Registering prescription ${dto.prescriptionId} on blockchain`);
            const tx = await contract.createPrescription(prescriptionIdHash, prescriptionHash, patientIdHash, prescriberIdHash, dto.validUntil, dto.refillsAllowed);
            this.logger.log(`Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);
            return {
                prescriptionId: prescriptionIdHash,
                prescriptionHash,
                patientId: patientIdHash,
                prescriberId: prescriberIdHash,
                pharmacyId: '',
                status: BlockchainPrescriptionStatus.ACTIVE,
                createdAt: Math.floor(Date.now() / 1000),
                validUntil: dto.validUntil,
                filledAt: 0,
                refillsAllowed: dto.refillsAllowed,
                refillsUsed: 0,
                txHash: tx.hash,
            };
        }
        catch (error) {
            this.logger.error(`Failed to register prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async fillPrescription(prescriptionId, pharmacyId, currentPrescriptionData) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping prescription fill.');
            return { success: false };
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            this.logger.error('PrescriptionRegistry contract not initialized');
            return { success: false };
        }
        try {
            const prescriptionIdHash = this.hashingService.hashEntityId(prescriptionId);
            const pharmacyIdHash = this.hashingService.hashEntityId(pharmacyId);
            const currentHash = this.hashingService.hashData(currentPrescriptionData);
            this.logger.log(`Filling prescription ${prescriptionId} by pharmacy ${pharmacyId}`);
            const tx = await contract.fillPrescription(prescriptionIdHash, pharmacyIdHash, currentHash);
            const receipt = await tx.wait();
            this.logger.log(`Prescription filled in block ${receipt.blockNumber}`);
            return { success: true, txHash: tx.hash };
        }
        catch (error) {
            this.logger.error(`Failed to fill prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async refillPrescription(prescriptionId, pharmacyId) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping prescription refill.');
            return { success: false };
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            return { success: false };
        }
        try {
            const prescriptionIdHash = this.hashingService.hashEntityId(prescriptionId);
            const pharmacyIdHash = this.hashingService.hashEntityId(pharmacyId);
            const tx = await contract.refillPrescription(prescriptionIdHash, pharmacyIdHash);
            const receipt = await tx.wait();
            return { success: true, txHash: tx.hash };
        }
        catch (error) {
            this.logger.error(`Failed to refill prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async cancelPrescription(prescriptionId) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping prescription cancellation.');
            return { success: false };
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            return { success: false };
        }
        try {
            const prescriptionIdHash = this.hashingService.hashEntityId(prescriptionId);
            const tx = await contract.cancelPrescription(prescriptionIdHash);
            const receipt = await tx.wait();
            return { success: true, txHash: tx.hash };
        }
        catch (error) {
            this.logger.error(`Failed to cancel prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async verifyPrescription(prescriptionId, currentPrescriptionData) {
        if (!this.blockchainService.isEnabled()) {
            throw new Error('Blockchain is disabled');
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            throw new Error('PrescriptionRegistry contract not initialized');
        }
        try {
            const prescriptionIdHash = this.hashingService.hashEntityId(prescriptionId);
            const currentHash = this.hashingService.hashPrescription(currentPrescriptionData);
            const [isValid, status, originalHash, validUntil] = await contract.verifyPrescriptionView(prescriptionIdHash, currentHash);
            return {
                isValid,
                status: Number(status),
                originalHash,
                currentHash,
                validUntil: Number(validUntil),
            };
        }
        catch (error) {
            this.logger.error(`Failed to verify prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async getPrescription(prescriptionId) {
        if (!this.blockchainService.isEnabled()) {
            return null;
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            return null;
        }
        try {
            const prescriptionIdHash = this.hashingService.hashEntityId(prescriptionId);
            const [prescriptionHash, patientId, prescriberId, pharmacyId, status, createdAt, validUntil, filledAt, refillsAllowed, refillsUsed,] = await contract.getPrescription(prescriptionIdHash);
            return {
                prescriptionId: prescriptionIdHash,
                prescriptionHash,
                patientId,
                prescriberId,
                pharmacyId,
                status: Number(status),
                createdAt: Number(createdAt),
                validUntil: Number(validUntil),
                filledAt: Number(filledAt),
                refillsAllowed: Number(refillsAllowed),
                refillsUsed: Number(refillsUsed),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
            return null;
        }
    }
    async getRemainingRefills(prescriptionId) {
        if (!this.blockchainService.isEnabled()) {
            return 0;
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            return 0;
        }
        try {
            const prescriptionIdHash = this.hashingService.hashEntityId(prescriptionId);
            const remaining = await contract.getRemainingRefills(prescriptionIdHash);
            return Number(remaining);
        }
        catch (error) {
            this.logger.error(`Failed to get remaining refills: ${error instanceof Error ? error.message : "Unknown error"}`);
            return 0;
        }
    }
    async getStats() {
        if (!this.blockchainService.isEnabled()) {
            return { total: 0, filled: 0 };
        }
        const contract = this.blockchainService.getPrescriptionRegistryContract();
        if (!contract) {
            return { total: 0, filled: 0 };
        }
        try {
            const [total, filled] = await contract.getStats();
            return { total: Number(total), filled: Number(filled) };
        }
        catch (error) {
            this.logger.error(`Failed to get stats: ${error instanceof Error ? error.message : "Unknown error"}`);
            return { total: 0, filled: 0 };
        }
    }
};
exports.PrescriptionContractService = PrescriptionContractService;
exports.PrescriptionContractService = PrescriptionContractService = PrescriptionContractService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        hashing_service_1.HashingService])
], PrescriptionContractService);
//# sourceMappingURL=prescription.contract.js.map