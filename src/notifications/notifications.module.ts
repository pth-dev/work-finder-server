import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './services/notifications.service';
import { EmailNotificationsService } from './services/email-notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { EmailNotificationsController } from './controllers/email-notifications.controller';
import { User } from '../users/entities/user.entity';
import { JobPost } from '../jobs/entities/job.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, JobPost]),
    MailModule, // ✅ Import mail module for email notifications
  ],
  controllers: [NotificationsController, EmailNotificationsController],
  providers: [NotificationsService, EmailNotificationsService],
  exports: [NotificationsService, EmailNotificationsService, TypeOrmModule],
})
export class NotificationsModule {}
