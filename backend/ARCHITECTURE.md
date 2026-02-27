# Healthcare Platform - Architecture v2.0

## Overview

This document describes the refactored architecture of the Healthcare Platform backend, implementing modern best practices including:

- **Service Layer Pattern** - Business logic separated from controllers
- **Repository Pattern** - Data access abstraction
- **Dependency Injection** - Modular, testable components
- **Centralized Error Handling** - Consistent error responses
- **Input Validation** - Zod schemas for type-safe validation
- **Structured Logging** - Winston-based logging with audit trails
- **API Versioning** - v1 (legacy) and v2 (new) endpoints

## Directory Structure

```
backend/
├── src/                      # New modular architecture (v2)
│   ├── config/               # Centralized configuration
│   │   └── index.js          # Environment variables & validation
│   │
│   ├── core/                 # Shared core modules
│   │   ├── errors/           # Custom error classes & handler
│   │   ├── logger/           # Winston logger configuration
│   │   ├── repository/       # Base repository class
│   │   ├── responses/        # Standardized API responses
│   │   ├── service/          # Base service class
│   │   └── validation/       # Zod schemas & middleware
│   │
│   ├── database/             # Database configuration
│   │   ├── index.js          # Sequelize connection
│   │   └── models.js         # Model loader
│   │
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication module
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── repositories/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── index.js
│   │   │
│   │   ├── patient/          # (TODO) Patient module
│   │   ├── appointment/      # (TODO) Appointment module
│   │   └── prescription/     # (TODO) Prescription module
│   │
│   ├── app.js                # Express app factory
│   └── server.js             # Server entry point
│
├── models/                   # Legacy Sequelize models (v1)
├── controllers/              # Legacy controllers (v1)
├── routes/                   # Legacy routes (v1)
├── middleware/               # Legacy middleware (v1)
├── services/                 # Legacy services (v1)
├── utils/                    # Legacy utilities (v1)
│
├── server.js                 # Legacy entry point (v1)
├── Dockerfile                # Docker configuration
└── package.json
```

## API Versioning

### V2 API (New - Recommended)
```
/api/v2/auth/*          # Authentication endpoints
/api/v2/patients/*      # Patient management (TODO)
/api/v2/appointments/*  # Appointments (TODO)
```

### V1 API (Legacy - Deprecated)
```
/api/auth/*             # Legacy auth endpoints
/api/appointments/*     # Legacy appointments
...
```

## Module Structure

Each module follows a consistent pattern:

```
module/
├── controllers/          # HTTP layer - request/response handling
├── services/             # Business logic layer
├── repositories/         # Data access layer
├── middleware/           # Module-specific middleware
├── routes/               # Express routes
└── index.js              # Module initialization & exports
```

## Running the Application

### Development (New Architecture)
```bash
cd backend
npm install
npm run dev            # Runs src/server.js with nodemon
```

### Development (Legacy)
```bash
npm run dev:legacy     # Runs server.js with nodemon
```

### Production
```bash
npm start              # Runs src/server.js
```

### Docker
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## Key Design Decisions

### 1. Service Layer Pattern
All business logic resides in services, keeping controllers thin:

```javascript
// Controller (HTTP layer)
async login(req, res) {
  const result = await authService.login(email, password, meta);
  success(res, result, 'Login successful');
}

// Service (Business logic)
async login(email, password, meta) {
  const user = await this.userRepository.findByEmail(email);
  const isValid = await PasswordService.compare(password, user.password);
  // ... validation, token generation, logging
  return { user, tokens };
}
```

### 2. Repository Pattern
Data access is abstracted through repositories:

```javascript
class UserRepository extends BaseRepository {
  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase() });
  }
}
```

### 3. Dependency Injection
Modules are initialized with their dependencies:

```javascript
function initAuthModule(models) {
  const authService = new AuthService(models);
  const authController = createAuthController(authService);
  return { authService, authController, authRouter };
}
```

### 4. Centralized Error Handling
Custom error classes with consistent responses:

```javascript
throw new ValidationError('Invalid input', errors);
throw new NotFoundError('User', userId);
throw new AuthenticationError('Invalid credentials');
```

### 5. Standardized Responses
Consistent API response format:

```javascript
// Success
{
  "success": true,
  "message": "Login successful",
  "data": { ... },
  "timestamp": "2024-01-15T..."
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [ ... ]
  },
  "timestamp": "2024-01-15T..."
}
```

## Environment Variables

See `.env.example` for all configuration options. Key variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_*` | Yes | Database connection |
| `JWT_SECRET` | Yes | Access token signing |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing |
| `ENCRYPTION_KEY` | Yes | 64-char hex for AES-256 |
| `BLOCKCHAIN_ENABLED` | No | Enable blockchain features |
| `EMAIL_ENABLED` | No | Enable email notifications |

## Migration Guide

### From V1 to V2 Auth

V1 (Legacy):
```javascript
POST /api/auth/register
POST /api/auth/login
```

V2 (New):
```javascript
POST /api/v2/auth/register
POST /api/v2/auth/login
```

### Response Format Changes

V1 responses varied in format. V2 always returns:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null,
  "error": { "code": string, "message": string } | null,
  "timestamp": string
}
```

## Testing

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
```

## Security Features

- JWT tokens with short-lived access tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints
- HIPAA-compliant audit logging
- Input sanitization and validation
- Helmet security headers
- CORS configuration

## TODO / Roadmap

- [ ] Complete patient module migration
- [ ] Complete appointment module migration
- [ ] Complete prescription module migration
- [ ] Add comprehensive test suite
- [ ] Add OpenAPI/Swagger documentation
- [ ] Implement Redis caching
- [ ] Add database migrations (Sequelize CLI)
- [ ] CI/CD pipeline configuration
