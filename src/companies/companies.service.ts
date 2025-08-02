import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly cacheService: CacheService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    return await this.companyRepository.save(company);
  }

  async findAll(
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      industry?: string;
    } = {},
  ): Promise<{
    companies: Company[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, industry } = filters;

    const queryBuilder = this.companyRepository
      .createQueryBuilder('company')
      // ✅ OPTIMIZED: Remove job_posts join to reduce payload size
      // Add job count as computed field instead
      .leftJoin('company.job_posts', 'job_posts')
      .addSelect('COUNT(job_posts.job_id)', 'job_count')
      .groupBy('company.company_id');

    // Search in company name and description
    if (search) {
      queryBuilder.andWhere(
        '(company.company_name ILIKE :search OR company.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by industry
    if (industry) {
      queryBuilder.andWhere('company.industry ILIKE :industry', {
        industry: `%${industry}%`,
      });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by company name
    queryBuilder.orderBy('company.company_name', 'ASC');

    const results = await queryBuilder.getRawAndEntities();
    const total = results.entities.length;

    // ✅ OPTIMIZED: Add job_count to each company without full job data
    const companies = results.entities.map((company, index) => ({
      ...company,
      job_count: parseInt(results.raw[index]?.job_count) || 0,
    }));

    return {
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Company> {
    // ✅ OPTIMIZED: Add caching for company data
    const cacheKey = `company:${id}`;
    const cached = await this.cacheService.get<Company>(cacheKey);
    if (cached) {
      return cached;
    }

    const company = await this.companyRepository.findOne({
      where: { company_id: id },
      // ✅ OPTIMIZED: Remove job_posts relation to avoid over-fetching
      // Use separate endpoint /companies/:id/jobs for job data
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    // ✅ OPTIMIZED: Cache company data for 10 minutes
    await this.cacheService.set(cacheKey, company, 600);

    return company;
  }

  async findBySlugOrId(identifier: string): Promise<Company> {
    const numericId = parseInt(identifier);
    if (!isNaN(numericId)) {
      return this.findOne(numericId);
    }

    const slugMatch = identifier.match(/-(\d+)$/);
    if (slugMatch) {
      const companyId = parseInt(slugMatch[1]);
      return this.findOne(companyId);
    }

    throw new NotFoundException(`Company not found: ${identifier}`);
  }

  generateCompanySlug(company: Company): string {
    const name = company.company_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    return `${name}-${company.company_id}`;
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOne(id);
    Object.assign(company, updateCompanyDto);
    return await this.companyRepository.save(company);
  }

  async remove(id: number): Promise<void> {
    const company = await this.findOne(id);
    await this.companyRepository.remove(company);
  }

  async getCompanyJobs(companyId: number) {
    // ✅ OPTIMIZED: Use query builder for better performance
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
      // No relations - fetch company data only
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const companyWithJobs = await this.companyRepository
      .createQueryBuilder('company')
      .leftJoinAndSelect('company.job_posts', 'job_posts')
      .select([
        'company.company_id',
        'company.company_name',
        'job_posts.job_id',
        'job_posts.job_title',
        'job_posts.location',
        'job_posts.salary',
        'job_posts.job_type',
        'job_posts.status',
        'job_posts.posted_date',
        'job_posts.view_count',
        'job_posts.save_count',
        'job_posts.application_count',
        'job_posts.description',
      ])
      .where('company.company_id = :companyId', { companyId })
      .andWhere('job_posts.status = :status', { status: 'active' })
      .orderBy('job_posts.posted_date', 'DESC')
      .getOne();

    return {
      company: {
        company_id: company.company_id,
        company_name: company.company_name,
        description: company.description,
        industry: company.industry,
        website: company.website,
      },
      jobs: companyWithJobs?.job_posts || [],
      total_jobs: companyWithJobs?.job_posts?.length || 0,
    };
  }
}
