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
exports.AppointmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const appointment_service_1 = require("./appointment.service");
const appointment_dto_1 = require("./dto/appointment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const constants_1 = require("../../common/constants");
let AppointmentController = class AppointmentController {
    constructor(appointmentService) {
        this.appointmentService = appointmentService;
    }
    async create(dto, user) {
        return this.appointmentService.create(dto, user);
    }
    async findAll(query, user) {
        return this.appointmentService.findAll(query, user);
    }
    async getDoctorAvailability(doctorId, date) {
        return this.appointmentService.getDoctorAvailability(doctorId, date);
    }
    async findById(id, user) {
        return this.appointmentService.findById(id, user);
    }
    async update(id, dto, user) {
        return this.appointmentService.update(id, dto, user);
    }
    async cancel(id, dto, user) {
        return this.appointmentService.cancel(id, dto, user);
    }
    async confirm(id, user) {
        return this.appointmentService.confirm(id, user);
    }
    async complete(id, notes, user) {
        return this.appointmentService.complete(id, notes, user);
    }
};
exports.AppointmentController = AppointmentController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new appointment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Appointment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient or Doctor not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Time slot conflict' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [appointment_dto_1.CreateAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all appointments with pagination and filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointments retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [appointment_dto_1.AppointmentQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('availability/:doctorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get doctor availability for a specific date' }),
    (0, swagger_1.ApiParam)({ name: 'doctorId', description: 'Doctor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Availability retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Doctor not found' }),
    __param(0, (0, common_1.Param)('doctorId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "getDoctorAvailability", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get appointment by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointment retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appointment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update appointment (reschedule)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot update completed/cancelled appointment' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appointment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, appointment_dto_1.UpdateAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an appointment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointment cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Appointment already cancelled/completed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appointment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, appointment_dto_1.CancelAppointmentDto, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.DOCTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm an appointment' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointment confirmed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Only scheduled appointments can be confirmed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appointment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.DOCTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Mark appointment as completed' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Appointment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appointment completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Only confirmed appointments can be completed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Appointment not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('notes')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentController.prototype, "complete", null);
exports.AppointmentController = AppointmentController = __decorate([
    (0, swagger_1.ApiTags)('Appointments'),
    (0, common_1.Controller)({ path: 'appointments', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [appointment_service_1.AppointmentService])
], AppointmentController);
//# sourceMappingURL=appointment.controller.js.map