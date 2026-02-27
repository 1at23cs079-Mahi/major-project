/**
 * Standardized Error Handling Utility
 * Provides consistent error responses and logging across the application
 */

const emailService = require('../services/email.service');

// Custom API Error class with status codes
class APIError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true; // Distinguishes from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

// Pre-defined error types for consistency
const ErrorTypes = {
    VALIDATION: (message, details = null) => new APIError(message, 400, 'VALIDATION_ERROR', details),
    UNAUTHORIZED: (message = 'Authentication required') => new APIError(message, 401, 'UNAUTHORIZED'),
    FORBIDDEN: (message = 'Access denied') => new APIError(message, 403, 'FORBIDDEN'),
    NOT_FOUND: (resource = 'Resource') => new APIError(`${resource} not found`, 404, 'NOT_FOUND'),
    CONFLICT: (message) => new APIError(message, 409, 'CONFLICT'),
    RATE_LIMITED: (message = 'Too many requests') => new APIError(message, 429, 'RATE_LIMITED'),
    INTERNAL: (message = 'Internal server error') => new APIError(message, 500, 'INTERNAL_ERROR'),
    SERVICE_UNAVAILABLE: (service) => new APIError(`${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE'),
    DATABASE: (message = 'Database operation failed') => new APIError(message, 500, 'DATABASE_ERROR'),
};

/**
 * Logs error with appropriate severity level
 */
const logError = (error, context = {}) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        code: error.code || 'UNKNOWN',
        statusCode: error.statusCode || 500,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        context,
        isOperational: error.isOperational || false
    };

    // Critical errors (5xx) get special attention
    if (errorLog.statusCode >= 500) {
        console.error('❌ CRITICAL ERROR:', JSON.stringify(errorLog, null, 2));
        
        // Alert administrators for critical production errors
        if (process.env.NODE_ENV === 'production' && process.env.ADMIN_ALERT_EMAIL) {
            emailService.sendEmail(
                process.env.ADMIN_ALERT_EMAIL,
                `🚨 Server Error: ${error.code || 'INTERNAL_ERROR'}`,
                `<h2>Critical Server Error</h2>
                <p><strong>Time:</strong> ${errorLog.timestamp}</p>
                <p><strong>Message:</strong> ${error.message}</p>
                <p><strong>Code:</strong> ${error.code || 'N/A'}</p>
                <p><strong>Context:</strong></p>
                <pre>${JSON.stringify(context, null, 2)}</pre>`
            ).catch(() => {}); // Don't let email failure cause additional errors
        }
    } else {
        console.warn('⚠️ Warning:', errorLog.message, context);
    }
};

/**
 * Express error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
    // Log the error
    logError(err, {
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id,
        ip: req.ip
    });

    // Handle known API errors
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details
            }
        });
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const details = err.errors?.map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details
            }
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired'
            }
        });
    }

    // Default to internal server error
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
        }
    });
};

/**
 * Async handler wrapper to catch errors in async routes
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standard response helpers
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const sendCreated = (res, data, message = 'Created successfully') => {
    sendSuccess(res, data, message, 201);
};

const sendNoContent = (res) => {
    res.status(204).send();
};

module.exports = {
    APIError,
    ErrorTypes,
    logError,
    errorMiddleware,
    asyncHandler,
    sendSuccess,
    sendCreated,
    sendNoContent
};
