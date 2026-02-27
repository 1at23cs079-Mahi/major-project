/**
 * Zod Validation Schemas and Middleware
 * Centralized input validation with detailed error messages
 */

const { z } = require('zod');
const { ValidationError } = require('../errors');

// ==========================================
// Common Validation Schemas
// ==========================================

/**
 * Common schema components for reuse
 */
const schemas = {
  // ID validation
  id: z.coerce.number().int().positive(),
  uuid: z.string().uuid(),
  
  // String validations
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number format')
    .optional(),
  
  // Date validations
  date: z.coerce.date(),
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    order: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional(),
  }),
};

// ==========================================
// Auth Validation Schemas
// ==========================================

const authSchemas = {
  register: z.object({
    email: schemas.email,
    password: schemas.password,
    firstName: z.string().min(1, 'First name is required').max(50).trim(),
    lastName: z.string().min(1, 'Last name is required').max(50).trim(),
    role: z.enum(['patient', 'doctor', 'pharmacy', 'lab', 'admin']),
    phone: schemas.phone,
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    address: z.string().max(500).optional(),
    
    // Role-specific fields
    specialization: z.string().max(100).optional(), // doctor
    licenseNumber: z.string().max(50).optional(), // doctor, pharmacy, lab
    hospitalAffiliation: z.string().max(200).optional(), // doctor
    pharmacyName: z.string().max(200).optional(), // pharmacy
    labName: z.string().max(200).optional(), // lab
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(), // patient
    emergencyContact: z.string().max(100).optional(), // patient
    emergencyPhone: schemas.phone, // patient
  }).refine(
    (data) => {
      // Validate role-specific required fields
      if (data.role === 'doctor') {
        return data.specialization && data.licenseNumber;
      }
      if (data.role === 'pharmacy') {
        return data.pharmacyName && data.licenseNumber;
      }
      if (data.role === 'lab') {
        return data.labName && data.licenseNumber;
      }
      return true;
    },
    {
      message: 'Missing required fields for the selected role',
    }
  ),

  login: z.object({
    email: schemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),

  forgotPassword: z.object({
    email: schemas.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: schemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: schemas.password,
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
};

// ==========================================
// Patient Validation Schemas
// ==========================================

const patientSchemas = {
  update: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: schemas.phone,
    address: z.string().max(500).optional(),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    emergencyContact: z.string().max(100).optional(),
    emergencyPhone: schemas.phone,
  }),
};

// ==========================================
// Appointment Validation Schemas
// ==========================================

const appointmentSchemas = {
  create: z.object({
    doctorId: schemas.id,
    date: schemas.dateString,
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    reason: z.string().min(1, 'Reason is required').max(500),
    notes: z.string().max(1000).optional(),
    type: z.enum(['consultation', 'follow-up', 'emergency', 'routine']).default('consultation'),
  }),

  update: z.object({
    date: schemas.dateString.optional(),
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed', 'no-show']).optional(),
    notes: z.string().max(1000).optional(),
  }),
};

// ==========================================
// Prescription Validation Schemas
// ==========================================

const prescriptionSchemas = {
  create: z.object({
    patientId: schemas.id,
    diagnosis: z.string().min(1).max(500),
    medicines: z.array(z.object({
      name: z.string().min(1),
      dosage: z.string().min(1),
      frequency: z.string().min(1),
      duration: z.string().min(1),
      instructions: z.string().optional(),
    })).min(1, 'At least one medicine is required'),
    notes: z.string().max(1000).optional(),
    followUpDate: schemas.dateString.optional(),
  }),
};

// ==========================================
// Validation Middleware Factory
// ==========================================

/**
 * Creates validation middleware for a given schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params'
 * @returns {Function} Express middleware function
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        throw new ValidationError('Validation failed', errors);
      }

      // Replace request data with parsed (and transformed) data
      req[source] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validates multiple sources at once
 * @param {Object} schemas - Object with body, query, params schemas
 * @returns {Function} Express middleware function
 */
function validateAll(validationSchemas) {
  return (req, res, next) => {
    try {
      const allErrors = [];

      Object.entries(validationSchemas).forEach(([source, schema]) => {
        const result = schema.safeParse(req[source]);
        
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            allErrors.push({
              source,
              field: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            });
          });
        } else {
          req[source] = result.data;
        }
      });

      if (allErrors.length > 0) {
        throw new ValidationError('Validation failed', allErrors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  z,
  schemas,
  authSchemas,
  patientSchemas,
  appointmentSchemas,
  prescriptionSchemas,
  validate,
  validateAll,
};
