import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { Reflector } from '@nestjs/core';

// ✅ Custom decorator for cache configuration
export const CacheKey = Reflector.createDecorator<string>();
export const CacheTTL = Reflector.createDecorator<number>();
export const NoCache = Reflector.createDecorator<boolean>();

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    private cacheService: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // ✅ Skip caching for non-GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // ✅ Check if caching is disabled for this route
    const noCache = this.reflector.get<boolean>(
      'noCache',
      context.getHandler(),
    );
    if (noCache) {
      return next.handle();
    }

    // ✅ Generate cache key
    const cacheKey = this.generateCacheKey(context, request);

    // ✅ Try to get from cache
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      // Set cache headers
      if (!response.headersSent) {
        response.setHeader('X-Cache', 'HIT');
        response.setHeader('Cache-Control', 'public, max-age=300');
      }
      return of(cachedResult);
    }

    // ✅ Get TTL from decorator or use default
    const ttl = this.reflector.get<number>('ttl', context.getHandler()) || 300;

    // ✅ Execute request and cache result
    return next.handle().pipe(
      tap(async (data) => {
        if (data && response.statusCode === 200 && !response.headersSent) {
          await this.cacheService.set(cacheKey, data, ttl);
          response.setHeader('X-Cache', 'MISS');
          response.setHeader('Cache-Control', 'public, max-age=300');
        }
      }),
    );
  }

  private generateCacheKey(context: ExecutionContext, request: any): string {
    // ✅ Use custom cache key if provided
    const customKey = this.reflector.get<string>('key', context.getHandler());
    if (customKey) {
      return customKey;
    }

    // ✅ Generate key from route and query parameters
    const { url, query } = request;
    const sortedQuery = Object.keys(query || {})
      .sort()
      .reduce((result, key) => {
        result[key] = query[key];
        return result;
      }, {});

    const queryString = Object.keys(sortedQuery).length
      ? `?${new URLSearchParams(sortedQuery).toString()}`
      : '';

    return `http:${url.split('?')[0]}${queryString}`;
  }
}
