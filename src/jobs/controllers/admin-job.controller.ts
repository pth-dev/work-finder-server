import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { AdminJobService } from '../services/admin-job.service';
import { JobPost } from '../entities/job.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

class RejectJobDto {
  @ApiProperty({
    example: 'Job description is not clear enough',
    description: 'Optional reason for rejection',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('admin/jobs')
@Controller('admin/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminJobController {
  constructor(private readonly adminJobService: AdminJobService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending jobs for admin review' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Pending jobs retrieved successfully',
    schema: {
      example: {
        jobs: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    },
  })
  async getPendingJobs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return await this.adminJobService.getPendingJobs(page, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get job statistics for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Job statistics retrieved successfully',
    schema: {
      example: {
        total: 100,
        byStatus: {
          draft: 10,
          pending: 5,
          active: 70,
          inactive: 10,
          closed: 3,
          rejected: 2,
        },
        pendingReview: 5,
        activeJobs: 70,
        expiringSoon: 8,
      },
    },
  })
  async getJobStatistics() {
    return await this.adminJobService.getJobStatistics();
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a job (DRAFT/PENDING → ACTIVE)' })
  @ApiParam({ name: 'id', description: 'Job ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Job approved successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  async approveJob(
    @Param('id', ParseIntPipe) jobId: number,
    @CurrentUser() user: any,
  ): Promise<JobPost> {
    return await this.adminJobService.approveJob(jobId, user.user_id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a job (DRAFT/PENDING → REJECTED)' })
  @ApiParam({ name: 'id', description: 'Job ID', type: Number })
  @ApiBody({
    type: RejectJobDto,
    required: false,
    description: 'Optional rejection reason',
  })
  @ApiResponse({
    status: 200,
    description: 'Job rejected successfully',
    type: JobPost,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  async rejectJob(
    @Param('id', ParseIntPipe) jobId: number,
    @CurrentUser() user: any,
    @Body() rejectDto?: RejectJobDto,
  ): Promise<JobPost> {
    return await this.adminJobService.rejectJob(
      jobId,
      user.user_id,
      rejectDto?.reason,
    );
  }
}
