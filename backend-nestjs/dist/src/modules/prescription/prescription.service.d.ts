import { PrescriptionRepository } from './prescription.repository';
import { CreatePrescriptionDto, UpdatePrescriptionDto, FillPrescriptionDto, PrescriptionQueryDto } from './dto/prescription.dto';
import { PaginatedResponse } from '@common/dto/pagination.dto';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserRole } from '@common/constants';
export declare class PrescriptionService {
    private prescriptionRepository;
    private prisma;
    private redisService;
    private logger;
    constructor(prescriptionRepository: PrescriptionRepository, prisma: PrismaService, redisService: RedisService, logger: WinstonLoggerService);
    create(dto: CreatePrescriptionDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    findAll(query: PrescriptionQueryDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<PaginatedResponse<any>>;
    findById(id: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<any>;
    update(id: string, dto: UpdatePrescriptionDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    fill(id: string, dto: FillPrescriptionDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    cancel(id: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    refillItem(prescriptionId: string, itemId: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<{
        message: string;
    }>;
    private checkAccess;
}
