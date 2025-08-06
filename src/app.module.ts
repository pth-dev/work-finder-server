import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { RedisCacheModule } from './cache/cache.module';
import { CacheService } from './cache/cache.service';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';

import { ResumesModule } from './resumes/resumes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get('THROTTLE_TTL', 60000),
            limit: configService.get('THROTTLE_LIMIT', 100),
          },
          {
            name: 'auth',
            ttl: configService.get('AUTH_THROTTLE_TTL', 900000), // 15 minutes for auth
            limit: configService.get('AUTH_THROTTLE_LIMIT', 5), // 5 attempts per 15 min
          },
        ],
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    RedisCacheModule,
    UsersModule,
    CompaniesModule,
    JobsModule,
    ApplicationsModule,

    ResumesModule,
    NotificationsModule,
    AuthModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CacheService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
