/**
 * Auth Module Routes
 * Version 2 API routes with validation
 */

const express = require('express');
const { validate, authSchemas } = require('../../../core/validation');
const {
  authenticate,
  authRateLimit,
} = require('../middleware/authMiddleware');

/**
 * Create auth router with injected controller
 * @param {Object} authController - Auth controller instance
 * @param {Object} userRepository - User repository for auth middleware
 * @returns {Router} Express router
 */
function createAuthRouter(authController, userRepository) {
  const router = express.Router();

  // Public routes with rate limiting
  router.post(
    '/register',
    authRateLimit({ maxAttempts: 10, windowMs: 60 * 60 * 1000 }), // 10 per hour
    validate(authSchemas.register),
    authController.register
  );

  router.post(
    '/login',
    authRateLimit({ maxAttempts: 5, windowMs: 15 * 60 * 1000 }), // 5 per 15 min
    validate(authSchemas.login),
    authController.login
  );

  router.post(
    '/refresh-token',
    validate(authSchemas.refreshToken),
    authController.refreshToken
  );

  router.post(
    '/forgot-password',
    authRateLimit({ maxAttempts: 3, windowMs: 60 * 60 * 1000 }), // 3 per hour
    validate(authSchemas.forgotPassword),
    authController.forgotPassword
  );

  router.post(
    '/reset-password',
    validate(authSchemas.resetPassword),
    authController.resetPassword
  );

  router.post(
    '/verify-email',
    authController.verifyEmail
  );

  // Protected routes
  router.use(authenticate(userRepository));

  router.post('/logout', authController.logout);

  router.get('/profile', authController.getProfile);
  router.get('/me', authController.me);

  router.patch(
    '/profile',
    authController.updateProfile
  );

  router.post(
    '/change-password',
    validate(authSchemas.changePassword),
    authController.changePassword
  );

  return router;
}

module.exports = createAuthRouter;
