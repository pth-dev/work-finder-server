import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { InterviewType } from '../../common/enums/interview-type.enum';
import { InterviewStatus } from './update-interview.dto';

export class InterviewFiltersDto {
  @ApiProperty({ description: 'Search in candidate name or job title', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by interview status', enum: InterviewStatus, required: false })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiProperty({ description: 'Filter by interview type', enum: InterviewType, required: false })
  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @ApiProperty({ description: 'Filter by job ID', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  jobId?: number;

  @ApiProperty({ description: 'Filter interviews from date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'Filter interviews to date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ 
    description: 'Sort by field', 
    enum: ['scheduled_at', 'created_at', 'updated_at', 'status'],
    default: 'scheduled_at',
    required: false 
  })
  @IsOptional()
  @IsString()
  sortBy?: 'scheduled_at' | 'created_at' | 'updated_at' | 'status' = 'scheduled_at';

  @ApiProperty({ 
    description: 'Sort order', 
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false 
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
