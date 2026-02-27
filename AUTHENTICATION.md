# Enhanced Authentication System

## Overview
This healthcare system includes a robust, multi-role authentication system with:
- Local email/password authentication with bcrypt hashing
- Google OAuth 2.0 integration
- JWT token-based access control
- Refresh token mechanism
- Account lockout after failed attempts
- Password reset functionality
- Role-based access control (Patient, Doctor, Pharmacy, Lab, Admin)

## Authentication Features

### 1. **Local Authentication (Email/Password)**

#### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)
- Must contain special character (@$!%*?&)

**Example:** `MyPassword@123`

#### Registration Endpoints

**Patient Registration**
```
POST /api/auth/register/patient
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "SecurePass@123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "M",
  "bloodGroup": "O+",
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "patient@example.com",
      "role": "Patient"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

**Doctor Registration** (Requires Admin Approval)
```
POST /api/auth/register/doctor
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "SecurePass@123",
  "firstName": "Jane",
  "lastName": "Smith",
  "licenseNumber": "DOC12345",
  "specialization": "Cardiology",
  "qualification": "MD, Board Certified",
  "phone": "+1234567890"
}

Response:
{
  "success": true,
  "message": "Doctor registration submitted - pending admin approval",
  "data": {
    "user": {
      "id": "uuid",
      "email": "doctor@example.com",
      "role": "Doctor"
    },
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "specialization": "Cardiology"
    }
  }
}
```

**Pharmacy Registration** (Requires Admin Approval)
```
POST /api/auth/register/pharmacy
Content-Type: application/json

{
  "email": "pharmacy@example.com",
  "password": "SecurePass@123",
  "name": "City Pharmacy",
  "licenseNumber": "PHARM12345",
  "address": "123 Main Street",
  "phone": "+1234567890"
}
```

**Lab Registration** (Requires Admin Approval)
```
POST /api/auth/register/lab
Content-Type: application/json

{
  "email": "lab@example.com",
  "password": "SecurePass@123",
  "name": "Advanced Diagnostics Lab",
  "licenseNumber": "LAB12345",
  "address": "456 Park Avenue",
  "phone": "+1234567890"
}
```

### 2. **Login (All Roles)**

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "SecurePass@123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "patient@example.com",
      "role": "Patient"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Security Features
- **Account Lockout**: After 5 failed login attempts, account locks for 30 minutes
- **Failed Login Tracking**: System tracks failed attempts
- **Last Login Recording**: Records timestamp of successful login

### 3. **Token Management**

#### Access Token
- **Duration**: 24 hours (configurable via JWT_EXPIRES_IN)
- **Used For**: API requests
- **Header**: `Authorization: Bearer <accessToken>`

#### Refresh Token
- **Duration**: 7 days (configurable via JWT_REFRESH_EXPIRES_IN)
- **Used For**: Getting new access tokens without re-login

**Refresh Access Token**
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

### 4. **Password Management**

**Request Password Reset**
```
POST /api/auth/password-reset/request
Content-Type: application/json

{
  "email": "patient@example.com"
}

Response:
{
  "success": true,
  "message": "If email exists, password reset link has been sent",
  "_resetToken": "reset_token_here" // For testing only - remove in production
}
```

**Confirm Password Reset**
```
POST /api/auth/password-reset/confirm
Content-Type: application/json

{
  "resetToken": "reset_token_from_email",
  "password": "NewPassword@123"
}

Response:
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

### 5. **Google OAuth 2.0**

#### Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Copy Client ID and Client Secret

#### Environment Variables
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Google OAuth Flow (Web)

**1. Initiate Login**
```html
<a href="http://localhost:5000/api/auth/google">
  Sign in with Google
</a>
```

**2. Callback Handling**
After successful authentication, user is redirected to:
```
http://localhost:3000/auth-success?accessToken=...&refreshToken=...&role=Patient
```

#### Google OAuth Flow (API/Mobile)

**Get Tokens via API**
```
POST /api/auth/google/token
Content-Type: application/json
Authorization: Bearer <google_access_token>

Response:
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "role": "Patient"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### 6. **Get Current User**

```
GET /api/auth/me
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "patient@example.com",
      "role": "Patient",
      "permissions": ["read:records", "write:records"],
      "isActive": true,
      "lastLogin": "2024-01-21T10:30:00Z",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "gender": "M",
        "bloodGroup": "O+"
      }
    }
  }
}
```

### 7. **Logout**

```
POST /api/auth/logout
Authorization: Bearer <accessToken>

Response:
{
  "success": true,
  "message": "Logout successful"
}
```

## Security Best Practices

### Backend
✅ Passwords hashed with bcrypt (salt rounds: 10)
✅ JWT tokens with expiration
✅ Account lockout after failed attempts
✅ Rate limiting on auth endpoints
✅ Input validation and sanitization
✅ CORS protection
✅ Helmet.js security headers
✅ Activity logging for audit trail

### Frontend
✅ Tokens stored securely (HttpOnly cookies or secure localStorage)
✅ Automatic token refresh before expiration
✅ HTTPS enforcement in production
✅ XSS protection
✅ CSRF protection with SameSite cookies

## Role-Based Access Control (RBAC)

### Available Roles
1. **Patient** - Can view own records, book appointments
2. **Doctor** - Can manage appointments, create prescriptions
3. **Pharmacy** - Can manage inventory, fulfill prescriptions
4. **Lab** - Can manage tests and reports
5. **Admin** - Full system access

### Checking User Role
```
GET /api/protected-route
Authorization: Bearer <accessToken>

The endpoint checks if user.role matches required role
```

## Rate Limiting

### Auth Endpoints
- **General Auth**: 5 requests per 15 minutes per IP
- **Password Reset**: 3 requests per hour per email
- **Login**: 5 requests per 15 minutes per email

## Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "success": false,
  "message": "No authorization token provided"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Forbidden - insufficient permissions"
}
```

**409 Conflict**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**400 Bad Request**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Password must contain uppercase, lowercase, number, and special character",
      "param": "password"
    }
  ]
}
```

## Testing the System

### Default Admin Credentials
- **Email**: admin@healthcare.com
- **Password**: Admin@123

### Test Accounts
Create test accounts for each role:
1. Patient: patient@test.com / TestPass@123
2. Doctor: doctor@test.com / TestPass@123
3. Pharmacy: pharmacy@test.com / TestPass@123
4. Lab: lab@test.com / TestPass@123

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=healthcare_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

## API Response Format

All endpoints follow standard response format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

## Next Steps

1. ✅ Configure Google OAuth credentials in `.env`
2. ✅ Test each authentication flow
3. ✅ Implement frontend auth components
4. ✅ Set up token refresh mechanism in frontend
5. ✅ Add blockchain integration for consent records
6. ✅ Implement multi-factor authentication (MFA)

---

**For questions or issues, contact the development team.**
