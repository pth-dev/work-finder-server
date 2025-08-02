import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code (6 digits)',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otp_code: string;
}
