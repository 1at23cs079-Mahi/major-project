const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

/**
 * Dynamic Dashboard Routes
 * Real-time data for all user roles
 */

// Patient Dashboard
router.get('/patient', authenticateToken, roleCheck('Patient'), dashboardController.getPatientDashboard);

// Doctor Dashboard
router.get('/doctor', authenticateToken, roleCheck('Doctor'), dashboardController.getDoctorDashboard);

// Pharmacy Dashboard
router.get('/pharmacy', authenticateToken, roleCheck('Pharmacy'), dashboardController.getPharmacyDashboard);

// Lab Dashboard
router.get('/lab', authenticateToken, roleCheck('Lab'), dashboardController.getLabDashboard);

// Admin Dashboard
router.get('/admin', authenticateToken, roleCheck('Admin'), dashboardController.getAdminDashboard);

module.exports = router;
