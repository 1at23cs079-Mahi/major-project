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
exports.PatientService = void 0;
const common_1 = require("@nestjs/common");
const patient_repository_1 = require("./patient.repository");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const redis_service_1 = require("../../common/redis/redis.service");
const logger_service_1 = require("../../common/services/logger.service");
const constants_1 = require("../../common/constants");
const CACHE_TTL = 300;
const CACHE_PREFIX = 'patient:';
let PatientService = class PatientService {
    constructor(patientRepository, redisService, logger) {
        this.patientRepository = patientRepository;
        this.redisService = redisService;
        this.logger = logger;
        this.logger.setContext('PatientService');
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const sortBy = query.sortBy ?? 'createdAt';
        const sortOrder = query.sortOrder ?? 'desc';
        const where = this.patientRepository.buildWhereClause({
            search: query.search,
            gender: query.gender,
            bloodType: query.bloodType,
            city: query.city,
        });
        const skip = (page - 1) * limit;
        const take = limit;
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [patients, total] = await Promise.all([
            this.patientRepository.findAll({
                skip,
                take,
                where,
                orderBy,
            }),
            this.patientRepository.count(where),
        ]);
        return (0, pagination_dto_1.createPaginatedResponse)(patients, total, page, limit);
    }
    async findById(id, currentUser) {
        const cacheKey = `${CACHE_PREFIX}${id}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            this.checkAccess(cached.userId, currentUser);
            return cached;
        }
        const patient = await this.patientRepository.findById(id);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        this.checkAccess(patient.userId, currentUser);
        await this.redisService.set(cacheKey, patient, CACHE_TTL);
        return patient;
    }
    async findByUserId(userId) {
        const patient = await this.patientRepository.findByUserId(userId);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        return patient;
    }
    async update(id, dto, currentUser) {
        const patient = await this.patientRepository.findById(id);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        this.checkAccess(patient.userId, currentUser);
        const updateData = { ...dto };
        if (dto.dateOfBirth) {
            updateData.dateOfBirth = new Date(dto.dateOfBirth);
        }
        if (dto.allergies) {
            updateData.allergies = JSON.stringify(dto.allergies);
        }
        if (dto.chronicConditions) {
            updateData.chronicConditions = JSON.stringify(dto.chronicConditions);
        }
        const updatedPatient = await this.patientRepository.update(id, updateData);
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Patient updated: ${id}`, 'PatientService');
        return updatedPatient;
    }
    async softDelete(id, currentUser) {
        const patient = await this.patientRepository.findById(id);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        if (currentUser.role !== constants_1.UserRole.ADMIN && patient.userId !== currentUser.id) {
            throw new common_1.ForbiddenException('You do not have permission to delete this patient');
        }
        await this.patientRepository.softDelete(id);
        await this.redisService.del(`${CACHE_PREFIX}${id}`);
        this.logger.log(`Patient soft deleted: ${id}`, 'PatientService');
        return { message: 'Patient deleted successfully' };
    }
    async getMedicalHistory(patientId, currentUser) {
        const patient = await this.patientRepository.findById(patientId);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        this.checkAccess(patient.userId, currentUser);
        return this.patientRepository.getMedicalHistory(patientId);
    }
    async getAppointmentHistory(patientId, currentUser) {
        const patient = await this.patientRepository.findById(patientId);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        this.checkAccess(patient.userId, currentUser);
        return this.patientRepository.getAppointmentHistory(patientId);
    }
    async getPrescriptionHistory(patientId, currentUser) {
        const patient = await this.patientRepository.findById(patientId);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        this.checkAccess(patient.userId, currentUser);
        return this.patientRepository.getPrescriptionHistory(patientId);
    }
    async addMedicalRecord(patientId, data, currentUser) {
        const patient = await this.patientRepository.findById(patientId);
        if (!patient) {
            throw new common_1.NotFoundException('Patient not found');
        }
        if (currentUser.role !== constants_1.UserRole.ADMIN &&
            currentUser.role !== constants_1.UserRole.DOCTOR &&
            patient.userId !== currentUser.id) {
            throw new common_1.ForbiddenException('You do not have permission to add medical records');
        }
        const record = await this.patientRepository.addMedicalRecord({
            patientId,
            ...data,
        });
        this.logger.log(`Medical record added for patient: ${patientId}`, 'PatientService');
        return record;
    }
    checkAccess(patientUserId, currentUser) {
        if (currentUser.role === constants_1.UserRole.ADMIN ||
            currentUser.role === constants_1.UserRole.DOCTOR) {
            return;
        }
        if (patientUserId !== currentUser.id) {
            throw new common_1.ForbiddenException('You do not have permission to access this patient');
        }
    }
};
exports.PatientService = PatientService;
exports.PatientService = PatientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [patient_repository_1.PatientRepository,
        redis_service_1.RedisService,
        logger_service_1.WinstonLoggerService])
], PatientService);
//# sourceMappingURL=patient.service.js.map