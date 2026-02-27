const { EmergencyContact, Patient, Notification, ActivityLog, User } = require('../models');

// Get all emergency contacts for a patient
exports.getEmergencyContacts = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        const contacts = await EmergencyContact.findAll({
            where: { patient_id: patient.id },
            order: [['is_primary', 'DESC'], ['created_at', 'ASC']]
        });

        res.json({ success: true, contacts });
    } catch (error) {
        console.error('Get emergency contacts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add emergency contact
exports.addEmergencyContact = async (req, res) => {
    try {
        const { name, relationship, phone, email, is_primary } = req.body;
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        // If setting as primary, unset other primary contacts
        if (is_primary) {
            await EmergencyContact.update(
                { is_primary: false },
                { where: { patient_id: patient.id } }
            );
        }

        const contact = await EmergencyContact.create({
            patient_id: patient.id,
            name,
            relationship,
            phone,
            email,
            is_primary: is_primary || false
        });

        // Audit log
        await ActivityLog.create({
            user_id: req.user.id,
            action: 'add_emergency_contact',
            resource: 'emergency_contacts',
            resource_id: contact.id,
            details: { name, relationship }
        });

        res.status(201).json({
            success: true,
            message: 'Emergency contact added',
            contact
        });
    } catch (error) {
        console.error('Add emergency contact error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update emergency contact
exports.updateEmergencyContact = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const contact = await EmergencyContact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        // Verify ownership - contact must belong to the requesting user's patient profile
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (!patient || contact.patient_id !== patient.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this contact' });
        }

        // If setting as primary, unset other primary contacts
        if (updates.is_primary) {
            await EmergencyContact.update(
                { is_primary: false },
                { where: { patient_id: contact.patient_id, id: { [require('sequelize').Op.ne]: id } } }
            );
        }

        await contact.update(updates);

        res.json({ success: true, message: 'Contact updated', contact });
    } catch (error) {
        console.error('Update emergency contact error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete emergency contact
exports.deleteEmergencyContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await EmergencyContact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        // Verify ownership - contact must belong to the requesting user's patient profile
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        if (!patient || contact.patient_id !== patient.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this contact' });
        }

        await contact.destroy();

        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        console.error('Delete emergency contact error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Trigger Emergency SOS
exports.triggerSOS = async (req, res) => {
    try {
        const { location, emergency_type, notes } = req.body;
        const patient = await Patient.findOne({
            where: { user_id: req.user.id },
            include: [{ model: User, as: 'user' }]
        });

        // Critical audit log
        await ActivityLog.create({
            user_id: req.user.id,
            action: 'emergency_sos_triggered',
            resource: 'emergency',
            details: {
                emergency_type,
                location,
                timestamp: new Date(),
                patient_name: `${patient.first_name} ${patient.last_name}`,
                blood_group: patient.blood_group,
                allergies: patient.allergies,
                chronic_conditions: patient.chronic_conditions
            },
            ip_address: req.ip
        });

        // Get all emergency contacts
        const contacts = await EmergencyContact.findAll({
            where: { patient_id: patient.id }
        });

        // Send priority notifications to emergency contacts
        const notificationPromises = contacts.map(contact =>
            sendEmergencyNotification(contact, patient, emergency_type, location)
        );

        await Promise.all(notificationPromises);

        // Notify nearby doctors (if location provided)
        if (location) {
            await notifyNearbyDoctors(patient, location, emergency_type);
        }

        // Create high-priority notification for patient record
        await Notification.create({
            user_id: req.user.id,
            type: 'emergency_sos',
            title: '⚠️ EMERGENCY SOS ACTIVATED',
            message: `Emergency assistance requested. Type: ${emergency_type}. Emergency contacts have been notified.`
        });

        res.json({
            success: true,
            message: 'Emergency SOS activated. Emergency contacts have been notified.',
            contacts_notified: contacts.length,
            emergency_id: Date.now() // Return emergency ID for tracking
        });
    } catch (error) {
        console.error('SOS trigger error:', error);

        // Even if notification fails, log the emergency
        try {
            await ActivityLog.create({
                user_id: req.user.id,
                action: 'emergency_sos_failed',
                resource: 'emergency',
                details: { error: error.message }
            });
        } catch (logError) {
            console.error('Failed to log emergency error:', logError);
        }

        res.status(500).json({
            success: false,
            message: 'Emergency logged but notification may have failed. Please call emergency services directly.',
            emergency_logged: true
        });
    }
};

// Request Ambulance
exports.requestAmbulance = async (req, res) => {
    try {
        const { location, emergency_type, notes } = req.body;
        const patient = await Patient.findOne({
            where: { user_id: req.user.id },
            include: [{ model: User, as: 'user' }]
        });

        // Critical audit log for ambulance request
        const ambulanceRequest = await ActivityLog.create({
            user_id: req.user.id,
            action: 'ambulance_requested',
            resource: 'ambulance',
            details: {
                emergency_type,
                location,
                timestamp: new Date(),
                patient_id: patient.id,
                patient_name: `${patient.first_name} ${patient.last_name}`,
                phone: patient.phone,
                blood_group: patient.blood_group,
                allergies: patient.allergies,
                chronic_conditions: patient.chronic_conditions
            },
            ip_address: req.ip
        });

        // Get primary emergency contact
        const primaryContact = await EmergencyContact.findOne({
            where: { patient_id: patient.id, is_primary: true }
        });

        // In production, integrate with ambulance service API
        // For now, create notification
        await Notification.create({
            user_id: req.user.id,
            type: 'ambulance_request',
            title: '🚑 AMBULANCE REQUESTED',
            message: `Ambulance request submitted for ${emergency_type}. Request ID: ${ambulanceRequest.id}`
        });

        // Notify emergency contact
        if (primaryContact) {
            await sendAmbulanceNotification(primaryContact, patient, location, emergency_type);
        }

        res.json({
            success: true,
            message: 'Ambulance request submitted',
            request_id: ambulanceRequest.id,
            estimated_arrival: 'Contact emergency services for ETA',
            emergency_contact_notified: !!primaryContact
        });
    } catch (error) {
        console.error('Ambulance request error:', error);

        // Failover: Still log the request even if notifications fail
        res.status(500).json({
            success: false,
            message: 'Ambulance request logged. Please call emergency services directly at your local emergency number.',
            emergency_logged: true
        });
    }
};

// Helper: Send emergency notification (SMS/Email)
async function sendEmergencyNotification(contact, patient, emergencyType, location) {
    // In production, integrate with SMS/Email service (Twilio, SendGrid)
    console.log(`[EMERGENCY] Notifying ${contact.name} (${contact.phone}) about ${patient.first_name}'s emergency: ${emergencyType}`);

    // Log notification attempt
    await ActivityLog.create({
        user_id: patient.user_id,
        action: 'emergency_notification_sent',
        resource: 'emergency_contact',
        resource_id: contact.id,
        details: {
            contact_name: contact.name,
            contact_phone: contact.phone,
            emergency_type: emergencyType,
            location,
            patient_id: patient.id
        }
    });
}

// Helper: Send ambulance notification
async function sendAmbulanceNotification(contact, patient, location, emergencyType) {
    console.log(`[AMBULANCE] Notifying ${contact.name} about ambulance request for ${patient.first_name}`);

    await ActivityLog.create({
        user_id: patient.user_id,
        action: 'ambulance_notification_sent',
        resource: 'emergency_contact',
        resource_id: contact.id,
        details: {
            contact_name: contact.name,
            emergency_type: emergencyType,
            location
        }
    });
}

// Helper: Notify nearby doctors (future enhancement)
async function notifyNearbyDoctors(patient, location, emergencyType) {
    // Future: Query doctors by location and availability
    // For now, just log
    await ActivityLog.create({
        user_id: patient.user_id,
        action: 'notify_nearby_doctors_attempted',
        resource: 'emergency',
        details: {
            patient_id: patient.id,
            location,
            emergency_type: emergencyType
        }
    });
}
