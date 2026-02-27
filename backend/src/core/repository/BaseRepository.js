/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 * Implements the Repository Pattern for data access abstraction
 */

const { NotFoundError, DatabaseError } = require('../errors');
const { logger } = require('../logger');

class BaseRepository {
  /**
   * @param {Model} model - Sequelize model
   * @param {string} entityName - Name for error messages
   */
  constructor(model, entityName = 'Entity') {
    if (!model) {
      throw new Error('Model is required for BaseRepository');
    }
    this.model = model;
    this.entityName = entityName;
  }

  /**
   * Find a single record by ID
   * @param {number|string} id - Record ID
   * @param {Object} options - Sequelize options
   * @returns {Promise<Object>} Found record
   * @throws {NotFoundError} if record doesn't exist
   */
  async findById(id, options = {}) {
    try {
      const record = await this.model.findByPk(id, options);
      if (!record) {
        throw new NotFoundError(this.entityName, id);
      }
      return record;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error finding ${this.entityName} by ID`, { id, error: error.message });
      throw new DatabaseError(`Failed to find ${this.entityName}`, error);
    }
  }

  /**
   * Find a single record by ID (returns null instead of throwing)
   * @param {number|string} id - Record ID
   * @param {Object} options - Sequelize options
   * @returns {Promise<Object|null>} Found record or null
   */
  async findByIdOrNull(id, options = {}) {
    try {
      return await this.model.findByPk(id, options);
    } catch (error) {
      logger.error(`Error finding ${this.entityName} by ID`, { id, error: error.message });
      throw new DatabaseError(`Failed to find ${this.entityName}`, error);
    }
  }

  /**
   * Find a single record by condition
   * @param {Object} where - Where conditions
   * @param {Object} options - Sequelize options
   * @returns {Promise<Object|null>} Found record or null
   */
  async findOne(where, options = {}) {
    try {
      return await this.model.findOne({ where, ...options });
    } catch (error) {
      logger.error(`Error finding ${this.entityName}`, { where, error: error.message });
      throw new DatabaseError(`Failed to find ${this.entityName}`, error);
    }
  }

  /**
   * Find a single record or throw NotFoundError
   * @param {Object} where - Where conditions
   * @param {Object} options - Sequelize options
   * @returns {Promise<Object>} Found record
   * @throws {NotFoundError} if record doesn't exist
   */
  async findOneOrFail(where, options = {}) {
    const record = await this.findOne(where, options);
    if (!record) {
      throw new NotFoundError(this.entityName);
    }
    return record;
  }

  /**
   * Find all records matching conditions
   * @param {Object} where - Where conditions
   * @param {Object} options - Sequelize options
   * @returns {Promise<Array>} Array of records
   */
  async findAll(where = {}, options = {}) {
    try {
      return await this.model.findAll({ where, ...options });
    } catch (error) {
      logger.error(`Error finding ${this.entityName}s`, { where, error: error.message });
      throw new DatabaseError(`Failed to find ${this.entityName}s`, error);
    }
  }

  /**
   * Find all records with pagination
   * @param {Object} where - Where conditions
   * @param {Object} pagination - { page, limit, offset }
   * @param {Object} options - Sequelize options
   * @returns {Promise<Object>} { rows, count, pagination }
   */
  async findPaginated(where = {}, pagination = {}, options = {}) {
    try {
      const { page = 1, limit = 10, offset = 0 } = pagination;
      
      const { rows, count } = await this.model.findAndCountAll({
        where,
        limit,
        offset,
        ...options,
      });

      return {
        data: rows,
        total: count,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error(`Error finding paginated ${this.entityName}s`, { error: error.message });
      throw new DatabaseError(`Failed to find ${this.entityName}s`, error);
    }
  }

  /**
   * Create a new record
   * @param {Object} data - Record data
   * @param {Object} options - Sequelize options
   * @returns {Promise<Object>} Created record
   */
  async create(data, options = {}) {
    try {
      return await this.model.create(data, options);
    } catch (error) {
      logger.error(`Error creating ${this.entityName}`, { error: error.message });
      throw new DatabaseError(`Failed to create ${this.entityName}`, error);
    }
  }

  /**
   * Create multiple records
   * @param {Array} dataArray - Array of record data
   * @param {Object} options - Sequelize options
   * @returns {Promise<Array>} Created records
   */
  async bulkCreate(dataArray, options = {}) {
    try {
      return await this.model.bulkCreate(dataArray, options);
    } catch (error) {
      logger.error(`Error bulk creating ${this.entityName}s`, { error: error.message });
      throw new DatabaseError(`Failed to create ${this.entityName}s`, error);
    }
  }

  /**
   * Update a record by ID
   * @param {number|string} id - Record ID
   * @param {Object} data - Update data
   * @param {Object} options - Sequelize options
   * @returns {Promise<Object>} Updated record
   */
  async update(id, data, options = {}) {
    try {
      const record = await this.findById(id);
      return await record.update(data, options);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error updating ${this.entityName}`, { id, error: error.message });
      throw new DatabaseError(`Failed to update ${this.entityName}`, error);
    }
  }

  /**
   * Update records matching condition
   * @param {Object} where - Where conditions
   * @param {Object} data - Update data
   * @param {Object} options - Sequelize options
   * @returns {Promise<number>} Number of updated records
   */
  async updateWhere(where, data, options = {}) {
    try {
      const [affectedCount] = await this.model.update(data, { where, ...options });
      return affectedCount;
    } catch (error) {
      logger.error(`Error updating ${this.entityName}s`, { where, error: error.message });
      throw new DatabaseError(`Failed to update ${this.entityName}s`, error);
    }
  }

  /**
   * Delete a record by ID
   * @param {number|string} id - Record ID
   * @param {Object} options - Sequelize options
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, options = {}) {
    try {
      const record = await this.findById(id);
      await record.destroy(options);
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      logger.error(`Error deleting ${this.entityName}`, { id, error: error.message });
      throw new DatabaseError(`Failed to delete ${this.entityName}`, error);
    }
  }

  /**
   * Soft delete a record by ID (sets deletedAt)
   * @param {number|string} id - Record ID
   * @returns {Promise<Object>} Deleted record
   */
  async softDelete(id) {
    return this.update(id, { deletedAt: new Date() });
  }

  /**
   * Delete records matching condition
   * @param {Object} where - Where conditions
   * @param {Object} options - Sequelize options
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteWhere(where, options = {}) {
    try {
      return await this.model.destroy({ where, ...options });
    } catch (error) {
      logger.error(`Error deleting ${this.entityName}s`, { where, error: error.message });
      throw new DatabaseError(`Failed to delete ${this.entityName}s`, error);
    }
  }

  /**
   * Count records matching condition
   * @param {Object} where - Where conditions
   * @returns {Promise<number>} Count
   */
  async count(where = {}) {
    try {
      return await this.model.count({ where });
    } catch (error) {
      logger.error(`Error counting ${this.entityName}s`, { error: error.message });
      throw new DatabaseError(`Failed to count ${this.entityName}s`, error);
    }
  }

  /**
   * Check if a record exists
   * @param {Object} where - Where conditions
   * @returns {Promise<boolean>} Exists status
   */
  async exists(where) {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Find or create a record
   * @param {Object} where - Where conditions
   * @param {Object} defaults - Default values if creating
   * @returns {Promise<[Object, boolean]>} [record, created]
   */
  async findOrCreate(where, defaults = {}) {
    try {
      return await this.model.findOrCreate({
        where,
        defaults: { ...where, ...defaults },
      });
    } catch (error) {
      logger.error(`Error in findOrCreate ${this.entityName}`, { error: error.message });
      throw new DatabaseError(`Failed to find or create ${this.entityName}`, error);
    }
  }

  /**
   * Execute a raw query (use sparingly)
   * @param {string} query - SQL query
   * @param {Object} options - Sequelize options
   * @returns {Promise<Array>} Query results
   */
  async rawQuery(query, options = {}) {
    try {
      const sequelize = this.model.sequelize;
      return await sequelize.query(query, options);
    } catch (error) {
      logger.error('Error executing raw query', { error: error.message });
      throw new DatabaseError('Failed to execute query', error);
    }
  }

  /**
   * Execute operations within a transaction
   * @param {Function} callback - Async function receiving transaction
   * @returns {Promise<any>} Transaction result
   */
  async withTransaction(callback) {
    const sequelize = this.model.sequelize;
    const transaction = await sequelize.transaction();
    
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = BaseRepository;
