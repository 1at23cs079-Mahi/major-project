import { BlockchainService } from './blockchain.service';
import { BlockchainVerificationService, VerificationResult } from './verification.service';
import { AuditLogContractService, AuditActionType } from './contracts/audit-log.contract';
import { ConsentContractService } from './contracts/consent.contract';
import { PrescriptionContractService } from './contracts/prescription.contract';
import { CanonicalHashService } from './services/canonical-hash.service';
import { VersionTrackingService } from './services/version-tracking.service';
import { MerkleBatchService } from './services/merkle-batch.service';
declare class GrantConsentDto {
    patientId: string;
    granteeId: string;
    consentType: number;
    expiresAt?: number;
    purpose: string;
}
declare class RevokeConsentDto {
    consentId: string;
}
declare class CheckConsentDto {
    patientId: string;
    granteeId: string;
    requiredType: number;
}
export declare class BlockchainController {
    private blockchainService;
    private verificationService;
    private auditLogContract;
    private consentContract;
    private prescriptionContract;
    private canonicalHashService;
    private versionTrackingService;
    private merkleBatchService;
    constructor(blockchainService: BlockchainService, verificationService: BlockchainVerificationService, auditLogContract: AuditLogContractService, consentContract: ConsentContractService, prescriptionContract: PrescriptionContractService, canonicalHashService: CanonicalHashService, versionTrackingService: VersionTrackingService, merkleBatchService: MerkleBatchService);
    getHealth(): Promise<{
        enabled: boolean;
        connected: boolean;
        network?: string;
        chainId?: number;
        blockNumber?: number;
        walletAddress?: string;
        balance?: string;
    }>;
    getStatus(): Promise<{
        statistics: {
            auditEntries: number;
            consents: number;
            prescriptions: {
                total: number;
                filled: number;
            };
        };
        enabled: boolean;
        connected: boolean;
        network?: string;
        chainId?: number;
        blockNumber?: number;
        walletAddress?: string;
        balance?: string;
    }>;
    verifyRecord(type: string, id: string): Promise<VerificationResult>;
    verifyPatient(id: string): Promise<VerificationResult>;
    verifyPrescription(id: string): Promise<VerificationResult>;
    verifyAppointment(id: string): Promise<VerificationResult>;
    verifyMedicalRecord(id: string): Promise<VerificationResult>;
    getAuditTotal(): Promise<{
        totalEntries: number;
    }>;
    getAuditEntry(entryId: string): Promise<{
        error: string;
    } | {
        actionTypeName: string;
        timestampReadable: string;
        entryId: string;
        recordHash: string;
        entityId: string;
        actionType: AuditActionType;
        timestamp: number;
        actor: string;
        actorId: string;
        previousHash: string;
        txHash?: string;
        error?: undefined;
    }>;
    getEntityAuditHistory(entityId: string): Promise<{
        entityId: string;
        totalEntries: number;
        entryIds: string[];
    }>;
    grantConsent(dto: GrantConsentDto): Promise<{
        success: boolean;
        consent: import("./contracts/consent.contract").ConsentRecord | null;
    }>;
    revokeConsent(dto: RevokeConsentDto): Promise<{
        success: boolean;
        txHash?: string;
    }>;
    checkConsent(dto: CheckConsentDto): Promise<{
        requiredTypeName: string;
        hasConsent: boolean;
        consentId: string | null;
    }>;
    getConsent(consentId: string): Promise<import("./contracts/consent.contract").ConsentRecord | null>;
    getPatientConsents(patientId: string): Promise<{
        patientId: string;
        totalConsents: number;
        consentIds: string[];
    }>;
    getPrescriptionBlockchain(prescriptionId: string): Promise<import("./contracts/prescription.contract").PrescriptionBlockchainRecord | null>;
    getPrescriptionRefills(prescriptionId: string): Promise<{
        prescriptionId: string;
        remainingRefills: number;
    }>;
    getPrescriptionStats(): Promise<{
        total: number;
        filled: number;
    }>;
    getVersionHistory(entityType: string, entityId: string): Promise<{
        entityType: string;
        entityId: string;
        totalVersions: number;
        versions: {
            version: any;
            recordHash: any;
            previousHash: any;
            versionHash: any;
            changeType: any;
            createdBy: any;
            createdAt: any;
            batchId: any;
            hasBlockchainProof: boolean;
        }[];
    }>;
    getVersion(entityType: string, entityId: string, version: string): Promise<any>;
    verifyVersionChain(entityType: string, entityId: string): Promise<{
        valid: boolean;
        totalVersions: number;
        brokenAt?: number;
        error?: string;
    }>;
    getVersionStats(): Promise<{
        totalVersions: number;
        pendingVersions: number;
        submittedVersions: number;
        byEntityType: Record<string, number>;
    }>;
    getBatchStats(): Promise<{
        totalBatches: number;
        pendingBatches: number;
        submittedBatches: number;
        confirmedBatches: number;
        failedBatches: number;
    }>;
    getBatch(batchId: string): Promise<({
        versions: {
            id: string;
            entityType: string;
            entityId: string;
            version: number;
            versionHash: string;
        }[];
        merkleProofs: {
            versionId: string;
            leafIndex: number;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        txHash: string | null;
        batchNumber: number;
        merkleRoot: string;
        recordCount: number;
        entityTypes: string;
        blockNumber: number | null;
        gasUsed: string | null;
        submittedAt: Date | null;
        confirmedAt: Date | null;
        errorMessage: string | null;
    }) | {
        error: string;
    }>;
    processBatch(): Promise<{
        processed: boolean;
        batchId?: string;
        recordCount?: number;
        merkleRoot?: string;
    }>;
    retryFailedBatches(): Promise<({
        batchId: string;
        success: boolean;
        error?: undefined;
    } | {
        batchId: string;
        success: boolean;
        error: string;
    })[]>;
    verifyBlockchainProof(entityType: string, entityId: string, version?: string): Promise<{
        status: string;
        verified: boolean;
        version: number;
        batchId: string | null;
        merkleRoot: string | null;
        blockNumber: number | null;
        txHash: string | null;
        chainIntact: boolean;
        entityType: string;
        entityId: string;
    }>;
    testHash(data: Record<string, unknown>): Promise<{
        error: string;
        original?: undefined;
        canonical?: undefined;
        hash?: undefined;
    } | {
        original: Record<string, unknown>;
        canonical: string;
        hash: string;
        error?: undefined;
    }>;
}
export {};
