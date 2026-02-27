import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WinstonLoggerService } from '@common/services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || this.generateRequestId();

    // Add request ID to request for tracking
    request.requestId = requestId;

    const startTime = Date.now();

    this.logger.debug(
      `Incoming Request: ${method} ${url}`,
      'LoggingInterceptor',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          this.logger.logWithMeta('info', `${method} ${url} ${statusCode}`, {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent: userAgent.substring(0, 100),
            requestId,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.logWithMeta('error', `${method} ${url} ERROR`, {
            method,
            url,
            duration: `${duration}ms`,
            ip,
            userAgent: userAgent.substring(0, 100),
            requestId,
            error: error.message,
          });
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
