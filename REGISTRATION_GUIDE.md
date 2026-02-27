# Registration System Guide

## Overview
The Healthcare Management System supports registration for 4 user roles:
1. **Patient** - Auto-approved, immediate access
2. **Doctor** - Requires admin approval
3. **Pharmacy** - Requires admin approval  
4. **Lab** - Requires admin approval

## Fixed Issues

### Critical Fix: Double Password Hashing
**Problem:** The system was hashing passwords twice:
- Once in `authControllerEnhanced.js` using `hashPassword()`
- Again in the User model's `beforeCreate` hook

**Solution:** Removed manual hashing in controllers. Now only the User model hook handles password hashing.

**Files Modified:**
- `backend/controllers/authControllerEnhanced.js` - Removed `hashPassword()` calls for all user types

## Registration Flow

### Frontend
1. User fills registration form (`frontend/src/pages/Register.js`)
2. Form validates:
   - Password minimum 8 characters
   - Password contains uppercase, lowercase, number, special character
   - Passwords match
3. Data sent to `AuthContext.register(role, data)`
4. AuthContext calls appropriate API endpoint via `authAPI`

### Backend
1. Request received at `/api/auth/register/{role}` route
2. Route handler: `authControllerEnhanced.register{Role}`
3. Validation:
   - Email format
   - Password strength (8+ chars, mixed case, numbers, special chars)
   - Required fields per role
4. Check for existing user/license number
5. Create User record (password hashed by model hook)
6. Create role-specific profile (Patient/Doctor/Pharmacy/Lab)
7. Create welcome notification
8. Log activity
9. Return response:
   - **Patient:** Access token + auto-login
   - **Others:** Success message (pending approval)

## API Endpoints

### Patient Registration
```
POST /api/auth/register/patient
```
**Required Fields:**
```json
{
  "email": "patient@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```
**Optional Fields:**
- phone
- dateOfBirth (ISO 8601 format)
- gender
- bloodGroup
- wallet_address

**Response (Success):**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "patient@example.com",
      "role": "Patient"
    },
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJ...",
      "refreshToken": "eyJhbGciOiJ..."
    }
  }
}
```

### Doctor Registration
```
POST /api/auth/register/doctor
```
**Required Fields:**
```json
{
  "email": "doctor@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "licenseNumber": "MD12345",
  "specialization": "Cardiology"
}
```
**Optional Fields:**
- qualification
- phone

**Response:** Confirmation message (pending admin approval)

### Pharmacy Registration
```
POST /api/auth/register/pharmacy
```
**Required Fields:**
```json
{
  "email": "pharmacy@example.com",
  "password": "SecurePass123!",
  "name": "City Pharmacy",
  "licenseNumber": "PH12345",
  "address": "123 Main St"
}
```
**Optional Fields:**
- phone

### Lab Registration
```
POST /api/auth/register/lab
```
**Required Fields:**
```json
{
  "email": "lab@example.com",
  "password": "SecurePass123!",
  "name": "Medical Lab Services",
  "licenseNumber": "LAB12345",
  "address": "456 Science Ave"
}
```
**Optional Fields:**
- phone

## Password Security

### Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

### Hashing
- Algorithm: bcrypt
- Salt rounds: 10
- Handled by User model `beforeCreate` hook
- Password verification uses `bcrypt.compare()`

## Database Models

### User Table
```javascript
{
  id: INTEGER (PK)
  email: STRING (unique)
  password_hash: STRING
  role_id: INTEGER (FK to roles)
  is_active: BOOLEAN
  wallet_address: STRING (optional)
  failed_login_attempts: INTEGER
  account_locked_until: DATE
  // ... timestamps
}
```

### Patient Table
```javascript
{
  id: INTEGER (PK)
  user_id: INTEGER (FK to users)
  first_name: STRING
  last_name: STRING
  phone: STRING
  date_of_birth: DATE
  gender: STRING
  blood_group: STRING
  // ... additional fields
}
```

### Doctor Table
```javascript
{
  id: INTEGER (PK)
  user_id: INTEGER (FK to users)
  first_name: STRING
  last_name: STRING
  license_number: STRING (unique)
  specialization: STRING
  qualification: STRING
  is_approved: BOOLEAN (default: false)
  // ... additional fields
}
```

### Pharmacy Table
```javascript
{
  id: INTEGER (PK)
  user_id: INTEGER (FK to users)
  name: STRING
  license_number: STRING (unique)
  address: STRING
  email: STRING
  is_approved: BOOLEAN (default: false)
  // ... additional fields
}
```

### Lab Table
```javascript
{
  id: INTEGER (PK)
  user_id: INTEGER (FK to users)
  name: STRING
  license_number: STRING (unique)
  address: STRING
  email: STRING
  is_approved: BOOLEAN (default: false)
  // ... additional fields
}
```

## Error Handling

### Frontend Errors Displayed
- Password mismatch
- Password too short
- Weak password (missing required characters)
- API validation errors
- Network errors

### Backend Validation Errors
- Invalid email format
- Duplicate email
- Duplicate license number
- Missing required fields
- Weak password

### Example Error Response
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Password must contain uppercase, lowercase, number, and special character",
      "param": "password",
      "location": "body"
    }
  ]
}
```

