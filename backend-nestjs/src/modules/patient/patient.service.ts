import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PatientRepository } from './patient.repository';
import {
  UpdatePatientDto,
  PatientQueryDto,
} from './dto/patient.dto';
import { createPaginatedResponse, PaginatedResponse } from '@common/dto/pagination.dto';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { UserRole } from '@common/constants';

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = 'patient:';

@Injectable()
export class PatientService {
  constructor(
    private patientRepository: PatientRepository,
    private redisService: RedisService,
    private logger: WinstonLoggerService,
  ) {
    this.logger.setContext('PatientService');
  }

  async findAll(query: PatientQueryDto): Promise<PaginatedResponse<any>> {
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

    const orderBy: Record<string, string> = {};
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

    return createPaginatedResponse(patients, total, page, limit);
  }

  async findById(id: string, currentUser: { id: string; role: UserRole }) {
    // Try cache first
    const cacheKey = `${CACHE_PREFIX}${id}`;
    const cached = await this.redisService.get<any>(cacheKey);
    
    if (cached) {
      // SECURITY FIX: Always check access permissions, even for cached data
      this.checkAccess(cached.userId, currentUser);
      return cached;
    }

    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check access permissions
    this.checkAccess(patient.userId, currentUser);

    // Cache the result
    await this.redisService.set(cacheKey, patient, CACHE_TTL);

    return patient;
  }

  async findByUserId(userId: string) {
    const patient = await this.patientRepository.findByUserId(userId);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async update(
    id: string,
    dto: UpdatePatientDto,
    currentUser: { id: string; role: UserRole },
  ) {
    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check access permissions
    this.checkAccess(patient.userId, currentUser);

    // Transform arrays to JSON strings for SQLite
    const updateData: Record<string, unknown> = { ...dto };
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

    // Invalidate cache
    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Patient updated: ${id}`, 'PatientService');

    return updatedPatient;
  }

  async softDelete(id: string, currentUser: { id: string; role: UserRole }) {
    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Only admin or the patient themselves can delete
    if (currentUser.role !== UserRole.ADMIN && patient.userId !== currentUser.id) {
      throw new ForbiddenException('You do not have permission to delete this patient');
    }

    await this.patientRepository.softDelete(id);

    // Invalidate cache
    await this.redisService.del(`${CACHE_PREFIX}${id}`);

    this.logger.log(`Patient soft deleted: ${id}`, 'PatientService');

    return { message: 'Patient deleted successfully' };
  }

  async getMedicalHistory(
    patientId: string,
    currentUser: { id: string; role: UserRole },
  ) {
    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    this.checkAccess(patient.userId, currentUser);

    return this.patientRepository.getMedicalHistory(patientId);
  }

  async getAppointmentHistory(
    patientId: string,
    currentUser: { id: string; role: UserRole },
  ) {
    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    this.checkAccess(patient.userId, currentUser);

    return this.patientRepository.getAppointmentHistory(patientId);
  }

  async getPrescriptionHistory(
    patientId: string,
    currentUser: { id: string; role: UserRole },
  ) {
    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    this.checkAccess(patient.userId, currentUser);

    return this.patientRepository.getPrescriptionHistory(patientId);
  }

  async addMedicalRecord(
    patientId: string,
    data: {
      recordType: string;
      title: string;
      description?: string;
      fileUrl?: string;
      recordDate: Date;
      metadata?: Record<string, unknown>;
    },
    currentUser: { id: string; role: UserRole },
  ) {
    const patient = await this.patientRepository.findById(patientId);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Only doctors, admins, or the patient can add records
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.DOCTOR &&
      patient.userId !== currentUser.id
    ) {
      throw new ForbiddenException('You do not have permission to add medical records');
    }

    const record = await this.patientRepository.addMedicalRecord({
      patientId,
      ...data,
    });

    this.logger.log(`Medical record added for patient: ${patientId}`, 'PatientService');

    return record;
  }

  private checkAccess(
    patientUserId: string,
    currentUser: { id: string; role: UserRole },
  ): void {
    // Admin and doctors can access all patients
    if (
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.DOCTOR
    ) {
      return;
    }

    // Patients can only access their own records
    if (patientUserId !== currentUser.id) {
      throw new ForbiddenException('You do not have permission to access this patient');
    }
  }
}
