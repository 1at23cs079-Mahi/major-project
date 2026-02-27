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
exports.AppointmentService = void 0;
const common_1 = require("@nestjs/common");
const appointment_repository_1 = require("./appointment.repository");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const redis_service_1 = require("../../common/redis/redis.service");
const logger_service_1 = require("../../common/services/logger.service");
const constants_1 = require("../../common/constants");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const CACHE_TTL = 300;
const CACHE_PREFIX = 'appointment:';
let AppointmentService = class AppointmentService {
    constructor(appointmentRepository, prisma, redisService, logger) {
        this.appointmentRepository = appointmentRepository;
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = logger;
        this.logger.setContext('AppointmentService');
    }
    async create(dto, currentUser) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: dto.patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: dto.doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
        if (currentUser.role === constants_1.UserRole.PATIENT && patient.userId !== currentUser.id) {
            throw new common_1.ForbiddenException('You can only book appointments for yourself');
        }
        const scheduledAt = new Date(dto.scheduledAt);
        const duration = dto.duration || 30;
        if (scheduledAt <= new Date()) {
            throw new common_1.BadRequestException('Appointment must be scheduled in the future');
        }
        const hasConflict = await this.appointmentRepository.checkConflict(dto.doctorId, scheduledAt, duration);
        if (hasConflict) {
            throw new common_1.ConflictException('This time slot is not available');
        }
        const appointment = await this.appointmentRepository.create({
            patientId: dto.patientId,
            doctorId: dto.doctorId,
            scheduledAt,
            duration,
            type: dto.type,
            reason: dto.reason,
            symptoms: JSON.stringify(dto.symptoms || []),
        });
        this.logger.log(`Appointment created: ${appointment.id}`, 'AppointmentService');
        return appointment;
    }
    async findAll(query, currentUser) {
        let where = this.appointmentRepository.buildWhereClause({
            status: query.status,
            type: query.type,
            patientId: query.patientId,
            doctorId: query.doctorId,
            fromDate: query.fromDate,
            toDate: query.toDate,
        });
        if (currentUser.role === constants_1.UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({
                where: { userId: currentUser.id },
            });
            if (patient) {
                where = { ...where, patientId: patient.id };
            }
        }
        if (currentUser.role === constants_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId: currentUser.id },
            });
            if (doctor) {
                where = { ...where, doctorId: doctor.id };
            }
        }
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'scheduledAt';
        const sortOrder = query.sortOrder ?? 'desc';
        const skip = (page - 1) * limit;
        const take = limit;
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [appointments, total] = await Promise.all([
            this.appointmentRepository.findAll({
                skip,
                take,
                where,
                orderBy,
            }),
            this.appointmentRepository.count(where),
        ]);
        return (0, pagination_dto_1.createPaginatedResponse)(appointments, total, page, limit);
    }
    async findById(id, currentUser) {
        const cacheKey = `${CACHE_PREFIX}${id}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        await this.checkAccess(appointment, currentUser);
        await this.redisService.set(cacheKey, appointment, CACHE_TTL);
        return appointment;
    }
    async update(id, dto, currentUser) {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        await this.checkAccess(appointment, currentUser);
        if (appointment.status === constants_1.AppointmentStatus.CANCELLED ||
            appointment.status === constants_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot update a cancelled or completed appointment');
        }
        if (dto.scheduledAt) {
            const scheduledAt = new Date(dto.scheduledAt);
            const duration = dto.duration || appointment.duration;
            if (scheduledAt <= new Date()) {
                throw new common_1.BadRequestException('Appointment must be scheduled in the future');
            }
            const hasConflict = await this.appointmentRepository.checkConflict(appointment.doctorId, scheduledAt, duration, id);
            if (hasConflict) {
                throw new common_1.ConflictException('This time slot is not available');
            }
        }
        const updateData = {};
        if (dto.scheduledAt) {
            updateData.scheduledAt = new Date(dto.scheduledAt);
        }
        if (dto.duration !== undefined) {
            updateData.duration = dto.duration;
        }
        if (dto.type !== undefined) {
            updateData.type = dto.type;
        }
        if (dto.reason !== undefined) {
            updateData.reason = dto.reason;
        }
        if (dto.notes !== undefined) {
            updateData.notes = dto.notes;
        }
        if (dto.symptoms !== undefined) {
            updateData.symptoms = JSON.stringify(dto.symptoms);
        }
        const updated = await this.appointmentRepository.update(id, updateData);
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Appointment updated: ${id}`, 'AppointmentService');
        return updated;
    }
    async cancel(id, dto, currentUser) {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        await this.checkAccess(appointment, currentUser);
        if (appointment.status === constants_1.AppointmentStatus.CANCELLED) {
            throw new common_1.BadRequestException('Appointment is already cancelled');
        }
        if (appointment.status === constants_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot cancel a completed appointment');
        }
        const updated = await this.appointmentRepository.update(id, {
            status: constants_1.AppointmentStatus.CANCELLED,
            cancelReason: dto.reason,
            cancelledAt: new Date(),
        });
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Appointment cancelled: ${id}`, 'AppointmentService');
        return updated;
    }
    async confirm(id, currentUser) {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (currentUser.role !== constants_1.UserRole.ADMIN && currentUser.role !== constants_1.UserRole.DOCTOR) {
            throw new common_1.ForbiddenException('Only doctors can confirm appointments');
        }
        if (appointment.status !== constants_1.AppointmentStatus.SCHEDULED) {
            throw new common_1.BadRequestException('Only scheduled appointments can be confirmed');
        }
        const updated = await this.appointmentRepository.update(id, {
            status: constants_1.AppointmentStatus.CONFIRMED,
        });
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        return updated;
    }
    async complete(id, notes, currentUser) {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (currentUser.role !== constants_1.UserRole.ADMIN && currentUser.role !== constants_1.UserRole.DOCTOR) {
            throw new common_1.ForbiddenException('Only doctors can complete appointments');
        }
        if (appointment.status !== constants_1.AppointmentStatus.CONFIRMED &&
            appointment.status !== constants_1.AppointmentStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Only confirmed or in-progress appointments can be completed');
        }
        const updated = await this.appointmentRepository.update(id, {
            status: constants_1.AppointmentStatus.COMPLETED,
            notes,
            completedAt: new Date(),
        });
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Appointment completed: ${id}`, 'AppointmentService');
        return updated;
    }
    async getDoctorAvailability(doctorId, date) {
        const doctor = await this.prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            throw new common_1.NotFoundException('Doctor not found');
        }
        const appointments = await this.appointmentRepository.getDoctorAvailability(doctorId, new Date(date));
        const slots = [];
        const startHour = 9;
        const endHour = 17;
        for (let hour = startHour; hour < endHour; hour++) {
            for (const minutes of [0, 30]) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, minutes, 0, 0);
                const isBooked = appointments.some((apt) => {
                    const aptStart = new Date(apt.scheduledAt);
                    const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
                    return slotTime >= aptStart && slotTime < aptEnd;
                });
                slots.push({
                    time: slotTime.toISOString(),
                    available: !isBooked && slotTime > new Date(),
                });
            }
        }
        return {
            doctor: {
                id: doctor.id,
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                specialization: doctor.specialization,
            },
            date,
            slots,
        };
    }
    async checkAccess(appointment, currentUser) {
        if (currentUser.role === constants_1.UserRole.ADMIN) {
            return;
        }
        if (currentUser.role === constants_1.UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({
                where: { userId: currentUser.id },
            });
            if (!patient || appointment.patientId !== patient.id) {
                throw new common_1.ForbiddenException('You do not have access to this appointment');
            }
        }
        if (currentUser.role === constants_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId: currentUser.id },
            });
            if (!doctor || appointment.doctorId !== doctor.id) {
                throw new common_1.ForbiddenException('You do not have access to this appointment');
            }
        }
    }
};
exports.AppointmentService = AppointmentService;
exports.AppointmentService = AppointmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [appointment_repository_1.AppointmentRepository,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        logger_service_1.WinstonLoggerService])
], AppointmentService);
//# sourceMappingURL=appointment.service.js.map