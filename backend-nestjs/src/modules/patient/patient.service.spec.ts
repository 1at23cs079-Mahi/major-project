import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { PatientRepository } from './patient.repository';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

// String constants (SQLite doesn't support Prisma enums)
const UserRole = { PATIENT: 'PATIENT', DOCTOR: 'DOCTOR', ADMIN: 'ADMIN', PHARMACY: 'PHARMACY', LAB: 'LAB' } as const;
const Gender = { MALE: 'MALE', FEMALE: 'FEMALE', OTHER: 'OTHER' } as const;

describe('PatientService', () => {
  let service: PatientService;
  let patientRepository: jest.Mocked<PatientRepository>;
  let redisService: jest.Mocked<RedisService>;

  const mockPatient = {
    id: 'patient-123',
    userId: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1990-01-01'),
    gender: Gender.MALE,
    phone: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    emergencyContact: null,
    emergencyPhone: null,
    bloodType: 'O+',
    allergies: 'Penicillin',
    chronicConditions: '',
    insuranceProvider: 'Blue Cross',
    insuranceNumber: 'BC123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: {
      email: 'john@example.com',
      status: 'ACTIVE',
    },
  };

  const mockAdminUser = {
    id: 'admin-123',
    role: UserRole.ADMIN,
  };

  const mockPatientUser = {
    id: 'user-123',
    role: UserRole.PATIENT,
  };

  const mockOtherPatientUser = {
    id: 'other-user-456',
    role: UserRole.PATIENT,
  };

  beforeEach(async () => {
    const mockPatientRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      getMedicalHistory: jest.fn(),
      getAppointmentHistory: jest.fn(),
      getPrescriptionHistory: jest.fn(),
      addMedicalRecord: jest.fn(),
      buildWhereClause: jest.fn().mockReturnValue({}),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockLogger = {
      setContext: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        { provide: PatientRepository, useValue: mockPatientRepository },
        { provide: RedisService, useValue: mockRedisService },
        { provide: WinstonLoggerService, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    patientRepository = module.get(PatientRepository);
    redisService = module.get(RedisService);
  });

  describe('findById', () => {
    it('should return patient from cache if available', async () => {
      redisService.get.mockResolvedValue(mockPatient);

      const result = await service.findById('patient-123', mockPatientUser);

      expect(redisService.get).toHaveBeenCalledWith('patient:patient-123');
      expect(result).toEqual(mockPatient);
      expect(patientRepository.findById).not.toHaveBeenCalled();
    });

    it('should return patient from database and cache it', async () => {
      redisService.get.mockResolvedValue(null);
      patientRepository.findById.mockResolvedValue(mockPatient);

      const result = await service.findById('patient-123', mockPatientUser);

      expect(patientRepository.findById).toHaveBeenCalledWith('patient-123');
      expect(redisService.set).toHaveBeenCalled();
      expect(result).toEqual(mockPatient);
    });

    it('should throw NotFoundException for non-existent patient', async () => {
      redisService.get.mockResolvedValue(null);
      patientRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent', mockAdminUser)).rejects.toThrow(NotFoundException);
    });

    it('should allow admin to access any patient', async () => {
      redisService.get.mockResolvedValue(null);
      patientRepository.findById.mockResolvedValue(mockPatient);

      const result = await service.findById('patient-123', mockAdminUser);

      expect(result).toEqual(mockPatient);
    });

    it('should throw ForbiddenException when patient tries to access another patient', async () => {
      redisService.get.mockResolvedValue(null);
      patientRepository.findById.mockResolvedValue(mockPatient);

      await expect(service.findById('patient-123', mockOtherPatientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated patients', async () => {
      const mockPatients = [mockPatient];
      patientRepository.findAll.mockResolvedValue(mockPatients);
      patientRepository.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('pagination');
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should apply filters correctly', async () => {
      patientRepository.findAll.mockResolvedValue([]);
      patientRepository.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 10,
        search: 'John',
        gender: Gender.MALE,
        city: 'New York',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(patientRepository.buildWhereClause).toHaveBeenCalledWith({
        search: 'John',
        gender: Gender.MALE,
        bloodType: undefined,
        city: 'New York',
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      firstName: 'Jane',
      phone: '+9876543210',
    };

    it('should update patient successfully', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient);
      patientRepository.update.mockResolvedValue({ ...mockPatient, ...updateDto });

      const result = await service.update('patient-123', updateDto, mockPatientUser);

      expect(patientRepository.update).toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalledWith('patient:patient-123');
      expect(result.firstName).toBe('Jane');
    });

    it('should throw NotFoundException for non-existent patient', async () => {
      patientRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, mockAdminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when patient tries to update another patient', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient);

      await expect(service.update('patient-123', updateDto, mockOtherPatientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete patient successfully', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient);
      patientRepository.softDelete.mockResolvedValue(mockPatient);

      const result = await service.softDelete('patient-123', mockAdminUser);

      expect(patientRepository.softDelete).toHaveBeenCalledWith('patient-123');
      expect(redisService.del).toHaveBeenCalled();
      expect(result.message).toBe('Patient deleted successfully');
    });

    it('should allow patient to delete their own account', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient);
      patientRepository.softDelete.mockResolvedValue(mockPatient);

      const result = await service.softDelete('patient-123', mockPatientUser);

      expect(result.message).toBe('Patient deleted successfully');
    });

    it('should throw ForbiddenException when patient tries to delete another patient', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient);

      await expect(service.softDelete('patient-123', mockOtherPatientUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getMedicalHistory', () => {
    it('should return medical history for authorized user', async () => {
      const mockHistory = [{ id: 'record-1', title: 'Test Record' }];
      patientRepository.findById.mockResolvedValue(mockPatient);
      patientRepository.getMedicalHistory.mockResolvedValue(mockHistory as any);

      const result = await service.getMedicalHistory('patient-123', mockPatientUser);

      expect(patientRepository.getMedicalHistory).toHaveBeenCalledWith('patient-123');
      expect(result).toEqual(mockHistory);
    });
  });
});
