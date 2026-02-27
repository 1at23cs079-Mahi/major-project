/**
 * Centralized Error Handling System
 * Custom error classes for consistent error management
 */

/**
 * Base Application Error
 * All custom errors extend this class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Distinguishes from programming errors
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
      },
    };
  }
}

/**
 * Validation Error - 400 Bad Request
 * For invalid input data
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Authentication Error - 401 Unauthorized
 * For missing or invalid credentials
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization Error - 403 Forbidden
 * For insufficient permissions
 */
class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not Found Error - 404
 * For missing resources
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource', identifier = null) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

/**
 * Conflict Error - 409
 * For duplicate resources or state conflicts
 */
class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Rate Limit Error - 429
 * For too many requests
 */
class RateLimitError extends AppError {
  constructor(retryAfter = null) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * Database Error - 500
 * For database operation failures
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * External Service Error - 502/503
 * For third-party service failures
 */
class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable') {
    super(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
  }
}

/**
 * Business Logic Error - 422 Unprocessable Entity
 * For valid syntax but failed business rules
 */
class BusinessError extends AppError {
  constructor(message, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code);
  }
}

/**
 * Error Handler Middleware
 * Final error handling for Express
 */
function errorHandler(err, req, res, next) {
  // Default error values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';

  // Log error (in production, use a proper logger)
  const logError = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    code,
    message,
    stack: err.stack,
    userId: req.user?.id,
    ip: req.ip,
  };

  if (statusCode >= 500) {
    console.error('[ERROR]', JSON.stringify(logError, null, 2));
  } else {
    console.warn('[WARN]', JSON.stringify(logError, null, 2));
  }

  // Handle specific error types
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation failed';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message:
        process.env.NODE_ENV === 'production' && statusCode >= 500
          ? 'An unexpected error occurred'
          : message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err.details,
      }),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Not Found Middleware
 * Handles 404 for unmatched routes
 */
function notFoundHandler(req, res, next) {
  next(new NotFoundError('Endpoint', `${req.method} ${req.originalUrl}`));
}

/**
 * Async Handler Wrapper
 * Catches async errors and passes to error middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  BusinessError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
