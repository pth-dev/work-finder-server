import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { ResumesService } from '../resumes/resumes.service';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly usersService: UsersService,
    private readonly resumesService: ResumesService,
  ) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'avatars');
          // ✅ Ensure directory exists asynchronously
          try {
            const fs = require('fs/promises');
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
          } catch (error) {
            cb(error, uploadPath);
          }
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = file.originalname.split('.').pop();
          const filename = `avatar_${timestamp}_${randomString}.${extension}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully',
    schema: {
      example: {
        message: 'Avatar uploaded successfully',
        filename: 'avatar_1234567890_abc123.jpg',
        url: 'http://localhost:3000/uploads/avatars/avatar_1234567890_abc123.jpg',
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.uploadService.validateFile(file, allowedTypes);

    // Update user avatar in database
    const avatarUrl = this.uploadService.getFileUrl(file.filename, 'avatar');
    await this.usersService.update(user.user_id, { avatar: avatarUrl });

    return {
      message: 'Avatar uploaded successfully',
      filename: file.filename,
      url: avatarUrl,
    };
  }

  @Post('resume')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'resumes');
          // ✅ Ensure directory exists asynchronously
          try {
            const fs = require('fs/promises');
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
          } catch (error) {
            cb(error, uploadPath);
          }
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = file.originalname.split('.').pop();
          const filename = `resume_${timestamp}_${randomString}.${extension}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Only PDF and Word documents are allowed'),
            false,
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @ApiOperation({ summary: 'Upload resume/CV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Resume file (PDF or Word document)',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Resume uploaded successfully',
    schema: {
      example: {
        message: 'Resume uploaded successfully',
        resume_id: 1,
        filename: 'resume_1234567890_abc123.pdf',
        url: 'http://localhost:3000/uploads/resumes/resume_1234567890_abc123.pdf',
      },
    },
  })
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    this.uploadService.validateFile(file, allowedTypes);

    // Save resume to database
    const resumeUrl = this.uploadService.getFileUrl(file.filename, 'resume');
    const resume = await this.resumesService.create({
      user_id: user.user_id,
      file_name: file.originalname,
      file_path: resumeUrl,
    });

    return {
      message: 'Resume uploaded successfully',
      resume_id: resume.resume_id,
      filename: file.filename,
      url: resumeUrl,
    };
  }
}
