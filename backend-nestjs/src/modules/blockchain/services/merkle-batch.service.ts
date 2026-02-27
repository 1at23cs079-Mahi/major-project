import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CanonicalHashService } from './canonical-hash.service';
import { VersionTrackingService } from './version-tracking.service';
import { BlockchainService } from '../blockchain.service';
import { createHash } from 'crypto';

/**
 * Batch status
 */
export type BatchStatus = 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';

/**
 * Merkle Batch Service
 * 
 * Implements Layer 3 of the hashing strategy:
 * - Collects pending versions into batches
 * - Builds Merkle trees for efficient verification
 * - Submits Merkle roots to blockchain
 * - Stores proofs for individual record verification
 */
@Injectable()
export class MerkleBatchService implements OnModuleInit {
  private readonly logger = new Logger(MerkleBatchService.name);
  private batchInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  // Configuration
  private readonly BATCH_SIZE = parseInt(process.env.MERKLE_BATCH_SIZE || '100');
  private readonly BATCH_INTERVAL_MS = parseInt(process.env.MERKLE_BATCH_INTERVAL_MS || '60000'); // 1 minute
  private readonly MIN_BATCH_SIZE = parseInt(process.env.MERKLE_MIN_BATCH_SIZE || '1');

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: CanonicalHashService,
    private readonly versionService: VersionTrackingService,
    private readonly blockchainService: BlockchainService,
  ) {}

  onModuleInit() {
    if (process.env.BLOCKCHAIN_ENABLED === 'true') {
      this.startBatchProcessor();
      this.logger.log(
        `Merkle batch processor started: interval=${this.BATCH_INTERVAL_MS}ms, batchSize=${this.BATCH_SIZE}`,
      );
    } else {
      this.logger.warn('Blockchain disabled - Merkle batch processor not started');
    }
  }

  // ============================================
  // BATCH PROCESSING
  // ============================================

  /**
   * Start the automatic batch processor
   */
  startBatchProcessor() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
    }

    this.batchInterval = setInterval(async () => {
      await this.processPendingBatch();
    }, this.BATCH_INTERVAL_MS);
  }

  /**
   * Stop the batch processor
   */
  stopBatchProcessor() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
      this.logger.log('Merkle batch processor stopped');
    }
  }

  /**
   * Process pending versions into a batch
   * Can be called automatically or manually
   */
  async processPendingBatch(): Promise<{
    processed: boolean;
    batchId?: string;
    recordCount?: number;
    merkleRoot?: string;
  }> {
    if (this.isProcessing) {
      this.logger.debug('Batch processing already in progress, skipping');
      return { processed: false };
    }

    this.isProcessing = true;

    try {
      // Get pending versions
      const pendingVersions = await this.versionService.getUnsubmittedVersions(this.BATCH_SIZE);

      if (pendingVersions.length < this.MIN_BATCH_SIZE) {
        this.logger.debug(
          `Not enough pending versions (${pendingVersions.length}/${this.MIN_BATCH_SIZE})`,
        );
        return { processed: false };
      }

      this.logger.log(`Processing batch with ${pendingVersions.length} versions`);

      // Build Merkle tree
      const { root, proofs } = this.buildMerkleTree(
        pendingVersions.map((v: any) => v.versionHash),
      );

      // Get unique entity types
      const entityTypes = [...new Set(pendingVersions.map((v: any) => v.entityType))];

      // Get next batch number
      const lastBatch = await this.prisma.blockchainBatch.findFirst({
        orderBy: { batchNumber: 'desc' },
      });
      const nextBatchNumber = (lastBatch?.batchNumber ?? 0) + 1;

      // Create batch record
      const batch = await this.prisma.blockchainBatch.create({
        data: {
          batchNumber: nextBatchNumber,
          merkleRoot: root,
          recordCount: pendingVersions.length,
          entityTypes: JSON.stringify(entityTypes),
          status: 'PENDING',
        },
      });

      // Assign versions to batch
      const versionIds = pendingVersions.map((v: any) => v.id);
      await this.versionService.assignVersionsToBatch(versionIds, batch.id);

      // Store Merkle proofs
      await this.storeMerkleProofs(pendingVersions, proofs, batch.id);

      // Submit to blockchain
      await this.submitBatchToBlockchain(batch.id, root);

      return {
        processed: true,
        batchId: batch.id,
        recordCount: pendingVersions.length,
        merkleRoot: root,
      };
    } catch (error) {
      this.logger.error('Batch processing failed:', error);
      return { processed: false };
    } finally {
      this.isProcessing = false;
    }
  }

  // ============================================
  // MERKLE TREE CONSTRUCTION
  // ============================================

  /**
   * Build a Merkle tree from version hashes
   * Returns root and proofs for each leaf
   */
  buildMerkleTree(hashes: string[]): {
    root: string;
    proofs: Map<number, string[]>;
  } {
    if (hashes.length === 0) {
      return { root: '0x0', proofs: new Map() };
    }

    if (hashes.length === 1) {
      return {
        root: hashes[0],
        proofs: new Map([[0, []]]),
      };
    }

    // Pad to power of 2 for balanced tree
    const leaves = [...hashes];
    while (leaves.length & (leaves.length - 1)) {
      leaves.push(leaves[leaves.length - 1]); // Duplicate last element
    }

    // Build tree bottom-up
    const tree: string[][] = [leaves];
    let currentLevel = leaves;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        const combined = this.hashPair(left, right);
        nextLevel.push(combined);
      }
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    const root = currentLevel[0];

    // Generate proofs for original hashes
    const proofs = new Map<number, string[]>();
    for (let i = 0; i < hashes.length; i++) {
      proofs.set(i, this.generateProof(i, tree));
    }

    return { root, proofs };
  }

  /**
   * Hash a pair of nodes
   */
  private hashPair(left: string, right: string): string {
    // Sort to ensure consistent ordering (left < right)
    const [a, b] = [left, right].sort();
    const combined = a.slice(2) + b.slice(2); // Remove 0x prefixes
    const hash = createHash('sha256').update(combined, 'hex').digest('hex');
    return '0x' + hash;
  }

  /**
   * Generate Merkle proof for a leaf at given index
   */
  private generateProof(leafIndex: number, tree: string[][]): string[] {
    const proof: string[] = [];
    let index = leafIndex;

    for (let level = 0; level < tree.length - 1; level++) {
      const siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
      if (siblingIndex < tree[level].length) {
        proof.push(tree[level][siblingIndex]);
      }
      index = Math.floor(index / 2);
    }

    return proof;
  }

  /**
   * Verify a Merkle proof
   */
  verifyProof(leafHash: string, proof: string[], root: string): boolean {
    let currentHash = leafHash;

    for (const sibling of proof) {
      currentHash = this.hashPair(currentHash, sibling);
    }

    return currentHash.toLowerCase() === root.toLowerCase();
  }

  // ============================================
  // PROOF STORAGE
  // ============================================

  /**
   * Store Merkle proofs for all versions in a batch
   */
  private async storeMerkleProofs(
    versions: { id: string; versionHash: string }[],
    proofs: Map<number, string[]>,
    batchId: string,
  ) {
    const proofRecords = versions.map((version, index) => ({
      versionId: version.id,
      batchId,
      leafHash: version.versionHash,
      proof: JSON.stringify(proofs.get(index) || []),
      leafIndex: index,
    }));

    await this.prisma.merkleProof.createMany({
      data: proofRecords,
    });

    this.logger.log(`Stored ${proofRecords.length} Merkle proofs for batch ${batchId}`);
  }

  // ============================================
  // BLOCKCHAIN SUBMISSION
  // ============================================

  /**
   * Submit batch Merkle root to blockchain
   */
  private async submitBatchToBlockchain(batchId: string, merkleRoot: string) {
    try {
      // Get the audit log contract
      const contract = this.blockchainService.getContract('AUDIT_LOG');
      
      if (!contract) {
        this.logger.warn('Audit log contract not available, marking batch as pending');
        return;
      }

      // Submit to blockchain (using batch audit entry)
      const tx = await contract.logBatchAuditEntry(
        merkleRoot,
        batchId,
        0, // SYSTEM action type for batch commits
      );

      // Update batch with transaction info
      await this.prisma.blockchainBatch.update({
        where: { id: batchId },
        data: {
          status: 'SUBMITTED',
          txHash: tx.hash,
          submittedAt: new Date(),
        },
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      await this.prisma.blockchainBatch.update({
        where: { id: batchId },
        data: {
          status: 'CONFIRMED',
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed?.toString(),
          confirmedAt: new Date(),
        },
      });

      this.logger.log(
        `Batch ${batchId} confirmed on blockchain - tx: ${tx.hash}, block: ${receipt.blockNumber}`,
      );
    } catch (error) {
      this.logger.error(`Failed to submit batch ${batchId} to blockchain:`, error);

      await this.prisma.blockchainBatch.update({
        where: { id: batchId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  // ============================================
  // VERIFICATION
  // ============================================

  /**
   * Verify a record's blockchain proof
   */
  async verifyRecordProof(
    entityType: string,
    entityId: string,
    versionNumber?: number,
  ): Promise<{
    verified: boolean;
    version: number;
    batchId: string | null;
    merkleRoot: string | null;
    blockNumber: number | null;
    txHash: string | null;
    chainIntact: boolean;
  }> {
    // Get the version (latest if not specified)
    const version = versionNumber
      ? await this.versionService.getVersion(entityType as any, entityId, versionNumber)
      : await this.versionService.getLatestVersion(entityType as any, entityId);

    if (!version) {
      throw new Error(`Version not found for ${entityType}:${entityId}`);
    }

    // Verify the version chain first
    const chainVerification = await this.versionService.verifyVersionChain(
      entityType as any,
      entityId,
    );

    // Get Merkle proof
    const merkleProof = await this.prisma.merkleProof.findUnique({
      where: { versionId: version.id },
      include: { batch: true },
    });

    if (!merkleProof || !merkleProof.batch) {
      return {
        verified: false,
        version: version.version,
        batchId: null,
        merkleRoot: null,
        blockNumber: null,
        txHash: null,
        chainIntact: chainVerification.valid,
      };
    }

    // Verify the Merkle proof
    const proof = JSON.parse(merkleProof.proof) as string[];
    const proofValid = this.verifyProof(
      merkleProof.leafHash,
      proof,
      merkleProof.batch.merkleRoot,
    );

    return {
      verified: proofValid && merkleProof.batch.status === 'CONFIRMED',
      version: version.version,
      batchId: merkleProof.batchId,
      merkleRoot: merkleProof.batch.merkleRoot,
      blockNumber: merkleProof.batch.blockNumber,
      txHash: merkleProof.batch.txHash,
      chainIntact: chainVerification.valid,
    };
  }

  // ============================================
  // BATCH MANAGEMENT
  // ============================================

  /**
   * Get batch by ID with details
   */
  async getBatch(batchId: string) {
    return this.prisma.blockchainBatch.findUnique({
      where: { id: batchId },
      include: {
        versions: {
          select: {
            id: true,
            entityType: true,
            entityId: true,
            version: true,
            versionHash: true,
          },
        },
        merkleProofs: {
          select: {
            versionId: true,
            leafIndex: true,
          },
        },
      },
    });
  }

  /**
   * Get batch statistics
   */
  async getBatchStatistics() {
    const [total, pending, submitted, confirmed, failed] = await Promise.all([
      this.prisma.blockchainBatch.count(),
      this.prisma.blockchainBatch.count({ where: { status: 'PENDING' } }),
      this.prisma.blockchainBatch.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.blockchainBatch.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.blockchainBatch.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      totalBatches: total,
      pendingBatches: pending,
      submittedBatches: submitted,
      confirmedBatches: confirmed,
      failedBatches: failed,
    };
  }

  /**
   * Retry failed batches
   */
  async retryFailedBatches() {
    const failedBatches = await this.prisma.blockchainBatch.findMany({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'asc' },
    });

    const results = [];
    for (const batch of failedBatches) {
      try {
        await this.submitBatchToBlockchain(batch.id, batch.merkleRoot);
        results.push({ batchId: batch.id, success: true });
      } catch (error) {
        results.push({
          batchId: batch.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}
