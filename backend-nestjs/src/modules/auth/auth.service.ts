import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from './auth.repository';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserRole, Gender } from '@common/constants';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly BLACKLIST_PREFIX = 'token_blacklist:';
  private readonly REFRESH_TOKEN_LOCK_PREFIX = 'refresh_lock:'; // For preventing race conditions

  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private prisma: PrismaService,
    private logger: WinstonLoggerService,
  ) {
    this.logger.setContext('AuthService');
  }

  async register(dto: RegisterDto): Promise<{ user: any; tokens: AuthTokens }> {
    const existingUser = await this.authRepository.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate role-specific required fields
    this.validateRoleSpecificFields(dto);

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // SECURITY FIX: Use transaction to prevent orphaned records
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          role: dto.role,
          status: 'ACTIVE', // or 'PENDING_VERIFICATION' if email verification required
        },
      });

      // Create role-specific profile within the same transaction
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

  async login(dto: LoginDto): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Account is suspended');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // SECURITY FIX: Acquire a lock to prevent race conditions in refresh token rotation
    const lockKey = `${this.REFRESH_TOKEN_LOCK_PREFIX}${refreshToken}`;
    const lockAcquired = await this.redisService.setNX(lockKey, '1', 10); // 10 second lock
    
    if (!lockAcquired) {
      throw new UnauthorizedException('Token refresh already in progress');
    }

    try {
      const storedToken = await this.authRepository.findRefreshToken(refreshToken);

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (storedToken.revokedAt) {
        // SECURITY: If a revoked token is used, revoke ALL user tokens (potential token theft)
        await this.authRepository.revokeAllUserRefreshTokens(storedToken.user.id);
        this.logger.warn(`Potential token theft detected for user ${storedToken.user.id}`, 'AuthService');
        throw new UnauthorizedException('Refresh token has been revoked. All sessions terminated.');
      }

      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Atomic operation: Revoke old token and generate new in same operation
      await this.authRepository.revokeRefreshToken(refreshToken);

      // Generate new tokens
      const tokens = await this.generateTokens({
        sub: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role,
      });

      return tokens;
    } finally {
      // Always release the lock
      await this.redisService.del(lockKey);
    }
  }

  async logout(userId: string, accessToken?: string): Promise<void> {
    // Revoke all refresh tokens for the user
    await this.authRepository.revokeAllUserRefreshTokens(userId);

    // Blacklist the current access token if provided
    if (accessToken) {
      const decoded = this.jwtService.decode(accessToken) as { exp: number };
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redisService.set(
            `${this.BLACKLIST_PREFIX}${accessToken}`,
            true,
            ttl,
          );
        }
      }
    }

    this.logger.log(`User logged out: ${userId}`, 'AuthService');
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
    
    // SECURITY FIX: Update password and passwordChangedAt timestamp
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(), // Invalidate all existing tokens
      },
    });

    // Revoke all refresh tokens to force re-login
    await this.authRepository.revokeAllUserRefreshTokens(userId);

    this.logger.log(`Password changed for user: ${userId}`, 'AuthService');
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.getUserWithProfile(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return await this.redisService.exists(`${this.BLACKLIST_PREFIX}${token}`);
  }

  private validateRoleSpecificFields(dto: RegisterDto): void {
    switch (dto.role) {
      case UserRole.PATIENT:
        if (!dto.dateOfBirth) {
          throw new BadRequestException('Date of birth is required for patients');
        }
        if (!dto.gender) {
          throw new BadRequestException('Gender is required for patients');
        }
        break;

      case UserRole.DOCTOR:
        if (!dto.specialization) {
          throw new BadRequestException('Specialization is required for doctors');
        }
        if (!dto.licenseNumber) {
          throw new BadRequestException('License number is required for doctors');
        }
        break;

      case UserRole.PHARMACY:
      case UserRole.LAB:
        if (!dto.name) {
          throw new BadRequestException('Business name is required');
        }
        if (!dto.licenseNumber) {
          throw new BadRequestException('License number is required');
        }
        if (!dto.address) {
          throw new BadRequestException('Address is required');
        }
        break;
    }
  }

  private async createRoleProfile(userId: string, dto: RegisterDto): Promise<void> {
    switch (dto.role) {
      case UserRole.PATIENT:
        await this.authRepository.createPatientProfile({
          userId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          dateOfBirth: new Date(dto.dateOfBirth!),
          gender: dto.gender as Gender,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
        });
        break;

      case UserRole.DOCTOR:
        await this.authRepository.createDoctorProfile({
          userId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          specialization: dto.specialization!,
          licenseNumber: dto.licenseNumber!,
          phone: dto.phone,
          qualifications: dto.qualifications,
          experienceYears: dto.experienceYears,
        });
        break;

      case UserRole.PHARMACY:
        await this.authRepository.createPharmacyProfile({
          userId,
          name: dto.name!,
          licenseNumber: dto.licenseNumber!,
          phone: dto.phone,
          address: dto.address!,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
        });
        break;

      case UserRole.LAB:
        await this.authRepository.createLabProfile({
          userId,
          name: dto.name!,
          licenseNumber: dto.licenseNumber!,
          phone: dto.phone,
          address: dto.address!,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
        });
        break;
    }
  }

  // Transaction-safe version for registration
  private async createRoleProfileInTransaction(tx: any, userId: string, dto: RegisterDto): Promise<void> {
    switch (dto.role) {
      case UserRole.PATIENT:
        await tx.patient.create({
          data: {
            userId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            dateOfBirth: new Date(dto.dateOfBirth!),
            gender: dto.gender as string,
            phone: dto.phone,
            address: dto.address,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
          },
        });
        break;

      case UserRole.DOCTOR:
        await tx.doctor.create({
          data: {
            userId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            specialization: dto.specialization!,
            licenseNumber: dto.licenseNumber!,
            phone: dto.phone,
            qualifications: JSON.stringify(dto.qualifications || []),
            experienceYears: dto.experienceYears,
          },
        });
        break;

      case UserRole.PHARMACY:
        await tx.pharmacy.create({
          data: {
            userId,
            name: dto.name!,
            licenseNumber: dto.licenseNumber!,
            phone: dto.phone,
            address: dto.address!,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
          },
        });
        break;

      case UserRole.LAB:
        await tx.lab.create({
          data: {
            userId,
            name: dto.name!,
            licenseNumber: dto.licenseNumber!,
            phone: dto.phone,
            address: dto.address!,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode,
          },
        });
        break;
    }
  }

  private async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessTokenExpiresIn = this.configService.get<string>(
      'JWT_ACCESS_EXPIRES',
      '15m',
    );
    const refreshTokenExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES',
      '7d',
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: accessTokenExpiresIn,
    });

    const refreshToken = uuidv4();
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

  private parseExpiry(expiry: string): Date {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }

    const [, value, unit] = match;
    return new Date(Date.now() + parseInt(value) * units[unit]);
  }

  private getExpirySeconds(expiry: string): number {
    const units: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // Default 15 minutes
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }
}
