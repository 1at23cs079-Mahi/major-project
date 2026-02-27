"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const blockchain_service_1 = require("./blockchain.service");
const hashing_service_1 = require("./hashing.service");
const audit_log_contract_1 = require("./contracts/audit-log.contract");
const consent_contract_1 = require("./contracts/consent.contract");
const prescription_contract_1 = require("./contracts/prescription.contract");
const verification_service_1 = require("./verification.service");
const audit_integration_service_1 = require("./audit-integration.service");
const blockchain_controller_1 = require("./blockchain.controller");
const canonical_hash_service_1 = require("./services/canonical-hash.service");
const version_tracking_service_1 = require("./services/version-tracking.service");
const merkle_batch_service_1 = require("./services/merkle-batch.service");
const entity_hooks_service_1 = require("./services/entity-hooks.service");
let BlockchainModule = class BlockchainModule {
};
exports.BlockchainModule = BlockchainModule;
exports.BlockchainModule = BlockchainModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [blockchain_controller_1.BlockchainController],
        providers: [
            blockchain_service_1.BlockchainService,
            hashing_service_1.HashingService,
            audit_log_contract_1.AuditLogContractService,
            consent_contract_1.ConsentContractService,
            prescription_contract_1.PrescriptionContractService,
            verification_service_1.BlockchainVerificationService,
            audit_integration_service_1.BlockchainAuditIntegrationService,
            canonical_hash_service_1.CanonicalHashService,
            version_tracking_service_1.VersionTrackingService,
            merkle_batch_service_1.MerkleBatchService,
            entity_hooks_service_1.EntityHooksService,
        ],
        exports: [
            blockchain_service_1.BlockchainService,
            hashing_service_1.HashingService,
            audit_log_contract_1.AuditLogContractService,
            consent_contract_1.ConsentContractService,
            prescription_contract_1.PrescriptionContractService,
            verification_service_1.BlockchainVerificationService,
            audit_integration_service_1.BlockchainAuditIntegrationService,
            canonical_hash_service_1.CanonicalHashService,
            version_tracking_service_1.VersionTrackingService,
            merkle_batch_service_1.MerkleBatchService,
            entity_hooks_service_1.EntityHooksService,
        ],
    })
], BlockchainModule);
//# sourceMappingURL=blockchain.module.js.map