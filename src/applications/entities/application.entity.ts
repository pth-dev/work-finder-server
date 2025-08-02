import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { JobPost } from '../../jobs/entities/job.entity';
import { Resume } from '../../resumes/entities/resume.entity';
import { User } from '../../users/entities/user.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { Interview } from './interview.entity';

@Entity('applications')
@Index('IDX_application_job_user', ['job_id', 'user_id'], { unique: true }) // Prevent duplicate applications
@Index('IDX_application_status', ['status']) // Status filtering
@Index('IDX_application_job_status', ['job_id', 'status']) // Job applications by status
@Index('IDX_application_user_status', ['user_id', 'status']) // User applications by status
@Index('IDX_application_applied_at', ['applied_at']) // Application date sorting
@Index('IDX_application_resume', ['resume_id']) // Resume-based queries
export class Application {
  @PrimaryGeneratedColumn()
  application_id: number;

  @Column({ name: 'job_id' })
  job_id: number;

  @Column({ name: 'resume_id' })
  resume_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn({ name: 'applied_at' })
  applied_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => JobPost, (jobPost) => jobPost.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'job_id' })
  job_post: JobPost;

  @ManyToOne(() => Resume, (resume) => resume.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resume_id' })
  resume: Resume;

  @ManyToOne(() => User, (user) => user.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Interview, (interview) => interview.application)
  interviews: Interview[];
}
