import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobPost } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { Company } from '../companies/entities/company.entity';
import { RedisCacheModule } from '../cache/cache.module'; // ✅ Import cache module

@Module({
  imports: [
    TypeOrmModule.forFeature([JobPost, SavedJob, Company]),
    RedisCacheModule, // ✅ Import cache module for CacheService
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService, TypeOrmModule],
})
export class JobsModule {}
