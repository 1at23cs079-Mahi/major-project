const { MedicalReport, Patient, Doctor, Lab } = require('../models');
const upload = require('../middleware/upload');
const blockchainService = require('../services/blockchain.service');
const crypto = require('crypto');
const fs = require('fs');

// Upload medical report
exports.uploadReport = async (req, res) => {
    try {
        const { patient_id, report_type, title, notes } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        let uploadedBy = {};
        let uploaderProfile = null;
        
        if (req.user.role === 'Doctor') {
            const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
            uploadedBy.uploaded_by_doctor_id = doctor.id;
            uploaderProfile = doctor;
        } else if (req.user.role === 'Lab') {
            const lab = await Lab.findOne({ where: { user_id: req.user.id } });
            uploadedBy.uploaded_by_lab_id = lab.id;
            uploaderProfile = lab;
        }

        // Get patient for blockchain
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Generate SHA-256 hash of the file
        const fileBuffer = fs.readFileSync(req.file.path);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const blockchainHash = '0x' + hash;

        const report = await MedicalReport.create({
            patient_id,
            ...uploadedBy,
            report_type,
            title,
            file_path: req.file.path,
            file_type: req.file.mimetype,
            file_size: req.file.size,
            notes,
            upload_date: new Date(),
            blockchain_hash: blockchainHash
        });

        // Anchor to blockchain ledger
        try {
            const block = await blockchainService.anchorMedicalRecord(report, req.user.id);
            if (block) {
                await report.update({ blockchain_tx: block.hash });
            }
        } catch (bcError) {
            console.error('Blockchain anchoring failed:', bcError);
            // Continue as local DB record is created
        }

        res.status(201).json({
            success: true,
            message: 'Report uploaded and anchored to blockchain',
            report
        });
    } catch (error) {
        console.error('Upload report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get patient medical reports
exports.getPatientReports = async (req, res) => {
    try {
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        const reports = await MedicalReport.findAll({
            where: { patient_id: patient.id },
            include: [
                { model: Doctor, as: 'doctor', required: false },
                { model: Lab, as: 'lab', required: false }
            ],
            order: [['upload_date', 'DESC']]
        });

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get patient medical reports (for Doctor with consent)
exports.getReportsForDoctor = async (req, res) => {
    try {
        const { patient_id } = req.params;

        const reports = await MedicalReport.findAll({
            where: { patient_id },
            include: [
                { model: Doctor, as: 'doctor', required: false },
                { model: Lab, as: 'lab', required: false }
            ],
            order: [['upload_date', 'DESC']]
        });

        res.json({ success: true, reports });
    } catch (error) {
        console.error('Get reports for doctor error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get report by ID
exports.getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await MedicalReport.findByPk(id, {
            include: [
                { model: Patient, as: 'patient' },
                { model: Doctor, as: 'doctor', required: false },
                { model: Lab, as: 'lab', required: false }
            ]
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Verify the user has permission to view this report
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        const lab = await Lab.findOne({ where: { user_id: req.user.id } });
        const isOwner = patient && report.patient_id === patient.id;
        const isUploadingDoctor = doctor && report.uploaded_by_doctor_id === doctor.id;
        const isUploadingLab = lab && report.uploaded_by_lab_id === lab.id;
        if (!isOwner && !isUploadingDoctor && !isUploadingLab) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
        }

        res.json({ success: true, report });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await MedicalReport.findByPk(id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Verify ownership - only the patient who owns the report or the uploader can delete
        const patient = await Patient.findOne({ where: { user_id: req.user.id } });
        const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
        const lab = await Lab.findOne({ where: { user_id: req.user.id } });
        const isOwner = patient && report.patient_id === patient.id;
        const isUploadingDoctor = doctor && report.uploaded_by_doctor_id === doctor.id;
        const isUploadingLab = lab && report.uploaded_by_lab_id === lab.id;
        if (!isOwner && !isUploadingDoctor && !isUploadingLab) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
        }

        // Delete file from filesystem
        const fs = require('fs');
        if (fs.existsSync(report.file_path)) {
            fs.unlinkSync(report.file_path);
        }

        await report.destroy();
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
