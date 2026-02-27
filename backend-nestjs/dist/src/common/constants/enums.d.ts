export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly DOCTOR: "DOCTOR";
    readonly PATIENT: "PATIENT";
    readonly PHARMACY: "PHARMACY";
    readonly LAB: "LAB";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly SUSPENDED: "SUSPENDED";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const Gender: {
    readonly MALE: "MALE";
    readonly FEMALE: "FEMALE";
    readonly OTHER: "OTHER";
};
export type Gender = (typeof Gender)[keyof typeof Gender];
export declare const AppointmentStatus: {
    readonly SCHEDULED: "SCHEDULED";
    readonly CONFIRMED: "CONFIRMED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
    readonly NO_SHOW: "NO_SHOW";
};
export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
export declare const AppointmentType: {
    readonly IN_PERSON: "IN_PERSON";
    readonly VIDEO: "VIDEO";
    readonly PHONE: "PHONE";
};
export type AppointmentType = (typeof AppointmentType)[keyof typeof AppointmentType];
export declare const PrescriptionStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly FILLED: "FILLED";
    readonly CANCELLED: "CANCELLED";
    readonly EXPIRED: "EXPIRED";
};
export type PrescriptionStatus = (typeof PrescriptionStatus)[keyof typeof PrescriptionStatus];
export declare const AuditAction: {
    readonly CREATE: "CREATE";
    readonly READ: "READ";
    readonly UPDATE: "UPDATE";
    readonly DELETE: "DELETE";
    readonly LOGIN: "LOGIN";
    readonly LOGOUT: "LOGOUT";
    readonly FAILED_LOGIN: "FAILED_LOGIN";
};
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];
export declare function getEnumValues<T extends Record<string, string>>(enumObj: T): string[];
