import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
import { OtpType } from '../../common/enums/otp-type.enum';
import { Resume } from '../../resumes/entities/resume.entity';
import { SavedJob } from '../../jobs/entities/saved-job.entity';
import { FollowedCompany } from '../../companies/entities/followed-company.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Application } from '../../applications/entities/application.entity';
import { CompanyUser } from '../../companies/entities/company-user.entity';

@Entity('users')
@Index('IDX_user_email', ['email']) // Email lookup (already unique but explicit index)
@Index('IDX_user_role', ['role']) // Role-based filtering
@Index('IDX_user_email_verified', ['email_verified']) // Verified users filtering
@Index('IDX_user_refresh_token', ['refresh_token']) // Token validation
@Index('IDX_user_created_at', ['created_at']) // User registration date sorting
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ name: 'email', length: 100, unique: true })
  email: string;

  @Column({ name: 'password', length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'full_name', length: 100, nullable: true })
  full_name?: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'avatar', length: 255, nullable: true })
  avatar?: string;

  @Column({ name: 'refresh_token', nullable: true })
  @Exclude()
  refresh_token?: string;

  @Column({ name: 'email_verified', default: false })
  email_verified: boolean;

  @Column({ name: 'otp_code', length: 10, nullable: true })
  @Exclude()
  otp_code?: string;

  @Column({ name: 'otp_expires_at', nullable: true })
  @Exclude()
  otp_expires_at?: Date;

  @Column({
    name: 'otp_type',
    type: 'enum',
    enum: OtpType,
    nullable: true,
  })
  @Exclude()
  otp_type?: OtpType;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.JOB_SEEKER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Resume, (resume) => resume.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  resumes: Resume[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  saved_jobs: SavedJob[];

  @OneToMany(() => FollowedCompany, (followedCompany) => followedCompany.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  followed_companies: FollowedCompany[];

  @OneToMany(() => Notification, (notification) => notification.recipient, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  notifications: Notification[];

  @OneToMany(() => Application, (application) => application.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  applications: Application[];

  @OneToMany(() => CompanyUser, (companyUser) => companyUser.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  company_memberships: CompanyUser[];
}
