import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
import { Resume } from '../../resumes/entities/resume.entity';
import { SavedJob } from '../../jobs/entities/saved-job.entity';
import { FollowedCompany } from '../../companies/entities/followed-company.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ name: 'username', length: 50, unique: true })
  username: string;

  @Column({ name: 'password', length: 255 })
  @Exclude()
  password: string;

  @Column({ name: 'full_name', length: 100, nullable: true })
  full_name?: string;

  @Column({ name: 'email', length: 100, unique: true, nullable: true })
  email?: string;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'avatar', length: 255, nullable: true })
  avatar?: string;

  @Column({ name: 'refresh_token', nullable: true })
  @Exclude()
  refresh_token?: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.JOB_SEEKER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(() => Resume, (resume) => resume.user)
  resumes: Resume[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.user)
  saved_jobs: SavedJob[];

  @OneToMany(() => FollowedCompany, (followedCompany) => followedCompany.user)
  followed_companies: FollowedCompany[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications: Notification[];

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}
