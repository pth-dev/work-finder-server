import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CompanyUserStatus } from '../entities/company-user.entity';

export class ApproveJoinRequestDto {
  @ApiProperty({
    example: 'approved',
    description: 'Approval status',
    enum: ['approved', 'rejected'],
  })
  @IsNotEmpty()
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}