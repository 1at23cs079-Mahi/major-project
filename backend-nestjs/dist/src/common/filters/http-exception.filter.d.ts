import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { WinstonLoggerService } from '@common/services/logger.service';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    constructor(logger: WinstonLoggerService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
