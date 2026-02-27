const { Medicine } = require('../models');
const upload = require('../middleware/upload');

// Get all medicines
exports.getAllMedicines = async (req, res) => {
    try {
        const { search, category } = req.query;
        const where = { is_active: true };

        if (search) {
            const { Op } = require('sequelize');
            where.name = { [Op.iLike]: `%${search}%` };
        }

        if (category) {
            where.category = category;
        }

        const medicines = await Medicine.findAll({
            where,
            order: [['name', 'ASC']]
        });

        res.json({ success: true, medicines });
    } catch (error) {
        console.error('Get medicines error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get medicine by ID
exports.getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;

        const medicine = await Medicine.findByPk(id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        res.json({ success: true, medicine });
    } catch (error) {
        console.error('Get medicine error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Create medicine (Admin only)
exports.createMedicine = async (req, res) => {
    try {
        const { name, category, manufacturer, description, default_dosage, unit } = req.body;

        const medicine = await Medicine.create({
            name,
            category,
            manufacturer,
            description,
            default_dosage,
            unit,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Medicine created successfully',
            medicine
        });
    } catch (error) {
        console.error('Create medicine error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update medicine (Admin only)
exports.updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const medicine = await Medicine.findByPk(id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        await medicine.update(updates);
        res.json({ success: true, message: 'Medicine updated', medicine });
    } catch (error) {
        console.error('Update medicine error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Upload medicine image
exports.uploadMedicineImage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const medicine = await Medicine.findByPk(id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        await medicine.update({ image_path: req.file.path });

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            image_path: req.file.path
        });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete medicine (Admin only - soft delete)
exports.deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;

        const medicine = await Medicine.findByPk(id);
        if (!medicine) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }

        await medicine.update({ is_active: false });
        res.json({ success: true, message: 'Medicine deactivated' });
    } catch (error) {
        console.error('Delete medicine error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
