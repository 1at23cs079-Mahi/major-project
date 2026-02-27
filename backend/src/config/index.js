/**
 * Centralized Configuration Management
 * All environment variables are validated and exported from here
 */

const path = require('path');

// Load environment variables from project root
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

/**
 * Required environment variables that must be present
 */
const REQUIRED_ENV_VARS = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
];

/**
 * Validate all required environment variables exist
 * @throws {Error} if any required variable is missing
 */
function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please ensure your .env file is properly configured.'
    );
  }

  // Validate encryption key format (32 bytes = 64 hex characters)
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes)'
    );
  }
}

// Validate on module load in non-test environments
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}

/**
 * Application Configuration Object
 */
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Server
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
  },

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME || 'healthcare_db',
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '5', 10),
      min: parseInt(process.env.DB_POOL_MIN || '0', 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
    },
  },

  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    issuer: process.env.JWT_ISSUER || 'healthcare-platform',
    audience: process.env.JWT_AUDIENCE || 'healthcare-users',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    algorithm: 'aes-256-gcm',
  },

  // Blockchain (optional feature)
  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
    mode: process.env.BLOCKCHAIN_MODE || 'disabled', // disabled, read-only, full
    providerUrl: process.env.BLOCKCHAIN_PROVIDER_URL,
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
    contracts: {
      recordRegistry: process.env.RECORD_REGISTRY_ADDRESS,
      consent: process.env.CONSENT_CONTRACT_ADDRESS,
      prescription: process.env.PRESCRIPTION_CONTRACT_ADDRESS,
      auditLog: process.env.AUDIT_LOG_ADDRESS,
    },
  },

  // Email Service (optional)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Healthcare Platform',
      address: process.env.EMAIL_FROM_ADDRESS || 'noreply@healthcare.com',
    },
  },

  // OAuth Providers
  oauth: {
    google: {
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:5000/api/auth/google/callback',
    },
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    loginMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
    allowedTypes: (
      process.env.UPLOAD_ALLOWED_TYPES ||
      'image/jpeg,image/png,application/pdf'
    ).split(','),
    destination: process.env.UPLOAD_DESTINATION || './uploads',
  },
};

module.exports = config;
module.exports.validateEnv = validateEnv;
