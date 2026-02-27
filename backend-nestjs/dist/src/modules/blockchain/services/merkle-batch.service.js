"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MerkleBatchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerkleBatchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const canonical_hash_service_1 = require("./canonical-hash.service");
const version_tracking_service_1 = require("./version-tracking.service");
const blockchain_service_1 = require("../blockchain.service");
const crypto_1 = require("crypto");
let MerkleBatchService = MerkleBatchService_1 = class MerkleBatchService {
    constructor(prisma, hashService, versionService, blockchainService) {
        this.prisma = prisma;
        this.hashService = hashService;
        this.versionService = versionService;
        this.blockchainService = blockchainService;
        this.logger = new common_1.Logger(MerkleBatchService_1.name);
        this.batchInterval = null;
        this.isProcessing = false;
        this.BATCH_SIZE = parseInt(process.env.MERKLE_BATCH_SIZE || '100');
        this.BATCH_INTERVAL_MS = parseInt(process.env.MERKLE_BATCH_INTERVAL_MS || '60000');
        this.MIN_BATCH_SIZE = parseInt(process.env.MERKLE_MIN_BATCH_SIZE || '1');
    }
    onModuleInit() {
        if (process.env.BLOCKCHAIN_ENABLED === 'true') {
            this.startBatchProcessor();
            this.logger.log(`Merkle batch processor started: interval=${this.BATCH_INTERVAL_MS}ms, batchSize=${this.BATCH_SIZE}`);
        }
        else {
            this.logger.warn('Blockchain disabled - Merkle batch processor not started');
        }
    }
    startBatchProcessor() {
        if (this.batchInterval) {
            clearInterval(this.batchInterval);
        }
        this.batchInterval = setInterval(async () => {
            await this.processPendingBatch();
        }, this.BATCH_INTERVAL_MS);
    }
    stopBatchProcessor() {
        if (this.batchInterval) {
            clearInterval(this.batchInterval);
            this.batchInterval = null;
            this.logger.log('Merkle batch processor stopped');
        }
    }
    async processPendingBatch() {
        if (this.isProcessing) {
            this.logger.debug('Batch processing already in progress, skipping');
            return { processed: false };
        }
        this.isProcessing = true;
        try {
            const pendingVersions = await this.versionService.getUnsubmittedVersions(this.BATCH_SIZE);
            if (pendingVersions.length < this.MIN_BATCH_SIZE) {
                this.logger.debug(`Not enough pending versions (${pendingVersions.length}/${this.MIN_BATCH_SIZE})`);
                return { processed: false };
            }
            this.logger.log(`Processing batch with ${pendingVersions.length} versions`);
            const { root, proofs } = this.buildMerkleTree(pendingVersions.map((v) => v.versionHash));
            const entityTypes = [...new Set(pendingVersions.map((v) => v.entityType))];
            const lastBatch = await this.prisma.blockchainBatch.findFirst({
                orderBy: { batchNumber: 'desc' },
            });
            const nextBatchNumber = (lastBatch?.batchNumber ?? 0) + 1;
            const batch = await this.prisma.blockchainBatch.create({
                data: {
                    batchNumber: nextBatchNumber,
                    merkleRoot: root,
                    recordCount: pendingVersions.length,
                    entityTypes: JSON.stringify(entityTypes),
                    status: 'PENDING',
                },
            });
            const versionIds = pendingVersions.map((v) => v.id);
            await this.versionService.assignVersionsToBatch(versionIds, batch.id);
            await this.storeMerkleProofs(pendingVersions, proofs, batch.id);
            await this.submitBatchToBlockchain(batch.id, root);
            return {
                processed: true,
                batchId: batch.id,
                recordCount: pendingVersions.length,
                merkleRoot: root,
            };
        }
        catch (error) {
            this.logger.error('Batch processing failed:', error);
            return { processed: false };
        }
        finally {
            this.isProcessing = false;
        }
    }
    buildMerkleTree(hashes) {
        if (hashes.length === 0) {
            return { root: '0x0', proofs: new Map() };
        }
        if (hashes.length === 1) {
            return {
                root: hashes[0],
                proofs: new Map([[0, []]]),
            };
        }
        const leaves = [...hashes];
        while (leaves.length & (leaves.length - 1)) {
            leaves.push(leaves[leaves.length - 1]);
        }
        const tree = [leaves];
        let currentLevel = leaves;
        while (currentLevel.length > 1) {
            const nextLevel = [];
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
        const proofs = new Map();
        for (let i = 0; i < hashes.length; i++) {
            proofs.set(i, this.generateProof(i, tree));
        }
        return { root, proofs };
    }
    hashPair(left, right) {
        const [a, b] = [left, right].sort();
        const combined = a.slice(2) + b.slice(2);
        const hash = (0, crypto_1.createHash)('sha256').update(combined, 'hex').digest('hex');
        return '0x' + hash;
    }
    generateProof(leafIndex, tree) {
        const proof = [];
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
    verifyProof(leafHash, proof, root) {
        let currentHash = leafHash;
        for (const sibling of proof) {
            currentHash = this.hashPair(currentHash, sibling);
        }
        return currentHash.toLowerCase() === root.toLowerCase();
    }
    async storeMerkleProofs(versions, proofs, batchId) {
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
    async submitBatchToBlockchain(batchId, merkleRoot) {
        try {
            const contract = this.blockchainService.getContract('AUDIT_LOG');
            if (!contract) {
                this.logger.warn('Audit log contract not available, marking batch as pending');
                return;
            }
            const tx = await contract.logBatchAuditEntry(merkleRoot, batchId, 0);
            await this.prisma.blockchainBatch.update({
                where: { id: batchId },
                data: {
                    status: 'SUBMITTED',
                    txHash: tx.hash,
                    submittedAt: new Date(),
                },
            });
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
            this.logger.log(`Batch ${batchId} confirmed on blockchain - tx: ${tx.hash}, block: ${receipt.blockNumber}`);
        }
        catch (error) {
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
    async verifyRecordProof(entityType, entityId, versionNumber) {
        const version = versionNumber
            ? await this.versionService.getVersion(entityType, entityId, versionNumber)
            : await this.versionService.getLatestVersion(entityType, entityId);
        if (!version) {
            throw new Error(`Version not found for ${entityType}:${entityId}`);
        }
        const chainVerification = await this.versionService.verifyVersionChain(entityType, entityId);
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
        const proof = JSON.parse(merkleProof.proof);
        const proofValid = this.verifyProof(merkleProof.leafHash, proof, merkleProof.batch.merkleRoot);
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
    async getBatch(batchId) {
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
            }
            catch (error) {
                results.push({
                    batchId: batch.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return results;
    }
};
exports.MerkleBatchService = MerkleBatchService;
exports.MerkleBatchService = MerkleBatchService = MerkleBatchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        canonical_hash_service_1.CanonicalHashService,
        version_tracking_service_1.VersionTrackingService,
        blockchain_service_1.BlockchainService])
], MerkleBatchService);
//# sourceMappingURL=merkle-batch.service.js.map