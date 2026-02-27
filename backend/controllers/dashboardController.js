const { Patient, Doctor, Pharmacy, Lab, Appointment, Prescription, MedicalReport, Consent, ActivityLog } = require('../models');
const blockchainService = require('../services/blockchain.service');
const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * Dynamic Dashboard Controller
 * Provides real-time, dynamic data for all user roles
 * with blockchain integration for sensitive operations
 */

/**
 * Patient Dynamic Dashboard
 */
exports.getPatientDashboard = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
        
        // Fetch all dynamic data in parallel
        const [
            upcomingAppointments,
            recentPrescriptions,
            recentReports,
            activePrescriptionCount,
            consentRequests,
            activityLogs,
            insuranceInfo
        ] = await Promise.all([
            Appointment.findAll({
                where: {
                    patient_id: patient.id,
                    appointment_date: { [Op.gte]: new Date() },
                    status: { [Op.in]: ['pending', 'confirmed'] }
                },
                include: [{ association: 'doctor', include: ['user'] }],
                order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']],
                limit: 5
            }),
            Prescription.findAll({
                where: { patient_id: patient.id },
                include: [
                    { association: 'doctor', include: ['user'] },
                    { association: 'items', include: ['medicine'] }
                ],
                order: [['created_at', 'DESC']],
                limit: 5
            }),
            MedicalReport.findAll({
                where: { patient_id: patient.id },
                order: [['created_at', 'DESC']],
                limit: 5
            }),
            Prescription.count({
                where: {
                    patient_id: patient.id,
                    status: 'active'
                }
            }),
            Consent.count({
                where: {
                    patient_id: patient.id,
                    is_active: false // Pending requests
                }
            }),
            ActivityLog.findAll({
                where: { user_id: req.user.id },
                order: [['created_at', 'DESC']],
                limit: 10
            }),
            require('../models').Insurance.findAll({
                where: { patient_id: patient.id, is_active: true }
            })
        ]);
        
        // Calculate health metrics
        const totalAppointments = await Appointment.count({ where: { patient_id: patient.id } });
        const completedAppointments = await Appointment.count({
            where: { patient_id: patient.id, status: 'completed' }
        });
        const totalReports = await MedicalReport.count({ where: { patient_id: patient.id } });
        
        // Log dashboard access to blockchain
        if (patient.blockchain_address) {
            await blockchainService.logAuditAction(
                patient.blockchain_address,
                'DASHBOARD_ACCESS',
                JSON.stringify({
                    userId: req.user.id,
                    timestamp: new Date(),
                    dataAccessed: 'patient_dashboard'
                })
            );
        }
        
        res.json({
            success: true,
            data: {
                patient: {
                    id: patient.id,
                    uniquePatientId: patient.unique_patient_id,
                    name: `${patient.first_name} ${patient.last_name}`,
                    bloodGroup: patient.blood_group,
                    blockchainConnected: !!patient.blockchain_address
                },
                stats: {
                    totalAppointments,
                    completedAppointments,
                    upcomingAppointments: upcomingAppointments.length,
                    totalReports,
                    activePrescriptions: activePrescriptionCount,
                    pendingConsentRequests: consentRequests
                },
                upcomingAppointments,
                recentPrescriptions,
                recentReports,
                insurance: insuranceInfo,
                recentActivity: activityLogs
            }
        });
    } catch (error) {
        console.error('Get patient dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Doctor Dynamic Dashboard
 */
exports.getDoctorDashboard = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch dynamic data
        const [
            todayAppointments,
            pendingAppointments,
            upcomingAppointments,
            recentPrescriptions,
            activePatients,
            consentedPatients,
            activityLogs
        ] = await Promise.all([
            Appointment.findAll({
                where: {
                    doctor_id: doctor.id,
                    appointment_date: today,
                    status: { [Op.in]: ['confirmed', 'pending'] }
                },
                include: [{ association: 'patient' }],
                order: [['appointment_time', 'ASC']]
            }),
            Appointment.findAll({
                where: {
                    doctor_id: doctor.id,
                    status: 'pending'
                },
                include: [{ association: 'patient' }],
                order: [['created_at', 'DESC']],
                limit: 10
            }),
            Appointment.findAll({
                where: {
                    doctor_id: doctor.id,
                    appointment_date: { [Op.gt]: today },
                    status: { [Op.in]: ['confirmed', 'pending'] }
                },
                include: [{ association: 'patient' }],
                order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']],
                limit: 10
            }),
            Prescription.findAll({
                where: { doctor_id: doctor.id },
                include: [
                    { association: 'patient' },
                    { association: 'items', include: ['medicine'] }
                ],
                order: [['created_at', 'DESC']],
                limit: 10
            }),
            Appointment.count({
                where: {
                    doctor_id: doctor.id,
                    status: 'completed'
                },
                distinct: true,
                col: 'patient_id'
            }),
            Consent.count({
                where: {
                    provider_id: req.user.id,
                    consent_type: 'view_records',
                    is_active: true
                }
            }),
            ActivityLog.findAll({
                where: { user_id: req.user.id },
                order: [['created_at', 'DESC']],
                limit: 10
            })
        ]);
        
        const totalAppointments = await Appointment.count({ where: { doctor_id: doctor.id } });
        const completedAppointments = await Appointment.count({
            where: { doctor_id: doctor.id, status: 'completed' }
        });
        const totalPrescriptions = await Prescription.count({ where: { doctor_id: doctor.id } });
        
        // Log to blockchain
        if (doctor.blockchain_address) {
            await blockchainService.logAuditAction(
                doctor.blockchain_address,
                'DASHBOARD_ACCESS',
                JSON.stringify({
                    userId: req.user.id,
                    role: 'doctor',
                    timestamp: new Date()
                })
            );
        }
        
        res.json({
            success: true,
            data: {
                doctor: {
                    id: doctor.id,
                    name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
                    specialization: doctor.specialization,
                    licenseNumber: doctor.license_number,
                    blockchainConnected: !!doctor.blockchain_address
                },
                stats: {
                    totalAppointments,
                    completedAppointments,
                    todayAppointments: todayAppointments.length,
                    pendingAppointments: pendingAppointments.length,
                    totalPrescriptions,
                    activePatients,
                    consentedPatients
                },
                todaySchedule: todayAppointments,
                pendingAppointments,
                upcomingAppointments,
                recentPrescriptions,
                recentActivity: activityLogs
            }
        });
    } catch (error) {
        console.error('Get doctor dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Pharmacy Dynamic Dashboard
 */
exports.getPharmacyDashboard = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findOne({ where: { user_id: req.user.id } });
        
        if (!pharmacy) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found' });
        }
        
        // Fetch dynamic data
        const [
            pendingPrescriptions,
            dispensedToday,
            recentPrescriptions,
            topMedicines,
            activityLogs
        ] = await Promise.all([
            Prescription.findAll({
                where: {
                    status: 'active',
                    dispensed_by_pharmacy_id: null
                },
                include: [
                    { association: 'patient' },
                    { association: 'doctor', include: ['user'] },
                    { association: 'items', include: ['medicine'] }
                ],
                order: [['created_at', 'DESC']],
                limit: 20
            }),
            Prescription.count({
                where: {
                    dispensed_by_pharmacy_id: pharmacy.id,
                    dispensed_at: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            Prescription.findAll({
                where: {
                    dispensed_by_pharmacy_id: pharmacy.id
                },
                include: [
                    { association: 'patient' },
                    { association: 'items', include: ['medicine'] }
                ],
                order: [['dispensed_at', 'DESC']],
                limit: 10
            }),
            require('../models').Medicine.findAll({
                attributes: ['id', 'name', 'manufacturer'],
                limit: 10,
                order: [['name', 'ASC']]
            }),
            ActivityLog.findAll({
                where: { user_id: req.user.id },
                order: [['created_at', 'DESC']],
                limit: 10
            })
        ]);
        
        const totalDispensed = await Prescription.count({
            where: { dispensed_by_pharmacy_id: pharmacy.id }
        });
        
        res.json({
            success: true,
            data: {
                pharmacy: {
                    id: pharmacy.id,
                    name: pharmacy.name,
                    licenseNumber: pharmacy.license_number,
                    address: pharmacy.address
                },
                stats: {
                    totalDispensed,
                    dispensedToday,
                    pendingPrescriptions: pendingPrescriptions.length
                },
                pendingPrescriptions,
                recentDispensed: recentPrescriptions,
                topMedicines,
                recentActivity: activityLogs
            }
        });
    } catch (error) {
        console.error('Get pharmacy dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Lab Dynamic Dashboard
 */
exports.getLabDashboard = async (req, res) => {
    try {
        const lab = await Lab.findOne({ where: { user_id: req.user.id } });
        
        if (!lab) {
            return res.status(404).json({ success: false, message: 'Lab not found' });
        }
        
        // Fetch dynamic data
        const [
            recentReports,
            uploadedToday,
            consentedPatients,
            activityLogs
        ] = await Promise.all([
            MedicalReport.findAll({
                where: { uploaded_by_lab_id: lab.id },
                include: [{ association: 'patient' }],
                order: [['created_at', 'DESC']],
                limit: 20
            }),
            MedicalReport.count({
                where: {
                    uploaded_by_lab_id: lab.id,
                    created_at: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            Consent.count({
                where: {
                    provider_id: req.user.id,
                    consent_type: 'lab_reports',
                    is_active: true
                }
            }),
            ActivityLog.findAll({
                where: { user_id: req.user.id },
                order: [['created_at', 'DESC']],
                limit: 10
            })
        ]);
        
        const totalReports = await MedicalReport.count({
            where: { uploaded_by_lab_id: lab.id }
        });
        
        const totalPatients = await MedicalReport.count({
            where: { uploaded_by_lab_id: lab.id },
            distinct: true,
            col: 'patient_id'
        });
        
        res.json({
            success: true,
            data: {
                lab: {
                    id: lab.id,
                    name: lab.name,
                    licenseNumber: lab.license_number,
                    address: lab.address
                },
                stats: {
                    totalReports,
                    uploadedToday,
                    totalPatients,
                    consentedPatients
                },
                recentReports,
                recentActivity: activityLogs
            }
        });
    } catch (error) {
        console.error('Get lab dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Admin Dynamic Dashboard
 */
exports.getAdminDashboard = async (req, res) => {
    try {
        // Fetch system-wide dynamic data
        const [
            totalUsers,
            totalPatients,
            totalDoctors,
            totalPharmacies,
            totalLabs,
            pendingDoctors,
            pendingPharmacies,
            pendingLabs,
            todayAppointments,
            recentActivity,
            systemStats
        ] = await Promise.all([
            require('../models').User.count(),
            Patient.count(),
            Doctor.count(),
            Pharmacy.count(),
            Lab.count(),
            Doctor.count({ where: { is_approved: false } }),
            Pharmacy.count({ where: { is_approved: false } }),
            Lab.count({ where: { is_approved: false } }),
            Appointment.count({
                where: {
                    appointment_date: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }),
            ActivityLog.findAll({
                include: [{ model: require('../models').User, as: 'user', attributes: ['email'] }],
                order: [['created_at', 'DESC']],
                limit: 20
            }),
            Promise.all([
                Prescription.count(),
                MedicalReport.count(),
                Consent.count(),
                require('../models').Medicine.count()
            ])
        ]);
        
        const [totalPrescriptions, totalReports, totalConsents, totalMedicines] = systemStats;
        
        res.json({
            success: true,
            data: {
                userStats: {
                    totalUsers,
                    totalPatients,
                    totalDoctors,
                    totalPharmacies,
                    totalLabs
                },
                pendingApprovals: {
                    doctors: pendingDoctors,
                    pharmacies: pendingPharmacies,
                    labs: pendingLabs,
                    total: pendingDoctors + pendingPharmacies + pendingLabs
                },
                systemStats: {
                    totalPrescriptions,
                    totalReports,
                    totalConsents,
                    totalMedicines,
                    todayAppointments
                },
                recentActivity
            }
        });
    } catch (error) {
        console.error('Get admin dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = exports;
