import { BlockchainService } from '../blockchain.service';
import { HashingService } from '../hashing.service';
export declare enum BlockchainPrescriptionStatus {
    ACTIVE = 0,
    FILLED = 1,
    PARTIALLY_FILLED = 2,
    CANCELLED = 3,
    EXPIRED = 4
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
    validUntil: number;
    refillsAllowed: number;
}
export declare class PrescriptionContractService {
    private blockchainService;
    private hashingService;
    private readonly logger;
    constructor(blockchainService: BlockchainService, hashingService: HashingService);
    registerPrescription(dto: RegisterPrescriptionDto): Promise<PrescriptionBlockchainRecord | null>;
    fillPrescription(prescriptionId: string, pharmacyId: string, currentPrescriptionData: unknown): Promise<{
        success: boolean;
        txHash?: string;
    }>;
    refillPrescription(prescriptionId: string, pharmacyId: string): Promise<{
        success: boolean;
        txHash?: string;
    }>;
    cancelPrescription(prescriptionId: string): Promise<{
        success: boolean;
        txHash?: string;
    }>;
    verifyPrescription(prescriptionId: string, currentPrescriptionData: {
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
    }): Promise<{
        isValid: boolean;
        status: BlockchainPrescriptionStatus;
        originalHash: string;
        currentHash: string;
        validUntil: number;
    }>;
    getPrescription(prescriptionId: string): Promise<PrescriptionBlockchainRecord | null>;
    getRemainingRefills(prescriptionId: string): Promise<number>;
    getStats(): Promise<{
        total: number;
        filled: number;
    }>;
}
