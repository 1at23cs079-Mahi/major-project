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
exports.PrescriptionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prescription_service_1 = require("./prescription.service");
const prescription_dto_1 = require("./dto/prescription.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const constants_1 = require("../../common/constants");
let PrescriptionController = class PrescriptionController {
    constructor(prescriptionService) {
        this.prescriptionService = prescriptionService;
    }
    async create(dto, user) {
        return this.prescriptionService.create(dto, user);
    }
    async findAll(query, user) {
        return this.prescriptionService.findAll(query, user);
    }
    async findById(id, user) {
        return this.prescriptionService.findById(id, user);
    }
    async update(id, dto, user) {
        return this.prescriptionService.update(id, dto, user);
    }
    async fill(id, dto, user) {
        return this.prescriptionService.fill(id, dto, user);
    }
    async cancel(id, user) {
        return this.prescriptionService.cancel(id, user);
    }
    async refillItem(id, itemId, user) {
        return this.prescriptionService.refillItem(id, itemId, user);
    }
};
exports.PrescriptionController = PrescriptionController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.DOCTOR),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new prescription' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Prescription created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Only doctors can create prescriptions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Patient not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prescription_dto_1.CreatePrescriptionDto, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all prescriptions with pagination and filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescriptions retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prescription_dto_1.PrescriptionQueryDto, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get prescription by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Prescription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Prescription not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "findById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.DOCTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Update a prescription' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Prescription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot update filled/cancelled prescription' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Prescription not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, prescription_dto_1.UpdatePrescriptionDto, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/fill'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.PHARMACY),
    (0, swagger_1.ApiOperation)({ summary: 'Fill a prescription' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Prescription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription filled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Prescription not active or expired' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Prescription or Pharmacy not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, prescription_dto_1.FillPrescriptionDto, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "fill", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.DOCTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a prescription' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Prescription ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Prescription cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot cancel filled prescription' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Prescription not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/items/:itemId/refill'),
    (0, roles_decorator_1.Roles)(constants_1.UserRole.ADMIN, constants_1.UserRole.PHARMACY),
    (0, swagger_1.ApiOperation)({ summary: 'Process a refill for a prescription item' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Prescription ID' }),
    (0, swagger_1.ApiParam)({ name: 'itemId', description: 'Prescription Item ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refill processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'No refills remaining' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Prescription or Item not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "refillItem", null);
exports.PrescriptionController = PrescriptionController = __decorate([
    (0, swagger_1.ApiTags)('Prescriptions'),
    (0, common_1.Controller)({ path: 'prescriptions', version: '1' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [prescription_service_1.PrescriptionService])
], PrescriptionController);
//# sourceMappingURL=prescription.controller.js.map