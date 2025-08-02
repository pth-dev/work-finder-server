import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentpassword123',
    description: 'Current password',
  })
  @IsNotEmpty()
  @IsString()
  current_password: string;

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
