/**
 * Base Service Class
 * Provides common business logic patterns for all services
 * Implements the Service Layer pattern
 */

const { logger } = require('../logger');

class BaseService {
  /**
   * @param {BaseRepository} repository - Repository instance
   * @param {string} serviceName - Name for logging
   */
  constructor(repository, serviceName = 'Service') {
    this.repository = repository;
    this.serviceName = serviceName;
  }

  /**
   * Get entity by ID
   * @param {number|string} id - Entity ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Entity
   */
  async getById(id, options = {}) {
    logger.debug(`${this.serviceName}.getById`, { id });
    return this.repository.findById(id, options);
  }

  /**
   * Get all entities with optional filtering and pagination
   * @param {Object} filters - Filter conditions
   * @param {Object} pagination - Pagination options
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Paginated result
   */
  async getAll(filters = {}, pagination = {}, options = {}) {
    logger.debug(`${this.serviceName}.getAll`, { filters, pagination });
    return this.repository.findPaginated(filters, pagination, options);
  }

  /**
   * Create a new entity
   * @param {Object} data - Entity data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created entity
   */
  async create(data, options = {}) {
    logger.debug(`${this.serviceName}.create`, { data: '***' });
    return this.repository.create(data, options);
  }

  /**
   * Update an entity by ID
   * @param {number|string} id - Entity ID
   * @param {Object} data - Update data
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Updated entity
   */
  async update(id, data, options = {}) {
    logger.debug(`${this.serviceName}.update`, { id, data: '***' });
    return this.repository.update(id, data, options);
  }

  /**
   * Delete an entity by ID
   * @param {number|string} id - Entity ID
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, options = {}) {
    logger.debug(`${this.serviceName}.delete`, { id });
    return this.repository.delete(id, options);
  }

  /**
   * Check if an entity exists
   * @param {Object} conditions - Search conditions
   * @returns {Promise<boolean>} Exists status
   */
  async exists(conditions) {
    return this.repository.exists(conditions);
  }

  /**
   * Count entities matching conditions
   * @param {Object} conditions - Search conditions
   * @returns {Promise<number>} Count
   */
  async count(conditions = {}) {
    return this.repository.count(conditions);
  }

  /**
   * Execute operations within a transaction
   * @param {Function} callback - Async function receiving transaction
   * @returns {Promise<any>} Transaction result
   */
  async withTransaction(callback) {
    return this.repository.withTransaction(callback);
  }
}

module.exports = BaseService;
