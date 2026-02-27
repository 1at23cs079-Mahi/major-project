const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// Patient routes - manage consents
router.post('/grant', authenticateToken, roleCheck('Patient'), consentController.grantConsent);
router.put('/:id/revoke', authenticateToken, roleCheck('Patient'), consentController.revokeConsent);
router.get('/patient', authenticateToken, roleCheck('Patient'), consentController.getPatientConsents);

// Doctor routes - check consent
router.get('/check', authenticateToken, roleCheck('Doctor'), consentController.checkConsent);

module.exports = router;
