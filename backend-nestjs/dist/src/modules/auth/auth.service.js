"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const auth_repository_1 = require("./auth.repository");
const redis_service_1 = require("../../common/redis/redis.service");
const logger_service_1 = require("../../common/services/logger.service");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const constants_1 = require("../../common/constants");
let AuthService = class AuthService {
    constructor(authRepository, jwtService, configService, redisService, prisma, logger) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.redisService = redisService;
        this.prisma = prisma;
        this.logger = logger;
        this.SALT_ROUNDS = 12;
        this.REFRESH_TOKEN_PREFIX = 'refresh_token:';
        this.BLACKLIST_PREFIX = 'token_blacklist:';
        this.REFRESH_TOKEN_LOCK_PREFIX = 'refresh_lock:';
        this.logger.setContext('AuthService');
    }
    async register(dto) {
        const existingUser = await this.authRepository.findUserByEmail(dto.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        this.validateRoleSpecificFields(dto);
        const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email.toLowerCase(),
                    password: hashedPassword,
                    role: dto.role,
                    status: 'ACTIVE',
                },
            });
            await this.createRoleProfileInTransaction(tx, user.id, dto);
            return user;
        });
        const tokens = await this.generateTokens({
            sub: result.id,
            email: result.email,
            role: result.role,
        });
        const userWithProfile = await this.authRepository.getUserWithProfile(result.id);
        this.logger.log(`User registered successfully: ${result.email}`, 'AuthService');
        return {
            user: userWithProfile,
            tokens,
        };
    }
    async login(dto) {
        const user = await this.authRepository.findUserByEmail(dto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.deletedAt) {
            throw new common_1.UnauthorizedException('Account has been deleted');
        }
        if (user.status === 'SUSPENDED') {
            throw new common_1.UnauthorizedException('Account is suspended');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.authRepository.updateUserLastLogin(user.id);
        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
        const userWithProfile = await this.authRepository.getUserWithProfile(user.id);
        this.logger.log(`User logged in: ${user.email}`, 'AuthService');
        return {
            user: userWithProfile,
            tokens,
        };
    }
    async refreshTokens(refreshToken) {
        const lockKey = `${this.REFRESH_TOKEN_LOCK_PREFIX}${refreshToken}`;
        const lockAcquired = await this.redisService.setNX(lockKey, '1', 10);
        if (!lockAcquired) {
            throw new common_1.UnauthorizedException('Token refresh already in progress');
        }
        try {
            const storedToken = await this.authRepository.findRefreshToken(refreshToken);
            if (!storedToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            if (storedToken.revokedAt) {
                await this.authRepository.revokeAllUserRefreshTokens(storedToken.user.id);
                this.logger.warn(`Potential token theft detected for user ${storedToken.user.id}`, 'AuthService');
                throw new common_1.UnauthorizedException('Refresh token has been revoked. All sessions terminated.');
            }
            if (storedToken.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Refresh token has expired');
            }
            await this.authRepository.revokeRefreshToken(refreshToken);
            const tokens = await this.generateTokens({
                sub: storedToken.user.id,
                email: storedToken.user.email,
                role: storedToken.user.role,
            });
            return tokens;
        }
        finally {
            await this.redisService.del(lockKey);
        }
    }
    async logout(userId, accessToken) {
        await this.authRepository.revokeAllUserRefreshTokens(userId);
        if (accessToken) {
            const decoded = this.jwtService.decode(accessToken);
            if (decoded?.exp) {
                const ttl = decoded.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    await this.redisService.set(`${this.BLACKLIST_PREFIX}${accessToken}`, true, ttl);
                }
            }
        }
        this.logger.log(`User logged out: ${userId}`, 'AuthService');
    }
    async changePassword(userId, dto) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                passwordChangedAt: new Date(),
            },
        });
        await this.authRepository.revokeAllUserRefreshTokens(userId);
        this.logger.log(`Password changed for user: ${userId}`, 'AuthService');
    }
    async getProfile(userId) {
        const user = await this.authRepository.getUserWithProfile(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async isTokenBlacklisted(token) {
        return await this.redisService.exists(`${this.BLACKLIST_PREFIX}${token}`);
    }
    validateRoleSpecificFields(dto) {
        switch (dto.role) {
            case constants_1.UserRole.PATIENT:
                if (!dto.dateOfBirth) {
                    throw new common_1.BadRequestException('Date of birth is required for patients');
                }
                if (!dto.gender) {
                    throw new common_1.BadRequestException('Gender is required for patients');
                }
                break;
            case constants_1.UserRole.DOCTOR:
                if (!dto.specialization) {
                    throw new common_1.BadRequestException('Specialization is required for doctors');
                }
                if (!dto.licenseNumber) {
                    throw new common_1.BadRequestException('License number is required for doctors');
                }
                break;
            case constants_1.UserRole.PHARMACY:
            case constants_1.UserRole.LAB:
                if (!dto.name) {
                    throw new common_1.BadRequestException('Business name is required');
                }
                if (!dto.licenseNumber) {
                    throw new common_1.BadRequestException('License number is required');
                }
                if (!dto.address) {
                    throw new common_1.BadRequestException('Address is required');
                }
                break;
        }
    }
    async createRoleProfile(userId, dto) {
        switch (dto.role) {
            case constants_1.UserRole.PATIENT:
                await this.authRepository.createPatientProfile({
                    userId,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    dateOfBirth: new Date(dto.dateOfBirth),
                    gender: dto.gender,
                    phone: dto.phone,
                    address: dto.address,
                    city: dto.city,
                    state: dto.state,
                    zipCode: dto.zipCode,
                });
                break;
            case constants_1.UserRole.DOCTOR:
                await this.authRepository.createDoctorProfile({
                    userId,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    specialization: dto.specialization,
                    licenseNumber: dto.licenseNumber,
                    phone: dto.phone,
                    qualifications: dto.qualifications,
                    experienceYears: dto.experienceYears,
                });
                break;
            case constants_1.UserRole.PHARMACY:
                await this.authRepository.createPharmacyProfile({
                    userId,
                    name: dto.name,
                    licenseNumber: dto.licenseNumber,
                    phone: dto.phone,
                    address: dto.address,
                    city: dto.city,
                    state: dto.state,
                    zipCode: dto.zipCode,
                });
                break;
            case constants_1.UserRole.LAB:
                await this.authRepository.createLabProfile({
                    userId,
                    name: dto.name,
                    licenseNumber: dto.licenseNumber,
                    phone: dto.phone,
                    address: dto.address,
                    city: dto.city,
                    state: dto.state,
                    zipCode: dto.zipCode,
                });
                break;
        }
    }
    async createRoleProfileInTransaction(tx, userId, dto) {
        switch (dto.role) {
            case constants_1.UserRole.PATIENT:
                await tx.patient.create({
                    data: {
                        userId,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        dateOfBirth: new Date(dto.dateOfBirth),
                        gender: dto.gender,
                        phone: dto.phone,
                        address: dto.address,
                        city: dto.city,
                        state: dto.state,
                        zipCode: dto.zipCode,
                    },
                });
                break;
            case constants_1.UserRole.DOCTOR:
                await tx.doctor.create({
                    data: {
                        userId,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        specialization: dto.specialization,
                        licenseNumber: dto.licenseNumber,
                        phone: dto.phone,
                        qualifications: JSON.stringify(dto.qualifications || []),
                        experienceYears: dto.experienceYears,
                    },
                });
                break;
            case constants_1.UserRole.PHARMACY:
                await tx.pharmacy.create({
                    data: {
                        userId,
                        name: dto.name,
                        licenseNumber: dto.licenseNumber,
                        phone: dto.phone,
                        address: dto.address,
                        city: dto.city,
                        state: dto.state,
                        zipCode: dto.zipCode,
                    },
                });
                break;
            case constants_1.UserRole.LAB:
                await tx.lab.create({
                    data: {
                        userId,
                        name: dto.name,
                        licenseNumber: dto.licenseNumber,
                        phone: dto.phone,
                        address: dto.address,
                        city: dto.city,
                        state: dto.state,
                        zipCode: dto.zipCode,
                    },
                });
                break;
        }
    }
    async generateTokens(payload) {
        const accessTokenExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES', '15m');
        const refreshTokenExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES', '7d');
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: accessTokenExpiresIn,
        });
        const refreshToken = (0, uuid_1.v4)();
        const refreshTokenExpiry = this.parseExpiry(refreshTokenExpiresIn);
        await this.authRepository.createRefreshToken({
            token: refreshToken,
            userId: payload.sub,
            expiresAt: refreshTokenExpiry,
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.getExpirySeconds(accessTokenExpiresIn),
        };
    }
    parseExpiry(expiry) {
        const units = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        const [, value, unit] = match;
        return new Date(Date.now() + parseInt(value) * units[unit]);
    }
    getExpirySeconds(expiry) {
        const units = {
            s: 1,
            m: 60,
            h: 60 * 60,
            d: 24 * 60 * 60,
        };
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 900;
        }
        const [, value, unit] = match;
        return parseInt(value) * units[unit];
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService,
        prisma_service_1.PrismaService,
        logger_service_1.WinstonLoggerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map