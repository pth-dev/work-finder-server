import { ApiProperty } from '@nestjs/swagger';
import { CompanyUserRole, CompanyUserStatus } from '../../entities/company-user.entity';

export class CompanyMemberDto {
  @ApiProperty({
    example: 1,
    description: 'Membership ID',
  })
  id: number;

  @ApiProperty({
    example: 5,
    description: 'User ID',
  })
  user_id: number;

  @ApiProperty({
    example: 'admin',
    description: 'Role in company',
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
    description: 'When joined the company',
  })
  requested_at: Date;

  @ApiProperty({
    example: '2024-01-15T11:00:00Z',
    description: 'When approved',
    required: false,
  })
  approved_at?: Date;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    user_id: number;
    email: string;
    full_name?: string;
    avatar?: string;
  };
}