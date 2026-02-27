/**
 * Token Service
 * Handles JWT token generation, verification, and management
 */

const jwt = require('jsonwebtoken');
const config = require('../../../config');
const { AuthenticationError } = require('../../../core/errors');
const { logger } = require('../../../core/logger');

class TokenService {
  constructor() {
    this.accessSecret = config.jwt.secret;
    this.refreshSecret = config.jwt.refreshSecret;
    this.accessExpiresIn = config.jwt.accessExpiresIn;
    this.refreshExpiresIn = config.jwt.refreshExpiresIn;
    this.issuer = config.jwt.issuer;
    this.audience = config.jwt.audience;
  }

  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @returns {string} JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
      issuer: this.issuer,
      audience: this.audience,
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: this.issuer,
      audience: this.audience,
    });
  }

  /**
   * Generate both tokens
   * @param {Object} user - User object
   * @returns {Object} { accessToken, refreshToken, expiresIn }
   */
  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirationSeconds(this.accessExpiresIn),
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify access token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   * @throws {AuthenticationError} if token is invalid
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessSecret, {
        issuer: this.issuer,
        audience: this.audience,
      });
    } catch (error) {
      logger.debug('Access token verification failed', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Access token has expired');
      }
      throw new AuthenticationError('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - JWT refresh token
   * @returns {Object} Decoded payload
   * @throws {AuthenticationError} if token is invalid
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: this.issuer,
        audience: this.audience,
      });
    } catch (error) {
      logger.debug('Refresh token verification failed', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Refresh token has expired');
      }
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload or null
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Convert expiration string to seconds
   * @private
   */
  getExpirationSeconds(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 1);
  }

  /**
   * Generate password reset token
   * @param {number} userId - User ID
   * @returns {string} Reset token
   */
  generatePasswordResetToken(userId) {
    return jwt.sign(
      { userId, type: 'password_reset' },
      this.accessSecret,
      { expiresIn: '1h' }
    );
  }

  /**
   * Verify password reset token
   * @param {string} token - Reset token
   * @returns {Object} Decoded payload
   * @throws {AuthenticationError} if token is invalid
   */
  verifyPasswordResetToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessSecret);
      if (decoded.type !== 'password_reset') {
        throw new AuthenticationError('Invalid reset token');
      }
      return decoded;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError('Invalid or expired reset token');
    }
  }

  /**
   * Generate email verification token
   * @param {number} userId - User ID
   * @returns {string} Verification token
   */
  generateEmailVerificationToken(userId) {
    return jwt.sign(
      { userId, type: 'email_verification' },
      this.accessSecret,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify email verification token
   * @param {string} token - Verification token
   * @returns {Object} Decoded payload
   * @throws {AuthenticationError} if token is invalid
   */
  verifyEmailVerificationToken(token) {
    try {
      const decoded = jwt.verify(token, this.accessSecret);
      if (decoded.type !== 'email_verification') {
        throw new AuthenticationError('Invalid verification token');
      }
      return decoded;
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError('Invalid or expired verification token');
    }
  }
}

module.exports = new TokenService();
