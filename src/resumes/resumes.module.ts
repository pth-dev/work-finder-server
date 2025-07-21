import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume } from './entities/resume.entity';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Resume])],
  controllers: [ResumesController],
  providers: [ResumesService],
  exports: [ResumesService, TypeOrmModule],
})
export class ResumesModule {}
