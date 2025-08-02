import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from './company.entity';

export enum CompanyUserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum CompanyUserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('company_users')
@Unique(['user_id']) // Ensure 1 user chỉ thuộc 1 company
export class CompanyUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'company_id' })
  company_id: number;

  @Column({
    name: 'role',
    type: 'enum',
    enum: CompanyUserRole,
    default: CompanyUserRole.MEMBER,
  })
  role: CompanyUserRole;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CompanyUserStatus,
    default: CompanyUserStatus.PENDING,
  })
  status: CompanyUserStatus;

  @CreateDateColumn({ name: 'requested_at' })
  requested_at: Date;

  @Column({ name: 'approved_at', nullable: true })
  approved_at?: Date;

  @Column({ name: 'approved_by', nullable: true })
  approved_by?: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.company_memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, (company) => company.members)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver?: User;
}