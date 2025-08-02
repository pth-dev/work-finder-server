import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JobsService, JobSearchFilters } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobPost } from './entities/job.entity';
import { JobType } from '../common/enums/job-type.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiResponse({
    status: 201,
    description: 'Job created successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiBearerAuth()
  async create(@Body() createJobDto: CreateJobDto): Promise<JobPost> {
    return await this.jobsService.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in job title and description',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'jobType',
    required: false,
    enum: JobType,
    description: 'Filter by job type',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Filter by company',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['posted_date', 'salary', 'save_count'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by job category',
  })
  @ApiQuery({
    name: 'salary_min',
    required: false,
    type: Number,
    description: 'Minimum salary filter',
  })
  @ApiQuery({
    name: 'salary_max',
    required: false,
    type: Number,
    description: 'Maximum salary filter',
  })
  @ApiQuery({
    name: 'job_type',
    required: false,
    enum: JobType,
    description: 'Filter by job type (alternative to jobType)',
  })
  async findAll(@Query() query: any) {
    console.log('🔍 Backend received query params:', query);

    const filters: JobSearchFilters = {
      search: query.search,
      location: query.location,
      jobType: query.jobType || query.job_type, // Support both formats
      companyId: query.companyId ? parseInt(query.companyId) : undefined,
      category: query.category,
      salaryMin: query.salary_min ? parseInt(query.salary_min) : undefined,
      salaryMax: query.salary_max ? parseInt(query.salary_max) : undefined,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      sortBy: query.sortBy || 'posted_date',
      sortOrder: query.sortOrder || 'DESC',
    };

    console.log('🔄 Backend processed filters:', filters);
    return await this.jobsService.findAll(filters);
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Get a specific job by ID or slug' })
  @ApiParam({ name: 'identifier', description: 'Job ID (numeric) or slug (string)' })
  @ApiResponse({ status: 200, description: 'Job found', type: JobPost })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param('identifier') identifier: string): Promise<JobPost> {
    return await this.jobsService.findBySlugOrId(identifier);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a job posting' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBearerAuth()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<JobPost> {
    return await this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a job posting' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 204, description: 'Job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.jobsService.remove(id);
  }

  @Get('featured/:limit')
  @ApiOperation({ summary: 'Get featured jobs (highest save count)' })
  @ApiParam({ name: 'limit', description: 'Number of featured jobs to return' })
  @ApiResponse({
    status: 200,
    description: 'Featured jobs retrieved successfully',
  })
  async getFeaturedJobs(@Param('limit', ParseIntPipe) limit: number) {
    return await this.jobsService.getFeaturedJobs(limit);
  }
}
