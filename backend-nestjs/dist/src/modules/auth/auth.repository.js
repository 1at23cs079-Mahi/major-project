"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const constants_1 = require("../../common/constants");
let AuthRepository = class AuthRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
    async createUser(data) {
        return this.prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                password: data.password,
                role: data.role,
                status: data.status || constants_1.UserStatus.ACTIVE,
            },
        });
    }
    async createPatientProfile(data) {
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
    async createDoctorProfile(data) {
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
    async createPharmacyProfile(data) {
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
    async createLabProfile(data) {
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
    async updateUserLastLogin(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
    async updateUserPassword(userId, hashedPassword) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
    async createRefreshToken(data) {
        return this.prisma.refreshToken.create({
            data: {
                token: data.token,
                userId: data.userId,
                expiresAt: data.expiresAt,
            },
        });
    }
    async findRefreshToken(token) {
        return this.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
    }
    async revokeRefreshToken(token) {
        await this.prisma.refreshToken.update({
            where: { token },
            data: { revokedAt: new Date() },
        });
    }
    async revokeAllUserRefreshTokens(userId) {
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
    async getUserWithProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                patient: true,
                doctor: true,
                pharmacy: true,
                lab: true,
            },
        });
        if (!user)
            return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map