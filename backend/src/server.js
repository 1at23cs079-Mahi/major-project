/**
 * Server Entry Point - Version 2
 * New modular architecture with proper DI and separation of concerns
 * 
 * Run with: node src/server.js
 */

const config = require('./config');
const { logger } = require('./core/logger');
const { createApp, mountRoutes, finalizeApp } = require('./app');
const { testConnection, syncDatabase } = require('./database');
const { getModels } = require('./database/models');

// Module initializers
const { initAuthModule } = require('./modules/auth');

/**
 * Initialize all application modules
 * @param {Object} models - Sequelize models
 * @returns {Object} Initialized modules
 */
function initializeModules(models) {
  logger.info('Initializing modules...');

  const auth = initAuthModule(models);

  logger.info('✓ All modules initialized');

  return { auth };
}

/**
 * Build routes object from modules
 * @param {Object} modules - Initialized modules
 * @returns {Object} Routes configuration
 */
function buildRoutes(modules) {
  return {
    v2: {
      '/auth': modules.auth.authRouter,
      // Add more v2 routes here as modules are created
      // '/patients': modules.patient.patientRouter,
      // '/appointments': modules.appointment.appointmentRouter,
    },
    // Legacy v1 routes can be added here for backward compatibility
    v1: {},
  };
}

/**
 * Start the server
 */
async function startServer() {
  try {
    logger.info('='.repeat(50));
    logger.info('Starting Healthcare Platform API v2.0');
    logger.info('='.repeat(50));

    // Test database connection
    await testConnection();

    // Load models
    const models = getModels();

    // Sync database in development
    if (config.isDevelopment) {
      await syncDatabase(false);
    }

    // Initialize modules with DI
    const modules = initializeModules(models);

    // Create Express app
    const app = createApp();

    // Build and mount routes
    const routes = buildRoutes(modules);
    mountRoutes(app, routes);

    // Mount legacy routes for backward compatibility
    await mountLegacyRoutes(app);

    // Finalize app (error handlers)
    finalizeApp(app);

    // Start listening
    const server = app.listen(config.server.port, () => {
      logger.info('='.repeat(50));
      logger.info(`✓ Server running on port ${config.server.port}`);
      logger.info(`  Environment: ${config.env}`);
      logger.info(`  API v2: http://localhost:${config.server.port}/api/v2`);
      logger.info(`  API v1 (legacy): http://localhost:${config.server.port}/api`);
      logger.info(`  Health: http://localhost:${config.server.port}/health`);
      logger.info('='.repeat(50));
    });

    // Graceful shutdown
    setupGracefulShutdown(server);

    return server;
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

/**
 * Mount legacy v1 routes for backward compatibility
 * @param {Express} app - Express application
 */
async function mountLegacyRoutes(app) {
  try {
    // Import legacy routes
    const path = require('path');
    const fs = require('fs');
    const legacyRoutesPath = path.join(__dirname, '../routes');

    if (fs.existsSync(legacyRoutesPath)) {
      // Import specific legacy routes that are still needed
      const legacyRoutes = [
        { path: '/api/auth', file: 'auth.js' },
        { path: '/api/appointments', file: 'appointments.js' },
        { path: '/api/prescriptions', file: 'prescriptions.js' },
        { path: '/api/medical-records', file: 'medicalRecords.js' },
        { path: '/api/consent', file: 'consent.js' },
        { path: '/api/dashboard', file: 'dashboard.js' },
        { path: '/api/admin', file: 'admin.js' },
        { path: '/api/emergency', file: 'emergency.js' },
        { path: '/api/family', file: 'family.js' },
        { path: '/api/health-card', file: 'healthCard.js' },
        { path: '/api/insurance', file: 'insurance.js' },
        { path: '/api/medicines', file: 'medicines.js' },
        { path: '/api/patient-access', file: 'patientAccess.js' },
        { path: '/api/blockchain', file: 'blockchain.js' },
      ];

      for (const route of legacyRoutes) {
        const routePath = path.join(legacyRoutesPath, route.file);
        if (fs.existsSync(routePath)) {
          try {
            const router = require(routePath);
            app.use(route.path, router);
            logger.debug(`Mounted legacy route: ${route.path}`);
          } catch (error) {
            logger.warn(`Failed to load legacy route ${route.file}:`, { error: error.message });
          }
        }
      }

      logger.info('✓ Legacy routes mounted');
    }
  } catch (error) {
    logger.warn('Could not mount legacy routes:', { error: error.message });
  }
}

/**
 * Setup graceful shutdown handlers
 * @param {Server} server - HTTP server instance
 */
function setupGracefulShutdown(server) {
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close database connection
        const { closeConnection } = require('./database');
        await closeConnection();
        
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', { error: error.message });
        process.exit(1);
      }
    });

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
  });
}

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
