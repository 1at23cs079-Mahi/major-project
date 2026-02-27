import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain.service';
import { HashingService } from '../hashing.service';

// Prescription status matching the Solidity enum
export enum BlockchainPrescriptionStatus {
  ACTIVE = 0,
  FILLED = 1,
  PARTIALLY_FILLED = 2,
  CANCELLED = 3,
  EXPIRED = 4,
}

export interface PrescriptionBlockchainRecord {
  prescriptionId: string;
  prescriptionHash: string;
  patientId: string;
  prescriberId: string;
  pharmacyId: string;
  status: BlockchainPrescriptionStatus;
  createdAt: number;
  validUntil: number;
  filledAt: number;
  refillsAllowed: number;
  refillsUsed: number;
  txHash?: string;
}

export interface RegisterPrescriptionDto {
  prescriptionId: string;
  prescriptionData: {
    id: string;
    patientId: string;
    doctorId: string;
    diagnosis?: string;
    notes?: string;
    items: Array<{
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions?: string;
    }>;
  };
  validUntil: number; // Unix timestamp
  refillsAllowed: number;
}

@Injectable()
export class PrescriptionContractService {
  private readonly logger = new Logger(PrescriptionContractService.name);

  constructor(
    private blockchainService: BlockchainService,
    private hashingService: HashingService,
  ) {}

  /**
   * Register a new prescription on blockchain
   */
  async registerPrescription(dto: RegisterPrescriptionDto): Promise<PrescriptionBlockchainRecord | null> {
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

      const tx = await contract.createPrescription(
        prescriptionIdHash,
        prescriptionHash,
        patientIdHash,
        prescriberIdHash,
        dto.validUntil,
        dto.refillsAllowed,
      );

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
    } catch (error) {
      this.logger.error(`Failed to register prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Mark prescription as filled by pharmacy
   */
  async fillPrescription(
    prescriptionId: string,
    pharmacyId: string,
    currentPrescriptionData: unknown,
  ): Promise<{ success: boolean; txHash?: string }> {
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

      const tx = await contract.fillPrescription(
        prescriptionIdHash,
        pharmacyIdHash,
        currentHash,
      );

      const receipt = await tx.wait();
      this.logger.log(`Prescription filled in block ${receipt.blockNumber}`);

      return { success: true, txHash: tx.hash };
    } catch (error) {
      this.logger.error(`Failed to fill prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Process a refill
   */
  async refillPrescription(
    prescriptionId: string,
    pharmacyId: string,
  ): Promise<{ success: boolean; txHash?: string }> {
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
    } catch (error) {
      this.logger.error(`Failed to refill prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Cancel a prescription
   */
  async cancelPrescription(prescriptionId: string): Promise<{ success: boolean; txHash?: string }> {
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
    } catch (error) {
      this.logger.error(`Failed to cancel prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Verify prescription authenticity
   */
  async verifyPrescription(
    prescriptionId: string,
    currentPrescriptionData: {
      id: string;
      patientId: string;
      doctorId: string;
      diagnosis?: string;
      notes?: string;
      items: Array<{
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
        instructions?: string;
      }>;
    },
  ): Promise<{
    isValid: boolean;
    status: BlockchainPrescriptionStatus;
    originalHash: string;
    currentHash: string;
    validUntil: number;
  }> {
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

      const [isValid, status, originalHash, validUntil] = 
        await contract.verifyPrescriptionView(prescriptionIdHash, currentHash);

      return {
        isValid,
        status: Number(status),
        originalHash,
        currentHash,
        validUntil: Number(validUntil),
      };
    } catch (error) {
      this.logger.error(`Failed to verify prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Get prescription details from blockchain
   */
  async getPrescription(prescriptionId: string): Promise<PrescriptionBlockchainRecord | null> {
    if (!this.blockchainService.isEnabled()) {
      return null;
    }

    const contract = this.blockchainService.getPrescriptionRegistryContract();
    if (!contract) {
      return null;
    }

    try {
      const prescriptionIdHash = this.hashingService.hashEntityId(prescriptionId);

      const [
        prescriptionHash,
        patientId,
        prescriberId,
        pharmacyId,
        status,
        createdAt,
        validUntil,
        filledAt,
        refillsAllowed,
        refillsUsed,
      ] = await contract.getPrescription(prescriptionIdHash);

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
    } catch (error) {
      this.logger.error(`Failed to get prescription: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  }

  /**
   * Get remaining refills for a prescription
   */
  async getRemainingRefills(prescriptionId: string): Promise<number> {
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
    } catch (error) {
      this.logger.error(`Failed to get remaining refills: ${error instanceof Error ? error.message : "Unknown error"}`);
      return 0;
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{ total: number; filled: number }> {
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
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error instanceof Error ? error.message : "Unknown error"}`);
      return { total: 0, filled: 0 };
    }
  }
}
