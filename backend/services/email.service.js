const nodemailer = require('nodemailer');

/**
 * Email Service for Healthcare Management System
 * Handles all email notifications including:
 * - Password reset emails
 * - Welcome emails
 * - Appointment reminders
 * - Notification emails
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.enabled = false;
        this.fromAddress = process.env.EMAIL_FROM || 'Healthcare System <noreply@healthcare.com>';
        this.init();
    }

    init() {
        // Check if email is configured
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('ℹ️  Email Service: Disabled (EMAIL_HOST, EMAIL_USER, or EMAIL_PASSWORD not set)');
            this.enabled = false;
            return;
        }

        // Skip if using placeholder values
        if (process.env.EMAIL_HOST === 'smtp.example.com' || 
            process.env.EMAIL_USER === 'your-email@example.com') {
            console.log('ℹ️  Email Service: Disabled (using placeholder configuration)');
            this.enabled = false;
            return;
        }

        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            this.enabled = true;
            console.log('✅ Email Service: Enabled');
        } catch (error) {
            console.error('❌ Email Service: Failed to initialize -', error.message);
            this.enabled = false;
        }
    }

    /**
     * Check if email service is available
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Send email with fallback logging
     * @param {Object} options - Email options (to, subject, text, html)
     * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
     */
    async send(options) {
        const { to, subject, text, html } = options;

        if (!this.enabled) {
            // Log email for development/debugging
            console.log('📧 [EMAIL NOT SENT - Service Disabled]');
            console.log(`   To: ${to}`);
            console.log(`   Subject: ${subject}`);
            console.log(`   Body: ${text?.substring(0, 100)}...`);
            
            return { 
                success: true, 
                simulated: true,
                message: 'Email logged (service disabled)' 
            };
        }

        try {
            const result = await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                subject,
                text,
                html
            });

            console.log(`📧 Email sent to ${to}: ${subject}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error(`❌ Email failed to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(email, resetToken, userName = 'User') {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        
        return this.send({
            to: email,
            subject: 'Password Reset Request - Healthcare System',
            text: `
Hello ${userName},

You requested a password reset for your Healthcare System account.

Click the link below to reset your password (valid for 1 hour):
${resetUrl}

If you didn't request this, please ignore this email or contact support if you're concerned.

Best regards,
Healthcare System Team
            `.trim(),
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Healthcare System</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>You requested a password reset for your Healthcare System account.</p>
            <p>Click the button below to reset your password (valid for 1 hour):</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy this link: <br><code>${resetUrl}</code></p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2026 Healthcare System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `.trim()
        });
    }

    /**
     * Send welcome email to new users
     */
    async sendWelcome(email, userName, role) {
        const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
        
        const roleMessages = {
            Patient: 'You can now book appointments, view prescriptions, and manage your health records.',
            Doctor: 'Your account is pending admin approval. You will be notified once approved.',
            Pharmacy: 'Your account is pending admin approval. You will be notified once approved.',
            Lab: 'Your account is pending admin approval. You will be notified once approved.'
        };

        return this.send({
            to: email,
            subject: `Welcome to Healthcare System - ${role} Account Created`,
            text: `
Welcome to Healthcare System, ${userName}!

Your ${role} account has been created successfully.

${roleMessages[role] || ''}

Login at: ${loginUrl}

Best regards,
Healthcare System Team
            `.trim(),
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Welcome!</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Your <strong>${role}</strong> account has been created successfully.</p>
            <p>${roleMessages[role] || ''}</p>
            <p style="text-align: center;">
                <a href="${loginUrl}" class="button">Login Now</a>
            </p>
        </div>
        <div class="footer">
            <p>© 2026 Healthcare System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `.trim()
        });
    }

    /**
     * Send account approval notification
     */
    async sendApprovalNotification(email, userName, role, approved = true) {
        const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
        
        if (approved) {
            return this.send({
                to: email,
                subject: `Account Approved - Healthcare System`,
                text: `
Hello ${userName},

Great news! Your ${role} account has been approved.

You can now login and access all features: ${loginUrl}

Best regards,
Healthcare System Team
                `.trim()
            });
        } else {
            return this.send({
                to: email,
                subject: `Account Application Update - Healthcare System`,
                text: `
Hello ${userName},

We regret to inform you that your ${role} account application was not approved.

If you believe this is an error, please contact our support team.

Best regards,
Healthcare System Team
                `.trim()
            });
        }
    }

    /**
     * Send appointment reminder
     */
    async sendAppointmentReminder(email, userName, appointmentDetails) {
        const { doctorName, date, time, location } = appointmentDetails;
        
        return this.send({
            to: email,
            subject: `Appointment Reminder - ${date}`,
            text: `
Hello ${userName},

This is a reminder for your upcoming appointment:

Doctor: Dr. ${doctorName}
Date: ${date}
Time: ${time}
Location: ${location || 'To be confirmed'}

Please arrive 15 minutes early.

Best regards,
Healthcare System Team
            `.trim()
        });
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            configured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
            host: this.enabled ? process.env.EMAIL_HOST : null
        };
    }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
