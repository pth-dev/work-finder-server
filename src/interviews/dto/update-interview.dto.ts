import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { InterviewType } from '../../common/enums/interview-type.enum';

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled',
}

export class UpdateInterviewDto {
  @ApiProperty({ description: 'Interview type', enum: InterviewType, required: false })
  @IsOptional()
  @IsEnum(InterviewType)
  interview_type?: InterviewType;

  @ApiProperty({ description: 'Interview status', enum: InterviewStatus, required: false })
  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @ApiProperty({ description: 'Scheduled interview time', required: false })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @ApiProperty({ description: 'Interview duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(15)
  duration_minutes?: number;

  @ApiProperty({ description: 'Interview location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Meeting link for online interviews', required: false })
  @IsOptional()
  @IsString()
  meeting_link?: string;

  @ApiProperty({ description: 'Interview notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Interview feedback', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ description: 'Interview rating (1-10)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rating?: number;
}
