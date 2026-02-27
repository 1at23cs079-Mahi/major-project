import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { Request } from 'express';
import { AuthService } from '../auth.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    private authService;
    constructor(configService: ConfigService, prisma: PrismaService, authService: AuthService);
    validate(req: Request, payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: string;
        status: string;
    }>;
}
export {};
