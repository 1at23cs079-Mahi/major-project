const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';

// CRITICAL: Encryption key must be set in environment variables
// Never generate random keys - data encrypted with them cannot be decrypted after restart
if (!process.env.ENCRYPTION_KEY) {
    console.error('❌ FATAL: ENCRYPTION_KEY environment variable is not set!');
    console.error('   Generate a secure key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.error('   Add it to your .env file: ENCRYPTION_KEY=<generated_key>');
    throw new Error('ENCRYPTION_KEY is required for data encryption');
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt sensitive data
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text with IV and auth tag
 */
const encrypt = (text) => {
    if (!text) return null;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Format: iv:authTag:encryptedData
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedText - Encrypted text with IV and auth tag
 * @returns {string} - Decrypted plain text
 */
const decrypt = (encryptedText) => {
    if (!encryptedText) return null;

    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @returns {string} - SHA-256 hash
 */
const hashData = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Random token
 */
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Encrypt object fields
 * @param {Object} obj - Object with fields to encrypt
 * @param {Array} fields - Field names to encrypt
 * @returns {Object} - Object with encrypted fields
 */
const encryptFields = (obj, fields) => {
    const encrypted = { ...obj };

    fields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encrypt(encrypted[field].toString());
        }
    });

    return encrypted;
};

/**
 * Decrypt object fields
 * @param {Object} obj - Object with encrypted fields
 * @param {Array} fields - Field names to decrypt
 * @returns {Object} - Object with decrypted fields
 */
const decryptFields = (obj, fields) => {
    const decrypted = { ...obj };

    fields.forEach(field => {
        if (decrypted[field]) {
            try {
                decrypted[field] = decrypt(decrypted[field]);
            } catch (error) {
                console.error(`Failed to decrypt field ${field}:`, error);
                decrypted[field] = '[ENCRYPTED]';
            }
        }
    });

    return decrypted;
};

/**
 * Sanitize sensitive data for logging
 * @param {Object} data - Data object
 * @returns {Object} - Sanitized data
 */
const sanitizeForLogging = (data) => {
    const sensitiveFields = ['password', 'password_hash', 'ssn', 'credit_card', 'token', 'secret'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '[REDACTED]';
        }
    });

    return sanitized;
};

module.exports = {
    encrypt,
    decrypt,
    hashData,
    generateSecureToken,
    encryptFields,
    decryptFields,
    sanitizeForLogging
};
