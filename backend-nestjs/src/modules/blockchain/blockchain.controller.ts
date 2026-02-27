import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { BlockchainService } from './blockchain.service';
import { BlockchainVerificationService, VerificationResult } from './verification.service';
import { AuditLogContractService, AuditActionType } from './contracts/audit-log.contract';
import { ConsentContractService, ConsentType } from './contracts/consent.contract';
import { PrescriptionContractService } from './contracts/prescription.contract';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';

// Import production-grade services
import { CanonicalHashService } from './services/canonical-hash.service';
import { VersionTrackingService, VersionedEntityType } from './services/version-tracking.service';
import { MerkleBatchService } from './services/merkle-batch.service';

// DTOs
class GrantConsentDto {
  @ApiProperty() @IsString()
  patientId!: string;
  
  @ApiProperty() @IsString()
  granteeId!: string;
  
  @ApiProperty() @IsNumber()
  consentType!: number;
  
  @ApiProperty({ required: false }) @IsOptional() @IsNumber()
  expiresAt?: number;
  
  @ApiProperty() @IsString()
  purpose!: string;
}

class RevokeConsentDto {
  @ApiProperty() @IsString()
  consentId!: string;
}

class CheckConsentDto {
  @ApiProperty() @IsString()
  patientId!: string;
  
  @ApiProperty() @IsString()
  granteeId!: string;
  
  @ApiProperty() @IsNumber()
  requiredType!: number;
}

@ApiTags('Blockchain')
@Controller('blockchain')
@UseGuards(JwtAuthGuard) // SECURITY FIX: Require authentication for all blockchain endpoints
@ApiBearerAuth('JWT-auth')
export class BlockchainController {
  constructor(
    private blockchainService: BlockchainService,
    private verificationService: BlockchainVerificationService,
    private auditLogContract: AuditLogContractService,
    private consentContract: ConsentContractService,
    private prescriptionContract: PrescriptionContractService,
    // Production-grade services
    private canonicalHashService: CanonicalHashService,
    private versionTrackingService: VersionTrackingService,
    private merkleBatchService: MerkleBatchService,
  ) {}

  // ============================================
  // Health & Status Endpoints
  // ============================================

