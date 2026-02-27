import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentStatus, AppointmentType } from '@common/constants';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId!: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  doctorId!: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z', description: 'Scheduled date and time' })
  @IsDateString()
  scheduledAt!: string;

  @ApiPropertyOptional({ example: 30, description: 'Duration in minutes', default: 30 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  duration?: number = 30;

  @ApiPropertyOptional({ enum: AppointmentType, description: 'Appointment type', default: 'IN_PERSON' })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType = AppointmentType.IN_PERSON;

  @ApiPropertyOptional({ example: 'Annual checkup', description: 'Reason for visit' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ example: ['Headache', 'Fatigue'], description: 'Symptoms' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: '2024-01-15T11:00:00Z', description: 'New scheduled time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 45, description: 'Duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  duration?: number;

  @ApiPropertyOptional({ enum: AppointmentType, description: 'Appointment type' })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({ description: 'Reason for visit' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Doctor notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Symptoms' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];
}

export class CancelAppointmentDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsString()
  reason!: string;
}

export class AppointmentQueryDto {
  @ApiPropertyOptional({ enum: AppointmentStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ enum: AppointmentType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({ description: 'Filter by patient ID' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Filter by doctor ID' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Filter appointments from date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter appointments to date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(({ value }) => Math.min(parseInt(value) || 10, 100))
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'scheduledAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'scheduledAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
