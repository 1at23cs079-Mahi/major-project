const { User, Patient, Doctor, Pharmacy, Lab, Role, Appointment, Prescription, Medicine, ActivityLog } = require('../models');
const { Op } = require('sequelize');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            totalUsers: await User.count(),
            totalPatients: await Patient.count(),
            totalDoctors: await Doctor.count({ where: { is_approved: true } }),
            totalPharmacies: await Pharmacy.count({ where: { is_approved: true } }),
            totalLabs: await Lab.count({ where: { is_approved: true } }),
            pendingDoctors: await Doctor.count({ where: { is_approved: false } }),
            pendingPharmacies: await Pharmacy.count({ where: { is_approved: false } }),
            totalAppointments: await Appointment.count(),
            totalPrescriptions: await Prescription.count(),
            totalMedicines: await Medicine.count({ where: { is_active: true } })
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { role, status } = req.query;
        const where = {};

        if (role) {
            const roleRecord = await Role.findOne({ where: { name: role } });
            if (roleRecord) where.role_id = roleRecord.id;
        }

        if (status === 'active') where.is_active = true;
        if (status === 'inactive') where.is_active = false;

        const users = await User.findAll({
            where,
            include: [{ model: Role, as: 'role' }],
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Activate user
exports.activateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.update({ is_active: true });
        res.json({ success: true, message: 'User activated' });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Deactivate user
exports.deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.update({ is_active: false });
        res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Approve doctor
exports.approveDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await Doctor.findByPk(id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        await doctor.update({ is_approved: true });
        await User.update({ is_active: true }, { where: { id: doctor.user_id } });

        // Notify doctor
        const { Notification } = require('../models');
        await Notification.create({
            user_id: doctor.user_id,
            type: 'approval',
            title: 'Account Approved',
            message: 'Your doctor account has been approved. You can now start accepting appointments.'
        });

        res.json({ success: true, message: 'Doctor approved' });
    } catch (error) {
        console.error('Approve doctor error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Approve pharmacy
exports.approvePharmacy = async (req, res) => {
    try {
        const { id } = req.params;

        const pharmacy = await Pharmacy.findByPk(id);
        if (!pharmacy) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found' });
        }

        await pharmacy.update({ is_approved: true });
        await User.update({ is_active: true }, { where: { id: pharmacy.user_id } });

        // Notify pharmacy
        const { Notification } = require('../models');
        await Notification.create({
            user_id: pharmacy.user_id,
            type: 'approval',
            title: 'Account Approved',
            message: 'Your pharmacy account has been approved.'
        });

        res.json({ success: true, message: 'Pharmacy approved' });
    } catch (error) {
        console.error('Approve pharmacy error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all appointments (Admin view)
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { model: Patient, as: 'patient' },
                { model: Doctor, as: 'doctor' }
            ],
            order: [['appointment_date', 'DESC']],
            limit: 100
        });

        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
    try {
        const { user_id, action, limit = 100 } = req.query;
        const where = {};

        if (user_id) where.user_id = user_id;
        if (action) where.action = action;

        const logs = await ActivityLog.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ success: true, logs });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get pending approvals
exports.getPendingApprovals = async (req, res) => {
    try {
        const pendingDoctors = await Doctor.findAll({
            where: { is_approved: false },
            include: [{ model: User, as: 'user', attributes: ['id', 'email', 'created_at'] }]
        });

        const pendingPharmacies = await Pharmacy.findAll({
            where: { is_approved: false },
            include: [{ model: User, as: 'user', attributes: ['id', 'email', 'created_at'] }]
        });

        res.json({
            success: true,
            pending: {
                doctors: pendingDoctors,
                pharmacies: pendingPharmacies
            }
        });
    } catch (error) {
        console.error('Get pending approvals error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
