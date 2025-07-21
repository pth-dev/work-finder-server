import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JobPost } from './job.entity';

@Entity('saved_jobs')
@Unique(['user_id', 'job_id'])
export class SavedJob {
  @PrimaryGeneratedColumn()
  saved_job_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'job_id' })
  job_id: number;

  @CreateDateColumn({ name: 'saved_at' })
  saved_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.saved_jobs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => JobPost, (jobPost) => jobPost.saved_by, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job_post: JobPost;
}
