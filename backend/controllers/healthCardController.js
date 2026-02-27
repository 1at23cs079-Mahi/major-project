const { Patient, EmergencyContact, User } = require('../models');
const { generateHealthCardQR } = require('../utils/qrGenerator');

// Get health card data (critical medical info)
exports.getHealthCard = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            where: { user_id: req.user.id },
            include: [{ model: User, as: 'user' }]
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        // Get primary emergency contact
        const primaryContact = await EmergencyContact.findOne({
            where: { patient_id: patient.id, is_primary: true }
        });

        // Critical health information
        const healthCardData = {
            patient_id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`,
            date_of_birth: patient.date_of_birth,
            blood_group: patient.blood_group,
            allergies: patient.allergies,
            chronic_conditions: patient.chronic_conditions,
            emergency_contact: primaryContact ? {
                name: primaryContact.name,
                phone: primaryContact.phone,
                relationship: primaryContact.relationship
            } : null,
            generated_at: new Date().toISOString()
        };

        // Generate QR code
        const qrCodeDataURL = await generateHealthCardQR(healthCardData, patient.id);

        res.json({
            success: true,
            healthCard: healthCardData,
            qrCode: qrCodeDataURL
        });
    } catch (error) {
        console.error('Get health card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Scan health card QR (for emergency responders)
exports.scanHealthCard = async (req, res) => {
    try {
        const { patient_id } = req.body;

        const patient = await Patient.findByPk(patient_id, {
            include: [{ model: User, as: 'user' }]
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Get emergency contacts
        const contacts = await EmergencyContact.findAll({
            where: { patient_id: patient.id },
            order: [['is_primary', 'DESC']]
        });

        // Log health card access
        const { ActivityLog } = require('../models');
        await ActivityLog.create({
            user_id: req.user ? req.user.id : null,
            action: 'health_card_scanned',
            resource: 'patient',
            resource_id: patient.id,
            details: {
                scanned_by_role: req.user ? req.user.role.name : 'unknown',
                timestamp: new Date()
            },
            ip_address: req.ip
        });

        res.json({
            success: true,
            patient: {
                name: `${patient.first_name} ${patient.last_name}`,
                blood_group: patient.blood_group,
                allergies: patient.allergies,
                chronic_conditions: patient.chronic_conditions,
                date_of_birth: patient.date_of_birth
            },
            emergency_contacts: contacts
        });
    } catch (error) {
        console.error('Scan health card error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
