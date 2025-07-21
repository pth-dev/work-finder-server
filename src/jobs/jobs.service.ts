import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { JobPost } from './entities/job.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '../common/enums/job-status.enum';
import { JobType } from '../common/enums/job-type.enum';

export interface JobSearchFilters {
  search?: string;
  location?: string;
  job_type?: JobType;
  company_id?: number;
  salary_min?: number;
  salary_max?: number;
  page?: number;
  limit?: number;
  sort_by?: 'posted_date' | 'salary' | 'save_count';
  sort_order?: 'ASC' | 'DESC';
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(JobPost)
    private readonly jobRepository: Repository<JobPost>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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

    return await this.jobRepository.save(job);
  }

  async findAll(filters: JobSearchFilters = {}): Promise<{
    jobs: JobPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      location,
      job_type,
      company_id,
      page = 1,
      limit = 10,
      sort_by = 'posted_date',
      sort_order = 'DESC',
    } = filters;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .where('job.status = :status', { status: JobStatus.ACTIVE });

    // Search in job title and description
    if (search) {
      queryBuilder.andWhere(
        '(job.job_title ILIKE :search OR job.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by location
    if (location) {
      queryBuilder.andWhere('job.location ILIKE :location', {
        location: `%${location}%`,
      });
    }

    // Filter by job type
    if (job_type) {
      queryBuilder.andWhere('job.job_type = :job_type', { job_type });
    }

    // Filter by company
    if (company_id) {
      queryBuilder.andWhere('job.company_id = :company_id', { company_id });
    }

    // Sorting
    queryBuilder.orderBy(`job.${sort_by}`, sort_order);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<JobPost> {
    const job = await this.jobRepository.findOne({
      where: { job_id: id },
      relations: ['company', 'applications', 'saved_by'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
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
}
