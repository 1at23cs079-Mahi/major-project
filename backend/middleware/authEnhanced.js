const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

/**
 * Enhanced Authentication Middleware
 * Validates JWT tokens and manages token refresh
 */

// Generate Access Token
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
};

// Generate Token Pair
const generateTokenPair = (userId) => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId)
    };
};

// Verify Access Token
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

// Extract token from Authorization header
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

// Enhanced Authenticate Middleware
const authenticateToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authorization token provided'
            });
        }

        const decoded = verifyAccessToken(token);
        
        // Get user from database
        const user = await User.findByPk(decoded.id, {
            include: { association: 'role', attributes: ['name', 'permissions'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'User account is inactive'
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            roleId: user.role_id,
            role: user.role.name,
            permissions: user.role.permissions || []
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: error.message || 'Authentication failed'
        });
    }
};

// Check specific role
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - insufficient permissions',
                requiredRole: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Check permission
const authorizePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden - insufficient permissions',
                requiredPermission
            });
        }

        next();
    };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            return next();
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findByPk(decoded.id, {
            include: { association: 'role', attributes: ['name', 'permissions'] }
        });

        if (user && user.is_active) {
            req.user = {
                id: user.id,
                email: user.email,
                roleId: user.role_id,
                role: user.role.name,
                permissions: user.role.permissions || []
            };
        }
    } catch (error) {
        // Silently fail - user not authenticated
    }
    
    next();
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    extractToken,
    authenticateToken,
    authorizeRole,
    authorizePermission,
    optionalAuth
};
