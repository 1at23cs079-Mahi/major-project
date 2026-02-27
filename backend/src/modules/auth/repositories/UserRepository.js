/**
 * User Repository
 * Data access layer for User entity
 */

const BaseRepository = require('../../../core/repository/BaseRepository');

class UserRepository extends BaseRepository {
  constructor(UserModel) {
    super(UserModel, 'User');
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {Object} options - Additional options
   * @returns {Promise<Object|null>} User or null
   */
  async findByEmail(email, options = {}) {
    return this.findOne({ email: email.toLowerCase() }, options);
  }

  /**
   * Find user with role-specific profile
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User with profile
   */
  async findWithProfile(userId) {
    const user = await this.findById(userId);
    
    // Get the associated profile based on role
    const profileInclude = this.getProfileInclude(user.role);
    if (profileInclude) {
      return this.findById(userId, { include: [profileInclude] });
    }
    
    return user;
  }

  /**
   * Find active users by role
   * @param {string} role - User role
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated users
   */
  async findByRole(role, pagination = {}) {
    return this.findPaginated(
      { role, isActive: true },
      pagination,
      { attributes: { exclude: ['password', 'refreshToken'] } }
    );
  }

  /**
   * Update refresh token
   * @param {number} userId - User ID
   * @param {string} refreshToken - New refresh token
   * @returns {Promise<Object>} Updated user
   */
  async updateRefreshToken(userId, refreshToken) {
    return this.update(userId, { refreshToken });
  }

  /**
   * Clear refresh token (logout)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async clearRefreshToken(userId) {
    return this.update(userId, { refreshToken: null });
  }

  /**
   * Update password
   * @param {number} userId - User ID
   * @param {string} hashedPassword - New hashed password
   * @returns {Promise<Object>} Updated user
   */
  async updatePassword(userId, hashedPassword) {
    return this.update(userId, { password: hashedPassword });
  }

  /**
   * Update last login
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async updateLastLogin(userId) {
    return this.update(userId, { lastLogin: new Date() });
  }

  /**
   * Deactivate user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async deactivate(userId) {
    return this.update(userId, { isActive: false });
  }

  /**
   * Activate user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async activate(userId) {
    return this.update(userId, { isActive: true });
  }

  /**
   * Find users for admin dashboard
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Paginated users
   */
  async findForAdmin(filters = {}, pagination = {}) {
    const where = {};
    
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${filters.search}%` } },
        { lastName: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return this.findPaginated(where, pagination, {
      attributes: { exclude: ['password', 'refreshToken'] },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get profile include based on role
   * @private
   */
  getProfileInclude(role) {
    const roleModels = {
      patient: 'Patient',
      doctor: 'Doctor',
      pharmacy: 'Pharmacy',
      lab: 'Lab',
    };

    const modelName = roleModels[role];
    if (!modelName) return null;

    // Note: Model associations must be set up in models/index.js
    return { association: modelName.toLowerCase() };
  }
}

module.exports = UserRepository;
