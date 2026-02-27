const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { User, Role, Patient, Doctor, Pharmacy, Lab, Notification, ActivityLog } = require('../models');
const {
    generateTokenPair,
    verifyRefreshToken,
    generateAccessToken
} = require('../middleware/authEnhanced');
const { sanitizeInput } = require('../utils/helpers');
const emailService = require('../services/email.service');

/**
 * Enhanced Authentication Controller
 * Supports multiple user types with better security
 */

// Validation rules
const emailValidation = body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format');

const passwordValidation = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character');

const commonValidation = [
    emailValidation,
    passwordValidation
];

// Hash password with bcrypt
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Verify password
const verifyPassword = async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

// Log activity - CRITICAL for HIPAA compliance
const logActivity = async (userId, action, details = {}, req = null) => {
    try {
        await ActivityLog.create({
            user_id: userId,
            action,
            details: JSON.stringify(details),
            ip_address: req?.ip || req?.connection?.remoteAddress || '0.0.0.0'
        });
    } catch (error) {
        console.error('❌ CRITICAL: Activity logging failed for user', userId, 'action:', action);
        console.error('   Error:', error.message);
        
        // Alert administrators about audit log failure (HIPAA compliance requirement)
        const adminEmail = process.env.ADMIN_ALERT_EMAIL;
        if (adminEmail) {
            emailService.sendEmail(
                adminEmail,
                '🚨 CRITICAL: Audit Log Failure Alert',
                `<h2>Audit Log Failure</h2>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>User ID:</strong> ${userId}</p>
                <p><strong>Action:</strong> ${action}</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <p>This failure may indicate a database or system issue. Immediate investigation required for HIPAA compliance.</p>`
            ).catch(emailErr => {
                console.error('Failed to send audit failure alert email:', emailErr.message);
            });
        }
        
        // For HIPAA compliance, audit log failures should abort critical operations
        if (process.env.AUDIT_LOG_REQUIRED === 'true') {
            throw new Error('Audit logging failed - operation aborted for compliance');
        }
    }
};

/**
 * PATIENT AUTHENTICATION
 */

