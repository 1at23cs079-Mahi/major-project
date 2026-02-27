/**
 * Model Loader
 * Loads and associates all Sequelize models
 */

const { sequelize, Sequelize } = require('./index');
const { logger } = require('../core/logger');
const path = require('path');
const fs = require('fs');

// Import models from old structure (temporary during migration)
const oldModelsPath = path.join(__dirname, '../../models');

/**
 * Load models from directory
 * @returns {Object} Models object
 */
function loadModels() {
  const models = {};

  // Check if old models directory exists
  if (fs.existsSync(oldModelsPath)) {
    // Load from existing models folder
    const modelFiles = fs.readdirSync(oldModelsPath)
      .filter(file => 
        file.endsWith('.js') && 
        file !== 'index.js' &&
        !file.startsWith('.')
      );

    for (const file of modelFiles) {
      try {
        const modelDefiner = require(path.join(oldModelsPath, file));
        if (typeof modelDefiner === 'function') {
          const model = modelDefiner(sequelize, Sequelize.DataTypes);
          if (model && model.name) {
            models[model.name] = model;
          }
        } else if (modelDefiner.init) {
          // Class-based model
          modelDefiner.init(modelDefiner.fields || {}, { sequelize });
          models[modelDefiner.name] = modelDefiner;
        }
      } catch (error) {
        logger.warn(`Failed to load model ${file}:`, { error: error.message });
      }
    }
  }

  // Setup associations
  Object.values(models).forEach(model => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  logger.info(`✓ Loaded ${Object.keys(models).length} models`);

  return models;
}

/**
 * Get or create models singleton
 */
let modelsCache = null;

function getModels() {
  if (!modelsCache) {
    modelsCache = loadModels();
  }
  return modelsCache;
}

module.exports = {
  loadModels,
  getModels,
};
