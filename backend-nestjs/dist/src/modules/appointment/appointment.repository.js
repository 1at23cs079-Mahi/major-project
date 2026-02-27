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
exports.AppointmentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const constants_1 = require("../../common/constants");
let AppointmentRepository = class AppointmentRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.appointment.create({
            data,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        return this.prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
            },
        });
    }
    async findAll(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.appointment.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
            },
        });
    }
    async count(where) {
        return this.prisma.appointment.count({ where });
    }
    async update(id, data) {
        return this.prisma.appointment.update({
            where: { id },
            data,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        specialization: true,
                    },
                },
            },
        });
    }
    async checkConflict(doctorId, scheduledAt, duration, excludeId) {
        const newAppointmentStart = scheduledAt;
        const newAppointmentEnd = new Date(scheduledAt.getTime() + duration * 60000);
        const conflictingAppointments = await this.prisma.appointment.findMany({
            where: {
                doctorId,
                id: excludeId ? { not: excludeId } : undefined,
                status: { in: [constants_1.AppointmentStatus.SCHEDULED, constants_1.AppointmentStatus.CONFIRMED] },
            },
            select: {
                id: true,
                scheduledAt: true,
                duration: true,
            },
        });
        for (const existing of conflictingAppointments) {
            const existingStart = existing.scheduledAt;
            const existingEnd = new Date(existing.scheduledAt.getTime() + existing.duration * 60000);
            if (newAppointmentStart < existingEnd && newAppointmentEnd > existingStart) {
                return true;
            }
        }
        return false;
    }
    async getDoctorAvailability(doctorId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.prisma.appointment.findMany({
            where: {
                doctorId,
                scheduledAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: { in: [constants_1.AppointmentStatus.SCHEDULED, constants_1.AppointmentStatus.CONFIRMED] },
            },
            select: {
                scheduledAt: true,
                duration: true,
            },
            orderBy: { scheduledAt: 'asc' },
        });
    }
    buildWhereClause(query) {
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        if (query.type) {
            where.type = query.type;
        }
        if (query.patientId) {
            where.patientId = query.patientId;
        }
        if (query.doctorId) {
            where.doctorId = query.doctorId;
        }
        if (query.fromDate || query.toDate) {
            where.scheduledAt = {};
            if (query.fromDate) {
                where.scheduledAt.gte = new Date(query.fromDate);
            }
            if (query.toDate) {
                where.scheduledAt.lte = new Date(query.toDate);
            }
        }
        return where;
    }
};
exports.AppointmentRepository = AppointmentRepository;
exports.AppointmentRepository = AppointmentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentRepository);
//# sourceMappingURL=appointment.repository.js.map