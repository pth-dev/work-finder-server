import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UsersModule } from '../users/users.module';
import { ResumesModule } from '../resumes/resumes.module';
import * as path from 'path';

@Module({
  imports: [
    MulterModule.register({
      dest: path.join(process.cwd(), 'uploads'),
    }),
    UsersModule,
    ResumesModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
