import { PrescriptionService } from './prescription.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto, FillPrescriptionDto, PrescriptionQueryDto } from './dto/prescription.dto';
import { UserRole } from '@common/constants';
export declare class PrescriptionController {
    private readonly prescriptionService;
    constructor(prescriptionService: PrescriptionService);
    create(dto: CreatePrescriptionDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    findAll(query: PrescriptionQueryDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("../../common/dto").PaginatedResponse<any>>;
    findById(id: string, user: {
        id: string;
        role: UserRole;
    }): Promise<any>;
    update(id: string, dto: UpdatePrescriptionDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    fill(id: string, dto: FillPrescriptionDto, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    cancel(id: string, user: {
        id: string;
        role: UserRole;
    }): Promise<import("./prescription.repository").PrescriptionWithRelations>;
    refillItem(id: string, itemId: string, user: {
        id: string;
        role: UserRole;
    }): Promise<{
        message: string;
    }>;
}
