const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/auth');

/**
 * LEGACY AUTH ROUTES
 * These routes use the original authController for backward compatibility
 * Main authentication should use /api/auth endpoints with authControllerEnhanced
 */

/**
 * LEGACY REGISTRATION ENDPOINTS
 */

// Legacy Patient registration
router.post('/v1/register/patient', authLimiter, authController.registerPatient);

// Legacy Doctor registration
router.post('/v1/register/doctor', authLimiter, authController.registerDoctor);

// Legacy Pharmacy registration
router.post('/v1/register/pharmacy', authLimiter, authController.registerPharmacy);

// Legacy Lab registration
router.post('/v1/register/lab', authLimiter, authController.registerLab);

/**
 * LEGACY LOGIN ENDPOINTS
 */

// Legacy unified login
router.post('/v1/login', authLimiter, authController.login);

// Legacy logout
router.post('/v1/logout', authMiddleware, authController.logout);

/**
 * LEGACY PASSWORD MANAGEMENT
 */

// Legacy request password reset
router.post('/v1/password-reset/request', authController.requestPasswordReset);

// Legacy verify reset token
router.post('/v1/password-reset/verify', authController.verifyResetToken);

// Legacy reset password
router.post('/v1/password-reset/reset', authController.resetPassword);

/**
 * LEGACY PROFILE
 */

// Legacy get current user
router.get('/v1/me', authMiddleware, authController.getCurrentUser);

/**
 * INFO ENDPOINT
 */
router.get('/info', (req, res) => {
    res.json({
        success: true,
        message: 'Legacy Auth API',
        note: 'These endpoints use the original authentication controller.',
        recommendation: 'Use /api/auth endpoints for enhanced security features.',
        endpoints: {
            registration: [
                'POST /api/auth-legacy/v1/register/patient',
                'POST /api/auth-legacy/v1/register/doctor',
                'POST /api/auth-legacy/v1/register/pharmacy',
                'POST /api/auth-legacy/v1/register/lab'
            ],
            authentication: [
                'POST /api/auth-legacy/v1/login',
                'POST /api/auth-legacy/v1/logout',
                'GET /api/auth-legacy/v1/me'
            ],
            passwordReset: [
                'POST /api/auth-legacy/v1/password-reset/request',
                'POST /api/auth-legacy/v1/password-reset/verify',
                'POST /api/auth-legacy/v1/password-reset/reset'
            ]
        }
    });
});

module.exports = router;
