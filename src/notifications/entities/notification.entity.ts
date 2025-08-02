import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  notification_id: number;

  @Column({ name: 'recipient_id' })
  recipient_id: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'is_read', default: false })
  is_read: boolean;

  @Column({ name: 'notification_type', length: 50, nullable: true })
  notification_type?: string;

  @Column({ name: 'priority', length: 20, default: 'normal' })
  priority: string;

  @Column({ name: 'read_at', nullable: true })
  read_at?: Date;

  @Column({ name: 'expires_at', nullable: true })
  expires_at?: Date;

  @Column({ name: 'related_entity_type', length: 20, nullable: true })
  related_entity_type?: string;

  @Column({ name: 'related_entity_id', nullable: true })
  related_entity_id?: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;
}
