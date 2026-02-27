const express = require('express');
const router = express.Router();
const patientAccessController = require('../controllers/patientAccessController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

/**
 * Patient Access Routes
 * Permission-based access to patient information
 */

// Patient: Initialize unique ID
router.post('/initialize-id', authenticateToken, roleCheck('Patient'), patientAccessController.initializePatientId);

// Doctor: Lookup patient with consent verification
router.get('/doctor/lookup', authenticateToken, roleCheck('Doctor'), patientAccessController.doctorLookupPatient);

// Lab: Lookup patient for report upload
router.get('/lab/lookup', authenticateToken, roleCheck('Lab'), patientAccessController.labLookupPatient);

// Request consent from patient
router.post('/request-consent', authenticateToken, roleCheck('Doctor', 'Lab', 'Pharmacy'), patientAccessController.requestConsent);

// Scan patient QR code (emergency access)
router.post('/scan-qr', authenticateToken, patientAccessController.scanPatientQR);

module.exports = router;
