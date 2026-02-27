const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');

// All routes require Patient role
router.use(authenticateToken, roleCheck('Patient'));

router.get('/', familyController.getFamilyMembers);
router.post('/', familyController.addFamilyMember);
router.put('/:id', familyController.updateFamilyMember);
router.delete('/:id', familyController.deleteFamilyMember);

module.exports = router;
