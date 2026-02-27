const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const { testConnection, sequelize } = require('./config/database');
require('./config/passport'); // Initialize Passport
const { apiLimiter } = require('./middleware/rateLimiter');
const { sanitizeMiddleware } = require('./middleware/sanitization');
const { requestLogger } = require('./utils/logger');
const { logPHIAccess, requireHTTPS } = require('./middleware/hipaaCompliance');
const { errorMiddleware } = require('./utils/errorHandler');

// Initialize express
const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// HTTPS enforcement (production only)
app.use(requireHTTPS);

// Request logging
app.use(requestLogger);

// Rate limiting - apply to all requests
app.use('/api/', apiLimiter);

// Input sanitization - prevent XSS
app.use(sanitizeMiddleware);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration for Passport
if (!process.env.SESSION_SECRET) {
    console.error('⚠️  WARNING: SESSION_SECRET not set, using JWT_SECRET as fallback');
    console.error('   For production, set a separate SESSION_SECRET in .env file');
}

app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true, 
        secure: process.env.HTTPS_ENABLED === 'true', 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// HIPAA compliance - log PHI access
app.use(logPHIAccess);

// Serve static files (uploads) - protected by authentication
const { authenticateToken } = require('./middleware/authEnhanced');
app.use('/uploads', authenticateToken, express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const authLegacyRoutes = require('./routes/authLegacy');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');
const medicalRecordRoutes = require('./routes/medicalRecords');
const medicineRoutes = require('./routes/medicines');
const adminRoutes = require('./routes/admin');
const emergencyRoutes = require('./routes/emergency');
const healthCardRoutes = require('./routes/healthCard');
const consentRoutes = require('./routes/consent');
const familyRoutes = require('./routes/family');
const insuranceRoutes = require('./routes/insurance');
const blockchainRoutes = require('./routes/blockchain');
const patientAccessRoutes = require('./routes/patientAccess');
const dashboardRoutes = require('./routes/dashboard');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth-legacy', authLegacyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/health-card', healthCardRoutes);
app.use('/api/consent', consentRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/patient-access', patientAccessRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Healthcare Management System API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});

// Centralized Error handler - handles all errors consistently
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database schema
        // NOTE: In production, use proper migration tools (Sequelize migrations, Umzug)
        // alter: false means manual migrations required
        // NEVER use force: true in production - it will delete all data
        await sequelize.sync({ alter: false });
        console.log('✅ Database synced successfully');

        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API: http://localhost:${PORT}/api`);
            console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
