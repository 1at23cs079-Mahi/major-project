const crypto = require('crypto');
const { Op } = require('sequelize');

// Lazy-load model to avoid circular dependency
let _BlockchainLedger = null;
function getModel() {
    if (!_BlockchainLedger) {
        _BlockchainLedger = require('../models').BlockchainLedger;
    }
    return _BlockchainLedger;
}

class BlockchainService {
    constructor() {
        this.GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
        this.DIFFICULTY = 2; // Number of leading zeros required in hash
    }

    /**
     * Compute SHA-256 hash of a string
     */
    sha256(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Compute hash of a block's contents
     */
    computeBlockHash(blockNumber, previousHash, dataHash, timestamp, nonce, recordType, recordId) {
        const blockString = `${blockNumber}:${previousHash}:${dataHash}:${timestamp}:${nonce}:${recordType}:${recordId}`;
        return this.sha256(blockString);
    }

    /**
     * Simple proof-of-work: find nonce that produces hash with leading zeros
     */
    mineBlock(blockNumber, previousHash, dataHash, timestamp, recordType, recordId) {
        let nonce = 0;
        let hash = '';
        const target = '0'.repeat(this.DIFFICULTY);

        do {
            nonce++;
            hash = this.computeBlockHash(blockNumber, previousHash, dataHash, timestamp, nonce, recordType, recordId);
        } while (!hash.startsWith(target) && nonce < 1000000);

        return { hash, nonce };
    }

    /**
     * Hash arbitrary data into a deterministic string
     */
    hashData(data) {
        const normalized = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
        return this.sha256(normalized);
    }

    /**
     * Get the latest block in the chain
     */
    async getLatestBlock() {
        return await getModel().findOne({
            order: [['block_number', 'DESC']]
        });
    }

    /**
     * Create the genesis block if the chain is empty
     */
    async ensureGenesisBlock() {
        const count = await getModel().count();
        if (count === 0) {
            const timestamp = new Date().toISOString();
            const dataHash = this.hashData({ genesis: true, created: timestamp });
            const { hash, nonce } = this.mineBlock(0, this.GENESIS_HASH, dataHash, timestamp, 'AUDIT_LOG', 'genesis');

            await getModel().create({
                block_number: 0,
                previous_hash: this.GENESIS_HASH,
                hash,
                data_hash: dataHash,
                record_type: 'AUDIT_LOG',
                record_id: 'genesis',
                nonce,
                timestamp,
                metadata: { message: 'Genesis block - Healthcare Blockchain Ledger initialized' }
            });
            console.log('[Blockchain] Genesis block created:', hash.slice(0, 16) + '...');
        }
    }

    /**
     * Anchor a record to the blockchain ledger
     * @param {string} recordType - Type of record (PRESCRIPTION, MEDICAL_RECORD, etc.)
     * @param {string} recordId - ID of the record
     * @param {object} data - The data to hash and anchor
     * @param {object} options - Optional user_id, patient_id, metadata
     * @returns {object} The created block
     */
    async anchorRecord(recordType, recordId, data, options = {}) {
        await this.ensureGenesisBlock();

        const latestBlock = await this.getLatestBlock();
        const blockNumber = latestBlock.block_number + 1;
        const previousHash = latestBlock.hash;
        const timestamp = new Date().toISOString();
        const dataHash = this.hashData(data);

        const { hash, nonce } = this.mineBlock(blockNumber, previousHash, dataHash, timestamp, recordType, recordId);

        const block = await getModel().create({
            block_number: blockNumber,
            previous_hash: previousHash,
            hash,
            data_hash: dataHash,
            record_type: recordType,
            record_id: recordId,
            user_id: options.user_id || null,
            patient_id: options.patient_id || null,
            nonce,
            timestamp,
            metadata: {
                ...options.metadata,
                anchored_by: options.user_id || 'system',
                record_summary: options.summary || null
            }
        });

        console.log(`[Blockchain] Block #${blockNumber} mined: ${hash.slice(0, 16)}... | ${recordType} | ${recordId}`);
        return block;
    }

    /**
     * Verify a record's hash against the blockchain
     * @param {string} dataHash - Hash to verify
     * @returns {object|null} The matching block or null
     */
    async verifyRecord(dataHash) {
        const block = await getModel().findOne({
            where: { data_hash: dataHash }
        });

        if (!block) return { verified: false, message: 'Hash not found in blockchain ledger' };

        // Recompute block hash to verify integrity
        const recomputedHash = this.computeBlockHash(
            block.block_number, block.previous_hash, block.data_hash,
            block.timestamp.toISOString(), block.nonce, block.record_type, block.record_id
        );

        const isValid = recomputedHash === block.hash;

        return {
            verified: isValid,
            block_number: block.block_number,
            hash: block.hash,
            data_hash: block.data_hash,
            record_type: block.record_type,
            record_id: block.record_id,
            timestamp: block.timestamp,
            message: isValid ? 'Record verified and untampered' : 'WARNING: Block hash mismatch - possible tampering detected'
        };
    }

    /**
     * Verify the integrity of the entire chain
     * @returns {object} Integrity report
     */
    async verifyChainIntegrity() {
        const blocks = await getModel().findAll({
            order: [['block_number', 'ASC']]
        });

        if (blocks.length === 0) {
            return { valid: true, totalBlocks: 0, message: 'Empty chain' };
        }

        let invalidBlocks = [];
        let brokenLinks = [];

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];

            // Verify block hash
            const recomputedHash = this.computeBlockHash(
                block.block_number, block.previous_hash, block.data_hash,
                block.timestamp.toISOString(), block.nonce, block.record_type, block.record_id
            );

            if (recomputedHash !== block.hash) {
                invalidBlocks.push(block.block_number);
            }

            // Verify chain link (previous hash matches previous block's hash)
            if (i > 0) {
                const previousBlock = blocks[i - 1];
                if (block.previous_hash !== previousBlock.hash) {
                    brokenLinks.push({ block: block.block_number, expected: previousBlock.hash, got: block.previous_hash });
                }
            } else {
                // Genesis block check
                if (block.previous_hash !== this.GENESIS_HASH) {
                    brokenLinks.push({ block: 0, expected: this.GENESIS_HASH, got: block.previous_hash });
                }
            }
        }

