import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { CompletePasswordResetDto } from './dto/complete-password-reset.dto';
import { OtpType } from '../common/enums/otp-type.enum';
import { MailService } from '../mail/mail.service';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return null;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return null;
    }

    if (!user.email_verified) {
      throw new UnauthorizedException('auth.messages.login.emailNotVerified');
    }

    const { password: _, refresh_token, ...result } = user;
    return result;
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    const { email, otp_code } = verifyOtpDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('auth.messages.otp.userNotFound');
    }

    if (!user.otp_code) {
      throw new UnauthorizedException('auth.messages.otp.noOtpFound');
    }

    // Ensure both OTP codes are strings and trim whitespace
    const inputOtpTrimmed = otp_code.toString().trim();
    const storedOtpTrimmed = user.otp_code.toString().trim();

    if (storedOtpTrimmed !== inputOtpTrimmed) {
      throw new UnauthorizedException('auth.messages.otp.invalidOtp');
    }

    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      throw new UnauthorizedException('auth.messages.otp.otpExpired');
    }

    // Mark email as verified and clear OTP
    await this.userRepository.update(user.user_id, {
      email_verified: true,
      otp_code: undefined,
      otp_expires_at: undefined,
      otp_type: undefined,
    });

    // Generate tokens
    const payload = {
      email: user.email,
      sub: user.user_id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save refresh token
    await this.userRepository.update(user.user_id, { refresh_token });

    // ✅ Return tokens for controller to set as cookies, but not expose to client
    return {
      access_token, // Used by controller for cookie
      refresh_token, // Used by controller for cookie
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.user_id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.userRepository.update(user.user_id, { refresh_token });

    // ✅ Return tokens for controller to set as cookies, but not expose to client
    return {
      access_token, // Used by controller for cookie
      refresh_token, // Used by controller for cookie
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('auth.messages.registration.emailExists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate OTP
    const otpCode = this.generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user with unverified email
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || UserRole.JOB_SEEKER,
      email_verified: false,
      otp_code: otpCode,
      otp_expires_at: otpExpires,
      otp_type: OtpType.EMAIL_VERIFICATION,
    });

    const savedUser = await this.userRepository.save(user);

    // Send OTP email
    try {
      await this.mailService.sendOTPEmail(
        savedUser.email,
        otpCode,
        savedUser.full_name,
      );
    } catch (error) {
      throw new Error('Failed to send OTP email');
    }

    return {
      message: 'auth.messages.registration.success',
      email: savedUser.email,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { user_id: payload.sub, refresh_token: refreshToken },
      });

      if (!user) {
        throw new UnauthorizedException(
          'auth.messages.token.invalidRefreshToken',
        );
      }

      const newPayload = {
        email: user.email,
        sub: user.user_id,
        role: user.role,
      };

      const access_token = this.jwtService.sign(newPayload);

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException(
        'auth.messages.token.invalidRefreshToken',
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'auth.messages.forgotPassword.emailNotFound',
      );
    }

    // Generate OTP for password reset
    const otpCode = this.generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.userRepository.update(user.user_id, {
      otp_code: otpCode,
      otp_expires_at: otpExpires,
      otp_type: OtpType.PASSWORD_RESET,
    });

    // Send password reset OTP email
    try {
      await this.mailService.sendPasswordResetOTP(
        email,
        otpCode,
        user.full_name,
      );
    } catch (error) {
      console.error('Failed to send password reset OTP email:', error);
    }

    return { message: 'auth.messages.forgotPassword.otpSent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otp_code, new_password } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'auth.messages.resetPassword.invalidEmailOrOtp',
      );
    }

    if (!user.otp_code || user.otp_code !== otp_code) {
      throw new UnauthorizedException('auth.messages.otp.invalidOtp');
    }

    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      throw new UnauthorizedException('auth.messages.otp.otpExpired');
    }

    if (user.otp_type !== OtpType.PASSWORD_RESET) {
      throw new UnauthorizedException('auth.messages.otp.invalidOtpOperation');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and clear OTP
    await this.userRepository.update(user.user_id, {
      password: hashedPassword,
      otp_code: undefined,
      otp_expires_at: undefined,
      otp_type: undefined,
      refresh_token: undefined, // Invalidate all sessions
    });

    return { message: 'auth.messages.resetPassword.success' };
  }

  async resendOTP(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('auth.messages.otp.userNotFound');
    }

    if (user.email_verified) {
      throw new ConflictException('auth.messages.otp.emailAlreadyVerified');
    }

    // Check if there's an existing OTP that's still valid (optional rate limiting)
    if (user.otp_expires_at && new Date() < user.otp_expires_at) {
      // Allow resend but inform user
    }

    // Generate new OTP
    const otpCode = this.generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.userRepository.update(user.user_id, {
      otp_code: otpCode,
      otp_expires_at: otpExpires,
      otp_type: OtpType.EMAIL_VERIFICATION,
    });

    // Send OTP email
    try {
      await this.mailService.sendOTPEmail(email, otpCode, user.full_name);
    } catch (error) {
      throw new Error('Failed to send OTP email');
    }

    return { message: 'auth.messages.otp.resendSuccess' };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, { refresh_token: undefined });
    return { message: 'auth.messages.logout.success' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { current_password, new_password } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('auth.messages.user.notFound');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      current_password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(
        'auth.messages.changePassword.invalidCurrentPassword',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and invalidate all sessions except current one
    await this.userRepository.update(userId, {
      password: hashedPassword,
      refresh_token: undefined, // Force re-login on other devices
    });

    return { message: 'auth.messages.changePassword.success' };
  }

  async verifyResetOTP(verifyResetOtpDto: VerifyResetOtpDto) {
    const { email, otp_code } = verifyResetOtpDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('auth.messages.otp.userNotFound');
    }

    if (!user.otp_code || user.otp_code !== otp_code) {
      throw new UnauthorizedException('auth.messages.otp.invalidOtp');
    }

    if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
      throw new UnauthorizedException('auth.messages.otp.otpExpired');
    }

    if (user.otp_type !== OtpType.PASSWORD_RESET) {
      throw new UnauthorizedException('auth.messages.otp.invalidOtpOperation');
    }

    // Generate temporary reset token (valid for 10 minutes)
    const resetTokenPayload = {
      email: user.email,
      userId: user.user_id,
      type: 'password_reset',
    };

    const resetToken = this.jwtService.sign(resetTokenPayload, {
      secret: process.env.JWT_SECRET + '_reset',
      expiresIn: '10m', // 10 minutes
    });

    return {
      message: 'auth.messages.verifyResetOtp.success',
      reset_token: resetToken,
    };
  }

  async completePasswordReset(
    completePasswordResetDto: CompletePasswordResetDto,
  ) {
    const { email, reset_token, new_password } = completePasswordResetDto;

    try {
      // Verify reset token
      const decoded = this.jwtService.verify(reset_token, {
        secret: process.env.JWT_SECRET + '_reset',
      });

      if (decoded.email !== email || decoded.type !== 'password_reset') {
        throw new UnauthorizedException(
          'auth.messages.resetPassword.invalidToken',
        );
      }

      const user = await this.userRepository.findOne({
        where: { email, user_id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedException('auth.messages.otp.userNotFound');
      }

      // Verify OTP is still valid and for password reset
      if (user.otp_type !== OtpType.PASSWORD_RESET) {
        throw new UnauthorizedException(
          'auth.messages.otp.invalidOtpOperation',
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update password and clear OTP
      await this.userRepository.update(user.user_id, {
        password: hashedPassword,
        otp_code: undefined,
        otp_expires_at: undefined,
        otp_type: undefined,
        refresh_token: undefined, // Invalidate all sessions
      });

      return { message: 'auth.messages.resetPassword.success' };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException(
          'auth.messages.resetPassword.invalidOrExpiredToken',
        );
      }
      throw error;
    }
  }
}
