import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PrescriptionStatus } from '@common/constants';

export class PrescriptionItemDto {
  @ApiProperty({ example: 'Amoxicillin', description: 'Medicine name' })
  @IsString()
  medicineName!: string;

  @ApiProperty({ example: '500mg', description: 'Dosage' })
  @IsString()
  dosage!: string;

  @ApiProperty({ example: 'Twice daily', description: 'Frequency' })
  @IsString()
  frequency!: string;

  @ApiProperty({ example: '7 days', description: 'Duration' })
  @IsString()
  duration!: string;

  @ApiProperty({ example: 14, description: 'Quantity' })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 'Take with food', description: 'Instructions' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ example: 2, description: 'Refills allowed' })
  @IsOptional()
  @IsInt()
  @Min(0)
  refillsAllowed?: number;
}

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId!: string;

  @ApiPropertyOptional({ description: 'Appointment ID (optional)' })
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional({ example: 'Upper respiratory infection', description: 'Diagnosis' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Doctor notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2024-02-15', description: 'Valid until date' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiProperty({ type: [PrescriptionItemDto], description: 'Prescription items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];
}

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({ description: 'Diagnosis' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Doctor notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ enum: PrescriptionStatus, description: 'Prescription status' })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;
}

export class FillPrescriptionDto {
  @ApiProperty({ description: 'Pharmacy ID' })
  @IsString()
  pharmacyId!: string;
}

export class PrescriptionQueryDto {
  @ApiPropertyOptional({ enum: PrescriptionStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @ApiPropertyOptional({ description: 'Filter by patient ID' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Filter by doctor ID' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Filter from date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter to date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => Math.min(parseInt(value) || 10, 100))
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Sort by field', 
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'validUntil', 'status'] // SECURITY: Whitelist allowed sort fields
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'validUntil', 'status'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
