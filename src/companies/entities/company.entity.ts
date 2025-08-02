import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { JobPost } from '../../jobs/entities/job-post.entity';
import { FollowedCompany } from './followed-company.entity';
import { CompanyUser } from './company-user.entity';

@Entity('companies')
@Index('IDX_company_name', ['company_name']) // Company name searches
@Index('IDX_company_location', ['location']) // Location-based filtering
@Index('IDX_company_industry', ['industry']) // Industry filtering
@Index('IDX_company_verified', ['is_verified']) // Verified companies
@Index('IDX_company_size', ['company_size']) // Company size filtering
@Index('IDX_company_created_at', ['created_at']) // Registration date sorting
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

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'location', length: 100, nullable: true })
  location?: string;

  @Column({ name: 'company_size', length: 20, nullable: true })
  company_size?: string;

  @Column({ name: 'is_verified', default: false })
  is_verified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @OneToMany(() => JobPost, (jobPost) => jobPost.company, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  job_posts: JobPost[];

  @OneToMany(
    () => FollowedCompany,
    (followedCompany) => followedCompany.company,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  followers: FollowedCompany[];

  @OneToMany(() => CompanyUser, (companyUser) => companyUser.company, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  members: CompanyUser[];
}
