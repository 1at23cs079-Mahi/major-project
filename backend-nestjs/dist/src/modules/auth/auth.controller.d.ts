import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: any;
        tokens: import("./auth.service").AuthTokens;
    }>;
    login(dto: LoginDto): Promise<{
        message: string;
        user: any;
        tokens: import("./auth.service").AuthTokens;
    }>;
    refreshTokens(dto: RefreshTokenDto): Promise<{
        message: string;
        tokens: import("./auth.service").AuthTokens;
    }>;
    logout(userId: string, auth: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        user: {
            patient: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                firstName: string;
                lastName: string;
                phone: string | null;
                dateOfBirth: Date;
                gender: string;
                address: string | null;
                city: string | null;
                state: string | null;
                zipCode: string | null;
                emergencyContact: string | null;
                emergencyPhone: string | null;
                bloodType: string | null;
                allergies: string | null;
                chronicConditions: string | null;
                insuranceProvider: string | null;
                insuranceNumber: string | null;
                userId: string;
            } | null;
            doctor: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                firstName: string;
                lastName: string;
                specialization: string;
                licenseNumber: string;
                phone: string | null;
                qualifications: string | null;
                experienceYears: number | null;
                consultationFee: number | null;
                availableDays: string | null;
                availableTimeStart: string | null;
                availableTimeEnd: string | null;
                bio: string | null;
                userId: string;
            } | null;
            pharmacy: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                licenseNumber: string;
                phone: string | null;
                address: string;
                city: string | null;
                state: string | null;
                zipCode: string | null;
                operatingHours: string | null;
                userId: string;
            } | null;
            lab: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                name: string;
                licenseNumber: string;
                phone: string | null;
                address: string;
                city: string | null;
                state: string | null;
                zipCode: string | null;
                accreditation: string | null;
                servicesOffered: string | null;
                userId: string;
            } | null;
            id: string;
            email: string;
            role: string;
            status: string;
            emailVerified: boolean;
            passwordChangedAt: Date | null;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    }>;
}
