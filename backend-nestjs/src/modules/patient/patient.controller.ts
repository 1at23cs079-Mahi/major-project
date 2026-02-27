import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { UpdatePatientDto, PatientQueryDto } from './dto/patient.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/constants';

@ApiTags('Patients')
@Controller({ path: 'patients', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Get all patients with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async findAll(@Query() query: PatientQueryDto) {
    return this.patientService.findAll(query);
  }

  @Get('me')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Get current patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile retrieved' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.patientService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.patientService.findById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.patientService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a patient' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.patientService.softDelete(id, user);
  }

  @Get(':id/medical-history')
  @ApiOperation({ summary: 'Get patient medical history' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Medical history retrieved' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getMedicalHistory(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.patientService.getMedicalHistory(id, user);
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Get patient appointment history' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getAppointments(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.patientService.getAppointmentHistory(id, user);
  }

  @Get(':id/prescriptions')
  @ApiOperation({ summary: 'Get patient prescription history' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPrescriptions(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.patientService.getPrescriptionHistory(id, user);
  }

  @Post(':id/medical-records')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a medical record for a patient' })
  @ApiParam({ name: 'id', description: 'Patient ID' })
  @ApiResponse({ status: 201, description: 'Medical record created' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async addMedicalRecord(
    @Param('id') id: string,
    @Body() data: {
      recordType: string;
      title: string;
      description?: string;
      fileUrl?: string;
      recordDate: string;
      metadata?: Record<string, unknown>;
    },
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.patientService.addMedicalRecord(
      id,
      {
        ...data,
        recordDate: new Date(data.recordDate),
      },
      user,
    );
  }
}
