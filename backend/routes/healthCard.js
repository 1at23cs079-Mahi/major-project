const express = require('express');
const router = express.Router();
const healthCardController = require('../controllers/healthCardController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// Get health card (Patient only)
router.get('/', authenticateToken, roleCheck('Patient'), healthCardController.getHealthCard);

// Scan health card (Doctor/Admin/emergency responders)
router.post('/scan', authenticateToken, roleCheck('Doctor', 'Admin'), healthCardController.scanHealthCard);

module.exports = router;
