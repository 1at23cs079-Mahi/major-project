import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { HashingService } from '../hashing.service';
import { ethers } from 'ethers';

// Action types matching the Solidity enum
export enum AuditActionType {
  PATIENT_CREATED = 0,
  PATIENT_UPDATED = 1,
  PRESCRIPTION_CREATED = 2,
  PRESCRIPTION_FILLED = 3,
  PRESCRIPTION_CANCELLED = 4,
  APPOINTMENT_CREATED = 5,
  APPOINTMENT_UPDATED = 6,
  APPOINTMENT_CANCELLED = 7,
  MEDICAL_RECORD_CREATED = 8,
  MEDICAL_RECORD_UPDATED = 9,
  CONSENT_GRANTED = 10,
  CONSENT_REVOKED = 11,
  ACCESS_GRANTED = 12,
  ACCESS_REVOKED = 13,
  EMERGENCY_ACCESS = 14,
}

export interface AuditEntry {
  entryId: string;
  recordHash: string;
  entityId: string;
  actionType: AuditActionType;
  timestamp: number;
  actor: string;
  actorId: string;
  previousHash: string;
  txHash?: string;
}

export interface CreateAuditEntryDto {
  recordData: unknown;
  entityId: string;
  actionType: AuditActionType;
  actorId: string;
}

@Injectable()
export class AuditLogContractService {
  private readonly logger = new Logger(AuditLogContractService.name);

  constructor(
    private blockchainService: BlockchainService,
    private hashingService: HashingService,
  ) {}

  /**
   * Create a new audit entry on blockchain
   */
  async createAuditEntry(dto: CreateAuditEntryDto): Promise<AuditEntry | null> {
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

      const tx = await contract.createAuditEntry(
        recordHash,
        entityIdHash,
        dto.actionType,
        actorIdHash,
      );

      this.logger.log(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      // Parse event to get entryId
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === 'AuditEntryCreated');

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
        previousHash: '', // Can be fetched separately
        txHash: tx.hash,
      };
    } catch (error) {
      this.logger.error(`Failed to create audit entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Create multiple audit entries in one transaction
   */
  async createBatchAuditEntries(entries: CreateAuditEntryDto[]): Promise<string[] | null> {
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

      const tx = await contract.createBatchAuditEntries(
        recordHashes,
        entityIds,
        actionTypes,
        actorIds,
      );

      const receipt = await tx.wait();
      this.logger.log(`Batch transaction confirmed in block ${receipt.blockNumber}`);

      // Parse event to get entryIds
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === 'BatchAuditCreated');

      if (!event) {
        this.logger.error('Could not find BatchAuditCreated event');
        return null;
      }

      return event.args.entryIds;
    } catch (error) {
      this.logger.error(`Failed to create batch audit entries: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Verify record integrity against blockchain
   */
  async verifyRecordIntegrity(entryId: string, currentData: unknown): Promise<{
    isValid: boolean;
    originalHash: string;
    currentHash: string;
    timestamp: number;
  }> {
    if (!this.blockchainService.isEnabled()) {
      throw new Error('Blockchain is disabled');
    }

    const contract = this.blockchainService.getAuditLogContract();
    if (!contract) {
      throw new Error('AuditLog contract not initialized');
    }

    try {
      const currentHash = this.hashingService.hashData(currentData);
      
      const [isValid, originalHash, timestamp] = await contract.verifyRecordIntegrity(
        entryId,
        currentHash,
      );

      return {
        isValid,
        originalHash,
        currentHash,
        timestamp: Number(timestamp),
      };
    } catch (error) {
      this.logger.error(`Failed to verify record integrity: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Get audit entry details
   */
  async getAuditEntry(entryId: string): Promise<AuditEntry | null> {
    if (!this.blockchainService.isEnabled()) {
      throw new Error('Blockchain is disabled');
    }

    const contract = this.blockchainService.getAuditLogContract();
    if (!contract) {
      throw new Error('AuditLog contract not initialized');
    }

    try {
      const [recordHash, entityId, actionType, timestamp, actor, actorId, previousHash] = 
        await contract.getAuditEntry(entryId);

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
    } catch (error) {
      this.logger.error(`Failed to get audit entry: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  }

  /**
   * Get all audit entries for an entity
   */
  async getEntityHistory(entityId: string): Promise<string[]> {
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

  /**
   * Get total number of audit entries
   */
  async getTotalEntries(): Promise<number> {
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
}
