const { Patient, Doctor, Lab, Consent, MedicalReport, Prescription, Appointment, Insurance, FamilyMember, EmergencyContact } = require('../models');
const blockchainService = require('../services/blockchain.service');
const crypto = require('crypto');

/**
 * Patient Access Controller
 * Handles permission-based access to patient information
 * with blockchain logging for all operations
 */

/**
 * Generate unique patient ID
 */
const generateUniquePatientId = async () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const uniqueId = `HID-${year}-${randomNum}`;
    
    // Check if ID already exists
    const existing = await Patient.findOne({ where: { unique_patient_id: uniqueId } });
    if (existing) {
        return generateUniquePatientId(); // Recursively generate new ID
    }
    
    return uniqueId;
};

/**
 * Initialize patient with unique ID (called after registration)
 */
exports.initializePatientId = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        
        if (patient.unique_patient_id) {
            return res.json({
                success: true,
                message: 'Patient ID already exists',
                uniquePatientId: patient.unique_patient_id
            });
        }
        
        const uniqueId = await generateUniquePatientId();
        await patient.update({ unique_patient_id: uniqueId });
        
        // Log to blockchain
        if (patient.blockchain_address) {
            await blockchainService.logAuditAction(
                patient.blockchain_address,
                'PATIENT_ID_GENERATED',
                JSON.stringify({ uniqueId, timestamp: new Date() })
            );
        }
        
        res.json({
            success: true,
            message: 'Unique patient ID generated',
            uniquePatientId: uniqueId
        });
    } catch (error) {
        console.error('Initialize patient ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Doctor: Lookup patient by unique ID with consent verification
 */
exports.doctorLookupPatient = async (req, res) => {
    try {
        const { uniquePatientId } = req.query;
        
        if (!uniquePatientId) {
            return res.status(400).json({ success: false, message: 'Patient ID is required' });
        }
        
        // Get doctor info
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }
        
        // Find patient
        const patient = await Patient.findOne({
            where: { unique_patient_id: uniquePatientId }
        });
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        
        // Check consent - doctor needs permission to view patient records
        const consent = await Consent.findOne({
            where: {
                patient_id: patient.id,
                provider_id: doctor.user_id,
                consent_type: 'view_records',
                is_active: true
            }
        });
        
        if (!consent) {
            // Log unauthorized access attempt to blockchain
            if (doctor.blockchain_address && patient.blockchain_address) {
                await blockchainService.logAuditAction(
                    doctor.blockchain_address,
                    'UNAUTHORIZED_ACCESS_ATTEMPT',
                    JSON.stringify({
                        patientId: uniquePatientId,
                        doctorId: doctor.id,
                        timestamp: new Date()
                    })
                );
            }
            
            return res.status(403).json({
                success: false,
                message: 'You do not have consent to view this patient\'s records. Please request consent from the patient first.',
                requiresConsent: true,
                patientId: patient.id
            });
        }
        
        // Get patient full information (dynamic)
        const [medicalReports, prescriptions, appointments, insurances, familyMembers, emergencyContacts] = await Promise.all([
            MedicalReport.findAll({ where: { patient_id: patient.id }, order: [['created_at', 'DESC']] }),
            Prescription.findAll({
                where: { patient_id: patient.id },
                include: [{ association: 'items', include: ['medicine'] }],
                order: [['created_at', 'DESC']]
            }),
            Appointment.findAll({
                where: { patient_id: patient.id },
                include: [{ association: 'doctor', include: ['user'] }],
                order: [['appointment_date', 'DESC']]
            }),
            Insurance.findAll({ where: { patient_id: patient.id, is_active: true } }),
            FamilyMember.findAll({ where: { patient_id: patient.id } }),
            EmergencyContact.findAll({ where: { patient_id: patient.id } })
        ]);
        
        // Log access to blockchain
        if (doctor.blockchain_address && patient.blockchain_address) {
            await blockchainService.logAuditAction(
                doctor.blockchain_address,
                'PATIENT_RECORD_ACCESSED',
                JSON.stringify({
                    patientId: uniquePatientId,
                    doctorId: doctor.id,
                    accessType: 'full_view',
                    timestamp: new Date()
                })
            );
        }
        
        res.json({
            success: true,
            data: {
                patient: {
                    id: patient.id,
                    uniquePatientId: patient.unique_patient_id,
                    firstName: patient.first_name,
                    lastName: patient.last_name,
                    dateOfBirth: patient.date_of_birth,
                    gender: patient.gender,
                    bloodGroup: patient.blood_group,
                    phone: patient.phone,
                    address: patient.address,
                    allergies: patient.allergies,
                    chronicConditions: patient.chronic_conditions
                },
                medicalHistory: {
                    reports: medicalReports,
                    prescriptions: prescriptions,
                    appointments: appointments
                },
                insurance: insurances,
                family: familyMembers,
                emergencyContacts: emergencyContacts,
                consentInfo: {
                    grantedAt: consent.created_at,
                    expiresAt: consent.expires_at
                }
            }
        });
    } catch (error) {
        console.error('Doctor lookup patient error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Lab: Access patient info via unique ID for report upload
 */
exports.labLookupPatient = async (req, res) => {
    try {
        const { uniquePatientId } = req.query;
        
        if (!uniquePatientId) {
            return res.status(400).json({ success: false, message: 'Patient ID is required' });
        }
        
        // Get lab info
        const lab = await Lab.findOne({ where: { user_id: req.user.id } });
        if (!lab) {
            return res.status(404).json({ success: false, message: 'Lab profile not found' });
        }
        
        // Find patient
        const patient = await Patient.findOne({
            where: { unique_patient_id: uniquePatientId }
        });
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        
        // Check if lab has consent for uploading reports
        const consent = await Consent.findOne({
            where: {
                patient_id: patient.id,
                provider_id: lab.user_id,
                consent_type: 'lab_reports',
                is_active: true
            }
        });
        
        if (!consent) {
            // Log unauthorized access
            if (lab.blockchain_address && patient.blockchain_address) {
                await blockchainService.logAuditAction(
                    lab.blockchain_address,
                    'UNAUTHORIZED_LAB_ACCESS_ATTEMPT',
                    JSON.stringify({
                        patientId: uniquePatientId,
                        labId: lab.id,
                        timestamp: new Date()
                    })
                );
            }
            
            return res.status(403).json({
                success: false,
                message: 'You do not have consent to upload reports for this patient. Patient must grant lab_reports consent.',
                requiresConsent: true,
                patientId: patient.id
            });
        }
        
        // Get patient basic info and previous reports from this lab
        const previousReports = await MedicalReport.findAll({
            where: {
                patient_id: patient.id,
                uploaded_by_lab_id: lab.id
            },
            order: [['created_at', 'DESC']],
            limit: 10
        });
        
        // Log access
        if (lab.blockchain_address && patient.blockchain_address) {
            await blockchainService.logAuditAction(
                lab.blockchain_address,
                'PATIENT_LAB_ACCESS',
                JSON.stringify({
                    patientId: uniquePatientId,
                    labId: lab.id,
                    purpose: 'report_upload',
                    timestamp: new Date()
                })
            );
        }
        
        res.json({
            success: true,
            data: {
                patient: {
                    id: patient.id,
                    uniquePatientId: patient.unique_patient_id,
                    firstName: patient.first_name,
                    lastName: patient.last_name,
                    dateOfBirth: patient.date_of_birth,
                    gender: patient.gender,
                    bloodGroup: patient.blood_group
                },
                previousReports: previousReports,
                consentInfo: {
                    grantedAt: consent.created_at,
                    expiresAt: consent.expires_at
                }
            }
        });
    } catch (error) {
        console.error('Lab lookup patient error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Request consent from patient (for doctors/labs)
 */
exports.requestConsent = async (req, res) => {
    try {
        const { uniquePatientId, consentType, message } = req.body;
        
        if (!uniquePatientId || !consentType) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID and consent type are required'
            });
        }
        
        // Find patient
        const patient = await Patient.findOne({
            where: { unique_patient_id: uniquePatientId }
        });
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        
        // Create consent request (stored as inactive consent with pending status)
        const { Notification } = require('../models');
        await Notification.create({
            user_id: patient.user_id,
            type: 'consent_request',
            title: 'New Consent Request',
            message: message || `A ${req.user.role} has requested ${consentType} consent. Please review and approve.`,
            metadata: JSON.stringify({
                requesterId: req.user.id,
                requesterRole: req.user.role,
                consentType: consentType,
                uniquePatientId: uniquePatientId
            })
        });
        
        res.json({
            success: true,
            message: 'Consent request sent to patient'
        });
    } catch (error) {
        console.error('Request consent error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Get patient info by scanning QR code
 */
exports.scanPatientQR = async (req, res) => {
    try {
        const { qrData } = req.body;
        
        if (!qrData) {
            return res.status(400).json({ success: false, message: 'QR data is required' });
        }
        
        // Parse QR data (should contain unique patient ID)
        let patientData;
        try {
            patientData = JSON.parse(qrData);
        } catch {
            patientData = { uniquePatientId: qrData };
        }
        
        const patient = await Patient.findOne({
            where: { unique_patient_id: patientData.uniquePatientId }
        });
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Invalid QR code' });
        }
        
        // Return basic info (emergency info visible without consent)
        const emergencyContacts = await EmergencyContact.findAll({
            where: { patient_id: patient.id }
        });
        
        res.json({
            success: true,
            data: {
                patient: {
                    uniquePatientId: patient.unique_patient_id,
                    firstName: patient.first_name,
                    lastName: patient.last_name,
                    bloodGroup: patient.blood_group,
                    allergies: patient.allergies,
                    chronicConditions: patient.chronic_conditions
                },
                emergencyContacts: emergencyContacts,
                note: 'This is emergency information. Full access requires patient consent.'
            }
        });
    } catch (error) {
        console.error('Scan QR error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = exports;
