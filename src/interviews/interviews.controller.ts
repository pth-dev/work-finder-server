import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { InterviewStatus } from '../applications/entities/interview.entity';
import { InterviewFiltersDto } from './dto/interview-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('interviews')
@Controller('interviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RECRUITER, UserRole.ADMIN)
@ApiBearerAuth()
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interview' })
  @ApiResponse({ status: 201, description: 'Interview created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async create(
    @Body() createInterviewDto: CreateInterviewDto,
    @CurrentUser() user: any,
  ) {
    return await this.interviewsService.create(createInterviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all interviews with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Interviews retrieved successfully',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in candidate name or job title',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: InterviewStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by interview type',
  })
  @ApiQuery({
    name: 'jobId',
    required: false,
    type: Number,
    description: 'Filter by job ID',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Filter from date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Filter to date (YYYY-MM-DD)',
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
    description: 'Sort by field (default: scheduled_at)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (default: desc)',
  })
  async findAll(@Query() filters: InterviewFiltersDto) {
    return await this.interviewsService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get interview statistics' })
  @ApiResponse({
    status: 200,
    description: 'Interview statistics retrieved successfully',
  })
  async getStats() {
    return await this.interviewsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific interview by ID' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Interview found' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.interviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an interview' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Interview updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInterviewDto: UpdateInterviewDto,
  ) {
    return await this.interviewsService.update(id, updateInterviewDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update interview status' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({
    status: 200,
    description: 'Interview status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: InterviewStatus,
  ) {
    return await this.interviewsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an interview' })
  @ApiParam({ name: 'id', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'Interview deleted successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.interviewsService.remove(id);
    return { message: 'Interview deleted successfully' };
  }
}
