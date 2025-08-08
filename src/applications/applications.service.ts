import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { JobPost } from '../jobs/entities/job.entity';
import { Resume } from '../resumes/entities/resume.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { JobStatus } from '../common/enums/job-status.enum';
import { User } from '../users/entities/user.entity';
import { CompanyUserStatus } from '../companies/entities/company-user.entity';
import { NotificationsService } from '../notifications/services/notifications.service';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(JobPost)
    private readonly jobRepository: Repository<JobPost>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    // 1. Verify job exists and get job details
    const job = await this.jobRepository.findOne({
      where: { job_id: createApplicationDto.job_id },
      relations: ['company'],
    });

    if (!job) {
      throw new NotFoundException(
        `Job with ID ${createApplicationDto.job_id} not found`,
      );
    }

    // 2. Validate job status - can only apply to active jobs
    if (job.status !== JobStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot apply to this job. Job status is: ${job.status}`,
      );
    }

    // 3. Check application deadline (if field exists)
    // Note: application_deadline field not yet implemented in JobPost entity
    // This validation will be enabled when the field is added
    // if (job.application_deadline) {
    //   const now = new Date();
    //   const deadline = new Date(job.application_deadline);
    //   if (now > deadline) {
    //     throw new BadRequestException(
    //       'Application deadline has passed for this job',
    //     );
    //   }
    // }

    // 4. Verify user exists and get user details
    const user = await this.userRepository.findOne({
      where: { user_id: createApplicationDto.user_id },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createApplicationDto.user_id} not found`,
      );
    }

    // 5. Verify resume exists and belongs to the user
    const resume = await this.resumeRepository.findOne({
      where: {
        resume_id: createApplicationDto.resume_id,
        user_id: createApplicationDto.user_id,
      },
    });

    if (!resume) {
      throw new BadRequestException(
        `Resume with ID ${createApplicationDto.resume_id} not found or does not belong to you`,
      );
    }

    // 6. Check for duplicate application (user + job combination)
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        job_id: createApplicationDto.job_id,
        user_id: createApplicationDto.user_id,
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    // 7. Create application with default status
    const application = this.applicationRepository.create({
      ...createApplicationDto,
      status: ApplicationStatus.PENDING,
      applied_at: new Date(),
    });

    // 8. Save and return the application
    const savedApplication = await this.applicationRepository.save(application);

    // 9. Update job's application count
    await this.jobRepository.increment(
      { job_id: createApplicationDto.job_id },
      'application_count',
      1,
    );

    // 10. Return application with related data
    const finalApplication = await this.applicationRepository.findOne({
      where: { application_id: savedApplication.application_id },
      relations: ['job_post', 'user', 'resume'],
    });

    if (!finalApplication) {
      throw new NotFoundException('Failed to retrieve created application');
    }

    // 🔔 TRIGGER: Notify recruiter about new application
    try {
      const recruiter = await this.getJobRecruiter(job.job_id);
      if (recruiter) {
        await this.notificationsService.notifyJobApplication(
          recruiter.user_id,
          job.job_title,
          finalApplication.user?.full_name || 'Ứng viên',
        );
      }
    } catch (error) {
      // Log error but don't fail the application creation
      console.error('Failed to send application notification:', error);
    }

    return finalApplication;
  }

  async findAll(
    filters: {
      page?: number;
      limit?: number;
      status?: ApplicationStatus;
      jobId?: number;
      userId?: number;
      recruiterId?: number; // Add recruiterId for company-based filtering
      search?: string; // Add search parameter
    } = {},
  ): Promise<{
    applications: Application[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      status,
      jobId,
      userId,
      recruiterId,
      search,
    } = filters;

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job_post', 'job_post')
      .addSelect([
        'job_post.job_id',
        'job_post.job_title',
        'job_post.location',
        'job_post.salary_min',
        'job_post.salary_max',
        'job_post.job_type',
        'job_post.status',
      ])
      .leftJoin('application.resume', 'resume')
      .addSelect(['resume.resume_id', 'resume.file_name'])
      .leftJoin('resume.user', 'user')
      .addSelect(['user.user_id', 'user.full_name', 'user.email'])
      .leftJoin('job_post.company', 'company')
      .addSelect([
        'company.company_id',
        'company.company_name',
        'company.company_image',
      ]);

    // Filter by status
    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    // Filter by job
    if (jobId) {
      queryBuilder.andWhere('application.job_id = :jobId', { jobId });
    }

    // Filter by user (through resume)
    if (userId) {
      queryBuilder.andWhere('resume.user_id = :userId', { userId });
    }

    // Filter by recruiter's company (CRITICAL SECURITY FIX)
    if (recruiterId) {
      // Only show applications for jobs posted by recruiter's company
      queryBuilder
        .leftJoin('company_users', 'cu', 'cu.company_id = company.company_id')
        .andWhere('cu.user_id = :recruiterId', { recruiterId })
        .andWhere('cu.status = :approvedStatus', {
          approvedStatus: CompanyUserStatus.APPROVED,
        });
    }

    // Search by candidate name or email
    if (search) {
      queryBuilder.andWhere(
        '(user.full_name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by application date
    queryBuilder.orderBy('application.applied_at', 'DESC');

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { application_id: id },
      relations: [
        'job_post',
        'resume',
        'resume.user',
        'job_post.company',
        'interviews',
      ],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  async update(
    id: number,
    updateApplicationDto: UpdateApplicationDto,
    currentUserId?: number,
    userRole?: string,
  ): Promise<Application> {
    // 1. Find the application with all relations
    const application = await this.applicationRepository.findOne({
      where: { application_id: id },
      relations: ['job_post', 'resume', 'resume.user', 'job_post.company'],
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // 2. Validate status transition if status is being updated
    if (updateApplicationDto.status) {
      this.validateStatusTransition(
        application.status,
        updateApplicationDto.status,
      );
    }

    // 3. Authorization check - only job owner or admin can update status
    if (updateApplicationDto.status && currentUserId && userRole) {
      // Note: posted_by field not yet implemented in JobPost entity
      // For now, we'll allow recruiters and admins to update any application
      const isAdmin = userRole === 'admin' || userRole === 'recruiter';
      const isApplicant = application.resume.user_id === currentUserId;

      // Applicants can only withdraw their application
      if (isApplicant) {
        if (updateApplicationDto.status !== ApplicationStatus.WITHDRAWN) {
          throw new BadRequestException(
            'Applicants can only withdraw their application',
          );
        }
      } else if (!isAdmin) {
        throw new BadRequestException(
          'Only recruiters, admins, or the applicant can update application status',
        );
      } else {
        // Recruiters/admins cannot set WITHDRAWN status
        if (updateApplicationDto.status === ApplicationStatus.WITHDRAWN) {
          throw new BadRequestException(
            'Only applicants can withdraw their application',
          );
        }
      }
    }

    // 4. Update application
    Object.assign(application, updateApplicationDto);

    // 5. Set updated timestamp
    application.updated_at = new Date();

    // 6. Save and return updated application
    const updatedApplication =
      await this.applicationRepository.save(application);

    const finalApplication = await this.applicationRepository.findOne({
      where: { application_id: updatedApplication.application_id },
      relations: ['job_post', 'resume', 'resume.user', 'job_post.company'],
    });

    if (!finalApplication) {
      throw new NotFoundException('Failed to retrieve updated application');
    }

    // 🔔 TRIGGER: Notify applicant about status change
    if (updateApplicationDto.status) {
      try {
        await this.notificationsService.notifyApplicationStatusUpdate(
          finalApplication.resume.user_id,
          finalApplication.job_post.job_title,
          this.getStatusDisplayName(updateApplicationDto.status),
        );
      } catch (error) {
        // Log error but don't fail the update
        console.error('Failed to send status update notification:', error);
      }
    }

    return finalApplication;
  }

  /**
   * Validate status transitions to ensure business logic
   */
  private validateStatusTransition(
    currentStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
  ): void {
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.PENDING]: [
        ApplicationStatus.REVIEWING,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.REVIEWING]: [
        ApplicationStatus.INTERVIEWED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.INTERVIEWED]: [
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
      ],
      [ApplicationStatus.ACCEPTED]: [], // Final state
      [ApplicationStatus.REJECTED]: [], // Final state
      [ApplicationStatus.WITHDRAWN]: [], // Final state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const application = await this.findOne(id);

    // Decrease job's application count
    await this.jobRepository.decrement(
      { job_id: application.job_id },
      'application_count',
      1,
    );

    await this.applicationRepository.remove(application);
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.job_post', 'job_post')
      .addSelect([
        'job_post.job_id',
        'job_post.job_title',
        'job_post.location',
        'job_post.salary_min',
        'job_post.salary_max',
        'job_post.status',
      ])
      .leftJoin('application.resume', 'resume')
      .addSelect(['resume.resume_id', 'resume.file_name'])
      .leftJoin('job_post.company', 'company')
      .addSelect([
        'company.company_id',
        'company.company_name',
        'company.company_image',
      ])
      .where('application.user_id = :userId', { userId })
      .orderBy('application.applied_at', 'DESC')
      .getMany();
  }

  /**
   * Get applications for a specific job (for recruiters)
   */
  async findByJob(
    jobId: number,
    recruiterId: number,
    filters: {
      page?: number;
      limit?: number;
      status?: ApplicationStatus;
    } = {},
  ): Promise<{
    applications: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, status } = filters;

    // First verify the job exists (posted_by field not yet implemented)
    const job = await this.jobRepository.findOne({
      where: { job_id: jobId },
    });

    if (!job) {
      throw new NotFoundException(
        `Job with ID ${jobId} not found or you don't have permission to view its applications`,
      );
    }

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.resume', 'resume')
      .leftJoinAndSelect('resume.user', 'user')
      .leftJoinAndSelect('application.job_post', 'job_post')
      .where('application.job_id = :jobId', { jobId });

    // Filter by status if provided
    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by application date
    queryBuilder.orderBy('application.applied_at', 'DESC');

    const [applications, total] = await queryBuilder.getManyAndCount();

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get application statistics for a user
   */
  async getApplicationStats(userId: number, userRole: string): Promise<any> {
    let whereCondition: any = {};

    if (userRole === 'job_seeker') {
      // For job seekers, show stats for their applications
      whereCondition = { resume: { user_id: userId } };
    } else if (userRole === 'recruiter') {
      // For recruiters, show stats for applications to their jobs
      whereCondition = { job_post: { posted_by: userId } };
    }

    const stats = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.resume', 'resume')
      .leftJoin('application.job_post', 'job_post')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(whereCondition)
      .groupBy('application.status')
      .getRawMany();

    const totalApplications = stats.reduce(
      (sum, stat) => sum + parseInt(stat.count),
      0,
    );

    return {
      total: totalApplications,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
    };
  }

  // Keep the old method for backward compatibility
  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return await this.applicationRepository.find({
      where: { job_id: jobId },
      relations: ['resume', 'resume.user'],
      order: { applied_at: 'DESC' },
    });
  }

  /**
   * Get the recruiter/owner of a job for notification purposes
   */
  private async getJobRecruiter(jobId: number): Promise<User | null> {
    try {
      // For now, we'll find the first admin/recruiter user
      // In a real system, you'd have a job_owner or company_users relationship
      const recruiter = await this.userRepository.findOne({
        where: { role: UserRole.RECRUITER },
      });

      if (!recruiter) {
        // Fallback to admin
        return await this.userRepository.findOne({
          where: { role: UserRole.ADMIN },
        });
      }

      return recruiter;
    } catch (error) {
      console.error('Error finding job recruiter:', error);
      return null;
    }
  }

  /**
   * Convert application status to Vietnamese display name
   */
  private getStatusDisplayName(status: ApplicationStatus): string {
    const statusMap = {
      [ApplicationStatus.PENDING]: 'Đang chờ xử lý',
      [ApplicationStatus.REVIEWING]: 'Đang xem xét',
      [ApplicationStatus.INTERVIEWED]: 'Đã phỏng vấn',
      [ApplicationStatus.ACCEPTED]: 'Được chấp nhận',
      [ApplicationStatus.REJECTED]: 'Bị từ chối',
      [ApplicationStatus.WITHDRAWN]: 'Đã rút lại',
    };
    return statusMap[status] || status;
  }
}
