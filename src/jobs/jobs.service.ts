import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPost } from './entities/job.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '../common/enums/job-status.enum';
import { JobType } from '../common/enums/job-type.enum';
import { CacheService } from '../cache/cache.service';

export interface JobSearchFilters {
  search?: string;
  location?: string;
  jobType?: JobType;
  companyId?: number;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
  sortBy?: 'posted_date' | 'salary' | 'save_count';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobPost)
    private readonly jobRepository: Repository<JobPost>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private cacheService: CacheService, // ✅ Added cache service
  ) {}

  async create(createJobDto: CreateJobDto): Promise<JobPost> {
    // Verify company exists
    const company = await this.companyRepository.findOne({
      where: { company_id: createJobDto.company_id },
    });

    if (!company) {
      throw new BadRequestException(
        `Company with ID ${createJobDto.company_id} not found`,
      );
    }

    const job = this.jobRepository.create({
      ...createJobDto,
      status: createJobDto.status || JobStatus.ACTIVE,
    });

    const savedJob = await this.jobRepository.save(job);

    // ✅ OPTIMIZED: Invalidate cache when new job is created
    await this.cacheService.invalidateJobCache(savedJob.job_id);
    await this.cacheService.invalidateCompanyCache(savedJob.company_id);

    return savedJob;
  }

  async findAll(filters: JobSearchFilters = {}): Promise<{
    jobs: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // ✅ OPTIMIZED: Check cache first
    const cacheKey = this.cacheService.generateJobListKey(filters);
    const cachedResult = await this.cacheService.get<{
      jobs: JobPost[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const {
      search,
      location,
      jobType,
      companyId,
      category,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 20, // Increased default limit to reduce request volume
      sortBy = 'posted_date',
      sortOrder = 'DESC',
    } = filters;

    console.log('🔍 JobsService.findAll filters:', filters);

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .select([
        'job.job_id',
        'job.company_id',
        'job.job_title',
        'job.location',
        'job.category',
        'job.salary_min',
        'job.salary_max',
        'job.salary',
        'job.job_type',
        'job.status',
        'job.posted_date',
        'job.view_count',
        'job.save_count',
        'job.application_count',
        // ✅ OPTIMIZED: Get full description, truncate in application layer
        'job.description',
      ])
      .leftJoin('job.company', 'company')
      .addSelect([
        'company.company_id',
        'company.company_name',
        'company.company_image',
        'company.location',
        'company.is_verified',
      ])
      .where('job.status = :status', { status: JobStatus.ACTIVE })
      .andWhere('(job.expires_at IS NULL OR job.expires_at > :now)', {
        now: new Date(),
      });

    // ✅ OPTIMIZED: Use search_vector index for better performance
    if (search) {
      queryBuilder.andWhere('job.search_vector @@ plainto_tsquery(:search)', {
        search,
      });
    }

    // Filter by location
    if (location) {
      queryBuilder.andWhere('job.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    // Filter by job type
    if (jobType) {
      queryBuilder.andWhere('job.job_type = :jobType', { jobType });
    }

    // Filter by company
    if (companyId) {
      queryBuilder.andWhere('job.company_id = :companyId', { companyId });
    }

    // Filter by category
    if (category) {
      queryBuilder.andWhere('job.category ILIKE :category', {
        category: `%${category}%`,
      });
    }

    // Filter by salary range
    if (salaryMin) {
      queryBuilder.andWhere('job.salary_min >= :salaryMin', { salaryMin });
    }
    if (salaryMax) {
      queryBuilder.andWhere('job.salary_max <= :salaryMax', { salaryMax });
    }

    // Sorting with fallback for better performance
    const sortMapping = {
      posted_date: 'job.posted_date',
      salary: 'job.salary_max',
      save_count: 'job.save_count',
    };

    const sortField = sortMapping[sortBy] || 'job.posted_date';
    queryBuilder.orderBy(sortField, sortOrder);

    // Add secondary sort by posted_date for consistent pagination
    if (sortBy !== 'posted_date') {
      queryBuilder.addOrderBy('job.posted_date', 'DESC');
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const result = {
      jobs: jobs.map((job) => ({
        ...job,
        // ✅ OPTIMIZED: Truncate description in application layer
        description: job.description
          ? job.description.substring(0, 200) +
            (job.description.length > 200 ? '...' : '')
          : undefined,
      })),
      total,
      page,
      limit,
      totalPages,
    };

    // ✅ OPTIMIZED: Cache the result
    await this.cacheService.set(cacheKey, result, 300); // 5 minutes TTL

    return result;
  }

  async findOne(id: number): Promise<JobPost> {
    const job = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoin('job.applications', 'applications')
      .addSelect([
        'applications.application_id',
        'applications.status',
        'applications.applied_at',
      ])
      .leftJoin('applications.user', 'applicant')
      .addSelect([
        'applicant.user_id',
        'applicant.full_name',
        'applicant.email',
      ])
      .where('job.job_id = :id', { id })
      .getOne();

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async findBySlugOrId(identifier: string): Promise<JobPost> {
    // Try parse as numeric ID first
    const numericId = parseInt(identifier);
    if (!isNaN(numericId)) {
      return this.findOne(numericId);
    }

    // Extract ID from slug format: "product-designer-invision-123"
    const slugMatch = identifier.match(/-(\d+)$/);
    if (slugMatch) {
      const jobId = parseInt(slugMatch[1]);
      return this.findOne(jobId);
    }

    throw new NotFoundException(`Job not found: ${identifier}`);
  }

  generateJobSlug(job: JobPost): string {
    const title = job.job_title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 40);
    
    const company = job.company?.company_name
      ?.toLowerCase()
      ?.replace(/[^a-z0-9\s-]/g, '')
      ?.replace(/\s+/g, '-')
      ?.substring(0, 20) || 'company';
    
    return `${title}-${company}-${job.job_id}`;
  }


  async update(id: number, updateJobDto: UpdateJobDto): Promise<JobPost> {
    const job = await this.findOne(id);

    // If company_id is being updated, verify the new company exists
    if (updateJobDto.company_id && updateJobDto.company_id !== job.company_id) {
      const company = await this.companyRepository.findOne({
        where: { company_id: updateJobDto.company_id },
      });

      if (!company) {
        throw new BadRequestException(
          `Company with ID ${updateJobDto.company_id} not found`,
        );
      }
    }

    Object.assign(job, updateJobDto);
    return await this.jobRepository.save(job);
  }

  async remove(id: number): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
  }

  async getJobsByCompany(companyId: number): Promise<JobPost[]> {
    return await this.jobRepository.find({
      where: { company_id: companyId },
      relations: ['company'],
      order: { posted_date: 'DESC' },
    });
  }

  async incrementSaveCount(jobId: number): Promise<void> {
    await this.jobRepository.increment({ job_id: jobId }, 'save_count', 1);
  }

  async decrementSaveCount(jobId: number): Promise<void> {
    await this.jobRepository.decrement({ job_id: jobId }, 'save_count', 1);
  }

  // Optimized method for featured jobs with caching
  async getFeaturedJobs(limit: number = 6): Promise<{
    jobs: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Simply return latest jobs
    return this.findAll({
      limit,
      sortBy: 'posted_date',
      sortOrder: 'DESC',
      page: 1,
    });
  }

  // Optimized method for company jobs with selective loading
  async getJobsByCompanyOptimized(
    companyId: number,
    limit?: number,
  ): Promise<{
    jobs: JobPost[];
    total: number;
  }> {
    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .select([
        'job.job_id',
        'job.company_id',
        'job.job_title',
        'job.location',
        'job.salary_min',
        'job.salary_max',
        'job.salary',
        'job.job_type',
        'job.status',
        'job.posted_date',
        'job.view_count',
        'job.save_count',
        'job.application_count',
        'SUBSTRING(job.description, 1, 150) as description_excerpt',
      ])
      .where('job.company_id = :companyId', { companyId })
      .andWhere('job.status = :status', { status: JobStatus.ACTIVE })
      .orderBy('job.posted_date', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return {
      jobs: jobs.map((job) => ({
        ...job,
        description: job['description_excerpt'],
      })),
      total,
    };
  }
}
