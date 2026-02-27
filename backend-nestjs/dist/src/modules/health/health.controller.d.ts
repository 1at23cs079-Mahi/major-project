import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
export declare class HealthController {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: RedisService);
    check(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
    }>;
    detailedCheck(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        environment: string | undefined;
        memory: {
            used: number;
            total: number;
            unit: string;
        };
        checks: Record<string, {
            status: string;
            latency?: number;
            error?: string;
        }>;
    }>;
    readiness(): Promise<{
        status: string;
        error?: undefined;
    } | {
        status: string;
        error: string;
    }>;
    liveness(): Promise<{
        status: string;
    }>;
}
