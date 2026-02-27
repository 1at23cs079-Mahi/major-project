const xss = require('xss');

/**
 * Helper Functions
 */

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
    if (!input) return '';
    return xss(input.toString().trim());
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate strong password
const isStrongPassword = (password) => {
    // Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
};

// Format error response
const formatError = (message, statusCode = 400) => {
    return {
        statusCode,
        success: false,
        message
    };
};

// Format success response
const formatSuccess = (data, message = 'Success', statusCode = 200) => {
    return {
        statusCode,
        success: true,
        message,
        data
    };
};

// Extract user IP from request
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'Unknown';
};

// Generate random token
const generateRandomToken = (length = 32) => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
};

// Check if object is empty
const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

// Paginate array
const paginate = (array, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
        data: array.slice(startIndex, endIndex),
        pagination: {
            page,
            limit,
            total: array.length,
            pages: Math.ceil(array.length / limit)
        }
    };
};

module.exports = {
    sanitizeInput,
    isValidEmail,
    isStrongPassword,
    formatError,
    formatSuccess,
    getClientIp,
    generateRandomToken,
    isEmpty,
    paginate
};
