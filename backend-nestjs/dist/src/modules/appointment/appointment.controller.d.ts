import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, AppointmentQueryDto } from './dto/appointment.dto';
import { UserRole } from '@common/constants';
export declare class AppointmentController {
    private readonly appointmentService;
    constructor(appointmentService: AppointmentService);
    create(dto: CreateAppointmentDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    findAll(query: AppointmentQueryDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("../../common/dto").PaginatedResponse<any>>;
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
    findById(id: string, user: {
        id: string;
        role: UserRole;
    }): Promise<any>;
    update(id: string, dto: UpdateAppointmentDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    cancel(id: string, dto: CancelAppointmentDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    confirm(id: string, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
    complete(id: string, notes: string, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./appointment.repository").AppointmentWithRelations>;
}
