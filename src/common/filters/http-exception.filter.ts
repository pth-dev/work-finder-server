import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ResponseBuilder,
  ErrorResponse,
} from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCode(status);
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message =
          responseObj.message || responseObj.error || 'An error occurred';
        code = responseObj.code || this.getErrorCode(status);
        details = responseObj.details || responseObj;
      } else {
        // Fallback for unexpected response types
        message = 'An error occurred';
        code = this.getErrorCode(status);
      }
    } else {
      // Handle non-HTTP exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'INTERNAL_SERVER_ERROR';

      if (exception instanceof Error) {
        message = exception.message;
        details = {
          name: exception.name,
          ...(process.env.NODE_ENV === 'development' && {
            stack: exception.stack,
          }),
        };
      }
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
    );

    // Build standardized error response
    const errorResponse: ErrorResponse = ResponseBuilder.error(
      message,
      code,
      details,
      status,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}

// Custom exception classes for better error handling
export class ValidationException extends HttpException {
  constructor(errors: any) {
    super(
      {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class BusinessLogicException extends HttpException {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR') {
    super(
      {
        message,
        code,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;

    super(
      {
        message,
        code: 'RESOURCE_NOT_FOUND',
        details: { resource, id },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
