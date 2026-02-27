const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// Patient routes
router.post('/book', authenticateToken, roleCheck('Patient'), appointmentController.bookAppointment);
router.get('/', authenticateToken, roleCheck('Patient'), appointmentController.getPatientAppointments);
router.get('/patient', authenticateToken, roleCheck('Patient'), appointmentController.getPatientAppointments);
router.put('/:id/reschedule', authenticateToken, roleCheck('Patient'), appointmentController.rescheduleAppointment);
router.delete('/:id/cancel', authenticateToken, appointmentController.cancelAppointment);

// Public/Patient - get available slots
router.get('/slots/:doctorId', authenticateToken, appointmentController.getAvailableSlots);

// Doctor routes
router.get('/doctor/calendar', authenticateToken, roleCheck('Doctor'), appointmentController.getDoctorAppointments);
router.get('/doctor/queue', authenticateToken, roleCheck('Doctor'), appointmentController.getTodaysQueue);
router.put('/:id/accept', authenticateToken, roleCheck('Doctor'), appointmentController.acceptAppointment);
router.put('/:id/reject', authenticateToken, roleCheck('Doctor'), appointmentController.rejectAppointment);

module.exports = router;
