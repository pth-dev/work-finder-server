import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // ✅ Generic cache methods
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Note: reset() method may not be available in all cache-manager versions
    // Use stores array if available, otherwise clear keys manually
    if (this.cacheManager.stores && this.cacheManager.stores.length > 0) {
      // Clear all stores
      for (const store of this.cacheManager.stores) {
        if (typeof store.clear === 'function') {
          await store.clear();
        }
      }
    } else {
      // Fallback: clear all keys (implementation depends on cache store)
      console.warn(
        'Cache reset not available, consider implementing manual key clearing',
      );
    }
  }

  // ✅ Smart cache key generation
  generateJobListKey(filters: any): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key];
        return result;
      }, {});

    return `jobs:list:${Buffer.from(JSON.stringify(sortedFilters)).toString('base64')}`;
  }

  generateJobKey(jobId: number): string {
    return `job:${jobId}`;
  }

  generateUserApplicationsKey(userId: number): string {
    return `user:${userId}:applications`;
  }

  generateJobApplicationsKey(jobId: number): string {
    return `job:${jobId}:applications`;
  }

  generateCompanyKey(companyId: number): string {
    return `company:${companyId}`;
  }

  generateCompanyJobsKey(companyId: number): string {
    return `company:${companyId}:jobs`;
  }

  // ✅ Smart cache invalidation patterns
  async invalidateJobCache(jobId: number): Promise<void> {
    const patterns = [
      `job:${jobId}`,
      `job:${jobId}:applications`,
      'jobs:list:*', // Invalidate all job lists
      'jobs:featured:*',
      'jobs:recent:*',
    ];

    await this.invalidateByPatterns(patterns);
  }

  async invalidateUserCache(userId: number): Promise<void> {
    const patterns = [
      `user:${userId}:applications`,
      `user:${userId}:saved-jobs`,
      `user:${userId}:profile`,
    ];

    await this.invalidateByPatterns(patterns);
  }

  async invalidateCompanyCache(companyId: number): Promise<void> {
    const patterns = [
      `company:${companyId}`,
      `company:${companyId}:jobs`,
      'companies:list:*',
      'jobs:list:*', // Company changes might affect job listings
    ];

    await this.invalidateByPatterns(patterns);
  }

  async invalidateApplicationCache(
    applicationId: number,
    jobId: number,
    userId: number,
  ): Promise<void> {
    const patterns = [
      `application:${applicationId}`,
      `job:${jobId}:applications`,
      `user:${userId}:applications`,
      'applications:list:*',
    ];

    await this.invalidateByPatterns(patterns);
  }

  // ✅ Pattern-based cache invalidation (Redis-specific)
  private async invalidateByPatterns(patterns: string[]): Promise<void> {
    try {
      // Note: This requires Redis SCAN command support
      // For production, consider using Redis Streams or pub/sub for cache invalidation
      for (const pattern of patterns) {
        if (pattern.includes('*')) {
          // For wildcard patterns, we need to scan and delete
          await this.deleteByPattern(pattern);
        } else {
          // Direct key deletion
          await this.del(pattern);
        }
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
      // Don't throw - cache invalidation failures shouldn't break the app
    }
  }

  private async deleteByPattern(pattern: string): Promise<void> {
    // This is a simplified implementation
    // In production, use Redis SCAN for better performance
    try {
      const store = (this.cacheManager as any).store;
      if (store && store.getClient) {
        const client = store.getClient();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      }
    } catch (error) {
      console.error('Pattern deletion error:', error);
    }
  }

  // ✅ Cache warming methods
  async warmJobCache(jobId: number, jobData: any): Promise<void> {
    const key = this.generateJobKey(jobId);
    await this.set(key, jobData, 600); // 10 minutes TTL
  }

  async warmJobListCache(filters: any, jobsData: any): Promise<void> {
    const key = this.generateJobListKey(filters);
    await this.set(key, jobsData, 300); // 5 minutes TTL
  }

  // ✅ Cache statistics (for monitoring)
  async getCacheStats(): Promise<any> {
    try {
      const store = (this.cacheManager as any).store;
      if (store && store.getClient) {
        const client = store.getClient();
        const info = await client.info('memory');
        return {
          memory_usage: info,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Cache stats error:', error);
      return { error: 'Unable to retrieve cache stats' };
    }
  }
}
