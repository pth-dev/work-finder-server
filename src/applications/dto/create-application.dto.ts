import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export class CreateApplicationDto {
  @ApiProperty({
    example: 1,
    description: 'Job ID to apply for',
  })
  @IsNotEmpty()
  @IsNumber()
  job_id: number;

  @ApiProperty({
    example: 1,
    description: 'Resume ID to use for application',
  })
  @IsNotEmpty()
  @IsNumber()
  resume_id: number;

  @ApiProperty({
    example: 1,
    description: 'User ID (automatically set from token)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({
    example: ApplicationStatus.PENDING,
    description: 'Application status',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiProperty({
    example: 'I am very interested in this position...',
    description: 'Cover letter for the application',
    required: false,
  })
  @IsOptional()
  cover_letter?: string;
}
