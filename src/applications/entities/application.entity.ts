import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { JobPost } from '../../jobs/entities/job.entity';
import { Resume } from '../../resumes/entities/resume.entity';
import { User } from '../../users/entities/user.entity';
import { ApplicationStatus } from '../../common/enums/application-status.enum';
import { Interview } from './interview.entity';

@Entity('applications')
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
