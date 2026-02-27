import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  FillPrescriptionDto,
  PrescriptionQueryDto,
} from './dto/prescription.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/constants';

@ApiTags('Prescriptions')
@Controller({ path: 'prescriptions', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only doctors can create prescriptions' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptionService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prescriptions with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  async findAll(
    @Query() query: PrescriptionQueryDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptionService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({ status: 200, description: 'Prescription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptionService.findById(id, user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update a prescription' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({ status: 200, description: 'Prescription updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update filled/cancelled prescription' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptionService.update(id, dto, user);
  }

  @Patch(':id/fill')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  @ApiOperation({ summary: 'Fill a prescription' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({ status: 200, description: 'Prescription filled successfully' })
  @ApiResponse({ status: 400, description: 'Prescription not active or expired' })
  @ApiResponse({ status: 404, description: 'Prescription or Pharmacy not found' })
  async fill(
    @Param('id') id: string,
    @Body() dto: FillPrescriptionDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptionService.fill(id, dto, user);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Cancel a prescription' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiResponse({ status: 200, description: 'Prescription cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel filled prescription' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptionService.cancel(id, user);
  }

  @Patch(':id/items/:itemId/refill')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  @ApiOperation({ summary: 'Process a refill for a prescription item' })
  @ApiParam({ name: 'id', description: 'Prescription ID' })
  @ApiParam({ name: 'itemId', description: 'Prescription Item ID' })
  @ApiResponse({ status: 200, description: 'Refill processed successfully' })
  @ApiResponse({ status: 400, description: 'No refills remaining' })
  @ApiResponse({ status: 404, description: 'Prescription or Item not found' })
  async refillItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.prescriptionService.refillItem(id, itemId, user);
  }
}
