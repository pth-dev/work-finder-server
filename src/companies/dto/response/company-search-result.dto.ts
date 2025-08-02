import { ApiProperty } from '@nestjs/swagger';

export class CompanySearchResultDto {
  @ApiProperty({
    example: 1,
    description: 'Company ID',
  })
  company_id: number;

  @ApiProperty({
    example: 'TechCorp Solutions',
    description: 'Company name',
  })
  company_name: string;

  @ApiProperty({
    example: 'Leading software development company',
    description: 'Company description',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Industry',
    required: false,
  })
  industry?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'Company logo URL',
    required: false,
  })
  company_image?: string;

  @ApiProperty({
    example: 'San Francisco, CA',
    description: 'Company location',
    required: false,
  })
  location?: string;

  @ApiProperty({
    example: '51-200',
    description: 'Company size',
    required: false,
  })
  company_size?: string;

  @ApiProperty({
    example: true,
    description: 'Whether company is verified',
  })
  is_verified: boolean;

  @ApiProperty({
    example: 25,
    description: 'Number of employees',
  })
  member_count: number;
}