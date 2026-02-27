const bcrypt = require('bcryptjs');

/**
 * Password Validator Utility
 * Provides comprehensive password validation including:
 * - Strength validation
 * - Common password checking
 * - Password history tracking (prevents reuse)
 */

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const validatePasswordStrength = (password) => {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Check for common/weak passwords
 */
const isCommonPassword = (password) => {
    const commonPasswords = [
        'password', 'password123', '123456', '12345678',
        'qwerty', 'abc123', 'password1', 'admin', 'letmein',
        'welcome', 'monkey', '1234567890', 'admin123',
        'Password1!', 'Qwerty123!', 'Admin123!', 'Welcome1!'
    ];

    return commonPasswords.some(common => 
        password.toLowerCase() === common.toLowerCase()
    );
};

/**
 * Check if password was used recently
 * Prevents password reuse - security best practice
 * @param {number} userId - User ID to check history for
 * @param {string} newPassword - Plain text password to check
 * @returns {Promise<{canUse: boolean, message: string}>}
 */
const checkPasswordHistory = async (userId, newPassword) => {
    try {
        const { PasswordHistory, User } = require('../models');
        
        // Check against current password first
        const user = await User.findByPk(userId);
        if (user) {
            const currentMatch = await bcrypt.compare(newPassword, user.password_hash);
            if (currentMatch) {
                return { 
                    canUse: false, 
                    message: 'New password cannot be the same as your current password' 
                };
            }
        }

        // Check against last 5 passwords in history
        const history = await PasswordHistory.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 5
        });

        for (const record of history) {
            const match = await bcrypt.compare(newPassword, record.password_hash);
            if (match) {
                return { 
                    canUse: false, 
                    message: 'You cannot reuse any of your last 5 passwords' 
                };
            }
        }

        return { canUse: true, message: 'Password is acceptable' };
    } catch (error) {
        console.error('Password history check error:', error);
        // On error, log but allow - don't block user
        return { canUse: true, message: 'Password check completed' };
    }
};

/**
 * Save password to history after successful password change
 * @param {number} userId - User ID
 * @param {string} passwordHash - Already hashed password
 */
const savePasswordHistory = async (userId, passwordHash) => {
    try {
        const { PasswordHistory } = require('../models');
        
        // Save new password hash to history
        await PasswordHistory.create({
            user_id: userId,
            password_hash: passwordHash
        });

        // Keep only last 10 passwords, delete older ones
        const allHistory = await PasswordHistory.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']]
        });

        if (allHistory.length > 10) {
            const toDelete = allHistory.slice(10);
            await PasswordHistory.destroy({
                where: {
                    id: toDelete.map(h => h.id)
                }
            });
        }
    } catch (error) {
        // Log error but don't fail - password history is secondary
        console.error('Save password history error:', error);
    }
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Comprehensive password validation
 * @param {string} password - Plain text password
 * @param {number|null} userId - User ID for history check (optional)
 * @returns {Promise<{isValid: boolean, errors: string[]}>}
 */
const validatePassword = async (password, userId = null) => {
    const errors = [];

    // Check strength
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.isValid) {
        errors.push(...strengthCheck.errors);
    }

    // Check for common passwords
    if (isCommonPassword(password)) {
        errors.push('This password is too common. Please choose a stronger password');
    }

    // Check password history if userId provided
    if (userId) {
        const historyCheck = await checkPasswordHistory(userId, password);
        if (!historyCheck.canUse) {
            errors.push(historyCheck.message);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validatePasswordStrength,
    validatePassword,
    validateEmail,
    isCommonPassword,
    checkPasswordHistory,
    savePasswordHistory
};
