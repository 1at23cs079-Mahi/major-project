const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { User, Role, Patient } = require('../models');

/**
 * Passport Authentication Strategies
 * Supports Local (email/password) and Google OAuth
 */

// LOCAL STRATEGY - Email/Password
passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({
            where: { email: email.toLowerCase() },
            include: { association: 'role', attributes: ['name'] }
        });

        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.is_active) {
            return done(null, false, { message: 'Account inactive - pending approval' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// GOOGLE STRATEGY - OAuth 2.0 (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
    try {
        // Extract email and name from Google profile
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName;
        const lastName = profile.name.familyName || '';

        // Find or create user
        let user = await User.findOne({
            where: { email },
            include: { association: 'role', attributes: ['name'] }
        });

        if (!user) {
            // Create new user with Patient role if doesn't exist
            const patientRole = await Role.findOne({ where: { name: 'Patient' } });

            user = await User.create({
                email: email.toLowerCase(),
                password_hash: require('crypto').randomBytes(64).toString('hex'), // OAuth users get random unguessable password
                role_id: patientRole.id,
                is_active: true
            });

            // Create patient profile
            await Patient.create({
                user_id: user.id,
                first_name: firstName,
                last_name: lastName
            });

            user = await user.reload({
                include: { association: 'role', attributes: ['name'] }
            });
        }

        if (!user.is_active) {
            return done(null, false, { message: 'Account inactive' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
    }));
} else {
    console.warn('⚠️ Google OAuth credentials not configured - Google login disabled');
};

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id, {
            include: { association: 'role', attributes: ['name', 'permissions'] }
        });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
