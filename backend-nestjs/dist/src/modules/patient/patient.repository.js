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
exports.PatientRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PatientRepository = class PatientRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        return this.prisma.patient.findUnique({
            where: { id, deletedAt: null },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
        });
    }
    async findByUserId(userId) {
        return this.prisma.patient.findUnique({
            where: { userId, deletedAt: null },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
        });
    }
    async findAll(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.patient.findMany({
            where: { ...where, deletedAt: null },
            skip,
            take,
            orderBy,
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
        });
    }
    async count(where) {
        return this.prisma.patient.count({
            where: { ...where, deletedAt: null },
        });
    }
    async update(id, data) {
        return this.prisma.patient.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                    },
                },
            },
        });
    }
    async softDelete(id) {
        return this.prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async getMedicalHistory(patientId) {
        return this.prisma.medicalRecord.findMany({
            where: { patientId },
            orderBy: { recordDate: 'desc' },
        });
    }
    async getAppointmentHistory(patientId) {
        return this.prisma.appointment.findMany({
            where: { patientId },
            include: {
                doctor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
            },
            orderBy: { scheduledAt: 'desc' },
        });
    }
    async getPrescriptionHistory(patientId) {
        return this.prisma.prescription.findMany({
            where: { patientId },
            include: {
                doctor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
                items: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addMedicalRecord(data) {
        return this.prisma.medicalRecord.create({
            data: {
                patientId: data.patientId,
                recordType: data.recordType,
                title: data.title,
                description: data.description,
                fileUrl: data.fileUrl,
                recordDate: data.recordDate,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });
    }
    buildWhereClause(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search } },
                { lastName: { contains: query.search } },
            ];
        }
        if (query.gender) {
            where.gender = query.gender;
        }
        if (query.bloodType) {
            where.bloodType = query.bloodType;
        }
        if (query.city) {
            where.city = { contains: query.city };
        }
        return where;
    }
};
exports.PatientRepository = PatientRepository;
exports.PatientRepository = PatientRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PatientRepository);
//# sourceMappingURL=patient.repository.js.map