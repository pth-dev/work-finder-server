import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobPost } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, SavedJob, Company])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService, TypeOrmModule],
})
export class JobsModule {}