exports.registerPatient = [
    ...commonValidation,
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password, firstName, lastName, phone, dateOfBirth, gender, bloodGroup } = req.body;

            // Check if user exists
            let existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Get Patient role
            const patientRole = await Role.findOne({ where: { name: 'Patient' } });
            if (!patientRole) {
                return res.status(500).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            // Create user (password will be hashed by model hook)
            const user = await User.create({
                email: email.toLowerCase(),
                password_hash: password,
                role_id: patientRole.id,
                is_active: true
            });

            // Create patient profile
            const patient = await Patient.create({
                user_id: user.id,
                first_name: sanitizeInput(firstName),
                last_name: sanitizeInput(lastName),
                phone: phone || null,
                date_of_birth: dateOfBirth || null,
                gender: gender || null,
                blood_group: bloodGroup || null
            });

            // Create welcome notification
            await Notification.create({
                user_id: user.id,
                type: 'welcome',
                title: 'Welcome to Healthcare System',
                message: 'Your patient account has been created successfully.'
            });

            // Send welcome email
            await emailService.sendWelcome(email, firstName, 'patient');

            // Log activity
            await logActivity(user.id, 'PATIENT_REGISTRATION', {
                email: user.email
            }, req);

            // Generate tokens
            const { accessToken, refreshToken } = generateTokenPair(user.id);

            res.status(201).json({
                success: true,
                message: 'Patient registered successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: 'Patient'
                    },
                    profile: {
                        firstName: patient.first_name,
                        lastName: patient.last_name
                    },
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                }
            });
        } catch (error) {
            console.error('Register patient error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            });
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
];

/**
 * DOCTOR AUTHENTICATION
 */

exports.registerDoctor = [
    ...commonValidation,
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
    body('specialization').trim().notEmpty().withMessage('Specialization is required'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password, firstName, lastName, licenseNumber, specialization, qualification, phone } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Check if license number already exists
            const existingDoctor = await Doctor.findOne({ where: { license_number: licenseNumber } });
            if (existingDoctor) {
                return res.status(409).json({
                    success: false,
                    message: 'License number already registered'
                });
            }

            const doctorRole = await Role.findOne({ where: { name: 'Doctor' } });
            if (!doctorRole) {
                return res.status(500).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            const user = await User.create({
                email: email.toLowerCase(),
                password_hash: password,
                role_id: doctorRole.id,
                is_active: false // Require admin approval
            });

            const doctor = await Doctor.create({
                user_id: user.id,
                first_name: sanitizeInput(firstName),
                last_name: sanitizeInput(lastName),
                license_number: sanitizeInput(licenseNumber),
                specialization: sanitizeInput(specialization),
                qualification: qualification ? sanitizeInput(qualification) : null,
                phone: phone || null,
                is_approved: false
            });

            await Notification.create({
                user_id: user.id,
                type: 'pending_approval',
                title: 'Registration Pending',
                message: 'Your doctor registration is pending admin approval. You will receive an email once approved.'
            });

            // Send welcome email (pending approval notification)
            await emailService.sendWelcome(email, firstName, 'doctor');

            await logActivity(user.id, 'DOCTOR_REGISTRATION', {
                email: user.email,
                licenseNumber
            }, req);

            res.status(201).json({
                success: true,
                message: 'Doctor registration submitted - pending admin approval',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: 'Doctor'
                    },
                    profile: {
                        firstName: doctor.first_name,
                        lastName: doctor.last_name,
                        specialization: doctor.specialization
                    }
                }
            });
        } catch (error) {
            console.error('Register doctor error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            });
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
];

/**
 * PHARMACY AUTHENTICATION
 */

exports.registerPharmacy = [
    ...commonValidation,
    body('name').trim().notEmpty().withMessage('Pharmacy name is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password, name, licenseNumber, address, phone } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            const existingPharmacy = await Pharmacy.findOne({ where: { license_number: licenseNumber } });
            if (existingPharmacy) {
                return res.status(409).json({
                    success: false,
                    message: 'License number already registered'
                });
            }

            const pharmacyRole = await Role.findOne({ where: { name: 'Pharmacy' } });
            if (!pharmacyRole) {
                return res.status(500).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            const user = await User.create({
                email: email.toLowerCase(),
                password_hash: password,
                role_id: pharmacyRole.id,
                is_active: false
            });

            const pharmacy = await Pharmacy.create({
                user_id: user.id,
                name: sanitizeInput(name),
                license_number: sanitizeInput(licenseNumber),
                address: sanitizeInput(address),
                phone: phone || null,
                email: user.email,
                is_approved: false
            });

            await Notification.create({
                user_id: user.id,
                type: 'pending_approval',
                title: 'Registration Pending',
                message: 'Your pharmacy registration is pending admin approval.'
            });

            // Send welcome email (pending approval notification)
            await emailService.sendWelcome(email, name, 'pharmacy');

            await logActivity(user.id, 'PHARMACY_REGISTRATION', {
                email: user.email,
                licenseNumber
            }, req);

            res.status(201).json({
                success: true,
                message: 'Pharmacy registration submitted - pending admin approval',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: 'Pharmacy'
                    },
                    profile: {
                        name: pharmacy.name
                    }
                }
            });
        } catch (error) {
            console.error('Register pharmacy error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            });
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
];

/**
 * LAB AUTHENTICATION
 */

exports.registerLab = [
    ...commonValidation,
    body('name').trim().notEmpty().withMessage('Lab name is required'),
    body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password, name, licenseNumber, address, phone } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            const existingLab = await Lab.findOne({ where: { license_number: licenseNumber } });
            if (existingLab) {
                return res.status(409).json({
                    success: false,
                    message: 'License number already registered'
                });
            }

            const labRole = await Role.findOne({ where: { name: 'Lab' } });
            if (!labRole) {
                return res.status(500).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            const user = await User.create({
                email: email.toLowerCase(),
                password_hash: password,
                role_id: labRole.id,
                is_active: false
            });

            const lab = await Lab.create({
                user_id: user.id,
                name: sanitizeInput(name),
                license_number: sanitizeInput(licenseNumber),
                address: sanitizeInput(address),
                phone: phone || null,
                email: user.email,
                is_approved: false
            });

            await Notification.create({
                user_id: user.id,
                type: 'pending_approval',
                title: 'Registration Pending',
                message: 'Your lab registration is pending admin approval.'
            });

            // Send welcome email (pending approval notification)
            await emailService.sendWelcome(email, name, 'lab');

            await logActivity(user.id, 'LAB_REGISTRATION', {
                email: user.email,
                licenseNumber
            }, req);

            res.status(201).json({
                success: true,
                message: 'Lab registration submitted - pending admin approval',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: 'Lab'
                    },
                    profile: {
                        name: lab.name
                    }
                }
            });
        } catch (error) {
            console.error('Register lab error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            });
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
];

/**
 * UNIFIED LOGIN - All roles
 */

exports.login = [
    emailValidation,
    body('password').notEmpty().withMessage('Password is required'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({
                where: { email: email.toLowerCase() },
                include: { association: 'role', attributes: ['name'] }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if account is locked (before password check to save CPU)
            if (user.account_locked_until && user.account_locked_until > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: 'Account temporarily locked. Try again later.'
                });
            }

            // Verify password
            const isPasswordValid = await verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                // Increment failed login attempts
                user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
                if (user.failed_login_attempts >= 5) {
                    user.account_locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
                }
                await user.save();

                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if account is active
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is inactive - pending admin approval'
                });
            }

            // Reset login attempts on successful login
            user.failed_login_attempts = 0;
            user.account_locked_until = null;
            user.last_login = new Date();
            await user.save();

            // Generate tokens
            const { accessToken, refreshToken } = generateTokenPair(user.id);

            await logActivity(user.id, 'LOGIN', {
                email: user.email,
                role: user.role.name
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role.name
                    },
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }
    }
];

