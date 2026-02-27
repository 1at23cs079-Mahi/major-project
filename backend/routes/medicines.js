const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticateToken } = require('../middleware/authEnhanced');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// Public/authenticated - search medicines
router.get('/', authenticateToken, medicineController.getAllMedicines);
router.get('/:id', authenticateToken, medicineController.getMedicineById);

// Admin only - manage medicines
router.post('/', authenticateToken, roleCheck('Admin'), medicineController.createMedicine);
router.put('/:id', authenticateToken, roleCheck('Admin'), medicineController.updateMedicine);
router.delete('/:id', authenticateToken, roleCheck('Admin'), medicineController.deleteMedicine);

// Admin/Pharmacy - upload medicine image
router.post(
    '/:id/image',
    authenticateToken,
    roleCheck('Admin', 'Pharmacy'),
    upload.single('image'),
    medicineController.uploadMedicineImage
);

module.exports = router;
