import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  ResponseBuilder,
} from '../interfaces/api-response.interface';

// Decorator to skip response transformation
export const RAW_RESPONSE_KEY = 'raw_response';
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);

// Decorator to set custom response message
export const RESPONSE_MESSAGE_KEY = 'response_message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, message);

// Decorator to mark paginated responses
export const PAGINATED_RESPONSE_KEY = 'paginated_response';
export const PaginatedResponse = () =>
  SetMetadata(PAGINATED_RESPONSE_KEY, true);

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const isRawResponse = this.reflector.getAllAndOverride<boolean>(
          RAW_RESPONSE_KEY,
          [context.getHandler(), context.getClass()],
        );

        if (isRawResponse) {
          return data;
        }

        if (this.isAlreadyWrapped(data)) {
          return data;
        }

        const customMessage = this.reflector.getAllAndOverride<string>(
          RESPONSE_MESSAGE_KEY,
          [context.getHandler(), context.getClass()],
        );

        const isPaginated = this.reflector.getAllAndOverride<boolean>(
          PAGINATED_RESPONSE_KEY,
          [context.getHandler(), context.getClass()],
        );

        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || 200;

        if (isPaginated && this.isPaginatedData(data)) {
          return ResponseBuilder.paginated(
            data.data,
            data.pagination,
            customMessage || 'Data retrieved successfully',
            statusCode,
          );
        }

        if (data === null || data === undefined) {
          return ResponseBuilder.success(
            null,
            customMessage || 'Operation completed successfully',
            statusCode,
          );
        }

        // Handle array responses
        if (Array.isArray(data)) {
          return ResponseBuilder.success(
            data,
            customMessage || 'Data retrieved successfully',
            statusCode,
          );
        }

        // Handle object responses
        return ResponseBuilder.success(
          data,
          customMessage || 'Operation successful',
          statusCode,
        );
      }),
    );
  }

  private isAlreadyWrapped(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'status' in data &&
      'message' in data &&
      'timestamp' in data &&
      ('data' in data || 'error' in data)
    );
  }

  private isPaginatedData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'pagination' in data &&
      Array.isArray(data.data)
    );
  }
}

// Utility function for manual response building in controllers
export function buildResponse<T>(
  data: T,
  message?: string,
  statusCode?: number,
  meta?: any,
): ApiResponse<T> {
  return ResponseBuilder.success(data, message, statusCode, meta);
}

// Utility function for paginated responses
export function buildPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
  statusCode?: number,
): ApiResponse<T[]> {
  const totalPages = Math.ceil(total / limit);

  return ResponseBuilder.paginated(
    data,
    {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    message,
    statusCode,
  );
}
