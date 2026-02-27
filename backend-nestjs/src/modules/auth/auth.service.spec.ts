import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

// String constants (SQLite doesn't support Prisma enums)
const UserRole = { PATIENT: 'PATIENT', DOCTOR: 'DOCTOR', ADMIN: 'ADMIN', PHARMACY: 'PHARMACY', LAB: 'LAB' } as const;
const UserStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE', SUSPENDED: 'SUSPENDED', PENDING_VERIFICATION: 'PENDING_VERIFICATION' } as const;

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let redisService: jest.Mocked<RedisService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    emailVerified: false,
    passwordChangedAt: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPatientProfile = {
    ...mockUser,
    doctor: null,
    pharmacy: null,
    lab: null,
    patient: {
      id: 'patient-123',
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
      phone: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      emergencyContact: null,
      emergencyPhone: null,
      bloodType: null,
      allergies: null,
      chronicConditions: null,
      insuranceProvider: null,
      insuranceNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  };

  beforeEach(async () => {
    const mockAuthRepository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      createUser: jest.fn(),
      createPatientProfile: jest.fn(),
      createDoctorProfile: jest.fn(),
      createPharmacyProfile: jest.fn(),
      createLabProfile: jest.fn(),
      updateUserLastLogin: jest.fn(),
      updateUserPassword: jest.fn(),
      createRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserRefreshTokens: jest.fn(),
      getUserWithProfile: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      decode: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          JWT_SECRET: 'test-secret',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_ACCESS_EXPIRES: '15m',
          JWT_REFRESH_EXPIRES: '7d',
        };
        return config[key] || defaultValue;
      }),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      setNX: jest.fn().mockResolvedValue(true),
      del: jest.fn(),
      exists: jest.fn(),
    };

    const mockPrismaService = {
      $transaction: jest.fn((callback) => callback({
        user: { create: jest.fn().mockResolvedValue(mockUser) },
        patient: { create: jest.fn() },
        doctor: { create: jest.fn() },
        pharmacy: { create: jest.fn() },
        lab: { create: jest.fn() },
      })),
      user: {
        update: jest.fn().mockResolvedValue(mockUser),
      },
    };

    const mockLogger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WinstonLoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    redisService = module.get(RedisService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      role: UserRole.PATIENT,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'MALE' as const,
    };

    it('should register a new patient successfully', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null);
      // Note: createUser is now called inside $transaction, which is mocked above
      authRepository.createRefreshToken.mockResolvedValue({ id: 'token-1', token: 'refresh-token', userId: 'user-123', expiresAt: new Date(), createdAt: new Date(), revokedAt: null } as any);
      authRepository.getUserWithProfile.mockResolvedValue(mockPatientProfile as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      // Transaction-based - user creation happens inside $transaction mock
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if email already exists', async () => {
      authRepository.findUserByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for missing patient fields', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null);

      const incompleteDto = {
        email: 'test@example.com',
        password: 'Password123!',
        role: UserRole.PATIENT,
        firstName: 'John',
        lastName: 'Doe',
        // Missing dateOfBirth and gender
      };

      await expect(service.register(incompleteDto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      authRepository.findUserByEmail.mockResolvedValue(mockUser);
      authRepository.updateUserLastLogin.mockResolvedValue(undefined);
      authRepository.createRefreshToken.mockResolvedValue({ id: 'token-1', token: 'refresh-token', userId: 'user-123', expiresAt: new Date(), createdAt: new Date(), revokedAt: null } as any);
      authRepository.getUserWithProfile.mockResolvedValue(mockPatientProfile as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(authRepository.updateUserLastLogin).toHaveBeenCalledWith('user-123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      authRepository.findUserByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      authRepository.findUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for deleted user', async () => {
      const deletedUser = { ...mockUser, deletedAt: new Date() };
      authRepository.findUserByEmail.mockResolvedValue(deletedUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for suspended user', async () => {
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      authRepository.findUserByEmail.mockResolvedValue(suspendedUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockStoredToken = {
        id: 'token-1',
        createdAt: new Date(),
        token: 'valid-refresh-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 1000000),
        revokedAt: null,
        user: mockUser,
      };

      authRepository.findRefreshToken.mockResolvedValue(mockStoredToken as any);
      authRepository.revokeRefreshToken.mockResolvedValue(undefined);
      authRepository.createRefreshToken.mockResolvedValue({ id: 'token-2', token: 'new-refresh-token', userId: 'user-123', expiresAt: new Date(), createdAt: new Date(), revokedAt: null } as any);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(authRepository.revokeRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      authRepository.findRefreshToken.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for revoked refresh token', async () => {
      const revokedToken = {
        id: 'token-1',
        createdAt: new Date(),
        token: 'revoked-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 1000000),
        revokedAt: new Date(),
        user: mockUser,
      };

      authRepository.findRefreshToken.mockResolvedValue(revokedToken as any);

      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const expiredToken = {
        id: 'token-1',
        createdAt: new Date(),
        token: 'expired-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 1000000),
        revokedAt: null,
        user: mockUser,
      };

      authRepository.findRefreshToken.mockResolvedValue(expiredToken as any);

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout successfully and revoke all tokens', async () => {
      authRepository.revokeAllUserRefreshTokens.mockResolvedValue(undefined);
      jwtService.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 900 });
      redisService.set.mockResolvedValue(undefined);

      await service.logout('user-123', 'mock-access-token');

      expect(authRepository.revokeAllUserRefreshTokens).toHaveBeenCalledWith('user-123');
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    };

    it('should change password successfully', async () => {
      authRepository.findUserById.mockResolvedValue(mockUser);
      authRepository.revokeAllUserRefreshTokens.mockResolvedValue(undefined);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await service.changePassword('user-123', changePasswordDto);

      // Password update now uses prisma.user.update directly (mocked in mockPrismaService)
      expect(authRepository.revokeAllUserRefreshTokens).toHaveBeenCalled();
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      authRepository.findUserById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword('user-123', changePasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
