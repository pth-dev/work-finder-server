import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createNotification(
    recipientId: number,
    content: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      recipient_id: recipientId,
      content,
      is_read: false,
    });

    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { recipient_id: userId },
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['recipient'],
      });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: {
        notification_id: notificationId,
        recipient_id: userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.is_read = true;
    await this.notificationRepository.save(notification);

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository.update(
      { recipient_id: userId, is_read: false },
      { is_read: true },
    );

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: {
        notification_id: notificationId,
        recipient_id: userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.remove(notification);
    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: {
        recipient_id: userId,
        is_read: false,
      },
    });
  }

  // Helper methods for common notification types
  async notifyJobApplication(
    recipientId: number,
    jobTitle: string,
    applicantName: string,
  ) {
    const content = `${applicantName} đã ứng tuyển vào vị trí "${jobTitle}"`;
    return this.createNotification(recipientId, content);
  }

  async notifyApplicationStatusUpdate(
    recipientId: number,
    jobTitle: string,
    status: string,
  ) {
    const content = `Trạng thái ứng tuyển "${jobTitle}" đã được cập nhật: ${status}`;
    return this.createNotification(recipientId, content);
  }

  async notifyNewJobPosted(
    recipientId: number,
    jobTitle: string,
    companyName: string,
  ) {
    const content = `${companyName} vừa đăng tin tuyển dụng: "${jobTitle}"`;
    return this.createNotification(recipientId, content);
  }

  // ===== ADMIN WORKFLOW NOTIFICATIONS =====

  /**
   * Notify admin when a new job is submitted for review
   */
  async notifyAdminNewJobSubmitted(
    adminId: number,
    jobTitle: string,
    companyName: string,
  ) {
    const content = `Tin tuyển dụng mới cần phê duyệt: "${jobTitle}" từ ${companyName}`;
    return this.createNotification(adminId, content);
  }

  /**
   * Notify recruiter when job is approved by admin
   */
  async notifyJobApproved(recruiterId: number, jobTitle: string) {
    const content = `Tin tuyển dụng "${jobTitle}" đã được phê duyệt và đăng công khai`;
    return this.createNotification(recruiterId, content);
  }

  /**
   * Notify recruiter when job is rejected by admin
   */
  async notifyJobRejected(
    recruiterId: number,
    jobTitle: string,
    reason?: string,
  ) {
    const content = reason
      ? `Tin tuyển dụng "${jobTitle}" đã bị từ chối. Lý do: ${reason}`
      : `Tin tuyển dụng "${jobTitle}" đã bị từ chối`;
    return this.createNotification(recruiterId, content);
  }

  /**
   * Notify all admins about a new job submission
   */
  async notifyAllAdminsNewJob(
    jobTitle: string,
    companyName: string,
  ): Promise<Notification[]> {
    // Get all admin users
    const admins = await this.userRepository.find({
      where: { role: UserRole.ADMIN },
      select: ['user_id'],
    });

    const notifications: Notification[] = [];
    for (const admin of admins) {
      try {
        const notification = await this.notifyAdminNewJobSubmitted(
          admin.user_id,
          jobTitle,
          companyName,
        );
        notifications.push(notification);
      } catch (error) {
        console.error(`Failed to notify admin ${admin.user_id}:`, error);
      }
    }

    return notifications;
  }
}
