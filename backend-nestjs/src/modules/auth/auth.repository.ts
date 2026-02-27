import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserRole, UserStatus } from '@common/constants';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role,
        status: data.status || UserStatus.ACTIVE,
      },
    });
  }

  async createPatientProfile(data: {
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) {
    return this.prisma.patient.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    });
  }

  async createDoctorProfile(data: {
    userId: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    phone?: string;
    qualifications?: string[];
    experienceYears?: number;
  }) {
    return this.prisma.doctor.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        phone: data.phone,
        qualifications: JSON.stringify(data.qualifications || []),
        experienceYears: data.experienceYears,
      },
    });
  }

  async createPharmacyProfile(data: {
    userId: string;
    name: string;
    licenseNumber: string;
    phone?: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) {
    return this.prisma.pharmacy.create({
      data: {
        userId: data.userId,
        name: data.name,
        licenseNumber: data.licenseNumber,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    });
  }

  async createLabProfile(data: {
    userId: string;
    name: string;
    licenseNumber: string;
    phone?: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) {
    return this.prisma.lab.create({
      data: {
        userId: data.userId,
        name: data.name,
        licenseNumber: data.licenseNumber,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
    });
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string) {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpiredRefreshTokens() {
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  }

  async getUserWithProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        doctor: true,
        pharmacy: true,
        lab: true,
      },
    });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
