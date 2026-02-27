const { Consent } = require('../models');
const BlockchainService = require('../services/blockchain.service');

const blockchainService = new BlockchainService();

/**
 * Enhanced Permission Verification Middleware
 * Checks consent and logs access to blockchain
 */

/**
 * Verify patient consent for data access
 */
exports.verifyPatientConsent = (consentType = 'view_records') => {
    return async (req, res, next) => {
        try {
            const patientId = req.params.patient_id || req.query.patient_id || req.body.patient_id;
            
            if (!patientId) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient ID is required for consent verification'
                });
            }
            
            // Check if requester has consent
            const consent = await Consent.findOne({
                where: {
                    patient_id: patientId,
                    provider_id: req.user.id,
                    consent_type: consentType,
                    is_active: true
                }
            });
            
            if (!consent) {
                // Log unauthorized attempt to blockchain
                if (req.user.blockchainAddress) {
                    await blockchainService.logAuditAction(
                        req.user.blockchainAddress,
                        'UNAUTHORIZED_ACCESS_ATTEMPT',
                        JSON.stringify({
                            patientId,
                            userId: req.user.id,
                            consentType,
                            timestamp: new Date()
                        })
                    );
                }
                
                return res.status(403).json({
                    success: false,
                    message: `You do not have ${consentType} consent for this patient`,
                    requiresConsent: true,
                    consentType
                });
            }
            
            // Check if consent is expired
            if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
                return res.status(403).json({
                    success: false,
                    message: 'Consent has expired. Please request new consent.',
                    consentExpired: true
                });
            }
            
            // Attach consent info to request
            req.consentInfo = {
                consentId: consent.id,
                grantedAt: consent.created_at,
                expiresAt: consent.expires_at,
                consentType: consent.consent_type
            };
            
            next();
        } catch (error) {
            console.error('Verify consent error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    };
};

/**
 * Log sensitive operations to blockchain
 */
exports.logToBlockchain = (actionType) => {
    return async (req, res, next) => {
        // Store original send function
        const originalSend = res.json;
        
        // Override res.json to log after successful response
        res.json = async function(data) {
            // Only log successful operations
            if (data.success && req.user.blockchainAddress) {
                try {
                    await blockchainService.logAuditAction(
                        req.user.blockchainAddress,
                        actionType,
                        JSON.stringify({
                            userId: req.user.id,
                            role: req.user.role,
                            endpoint: req.originalUrl,
                            method: req.method,
                            timestamp: new Date(),
                            data: {
                                patientId: req.params.patient_id || req.query.patient_id,
                                consentInfo: req.consentInfo
                            }
                        })
                    );
                } catch (blockchainError) {
                    console.error('Blockchain logging error:', blockchainError);
                    // Don't fail the request if blockchain logging fails
                }
            }
            
            // Call original send function
            originalSend.call(this, data);
        };
        
        next();
    };
};

/**
 * Verify unique patient ID format
 */
exports.validatePatientId = (req, res, next) => {
    const uniquePatientId = req.query.uniquePatientId || req.body.uniquePatientId || req.params.uniquePatientId;
    
    if (!uniquePatientId) {
        return res.status(400).json({
            success: false,
            message: 'Unique patient ID is required'
        });
    }
    
    // Validate format: HID-YYYY-XXXXX
    const patientIdPattern = /^HID-\d{4}-\d{5}$/;
    if (!patientIdPattern.test(uniquePatientId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid patient ID format. Expected format: HID-YYYY-XXXXX'
        });
    }
    
    req.validatedPatientId = uniquePatientId;
    next();
};

/**
 * Rate limit for sensitive operations
 */
exports.sensitiveOperationLimit = (maxAttempts = 10, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();
    
    return (req, res, next) => {
        const key = `${req.user.id}_${req.originalUrl}`;
        const now = Date.now();
        
        if (!attempts.has(key)) {
            attempts.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const record = attempts.get(key);
        
        if (now > record.resetTime) {
            // Reset window
            attempts.set(key, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        if (record.count >= maxAttempts) {
            // Log suspicious activity to blockchain
            if (req.user.blockchainAddress) {
                blockchainService.logAuditAction(
                    req.user.blockchainAddress,
                    'RATE_LIMIT_EXCEEDED',
                    JSON.stringify({
                        userId: req.user.id,
                        endpoint: req.originalUrl,
                        attempts: record.count,
                        timestamp: new Date()
                    })
                ).catch(err => console.error('Blockchain log error:', err));
            }
            
            return res.status(429).json({
                success: false,
                message: 'Too many attempts. Please try again later.',
                retryAfter: Math.ceil((record.resetTime - now) / 1000)
            });
        }
        
        record.count++;
        next();
    };
};

/**
 * Verify blockchain address exists for user
 */
exports.requireBlockchainAddress = async (req, res, next) => {
    const { Patient, Doctor, Lab, Pharmacy } = require('../models');
    
    try {
        let profile = null;
        const role = req.user.role;
        
        if (role === 'Patient') {
            profile = await Patient.findOne({ where: { user_id: req.user.id } });
        } else if (role === 'Doctor') {
            profile = await Doctor.findOne({ where: { user_id: req.user.id } });
        } else if (role === 'Lab') {
            profile = await Lab.findOne({ where: { user_id: req.user.id } });
        } else if (role === 'Pharmacy') {
            profile = await Pharmacy.findOne({ where: { user_id: req.user.id } });
        }
        
        if (!profile || !profile.blockchain_address) {
            return res.status(400).json({
                success: false,
                message: 'Blockchain address not configured. Please set up your blockchain wallet first.',
                requiresSetup: true
            });
        }
        
        req.user.blockchainAddress = profile.blockchain_address;
        next();
    } catch (error) {
        console.error('Verify blockchain address error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = exports;
