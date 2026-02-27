const { Insurance, Patient } = require('../models');

// Get patient insurance
exports.getPatientInsurance = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        const insurance = await Insurance.findAll({
            where: { patient_id: patient.id },
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, insurance });
    } catch (error) {
        console.error('Get insurance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add insurance
exports.addInsurance = async (req, res) => {
    try {
        const { provider_name, policy_number, group_number, coverage_type, valid_from, valid_until } = req.body;
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        const insurance = await Insurance.create({
            patient_id: patient.id,
            provider_name,
            policy_number,
            group_number,
            coverage_type,
            valid_from,
            valid_until,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'Insurance added successfully',
            insurance
        });
    } catch (error) {
        console.error('Add insurance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update insurance
exports.updateInsurance = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const insurance = await Insurance.findByPk(id);
        if (!insurance) {
            return res.status(404).json({ success: false, message: 'Insurance not found' });
        }

        await insurance.update(updates);
        res.json({ success: true, message: 'Insurance updated', insurance });
    } catch (error) {
        console.error('Update insurance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark insurance as inactive
exports.deactivateInsurance = async (req, res) => {
    try {
        const { id } = req.params;

        const insurance = await Insurance.findByPk(id);
        if (!insurance) {
            return res.status(404).json({ success: false, message: 'Insurance not found' });
        }

        await insurance.update({ is_active: false });
        res.json({ success: true, message: 'Insurance deactivated' });
    } catch (error) {
        console.error('Deactivate insurance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
