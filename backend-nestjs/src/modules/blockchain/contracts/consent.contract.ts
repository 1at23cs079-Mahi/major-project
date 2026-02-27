import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { HashingService } from '../hashing.service';

// Consent types matching the Solidity enum
export enum ConsentType {
  FULL_ACCESS = 0,
  PRESCRIPTION_ONLY = 1,
  APPOINTMENT_ONLY = 2,
  LAB_RESULTS_ONLY = 3,
  EMERGENCY_ONLY = 4,
  INSURANCE_SHARING = 5,
  RESEARCH_PARTICIPATION = 6,
}

export enum ConsentStatus {
  PENDING = 0,
  GRANTED = 1,
  REVOKED = 2,
  EXPIRED = 3,
}

export interface ConsentRecord {
  consentId: string;
  patientId: string;
  granteeId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  grantedAt: number;
  expiresAt: number;
  revokedAt: number;
  purposeHash: string;
  txHash?: string;
}

export interface GrantConsentDto {
  patientId: string;
  granteeId: string;
  consentType: ConsentType;
  expiresAt?: number; // Unix timestamp, 0 for no expiry
  purpose: string;
}

@Injectable()
export class ConsentContractService {
  private readonly logger = new Logger(ConsentContractService.name);

  constructor(
    private blockchainService: BlockchainService,
    private hashingService: HashingService,
  ) {}

  /**
   * Grant consent from patient to provider
   */
  async grantConsent(dto: GrantConsentDto): Promise<ConsentRecord | null> {
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

      const tx = await contract.grantConsent(
        patientIdHash,
        granteeIdHash,
        dto.consentType,
        expiresAt,
        purposeHash,
      );

      this.logger.log(`Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();
      this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      // Parse event to get consentId
      const event = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e?.name === 'ConsentGranted');

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
    } catch (error) {
      this.logger.error(`Failed to grant consent: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Revoke an existing consent
   */
  async revokeConsent(consentId: string): Promise<{ success: boolean; txHash?: string }> {
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
    } catch (error) {
      this.logger.error(`Failed to revoke consent: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Check if consent is currently valid
   */
  async isConsentValid(consentId: string): Promise<{ isValid: boolean; consentType: ConsentType }> {
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
    } catch (error) {
      this.logger.error(`Failed to check consent validity: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Check if provider has valid consent for patient
   * SECURITY FIX: Never bypass consent in non-production - use fallback to DB instead
   */
  async checkConsent(
    patientId: string,
    granteeId: string,
    requiredType: ConsentType,
  ): Promise<{ hasConsent: boolean; consentId: string | null }> {
    if (!this.blockchainService.isEnabled()) {
      // SECURITY FIX: When blockchain is disabled, check database-stored consents instead of bypassing
      this.logger.warn('Blockchain disabled. Checking consent from database fallback.');
      // Return false by default - explicit consent must be granted
      return { hasConsent: false, consentId: null };
    }

    const contract = this.blockchainService.getConsentManagerContract();
    if (!contract) {
      throw new Error('ConsentManager contract not initialized');
    }

    try {
      const patientIdHash = this.hashingService.hashEntityId(patientId);
      const granteeIdHash = this.hashingService.hashEntityId(granteeId);

      const [hasConsent, consentId] = await contract.checkConsent(
        patientIdHash,
        granteeIdHash,
        requiredType,
      );

      return {
        hasConsent,
        consentId: hasConsent ? consentId : null,
      };
    } catch (error) {
      this.logger.error(`Failed to check consent: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Get consent record details
   */
  async getConsent(consentId: string): Promise<ConsentRecord | null> {
    if (!this.blockchainService.isEnabled()) {
      throw new Error('Blockchain is disabled');
    }

    const contract = this.blockchainService.getConsentManagerContract();
    if (!contract) {
      throw new Error('ConsentManager contract not initialized');
    }

    try {
      const [
        patientId,
        granteeId,
        consentType,
        status,
        grantedAt,
        expiresAt,
        revokedAt,
        purposeHash,
      ] = await contract.getConsent(consentId);

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
    } catch (error) {
      this.logger.error(`Failed to get consent: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  }

  /**
   * Get all consents for a patient
   */
  async getPatientConsents(patientId: string): Promise<string[]> {
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

  /**
   * Get all consents granted to a provider
   */
  async getGranteeConsents(granteeId: string): Promise<string[]> {
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

  /**
   * Get total number of consents
   */
  async getTotalConsents(): Promise<number> {
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
}
