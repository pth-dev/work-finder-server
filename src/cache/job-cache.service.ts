import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { JobPost } from '../jobs/entities/job.entity';
import { JobSearchFilters } from '../jobs/jobs.service';

@Injectable()
export class JobCacheService {
  constructor(private cacheService: CacheService) {}

  private getJobKey(identifier: string | number): string {
    return `job:${identifier}`;
  }

  private getJobListKey(filters: JobSearchFilters): string {
    const filterString = JSON.stringify(filters);
    return `jobs:list:${Buffer.from(filterString).toString('base64')}`;
  }

  private getFeaturedJobsKey(limit: number): string {
    return `jobs:featured:${limit}`;
  }

  private getCompanyJobsKey(companyId: number, limit?: number): string {
    return `jobs:company:${companyId}:${limit || 'all'}`;
  }

  async getJob(identifier: string | number): Promise<JobPost | null> {
    const result = await this.cacheService.get<JobPost>(this.getJobKey(identifier));
    return result ?? null;
  }

  async setJob(identifier: string | number, job: JobPost, ttl: number = 900): Promise<void> {
    await this.cacheService.set(this.getJobKey(identifier), job, ttl);
  }

  async getJobList(filters: JobSearchFilters): Promise<any | null> {
    return this.cacheService.get(this.getJobListKey(filters));
  }

  async setJobList(filters: JobSearchFilters, data: any, ttl: number = 300): Promise<void> {
    await this.cacheService.set(this.getJobListKey(filters), data, ttl);
  }

  async getFeaturedJobs(limit: number): Promise<any | null> {
    return this.cacheService.get(this.getFeaturedJobsKey(limit));
  }

  async setFeaturedJobs(limit: number, data: any, ttl: number = 300): Promise<void> {
    await this.cacheService.set(this.getFeaturedJobsKey(limit), data, ttl);
  }

  async getCompanyJobs(companyId: number, limit?: number): Promise<any | null> {
    return this.cacheService.get(this.getCompanyJobsKey(companyId, limit));
  }

  async setCompanyJobs(companyId: number, data: any, limit?: number, ttl: number = 600): Promise<void> {
    await this.cacheService.set(this.getCompanyJobsKey(companyId, limit), data, ttl);
  }

  async invalidateJob(identifier: string | number): Promise<void> {
    await this.cacheService.del(this.getJobKey(identifier));
  }

  async invalidateJobsByPattern(pattern: string): Promise<void> {
    if (pattern.startsWith('job:') && pattern.includes(':')) {
      const jobIdMatch = pattern.match(/job:(\d+)/);
      if (jobIdMatch) {
        const jobId = parseInt(jobIdMatch[1], 10);
        await this.cacheService.invalidateJobCache(jobId);
        return;
      }
    }
    
    await this.cacheService.del(pattern);
  }

  async invalidateAllJobLists(): Promise<void> {
    const patterns = ['jobs:list:*', 'jobs:featured:*'];
    for (const pattern of patterns) {
      try {
        await this.cacheService.del(pattern);
      } catch (error) {
        console.warn(`Failed to invalidate pattern ${pattern}:`, error);
      }
    }
  }

  async invalidateCompanyJobs(companyId: number): Promise<void> {
    await this.cacheService.invalidateCompanyCache(companyId);
  }

  async warmPopularJobsCache(jobIds: number[]): Promise<void> {
    const promises = jobIds.map(async (_id) => {
      return Promise.resolve();
    });
    
    await Promise.all(promises);
  }

  async getCacheStats(): Promise<{
    jobsCount: number;
    listsCount: number;
    hitRate: number;
  }> {
    return {
      jobsCount: 0,
      listsCount: 0,
      hitRate: 0
    };
  }
}