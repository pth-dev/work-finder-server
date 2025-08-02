import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export const OptimizeResponse = Reflector.createDecorator<{
  exclude?: string[];
  include?: string[];
  maxDepth?: number;
}>();

@Injectable()
export class ResponseOptimizationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const optimizationOptions = this.reflector.get(
      OptimizeResponse,
      context.getHandler(),
    );

    if (!optimizationOptions) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const fields = request.query.fields;
        if (fields && typeof fields === 'string') {
          const requestedFields = fields.split(',').map((f) => f.trim());
          return this.selectFields(data, requestedFields);
        }

        return this.optimizeData(data, optimizationOptions);
      }),
    );
  }

  private selectFields(data: any, fields: string[]): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.selectFields(item, fields));
    }

    const result: any = {};
    for (const field of fields) {
      if (field.includes('.')) {
        // Handle nested fields like 'company.name'
        const [parent, ...nested] = field.split('.');
        if (data[parent]) {
          if (!result[parent]) {
            result[parent] = {};
          }
          const nestedValue = this.getNestedValue(
            data[parent],
            nested.join('.'),
          );
          if (nestedValue !== undefined) {
            this.setNestedValue(result[parent], nested.join('.'), nestedValue);
          }
        }
      } else if (data.hasOwnProperty(field)) {
        result[field] = data[field];
      }
    }

    return result;
  }

  private optimizeData(
    data: any,
    options: {
      exclude?: string[];
      include?: string[];
      maxDepth?: number;
    },
  ): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.optimizeData(item, options));
    }

    const result: any = {};
    const { exclude = [], include, maxDepth = 3 } = options;

    if (include && include.length > 0) {
      for (const field of include) {
        if (data.hasOwnProperty(field)) {
          result[field] = this.limitDepth(data[field], maxDepth - 1);
        }
      }
      return result;
    }

    // ✅ Otherwise, include all except excluded fields
    for (const [key, value] of Object.entries(data)) {
      if (!exclude.includes(key)) {
        result[key] = this.limitDepth(value, maxDepth - 1);
      }
    }

    return result;
  }

  private limitDepth(value: any, depth: number): any {
    if (depth <= 0 || value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.limitDepth(item, depth - 1));
    }

    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = this.limitDepth(val, depth - 1);
    }

    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// ✅ Usage examples:
/*
@Get()
@OptimizeResponse({
  exclude: ['password', 'internal_notes'],
  maxDepth: 2
})
async getUsers() {
  return this.usersService.findAll();
}

@Get()
@OptimizeResponse({
  include: ['id', 'name', 'email', 'company.name'],
  maxDepth: 1
})
async getBasicUsers() {
  return this.usersService.findAll();
}

// Client can also request specific fields:
// GET /users?fields=id,name,email,company.name
*/
