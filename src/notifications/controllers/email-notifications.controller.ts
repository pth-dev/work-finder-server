import {
  Controller,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmailNotificationsService } from '../services/email-notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ResponseMessage } from '../../common/interceptors/response.interceptor';

@ApiTags('email-notifications')
@Controller('email-notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailNotificationsController {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  @Post('send/:jobId')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Job notifications sent successfully')
  @ApiOperation({
    summary: 'Send job notifications for a specific job (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Job notifications sent successfully',
  })
  async sendJobNotifications(@Param('jobId') jobId: string) {
    return this.emailNotificationsService.sendJobNotificationForJob(+jobId);
  }

  @Put('preferences')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Email notification preference updated successfully')
  @ApiOperation({ summary: 'Update email notification preference' })
  @ApiResponse({
    status: 200,
    description: 'Email notification preference updated successfully',
    schema: {
      example: {
        success: true,
        status: 200,
        data: { message: 'Email notifications enabled successfully' },
        message: 'Email notification preference updated successfully',
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async updateNotificationPreference(
    @CurrentUser() user: any,
    @Body() body: { enabled: boolean },
  ) {
    return this.emailNotificationsService.updateEmailNotificationPreference(
      user.user_id,
      body.enabled,
    );
  }
}
