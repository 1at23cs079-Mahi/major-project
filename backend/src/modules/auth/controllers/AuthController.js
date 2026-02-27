/**
 * Auth Controller
 * HTTP layer for authentication endpoints
 */

const { asyncHandler } = require('../../../core/errors');
const { success, created } = require('../../../core/responses');
const { logger } = require('../../../core/logger');

/**
 * Create Auth Controller with injected service
 * @param {AuthService} authService - Auth service instance
 * @returns {Object} Controller methods
 */
function createAuthController(authService) {
  return {
    /**
     * POST /auth/register
     * Register a new user
     */
    register: asyncHandler(async (req, res) => {
      const result = await authService.register(req.body);
      
      created(res, result, 'Registration successful');
    }),

    /**
     * POST /auth/login
     * Login user
     */
    login: asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const meta = {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      };

      const result = await authService.login(email, password, meta);

      success(res, result, 'Login successful');
    }),

    /**
     * POST /auth/logout
     * Logout user
     */
    logout: asyncHandler(async (req, res) => {
      await authService.logout(req.user.userId);
      
      success(res, null, 'Logout successful');
    }),

    /**
     * POST /auth/refresh-token
     * Refresh access token
     */
    refreshToken: asyncHandler(async (req, res) => {
      const { refreshToken } = req.body;
      
      const result = await authService.refreshToken(refreshToken);

      success(res, result, 'Token refreshed successfully');
    }),

    /**
     * POST /auth/forgot-password
     * Request password reset
     */
    forgotPassword: asyncHandler(async (req, res) => {
      const { email } = req.body;
      
      const result = await authService.requestPasswordReset(email);

      success(res, result);
    }),

    /**
     * POST /auth/reset-password
     * Reset password with token
     */
    resetPassword: asyncHandler(async (req, res) => {
      const { token, password } = req.body;
      
      await authService.resetPassword(token, password);

      success(res, null, 'Password reset successful');
    }),

    /**
     * POST /auth/change-password
     * Change password (authenticated)
     */
    changePassword: asyncHandler(async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      
      await authService.changePassword(req.user.userId, currentPassword, newPassword);

      success(res, null, 'Password changed successfully');
    }),

    /**
     * GET /auth/profile
     * Get current user profile
     */
    getProfile: asyncHandler(async (req, res) => {
      const profile = await authService.getProfile(req.user.userId);

      success(res, profile);
    }),

    /**
     * PATCH /auth/profile
     * Update user profile
     */
    updateProfile: asyncHandler(async (req, res) => {
      const profile = await authService.updateProfile(req.user.userId, req.body);

      success(res, profile, 'Profile updated successfully');
    }),

    /**
     * POST /auth/verify-email
     * Verify email with token
     */
    verifyEmail: asyncHandler(async (req, res) => {
      const { token } = req.body;
      
      await authService.verifyEmail(token);

      success(res, null, 'Email verified successfully');
    }),

    /**
     * GET /auth/me
     * Get current authenticated user
     */
    me: asyncHandler(async (req, res) => {
      const profile = await authService.getProfile(req.user.userId);

      success(res, profile);
    }),
  };
}

module.exports = createAuthController;
