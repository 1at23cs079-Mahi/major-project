const blockchainService = require('../services/blockchain.service');

// Get blockchain chain stats
exports.getChainStats = async (req, res) => {
    try {
        const stats = await blockchainService.getChainStats();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Get chain stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get chain stats' });
    }
};

// Anchor a record to the blockchain
exports.anchorRecord = async (req, res) => {
    try {
        const { record_type, record_id, data, metadata } = req.body;

        if (!record_type || !record_id || !data) {
            return res.status(400).json({ success: false, message: 'record_type, record_id, and data are required' });
        }

        const block = await blockchainService.anchorRecord(record_type, record_id, data, {
            user_id: req.user.id,
            patient_id: req.body.patient_id || null,
            summary: req.body.summary || null,
            metadata: metadata || {}
        });

        res.status(201).json({
            success: true,
            message: 'Record anchored to blockchain',
            block: {
                block_number: block.block_number,
                hash: block.hash,
                data_hash: block.data_hash,
                record_type: block.record_type,
                timestamp: block.timestamp
            }
        });
    } catch (error) {
        console.error('Anchor record error:', error);
        res.status(500).json({ success: false, message: 'Failed to anchor record' });
    }
};

// Verify a record by its data hash
exports.verifyRecord = async (req, res) => {
    try {
        const { hash } = req.params;

        if (!hash) {
            return res.status(400).json({ success: false, message: 'Hash is required' });
        }

        const result = await blockchainService.verifyRecord(hash);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Verify record error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify record' });
    }
};

// Get transaction history
exports.getTransactions = async (req, res) => {
    try {
        const { page, limit, record_type, search } = req.query;
        const result = await blockchainService.getTransactions({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            recordType: record_type,
            userId: req.query.user_id || null,
            patientId: req.query.patient_id || null,
            search
        });

        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get transactions' });
    }
};

// Get my transactions (for authenticated user)
exports.getMyTransactions = async (req, res) => {
    try {
        const { page, limit, record_type } = req.query;
        const result = await blockchainService.getTransactions({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            recordType: record_type,
            userId: req.user.id
        });

        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Get my transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get transactions' });
    }
};

// Verify chain integrity
exports.verifyIntegrity = async (req, res) => {
    try {
        const result = await blockchainService.verifyChainIntegrity();
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Verify integrity error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify chain integrity' });
    }
};

// Get block by hash
exports.getBlock = async (req, res) => {
    try {
        const { hash } = req.params;
        const block = await blockchainService.getBlockByHash(hash);

        if (!block) {
            return res.status(404).json({ success: false, message: 'Block not found' });
        }

        res.json({ success: true, block });
    } catch (error) {
        console.error('Get block error:', error);
        res.status(500).json({ success: false, message: 'Failed to get block' });
    }
};

// Get record history (all blocks for a specific record)
exports.getRecordHistory = async (req, res) => {
    try {
        const { recordId } = req.params;
        const blocks = await blockchainService.getRecordHistory(recordId);

        res.json({ success: true, blocks, total: blocks.length });
    } catch (error) {
        console.error('Get record history error:', error);
        res.status(500).json({ success: false, message: 'Failed to get record history' });
    }
};