  @Get('health')
  @Public() // Health check can be public for monitoring
  @ApiOperation({ summary: 'Check blockchain connection health' })
  @ApiResponse({ status: 200, description: 'Blockchain health status' })
  async getHealth() {
    return this.blockchainService.healthCheck();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get blockchain module status' })
  @ApiResponse({ status: 200, description: 'Blockchain status and statistics' })
  async getStatus() {
    const health = await this.blockchainService.healthCheck();
    
    let auditStats = { totalEntries: 0 };
    let consentStats = { totalConsents: 0 };
    let prescriptionStats = { total: 0, filled: 0 };

    if (health.connected) {
      try {
        auditStats.totalEntries = await this.auditLogContract.getTotalEntries();
        consentStats.totalConsents = await this.consentContract.getTotalConsents();
        prescriptionStats = await this.prescriptionContract.getStats();
      } catch (error) {
        // Contracts might not be deployed yet
      }
    }

    return {
      ...health,
      statistics: {
        auditEntries: auditStats.totalEntries,
        consents: consentStats.totalConsents,
        prescriptions: prescriptionStats,
      },
    };
  }

  // ============================================
  // Verification Endpoints
  // ============================================

  @Get('verify/:type/:id')
  @ApiOperation({ summary: 'Verify record integrity against blockchain' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  async verifyRecord(
    @Param('type') type: string,
    @Param('id') id: string,
  ): Promise<VerificationResult> {
    return this.verificationService.verify(type, id);
  }

  @Get('verify/patient/:id')
  @ApiOperation({ summary: 'Verify patient record integrity' })
  @ApiResponse({ status: 200, description: 'Patient verification result' })
  async verifyPatient(@Param('id') id: string): Promise<VerificationResult> {
    return this.verificationService.verifyPatient(id);
  }

  @Get('verify/prescription/:id')
  @ApiOperation({ summary: 'Verify prescription authenticity' })
  @ApiResponse({ status: 200, description: 'Prescription verification result' })
  async verifyPrescription(@Param('id') id: string): Promise<VerificationResult> {
    return this.verificationService.verifyPrescription(id);
  }

  @Get('verify/appointment/:id')
  @ApiOperation({ summary: 'Verify appointment record integrity' })
  @ApiResponse({ status: 200, description: 'Appointment verification result' })
  async verifyAppointment(@Param('id') id: string): Promise<VerificationResult> {
    return this.verificationService.verifyAppointment(id);
  }

  @Get('verify/medical-record/:id')
  @ApiOperation({ summary: 'Verify medical record integrity' })
  @ApiResponse({ status: 200, description: 'Medical record verification result' })
  async verifyMedicalRecord(@Param('id') id: string): Promise<VerificationResult> {
    return this.verificationService.verifyMedicalRecord(id);
  }

  // ============================================
  // Audit Log Endpoints
  // ============================================

  @Get('audit/total')
  @ApiOperation({ summary: 'Get total audit entries count' })
  @ApiResponse({ status: 200, description: 'Total audit entries' })
  async getAuditTotal() {
    const total = await this.auditLogContract.getTotalEntries();
    return { totalEntries: total };
  }

  @Get('audit/entry/:entryId')
  @ApiOperation({ summary: 'Get audit entry details' })
  @ApiResponse({ status: 200, description: 'Audit entry details' })
  async getAuditEntry(@Param('entryId') entryId: string) {
    const entry = await this.auditLogContract.getAuditEntry(entryId);
    if (!entry) {
      return { error: 'Audit entry not found' };
    }

    // Map action type to readable name
    const actionNames: Record<number, string> = {
      [AuditActionType.PATIENT_CREATED]: 'PATIENT_CREATED',
      [AuditActionType.PATIENT_UPDATED]: 'PATIENT_UPDATED',
      [AuditActionType.PRESCRIPTION_CREATED]: 'PRESCRIPTION_CREATED',
      [AuditActionType.PRESCRIPTION_FILLED]: 'PRESCRIPTION_FILLED',
      [AuditActionType.PRESCRIPTION_CANCELLED]: 'PRESCRIPTION_CANCELLED',
      [AuditActionType.APPOINTMENT_CREATED]: 'APPOINTMENT_CREATED',
      [AuditActionType.APPOINTMENT_UPDATED]: 'APPOINTMENT_UPDATED',
      [AuditActionType.APPOINTMENT_CANCELLED]: 'APPOINTMENT_CANCELLED',
      [AuditActionType.MEDICAL_RECORD_CREATED]: 'MEDICAL_RECORD_CREATED',
      [AuditActionType.MEDICAL_RECORD_UPDATED]: 'MEDICAL_RECORD_UPDATED',
      [AuditActionType.CONSENT_GRANTED]: 'CONSENT_GRANTED',
      [AuditActionType.CONSENT_REVOKED]: 'CONSENT_REVOKED',
      [AuditActionType.ACCESS_GRANTED]: 'ACCESS_GRANTED',
      [AuditActionType.ACCESS_REVOKED]: 'ACCESS_REVOKED',
      [AuditActionType.EMERGENCY_ACCESS]: 'EMERGENCY_ACCESS',
    };

    return {
      ...entry,
      actionTypeName: actionNames[entry.actionType] || 'UNKNOWN',
      timestampReadable: new Date(entry.timestamp * 1000).toISOString(),
    };
  }

  @Get('audit/entity/:entityId')
  @ApiOperation({ summary: 'Get audit history for an entity' })
  @ApiResponse({ status: 200, description: 'Entity audit history' })
  async getEntityAuditHistory(@Param('entityId') entityId: string) {
    const entryIds = await this.auditLogContract.getEntityHistory(entityId);
    return {
      entityId,
      totalEntries: entryIds.length,
      entryIds,
    };
  }

  // ============================================
  // Consent Management Endpoints
  // ============================================

  @Post('consent/grant')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grant consent from patient to provider' })
  @ApiResponse({ status: 201, description: 'Consent granted' })
  async grantConsent(@Body() dto: GrantConsentDto) {
    const result = await this.consentContract.grantConsent({
      patientId: dto.patientId,
      granteeId: dto.granteeId,
      consentType: dto.consentType as ConsentType,
      expiresAt: dto.expiresAt,
      purpose: dto.purpose,
    });

    return {
      success: !!result,
      consent: result,
    };
  }

  @Post('consent/revoke')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke an existing consent' })
  @ApiResponse({ status: 200, description: 'Consent revoked' })
  async revokeConsent(@Body() dto: RevokeConsentDto) {
    return this.consentContract.revokeConsent(dto.consentId);
  }

  @Post('consent/check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if provider has valid consent' })
  @ApiResponse({ status: 200, description: 'Consent check result' })
  async checkConsent(@Body() dto: CheckConsentDto) {
    const result = await this.consentContract.checkConsent(
      dto.patientId,
      dto.granteeId,
      dto.requiredType as ConsentType,
    );

    const consentTypeNames: Record<number, string> = {
      [ConsentType.FULL_ACCESS]: 'FULL_ACCESS',
      [ConsentType.PRESCRIPTION_ONLY]: 'PRESCRIPTION_ONLY',
      [ConsentType.APPOINTMENT_ONLY]: 'APPOINTMENT_ONLY',
      [ConsentType.LAB_RESULTS_ONLY]: 'LAB_RESULTS_ONLY',
      [ConsentType.EMERGENCY_ONLY]: 'EMERGENCY_ONLY',
      [ConsentType.INSURANCE_SHARING]: 'INSURANCE_SHARING',
      [ConsentType.RESEARCH_PARTICIPATION]: 'RESEARCH_PARTICIPATION',
    };

    return {
      ...result,
      requiredTypeName: consentTypeNames[dto.requiredType] || 'UNKNOWN',
    };
  }

  @Get('consent/:consentId')
  @ApiOperation({ summary: 'Get consent record details' })
  @ApiResponse({ status: 200, description: 'Consent details' })
  async getConsent(@Param('consentId') consentId: string) {
    return this.consentContract.getConsent(consentId);
  }

  @Get('consent/patient/:patientId')
  @ApiOperation({ summary: 'Get all consents for a patient' })
  @ApiResponse({ status: 200, description: 'Patient consents' })
  async getPatientConsents(@Param('patientId') patientId: string) {
    const consentIds = await this.consentContract.getPatientConsents(patientId);
    return {
      patientId,
      totalConsents: consentIds.length,
      consentIds,
    };
  }

  // ============================================
  // Prescription Blockchain Endpoints
  // ============================================

  @Get('prescription/:prescriptionId')
  @ApiOperation({ summary: 'Get prescription blockchain record' })
  @ApiResponse({ status: 200, description: 'Prescription blockchain details' })
  async getPrescriptionBlockchain(@Param('prescriptionId') prescriptionId: string) {
    return this.prescriptionContract.getPrescription(prescriptionId);
  }

  @Get('prescription/:prescriptionId/refills')
  @ApiOperation({ summary: 'Get remaining refills for prescription' })
  @ApiResponse({ status: 200, description: 'Remaining refills count' })
  async getPrescriptionRefills(@Param('prescriptionId') prescriptionId: string) {
    const remaining = await this.prescriptionContract.getRemainingRefills(prescriptionId);
    return { prescriptionId, remainingRefills: remaining };
  }

  @Get('prescription/stats')
  @ApiOperation({ summary: 'Get prescription blockchain statistics' })
  @ApiResponse({ status: 200, description: 'Prescription statistics' })
  async getPrescriptionStats() {
    return this.prescriptionContract.getStats();
  }

  // ============================================
  // Version Tracking Endpoints (Production-Grade)
  // ============================================

  @Get('versions/:entityType/:entityId')
  @ApiOperation({ summary: 'Get version history for an entity' })
  @ApiResponse({ status: 200, description: 'Entity version history' })
  async getVersionHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const history = await this.versionTrackingService.getVersionHistory(
      entityType as VersionedEntityType,
      entityId,
    );
    return {
      entityType,
      entityId,
      totalVersions: history.length,
      versions: history.map((v: any) => ({
        version: v.version,
        recordHash: v.recordHash,
        previousHash: v.previousHash,
        versionHash: v.versionHash,
        changeType: v.changeType,
        createdBy: v.createdBy,
        createdAt: v.createdAt,
        batchId: v.batchId,
        hasBlockchainProof: !!v.merkleProof,
      })),
    };
  }

  @Get('versions/:entityType/:entityId/:version')
  @ApiOperation({ summary: 'Get specific version details' })
  @ApiResponse({ status: 200, description: 'Version details' })
  async getVersion(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('version') version: string,
  ) {
    const versionData = await this.versionTrackingService.getVersion(
      entityType as VersionedEntityType,
      entityId,
      parseInt(version),
    ) as any;

    if (!versionData) {
      return { error: 'Version not found' };
    }

    return {
      ...versionData,
      hasBlockchainProof: !!versionData.merkleProof,
      blockchain: versionData.merkleProof
        ? {
            batchId: versionData.merkleProof.batchId,
            merkleRoot: versionData.merkleProof.batch?.merkleRoot,
            txHash: versionData.merkleProof.batch?.txHash,
            blockNumber: versionData.merkleProof.batch?.blockNumber,
            status: versionData.merkleProof.batch?.status,
          }
        : null,
    };
  }

  @Get('versions/:entityType/:entityId/chain/verify')
  @ApiOperation({ summary: 'Verify version chain integrity' })
  @ApiResponse({ status: 200, description: 'Chain verification result' })
  async verifyVersionChain(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.versionTrackingService.verifyVersionChain(
      entityType as VersionedEntityType,
      entityId,
    );
  }

  @Get('versions/stats')
  @ApiOperation({ summary: 'Get version tracking statistics' })
  @ApiResponse({ status: 200, description: 'Version statistics' })
  async getVersionStats() {
    return this.versionTrackingService.getStatistics();
  }

  // ============================================
  // Merkle Batch Endpoints (Production-Grade)
  // ============================================

  @Get('batches/stats')
  @ApiOperation({ summary: 'Get Merkle batch statistics' })
  @ApiResponse({ status: 200, description: 'Batch statistics' })
  async getBatchStats() {
    return this.merkleBatchService.getBatchStatistics();
  }

  @Get('batches/:batchId')
  @ApiOperation({ summary: 'Get batch details' })
  @ApiResponse({ status: 200, description: 'Batch details' })
  async getBatch(@Param('batchId') batchId: string) {
    const batch = await this.merkleBatchService.getBatch(batchId);
    if (!batch) {
      return { error: 'Batch not found' };
    }
    return batch;
  }

  @Post('batches/process')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger batch processing' })
  @ApiResponse({ status: 200, description: 'Batch processing result' })
  async processBatch() {
    return this.merkleBatchService.processPendingBatch();
  }

  @Post('batches/retry-failed')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retry failed batch submissions' })
  @ApiResponse({ status: 200, description: 'Retry results' })
  async retryFailedBatches() {
    return this.merkleBatchService.retryFailedBatches();
  }

  // ============================================
  // Blockchain Proof Verification (Production-Grade)
  // ============================================

  @Get('proof/:entityType/:entityId')
  @ApiOperation({ summary: 'Verify record blockchain proof with Merkle verification' })
  @ApiResponse({ status: 200, description: 'Blockchain proof verification' })
  @ApiQuery({ name: 'version', required: false, description: 'Specific version to verify' })
  async verifyBlockchainProof(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('version') version?: string,
  ) {
    const result = await this.merkleBatchService.verifyRecordProof(
      entityType,
      entityId,
      version ? parseInt(version) : undefined,
    );

    return {
      entityType,
      entityId,
      ...result,
      status: result.verified ? 'VERIFIED_ON_BLOCKCHAIN' : 'PENDING_SUBMISSION',
    };
  }

  // ============================================
  // Hash Utilities (for testing/debugging)
  // ============================================

  @Post('hash/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test canonical hashing (development only)' })
  @ApiResponse({ status: 200, description: 'Hash result' })
  async testHash(@Body() data: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'production') {
      return { error: 'Not available in production' };
    }

    const canonical = this.canonicalHashService.canonicalize(data);
    const hash = this.canonicalHashService.hash(data);

    return {
      original: data,
      canonical,
      hash,
    };
  }
}
