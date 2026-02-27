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
var AuditLogContractService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogContractService = exports.AuditActionType = void 0;
const common_1 = require("@nestjs/common");
const blockchain_service_1 = require("../blockchain.service");
const hashing_service_1 = require("../hashing.service");
var AuditActionType;
(function (AuditActionType) {
    AuditActionType[AuditActionType["PATIENT_CREATED"] = 0] = "PATIENT_CREATED";
    AuditActionType[AuditActionType["PATIENT_UPDATED"] = 1] = "PATIENT_UPDATED";
    AuditActionType[AuditActionType["PRESCRIPTION_CREATED"] = 2] = "PRESCRIPTION_CREATED";
    AuditActionType[AuditActionType["PRESCRIPTION_FILLED"] = 3] = "PRESCRIPTION_FILLED";
    AuditActionType[AuditActionType["PRESCRIPTION_CANCELLED"] = 4] = "PRESCRIPTION_CANCELLED";
    AuditActionType[AuditActionType["APPOINTMENT_CREATED"] = 5] = "APPOINTMENT_CREATED";
    AuditActionType[AuditActionType["APPOINTMENT_UPDATED"] = 6] = "APPOINTMENT_UPDATED";
    AuditActionType[AuditActionType["APPOINTMENT_CANCELLED"] = 7] = "APPOINTMENT_CANCELLED";
    AuditActionType[AuditActionType["MEDICAL_RECORD_CREATED"] = 8] = "MEDICAL_RECORD_CREATED";
    AuditActionType[AuditActionType["MEDICAL_RECORD_UPDATED"] = 9] = "MEDICAL_RECORD_UPDATED";
    AuditActionType[AuditActionType["CONSENT_GRANTED"] = 10] = "CONSENT_GRANTED";
    AuditActionType[AuditActionType["CONSENT_REVOKED"] = 11] = "CONSENT_REVOKED";
    AuditActionType[AuditActionType["ACCESS_GRANTED"] = 12] = "ACCESS_GRANTED";
    AuditActionType[AuditActionType["ACCESS_REVOKED"] = 13] = "ACCESS_REVOKED";
    AuditActionType[AuditActionType["EMERGENCY_ACCESS"] = 14] = "EMERGENCY_ACCESS";
})(AuditActionType || (exports.AuditActionType = AuditActionType = {}));
let AuditLogContractService = AuditLogContractService_1 = class AuditLogContractService {
    constructor(blockchainService, hashingService) {
        this.blockchainService = blockchainService;
        this.hashingService = hashingService;
        this.logger = new common_1.Logger(AuditLogContractService_1.name);
    }
    async createAuditEntry(dto) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping audit entry creation.');
            return null;
        }
        const contract = this.blockchainService.getAuditLogContract();
        if (!contract) {
            this.logger.error('AuditLog contract not initialized');
            return null;
        }
        try {
            const recordHash = this.hashingService.hashData(dto.recordData);
            const entityIdHash = this.hashingService.hashEntityId(dto.entityId);
            const actorIdHash = this.hashingService.hashEntityId(dto.actorId);
            this.logger.log(`Creating audit entry for entity ${dto.entityId} (action: ${AuditActionType[dto.actionType]})`);
            const tx = await contract.createAuditEntry(recordHash, entityIdHash, dto.actionType, actorIdHash);
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
                .find((e) => e?.name === 'AuditEntryCreated');
            if (!event) {
                this.logger.error('Could not find AuditEntryCreated event');
                return null;
            }
            return {
                entryId: event.args.entryId,
                recordHash,
                entityId: entityIdHash,
                actionType: dto.actionType,
                timestamp: Number(event.args.timestamp),
                actor: event.args.actor,
                actorId: actorIdHash,
                previousHash: '',
                txHash: tx.hash,
            };
        }
        catch (error) {
            this.logger.error(`Failed to create audit entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async createBatchAuditEntries(entries) {
        if (!this.blockchainService.isEnabled()) {
            this.logger.warn('Blockchain disabled. Skipping batch audit entries.');
            return null;
        }
        const contract = this.blockchainService.getAuditLogContract();
        if (!contract) {
            this.logger.error('AuditLog contract not initialized');
            return null;
        }
        try {
            const recordHashes = entries.map(e => this.hashingService.hashData(e.recordData));
            const entityIds = entries.map(e => this.hashingService.hashEntityId(e.entityId));
            const actionTypes = entries.map(e => e.actionType);
            const actorIds = entries.map(e => this.hashingService.hashEntityId(e.actorId));
            this.logger.log(`Creating batch of ${entries.length} audit entries`);
            const tx = await contract.createBatchAuditEntries(recordHashes, entityIds, actionTypes, actorIds);
            const receipt = await tx.wait();
            this.logger.log(`Batch transaction confirmed in block ${receipt.blockNumber}`);
            const event = receipt.logs
                .map((log) => {
                try {
                    return contract.interface.parseLog(log);
                }
                catch {
                    return null;
                }
            })
                .find((e) => e?.name === 'BatchAuditCreated');
            if (!event) {
                this.logger.error('Could not find BatchAuditCreated event');
                return null;
            }
            return event.args.entryIds;
        }
        catch (error) {
            this.logger.error(`Failed to create batch audit entries: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async verifyRecordIntegrity(entryId, currentData) {
        if (!this.blockchainService.isEnabled()) {
            throw new Error('Blockchain is disabled');
        }
        const contract = this.blockchainService.getAuditLogContract();
        if (!contract) {
            throw new Error('AuditLog contract not initialized');
        }
        try {
            const currentHash = this.hashingService.hashData(currentData);
            const [isValid, originalHash, timestamp] = await contract.verifyRecordIntegrity(entryId, currentHash);
            return {
                isValid,
                originalHash,
                currentHash,
                timestamp: Number(timestamp),
            };
        }
        catch (error) {
            this.logger.error(`Failed to verify record integrity: ${error instanceof Error ? error.message : "Unknown error"}`);
            throw error;
        }
    }
    async getAuditEntry(entryId) {
        if (!this.blockchainService.isEnabled()) {
            throw new Error('Blockchain is disabled');
        }
        const contract = this.blockchainService.getAuditLogContract();
        if (!contract) {
            throw new Error('AuditLog contract not initialized');
        }
        try {
            const [recordHash, entityId, actionType, timestamp, actor, actorId, previousHash] = await contract.getAuditEntry(entryId);
            return {
                entryId,
                recordHash,
                entityId,
                actionType: Number(actionType),
                timestamp: Number(timestamp),
                actor,
                actorId,
                previousHash,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get audit entry: ${error instanceof Error ? error.message : "Unknown error"}`);
            return null;
        }
    }
    async getEntityHistory(entityId) {
        if (!this.blockchainService.isEnabled()) {
            throw new Error('Blockchain is disabled');
        }
        const contract = this.blockchainService.getAuditLogContract();
        if (!contract) {
            throw new Error('AuditLog contract not initialized');
        }
        const entityIdHash = this.hashingService.hashEntityId(entityId);
        return await contract.getEntityHistory(entityIdHash);
    }
    async getTotalEntries() {
        if (!this.blockchainService.isEnabled()) {
            return 0;
        }
        const contract = this.blockchainService.getAuditLogContract();
        if (!contract) {
            return 0;
        }
        const total = await contract.getTotalEntries();
        return Number(total);
    }
};
exports.AuditLogContractService = AuditLogContractService;
exports.AuditLogContractService = AuditLogContractService = AuditLogContractService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [blockchain_service_1.BlockchainService,
        hashing_service_1.HashingService])
], AuditLogContractService);
//# sourceMappingURL=audit-log.contract.js.map