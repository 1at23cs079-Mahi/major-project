import { PrismaService } from '@common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditAction } from '@common/constants';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: {
        userId?: string;
        action: AuditAction;
        entityType: string;
        entityId?: string;
        oldValues?: Record<string, unknown>;
        newValues?: Record<string, unknown>;
        ipAddress?: string;
        userAgent?: string;
        metadata?: Record<string, unknown>;
    }): Promise<{
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
    }>;
    findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.AuditLogWhereInput;
        orderBy?: Prisma.AuditLogOrderByWithRelationInput;
    }): Promise<({
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
    count(where?: Prisma.AuditLogWhereInput): Promise<number>;
    findByUserId(userId: string, take?: number): Promise<{
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
