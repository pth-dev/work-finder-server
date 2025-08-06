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
import { Company } from '../../companies/entities/company.entity';
import { JobType } from '../../common/enums/job-type.enum';
import { JobStatus } from '../../common/enums/job-status.enum';
import { Application } from '../../applications/entities/application.entity';
import { SavedJob } from './saved-job.entity';

@Entity('job_posts')
@Index('IDX_job_status_posted_date', ['status', 'posted_date']) // Composite index for active jobs with date sorting
@Index('IDX_job_location', ['location']) // Location-based searches
@Index('IDX_job_type', ['job_type']) // Job type filtering
@Index('IDX_job_company_status', ['company_id', 'status']) // Company jobs filtering
@Index('IDX_job_save_count', ['save_count']) // Featured jobs sorting
@Index('IDX_job_expires_at', ['expires_at']) // Expiration filtering
@Index('IDX_job_search_vector', { synchronize: false }) // Full-text search index (manual creation required)
export class JobPost {
  @PrimaryGeneratedColumn()
  job_id: number;

  @Column({ name: 'company_id' })
  company_id: number;

  @Column({ name: 'job_title', length: 200 })
  job_title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'requirements', type: 'text', nullable: true })
  requirements?: string;

  @Column({ name: 'benefits', type: 'text', nullable: true })
  benefits?: string;

  @Column({ name: 'location', length: 200, nullable: true })
  location?: string;

  @Column({
    name: 'salary_min',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salary_min?: number;

  @Column({
    name: 'salary_max',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  salary_max?: number;

  @Column({ name: 'salary', length: 100, nullable: true })
  salary?: string;

  @Column({
    name: 'job_type',
    type: 'enum',
    enum: JobType,
    nullable: true,
  })
  job_type?: JobType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.ACTIVE,
  })
  status: JobStatus;

  @CreateDateColumn({ name: 'posted_date' })
  posted_date: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'expires_at', nullable: true })
  expires_at?: Date;

  @Column({ name: 'view_count', default: 0 })
  view_count: number;

  @Column({ name: 'save_count', default: 0 })
  save_count: number;

  @Column({ name: 'application_count', default: 0 })
  application_count: number;

  @Column({
    name: 'search_vector',
    type: 'tsvector',
    nullable: true,
    select: false,
  })
  search_vector?: string;

  // Relations
  @ManyToOne(() => Company, (company) => company.job_posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Application, (application) => application.job_post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.job_post, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  saved_by: SavedJob[];
}
