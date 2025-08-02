import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class JoinCompanyRequestDto {
  @ApiProperty({
    example: 1,
    description: 'Company ID to join',
  })
  @IsNotEmpty()
  @IsNumber()
  company_id: number;

  @ApiProperty({
    example: 'I would like to join as a recruiter',
    description: 'Optional message for join request',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}