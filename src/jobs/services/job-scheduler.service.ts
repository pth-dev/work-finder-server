import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobPost } from '../entities/job.entity';
import { JobStatus } from '../../common/enums/job-status.enum';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class JobSchedulerService {
  private readonly logger = new Logger(JobSchedulerService.name);

  constructor(
    @InjectRepository(JobPost)
    private jobRepository: Repository<JobPost>,
    private cacheService: CacheService,
  ) {}

  /**
   * Run every hour to check for expired jobs and mark them as INACTIVE
   * This follows the business rule: ACTIVE jobs that pass expires_at → INACTIVE
   *
   * ❌ TEMPORARILY DISABLED: Comment out to prevent auto status change
   */
  // @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredJobs() {
    try {
      this.logger.log('Starting expired jobs check...');

      const now = new Date();

      // Find all ACTIVE jobs that have passed their expiration date
      const expiredJobs = await this.jobRepository.find({
        where: {
          status: JobStatus.ACTIVE,
          expires_at: LessThan(now),
        },
        relations: ['company'],
      });

      if (expiredJobs.length === 0) {
        this.logger.log('No expired jobs found');
        return;
      }

      this.logger.log(`Found ${expiredJobs.length} expired jobs to process`);

      // Update expired jobs to INACTIVE status
      const updatePromises = expiredJobs.map(async (job) => {
        try {
          job.status = JobStatus.INACTIVE;
          await this.jobRepository.save(job);

          // Invalidate cache for this job
          await this.cacheService.invalidateJobCache(job.job_id);
          await this.cacheService.invalidateCompanyCache(job.company_id);

          this.logger.log(
            `Job ${job.job_id} (${job.job_title}) marked as INACTIVE - expired on ${job.expires_at}`,
          );

          return job;
        } catch (error) {
          this.logger.error(
            `Failed to update expired job ${job.job_id}: ${error.message}`,
          );
          return null;
        }
      });

      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value !== null,
      ).length;

      this.logger.log(
        `Expired jobs processing completed: ${successful}/${expiredJobs.length} jobs updated successfully`,
      );

      // TODO: Send notifications to recruiters about expired jobs
      // await this.notificationService.notifyRecruitersJobExpired(expiredJobs);
    } catch (error) {
      this.logger.error(
        `Error processing expired jobs: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Run daily to send warnings about jobs expiring soon (within 3 days)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleJobsExpiringSoon() {
    try {
      this.logger.log('Checking for jobs expiring soon...');

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      const now = new Date();

      // Find ACTIVE jobs expiring within 3 days
      const jobsExpiringSoon = await this.jobRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.company', 'company')
        .where('job.status = :status', { status: JobStatus.ACTIVE })
        .andWhere('job.expires_at > :now', { now })
        .andWhere('job.expires_at <= :threeDaysFromNow', { threeDaysFromNow })
        .getMany();

      if (jobsExpiringSoon.length === 0) {
        this.logger.log('No jobs expiring soon found');
        return;
      }

      this.logger.log(
        `Found ${jobsExpiringSoon.length} jobs expiring within 3 days`,
      );

      // Group jobs by company for batch notifications
      const jobsByCompany = jobsExpiringSoon.reduce(
        (acc, job) => {
          const companyId = job.company_id;
          if (!acc[companyId]) {
            acc[companyId] = [];
          }
          acc[companyId].push(job);
          return acc;
        },
        {} as Record<number, JobPost[]>,
      );

      // Log expiring jobs for monitoring
      Object.entries(jobsByCompany).forEach(([companyId, jobs]) => {
        this.logger.log(
          `Company ${companyId} has ${jobs.length} jobs expiring soon: ${jobs
            .map((job) => `${job.job_title} (expires: ${job.expires_at})`)
            .join(', ')}`,
        );
      });

      // TODO: Send email notifications to recruiters
      // await this.notificationService.notifyRecruitersJobsExpiringSoon(jobsByCompany);
    } catch (error) {
      this.logger.error(
        `Error checking jobs expiring soon: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Manual method to process expired jobs (for testing or manual triggers)
   */
  async processExpiredJobsManually(): Promise<{
    processed: number;
    errors: number;
    jobs: JobPost[];
  }> {
    this.logger.log('Manual expired jobs processing triggered');

    const now = new Date();
    const expiredJobs = await this.jobRepository.find({
      where: {
        status: JobStatus.ACTIVE,
        expires_at: LessThan(now),
      },
      relations: ['company'],
    });

    if (expiredJobs.length === 0) {
      return { processed: 0, errors: 0, jobs: [] };
    }

    let processed = 0;
    let errors = 0;
    const processedJobs: JobPost[] = [];

    for (const job of expiredJobs) {
      try {
        job.status = JobStatus.INACTIVE;
        const updatedJob = await this.jobRepository.save(job);

        await this.cacheService.invalidateJobCache(job.job_id);
        await this.cacheService.invalidateCompanyCache(job.company_id);

        processedJobs.push(updatedJob);
        processed++;
      } catch (error) {
        this.logger.error(
          `Failed to process job ${job.job_id}: ${error.message}`,
        );
        errors++;
      }
    }

    this.logger.log(
      `Manual processing completed: ${processed} processed, ${errors} errors`,
    );

    return { processed, errors, jobs: processedJobs };
  }

  /**
   * Get statistics about job expiration
   */
  async getExpirationStatistics(): Promise<{
    activeJobs: number;
    expiredJobs: number;
    expiringSoon: number;
    expiredToday: number;
  }> {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [activeJobs, expiredJobs, expiringSoon, expiredToday] =
      await Promise.all([
        this.jobRepository.count({
          where: { status: JobStatus.ACTIVE },
        }),
        this.jobRepository.count({
          where: { status: JobStatus.INACTIVE },
        }),
        this.jobRepository.count({
          where: {
            status: JobStatus.ACTIVE,
            expires_at: LessThan(threeDaysFromNow),
          },
        }),
        this.jobRepository.count({
          where: {
            status: JobStatus.INACTIVE,
            updated_at: {
              $gte: startOfToday,
              $lte: endOfToday,
            } as any,
          },
        }),
      ]);

    return {
      activeJobs,
      expiredJobs,
      expiringSoon,
      expiredToday,
    };
  }
}
