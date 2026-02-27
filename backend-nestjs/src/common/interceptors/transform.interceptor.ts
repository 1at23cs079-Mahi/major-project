import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    path: string;
    version: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If data already has success property, it's already formatted
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle pagination responses
        if (data && typeof data === 'object' && 'items' in data && 'pagination' in data) {
          return {
            success: true,
            ...data,
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              version: 'v1',
            },
          };
        }

        return {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            version: 'v1',
          },
        };
      }),
    );
  }
}
