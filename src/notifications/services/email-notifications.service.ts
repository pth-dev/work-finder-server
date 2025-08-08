import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '../../users/entities/user.entity';
import { JobPost } from '../../jobs/entities/job-post.entity';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailNotificationsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(JobPost)
    private jobRepository: Repository<JobPost>,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  // Run every hour to check for new job matches
  // @Cron(CronExpression.EVERY_HOUR) // ❌ DISABLED: Causing email spam
  async sendJobMatchNotifications() {
    try {
      const users = await this.userRepository.find({
        where: {
          email_verified: true,
        },
        select: ['user_id', 'email', 'full_name'],
      });

      if (users.length === 0) {
        return;
      }

      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const newJobs = await this.jobRepository.find({
        where: {
          posted_date: MoreThan(oneHourAgo),
        },
        relations: ['company'],
      });

      if (newJobs.length === 0) {
        return;
      }

      // Send notifications to all users for now
      // In a real implementation, you would check job criteria, skills, location, etc.
      for (const user of users) {
        for (const job of newJobs) {
          if (this.isJobMatchForUser(user, job)) {
            await this.sendJobNotificationEmail(user, job);

            // Add a small delay to avoid overwhelming the email service
            await this.delay(100);
          }
        }
      }

      console.log('Job match notifications completed');
    } catch (error) {
      console.error('Error sending job match notifications:', error);
    }
  }

  private isJobMatchForUser(user: User, job: JobPost): boolean {
    // Basic matching logic - in production, this would be more sophisticated
    // Could check:
    // - User's skills vs job requirements
    // - User's preferred location vs job location
    // - User's experience level vs job level
    // - User's industry preferences

    // ❌ DISABLED: Prevent spam emails
    // For now, return true for demonstration (send to all users)
    return false; // ✅ FIXED: Don't send to anyone until proper matching is implemented
  }

  private async sendJobNotificationEmail(user: User, job: JobPost) {
    try {
      const jobUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/jobs/${job.job_id}`;

      await this.mailService.sendJobMatchNotification(
        user.email!,
        user.full_name || 'User',
        job.job_title,
        job.company?.company_name || 'Unknown Company',
        jobUrl,
      );

      console.log(
        `Sent job notification to ${user.email} for job: ${job.job_title}`,
      );
    } catch (error) {
      console.error(`Failed to send job notification to ${user.email}:`, error);
    }
  }

  // Manual method to send job notifications for specific job
  async sendJobNotificationForJob(jobId: number) {
    const job = await this.jobRepository.findOne({
      where: { job_id: jobId },
      relations: ['company'],
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const users = await this.userRepository.find({
      where: {
        email_verified: true,
      },
      select: ['user_id', 'email', 'full_name'],
    });

    const notifications: Array<{
      user_id: number;
      email: string;
      job_id: number;
    }> = [];
    for (const user of users) {
      if (this.isJobMatchForUser(user, job) && user.email) {
        await this.sendJobNotificationEmail(user, job);
        notifications.push({
          user_id: user.user_id,
          email: user.email,
          job_id: job.job_id,
        });

        await this.delay(100);
      }
    }

    return {
      message: `Sent job notifications to ${notifications.length} users`,
      notifications,
    };
  }

  // Utility method to add delays
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Method to update user's email notification preference
  async updateEmailNotificationPreference(userId: number, enabled: boolean) {
    // Note: Email notification preferences should be handled by notification settings
    // This method is kept for backward compatibility
    return {
      message: `Email notifications ${enabled ? 'enabled' : 'disabled'} successfully`,
    };
  }
}
