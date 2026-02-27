/**
 * Express Application Factory
 * Creates and configures the Express app
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const config = require('./config');
const { errorHandler, notFoundHandler } = require('./core/errors');
const { requestLogger, logger } = require('./core/logger');

/**
 * Create Express application
 * @param {Object} options - Configuration options
 * @returns {Express} Configured Express app
 */
function createApp(options = {}) {
  const app = express();

  // Trust proxy for accurate IP detection
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: config.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Request logging
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(requestLogger);
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.env,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // API information endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'Healthcare Platform API',
      version: '2.0.0',
      documentation: '/api/docs',
      endpoints: {
        v1: '/api/v1',
        v2: '/api/v2',
      },
    });
  });

  return app;
}

/**
 * Mount routes on the application
 * @param {Express} app - Express application
 * @param {Object} routes - Route modules
 */
function mountRoutes(app, routes) {
  // Mount v2 API routes (new modular architecture)
  if (routes.v2) {
    Object.entries(routes.v2).forEach(([path, router]) => {
      app.use(`/api/v2${path}`, router);
      logger.debug(`Mounted route: /api/v2${path}`);
    });
  }

  // Mount v1 API routes (legacy, for backward compatibility)
  if (routes.v1) {
    Object.entries(routes.v1).forEach(([path, router]) => {
      app.use(`/api${path}`, router);
      logger.debug(`Mounted legacy route: /api${path}`);
    });
  }
}

/**
 * Finalize app configuration
 * @param {Express} app - Express application
 */
function finalizeApp(app) {
  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);
}

module.exports = {
  createApp,
  mountRoutes,
  finalizeApp,
};
