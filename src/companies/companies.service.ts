import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { FollowedCompany } from './entities/followed-company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(FollowedCompany)
    private readonly followedCompanyRepository: Repository<FollowedCompany>,
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

  /**
   * Find all companies with user-specific data (is_followed status)
   */
  async findAllWithUserData(
    filters: {
      page?: number;
      limit?: number;
      search?: string;
      industry?: string;
    } = {},
    userId?: number,
  ): Promise<{
    companies: (Company & { is_followed?: boolean })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Get base companies data
    const baseResult = await this.findAll(filters);

    if (!userId) {
      return baseResult;
    }

    // Get user's followed companies
    const followedCompanyIds = await this.followedCompanyRepository
      .createQueryBuilder('followed_company')
      .select('followed_company.company_id')
      .where('followed_company.user_id = :userId', { userId })
      .getRawMany()
      .then((results) => results.map((r) => r.followed_company_company_id));

    console.log(
      '💼 Followed company IDs for user',
      userId,
      ':',
      followedCompanyIds,
    );

    // Add is_followed status to each company
    const companiesWithUserData = baseResult.companies.map((company) => ({
      ...company,
      is_followed: followedCompanyIds.includes(company.company_id),
    }));

    return {
      ...baseResult,
      companies: companiesWithUserData,
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

  /**
   * Find company by slug or ID with user-specific data (is_followed status)
   */
  async findBySlugOrIdWithUserData(
    identifier: string,
    userId?: number,
  ): Promise<Company & { is_followed?: boolean }> {
    const company = await this.findBySlugOrId(identifier);

    if (!userId) {
      return company;
    }

    // Check if user follows this company
    const isFollowed = await this.isCompanyFollowed(userId, company.company_id);

    return {
      ...company,
      is_followed: isFollowed,
    };
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

  // ===== COMPANY FOLLOW/UNFOLLOW FUNCTIONALITY =====

  async followCompany(
    userId: number,
    companyId: number,
  ): Promise<{
    message: string;
    is_followed: boolean;
    follower_count: number;
  }> {
    // 1. Verify company exists
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // 2. Check if already following
    const existingFollow = await this.followedCompanyRepository.findOne({
      where: { user_id: userId, company_id: companyId },
    });

    if (existingFollow) {
      // Get current follower count
      const followerCount = await this.getFollowerCount(companyId);
      return {
        message: 'Company already followed',
        is_followed: true,
        follower_count: followerCount,
      };
    }

    // 3. Create follow record
    const followedCompany = this.followedCompanyRepository.create({
      user_id: userId,
      company_id: companyId,
    });

    await this.followedCompanyRepository.save(followedCompany);

    // 4. Get updated follower count
    const followerCount = await this.getFollowerCount(companyId);

    // 5. Invalidate cache
    await this.cacheService.invalidateCompanyCache(companyId);

    return {
      message: 'Company followed successfully',
      is_followed: true,
      follower_count: followerCount,
    };
  }

  async unfollowCompany(
    userId: number,
    companyId: number,
  ): Promise<{
    message: string;
    is_followed: boolean;
    follower_count: number;
  }> {
    // 1. Find follow record
    const followedCompany = await this.followedCompanyRepository.findOne({
      where: { user_id: userId, company_id: companyId },
    });

    if (!followedCompany) {
      throw new NotFoundException('Company not found in followed companies');
    }

    // 2. Remove follow record
    await this.followedCompanyRepository.remove(followedCompany);

    // 3. Get updated follower count
    const followerCount = await this.getFollowerCount(companyId);

    // 4. Invalidate cache
    await this.cacheService.invalidateCompanyCache(companyId);

    return {
      message: 'Company unfollowed successfully',
      is_followed: false,
      follower_count: followerCount,
    };
  }

  async isCompanyFollowed(userId: number, companyId: number): Promise<boolean> {
    const followedCompany = await this.followedCompanyRepository.findOne({
      where: { user_id: userId, company_id: companyId },
    });
    return !!followedCompany;
  }

  async getFollowerCount(companyId: number): Promise<number> {
    return await this.followedCompanyRepository.count({
      where: { company_id: companyId },
    });
  }

  async getFollowedCompanies(
    userId: number,
    options: { page?: number; limit?: number } = {},
  ): Promise<{
    companies: Company[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // ✅ OPTIMIZED: Use query builder for better performance
    const queryBuilder = this.followedCompanyRepository
      .createQueryBuilder('followed_company')
      .leftJoinAndSelect('followed_company.company', 'company')
      .where('followed_company.user_id = :userId', { userId })
      .orderBy('followed_company.followed_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [followedCompanies, total] = await queryBuilder.getManyAndCount();
    const companies = followedCompanies.map(
      (followedCompany) => followedCompany.company,
    );

    return {
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
