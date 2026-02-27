/**
 * Authentication Service
 * Core authentication business logic
 */

const BaseService = require('../../../core/service/BaseService');
const UserRepository = require('../repositories/UserRepository');
const TokenService = require('./TokenService');
const PasswordService = require('./PasswordService');
const {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} = require('../../../core/errors');
const { logger, auditLogger } = require('../../../core/logger');

class AuthService extends BaseService {
  constructor(models) {
    const userRepository = new UserRepository(models.User);
    super(userRepository, 'AuthService');
    
    this.models = models;
    this.userRepository = userRepository;
  }

  /**
   * Register a new user
   * @param {Object} data - Registration data
   * @returns {Promise<Object>} Created user and tokens
   */
  async register(data) {
    const { email, password, role, ...profileData } = data;

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Validate password
    await PasswordService.validate(password, {
      email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
    });

    // Get role ID from role name
    const roleId = await this.getRoleId(role);

    // Create user with transaction
    const result = await this.userRepository.withTransaction(async (transaction) => {
      // Create user - using legacy schema field names
      const user = await this.models.User.create(
        {
          email: email.toLowerCase(),
          password_hash: password, // Model hook will hash it
          role_id: roleId,
          is_active: true,
        },
        { transaction }
      );

      // Create role-specific profile
      await this.createRoleProfile(user, { role, ...profileData }, transaction);

      // Generate tokens using role name
      const tokens = TokenService.generateTokenPair({
        id: user.id,
        email: user.email,
        role: role,
      });

      logger.info('User registered successfully', { userId: user.id, role });
      auditLogger.log('USER_REGISTERED', { userId: user.id, email, role });

      return {
        user: await this.sanitizeUser(user, role),
        ...tokens,
      };
    });

    return result;
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} meta - Request metadata (ip, userAgent)
   * @returns {Promise<Object>} User and tokens
   */
  async login(email, password, meta = {}) {
    // Find user with role
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      auditLogger.login(null, false, meta.ip, meta.userAgent);
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if active (using legacy field name)
    if (user.is_active === false) {
      auditLogger.login(user.id, false, meta.ip, meta.userAgent);
      throw new AuthenticationError('Account is deactivated. Please contact support.');
    }

    // Check if account is locked
    if (user.isAccountLocked && user.isAccountLocked()) {
      throw new AuthenticationError('Account is temporarily locked. Please try again later.');
    }

    // Verify password (using model's method or direct comparison)
    let isValidPassword = false;
    if (user.verifyPassword) {
      isValidPassword = await user.verifyPassword(password);
    } else {
      isValidPassword = await PasswordService.compare(password, user.password_hash);
    }
    
    if (!isValidPassword) {
      // Increment failed attempts if method exists
      if (user.incrementFailedAttempts) {
        await user.incrementFailedAttempts();
      }
      auditLogger.login(user.id, false, meta.ip, meta.userAgent);
      throw new AuthenticationError('Invalid email or password');
    }

    // Reset failed attempts on successful login
    if (user.resetFailedAttempts) {
      await user.resetFailedAttempts();
    }

    // Get role name from role_id
    const roleName = await this.getRoleName(user.role_id);

    // Generate tokens
    const tokens = TokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: roleName,
    });

    // Update last login
    await user.update({
      last_login: new Date(),
    });

    logger.info('User logged in', { userId: user.id });
    auditLogger.login(user.id, true, meta.ip, meta.userAgent);

    return {
      user: await this.sanitizeUser(user, roleName),
      ...tokens,
    };
  }

  /**
   * Logout user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async logout(userId) {
    // Legacy schema doesn't have refreshToken field, so just log
    logger.info('User logged out', { userId });
    auditLogger.logout(userId);
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    // Verify token
    const decoded = TokenService.verifyRefreshToken(refreshToken);

    // Find user
    const user = await this.userRepository.findById(decoded.userId);
    
    if (!user) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (user.is_active === false) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Get role name
    const roleName = await this.getRoleName(user.role_id);

    // Generate new tokens
    const tokens = TokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: roleName,
    });

    logger.debug('Token refreshed', { userId: user.id });

    return tokens;
  }

  /**
   * Change password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.userRepository.findById(userId);

    // Verify current password
    const isValid = await PasswordService.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password
    await PasswordService.validate(newPassword, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Hash and update
    const hashedPassword = await PasswordService.hash(newPassword);
    await user.update({
      password: hashedPassword,
      refreshToken: null, // Invalidate all sessions
    });

    logger.info('Password changed', { userId });
    auditLogger.log('PASSWORD_CHANGED', { userId });
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset token (in dev) or success message
   */
  async requestPasswordReset(email) {
    const user = await this.userRepository.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      logger.debug('Password reset requested for non-existent email', { email });
      return { message: 'If an account exists, a reset email has been sent' };
    }

    const resetToken = TokenService.generatePasswordResetToken(user.id);

    // TODO: Send email with reset link
    // await EmailService.sendPasswordReset(user.email, resetToken);

    logger.info('Password reset requested', { userId: user.id });
    auditLogger.log('PASSWORD_RESET_REQUESTED', { userId: user.id });

    // In development, return token for testing
    const response = { message: 'If an account exists, a reset email has been sent' };
    if (process.env.NODE_ENV === 'development') {
      response.resetToken = resetToken;
    }

    return response;
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async resetPassword(token, newPassword) {
    const decoded = TokenService.verifyPasswordResetToken(token);
    const user = await this.userRepository.findById(decoded.userId);

    // Validate new password
    await PasswordService.validate(newPassword, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Hash and update
    const hashedPassword = await PasswordService.hash(newPassword);
    await user.update({
      password: hashedPassword,
      refreshToken: null, // Invalidate all sessions
    });

    logger.info('Password reset completed', { userId: user.id });
    auditLogger.log('PASSWORD_RESET_COMPLETED', { userId: user.id });
  }

  /**
   * Get current user profile
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    const user = await this.userRepository.findWithProfile(userId);
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   * @param {number} userId - User ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, data) {
    // Prevent updating sensitive fields
    const { password, email, role, isActive, refreshToken, ...safeData } = data;

    const user = await this.userRepository.update(userId, safeData);
    logger.info('Profile updated', { userId });

    return this.sanitizeUser(user);
  }

  /**
   * Verify user email
   * @param {string} token - Verification token
   * @returns {Promise<void>}
   */
  async verifyEmail(token) {
    const decoded = TokenService.verifyEmailVerificationToken(token);
    const user = await this.userRepository.findById(decoded.userId);

    await user.update({ emailVerified: true });
    logger.info('Email verified', { userId: user.id });
  }

  /**
   * Create role-specific profile
   * @private
   */
  async createRoleProfile(user, data, transaction) {
    const { role } = user;
    const profileData = { userId: user.id };

    switch (role) {
      case 'patient':
        // Generate unique patient ID
        profileData.unique_patient_id = `PAT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        profileData.date_of_birth = data.dateOfBirth;
        profileData.gender = data.gender;
        profileData.blood_group = data.bloodGroup;
        profileData.phone = data.phone;
        profileData.address = data.address;
        profileData.emergency_contact = data.emergencyContact;
        profileData.emergency_phone = data.emergencyPhone;
        profileData.first_name = data.firstName;
        profileData.last_name = data.lastName;
        await this.models.Patient.create(profileData, { transaction });
        break;

      case 'doctor':
        profileData.specialization = data.specialization;
        profileData.license_number = data.licenseNumber;
        profileData.hospital_affiliation = data.hospitalAffiliation;
        profileData.phone = data.phone;
        profileData.address = data.address;
        profileData.first_name = data.firstName;
        profileData.last_name = data.lastName;
        await this.models.Doctor.create(profileData, { transaction });
        break;

      case 'pharmacy':
        profileData.pharmacy_name = data.pharmacyName;
        profileData.license_number = data.licenseNumber;
        profileData.phone = data.phone;
        profileData.address = data.address;
        await this.models.Pharmacy.create(profileData, { transaction });
        break;

      case 'lab':
        profileData.lab_name = data.labName;
        profileData.license_number = data.licenseNumber;
        profileData.phone = data.phone;
        profileData.address = data.address;
        await this.models.Lab.create(profileData, { transaction });
        break;

      default:
        logger.warn('Unknown role for profile creation', { role: data.role });
    }
  }

  /**
   * Get role ID from role name
   * @private
   */
  async getRoleId(roleName) {
    const roleMap = {
      patient: 1,
      doctor: 2,
      pharmacy: 3,
      lab: 4,
      admin: 5,
    };

    // First try the map (for speed)
    if (roleMap[roleName]) {
      return roleMap[roleName];
    }

    // Fall back to database lookup
    if (this.models.Role) {
      const role = await this.models.Role.findOne({ where: { name: roleName } });
      if (role) return role.id;
    }

    throw new ValidationError(`Invalid role: ${roleName}`);
  }

  /**
   * Get role name from role ID
   * @private
   */
  async getRoleName(roleId) {
    const roleIdMap = {
      1: 'patient',
      2: 'doctor',
      3: 'pharmacy',
      4: 'lab',
      5: 'admin',
    };

    // First try the map (for speed)
    if (roleIdMap[roleId]) {
      return roleIdMap[roleId];
    }

    // Fall back to database lookup
    if (this.models.Role) {
      const role = await this.models.Role.findByPk(roleId);
      if (role) return role.name;
    }

    return 'unknown';
  }

  /**
   * Remove sensitive fields from user object
   * @private
   */
  async sanitizeUser(user, roleName = null) {
    if (!user) return null;

    const userData = user.toJSON ? user.toJSON() : { ...user };
    
    // Remove sensitive fields
    delete userData.password_hash;
    delete userData.password;
    delete userData.password_reset_token;
    delete userData.password_reset_expires;

    // Add role name if not present
    if (roleName) {
      userData.role = roleName;
    } else if (userData.role_id && !userData.role) {
      userData.role = await this.getRoleName(userData.role_id);
    }

    return userData;
  }
}

module.exports = AuthService;
