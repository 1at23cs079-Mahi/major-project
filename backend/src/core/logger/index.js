/**
 * Winston Logger Configuration
 * Centralized logging with multiple transports
 */

const path = require('path');

// Simple file logger for when winston isn't available
// This provides a fallback logging mechanism
class SimpleLogger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
    this.colors = {
      error: '\x1b[31m', // red
      warn: '\x1b[33m',  // yellow
      info: '\x1b[32m',  // green
      http: '\x1b[35m',  // magenta
      debug: '\x1b[36m', // cyan
      reset: '\x1b[0m',
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, meta);
    const color = this.colors[level] || '';
    const reset = this.colors.reset;
    
    if (level === 'error') {
      console.error(`${color}${formattedMessage}${reset}`);
    } else if (level === 'warn') {
      console.warn(`${color}${formattedMessage}${reset}`);
    } else {
      console.log(`${color}${formattedMessage}${reset}`);
    }
  }

  error(message, meta) { this.log('error', message, meta); }
  warn(message, meta) { this.log('warn', message, meta); }
  info(message, meta) { this.log('info', message, meta); }
  http(message, meta) { this.log('http', message, meta); }
  debug(message, meta) { this.log('debug', message, meta); }
}

// Create logger instance
const logger = new SimpleLogger({
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * HTTP Request Logger Middleware
 * Logs incoming requests with timing information
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  logger.http(`→ ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'http';
    
    logger.log(level, `← ${req.method} ${req.originalUrl} ${res.statusCode}`, {
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
  });

  next();
}

/**
 * Audit Logger
 * Logs security-relevant events for compliance
 */
const auditLogger = {
  log(action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      ...details,
    };
    
    // In production, this would write to a separate audit log
    logger.info(`[AUDIT] ${action}`, entry);
  },

  login(userId, success, ip, userAgent) {
    this.log('LOGIN_ATTEMPT', {
      userId,
      success,
      ip,
      userAgent,
    });
  },

  logout(userId) {
    this.log('LOGOUT', { userId });
  },

  accessRecord(userId, recordId, recordType, action) {
    this.log('RECORD_ACCESS', {
      userId,
      recordId,
      recordType,
      action,
    });
  },

  permissionChange(adminId, targetUserId, permission, granted) {
    this.log('PERMISSION_CHANGE', {
      adminId,
      targetUserId,
      permission,
      granted,
    });
  },

  dataExport(userId, dataType, reason) {
    this.log('DATA_EXPORT', {
      userId,
      dataType,
      reason,
    });
  },

  configChange(userId, setting, oldValue, newValue) {
    this.log('CONFIG_CHANGE', {
      userId,
      setting,
      oldValue: '[REDACTED]',
      newValue: '[REDACTED]',
    });
  },
};

module.exports = {
  logger,
  requestLogger,
  auditLogger,
};
