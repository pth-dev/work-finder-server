import { ApiProperty } from '@nestjs/swagger';
import { CompanyUserRole, CompanyUserStatus } from '../../entities/company-user.entity';

export class CompanyUserResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Membership ID',
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'User ID',
  })
  user_id: number;

  @ApiProperty({
    example: 1,
    description: 'Company ID',
  })
  company_id: number;

  @ApiProperty({
    example: 'owner',
    description: 'User role in company',
    enum: CompanyUserRole,
  })
  role: CompanyUserRole;

  @ApiProperty({
    example: 'approved',
    description: 'Membership status',
    enum: CompanyUserStatus,
  })
  status: CompanyUserStatus;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'When the request was made',
  })
  requested_at: Date;

  @ApiProperty({
    example: '2024-01-15T11:00:00Z',
    description: 'When the request was approved',
    required: false,
  })
  approved_at?: Date;

  @ApiProperty({
    example: 2,
    description: 'ID of user who approved',
    required: false,
  })
  approved_by?: number;

  @ApiProperty({
    description: 'Company information',
    type: 'object',
    properties: {
      company_id: { type: 'number' },
      company_name: { type: 'string' },
      industry: { type: 'string', nullable: true },
      company_image: { type: 'string', nullable: true },
      is_verified: { type: 'boolean' },
    },
  })
  company: {
    company_id: number;
    company_name: string;
    industry?: string;
    company_image?: string;
    is_verified: boolean;
  };
}