import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPost } from '../jobs/entities/job.entity';
import { JobStatus } from '../common/enums/job-status.enum';

export interface CategoryData {
  id: string;
  title: string;
  name: string;
  iconName: string;
  href: string;
}

export interface CategoryWithJobCount extends CategoryData {
  jobCount: number;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(JobPost)
    private readonly jobRepository: Repository<JobPost>,
  ) {}

  // Hardcoded categories data from frontend constants
  private readonly categories: CategoryData[] = [
    {
      id: 'accounting-finance',
      title: 'Accounting / Finance',
      name: 'Accounting / Finance',
      iconName: 'Calculator',
      href: '/categories/accounting-finance',
    },
    {
      id: 'marketing-sale',
      title: 'Marketing & Sale',
      name: 'Marketing & Sale',
      iconName: 'TrendingUp',
      href: '/categories/marketing-sale',
    },
    {
      id: 'design-multimedia',
      title: 'Design & Multimedia',
      name: 'Design & Multimedia',
      iconName: 'Palette',
      href: '/categories/design-multimedia',
    },
    {
      id: 'development',
      title: 'Development',
      name: 'Development',
      iconName: 'Code',
      href: '/categories/development',
    },
    {
      id: 'human-resource',
      title: 'Human Resource',
      name: 'Human Resource',
      iconName: 'Users',
      href: '/categories/human-resource',
    },
    {
      id: 'finance',
      title: 'Finance',
      name: 'Finance',
      iconName: 'Banknote',
      href: '/categories/finance',
    },
    {
      id: 'customer-service',
      title: 'Customer Service',
      name: 'Customer Service',
      iconName: 'Headphones',
      href: '/categories/customer-service',
    },
    {
      id: 'health-care',
      title: 'Health and Care',
      name: 'Health and Care',
      iconName: 'Heart',
      href: '/categories/health-care',
    },
    {
      id: 'automotive-jobs',
      title: 'Automotive Jobs',
      name: 'Automotive Jobs',
      iconName: 'Car',
      href: '/categories/automotive-jobs',
    },
  ];

  /**
   * Get all categories with job counts
   */
  async findAll(): Promise<CategoryWithJobCount[]> {
    const categoriesWithCounts = await Promise.all(
      this.categories.map(async (category) => {
        const jobCount = await this.getJobCountForCategory(category.id);
        return {
          ...category,
          jobCount,
        };
      }),
    );

    return categoriesWithCounts;
  }

  /**
   * Get job count for a specific category
   */
  async getJobCountForCategory(categoryId: string): Promise<number> {
    // First try to get count by exact category match
    const exactCount = await this.jobRepository
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.ACTIVE })
      .andWhere('job.category = :category', { category: categoryId })
      .getCount();

    // If no exact matches, fall back to keyword matching
    if (exactCount > 0) {
      return exactCount;
    }

    const categoryKeywords = this.getCategoryKeywords(categoryId);

    if (categoryKeywords.length === 0) {
      return 0;
    }

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.ACTIVE });

    // Search for category keywords in job title and description
    const conditions = categoryKeywords.map((keyword, index) => {
      const paramName = `keyword${index}`;
      queryBuilder.setParameter(paramName, `%${keyword}%`);
      return `(job.job_title ILIKE :${paramName} OR job.description ILIKE :${paramName})`;
    });

    queryBuilder.andWhere(`(${conditions.join(' OR ')})`);

    return await queryBuilder.getCount();
  }

  /**
   * Get category by ID
   */
  findOne(id: string): CategoryData | undefined {
    return this.categories.find((category) => category.id === id);
  }

  /**
   * Get category keywords for job matching
   */
  private getCategoryKeywords(categoryId: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'accounting-finance': [
        'accounting',
        'finance',
        'financial',
        'accountant',
        'bookkeeper',
        'audit',
      ],
      'marketing-sale': [
        'marketing',
        'sales',
        'promotion',
        'advertising',
        'digital marketing',
        'social media',
      ],
      'design-multimedia': [
        'design',
        'graphic',
        'ui',
        'ux',
        'creative',
        'multimedia',
        'video',
        'animation',
      ],
      development: [
        'developer',
        'programming',
        'software',
        'web development',
        'mobile',
        'frontend',
        'backend',
        'fullstack',
      ],
      'human-resource': [
        'hr',
        'human resource',
        'recruitment',
        'talent',
        'people',
        'recruiter',
      ],
      finance: [
        'finance',
        'investment',
        'banking',
        'financial analyst',
        'portfolio',
      ],
      'customer-service': [
        'customer service',
        'support',
        'help desk',
        'customer care',
        'call center',
      ],
      'health-care': [
        'healthcare',
        'medical',
        'nurse',
        'doctor',
        'hospital',
        'clinic',
        'health',
      ],
      'automotive-jobs': [
        'automotive',
        'car',
        'vehicle',
        'mechanic',
        'auto',
        'transportation',
      ],
    };

    return keywordMap[categoryId] || [];
  }
}
