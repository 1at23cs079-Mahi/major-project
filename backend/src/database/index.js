/**
 * Database Configuration and Initialization
 * Centralized database connection management
 */

const { Sequelize } = require('sequelize');
const config = require('../config');
const { logger } = require('../core/logger');

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database.name,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    pool: config.database.pool,
    define: {
      timestamps: true,
      underscored: true, // Use snake_case for DB columns (created_at, updated_at)
    },
  }
);

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('✓ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('✗ Unable to connect to database:', { error: error.message });
    throw error;
  }
}

/**
 * Sync database models
 * @param {boolean} force - Drop tables first (DANGEROUS in production)
 * @returns {Promise<void>}
 */
async function syncDatabase(force = false) {
  if (config.isProduction && force) {
    throw new Error('Cannot force sync in production!');
  }

  try {
    // In development, just sync without altering to avoid migration issues
    await sequelize.sync({ force });
    logger.info('✓ Database synchronized');
  } catch (error) {
    // Log the error but don't fail - existing database is fine
    logger.warn('Database sync warning (existing tables ok):', { error: error.message });
  }
}

/**
 * Close database connection
 * @returns {Promise<void>}
 */
async function closeConnection() {
  await sequelize.close();
  logger.info('Database connection closed');
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
  closeConnection,
  Sequelize,
};
