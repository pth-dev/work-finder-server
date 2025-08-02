import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

export class CompletePasswordResetDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Temporary reset token from verify-reset-otp',
  })
  @IsNotEmpty()
  @IsString()
  reset_token: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'New password (minimum 8 characters, must contain uppercase, lowercase, number, and symbol)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, {
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and symbol'
  })
  new_password: string;
}
