import { BlockchainService } from '../blockchain.service';
import { HashingService } from '../hashing.service';
export declare enum AuditActionType {
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
    EMERGENCY_ACCESS = 14
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
export declare class AuditLogContractService {
    private blockchainService;
    private hashingService;
    private readonly logger;
    constructor(blockchainService: BlockchainService, hashingService: HashingService);
    createAuditEntry(dto: CreateAuditEntryDto): Promise<AuditEntry | null>;
    createBatchAuditEntries(entries: CreateAuditEntryDto[]): Promise<string[] | null>;
    verifyRecordIntegrity(entryId: string, currentData: unknown): Promise<{
        isValid: boolean;
        originalHash: string;
        currentHash: string;
        timestamp: number;
    }>;
    getAuditEntry(entryId: string): Promise<AuditEntry | null>;
    getEntityHistory(entityId: string): Promise<string[]>;
    getTotalEntries(): Promise<number>;
}
