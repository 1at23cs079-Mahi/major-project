const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Upload report (patient, doctor, or lab)
router.post(
    '/upload',
    authenticateToken,
    roleCheck('Patient', 'Doctor', 'Lab'),
    upload.single('report'),
    medicalRecordController.uploadReport
);

// Get patient reports (for patient themselves)
router.get('/patient', authenticateToken, roleCheck('Patient'), medicalRecordController.getPatientReports);

// Get patient reports (for doctor with consent)
const { requireConsent } = require('../controllers/consentController');
router.get('/doctor/:patient_id', authenticateToken, roleCheck('Doctor'), requireConsent('view_records'), medicalRecordController.getReportsForDoctor);

// Get specific report
router.get('/:id', authenticateToken, medicalRecordController.getReportById);

// Delete report
router.delete('/:id', authenticateToken, roleCheck('Patient'), medicalRecordController.deleteReport);

module.exports = router;
