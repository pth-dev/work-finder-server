// Base response interface
export interface BaseResponse {
  message: string;
  timestamp: string;
}

// Success response interface
export interface ApiResponse<T = any> extends BaseResponse {
  success: true;
  status: number;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    sorting?: SortingMeta;
    filtering?: FilteringMeta;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    pagination: PaginationMeta;
    [key: string]: any;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SortingMeta {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  availableFields?: string[];
}

export interface FilteringMeta {
  filters?: Record<string, any>;
  availableFields?: string[];
}

// Error response interface
export interface ErrorResponse extends BaseResponse {
  success: false;
  status: number;
  error: {
    code: string;
    details?: any;
    stack?: string; // Only in development
  };
}

// Response builder utility
export class ResponseBuilder {
  static success<T>(
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: any,
  ): ApiResponse<T> {
    return {
      success: true,
      status: statusCode,
      data,
      message,
      timestamp: new Date().toISOString(),
      ...(meta && { meta }),
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message: string = 'Data retrieved successfully',
    statusCode: number = 200,
  ): PaginatedResponse<T> {
    return {
      success: true,
      status: statusCode,
      data,
      message,
      timestamp: new Date().toISOString(),
      meta: { pagination },
    };
  }

  static error(
    message: string,
    code: string = 'INTERNAL_ERROR',
    details?: any,
    statusCode: number = 500,
  ): ErrorResponse {
    return {
      success: false,
      status: statusCode,
      message,
      timestamp: new Date().toISOString(),
      error: {
        code,
        details,
        ...(process.env.NODE_ENV === 'development' && {
          stack: new Error().stack,
        }),
      },
    };
  }
}
