import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CanonicalHashService } from './canonical-hash.service';

/**
 * Entity types that support version tracking
 */
export type VersionedEntityType = 'patient' | 'prescription' | 'medicalRecord' | 'appointment';

/**
 * Change types for version tracking
 */
export type ChangeType = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * Version Tracking Service
 * 
 * Implements Layer 2 of the hashing strategy:
 * - Creates version entries for entity changes
 * - Links versions via previousHash (H1→H2→H3)
 * - Provides version history and verification
 */
@Injectable()
export class VersionTrackingService {
  private readonly logger = new Logger(VersionTrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: CanonicalHashService,
  ) {}

  // ============================================
  // VERSION CREATION
  // ============================================

  /**
   * Create a new version entry for an entity
   * 
   * @param entityType - Type of entity (patient, prescription, etc.)
   * @param entityId - ID of the entity
   * @param recordData - Current data of the record
   * @param createdBy - User ID who made the change
   * @param changeType - CREATE, UPDATE, or DELETE
   * @returns Created RecordVersion
   */
  async createVersion(
    entityType: VersionedEntityType,
    entityId: string,
    recordData: Record<string, unknown>,
    createdBy: string,
    changeType: ChangeType = 'UPDATE',
  ) {
    // Get the latest version to link to
    const latestVersion = await this.getLatestVersion(entityType, entityId);
    
    // Calculate new version number
    const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;
    
    // Calculate record hash (Layer 1)
    const recordHash = this.hashRecord(entityType, recordData);
    
    // Get previous version hash (null for first version)
    const previousHash = latestVersion?.versionHash || null;
    
    // Calculate version hash (Layer 2)
    const now = new Date();
    const versionHash = this.hashService.createVersionHash(
      recordHash,
      previousHash,
      now,
    );

    // Create the version entry
    const version = await this.prisma.recordVersion.create({
      data: {
        entityType,
        entityId,
        version: newVersionNumber,
        recordHash,
        previousHash,
        versionHash,
        createdBy,
        changeType,
        createdAt: now,
      },
    });

    this.logger.log(
      `Created version ${newVersionNumber} for ${entityType}:${entityId} - hash: ${versionHash.slice(0, 10)}...`,
    );

    return version;
  }

  /**
   * Hash a record based on entity type
   */
  private hashRecord(entityType: VersionedEntityType, recordData: Record<string, unknown>): string {
    switch (entityType) {
      case 'patient':
        return this.hashService.hashPatient(recordData as any);
      case 'prescription':
        return this.hashService.hashPrescription(recordData as any);
      case 'medicalRecord':
        return this.hashService.hashMedicalRecord(recordData as any);
      case 'appointment':
        return this.hashService.hashAppointment(recordData as any);
      default:
        return this.hashService.hash(recordData);
    }
  }

  // ============================================
  // VERSION RETRIEVAL
  // ============================================

  /**
   * Get the latest version for an entity
   */
  async getLatestVersion(entityType: VersionedEntityType, entityId: string) {
    return this.prisma.recordVersion.findFirst({
      where: { entityType, entityId },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * Get complete version history for an entity
   */
  async getVersionHistory(entityType: VersionedEntityType, entityId: string) {
    return this.prisma.recordVersion.findMany({
      where: { entityType, entityId },
      orderBy: { version: 'asc' },
      include: {
        merkleProof: true, // Include blockchain proof if available
      },
    });
  }

  /**
   * Get a specific version by version number
   */
  async getVersion(entityType: VersionedEntityType, entityId: string, versionNumber: number) {
    return this.prisma.recordVersion.findUnique({
      where: {
        entityType_entityId_version: {
          entityType,
          entityId,
          version: versionNumber,
        },
      },
      include: {
        merkleProof: {
          include: {
            batch: true,
          },
        },
      },
    });
  }

  /**
   * Get all unsubmitted versions (for batch collection)
   */
  async getUnsubmittedVersions(limit = 100) {
    return this.prisma.recordVersion.findMany({
      where: {
        batchId: null,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  // ============================================
  // VERSION CHAIN VERIFICATION
  // ============================================

  /**
   * Verify the entire version chain for an entity
   * Checks that H1→H2→H3 chain is intact
   */
  async verifyVersionChain(entityType: VersionedEntityType, entityId: string): Promise<{
    valid: boolean;
    totalVersions: number;
    brokenAt?: number;
    error?: string;
  }> {
    const versions = await this.getVersionHistory(entityType, entityId);
    
    if (versions.length === 0) {
      return { valid: true, totalVersions: 0 };
    }

    // First version should have no previousHash
    if (versions[0].previousHash !== null) {
      return {
        valid: false,
        totalVersions: versions.length,
        brokenAt: 1,
        error: 'First version should not have previousHash',
      };
    }

    // Verify each subsequent version links to the previous
    for (let i = 1; i < versions.length; i++) {
      const current = versions[i];
      const previous = versions[i - 1];

      if (current.previousHash !== previous.versionHash) {
        return {
          valid: false,
          totalVersions: versions.length,
          brokenAt: i + 1,
          error: `Version ${i + 1} previousHash does not match version ${i} versionHash`,
        };
      }
    }

    return { valid: true, totalVersions: versions.length };
  }

  /**
   * Verify a specific version's record hash matches actual data
   */
  async verifyVersionData(
    entityType: VersionedEntityType,
    entityId: string,
    versionNumber: number,
    currentData: Record<string, unknown>,
  ): Promise<{
    valid: boolean;
    expectedHash: string;
    actualHash: string;
  }> {
    const version = await this.getVersion(entityType, entityId, versionNumber);
    
    if (!version) {
      throw new Error(`Version ${versionNumber} not found for ${entityType}:${entityId}`);
    }

    const actualHash = this.hashRecord(entityType, currentData);

    return {
      valid: version.recordHash === actualHash,
      expectedHash: version.recordHash,
      actualHash,
    };
  }

  // ============================================
  // BATCH ASSIGNMENT
  // ============================================

  /**
   * Assign versions to a batch (called by Merkle batch service)
   */
  async assignVersionsToBatch(versionIds: string[], batchId: string) {
    await this.prisma.recordVersion.updateMany({
      where: { id: { in: versionIds } },
      data: { batchId },
    });

    this.logger.log(`Assigned ${versionIds.length} versions to batch ${batchId}`);
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get version statistics
   */
  async getStatistics() {
    const [totalVersions, pendingVersions, versionsByType] = await Promise.all([
      this.prisma.recordVersion.count(),
      this.prisma.recordVersion.count({ where: { batchId: null } }),
      this.prisma.recordVersion.groupBy({
        by: ['entityType'],
        _count: true,
      }),
    ]);

    return {
      totalVersions,
      pendingVersions,
      submittedVersions: totalVersions - pendingVersions,
      byEntityType: versionsByType.reduce((acc: Record<string, number>, item: any) => {
        acc[item.entityType] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
