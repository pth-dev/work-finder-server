import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { JobPost } from '../../jobs/entities/job-post.entity';
import { FollowedCompany } from './followed-company.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  company_id: number;

  @Column({ name: 'company_name', length: 200 })
  company_name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'company_image', length: 255, nullable: true })
  company_image?: string;

  @Column({ name: 'industry', length: 100, nullable: true })
  industry?: string;

  @Column({ name: 'website', length: 255, nullable: true })
  website?: string;

  // Relations
  @OneToMany(() => JobPost, (jobPost) => jobPost.company)
  job_posts: JobPost[];

  @OneToMany(() => FollowedCompany, (followedCompany) => followedCompany.company)
  followers: FollowedCompany[];
}
