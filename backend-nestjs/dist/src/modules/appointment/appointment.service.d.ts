import { AppointmentRepository } from './appointment.repository';
import { CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, AppointmentQueryDto } from './dto/appointment.dto';
import { PaginatedResponse } from '@common/dto/pagination.dto';
import { RedisService } from '@common/redis/redis.service';
import { WinstonLoggerService } from '@common/services/logger.service';
import { UserRole } from '@common/constants';
import { PrismaService } from '@common/prisma/prisma.service';
export declare class AppointmentService {
    private appointmentRepository;
    private prisma;
    private redisService;
    private logger;
    constructor(appointmentRepository: AppointmentRepository, prisma: PrismaService, redisService: RedisService, logger: WinstonLoggerService);
    create(dto: CreateAppointmentDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    findAll(query: AppointmentQueryDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<PaginatedResponse<any>>;
    findById(id: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<any>;
    update(id: string, dto: UpdateAppointmentDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    cancel(id: string, dto: CancelAppointmentDto, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    confirm(id: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    complete(id: string, notes: string, currentUser: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    getDoctorAvailability(doctorId: string, date: string): Promise<{
        doctor: {
            id: string;
            firstName: string;
            lastName: string;
            specialization: string;
        };
        date: string;
        slots: {
            time: string;
            available: boolean;
        }[];
    }>;
    private checkAccess;
}
