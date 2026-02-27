/**
 * HIPAA Compliance Middleware
 * Enforces HIPAA security and privacy rules
 */

const { logHIPAAAccess } = require('../utils/logger');
const { ActivityLog } = require('../models');

/**
 * Log all PHI (Protected Health Information) access
 */
const logPHIAccess = async (req, res, next) => {
    // Only log for authenticated requests accessing patient data
    if (!req.user) {
        return next();
    }

    const phiEndpoints = [
        '/api/patients',
        '/api/medical-records',
        '/api/prescriptions',
        '/api/appointments',
        '/api/health-card'
    ];

    const isAccessingPHI = phiEndpoints.some(endpoint =>
        req.originalUrl.startsWith(endpoint)
    );

    if (isAccessingPHI) {
        // Log to HIPAA access log
        logHIPAAAccess(
            req.user.id,
            req.originalUrl,
            req.method,
            {
                ip_address: req.ip,
                user_agent: req.get('user-agent'),
                role: req.user.role?.name
            }
        );

        // Log to database for audit trail
        try {
            await ActivityLog.create({
                user_id: req.user.id,
                action: 'phi_access',
                resource: req.originalUrl,
                details: {
                    method: req.method,
                    role: req.user.role?.name
                },
                ip_address: req.ip,
                user_agent: req.get('user-agent')
            });
        } catch (err) {
            console.error('HIPAA audit log failed:', err);
        }
    }

    next();
};

/**
 * Enforce minimum necessary access
 * Only return fields that are necessary for the request
 */
const minimumNecessary = (allowedFields) => {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = function (data) {
            if (data && typeof data === 'object') {
                // Filter data to only include allowed fields
                const filtered = filterFields(data, allowedFields);
                return originalJson(filtered);
            }
            return originalJson(data);
        };

        next();
    };
};

/**
 * Filter object to only include allowed fields
 */
const filterFields = (obj, allowedFields) => {
    if (Array.isArray(obj)) {
        return obj.map(item => filterFields(item, allowedFields));
    }

    if (obj && typeof obj === 'object') {
        const filtered = {};
        allowedFields.forEach(field => {
            if (obj.hasOwnProperty(field)) {
                filtered[field] = obj[field];
            }
        });
        return filtered;
    }

    return obj;
};

/**
 * Enforce session timeout (15 minutes of inactivity for PHI access)
 */
const enforceSessionTimeout = (req, res, next) => {
    if (!req.user) {
        return next();
    }

    const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    const lastActivity = req.user.last_activity || new Date();
    const now = new Date();

    if (now - lastActivity > TIMEOUT_MS) {
        return res.status(401).json({
            success: false,
            message: 'Session expired due to inactivity. Please login again.'
        });
    }

    // Update last activity
    req.user.last_activity = now;
    next();
};

/**
 * Require encrypt data transmission (HTTPS only in production)
 */
const requireHTTPS = (req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
            return res.status(403).json({
                success: false,
                message: 'HTTPS required for PHI transmission'
            });
        }
    }
    next();
};

/**
 * Validate data retention policies
 * Prevent access to data past retention period
 */
const enforceRetention = (retentionYears = 7) => {
    return (req, res, next) => {
        // This would be used in specific endpoints to filter out old data
        req.retentionDate = new Date();
        req.retentionDate.setFullYear(req.retentionDate.getFullYear() - retentionYears);
        next();
    };
};

module.exports = {
    logPHIAccess,
    minimumNecessary,
    enforceSessionTimeout,
    requireHTTPS,
    enforceRetention
};
