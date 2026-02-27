import { PrismaService } from '@common/prisma/prisma.service';
import { HashingService } from './hashing.service';
import { AuditLogContractService } from './contracts/audit-log.contract';
import { PrescriptionContractService } from './contracts/prescription.contract';
export interface VerificationResult {
    entityType: string;
    entityId: string;
    verified: boolean;
    blockchainHash?: string;
    currentHash?: string;
    timestamp?: number;
    message: string;
    details?: Record<string, unknown>;
}
export declare class BlockchainVerificationService {
    private prisma;
    private hashingService;
    private auditLogContract;
    private prescriptionContract;
    private readonly logger;
    constructor(prisma: PrismaService, hashingService: HashingService, auditLogContract: AuditLogContractService, prescriptionContract: PrescriptionContractService);
    verifyPatient(patientId: string): Promise<VerificationResult>;
    verifyPrescription(prescriptionId: string): Promise<VerificationResult>;
    verifyAppointment(appointmentId: string): Promise<VerificationResult>;
    verifyMedicalRecord(recordId: string): Promise<VerificationResult>;
    verify(type: string, id: string): Promise<VerificationResult>;
}
