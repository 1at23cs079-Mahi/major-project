import { LoggerService } from '@nestjs/common';
export declare class WinstonLoggerService implements LoggerService {
    private logger;
    private context?;
    constructor();
    setContext(context: string): void;
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    logWithMeta(level: 'info' | 'error' | 'warn' | 'debug', message: string, meta: Record<string, unknown>): void;
}
