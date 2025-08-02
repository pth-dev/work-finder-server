import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CompanySearchDto {
  @ApiProperty({
    example: 'TechCorp',
    description: 'Company name to search',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    example: 10,
    description: 'Maximum number of results',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({
    example: 'Technology',
    description: 'Filter by industry',
    required: false,
  })
  @IsOptional()
  @IsString()
  industry?: string;
}