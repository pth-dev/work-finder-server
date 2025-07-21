import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Application } from '../../applications/entities/application.entity';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn()
  resume_id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'file_name', length: 255 })
  file_name: string;

  @Column({ name: 'file_path', length: 500 })
  file_path: string;

  @CreateDateColumn({ name: 'upload_time' })
  upload_time: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.resumes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Application, (application) => application.resume)
  applications: Application[];
}
