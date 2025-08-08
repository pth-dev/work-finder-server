import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsDateString, Min } from 'class-validator';
import { InterviewType } from '../../common/enums/interview-type.enum';

export class CreateInterviewDto {
  @ApiProperty({ description: 'Application ID' })
  @IsNotEmpty()
  @IsNumber()
  application_id: number;

  @ApiProperty({ description: 'Interview type', enum: InterviewType })
  @IsNotEmpty()
  @IsEnum(InterviewType)
  interview_type: InterviewType;

  @ApiProperty({ description: 'Scheduled interview time' })
  @IsNotEmpty()
  @IsDateString()
  scheduled_at: string;

  @ApiProperty({ description: 'Interview duration in minutes', default: 60 })
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
}
