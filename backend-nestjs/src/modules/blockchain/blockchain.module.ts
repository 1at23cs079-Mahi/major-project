import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { HashingService } from './hashing.service';
import { AuditLogContractService } from './contracts/audit-log.contract';
import { ConsentContractService } from './contracts/consent.contract';
import { PrescriptionContractService } from './contracts/prescription.contract';
import { BlockchainVerificationService } from './verification.service';
import { BlockchainAuditIntegrationService } from './audit-integration.service';
import { BlockchainController } from './blockchain.controller';

// Production-grade hashing services
import { CanonicalHashService } from './services/canonical-hash.service';
import { VersionTrackingService } from './services/version-tracking.service';
import { MerkleBatchService } from './services/merkle-batch.service';
import { EntityHooksService } from './services/entity-hooks.service';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [BlockchainController],
  providers: [
    // Core blockchain service
    BlockchainService,
    
    // Legacy hashing (for compatibility)
    HashingService,
    
    // Contract services
    AuditLogContractService,
    ConsentContractService,
    PrescriptionContractService,
    
    // Verification
    BlockchainVerificationService,
    BlockchainAuditIntegrationService,
    
    // Production-grade hashing & versioning
    CanonicalHashService,
    VersionTrackingService,
    MerkleBatchService,
    EntityHooksService,
  ],
  exports: [
    BlockchainService,
    HashingService,
    AuditLogContractService,
    ConsentContractService,
    PrescriptionContractService,
    BlockchainVerificationService,
    BlockchainAuditIntegrationService,
    
    // Export new services
    CanonicalHashService,
    VersionTrackingService,
    MerkleBatchService,
    EntityHooksService,
  ],
})
export class BlockchainModule {}
