import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from './company.entity';

@Entity('followed_companies')
@Unique(['user_id', 'company_id'])
export class FollowedCompany {
  @PrimaryGeneratedColumn()
  follow_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'company_id' })
  company_id: number;

  @CreateDateColumn({ name: 'followed_at' })
  followed_at: Date;

  @Column({ name: 'notification_status', default: true })
  notification_status: boolean;

  // Relations
  @ManyToOne(() => User, (user) => user.followed_companies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, (company) => company.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
