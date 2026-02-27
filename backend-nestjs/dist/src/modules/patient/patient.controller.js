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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const patient_service_1 = require("./patient.service");
const patient_dto_1 = require("./dto/patient.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const constants_1 = require("../../common/constants");
let PatientController = class PatientController {
    constructor(patientService) {
        this.patientService = patientService;
    }
    async findAll(query) {
        return this.patientService.findAll(query);
    }
    async getMyProfile(userId) {
        return this.patientService.findByUserId(userId);
    }
    async findById(id, user) {
        return this.patientService.findById(id, user);
    }
    async update(id, dto, user) {
        return this.patientService.update(id, dto, user);
    }
    async delete(id, user) {
        return this.patientService.softDelete(id, user);
    }
    async getMedicalHistory(id, user) {
        return this.patientService.getMedicalHistory(id, user);
    }
    async getAppointments(id, user) {
        return this.patientService.getAppointmentHistory(id, user);
    }
    async getPrescriptions(id, user) {
        return this.patientService.getPrescriptionHistory(id, user);
    }
    async addMedicalRecord(id, data, user) {
        return this.patientService.addMedicalRecord(id, {
            ...data,
            recordDate: new Date(data.recordDate),
        }, user);
    }
};
exports.PatientController = PatientController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.DOCTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get all patients with pagination and filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patients retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [patient_dto_1.PatientQueryDto]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.PATIENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get current patient profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient profile retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update patient profile' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, patient_dto_1.UpdatePatientDto, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a patient' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Patient deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/medical-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient medical history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Medical history retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getMedicalHistory", null);
__decorate([
    (0, common_1.Get)(':id/appointments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient appointment history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointments retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getAppointments", null);
__decorate([
    (0, common_1.Get)(':id/prescriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get patient prescription history' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescriptions retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "getPrescriptions", null);
__decorate([
    (0, common_1.Post)(':id/medical-records'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.DOCTOR, constants_1.UserRole.PATIENT),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a medical record for a patient' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Patient ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Medical record created' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientController.prototype, "addMedicalRecord", null);
exports.PatientController = PatientController = __decorate([
    (0, swagger_1.ApiTags)('Patients'),
    (0, common_1.Controller)({ path: 'patients', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [patient_service_1.PatientService])
], PatientController);
//# sourceMappingURL=patient.controller.js.map