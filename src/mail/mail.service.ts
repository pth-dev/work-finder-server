import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendOTPEmail(email: string, otpCode: string, name?: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'WorkFinder - Xác thực tài khoản của bạn',
        template: 'otp-verification',
        context: {
          name: name || 'Người dùng',
          otpCode,
          expiryMinutes: this.configService.get('OTP_EXPIRY_MINUTES', 5),
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetOTP(email: string, otpCode: string, name?: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'WorkFinder - Đặt lại mật khẩu',
        template: 'password-reset-otp',
        context: {
          name: name || 'Người dùng',
          otpCode,
          expiryMinutes: this.configService.get('OTP_EXPIRY_MINUTES', 5),
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send password reset OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendJobMatchNotification(
    email: string,
    name: string,
    jobTitle: string,
    companyName: string,
    jobUrl: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'WorkFinder - Có việc làm phù hợp với bạn!',
        template: 'job-match-notification',
        context: {
          name,
          jobTitle,
          companyName,
          jobUrl,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send job notification email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'WorkFinder - Chào mừng bạn đến với WorkFinder!',
        template: 'welcome',
        context: {
          name,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Duplicate method removed - using the one above with optional name parameter

  async sendPasswordChangedNotification(email: string, name: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'WorkFinder - Mật khẩu đã được thay đổi',
        template: 'password-changed',
        context: {
          name,
          changeTime: new Date().toLocaleString('vi-VN'),
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send password changed notification:', error);
      return { success: false, error: error.message };
    }
  }
}
