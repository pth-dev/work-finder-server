import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address to send password reset OTP',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