/**
 * REFRESH TOKEN
 */

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findByPk(decoded.id);

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token or user inactive'
            });
        }

        const newAccessToken = generateAccessToken(user.id);

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

/**
 * LOGOUT
 */

exports.logout = async (req, res) => {
    try {
        if (req.user) {
            await logActivity(req.user.id, 'LOGOUT', {});
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

/**
 * REQUEST PASSWORD RESET
 */

exports.requestPasswordReset = [
    emailValidation,
    async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ where: { email: email.toLowerCase() } });

            // Always return success to prevent email enumeration
            if (!user) {
                return res.json({
                    success: true,
                    message: 'If email exists, password reset link has been sent'
                });
            }

            // Generate reset token (valid for 1 hour)
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            user.password_reset_token = hashedToken;
            user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000);
            await user.save();

            // Send password reset email
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            await emailService.sendPasswordReset(user.email, user.first_name || 'User', resetUrl);

            await logActivity(user.id, 'PASSWORD_RESET_REQUESTED', {
                email: user.email
            }, req);

            res.json({
                success: true,
                message: 'If email exists, password reset link has been sent'
            });
        } catch (error) {
            console.error('Password reset request error:', error);
            res.status(500).json({
                success: false,
                message: 'Password reset request failed'
            });
        }
    }
];

/**
 * CONFIRM PASSWORD RESET
 */

exports.confirmPasswordReset = [
    passwordValidation,
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { resetToken, password } = req.body;

            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            const user = await User.findOne({
                where: {
                    password_reset_token: hashedToken
                }
            });

            if (!user || !user.password_reset_expires || user.password_reset_expires < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            // Update password (let the model's beforeUpdate hook handle hashing)
            user.password_hash = password;
            user.password_reset_token = null;
            user.password_reset_expires = null;
            await user.save();

            await logActivity(user.id, 'PASSWORD_RESET_COMPLETED', {});

            res.json({
                success: true,
                message: 'Password reset successful. Please login with your new password.'
            });
        } catch (error) {
            console.error('Password reset confirm error:', error);
            res.status(500).json({
                success: false,
                message: 'Password reset failed'
            });
        }
    }
];

/**
 * GET CURRENT USER
 */

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                { association: 'role', attributes: ['name', 'permissions'] },
                {
                    association: 'patientProfile',
                    attributes: ['id', 'first_name', 'last_name', 'phone', 'gender', 'blood_group']
                },
                {
                    association: 'doctorProfile',
                    attributes: ['id', 'first_name', 'last_name', 'specialization', 'license_number']
                },
                {
                    association: 'pharmacyProfile',
                    attributes: ['id', 'name', 'license_number', 'address']
                },
                {
                    association: 'labProfile',
                    attributes: ['id', 'name', 'license_number', 'address']
                }
            ]
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role.name,
                    permissions: user.role.permissions,
                    isActive: user.is_active,
                    lastLogin: user.last_login,
                    profile: user.patientProfile || user.doctorProfile || user.pharmacyProfile || user.labProfile
                }
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
};

module.exports = exports;
