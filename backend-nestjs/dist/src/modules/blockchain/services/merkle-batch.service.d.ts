import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CanonicalHashService } from './canonical-hash.service';
import { VersionTrackingService } from './version-tracking.service';
import { BlockchainService } from '../blockchain.service';
export type BatchStatus = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
export declare class MerkleBatchService implements OnModuleInit {
    private readonly prisma;
    private readonly hashService;
    private readonly versionService;
    private readonly blockchainService;
    private readonly logger;
    private batchInterval;
    private isProcessing;
    private readonly BATCH_SIZE;
    private readonly BATCH_INTERVAL_MS;
    private readonly MIN_BATCH_SIZE;
    constructor(prisma: PrismaService, hashService: CanonicalHashService, versionService: VersionTrackingService, blockchainService: BlockchainService);
    onModuleInit(): void;
    startBatchProcessor(): void;
    stopBatchProcessor(): void;
    processPendingBatch(): Promise<{
        processed: boolean;
        batchId?: string;
        recordCount?: number;
        merkleRoot?: string;
    }>;
    buildMerkleTree(hashes: string[]): {
        root: string;
        proofs: Map<number, string[]>;
    };
    private hashPair;
    private generateProof;
    verifyProof(leafHash: string, proof: string[], root: string): boolean;
    private storeMerkleProofs;
    private submitBatchToBlockchain;
    verifyRecordProof(entityType: string, entityId: string, versionNumber?: number): Promise<{
        verified: boolean;
        version: number;
        batchId: string | null;
        merkleRoot: string | null;
        blockNumber: number | null;
        txHash: string | null;
        chainIntact: boolean;
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
    }) | null>;
    getBatchStatistics(): Promise<{
        totalBatches: number;
        pendingBatches: number;
        submittedBatches: number;
        confirmedBatches: number;
        failedBatches: number;
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
}
