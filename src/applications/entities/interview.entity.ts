import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { InterviewType } from '../../common/enums/interview-type.enum';

export enum InterviewStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show',
}

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn()
  interview_id: number;

  @Column({ name: 'application_id' })
  application_id: number;

  @Column({ name: 'interviewer_id', nullable: true })
  interviewer_id?: number;

  @Column({
    name: 'interview_type',
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.VIDEO,
  })
  interview_type: InterviewType;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduled_at: Date;

  @Column({ name: 'duration_minutes', default: 60 })
  duration_minutes: number;

  @Column({ name: 'location', type: 'text', nullable: true })
  location?: string;

  @Column({
    name: 'meeting_link',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  meeting_link?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status: InterviewStatus;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'feedback', type: 'text', nullable: true })
  feedback?: string;

  @Column({ name: 'rating', type: 'integer', nullable: true })
  rating?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Application, (application) => application.interviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