## Security Features

### Rate Limiting
- Applied via `authLimiter` middleware
- Prevents brute force attacks

### Input Sanitization
- Uses `sanitizeInput()` utility
- Prevents XSS attacks
- Applied to all text inputs

### Account Lockout
- 5 failed login attempts = account locked
- Lockout duration: 30 minutes
- Prevents brute force password attacks

### Activity Logging
- All registrations logged to `activity_logs` table
- Includes: user_id, action, timestamp, IP address
- Enables audit trail

## Testing Registration

### Prerequisites
1. Backend server running on port 5000
2. Database connected
3. Roles seeded (run: `node backend/seeders/seedRoles.js`)
4. Frontend server running on port 3000

### Test Patient Registration
1. Navigate to `http://localhost:3000/register`
2. Select "Patient" role
3. Fill form:
   - Email: test@patient.com
   - Password: TestPass123!
   - Confirm Password: TestPass123!
   - First Name: Test
   - Last Name: Patient
4. Submit
5. Should redirect to patient dashboard

### Test Doctor Registration
1. Navigate to `http://localhost:3000/register`
2. Select "Doctor" role
3. Fill form:
   - Email: test@doctor.com
   - Password: TestPass123!
   - License Number: MD12345
   - Specialization: General Practice
4. Submit
5. Should show pending approval message
6. Admin must approve via `/admin/approvals`

## Troubleshooting

### Registration Fails with "Registration failed"
**Check:**
1. Database connection
2. Roles seeded in database
3. Backend console for detailed errors
4. Browser console for network errors

### Password Not Matching During Login
**Cause:** Double hashing (now fixed)
**Solution:** Applied in this update

### "Email already registered"
**Cause:** Duplicate email in database
**Solution:** Use different email or delete existing user

### "Role not found"
**Cause:** Roles not seeded
**Solution:** Run `node backend/seeders/seedRoles.js`

## File Structure

```
backend/
├── controllers/
│   └── authControllerEnhanced.js    # Registration logic (FIXED)
├── models/
│   ├── User.js                      # User model with password hashing hook
│   ├── Patient.js
│   ├── Doctor.js
│   ├── Pharmacy.js
│   └── Lab.js
├── routes/
│   └── auth.js                      # Registration endpoints
├── middleware/
│   ├── rateLimiter.js              # Rate limiting
│   └── authEnhanced.js             # JWT token generation
└── seeders/
    └── seedRoles.js                # Seed roles

frontend/
├── pages/
│   └── Register.js                 # Registration UI (IMPROVED)
├── context/
│   └── AuthContext.js              # Registration logic (IMPROVED)
└── services/
    └── api.js                      # API endpoints
```

## Next Steps

1. **Test all user types** - Verify patient, doctor, pharmacy, lab registrations
2. **Admin approval workflow** - Test doctor/pharmacy/lab approval process
3. **Email verification** - Add email verification for enhanced security
4. **2FA** - Consider adding two-factor authentication
5. **Password reset** - Test forgot password flow
6. **Blockchain integration** - Link wallet addresses during registration

## Support

For issues or questions:
1. Check browser console for frontend errors
2. Check backend console for server errors
3. Review `/backend/logs` for detailed logging
4. Check database for data integrity

---
**Last Updated:** January 2026
**Status:** ✅ Fixed and Operational
