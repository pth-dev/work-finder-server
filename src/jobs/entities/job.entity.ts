import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { JobType } from '../../common/enums/job-type.enum';
import { JobStatus } from '../../common/enums/job-status.enum';
import { Application } from '../../applications/entities/application.entity';
import { SavedJob } from './saved-job.entity';

@Entity('job_posts')
export class JobPost {
  @PrimaryGeneratedColumn()
  job_id: number;

  @Column({ name: 'company_id' })
  company_id: number;

  @Column({ name: 'job_title', length: 200 })
  job_title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'location', length: 200, nullable: true })
  location?: string;

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

  @Column({ name: 'save_count', default: 0 })
  save_count: number;

  // Relations
  @ManyToOne(() => Company, (company) => company.job_posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Application, (application) => application.job_post)
  applications: Application[];

  @OneToMany(() => SavedJob, (savedJob) => savedJob.job_post)
  saved_by: SavedJob[];
}
