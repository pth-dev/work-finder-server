import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  Length,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code received via email',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp_code: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password (minimum 6 characters)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  new_password: string;
}
