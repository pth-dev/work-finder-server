import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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
      .leftJoinAndSelect('company.job_posts', 'job_posts');

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

    const [companies, total] = await queryBuilder.getManyAndCount();

    return {
      companies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { company_id: id },
      relations: ['job_posts'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
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
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
      relations: ['job_posts'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return {
      company: {
        company_id: company.company_id,
        company_name: company.company_name,
        description: company.description,
        industry: company.industry,
        website: company.website,
      },
      jobs: company.job_posts,
      total_jobs: company.job_posts.length,
    };
  }
}
