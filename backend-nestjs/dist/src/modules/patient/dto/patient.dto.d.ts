import { Gender } from '@common/constants';
export declare class CreatePatientDto {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    insuranceProvider?: string;
    insuranceNumber?: string;
}
declare const UpdatePatientDto_base: import("@nestjs/common").Type<Partial<CreatePatientDto>>;
export declare class UpdatePatientDto extends UpdatePatientDto_base {
}
export declare class PatientQueryDto {
    search?: string;
    gender?: Gender;
    bloodType?: string;
    city?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export {};
