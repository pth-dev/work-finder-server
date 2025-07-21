import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateResumeDto {
  @ApiProperty({
    example: 1,
    description: 'User ID who owns this resume',
  })
  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @ApiProperty({
    example: 'John_Doe_Resume.pdf',
    description: 'Original filename of the resume',
  })
  @IsNotEmpty()
  @IsString()
  file_name: string;

  @ApiProperty({
    example: 'http://localhost:3000/uploads/resumes/resume_1234567890_abc123.pdf',
    description: 'File path/URL of the uploaded resume',
  })
  @IsNotEmpty()
  @IsString()
  file_path: string;
}
