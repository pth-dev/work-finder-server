import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Application } from './application.entity';
import { InterviewType } from '../../common/enums/interview-type.enum';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn()
  interview_id: number;

  @Column({ name: 'application_id' })
  application_id: number;

  @Column({ name: 'interview_time', type: 'timestamp', nullable: true })
  interview_time?: Date;

  @Column({
    name: 'interview_type',
    type: 'enum',
    enum: InterviewType,
    nullable: true,
  })
  interview_type?: InterviewType;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => Application, (application) => application.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;
}
