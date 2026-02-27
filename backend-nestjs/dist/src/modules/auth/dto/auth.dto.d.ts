import { UserRole, Gender } from '@common/constants';
export declare class RegisterDto {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: Gender;
    phone?: string;
    address?: string;
    specialization?: string;
    licenseNumber?: string;
    qualifications?: string[];
    experienceYears?: number;
    name?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
