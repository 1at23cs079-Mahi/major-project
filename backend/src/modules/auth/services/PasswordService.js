/**
 * Password Service
 * Handles password hashing, verification, and policy enforcement
 */

const bcrypt = require('bcryptjs');
const { ValidationError } = require('../../../core/errors');
const { logger } = require('../../../core/logger');

class PasswordService {
  constructor() {
    this.saltRounds = 12;
    this.minLength = 8;
    this.maxLength = 128;
  }

  /**
   * Hash a password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hash(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Stored hash
   * @returns {Promise<boolean>} Match result
   */
  async compare(password, hash) {
    if (!password || !hash) return false;
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} { isValid, errors }
   */
  validateStrength(password) {
    const errors = [];

    if (!password) {
      return { isValid: false, errors: ['Password is required'] };
    }

    if (password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters`);
    }

    if (password.length > this.maxLength) {
      errors.push(`Password must not exceed ${this.maxLength} characters`);
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

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common patterns
    const commonPatterns = [
      /^123456/,
      /^password/i,
      /^qwerty/i,
      /^abc123/i,
      /(.)\1{3,}/, // Repeated characters
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns that are not allowed');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password),
    };
  }

  /**
   * Calculate password strength score
   * @param {string} password - Password to analyze
   * @returns {Object} { score, label }
   */
  calculateStrength(password) {
    if (!password) return { score: 0, label: 'none' };

    let score = 0;

    // Length bonus
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety bonus
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Mixed case bonus
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;

    // Labels
    const labels = ['very-weak', 'weak', 'fair', 'good', 'strong', 'very-strong'];
    const labelIndex = Math.min(Math.floor(score / 1.5), labels.length - 1);

    return {
      score,
      maxScore: 9,
      label: labels[labelIndex],
    };
  }

  /**
   * Check if password matches any in history
   * @param {string} password - Password to check
   * @param {Array<string>} history - Array of previous password hashes
   * @returns {Promise<boolean>} True if password was used before
   */
  async isInHistory(password, history = []) {
    for (const oldHash of history) {
      const matches = await this.compare(password, oldHash);
      if (matches) return true;
    }
    return false;
  }

  /**
   * Validate password against all policies
   * @param {string} password - Password to validate
   * @param {Object} options - Validation options
   * @returns {Promise<void>}
   * @throws {ValidationError} if password doesn't meet requirements
   */
  async validate(password, options = {}) {
    const { checkHistory = [], email = null, firstName = null, lastName = null } = options;

    // Check strength
    const strengthResult = this.validateStrength(password);
    if (!strengthResult.isValid) {
      throw new ValidationError('Password does not meet requirements', strengthResult.errors);
    }

    // Check history
    if (checkHistory.length > 0) {
      const inHistory = await this.isInHistory(password, checkHistory);
      if (inHistory) {
        throw new ValidationError(
          'Password was used recently. Please choose a different password.'
        );
      }
    }

    // Check for personal information
    const personalInfo = [email, firstName, lastName]
      .filter(Boolean)
      .map((s) => s.toLowerCase());

    const passwordLower = password.toLowerCase();
    for (const info of personalInfo) {
      if (info.length >= 3 && passwordLower.includes(info)) {
        throw new ValidationError('Password should not contain personal information');
      }
    }

    logger.debug('Password validation passed');
  }

  /**
   * Generate a secure random password
   * @param {number} length - Password length
   * @returns {string} Random password
   */
  generateRandom(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each required type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}

module.exports = new PasswordService();
