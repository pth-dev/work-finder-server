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
    name: 'job_type',
    required: false,
    enum: JobType,
    description: 'Filter by job type',
  })
  @ApiQuery({
    name: 'company_id',
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
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'sort_by',
    required: false,
    enum: ['posted_date', 'salary', 'save_count'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sort_order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  async findAll(@Query() filters: JobSearchFilters) {
    return await this.jobsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job found', type: JobPost })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<JobPost> {
    return await this.jobsService.findOne(id);
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

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all jobs by company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({
    status: 200,
    description: 'Company jobs retrieved successfully',
  })
  async getJobsByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
  ): Promise<JobPost[]> {
    return await this.jobsService.getJobsByCompany(companyId);
  }
}
