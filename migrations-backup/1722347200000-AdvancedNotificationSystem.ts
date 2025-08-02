import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvancedNotificationSystem1722347200000
  implements MigrationInterface
{
  name = 'AdvancedNotificationSystem1722347200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create notification types table
    await queryRunner.query(`
      CREATE TABLE notification_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        default_enabled BOOLEAN DEFAULT true,
        can_be_disabled BOOLEAN DEFAULT true,
        priority VARCHAR(20) DEFAULT 'normal',
        template_subject VARCHAR(255),
        template_body TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )
    `);

    // Add trigger for notification_types updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_notification_types_updated_at
        BEFORE UPDATE ON notification_types
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add enhanced fields to notifications table
    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS notification_type_id INTEGER REFERENCES notification_types(id),
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS related_entity_id INTEGER,
      ADD COLUMN IF NOT EXISTS action_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS push_sent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS push_sent_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS metadata JSONB
    `);

    // Create user notification preferences table
    await queryRunner.query(`
      CREATE TABLE user_notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        notification_type_id INTEGER NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
        email_enabled BOOLEAN DEFAULT true,
        push_enabled BOOLEAN DEFAULT true,
        in_app_enabled BOOLEAN DEFAULT true,
        frequency VARCHAR(20) DEFAULT 'immediate',
        quiet_hours_start TIME,
        quiet_hours_end TIME,
        timezone VARCHAR(50) DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        UNIQUE(user_id, notification_type_id)
      )
    `);

    // Add trigger for user_notification_preferences updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_user_notification_preferences_updated_at
        BEFORE UPDATE ON user_notification_preferences
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create notification delivery log table
    await queryRunner.query(`
      CREATE TABLE notification_delivery_log (
        id SERIAL PRIMARY KEY,
        notification_id INTEGER NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
        delivery_method VARCHAR(20) NOT NULL,
        delivery_status VARCHAR(20) NOT NULL,
        attempted_at TIMESTAMP DEFAULT NOW(),
        delivered_at TIMESTAMP,
        error_message TEXT,
        external_id VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add constraints for new fields
    await queryRunner.query(`
      ALTER TABLE notification_types 
      ADD CONSTRAINT check_notification_category 
      CHECK (category IN ('job_match', 'application_update', 'interview', 'message', 'system', 'marketing', 'security'))
    `);

    await queryRunner.query(`
      ALTER TABLE notification_types 
      ADD CONSTRAINT check_notification_priority 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD CONSTRAINT check_notification_priority 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD CONSTRAINT check_related_entity_type 
      CHECK (related_entity_type IN ('job_post', 'application', 'interview', 'company', 'user', 'resume'))
    `);

    await queryRunner.query(`
      ALTER TABLE user_notification_preferences 
      ADD CONSTRAINT check_frequency 
      CHECK (frequency IN ('immediate', 'daily', 'weekly', 'monthly', 'never'))
    `);

    await queryRunner.query(`
      ALTER TABLE notification_delivery_log 
      ADD CONSTRAINT check_delivery_method 
      CHECK (delivery_method IN ('email', 'push', 'sms', 'in_app'))
    `);

    await queryRunner.query(`
      ALTER TABLE notification_delivery_log 
      ADD CONSTRAINT check_delivery_status 
      CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced'))
    `);

    // Create performance indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notification_types_category ON notification_types(category) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notification_types_active ON notification_types(is_active) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_type_id ON notifications(notification_type_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_action_required ON notifications(action_required) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read, created_at) WHERE deleted_at IS NULL AND is_read = false`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_notification_prefs_user_id ON user_notification_preferences(user_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_notification_prefs_type_id ON user_notification_preferences(notification_type_id) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_method ON notification_delivery_log(delivery_method)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(delivery_status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_attempted_at ON notification_delivery_log(attempted_at)`,
    );

    // Insert default notification types
    await queryRunner.query(`
      INSERT INTO notification_types (name, description, category, priority, default_enabled, template_subject, template_body) VALUES
      ('job_application_received', 'Notification when a job application is received', 'application_update', 'normal', true, 'New Application Received', 'You have received a new application for {{job_title}}.'),
      ('application_status_updated', 'Notification when application status changes', 'application_update', 'high', true, 'Application Status Updated', 'Your application status for {{job_title}} has been updated to {{status}}.'),
      ('interview_scheduled', 'Notification when interview is scheduled', 'interview', 'high', true, 'Interview Scheduled', 'An interview has been scheduled for {{job_title}} on {{interview_date}}.'),
      ('interview_reminder', 'Reminder notification before interview', 'interview', 'high', true, 'Interview Reminder', 'Reminder: You have an interview for {{job_title}} in {{time_until}}.'),
      ('job_match_found', 'Notification when matching job is found', 'job_match', 'normal', true, 'New Job Match Found', 'We found a job that matches your preferences: {{job_title}}.'),
      ('profile_viewed', 'Notification when profile is viewed by recruiter', 'system', 'low', true, 'Profile Viewed', 'A recruiter viewed your profile.'),
      ('message_received', 'Notification when message is received', 'message', 'normal', true, 'New Message', 'You have received a new message from {{sender_name}}.'),
      ('job_saved_by_candidate', 'Notification when candidate saves job', 'system', 'low', false, 'Job Saved', 'A candidate saved your job posting: {{job_title}}.'),
      ('company_followed', 'Notification when candidate follows company', 'system', 'low', false, 'Company Followed', 'A candidate started following your company.'),
      ('password_changed', 'Security notification for password change', 'security', 'high', true, 'Password Changed', 'Your password has been successfully changed.'),
      ('login_from_new_device', 'Security notification for new device login', 'security', 'high', true, 'New Device Login', 'Your account was accessed from a new device.'),
      ('account_locked', 'Security notification for account lock', 'security', 'urgent', true, 'Account Locked', 'Your account has been temporarily locked due to security reasons.'),
      ('system_maintenance', 'System maintenance notifications', 'system', 'normal', true, 'System Maintenance', 'System maintenance is scheduled for {{maintenance_date}}.'),
      ('feature_announcement', 'New feature announcements', 'system', 'low', true, 'New Feature Available', 'Check out our new feature: {{feature_name}}.'),
      ('weekly_job_digest', 'Weekly digest of job matches', 'job_match', 'low', true, 'Weekly Job Digest', 'Here are this week''s job recommendations for you.')
    `);

    // Create function to automatically expire old notifications
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION expire_old_notifications()
      RETURNS void AS $$
      BEGIN
        UPDATE notifications 
        SET deleted_at = NOW() 
        WHERE expires_at < NOW() 
        AND deleted_at IS NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create function to clean up delivery logs older than 90 days
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_delivery_logs()
      RETURNS void AS $$
      BEGIN
        DELETE FROM notification_delivery_log 
        WHERE created_at < NOW() - INTERVAL '90 days';
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove functions
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS expire_old_notifications()`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS cleanup_old_delivery_logs()`,
    );

    // Remove triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_notification_types_updated_at ON notification_types`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences`,
    );

    // Remove indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notification_types_category`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notification_types_active`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_type_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_priority`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_action_required`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_related_entity`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_expires_at`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_read_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_unread`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_user_notification_prefs_user_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_user_notification_prefs_type_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notification_delivery_log_notification_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notification_delivery_log_method`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notification_delivery_log_status`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notification_delivery_log_attempted_at`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS notification_delivery_log`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS user_notification_preferences`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS notification_types`);

    // Remove added columns from notifications table
    await queryRunner.query(`
      ALTER TABLE notifications 
      DROP COLUMN IF EXISTS notification_type_id,
      DROP COLUMN IF EXISTS priority,
      DROP COLUMN IF EXISTS action_required,
      DROP COLUMN IF EXISTS related_entity_type,
      DROP COLUMN IF EXISTS related_entity_id,
      DROP COLUMN IF EXISTS action_url,
      DROP COLUMN IF EXISTS expires_at,
      DROP COLUMN IF EXISTS read_at,
      DROP COLUMN IF EXISTS clicked_at,
      DROP COLUMN IF EXISTS email_sent,
      DROP COLUMN IF EXISTS email_sent_at,
      DROP COLUMN IF EXISTS push_sent,
      DROP COLUMN IF EXISTS push_sent_at,
      DROP COLUMN IF EXISTS delivery_attempts,
      DROP COLUMN IF EXISTS metadata
    `);
  }
}
