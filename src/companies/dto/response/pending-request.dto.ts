import { ApiProperty } from '@nestjs/swagger';

export class PendingRequestDto {
  @ApiProperty({
    example: 1,
    description: 'Membership request ID',
  })
  id: number;

  @ApiProperty({
    example: 5,
    description: 'User ID who requested',
  })
  user_id: number;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'When the request was made',
  })
  requested_at: Date;

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