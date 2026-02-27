const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// All routes require Patient role
router.use(authenticateToken, roleCheck('Patient'));

// Emergency Contacts
router.get('/contacts', emergencyController.getEmergencyContacts);
router.post('/contacts', emergencyController.addEmergencyContact);
router.put('/contacts/:id', emergencyController.updateEmergencyContact);
router.delete('/contacts/:id', emergencyController.deleteEmergencyContact);

// Emergency Actions (no rate limit - life critical)
router.post('/sos', emergencyController.triggerSOS);
router.post('/ambulance', emergencyController.requestAmbulance);

module.exports = router;
