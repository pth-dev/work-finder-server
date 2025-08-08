import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Interview } from '../applications/entities/interview.entity';
import { Application } from '../applications/entities/application.entity';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { InterviewStatus } from '../applications/entities/interview.entity';
import { InterviewFiltersDto } from './dto/interview-filters.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(Interview)
    private interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    // Verify application exists
    const application = await this.applicationRepository.findOne({
      where: { application_id: createInterviewDto.application_id },
      relations: ['job_post', 'user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const interview = this.interviewRepository.create({
      ...createInterviewDto,
      scheduled_at: new Date(createInterviewDto.scheduled_at),
      duration_minutes: createInterviewDto.duration_minutes || 60,
    });

    return await this.interviewRepository.save(interview);
  }

  async findAll(filters: InterviewFiltersDto = {}) {
    const queryBuilder = this.createQueryBuilder();

    // Apply filters
    this.applyFilters(queryBuilder, filters);

    // Apply sorting
    const sortField = this.getSortField(filters.sortBy);
    queryBuilder.orderBy(
      sortField,
      filters.sortOrder?.toUpperCase() as 'ASC' | 'DESC',
    );

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [interviews, total] = await queryBuilder.getManyAndCount();

    // Map interviews to frontend expected format
    const mappedInterviews = interviews.map((interview) => ({
      interview_id: interview.interview_id,
      application_id: interview.application_id,
      candidate: {
        user_id: interview.application?.user?.user_id,
        full_name: interview.application?.user?.full_name,
        email: interview.application?.user?.email,
        phone: interview.application?.user?.phone,
        avatar_url: interview.application?.user?.avatar,
        location: interview.application?.user?.address,
      },
      job_post: {
        job_id: interview.application?.job_post?.job_id,
        job_title: interview.application?.job_post?.job_title,
        company: {
          company_id: interview.application?.job_post?.company?.company_id,
          company_name: interview.application?.job_post?.company?.company_name,
          company_image:
            interview.application?.job_post?.company?.company_image,
        },
      },
      interview_type: interview.interview_type,
      status: interview.status,
      scheduled_at: interview.scheduled_at,
      duration_minutes: interview.duration_minutes,
      location: interview.location,
      meeting_link: interview.meeting_link,
      notes: interview.notes,
      feedback: interview.feedback,
      rating: interview.rating,
      created_at: interview.created_at,
      updated_at: interview.updated_at,
    }));

    return {
      interviews: mappedInterviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { interview_id: id },
      relations: [
        'application',
        'application.user',
        'application.job_post',
        'application.job_post.company',
      ],
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async update(
    id: number,
    updateInterviewDto: UpdateInterviewDto,
  ): Promise<Interview> {
    const interview = await this.findOne(id);

    // Convert scheduled_at to Date if provided
    if (updateInterviewDto.scheduled_at) {
      updateInterviewDto.scheduled_at = new Date(
        updateInterviewDto.scheduled_at,
      ) as any;
    }

    Object.assign(interview, updateInterviewDto);
    return await this.interviewRepository.save(interview);
  }

  async updateStatus(id: number, status: InterviewStatus): Promise<Interview> {
    const interview = await this.findOne(id);
    interview.status = status;
    return await this.interviewRepository.save(interview);
  }

  async remove(id: number): Promise<void> {
    const interview = await this.findOne(id);
    await this.interviewRepository.remove(interview);
  }

  async getStats() {
    const stats = await this.interviewRepository
      .createQueryBuilder('interview')
      .select([
        'COUNT(*) as total',
        "COUNT(CASE WHEN interview.status = 'scheduled' THEN 1 END) as scheduled",
        "COUNT(CASE WHEN interview.status = 'completed' THEN 1 END) as completed",
        "COUNT(CASE WHEN interview.status = 'cancelled' THEN 1 END) as cancelled",
        "COUNT(CASE WHEN interview.status = 'rescheduled' THEN 1 END) as rescheduled",
        "COUNT(CASE WHEN interview.status = 'no_show' THEN 1 END) as no_show",
      ])
      .getRawOne();

    return {
      total: parseInt(stats.total),
      scheduled: parseInt(stats.scheduled),
      completed: parseInt(stats.completed),
      cancelled: parseInt(stats.cancelled),
      rescheduled: parseInt(stats.rescheduled),
      no_show: parseInt(stats.no_show),
    };
  }

  private createQueryBuilder(): SelectQueryBuilder<Interview> {
    return this.interviewRepository
      .createQueryBuilder('interview')
      .leftJoinAndSelect('interview.application', 'application')
      .leftJoinAndSelect('application.user', 'user')
      .leftJoinAndSelect('application.job_post', 'job_post')
      .leftJoinAndSelect('job_post.company', 'company');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Interview>,
    filters: InterviewFiltersDto,
  ) {
    if (filters.search) {
      queryBuilder.andWhere(
        '(user.full_name ILIKE :search OR job_post.job_title ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status) {
      queryBuilder.andWhere('interview.status = :status', {
        status: filters.status,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('interview.interview_type = :type', {
        type: filters.type,
      });
    }

    if (filters.jobId) {
      queryBuilder.andWhere('job_post.job_id = :jobId', {
        jobId: filters.jobId,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('interview.scheduled_at >= :dateFrom', {
        dateFrom: new Date(filters.dateFrom),
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('interview.scheduled_at <= :dateTo', {
        dateTo: new Date(filters.dateTo + ' 23:59:59'),
      });
    }
  }

  private getSortField(sortBy?: string): string {
    switch (sortBy) {
      case 'created_at':
        return 'interview.created_at';
      case 'updated_at':
        return 'interview.updated_at';
      case 'status':
        return 'interview.status';
      case 'scheduled_at':
      default:
        return 'interview.scheduled_at';
    }
  }
}
