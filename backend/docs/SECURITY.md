# Security Hardening - ITERATION 6

## Overview
Production-grade security features for HIPAA-compliant healthcare system.

## Implemented Security Features

### 1. Data Encryption
**File:** `backend/utils/encryption.js`

- **Algorithm:** AES-256-GCM (authenticated encryption)
- **Key Management:** 32-byte encryption key from environment
- **Features:**
  - Field-level encryption for sensitive data
  - Automatic IV (Initialization Vector) generation
  - Authentication tags for integrity verification
  - Secure random token generation
  - Data sanitization for logging

**Usage:**
```javascript
const { encrypt, decrypt, encryptFields } = require('./utils/encryption');

// Encrypt single value
const encrypted = encrypt('sensitive data');
const decrypted = decrypt(encrypted);

// Encrypt object fields
const patient = { name: 'John', ssn: '123-45-6789' };
const secured = encryptFields(patient, ['ssn']);
```

### 2. Patient Consent Management
**File:** `backend/controllers/consentController.js`

**HIPAA Compliance:** Patient-controlled data sharing

**Features:**
- Grant/revoke consent for doctor access
- Consent types: view_records, prescribe, view_reports
- Expiry date support
- Consent verification middleware
- Automatic audit logging

**Endpoints:**
- `POST /api/consent/grant` - Patient grants access
- `PUT /api/consent/:id/revoke` - Patient revokes access
- `GET /api/consent/patient` - List all consents
- `GET /api/consent/check` - Doctor checks consent

**Middleware:**
```javascript
const { requireConsent } = require('./controllers/consentController');

// Protect patient data access
router.get('/patient/:patient_id/records', 
  authMiddleware,
  requireConsent('view_records'),
  getPatientRecords
);
```

### 3. Input Sanitization
**File:** `backend/middleware/sanitization.js`

**Protection Against:**
- XSS (Cross-Site Scripting)
- SQL Injection
- HTML Injection
- Script injection

**Features:**
- Automatic sanitization middleware
- Email validation
- Phone number validation
- URL validation
- UUID validation
- SQL LIKE escape

**Usage:**
```javascript
const { sanitizeMiddleware } = require('./middleware/sanitization');

// Apply globally
app.use(sanitizeMiddleware);
```

### 4. Comprehensive Logging
**File:** `backend/utils/logger.js`

**Log Types:**
- Error logs (`logs/error.log`)
- Combined logs (`logs/combined.log`)
- Security events (`logs/security.log`)
- HIPAA access logs (separate logger)

**Features:**
- Log rotation (5MB max, 5 files)
- Colored console output
- Request/response logging
- Security event logging
- HIPAA access tracking

**Usage:**
```javascript
const { logger, logHIPAAAccess, logSecurityEvent } = require('./utils/logger');

logger.info('User registered');
logger.error('Database connection failed');

logHIPAAAccess(userId, '/api/patients/123', 'GET', { role: 'Doctor' });
logSecurityEvent({ type: 'failed_login', user_id: 123 });
```

### 5. HIPAA Compliance Middleware
**File:** `backend/middleware/hipaaCompliance.js`

**Features:**
- PHI (Protected Health Information) access logging
- Minimum necessary access enforcement
- Session timeout (15 minutes for PHI)
- HTTPS requirement in production
- Data retention enforcement

**Automatic Logging:**
- All access to patient data endpoints
- User role and IP address
- Timestamp and action
- Stored for 7 years (HIPAA requirement)

### 6. Enhanced Security Headers
**Helmet Configuration:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options
- Referrer Policy

### 7. Rate Limiting (Enhanced)
**Already Implemented - Iteration 4:**
- General API: 100 req/15min
- Authentication: 5 attempts/15min
- Password reset: 3 attempts/hour
- File upload: 20/hour
- **No limits on emergency endpoints**

### 8. Account Security
**Already Implemented - Iteration 4:**
- Account lockout after 5 failed attempts
- 15-minute lockout period
- Password policy enforcement
- Remaining attempt warnings

## Security Checklist

✅ **Encryption**
- [x] AES-256-GCM encryption
- [x] Secure key management
- [x] Field-level encryption utility

✅ **Access Control**
- [x] Role-based access control (RBAC)
- [x] Patient consent management
- [x] Consent verification middleware
- [x] Unauthorized access logging

✅ **Input Validation**
- [x] XSS protection
- [x] SQL injection prevention
- [x] Input sanitization middleware
- [x] Data type validation

✅ **Logging & Monitoring**
- [x] Comprehensive logging system
- [x] Separate security logs
- [x] HIPAA access logs
- [x] Log rotation

✅ **HIPAA Compliance**
- [x] PHI access logging (all access tracked)
- [x] Minimum necessary access
- [x] Patient consent enforcement
- [x] 7-year audit retention
- [x] Session timeout
- [x] HTTPS enforcement

✅ **Attack Protection**
- [x] Rate limiting
- [x] Account lockout
- [x] Security headers (Helmet)
- [x] CORS configuration
- [x] Request size limits

## Environment Setup

Add to `.env`:
```
ENCRYPTION_KEY=<generate-32-byte-hex-string>
NODE_ENV=production
HTTPS_ENABLED=true
LOG_LEVEL=info
```

Generate encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing Security

### Test Consent Workflow:
```bash
# Patient grants consent
curl -X POST http://localhost:5000/api/consent/grant \
  -H "Authorization: Bearer <patient_token>" \
  -d '{"doctor_id": 1, "consent_type": "view_records"}'

# Doctor checks consent
curl http://localhost:5000/api/consent/check?patient_id=1 \
  -H "Authorization: Bearer <doctor_token>"
```

### Test XSS Protection:
```bash
# Try to inject script
curl -X POST http://localhost:5000/api/auth/register/patient \
  -d '{"email": "test@test.com", "firstName": "<script>alert(1)</script>"}'
# Script tags will be stripped
```

## Production Recommendations

1. **Enable HTTPS:** Set `HTTPS_ENABLED=true` and configure SSL certificates
2. **Rotate Logs:** Set up log rotation (already configured, 5MB/5 files)
3. **Monitor Security Logs:** Review `logs/security.log` daily
4. **Backup Encryption Keys:** Store `ENCRYPTION_KEY` in secure vault
5. **Regular Audits:** Review HIPAA access logs quarterly
6. **Update Dependencies:** Run `npm audit` regularly

## Compliance Notes

**HIPAA Requirements Met:**
- ✅ Access controls (RBAC + consent)
- ✅ Audit trails (all PHI access logged)
- ✅ Encryption (data at rest via DB, data in transit via HTTPS)
- ✅ Minimum necessary access
- ✅ Patient rights (consent management)
- ✅ Retention (7 years)

**Still Needed for Full HIPAA:**
- [ ] Business Associate Agreements (BAA)
- [ ] Formal risk assessment
- [ ] Incident response plan
- [ ] Employee training documentation
- [ ] Physical security measures
- [ ] Disaster recovery testing

---

**Security Iteration Complete** ✅
