# Healthcare Management System - Testing Guide

## Test Categories

### 1. Unit Tests (Backend)
Test individual functions and modules in isolation.

**Priority Tests:**
- [ ] Password hashing and verification
- [ ] JWT token generation and validation
- [ ] Encryption/decryption functions
- [ ] QR code generation
- [ ] Input validation utilities
- [ ] Date formatting functions

**Example Test:**
```javascript
// tests/utils/encryption.test.js
const { encrypt, decrypt } = require('../utils/encryption');

describe('Encryption Utils', () => {
  test('should encrypt and decrypt data correctly', () => {
    const original = 'sensitive patient data';
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });
});
```

### 2. API Integration Tests
Test API endpoints end-to-end.

**Critical Endpoints:**
- [ ] POST /api/auth/login
- [ ] POST /api/auth/register/patient
- [ ] POST /api/appointments/book
- [ ] POST /api/prescriptions
- [ ] POST /api/emergency/sos
- [ ] PUT /api/prescriptions/:id/dispense
- [ ] GET /api/admin/dashboard

**Example Test:**
```javascript
// tests/api/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  test('POST /api/auth/login - valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin@123' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong' });
    
    expect(response.status).toBe(401);
  });
});
```

### 3. Security Tests

**Tests to Perform:**
- [ ] SQL injection attempts
- [ ] XSS attacks
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Account lockout after failed attempts
- [ ] JWT expiration
- [ ] HTTPS enforcement
- [ ] CORS policy
- [ ] Input sanitization

**Manual Security Tests:**
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Should get rate limited after 5 attempts

# Test XSS protection
curl -X POST http://localhost:5000/api/auth/register/patient \
  -d '{"email":"test@test.com","firstName":"<script>alert(1)</script>"}'
# Script tags should be stripped

# Test HTTPS enforcement (in production)
curl http://your-domain.com/api/health
# Should redirect to HTTPS
```

### 4. Performance Tests

**Load Testing:**
```bash
# Install Apache Bench
# Windows: download from Apache website
# Linux: apt-get install apache2-utils

# Test 100 concurrent requests
ab -n 1000 -c 100 http://localhost:5000/api/health

# Test authenticated endpoint
ab -n 500 -c 50 -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/appointments
```

**Performance Benchmarks:**
- [ ] Login response time < 500ms
- [ ] Dashboard load < 1s
- [ ] Prescription creation < 2s
- [ ] QR code generation < 1s
- [ ] Database queries < 100ms

### 5. User Acceptance Testing (UAT)

**Patient Flow:**
- [ ] Register account
- [ ] Login successfully
- [ ] Book appointment
- [ ] View prescriptions
- [ ] Add family member
- [ ] Trigger SOS emergency
- [ ] View health card QR code

**Doctor Flow:**
- [ ] Register and wait for approval
- [ ] Login after approval
- [ ] View appointment calendar
- [ ] Accept appointment
- [ ] Create prescription
- [ ] Add medicines to prescription

**Pharmacy Flow:**
- [ ] Scan prescription QR code
- [ ] Verify prescription manually
- [ ] View medicine details with photos
- [ ] Mark prescription as dispensed

**Admin Flow:**
- [ ] Login as admin
- [ ] View dashboard statistics
- [ ] Approve doctor registration
- [ ] Approve pharmacy registration
- [ ] Deactivate user account

### 6. Accessibility Testing

**Tools:**
- axe DevTools (browser extension)
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse (Chrome DevTools)

**Manual Tests:**
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Verify all images have alt text
- [ ] Check color contrast ratios
- [ ] Test with 200% zoom
- [ ] Verify skip links work

### 7. Browser Compatibility

**Test Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 8. Database Tests

**Data Integrity:**
```sql
-- Test foreign key constraints
INSERT INTO prescriptions (patient_id, doctor_id) 
VALUES (99999, 99999);
-- Should fail

-- Test cascade deletes
DELETE FROM patients WHERE id = 1;
-- Should delete related appointments, prescriptions

-- Test unique constraints
INSERT INTO users (email) VALUES ('existing@email.com');
-- Should fail if email exists
```

### 9. Emergency System Tests

**Critical Tests:**
- [ ] SOS button triggers notifications
- [ ] Emergency contacts are notified
- [ ] Ambulance request logs correctly
- [ ] Health card QR generates properly
- [ ] Emergency logs never fail (fallback to file)

### 10. Automated Test Setup

**Installation:**
```bash
# Backend
cd backend
npm install --save-dev jest supertest

# Add to package.json:
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}

# Create jest.config.js
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js']
};
```

## Test Execution Order

1. **Pre-deployment:** Unit tests, integration tests
2. **Staging:** Security tests, performance tests
3. **UAT:** User acceptance testing
4. **Production:** Smoke tests, monitoring

## Continuous Testing

**GitHub Actions / CI/CD:**
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Security audit
        run: npm audit
```

## Test Data

**Create test accounts:**
```sql
-- Test patient
INSERT INTO users (email, password_hash, role_id) 
VALUES ('patient@test.com', '$2a$...', 1);

-- Test doctor
INSERT INTO users (email, password_hash, role_id) 
VALUES ('doctor@test.com', '$2a$...', 2);
```

## Regression Testing

After each deployment:
- [ ] Test all critical user flows
- [ ] Verify database migrations
- [ ] Check error logs
- [ ] Validate monitoring alerts
- [ ] Test rollback procedure

---

**PASS CRITERIA:**
- ✅ All unit tests pass (>80% coverage)
- ✅ All integration tests pass
- ✅ No high/critical security vulnerabilities
- ✅ Performance benchmarks met
- ✅ Accessibility score >90
- ✅ All user flows complete successfully
