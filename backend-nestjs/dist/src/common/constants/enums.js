"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.PrescriptionStatus = exports.AppointmentType = exports.AppointmentStatus = exports.Gender = exports.UserStatus = exports.UserRole = void 0;
exports.getEnumValues = getEnumValues;
exports.UserRole = {
    ADMIN: 'ADMIN',
    DOCTOR: 'DOCTOR',
    PATIENT: 'PATIENT',
    PHARMACY: 'PHARMACY',
    LAB: 'LAB',
};
exports.UserStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
};
exports.Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
};
exports.AppointmentStatus = {
    SCHEDULED: 'SCHEDULED',
    CONFIRMED: 'CONFIRMED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
};
exports.AppointmentType = {
    IN_PERSON: 'IN_PERSON',
    VIDEO: 'VIDEO',
    PHONE: 'PHONE',
};
exports.PrescriptionStatus = {
    ACTIVE: 'ACTIVE',
    FILLED: 'FILLED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
};
exports.AuditAction = {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    FAILED_LOGIN: 'FAILED_LOGIN',
};
function getEnumValues(enumObj) {
    return Object.values(enumObj);
}
//# sourceMappingURL=enums.js.map