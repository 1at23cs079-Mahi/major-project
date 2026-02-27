const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Ensure QR directory exists
const qrDirectory = path.join(__dirname, '../uploads/qrcodes');
if (!fs.existsSync(qrDirectory)) {
    fs.mkdirSync(qrDirectory, { recursive: true });
}

/**
 * Generate QR code for prescription
 * @param {Object} data - Data to encode in QR code
 * @param {string} filename - Filename to save QR code
 * @returns {Promise<string>} - Path to generated QR code
 */
const generatePrescriptionQR = async (data, filename) => {
    try {
        const qrPath = path.join(qrDirectory, `${filename}.png`);
        const qrData = JSON.stringify(data);

        await QRCode.toFile(qrPath, qrData, {
            errorCorrectionLevel: 'H',
            type: 'png',
            quality: 0.92,
            margin: 1,
            width: 300
        });

        return `uploads/qrcodes/${filename}.png`;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Generate QR code for patient health card
 * @param {Object} patientData - Patient health information
 * @param {number} patientId - Patient ID
 * @returns {Promise<string>} - Path to generated QR code
 */
const generateHealthCardQR = async (patientData, patientId) => {
    try {
        const filename = `health-card-${patientId}-${Date.now()}`;
        const qrPath = path.join(qrDirectory, `${filename}.png`);

        const healthCardData = {
            type: 'health_card',
            patientId: patientData.id,
            name: `${patientData.first_name} ${patientData.last_name}`,
            bloodGroup: patientData.blood_group,
            allergies: patientData.allergies,
            chronicConditions: patientData.chronic_conditions,
            emergencyContact: patientData.emergency_contact
        };

        await QRCode.toFile(qrPath, JSON.stringify(healthCardData), {
            errorCorrectionLevel: 'H',
            type: 'png',
            quality: 0.92,
            margin: 1,
            width: 400
        });

        return `uploads/qrcodes/${filename}.png`;
    } catch (error) {
        console.error('Health card QR generation error:', error);
        throw new Error('Failed to generate health card QR code');
    }
};

/**
 * Generate QR code as data URL (for inline display)
 * @param {Object} data - Data to encode
 * @returns {Promise<string>} - QR code as base64 data URL
 */
const generateQRDataURL = async (data) => {
    try {
        const qrDataURL = await QRCode.toDataURL(JSON.stringify(data), {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            width: 300
        });

        return qrDataURL;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};

module.exports = {
    generatePrescriptionQR,
    generateHealthCardQR,
    generateQRDataURL
};
