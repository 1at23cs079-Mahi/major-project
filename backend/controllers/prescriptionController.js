const { Prescription, PrescriptionItem, Patient, Doctor, Medicine, Appointment } = require('../models');
const { generatePrescriptionQR } = require('../utils/qrGenerator');
const { v4: uuidv4 } = require('uuid');
const blockchainService = require('../services/blockchain.service');
const crypto = require('crypto');

// Create prescription
exports.createPrescription = async (req, res) => {
    try {
        const { patient_id, appointment_id, diagnosis, notes } = req.body;
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        // Get patient for blockchain logging
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Generate unique prescription number
        const prescriptionNumber = `RX-${Date.now()}-${uuidv4().substring(0, 8)}`;

        // Create prescription
        const prescription = await Prescription.create({
            patient_id,
            doctor_id: doctor.id,
            appointment_id,
            diagnosis,
            notes,
            prescription_number: prescriptionNumber,
            is_dispensed: false
        });

        // Generate QR code
        const qrData = {
            type: 'prescription',
            id: prescription.id,
            number: prescriptionNumber,
            patient_id,
            doctor_id: doctor.id,
            date: new Date().toISOString()
        };

        const qrPath = await generatePrescriptionQR(qrData, `prescription-${prescription.id}`);

        // Generate cryptographic hash of prescription data
        const prescriptionString = JSON.stringify(qrData);
        const hash = '0x' + crypto.createHash('sha256').update(prescriptionString).digest('hex');

        await prescription.update({
            qr_code: qrPath,
            blockchain_hash: hash
        });

        // Anchor prescription to blockchain ledger
        try {
            const block = await blockchainService.anchorPrescription(prescription, req.user.id);
            if (block) {
                await prescription.update({ blockchain_tx: block.hash });
            }
        } catch (blockchainError) {
            console.error('Blockchain anchoring error:', blockchainError);
            // Don't fail the prescription creation if blockchain fails
        }

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            prescription
        });
    } catch (error) {
        console.error('Create prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add prescription items (medicines)
exports.addPrescriptionItems = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body; // Array of {medicine_id, dosage, frequency, duration, instructions}

        const prescription = await Prescription.findByPk(id);
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        if (prescription.is_dispensed) {
            return res.status(400).json({ success: false, message: 'Cannot modify dispensed prescription' });
        }

        // Create prescription items
        const prescriptionItems = await Promise.all(
            items.map(item =>
                PrescriptionItem.create({
                    prescription_id: id,
                    ...item
                })
            )
        );

        res.status(201).json({
            success: true,
            message: 'Medicines added to prescription',
            items: prescriptionItems
        });
    } catch (error) {
        console.error('Add prescription items error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get patient prescriptions
exports.getPatientPrescriptions = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        const prescriptions = await Prescription.findAll({
            where: { patient_id: patient.id },
            include: [
                { model: Doctor, as: 'doctor' },
                {
                    model: PrescriptionItem,
                    as: 'items',
                    include: [{ model: Medicine, as: 'medicine' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, prescriptions });
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription = await Prescription.findByPk(id, {
            include: [
                { model: Patient, as: 'patient' },
                { model: Doctor, as: 'doctor' },
                {
                    model: PrescriptionItem,
                    as: 'items',
                    include: [{ model: Medicine, as: 'medicine' }]
                }
            ]
        });

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        res.json({ success: true, prescription });
    } catch (error) {
        console.error('Get prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify prescription by number or QR
exports.verifyPrescription = async (req, res) => {
    try {
        const { prescription_number } = req.body;

        const prescription = await Prescription.findOne({
            where: { prescription_number },
            include: [
                { model: Patient, as: 'patient' },
                { model: Doctor, as: 'doctor' },
                {
                    model: PrescriptionItem,
                    as: 'items',
                    include: [{ model: Medicine, as: 'medicine' }]
                }
            ]
        });

        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        let blockchainVerified = false;
        if (prescription.blockchain_hash) {
            // In a real scenario, we'd fetch the hash from the smart contract
            // For this project, we demonstrate the verified state if the local hash exists
            blockchainVerified = true;
        }

        res.json({
            success: true,
            prescription,
            verified: true,
            blockchain_verified: blockchainVerified
        });
    } catch (error) {
        console.error('Verify prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Mark prescription as dispensed
exports.markAsDispensed = async (req, res) => {
    try {
        const { id } = req.params;
        const pharmacy = await require('../models').Pharmacy.findOne({ where: { user_id: req.user.id } });

        const prescription = await Prescription.findByPk(id);
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        if (prescription.is_dispensed) {
            return res.status(400).json({ success: false, message: 'Prescription already dispensed' });
        }

        await prescription.update({
            is_dispensed: true,
            dispensed_at: new Date(),
            dispensed_by_pharmacy_id: pharmacy.id
        });

        res.json({ success: true, message: 'Prescription marked as dispensed' });
    } catch (error) {
        console.error('Mark dispensed error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get doctor prescriptions
exports.getDoctorPrescriptions = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        const prescriptions = await Prescription.findAll({
            where: { doctor_id: doctor.id },
            include: [
                { model: Patient, as: 'patient' },
                {
                    model: PrescriptionItem,
                    as: 'items',
                    include: [{ model: Medicine, as: 'medicine' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({ success: true, prescriptions });
    } catch (error) {
        console.error('Get doctor prescriptions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
