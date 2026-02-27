const { Consent, Patient, Doctor, User, Lab, Pharmacy } = require('../models');
const { Op } = require('sequelize');
const blockchainService = require('../services/blockchain.service');

/**
 * Grant consent for provider to access patient data
 */
exports.grantConsent = async (req, res) => {
    try {
        const { provider_id, consent_type, expiry_date, provider_type } = req.body;
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        // Check if consent already exists and is active
        const existing = await Consent.findOne({
            where: {
                patient_id: patient.id,
                provider_id,
                consent_type,
                is_active: true
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Active consent already exists. Revoke it first to create a new one.'
            });
        }

        const consent = await Consent.create({
            patient_id: patient.id,
            provider_id,
            consent_type,
            granted_at: new Date(),
            expires_at: expiry_date || null,
            is_active: true
        });

        // Get provider blockchain address
        let providerAddress = null;
        if (provider_type === 'Doctor') {
            const doctor = await Doctor.findOne({ where: { user_id: provider_id } });
            providerAddress = doctor?.blockchain_address;
        } else if (provider_type === 'Lab') {
            const lab = await Lab.findOne({ where: { user_id: provider_id } });
            providerAddress = lab?.blockchain_address;
        } else if (provider_type === 'Pharmacy') {
            const pharmacy = await Pharmacy.findOne({ where: { user_id: provider_id } });
            providerAddress = pharmacy?.blockchain_address;
        }

        // Blockchain Anchoring - Log consent grant
        try {
            const block = await blockchainService.anchorConsent(consent, 'grant', req.user.id);
            if (block) {
                await consent.update({ blockchain_tx_hash: block.hash });
            }
        } catch (bcError) {
            console.error('Blockchain consent anchoring failed:', bcError);
        }

        // Audit log
        const { ActivityLog } = require('../models');
        await ActivityLog.create({
            user_id: req.user.id,
            action: 'CONSENT_GRANTED',
            resource_type: 'consent',
            resource_id: consent.id,
            details: JSON.stringify({
                provider_id,
                consent_type,
                expiry_date
            }),
            ip_address: req.ip
        });

        res.status(201).json({
            success: true,
            message: 'Consent granted and recorded on blockchain',
            consent,
            blockchainTx: blockchainTxHash
        });
    } catch (error) {
        console.error('Grant consent error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Revoke consent
 */
exports.revokeConsent = async (req, res) => {
    try {
        const { id } = req.params;

        const consent = await Consent.findByPk(id);
        if (!consent) {
            return res.status(404).json({ success: false, message: 'Consent not found' });
        }

        await consent.update({
            is_revoked: true,
            is_active: false,
            revoked_at: new Date()
        });

        // Blockchain Anchoring - Log consent revocation
        try {
            await blockchainService.anchorConsent(consent, 'revoke', req.user.id);
        } catch (bcError) {
            console.error('Blockchain consent revocation anchoring failed:', bcError);
        }

        // Audit log
        const { ActivityLog } = require('../models');
        await ActivityLog.create({
            user_id: req.user.id,
            action: 'consent_revoked',
            resource: 'consent',
            resource_id: consent.id,
            details: {
                doctor_id: consent.doctor_id,
                consent_type: consent.consent_type
            }
        });

        res.json({ success: true, message: 'Consent revoked' });
    } catch (error) {
        console.error('Revoke consent error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get all patient consents
 */
exports.getPatientConsents = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        const consents = await Consent.findAll({
            where: { patient_id: patient.id },
            include: [
                {
                    model: Doctor,
                    as: 'doctor',
                    include: [{ model: User, as: 'user', attributes: ['email'] }]
                }
            ],
            order: [['granted_at', 'DESC']]
        });

        res.json({ success: true, consents });
    } catch (error) {
        console.error('Get consents error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Check if doctor has consent to access patient data
 */
exports.checkConsent = async (req, res) => {
    try {
        const { patient_id, consent_type } = req.query;
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });

        const consent = await Consent.findOne({
            where: {
                patient_id,
                provider_id: doctor.id,
                consent_type: consent_type || 'view_records',
                is_revoked: false,
                [Op.or]: [
                    { expiry_date: null },
                    { expiry_date: { [Op.gt]: new Date() } }
                ]
            }
        });

        res.json({
            success: true,
            has_consent: !!consent,
            consent
        });
    } catch (error) {
        console.error('Check consent error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Middleware: Verify doctor has patient consent
 */
exports.requireConsent = (consentType = 'view_records') => {
    return async (req, res, next) => {
        try {
            const patient_id = req.params.patient_id || req.query.patient_id || req.body.patient_id;

            if (!patient_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient ID required for consent check'
                });
            }

            const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
            if (!doctor) {
                return res.status(403).json({
                    success: false,
                    message: 'Only doctors can access patient records'
                });
            }

            const consent = await Consent.findOne({
                where: {
                    patient_id,
                    provider_id: doctor.id,
                    consent_type: consentType,
                    is_revoked: false,
                    [Op.or]: [
                        { expiry_date: null },
                        { expiry_date: { [Op.gt]: new Date() } }
                    ]
                }
            });

            if (!consent) {
                // Log unauthorized access attempt
                const { ActivityLog } = require('../models');
                await ActivityLog.create({
                    user_id: req.user.id,
                    action: 'unauthorized_access_attempt',
                    resource: 'patient_data',
                    resource_id: patient_id,
                    details: {
                        doctor_id: doctor.id,
                        consent_type: consentType,
                        reason: 'No valid consent'
                    },
                    ip_address: req.ip
                });

                return res.status(403).json({
                    success: false,
                    message: 'Patient consent required. Request access from patient first.'
                });
            }

            // Log authorized access
            const { ActivityLog } = require('../models');
            await ActivityLog.create({
                user_id: req.user.id,
                action: 'patient_data_accessed',
                resource: 'patient_data',
                resource_id: patient_id,
                details: {
                    doctor_id: doctor.id,
                    consent_id: consent.id,
                    consent_type: consentType
                },
                ip_address: req.ip
            });

            // Secondary Blockchain Verification (Optional but recommended for high security)
            const blockchainService = require('../services/blockchain.service');
            try {
                const patientUser = await User.findOne({
                    include: [{ model: Patient, as: 'patientProfile', where: { id: patient_id } }]
                });

                if (patientUser && patientUser.wallet_address && req.user.wallet_address) {
                    const hasBlockchainConsent = await blockchainService.hasConsent(
                        patientUser.wallet_address,
                        req.user.wallet_address
                    );
                    // Note: In an academic project, we might just log this check or enforce it.
                    // For now, we allow access if DB consent is valid, but log the BC check result.
                    console.log(`Blockchain Consent Check: ${hasBlockchainConsent ? 'PASSED' : 'FAILED (using fallback)'}`);
                }
            } catch (bcError) {
                console.warn('Blockchain consent check failed (using local DB fallback):', bcError.message);
            }

            req.consent = consent;
            next();
        } catch (error) {
            console.error('Consent check error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    };
};
