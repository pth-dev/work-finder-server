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
  HttpCode,
  HttpStatus,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Resume } from './entities/resume.entity';

@ApiTags('resumes')
@Controller('resumes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resume record' })
  @ApiResponse({
    status: 201,
    description: 'Resume created successfully',
    type: Resume,
  })
  async create(@Body() createResumeDto: CreateResumeDto): Promise<Resume> {
    return await this.resumesService.create(createResumeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all resumes' })
  @ApiResponse({
    status: 200,
    description: 'Resumes retrieved successfully',
    type: [Resume],
  })
  async findAll(): Promise<Resume[]> {
    return await this.resumesService.findAll();
  }

  @Get('my-resumes')
  @ApiOperation({ summary: 'Get current user resumes' })
  @ApiResponse({
    status: 200,
    description: 'User resumes retrieved successfully',
    type: [Resume],
  })
  async getMyResumes(@CurrentUser() user: any): Promise<Resume[]> {
    return await this.resumesService.findByUser(user.user_id);
  }

  @Get(':id/view')
  @ApiOperation({ summary: 'View/serve resume file' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({ status: 200, description: 'Resume file served' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async viewResume(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const resume = await this.resumesService.findOne(id);

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Extract filename from file_path URL
    // file_path format: "http://localhost:3000/uploads/resumes/resume_1234567890_abc123.pdf"
    const filename = resume.file_path.split('/').pop();
    if (!filename) {
      throw new NotFoundException('Invalid file path');
    }
    const filePath = path.join(process.cwd(), 'uploads', 'resumes', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Resume file not found');
    }

    // Set appropriate headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${resume.file_name}"`,
    );

    // Send file
    res.sendFile(filePath);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific resume by ID' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({
    status: 200,
    description: 'Resume found',
    type: Resume,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Resume> {
    return await this.resumesService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download resume file' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({ status: 200, description: 'Resume file downloaded' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async downloadResume(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const resume = await this.resumesService.findOne(id);

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Extract filename from file_path URL
    const filename = resume.file_path.split('/').pop();
    if (!filename) {
      throw new NotFoundException('Invalid file path');
    }
    const filePath = path.join(process.cwd(), 'uploads', 'resumes', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Resume file not found');
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resume.file_name}"`,
    );

    // Send file
    res.sendFile(filePath);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resume' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({
    status: 200,
    description: 'Resume updated successfully',
    type: Resume,
  })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResumeDto: UpdateResumeDto,
  ): Promise<Resume> {
    return await this.resumesService.update(id, updateResumeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resume' })
  @ApiParam({ name: 'id', description: 'Resume ID' })
  @ApiResponse({ status: 204, description: 'Resume deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resume not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.resumesService.remove(id);
  }
}
