import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity';
import { FollowedCompany } from './entities/followed-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company, FollowedCompany])],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService, TypeOrmModule],
})
export class CompaniesModule {}
