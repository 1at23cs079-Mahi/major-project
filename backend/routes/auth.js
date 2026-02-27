const express = require('express');
const router = express.Router();
const passport = require('passport');
const authControllerEnhanced = require('../controllers/authControllerEnhanced');
const oauthController = require('../controllers/oauthController');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/authEnhanced');

/**
 * REGISTRATION ENDPOINTS (Enhanced)
 */

// Patient registration with validation and bcrypt
router.post('/register/patient', authLimiter, authControllerEnhanced.registerPatient);

// Doctor registration (requires admin approval)
router.post('/register/doctor', authLimiter, authControllerEnhanced.registerDoctor);

// Pharmacy registration (requires admin approval)
router.post('/register/pharmacy', authLimiter, authControllerEnhanced.registerPharmacy);

// Lab registration (requires admin approval)
router.post('/register/lab', authLimiter, authControllerEnhanced.registerLab);

/**
 * LOGIN ENDPOINTS
 */

// Unified login for all roles with account lockout protection
router.post('/login', authLimiter, authControllerEnhanced.login);

// Refresh token to get new access token
router.post('/refresh-token', authControllerEnhanced.refreshToken);

// Logout
router.post('/logout', authenticateToken, authControllerEnhanced.logout);

/**
 * PASSWORD MANAGEMENT
 */

// Request password reset
router.post('/password-reset/request', passwordResetLimiter, authControllerEnhanced.requestPasswordReset);

// Confirm password reset with token
router.post('/password-reset/confirm', passwordResetLimiter, authControllerEnhanced.confirmPasswordReset);

/**
 * GOOGLE OAUTH
 */

// Initiate Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback (for web browsers)
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    oauthController.googleCallback
);

// Google OAuth token endpoint (for API/mobile clients)
router.post('/google/token',
    passport.authenticate('google', { session: false }),
    oauthController.getGoogleToken
);

/**
 * USER PROFILE
 */

// Get current user profile
router.get('/me', authenticateToken, authControllerEnhanced.getCurrentUser);

module.exports = router;
