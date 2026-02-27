import { BlockchainService } from '../blockchain.service';
import { HashingService } from '../hashing.service';
export declare enum ConsentType {
    FULL_ACCESS = 0,
    PRESCRIPTION_ONLY = 1,
    APPOINTMENT_ONLY = 2,
    LAB_RESULTS_ONLY = 3,
    EMERGENCY_ONLY = 4,
    INSURANCE_SHARING = 5,
    RESEARCH_PARTICIPATION = 6
}
export declare enum ConsentStatus {
    PENDING = 0,
    GRANTED = 1,
    REVOKED = 2,
    EXPIRED = 3
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
    expiresAt?: number;
    purpose: string;
}
export declare class ConsentContractService {
    private blockchainService;
    private hashingService;
    private readonly logger;
    constructor(blockchainService: BlockchainService, hashingService: HashingService);
    grantConsent(dto: GrantConsentDto): Promise<ConsentRecord | null>;
    revokeConsent(consentId: string): Promise<{
        success: boolean;
        txHash?: string;
    }>;
    isConsentValid(consentId: string): Promise<{
        isValid: boolean;
        consentType: ConsentType;
    }>;
    checkConsent(patientId: string, granteeId: string, requiredType: ConsentType): Promise<{
        hasConsent: boolean;
        consentId: string | null;
    }>;
    getConsent(consentId: string): Promise<ConsentRecord | null>;
    getPatientConsents(patientId: string): Promise<string[]>;
    getGranteeConsents(granteeId: string): Promise<string[]>;
    getTotalConsents(): Promise<number>;
}
