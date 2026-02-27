const validator = require('validator');
const xss = require('xss');

/**
 * Sanitize user input to prevent XSS attacks
 */
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return xss(input, {
            whiteList: {}, // No HTML tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        });
    }

    if (Array.isArray(input)) {
        return input.map(item => sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized = {};
        Object.keys(input).forEach(key => {
            sanitized[key] = sanitizeInput(input[key]);
        });
        return sanitized;
    }

    return input;
};

/**
 * Validate and sanitize request body
 */
const sanitizeMiddleware = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }

    if (req.query) {
        req.query = sanitizeInput(req.query);
    }

    if (req.params) {
        req.params = sanitizeInput(req.params);
    }

    next();
};

/**
 * Validate email format
 */
const validateEmail = (email) => {
    return validator.isEmail(email);
};

/**
 * Validate phone number
 */
const validatePhone = (phone) => {
    // Allow international formats
    return validator.isMobilePhone(phone, 'any', { strictMode: false });
};

/**
 * Validate date format
 */
const validateDate = (date) => {
    return validator.isISO8601(date);
};

/**
 * Validate URL
 */
const validateURL = (url) => {
    return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true
    });
};

/**
 * Escape SQL-like patterns
 */
const escapeSQLLike = (str) => {
    return str.replace(/[%_]/g, '\\$&');
};

/**
 * Validate UUID
 */
const validateUUID = (uuid) => {
    return validator.isUUID(uuid, 4);
};

/**
 * Validate integer
 */
const validateInteger = (value) => {
    return validator.isInt(value.toString());
};

/**
 * Validate alphanumeric
 */
const validateAlphanumeric = (value) => {
    return validator.isAlphanumeric(value);
};

module.exports = {
    sanitizeInput,
    sanitizeMiddleware,
    validateEmail,
    validatePhone,
    validateDate,
    validateURL,
    escapeSQLLike,
    validateUUID,
    validateInteger,
    validateAlphanumeric
};
