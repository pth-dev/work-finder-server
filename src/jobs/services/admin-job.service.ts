import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { JobPost } from '../entities/job.entity';
import { JobStatus } from '../../common/enums/job-status.enum';
import { CacheService } from '../../cache/cache.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import {
  CompanyUser,
  CompanyUserRole,
} from '../../companies/entities/company-user.entity';

@Injectable()
export class AdminJobService {
  constructor(
    @InjectRepository(JobPost)
    private jobRepository: Repository<JobPost>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
    private cacheService: CacheService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Get all pending jobs for admin review
   */
  async getPendingJobs(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    jobs: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [jobs, total] = await this.jobRepository.findAndCount({
      where: { status: JobStatus.PENDING },
      relations: ['company'],
      order: { posted_date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Approve a job (PENDING → ACTIVE)
   */
  async approveJob(jobId: number, adminUserId: number): Promise<JobPost> {
    const job = await this.jobRepository.findOne({
      where: { job_id: jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Validate status transition
    if (!this.canTransitionTo(job.status, JobStatus.ACTIVE)) {
      throw new BadRequestException(
        `Cannot approve job with status ${job.status}. Only PENDING jobs can be approved.`,
      );
    }

    // Update job status
    job.status = JobStatus.ACTIVE;
    const updatedJob = await this.jobRepository.save(job);

    // Invalidate cache
    await this.cacheService.invalidateJobCache(jobId);
    await this.cacheService.invalidateCompanyCache(job.company_id);

    // ✅ Send notification to recruiter about approval
    try {
      // Get company owner/admin to notify
      const companyOwner = await this.companyUserRepository.findOne({
        where: {
          company_id: job.company_id,
          role: CompanyUserRole.OWNER,
        },
      });

      if (companyOwner) {
        await this.notificationsService.notifyJobApproved(
          companyOwner.user_id,
          job.job_title,
        );
        console.log(
          `Notified recruiter ${companyOwner.user_id} about job approval: ${job.job_title}`,
        );
      } else {
        console.log(`No company owner found for company ${job.company_id}`);
      }
    } catch (error) {
      console.error(`Failed to notify recruiter about job approval:`, error);
    }

    return updatedJob;
  }

  /**
   * Reject a job (PENDING → REJECTED)
   */
  async rejectJob(
    jobId: number,
    adminUserId: number,
    reason?: string,
  ): Promise<JobPost> {
    const job = await this.jobRepository.findOne({
      where: { job_id: jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Validate status transition
    if (!this.canTransitionTo(job.status, JobStatus.REJECTED)) {
      throw new BadRequestException(
        `Cannot reject job with status ${job.status}. Only PENDING jobs can be rejected.`,
      );
    }

    // Update job status
    job.status = JobStatus.REJECTED;
    const updatedJob = await this.jobRepository.save(job);

    // Invalidate cache
    await this.cacheService.invalidateJobCache(jobId);
    await this.cacheService.invalidateCompanyCache(job.company_id);

    // ✅ Send notification to recruiter about rejection
    try {
      // Get company owner/admin to notify
      const companyOwner = await this.companyUserRepository.findOne({
        where: {
          company_id: job.company_id,
          role: CompanyUserRole.OWNER,
        },
      });

      if (companyOwner) {
        await this.notificationsService.notifyJobRejected(
          companyOwner.user_id,
          job.job_title,
          reason,
        );
        console.log(
          `Notified recruiter ${companyOwner.user_id} about job rejection: ${job.job_title}`,
        );
      } else {
        console.log(`No company owner found for company ${job.company_id}`);
      }
    } catch (error) {
      console.error(`Failed to notify recruiter about job rejection:`, error);
    }

    return updatedJob;
  }

  /**
   * Validate if status transition is allowed
   */
  private canTransitionTo(
    currentStatus: JobStatus,
    newStatus: JobStatus,
  ): boolean {
    const allowedTransitions: Record<JobStatus, JobStatus[]> = {
      [JobStatus.PENDING]: [JobStatus.ACTIVE, JobStatus.REJECTED],
      [JobStatus.ACTIVE]: [JobStatus.INACTIVE, JobStatus.CLOSED],
      [JobStatus.INACTIVE]: [JobStatus.ACTIVE, JobStatus.CLOSED],
      [JobStatus.CLOSED]: [], // Final state
      [JobStatus.REJECTED]: [JobStatus.PENDING], // Can be resubmitted after fixes
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Get job statistics for admin dashboard
   */
  async getJobStatistics(): Promise<{
    total: number;
    byStatus: Record<JobStatus, number>;
    pendingReview: number;
    activeJobs: number;
    expiringSoon: number;
  }> {
    const total = await this.jobRepository.count();

    // Get counts by status
    const statusCounts = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.status')
      .getRawMany();

    const byStatus = statusCounts.reduce(
      (acc, item) => {
        acc[item.status as JobStatus] = parseInt(item.count);
        return acc;
      },
      {} as Record<JobStatus, number>,
    );

    // Fill missing statuses with 0
    Object.values(JobStatus).forEach((status) => {
      if (!byStatus[status]) {
        byStatus[status] = 0;
      }
    });

    const pendingReview = byStatus[JobStatus.PENDING] || 0;
    const activeJobs = byStatus[JobStatus.ACTIVE] || 0;

    // Jobs expiring in next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSoon = await this.jobRepository.count({
      where: {
        status: JobStatus.ACTIVE,
        expires_at: Between(new Date(), sevenDaysFromNow),
      },
    });

    return {
      total,
      byStatus,
      pendingReview,
      activeJobs,
      expiringSoon,
    };
  }
}
