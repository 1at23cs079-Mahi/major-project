import { AuditService } from './audit.service';
import { AuditAction } from '@common/constants';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(page?: number, limit?: number, action?: AuditAction, entityType?: string, userId?: string): Promise<import("@common/dto/pagination.dto").PaginatedResponse<{
        user: {
            email: string;
            role: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        metadata: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        oldValues: string | null;
        newValues: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>>;
    findByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        metadata: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        oldValues: string | null;
        newValues: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
    findByEntity(entityType: string, entityId: string): Promise<({
        user: {
            email: string;
            role: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        metadata: string | null;
        action: string;
        entityType: string;
        entityId: string | null;
        oldValues: string | null;
        newValues: string | null;
        ipAddress: string | null;
        userAgent: string | null;
    })[]>;
}
