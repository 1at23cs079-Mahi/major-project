const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

winston.addColors(colors);

// Define format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Define transports
const transports = [
    // Console transport
    new winston.transports.Console(),

    // Error log file
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }),

    // Combined log file
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
    }),

    // Security events log
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/security.log'),
        level: 'warn',
        maxsize: 5242880, // 5MB
        maxFiles: 10
    })
];

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports
});

// Create separate logger for security events
const securityLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/security.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 20
        })
    ]
});

// Log security event
const logSecurityEvent = (event) => {
    securityLogger.info({
        type: 'security_event',
        ...event,
        timestamp: new Date().toISOString()
    });
};

// Log HIPAA access
const logHIPAAAccess = (userId, resource, action, details = {}) => {
    securityLogger.info({
        type: 'hipaa_access',
        user_id: userId,
        resource,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

        if (res.statusCode >= 500) {
            logger.error(message);
        } else if (res.statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.http(message);
        }
    });

    next();
};

module.exports = {
    logger,
    securityLogger,
    logSecurityEvent,
    logHIPAAAccess,
    requestLogger
};
