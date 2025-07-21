import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { JobType } from '../../common/enums/job-type.enum';
import { JobStatus } from '../../common/enums/job-status.enum';

export class CreateJobDto {
  @ApiProperty({
    example: 1,
    description: 'Company ID that posts this job',
  })
  @IsNotEmpty()
  @IsNumber()
  company_id: number;

  @ApiProperty({
    example: 'Senior Software Engineer',
    description: 'Job title',
    maxLength: 200,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  job_title: string;

  @ApiProperty({
    example: 'We are looking for an experienced software engineer...',
    description: 'Job description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'San Francisco, CA',
    description: 'Job location',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiProperty({
    example: '$80,000 - $120,000',
    description: 'Salary range',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salary?: string;

  @ApiProperty({
    example: JobType.FULL_TIME,
    description: 'Job type',
    enum: JobType,
    required: false,
  })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ApiProperty({
    example: JobStatus.ACTIVE,
    description: 'Job status',
    enum: JobStatus,
    default: JobStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
