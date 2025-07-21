import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ 
    example: 'Tech Corp Inc.', 
    description: 'Company name',
    maxLength: 200 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  company_name: string;

  @ApiProperty({ 
    example: 'Leading technology company specializing in software development', 
    description: 'Company description',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: 'https://example.com/logo.png', 
    description: 'Company logo/image URL',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company_image?: string;

  @ApiProperty({ 
    example: 'Technology', 
    description: 'Industry sector',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiProperty({ 
    example: 'https://techcorp.com', 
    description: 'Company website',
    required: false 
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  website?: string;
}
