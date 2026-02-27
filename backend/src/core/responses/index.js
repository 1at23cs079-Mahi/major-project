/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all endpoints
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
function success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
  const response = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
}

/**
 * Created Response - 201
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
function created(res, data, message = 'Resource created successfully') {
  return success(res, data, message, 201);
}

/**
 * No Content Response - 204
 * @param {Object} res - Express response object
 */
function noContent(res) {
  return res.status(204).send();
}

/**
 * Paginated Response
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items
 * @param {Object} pagination - Pagination details
 * @param {string} message - Success message
 */
function paginated(res, items, pagination, message = 'Success') {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);
  
  return success(
    res,
    items,
    message,
    200,
    {
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  );
}

/**
 * Error Response (for custom error handling in controllers)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 */
function error(res, message, statusCode = 500, code = 'ERROR', details = null) {
  const response = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
}

/**
 * Parse pagination parameters from request
 * @param {Object} query - Request query object
 * @param {Object} defaults - Default pagination values
 * @returns {Object} Normalized pagination object
 */
function parsePagination(query, defaults = { page: 1, limit: 10, maxLimit: 100 }) {
  let page = parseInt(query.page, 10) || defaults.page;
  let limit = parseInt(query.limit, 10) || defaults.limit;

  // Ensure positive values
  page = Math.max(1, page);
  limit = Math.max(1, Math.min(limit, defaults.maxLimit));

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Parse sorting parameters from request
 * @param {Object} query - Request query object
 * @param {Array} allowedFields - Fields allowed for sorting
 * @param {Object} defaults - Default sort configuration
 * @returns {Array} Sequelize order array
 */
function parseSorting(query, allowedFields = [], defaults = { field: 'createdAt', order: 'DESC' }) {
  const sortField = query.sortBy || defaults.field;
  const sortOrder = (query.order || defaults.order).toUpperCase();

  // Validate sort field
  if (allowedFields.length > 0 && !allowedFields.includes(sortField)) {
    return [[defaults.field, defaults.order]];
  }

  // Validate sort order
  const validOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : defaults.order;

  return [[sortField, validOrder]];
}

module.exports = {
  success,
  created,
  noContent,
  paginated,
  error,
  parsePagination,
  parseSorting,
};
