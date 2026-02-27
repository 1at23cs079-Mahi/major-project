import { AppointmentStatus, AppointmentType } from '@common/constants';
export declare class CreateAppointmentDto {
    patientId: string;
    doctorId: string;
    scheduledAt: string;
    duration?: number;
    type?: AppointmentType;
    reason?: string;
    symptoms?: string[];
}
export declare class UpdateAppointmentDto {
    scheduledAt?: string;
    duration?: number;
    type?: AppointmentType;
    reason?: string;
    notes?: string;
    symptoms?: string[];
}
export declare class CancelAppointmentDto {
    reason: string;
}
export declare class AppointmentQueryDto {
    status?: AppointmentStatus;
    type?: AppointmentType;
    patientId?: string;
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
