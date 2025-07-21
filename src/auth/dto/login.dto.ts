import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
