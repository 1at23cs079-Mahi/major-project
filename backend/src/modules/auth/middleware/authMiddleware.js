/**
 * Authentication Middleware
 * JWT verification and user context injection
 */

const TokenService = require('../services/TokenService');
const { AuthenticationError, AuthorizationError } = require('../../../core/errors');
const { logger } = require('../../../core/logger');

/**
 * Verify JWT token and attach user to request
 * @param {Object} userRepository - User repository instance
 * @returns {Function} Express middleware
 */
function authenticate(userRepository) {
  return async (req, res, next) => {
    try {
      // Extract token from header
      const authHeader = req.headers.authorization;
      const token = TokenService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AuthenticationError('No authentication token provided');
      }

      // Verify token
      const decoded = TokenService.verifyAccessToken(token);

      // Optionally verify user still exists and is active
      if (userRepository) {
        const user = await userRepository.findByIdOrNull(decoded.userId);
        if (!user) {
          throw new AuthenticationError('User not found');
        }
        if (!user.isActive) {
          throw new AuthenticationError('Account is deactivated');
        }
      }

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Optional authentication - doesn't fail if no token
 * @param {Object} userRepository - User repository instance
 * @returns {Function} Express middleware
 */
function optionalAuth(userRepository) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const token = TokenService.extractTokenFromHeader(authHeader);

      if (token) {
        const decoded = TokenService.verifyAccessToken(token);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
      }

      next();
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional auth failed', { error: error.message });
      next();
    }
  };
}

/**
 * Require specific roles
 * @param {...string} allowedRoles - Allowed roles
 * @returns {Function} Express middleware
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return next(new AuthorizationError(`This action requires one of the following roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

/**
 * Require admin role
 * @returns {Function} Express middleware
 */
function requireAdmin() {
  return requireRole('admin');
}

/**
 * Require healthcare provider roles
 * @returns {Function} Express middleware
 */
function requireHealthcareProvider() {
  return requireRole('doctor', 'pharmacy', 'lab', 'admin');
}

/**
 * Require ownership or admin
 * @param {Function} getOwnerId - Function to get owner ID from request
 * @returns {Function} Express middleware
 */
function requireOwnerOrAdmin(getOwnerId) {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    // Admins can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership
    const ownerId = await getOwnerId(req);
    if (ownerId !== req.user.userId) {
      return next(new AuthorizationError('You can only access your own resources'));
    }

    next();
  };
}

/**
 * Rate limiting for auth endpoints
 * Simple in-memory implementation (use Redis in production)
 */
const loginAttempts = new Map();

function authRateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxAttempts = 5,
    blockDuration = 15 * 60 * 1000, // 15 minutes
  } = options;

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    // Clean up old entries
    for (const [k, v] of loginAttempts.entries()) {
      if (now - v.firstAttempt > windowMs) {
        loginAttempts.delete(k);
      }
    }

    const record = loginAttempts.get(key);

    if (record) {
      // Check if blocked
      if (record.blocked && now - record.blockedAt < blockDuration) {
        const remaining = Math.ceil((blockDuration - (now - record.blockedAt)) / 1000);
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many login attempts. Please try again in ${remaining} seconds.`,
          },
        });
      }

      // Reset if block expired
      if (record.blocked && now - record.blockedAt >= blockDuration) {
        loginAttempts.delete(key);
      } else if (record.attempts >= maxAttempts) {
        record.blocked = true;
        record.blockedAt = now;
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many login attempts. Please try again later.',
          },
        });
      } else {
        record.attempts += 1;
      }
    } else {
      loginAttempts.set(key, {
        attempts: 1,
        firstAttempt: now,
        blocked: false,
      });
    }

    // Reset attempts on successful response
    res.on('finish', () => {
      if (res.statusCode === 200) {
        loginAttempts.delete(key);
      }
    });

    next();
  };
}

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireHealthcareProvider,
  requireOwnerOrAdmin,
  authRateLimit,
};
