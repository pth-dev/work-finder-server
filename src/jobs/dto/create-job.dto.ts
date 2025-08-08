import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
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
    example: 'Bachelor degree in Computer Science, 3+ years experience...',
    description: 'Job requirements',
    required: false,
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiProperty({
    example: 'Health insurance, flexible working hours, remote work...',
    description: 'Job benefits',
    required: false,
  })
  @IsOptional()
  @IsString()
  benefits?: string;

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
    example: 80000,
    description: 'Minimum salary',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary_min?: number;

  @ApiProperty({
    example: 120000,
    description: 'Maximum salary',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary_max?: number;

  @ApiProperty({
    example: '$80,000 - $120,000',
    description: 'Salary range text',
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
    example: JobStatus.PENDING,
    description: 'Job status',
    enum: JobStatus,
    default: JobStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Job expiration date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
