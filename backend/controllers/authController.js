const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Role, Patient, Doctor, Pharmacy, Lab, Notification } = require('../models');
const crypto = require('crypto');

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Register Patient
exports.registerPatient = [
    ...registerValidation,
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password, firstName, lastName, phone, dateOfBirth, gender, bloodGroup } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            // Get Patient role
            const patientRole = await Role.findOne({ where: { name: 'Patient' } });

            // Create user
            const user = await User.create({
                email,
                password_hash: password,
                role_id: patientRole.id
            });

            // Create patient profile
            const patient = await Patient.create({
                user_id: user.id,
                first_name: firstName,
                last_name: lastName,
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
                message: 'Your account has been created successfully. Complete your profile to get started.'
            });

            const token = generateToken(user.id);

            res.status(201).json({
                success: true,
                message: 'Patient registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: 'Patient',
                    profile: patient
                }
            });
        } catch (error) {
            console.error('Register patient error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
];

// Register Doctor
exports.registerDoctor = [
    ...registerValidation,
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('licenseNumber').notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password, firstName, lastName, licenseNumber, specialization, qualification, phone } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            const doctorRole = await Role.findOne({ where: { name: 'Doctor' } });

            const user = await User.create({
                email,
                password_hash: password,
                role_id: doctorRole.id,
                is_active: false // Require admin approval
            });

            const doctor = await Doctor.create({
                user_id: user.id,
                first_name: firstName,
                last_name: lastName,
                license_number: licenseNumber,
                specialization: specialization || null,
                qualification: qualification || null,
                phone: phone || null,
                is_approved: false
            });

            await Notification.create({
                user_id: user.id,
                type: 'pending_approval',
                title: 'Registration Pending',
                message: 'Your doctor registration is pending admin approval. You will be notified once approved.'
            });

            res.status(201).json({
                success: true,
                message: 'Doctor registration submitted. Awaiting admin approval.',
                user: {
                    id: user.id,
                    email: user.email,
                    role: 'Doctor',
                    profile: doctor
                }
            });
        } catch (error) {
            console.error('Register doctor error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
];

// Register Pharmacy
exports.registerPharmacy = [
    ...registerValidation,
    body('name').notEmpty(),
    body('licenseNumber').notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password, name, licenseNumber, address, phone } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            const pharmacyRole = await Role.findOne({ where: { name: 'Pharmacy' } });

            const user = await User.create({
                email,
                password_hash: password,
                role_id: pharmacyRole.id,
                is_active: false
            });

            const pharmacy = await Pharmacy.create({
                user_id: user.id,
                name,
                license_number: licenseNumber,
                address: address || null,
                phone: phone || null,
                email: email,
                is_approved: false
            });

            await Notification.create({
                user_id: user.id,
                type: 'pending_approval',
                title: 'Registration Pending',
                message: 'Your pharmacy registration is pending admin approval.'
            });

            res.status(201).json({
                success: true,
                message: 'Pharmacy registration submitted. Awaiting admin approval.',
                user: {
                    id: user.id,
                    email: user.email,
                    role: 'Pharmacy',
                    profile: pharmacy
                }
            });
        } catch (error) {
            console.error('Register pharmacy error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
];

// Register Lab
exports.registerLab = [
    ...registerValidation,
    body('name').notEmpty(),
    body('licenseNumber').notEmpty(),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { email, password, name, licenseNumber, address, phone } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            const labRole = await Role.findOne({ where: { name: 'Lab' } });

            const user = await User.create({
                email,
                password_hash: password,
                role_id: labRole.id,
                is_active: false
            });

            const lab = await Lab.create({
                user_id: user.id,
                name,
                license_number: licenseNumber,
                address: address || null,
                phone: phone || null,
                email: email,
                is_approved: false
            });

            await Notification.create({
                user_id: user.id,
                type: 'pending_approval',
                title: 'Registration Pending',
                message: 'Your lab registration is pending admin approval.'
            });

            res.status(201).json({
                success: true,
                message: 'Lab registration submitted. Awaiting admin approval.',
                user: {
                    id: user.id,
                    email: user.email,
                    role: 'Lab',
                    profile: lab
                }
            });
        } catch (error) {
            console.error('Register lab error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
];

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user with role
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'role' }]
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            const lockDuration = Math.ceil((user.account_locked_until - new Date()) / 1000 / 60);
            return res.status(403).json({
                success: false,
                message: `Account is locked due to multiple failed login attempts. Please try again in ${lockDuration} minutes.`
            });
        }

        // Verify password
        const isValidPassword = await user.verifyPassword(password);
        if (!isValidPassword) {
            // Increment failed attempts
            await user.incrementFailedAttempts();

            const remainingAttempts = 5 - user.failed_login_attempts;
            let message = 'Invalid credentials';

            if (remainingAttempts > 0 && remainingAttempts <= 3) {
                message = `Invalid credentials. ${remainingAttempts} attempts remaining before account lockout.`;
            } else if (remainingAttempts <= 0) {
                message = 'Account has been locked due to too many failed attempts. Please try again in 15 minutes.';
            }

            return res.status(401).json({ success: false, message });
        }

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account is not active. Please wait for admin approval.' });
        }

        // Reset failed attempts on successful login
        await user.resetFailedAttempts();

        // Update last login
        await user.update({ last_login: new Date() });

        // Log successful login
        const { ActivityLog } = require('../models');
        await ActivityLog.create({
            user_id: user.id,
            action: 'login',
            resource: 'auth',
            details: { success: true },
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent')
        });

        // Get profile based on role
        let profile = null;
        const roleName = user.role.name;

        if (roleName === 'Patient') {
            profile = await Patient.findOne({ where: { user_id: user.id } });
        } else if (roleName === 'Doctor') {
            profile = await Doctor.findOne({ where: { user_id: user.id } });
        } else if (roleName === 'Pharmacy') {
            profile = await Pharmacy.findOne({ where: { user_id: user.id } });
        } else if (roleName === 'Lab') {
            profile = await Lab.findOne({ where: { user_id: user.id } });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: roleName,
                profile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Password reset request
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        await user.update({
            password_reset_token: resetToken,
            password_reset_expires: resetExpires
        });

        // TODO: Send email with reset link
        // For now, just return the token (in production, this should be emailed)
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Verify reset token
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        const user = await User.findOne({
            where: {
                password_reset_token: token,
                password_reset_expires: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            email: user.email
        });
    } catch (error) {
        console.error('Verify reset token error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Password reset confirmation
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            where: {
                password_reset_token: token,
                password_reset_expires: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        await user.update({
            password_hash: newPassword,
            password_reset_token: null,
            password_reset_expires: null
        });

        res.json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Role, as: 'role' }]
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get profile based on role
        let profile = null;
        const roleName = user.role.name;

        if (roleName === 'Patient') {
            profile = await Patient.findOne({ where: { user_id: user.id } });
        } else if (roleName === 'Doctor') {
            profile = await Doctor.findOne({ where: { user_id: user.id } });
        } else if (roleName === 'Pharmacy') {
            profile = await Pharmacy.findOne({ where: { user_id: user.id } });
        } else if (roleName === 'Lab') {
            profile = await Lab.findOne({ where: { user_id: user.id } });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: roleName,
                isActive: user.is_active,
                lastLogin: user.last_login,
                profile
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
