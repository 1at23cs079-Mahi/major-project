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
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto,
  AppointmentQueryDto,
} from './dto/appointment.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/constants';

@ApiTags('Appointments')
@Controller({ path: 'appointments', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Patient or Doctor not found' })
  @ApiResponse({ status: 409, description: 'Time slot conflict' })
  async create(
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.appointmentService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  async findAll(
    @Query() query: AppointmentQueryDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.appointmentService.findAll(query, user);
  }

  @Get('availability/:doctorId')
  @ApiOperation({ summary: 'Get doctor availability for a specific date' })
  @ApiParam({ name: 'doctorId', description: 'Doctor ID' })
  @ApiResponse({ status: 200, description: 'Availability retrieved' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  async getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentService.getDoctorAvailability(doctorId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.appointmentService.findById(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment (reschedule)' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update completed/cancelled appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.appointmentService.update(id, dto, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Appointment already cancelled/completed' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.appointmentService.cancel(id, dto, user);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Confirm an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment confirmed' })
  @ApiResponse({ status: 400, description: 'Only scheduled appointments can be confirmed' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async confirm(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.appointmentService.confirm(id, user);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Mark appointment as completed' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 200, description: 'Appointment completed' })
  @ApiResponse({ status: 400, description: 'Only confirmed appointments can be completed' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async complete(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @CurrentUser() user: { id: string; role: UserRole },
  ) {
    return this.appointmentService.complete(id, notes, user);
  }
}
