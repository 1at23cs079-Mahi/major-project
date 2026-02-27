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
exports.PrescriptionService = void 0;
const common_1 = require("@nestjs/common");
const prescription_repository_1 = require("./prescription.repository");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const redis_service_1 = require("../../common/redis/redis.service");
const logger_service_1 = require("../../common/services/logger.service");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const constants_1 = require("../../common/constants");
const CACHE_TTL = 300;
const CACHE_PREFIX = 'prescription:';
let PrescriptionService = class PrescriptionService {
    constructor(prescriptionRepository, prisma, redisService, logger) {
        this.prescriptionRepository = prescriptionRepository;
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = logger;
        this.logger.setContext('PrescriptionService');
    }
    async create(dto, currentUser) {
        if (currentUser.role !== constants_1.UserRole.ADMIN && currentUser.role !== constants_1.UserRole.DOCTOR) {
            throw new common_1.ForbiddenException('Only doctors can create prescriptions');
        }
        const doctor = await this.prisma.doctor.findUnique({
            where: { userId: currentUser.id },
        });
        if (!doctor && currentUser.role === constants_1.UserRole.DOCTOR) {
            throw new common_1.BadRequestException('Doctor profile not found');
        }
        const patient = await this.prisma.patient.findUnique({
            where: { id: dto.patientId },
        });
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        if (dto.appointmentId) {
            const appointment = await this.prisma.appointment.findUnique({
                where: { id: dto.appointmentId },
            });
            if (!appointment) {
                throw new common_1.NotFoundException('Appointment not found');
            }
            if (appointment.patientId !== dto.patientId) {
                throw new common_1.BadRequestException('Appointment does not belong to this patient');
            }
        }
        if (!doctor?.id) {
            throw new common_1.ForbiddenException('Doctor profile not found');
        }
        const prescription = await this.prescriptionRepository.create({
            patientId: dto.patientId,
            doctorId: doctor.id,
            appointmentId: dto.appointmentId,
            diagnosis: dto.diagnosis,
            notes: dto.notes,
            validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        }, dto.items);
        this.logger.log(`Prescription created: ${prescription.id}`, 'PrescriptionService');
        return prescription;
    }
    async findAll(query, currentUser) {
        let where = this.prescriptionRepository.buildWhereClause({
            status: query.status,
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
        if (currentUser.role === constants_1.UserRole.PHARMACY) {
            const pharmacy = await this.prisma.pharmacy.findUnique({
                where: { userId: currentUser.id },
            });
            if (pharmacy) {
                where = {
                    ...where,
                    status: constants_1.PrescriptionStatus.ACTIVE,
                    OR: [
                        { pharmacyId: pharmacy.id },
                    ],
                };
            }
        }
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'createdAt';
        const sortOrder = query.sortOrder ?? 'desc';
        const skip = (page - 1) * limit;
        const take = limit;
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [prescriptions, total] = await Promise.all([
            this.prescriptionRepository.findAll({
                skip,
                take,
                where,
                orderBy,
            }),
            this.prescriptionRepository.count(where),
        ]);
        return (0, pagination_dto_1.createPaginatedResponse)(prescriptions, total, page, limit);
    }
    async findById(id, currentUser) {
        const cacheKey = `${CACHE_PREFIX}${id}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            await this.checkAccess(cached, currentUser);
            return cached;
        }
        const prescription = await this.prescriptionRepository.findById(id);
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        await this.checkAccess(prescription, currentUser);
        await this.redisService.set(cacheKey, prescription, CACHE_TTL);
        return prescription;
    }
    async update(id, dto, currentUser) {
        const prescription = await this.prescriptionRepository.findById(id);
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        if (currentUser.role === constants_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId: currentUser.id },
            });
            if (!doctor || prescription.doctorId !== doctor.id) {
                throw new common_1.ForbiddenException('You can only update your own prescriptions');
            }
        }
        else if (currentUser.role !== constants_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only doctors can update prescriptions');
        }
        if (prescription.status === constants_1.PrescriptionStatus.FILLED ||
            prescription.status === constants_1.PrescriptionStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot update a filled or cancelled prescription');
        }
        const updated = await this.prescriptionRepository.update(id, {
            ...dto,
            validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        });
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Prescription updated: ${id}`, 'PrescriptionService');
        return updated;
    }
    async fill(id, dto, currentUser) {
        const prescription = await this.prescriptionRepository.findById(id);
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        if (currentUser.role !== constants_1.UserRole.ADMIN && currentUser.role !== constants_1.UserRole.PHARMACY) {
            throw new common_1.ForbiddenException('Only pharmacies can fill prescriptions');
        }
        if (prescription.status !== constants_1.PrescriptionStatus.ACTIVE) {
            throw new common_1.BadRequestException('Only active prescriptions can be filled');
        }
        if (prescription.validUntil && new Date(prescription.validUntil) < new Date()) {
            throw new common_1.BadRequestException('Prescription has expired');
        }
        const pharmacy = await this.prisma.pharmacy.findUnique({
            where: { id: dto.pharmacyId },
        });
        if (!pharmacy) {
            throw new common_1.NotFoundException('Pharmacy not found');
        }
        const filled = await this.prescriptionRepository.fillPrescription(id, dto.pharmacyId);
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Prescription filled: ${id} by pharmacy ${dto.pharmacyId}`, 'PrescriptionService');
        return filled;
    }
    async cancel(id, currentUser) {
        const prescription = await this.prescriptionRepository.findById(id);
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        if (currentUser.role === constants_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId: currentUser.id },
            });
            if (!doctor || prescription.doctorId !== doctor.id) {
                throw new common_1.ForbiddenException('You can only cancel your own prescriptions');
            }
        }
        else if (currentUser.role !== constants_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only doctors can cancel prescriptions');
        }
        if (prescription.status === constants_1.PrescriptionStatus.FILLED) {
            throw new common_1.BadRequestException('Cannot cancel a filled prescription');
        }
        const cancelled = await this.prescriptionRepository.update(id, {
            status: constants_1.PrescriptionStatus.CANCELLED,
        });
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Prescription cancelled: ${id}`, 'PrescriptionService');
        return cancelled;
    }
    async refillItem(prescriptionId, itemId, currentUser) {
        const prescription = await this.prescriptionRepository.findById(prescriptionId);
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription not found');
        }
        if (currentUser.role !== constants_1.UserRole.ADMIN && currentUser.role !== constants_1.UserRole.PHARMACY) {
            throw new common_1.ForbiddenException('Only pharmacies can process refills');
        }
        const item = prescription.items?.find((i) => i.id === itemId);
        if (!item) {
            throw new common_1.NotFoundException('Prescription item not found');
        }
        if (item.refillsUsed >= item.refillsAllowed) {
            throw new common_1.BadRequestException('No refills remaining for this item');
        }
        await this.prescriptionRepository.incrementRefill(itemId);
        await this.redisService.del(`${CACHE_PREFIX}${prescriptionId}`);
        this.logger.log(`Refill processed for item ${itemId}`, 'PrescriptionService');
        return { message: 'Refill processed successfully' };
    }
    async checkAccess(prescription, currentUser) {
        if (currentUser.role === constants_1.UserRole.ADMIN) {
            return;
        }
        if (currentUser.role === constants_1.UserRole.PATIENT) {
            const patient = await this.prisma.patient.findUnique({
                where: { userId: currentUser.id },
            });
            if (!patient || prescription.patientId !== patient.id) {
                throw new common_1.ForbiddenException('You do not have access to this prescription');
            }
        }
        if (currentUser.role === constants_1.UserRole.DOCTOR) {
            const doctor = await this.prisma.doctor.findUnique({
                where: { userId: currentUser.id },
            });
            if (!doctor || prescription.doctorId !== doctor.id) {
                throw new common_1.ForbiddenException('You do not have access to this prescription');
            }
        }
        if (currentUser.role === constants_1.UserRole.PHARMACY) {
            if (prescription.status !== constants_1.PrescriptionStatus.ACTIVE) {
                throw new common_1.ForbiddenException('You can only access active prescriptions');
            }
        }
    }
};
exports.PrescriptionService = PrescriptionService;
exports.PrescriptionService = PrescriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prescription_repository_1.PrescriptionRepository,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        logger_service_1.WinstonLoggerService])
], PrescriptionService);
//# sourceMappingURL=prescription.service.js.map