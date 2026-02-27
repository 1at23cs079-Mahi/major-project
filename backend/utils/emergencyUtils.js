const { generateQRDataURL } = require('./qrGenerator');

/**
 * Generate health card QR code
 * Enhanced version with retry and fallback
 */
const generateHealthCardQR = async (healthCardData, patientId) => {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Generate QR code as data URL
            const qrDataURL = await generateQRDataURL({
                type: 'health_card',
                version: '1.0',
                patient_id: patientId,
                data: healthCardData,
                generated_at: new Date().toISOString()
            });

            return qrDataURL;
        } catch (error) {
            lastError = error;
            console.error(`Health card QR generation attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
            }
        }
    }

    // All retries failed - log critical error
    console.error('CRITICAL: Health card QR generation failed after all retries:', lastError);

    // Return fallback text-only data
    return {
        error: true,
        message: 'QR code generation failed',
        fallback_data: {
            name: healthCardData.name,
            blood_group: healthCardData.blood_group,
            emergency_contact: healthCardData.emergency_contact?.phone
        }
    };
};

/**
 * Validate emergency data before processing
 */
const validateEmergencyData = (data) => {
    const errors = [];

    if (!data.location || !data.location.latitude || !data.location.longitude) {
        errors.push('Location coordinates required for emergency');
    }

    if (!data.emergency_type) {
        errors.push('Emergency type required');
    }

    const validTypes = ['medical', 'accident', 'cardiac', 'respiratory', 'trauma', 'other'];
    if (data.emergency_type && !validTypes.includes(data.emergency_type)) {
        errors.push(`Invalid emergency type. Must be one of: ${validTypes.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Priority notification routing
 * Routes based on emergency severity
 */
const routeEmergencyNotification = async (emergency) => {
    const priority = determinePriority(emergency);

    const routingConfig = {
        critical: {
            channels: ['sms', 'call', 'push', 'email'],
            retries: 5,
            timeout: 30000 // 30 seconds
        },
        high: {
            channels: ['sms', 'push', 'email'],
            retries: 3,
            timeout: 60000 // 1 minute
        },
        normal: {
            channels: ['push', 'email'],
            retries: 2,
            timeout: 120000 // 2 minutes
        }
    };

    return routingConfig[priority] || routingConfig.normal;
};

/**
 * Determine emergency priority
 */
const determinePriority = (emergency) => {
    const criticalTypes = ['cardiac', 'respiratory', 'trauma'];

    if (criticalTypes.includes(emergency.emergency_type)) {
        return 'critical';
    }

    if (emergency.severity === 'high') {
        return 'high';
    }

    return 'normal';
};

/**
 * Log emergency event with failover
 * Ensures emergency is ALWAYS logged even if primary logging fails
 */
const logEmergencyEvent = async (eventData) => {
    const { ActivityLog } = require('../models');

    try {
        // Primary logging
        await ActivityLog.create(eventData);
    } catch (error) {
        console.error('Primary emergency logging failed:', error);

        try {
            // Failover 1: Write to file system
            const fs = require('fs');
            const path = require('path');
            const logDir = path.join(__dirname, '../../emergency_logs');

            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const logFile = path.join(logDir, `emergency_${Date.now()}.json`);
            fs.writeFileSync(logFile, JSON.stringify({
                ...eventData,
                failover: true,
                logged_at: new Date().toISOString()
            }, null, 2));

            console.log(`Emergency logged to file: ${logFile}`);
        } catch (fileError) {
            // Failover 2: Console log (last resort)
            console.error('CRITICAL: All emergency logging failed!', {
                original_error: error,
                file_error: fileError,
                event_data: eventData
            });
        }
    }
};

module.exports = {
    generateHealthCardQR,
    validateEmergencyData,
    routeEmergencyNotification,
    determinePriority,
    logEmergencyEvent
};
