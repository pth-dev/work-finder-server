import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AdminJobController } from './controllers/admin-job.controller';
import { AdminJobService } from './services/admin-job.service';
import { JobSchedulerService } from './services/job-scheduler.service';
import { JobPost } from './entities/job.entity';
import { SavedJob } from './entities/saved-job.entity';
import { Company } from '../companies/entities/company.entity';
import { Application } from '../applications/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { FollowedCompany } from '../companies/entities/followed-company.entity';
import { CompanyUser } from '../companies/entities/company-user.entity';
import { RedisCacheModule } from '../cache/cache.module'; // ✅ Import cache module
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobPost,
      SavedJob,
      Company,
      Application,
      User,
      FollowedCompany,
      CompanyUser,
    ]),
    RedisCacheModule, // ✅ Import cache module for CacheService
    NotificationsModule, // 🔔 Import notifications module
    ScheduleModule.forRoot(), // ✅ Import schedule module for cron jobs
  ],
  controllers: [JobsController, AdminJobController],
  providers: [JobsService, AdminJobService, JobSchedulerService],
  exports: [JobsService, AdminJobService, JobSchedulerService, TypeOrmModule],
})
export class JobsModule {}
