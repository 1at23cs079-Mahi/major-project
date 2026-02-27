const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { authenticateToken } = require('../middleware/authEnhanced');

// Public: Get chain stats
router.get('/stats', blockchainController.getChainStats);

// Public: Verify a record by data hash
router.get('/verify/:hash', blockchainController.verifyRecord);

// Public: Verify chain integrity
router.get('/integrity', blockchainController.verifyIntegrity);

// Public: Get block by hash
router.get('/block/:hash', blockchainController.getBlock);

// Authenticated: Get all transactions (with filters)
router.get('/transactions', authenticateToken, blockchainController.getTransactions);

// Authenticated: Get my transactions
router.get('/my-transactions', authenticateToken, blockchainController.getMyTransactions);

// Authenticated: Get record history
router.get('/record/:recordId', authenticateToken, blockchainController.getRecordHistory);

// Authenticated: Anchor a record
router.post('/anchor', authenticateToken, blockchainController.anchorRecord);

module.exports = router;
