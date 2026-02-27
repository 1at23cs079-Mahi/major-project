const { FamilyMember, Patient } = require('../models');

// Get all family members
exports.getFamilyMembers = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        const familyMembers = await FamilyMember.findAll({
            where: { patient_id: patient.id },
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, familyMembers });
    } catch (error) {
        console.error('Get family members error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add family member
exports.addFamilyMember = async (req, res) => {
    try {
        const { first_name, last_name, relationship, date_of_birth, gender, blood_group, allergies, chronic_conditions } = req.body;
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        const familyMember = await FamilyMember.create({
            patient_id: patient.id,
            first_name,
            last_name,
            relationship,
            date_of_birth,
            gender,
            blood_group,
            allergies,
            chronic_conditions
        });

        res.status(201).json({
            success: true,
            message: 'Family member added successfully',
            familyMember
        });
    } catch (error) {
        console.error('Add family member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update family member
exports.updateFamilyMember = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const familyMember = await FamilyMember.findByPk(id);
        if (!familyMember) {
            return res.status(404).json({ success: false, message: 'Family member not found' });
        }

        await familyMember.update(updates);
        res.json({ success: true, message: 'Family member updated', familyMember });
    } catch (error) {
        console.error('Update family member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete family member
exports.deleteFamilyMember = async (req, res) => {
    try {
        const { id } = req.params;

        const familyMember = await FamilyMember.findByPk(id);
        if (!familyMember) {
            return res.status(404).json({ success: false, message: 'Family member not found' });
        }

        await familyMember.destroy();
        res.json({ success: true, message: 'Family member removed' });
    } catch (error) {
        console.error('Delete family member error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