        const valid = invalidBlocks.length === 0 && brokenLinks.length === 0;

        return {
            valid,
            totalBlocks: blocks.length,
            invalidBlocks,
            brokenLinks,
            lastBlock: blocks[blocks.length - 1].block_number,
            lastHash: blocks[blocks.length - 1].hash,
            message: valid
                ? `Chain integrity verified: ${blocks.length} blocks, all valid`
                : `Chain integrity FAILED: ${invalidBlocks.length} invalid blocks, ${brokenLinks.length} broken links`
        };
    }

    /**
     * Get chain statistics
     */
    async getChainStats() {
        await this.ensureGenesisBlock();

        const totalBlocks = await getModel().count();
        const latestBlock = await this.getLatestBlock();

        const typeCounts = await getModel().findAll({
            attributes: [
                'record_type',
                [require('sequelize').fn('COUNT', '*'), 'count']
            ],
            group: ['record_type'],
            raw: true
        });

        const last24h = await getModel().count({
            where: {
                timestamp: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        });

        const integrity = await this.verifyChainIntegrity();

        return {
            totalBlocks,
            lastBlockNumber: latestBlock?.block_number || 0,
            lastBlockHash: latestBlock?.hash || null,
            lastBlockTime: latestBlock?.timestamp || null,
            blocksLast24h: last24h,
            typeCounts: typeCounts.reduce((acc, t) => {
                acc[t.record_type] = parseInt(t.count);
                return acc;
            }, {}),
            chainValid: integrity.valid,
            difficulty: this.DIFFICULTY
        };
    }

    /**
     * Get transaction history with pagination
     */
    async getTransactions({ page = 1, limit = 20, recordType, userId, patientId, search }) {
        const where = {};
        if (recordType) where.record_type = recordType;
        if (userId) where.user_id = userId;
        if (patientId) where.patient_id = patientId;
        if (search) {
            where[Op.or] = [
                { hash: { [Op.iLike]: `%${search}%` } },
                { data_hash: { [Op.iLike]: `%${search}%` } },
                { record_id: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { rows, count } = await getModel().findAndCountAll({
            where,
            order: [['block_number', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            transactions: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    /**
     * Get a single block by hash
     */
    async getBlockByHash(hash) {
        return await getModel().findOne({ where: { hash } });
    }

    /**
     * Get a single block by block number
     */
    async getBlockByNumber(blockNumber) {
        return await getModel().findOne({ where: { block_number: blockNumber } });
    }

    /**
     * Get all blocks for a specific record
     */
    async getRecordHistory(recordId) {
        return await getModel().findAll({
            where: { record_id: recordId },
            order: [['block_number', 'ASC']]
        });
    }

    /**
     * Convenience: Anchor a prescription
     */
    async anchorPrescription(prescription, userId) {
        const data = {
            prescription_number: prescription.prescription_number,
            patient_id: prescription.patient_id,
            doctor_id: prescription.doctor_id,
            items: prescription.items || prescription.prescription_items || [],
            diagnosis: prescription.diagnosis,
            created_at: prescription.createdAt || new Date().toISOString()
        };

        return await this.anchorRecord('PRESCRIPTION', prescription.id || prescription.prescription_number, data, {
            user_id: userId,
            patient_id: prescription.patient_id,
            summary: `Prescription ${prescription.prescription_number} for patient`,
            metadata: { prescription_number: prescription.prescription_number }
        });
    }

    /**
     * Convenience: Anchor a medical record
     */
    async anchorMedicalRecord(record, userId) {
        const data = {
            record_id: record.id,
            patient_id: record.patient_id,
            report_type: record.report_type,
            file_name: record.file_name,
            uploaded_at: record.createdAt || new Date().toISOString()
        };

        return await this.anchorRecord('MEDICAL_RECORD', record.id, data, {
            user_id: userId,
            patient_id: record.patient_id,
            summary: `Medical record: ${record.report_type || record.file_name}`,
            metadata: { report_type: record.report_type }
        });
    }

    /**
     * Convenience: Anchor a consent action
     */
    async anchorConsent(consent, action, userId) {
        const recordType = action === 'grant' ? 'CONSENT_GRANT' : 'CONSENT_REVOKE';
        const data = {
            consent_id: consent.id,
            patient_id: consent.patient_id,
            provider_id: consent.provider_id,
            consent_type: consent.consent_type,
            action,
            actioned_at: new Date().toISOString()
        };

        return await this.anchorRecord(recordType, consent.id, data, {
            user_id: userId,
            patient_id: consent.patient_id,
            summary: `Consent ${action}: ${consent.consent_type}`,
            metadata: { consent_type: consent.consent_type, action }
        });
    }
}

// Singleton
const blockchainService = new BlockchainService();
module.exports = blockchainService;
