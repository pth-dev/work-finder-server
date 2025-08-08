import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApplicationStatus } from '../common/enums/application-status.enum';

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Apply for a job' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: Application,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Already applied for this job' })
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @CurrentUser() user: any,
  ): Promise<Application> {
    // Add user_id to the DTO
    const applicationData = {
      job_id: createApplicationDto.job_id,
      resume_id: createApplicationDto.resume_id,
      status: createApplicationDto.status,
      user_id: user.user_id,
    };
    return await this.applicationsService.create(applicationData);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get applications with filtering (Recruiter/Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ApplicationStatus,
    description: 'Filter by application status',
  })
  @ApiQuery({
    name: 'jobId',
    required: false,
    type: Number,
    description: 'Filter by job ID',
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
    name: 'search',
    required: false,
    type: String,
    description: 'Search by candidate name or email',
  })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: ApplicationStatus,
    @Query('jobId') jobId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return await this.applicationsService.findAll({
      status,
      jobId: jobId,
      page,
      limit,
      search,
      userId: user.role === UserRole.JOB_SEEKER ? user.user_id : undefined,
      recruiterId: user.role === UserRole.RECRUITER ? user.user_id : undefined,
    });
  }

  @Get('jobs/:jobId/applications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get applications for a specific job (Recruiter only)',
  })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Job not found or unauthorized' })
  async getJobApplications(
    @Param('jobId', ParseIntPipe) jobId: number,
    @CurrentUser() user: any,
    @Query('status') status?: ApplicationStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.applicationsService.findByJob(jobId, user.user_id, {
      status,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application found',
    type: Application,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Application> {
    return await this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application status' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
    type: Application,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition or unauthorized',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @CurrentUser() user: any,
  ): Promise<Application> {
    return await this.applicationsService.update(
      id,
      updateApplicationDto,
      user.user_id,
      user.role,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Withdraw application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({
    status: 200,
    description: 'Application withdrawn successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  @ApiResponse({
    status: 403,
    description: 'Can only withdraw your own application',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ): Promise<Application> {
    // Withdraw application by setting status to WITHDRAWN
    return await this.applicationsService.update(
      id,
      { status: ApplicationStatus.WITHDRAWN },
      user.user_id,
      user.role,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@CurrentUser() user: any) {
    return await this.applicationsService.getApplicationStats(
      user.user_id,
      user.role,
    );
  }
}
