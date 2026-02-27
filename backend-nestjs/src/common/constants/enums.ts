/**
 * Shared constants for the application.
 * SQLite doesn't support native enums, so we use string constants.
 * These values match what's stored in the database.
 */

// User Roles
export const UserRole = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  PHARMACY: 'PHARMACY',
  LAB: 'LAB',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// User Status
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// Gender
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

// Appointment Status
export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

// Appointment Type
export const AppointmentType = {
  IN_PERSON: 'IN_PERSON',
  VIDEO: 'VIDEO',
  PHONE: 'PHONE',
} as const;
export type AppointmentType = (typeof AppointmentType)[keyof typeof AppointmentType];

// Prescription Status
export const PrescriptionStatus = {
  ACTIVE: 'ACTIVE',
  FILLED: 'FILLED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;
export type PrescriptionStatus = (typeof PrescriptionStatus)[keyof typeof PrescriptionStatus];

// Audit Actions
export const AuditAction = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// Helper function to get all values from a const object
export function getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
  return Object.values(enumObj);
}
