const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// Doctor routes
router.post('/', authenticateToken, roleCheck('Doctor'), prescriptionController.createPrescription);
router.post('/:id/items', authenticateToken, roleCheck('Doctor'), prescriptionController.addPrescriptionItems);
router.get('/doctor', authenticateToken, roleCheck('Doctor'), prescriptionController.getDoctorPrescriptions);

// Patient routes
router.get('/patient', authenticateToken, roleCheck('Patient'), prescriptionController.getPatientPrescriptions);

// Pharmacy routes
router.post('/verify', authenticateToken, roleCheck('Pharmacy'), prescriptionController.verifyPrescription);
router.put('/:id/dispense', authenticateToken, roleCheck('Pharmacy'), prescriptionController.markAsDispensed);

// General authenticated route
router.get('/:id', authenticateToken, prescriptionController.getPrescriptionById);

module.exports = router;
