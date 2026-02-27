const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// All routes require Admin role
router.use(authenticateToken, roleCheck('Admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/deactivate', adminController.deactivateUser);

// Approvals
router.get('/approvals/pending', adminController.getPendingApprovals);
router.put('/doctors/:id/approve', adminController.approveDoctor);
router.put('/pharmacies/:id/approve', adminController.approvePharmacy);

// System Monitoring
router.get('/appointments', adminController.getAllAppointments);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
