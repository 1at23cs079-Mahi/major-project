const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// Patient routes
router.get('/', authenticateToken, roleCheck('Patient'), insuranceController.getPatientInsurance);
router.post('/', authenticateToken, roleCheck('Patient'), insuranceController.addInsurance);
router.put('/:id', authenticateToken, roleCheck('Patient'), insuranceController.updateInsurance);
router.delete('/:id', authenticateToken, roleCheck('Patient'), insuranceController.deactivateInsurance);

module.exports = router;
