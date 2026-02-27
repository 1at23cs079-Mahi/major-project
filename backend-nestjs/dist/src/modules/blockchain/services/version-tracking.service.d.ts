import { PrismaService } from '@common/prisma/prisma.service';
import { CanonicalHashService } from './canonical-hash.service';
export type VersionedEntityType = 'patient' | 'prescription' | 'medicalRecord' | 'appointment';
export type ChangeType = 'CREATE' | 'UPDATE' | 'DELETE';
export declare class VersionTrackingService {
    private readonly prisma;
    private readonly hashService;
    private readonly logger;
    constructor(prisma: PrismaService, hashService: CanonicalHashService);
    createVersion(entityType: VersionedEntityType, entityId: string, recordData: Record<string, unknown>, createdBy: string, changeType?: ChangeType): Promise<{
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        version: number;
        recordHash: string;
        previousHash: string | null;
        versionHash: string;
        createdBy: string;
        changeType: string;
        batchId: string | null;
    }>;
    private hashRecord;
    getLatestVersion(entityType: VersionedEntityType, entityId: string): Promise<{
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        version: number;
        recordHash: string;
        previousHash: string | null;
        versionHash: string;
        createdBy: string;
        changeType: string;
        batchId: string | null;
    } | null>;
    getVersionHistory(entityType: VersionedEntityType, entityId: string): Promise<({
        merkleProof: {
            id: string;
            createdAt: Date;
            batchId: string;
            versionId: string;
            leafHash: string;
            proof: string;
            leafIndex: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        version: number;
        recordHash: string;
        previousHash: string | null;
        versionHash: string;
        createdBy: string;
        changeType: string;
        batchId: string | null;
    })[]>;
    getVersion(entityType: VersionedEntityType, entityId: string, versionNumber: number): Promise<({
        merkleProof: ({
            batch: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            batchId: string;
            versionId: string;
            leafHash: string;
            proof: string;
            leafIndex: number;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        version: number;
        recordHash: string;
        previousHash: string | null;
        versionHash: string;
        createdBy: string;
        changeType: string;
        batchId: string | null;
    }) | null>;
    getUnsubmittedVersions(limit?: number): Promise<{
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        version: number;
        recordHash: string;
        previousHash: string | null;
        versionHash: string;
        createdBy: string;
        changeType: string;
        batchId: string | null;
    }[]>;
    verifyVersionChain(entityType: VersionedEntityType, entityId: string): Promise<{
        valid: boolean;
        totalVersions: number;
        brokenAt?: number;
        error?: string;
    }>;
    verifyVersionData(entityType: VersionedEntityType, entityId: string, versionNumber: number, currentData: Record<string, unknown>): Promise<{
        valid: boolean;
        expectedHash: string;
        actualHash: string;
    }>;
    assignVersionsToBatch(versionIds: string[], batchId: string): Promise<void>;
    getStatistics(): Promise<{
        totalVersions: number;
        pendingVersions: number;
        submittedVersions: number;
        byEntityType: Record<string, number>;
    }>;
}
