import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
  IsEnum,
  Matches,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address (required)',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password (minimum 6 characters, maximum 50 characters)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name (maximum 100 characters)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  full_name?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number (maximum 20 characters)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  @Matches(/^[\+]?[\d\s\-\(\)]+$/, { message: 'Phone number must contain only digits, spaces, dashes, parentheses, and optional plus sign' })
  phone?: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: UserRole.JOB_SEEKER,
    description: 'User role',
    enum: UserRole,
    default: UserRole.JOB_SEEKER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
