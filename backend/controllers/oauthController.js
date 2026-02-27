const { generateTokenPair } = require('../middleware/authEnhanced');
const { ActivityLog } = require('../models');

/**
 * OAuth Controller
 * Handles Google OAuth callbacks and token generation
 */

// Log activity helper
const logActivity = async (userId, action, details = {}) => {
    try {
        await ActivityLog.create({
            user_id: userId,
            action,
            details: JSON.stringify(details),
            ip_address: '0.0.0.0'
        });
    } catch (error) {
        console.error('Activity logging error:', error);
    }
};

/**
 * GOOGLE OAUTH CALLBACK
 * After successful Google authentication
 */
exports.googleCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const { accessToken, refreshToken } = generateTokenPair(req.user.id);

        await logActivity(req.user.id, 'GOOGLE_OAUTH_LOGIN', {
            email: req.user.email
        });

        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.FRONTEND_URL}/auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${req.user.role.name}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_failed`);
    }
};

/**
 * GET GOOGLE AUTH TOKEN (for mobile/API clients)
 * Returns tokens in JSON instead of redirecting
 */
exports.getGoogleToken = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed'
            });
        }

        const { accessToken, refreshToken } = generateTokenPair(req.user.id);

        await logActivity(req.user.id, 'GOOGLE_OAUTH_LOGIN_API', {
            email: req.user.email
        });

        res.json({
            success: true,
            message: 'Google authentication successful',
            data: {
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    role: req.user.role.name
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Get Google token error:', error);
        res.status(500).json({
            success: false,
            message: 'Token generation failed'
        });
    }
};

module.exports = exports;
