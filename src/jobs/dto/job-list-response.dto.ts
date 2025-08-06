import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../../common/enums/job-type.enum';
import { JobStatus } from '../../common/enums/job-status.enum';

export class CompanyBasicInfoDto {
  @ApiProperty()
  company_id: number;

  @ApiProperty()
  company_name: string;

  @ApiProperty({ required: false })
  company_image?: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty()
  is_verified: boolean;

  @ApiProperty({
    required: false,
    description: 'Whether current user follows this company',
  })
  is_followed?: boolean;
}

export class JobListItemDto {
  @ApiProperty()
  job_id: number;

  @ApiProperty()
  company_id: number;

  @ApiProperty()
  job_title: string;

  @ApiProperty({ required: false })
  description?: string; // Truncated to first 200 characters

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  salary_min?: number;

  @ApiProperty({ required: false })
  salary_max?: number;

  @ApiProperty({ required: false })
  salary?: string;

  @ApiProperty({ enum: JobType, required: false })
  job_type?: JobType;

  @ApiProperty({ enum: JobStatus })
  status: JobStatus;

  @ApiProperty()
  posted_date: Date;

  @ApiProperty()
  view_count: number;

  @ApiProperty()
  save_count: number;

  @ApiProperty()
  application_count: number;

  @ApiProperty({
    required: false,
    description: 'Whether current user has saved this job',
  })
  is_saved?: boolean;

  @ApiProperty({
    required: false,
    description: 'Whether current user has applied to this job',
  })
  is_applied?: boolean;

  @ApiProperty({ type: CompanyBasicInfoDto, required: false })
  company?: CompanyBasicInfoDto;
}

export class JobListResponseDto {
  @ApiProperty({ type: [JobListItemDto] })
  jobs: JobListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  // ✅ OPTIMIZED: Add cache metadata for client optimization
  @ApiProperty({ required: false })
  cached?: boolean;

  @ApiProperty({ required: false })
  cacheTimestamp?: string;
}
