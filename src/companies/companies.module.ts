import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompanyUserService } from './company-user.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity';
import { CompanyUser } from './entities/company-user.entity';
import { FollowedCompany } from './entities/followed-company.entity';
import { User } from '../users/entities/user.entity';
import { RedisCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyUser, FollowedCompany, User]),
    RedisCacheModule, // ✅ Import RedisCacheModule to provide CacheService
  ],
  providers: [CompaniesService, CompanyUserService],
  controllers: [CompaniesController],
  exports: [CompaniesService, CompanyUserService, TypeOrmModule],
})
export class CompaniesModule {}
