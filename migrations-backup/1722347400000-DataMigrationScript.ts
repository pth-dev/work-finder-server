import { MigrationInterface, QueryRunner } from 'typeorm';

export class DataMigrationScript1722347400000 implements MigrationInterface {
  name = 'DataMigrationScript1722347400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Handle existing users with potential null emails
    // Since we now use email as primary identifier, ensure all users have emails
    await queryRunner.query(`
      UPDATE users 
      SET email = username || '@temp-email.local'
      WHERE email IS NULL OR email = ''
    `);

    // Step 2: Make email required and unique
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN email SET NOT NULL
    `);

    // Step 3: Migrate existing salary data to structured format
    // This is a simplified migration - in production, you'd need more sophisticated parsing
    await queryRunner.query(`
      UPDATE job_posts 
      SET 
        min_salary = CASE 
          WHEN salary ~ '^[0-9]+$' THEN CAST(salary AS DECIMAL(10,2))
          WHEN salary ~ '[0-9]+-[0-9]+' THEN CAST(split_part(salary, '-', 1) AS DECIMAL(10,2))
          WHEN salary ~ '[0-9]+k' THEN CAST(REPLACE(LOWER(salary), 'k', '000') AS DECIMAL(10,2))
          ELSE NULL
        END,
        max_salary = CASE 
          WHEN salary ~ '[0-9]+-[0-9]+' THEN CAST(split_part(salary, '-', 2) AS DECIMAL(10,2))
          WHEN salary ~ '^[0-9]+$' THEN CAST(salary AS DECIMAL(10,2))
          WHEN salary ~ '[0-9]+k' THEN CAST(REPLACE(LOWER(salary), 'k', '000') AS DECIMAL(10,2))
          ELSE NULL
        END,
        currency = 'USD',
        pay_period = 'yearly'
      WHERE salary IS NOT NULL AND salary != ''
    `);

    // Step 4: Set default notification preferences for existing users
    await queryRunner.query(`
      INSERT INTO user_notification_preferences (user_id, notification_type_id, email_enabled, push_enabled, in_app_enabled, frequency)
      SELECT 
        u.user_id,
        nt.id,
        u.email_notifications_enabled,
        true,
        true,
        'immediate'
      FROM users u
      CROSS JOIN notification_types nt
      WHERE nt.default_enabled = true
      ON CONFLICT (user_id, notification_type_id) DO NOTHING
    `);

    // Step 5: Initialize file metadata for existing resumes
    await queryRunner.query(`
      UPDATE resumes 
      SET 
        file_type = 'pdf',
        mime_type = 'application/pdf',
        storage_provider = 'local',
        is_virus_scanned = false,
        is_processed = false,
        processing_status = 'pending',
        download_count = 0
      WHERE file_type IS NULL
    `);

    // Step 6: Set match scores for existing saved jobs
    await queryRunner.query(`
      UPDATE saved_jobs 
      SET 
        overall_match_score = 50,
        salary_match_score = 50,
        location_match_score = 50,
        skills_match_score = 50,
        interest_level = 'medium',
        priority = 'normal'
      WHERE overall_match_score IS NULL
    `);

    // Step 7: Initialize followed company preferences
    await queryRunner.query(`
      UPDATE followed_companies 
      SET 
        interest_level = 'normal',
        notification_frequency = 'weekly',
        job_alerts_enabled = true,
        company_updates_enabled = true,
        priority = 'normal'
      WHERE interest_level IS NULL
    `);

    // Step 8: Create default job alert for active job seekers
    await queryRunner.query(`
      INSERT INTO job_alerts (user_id, name, frequency, is_active)
      SELECT 
        user_id,
        'General Job Alert',
        'daily',
        true
      FROM users 
      WHERE role = 'job_seeker'
      AND user_id NOT IN (SELECT DISTINCT user_id FROM job_alerts WHERE deleted_at IS NULL)
    `);

    // Step 9: Add some common technical skills if not already present
    await queryRunner.query(`
      INSERT INTO skills (name, category, is_verified) VALUES
      ('SQL', 'technical', true),
      ('HTML', 'technical', true),
      ('CSS', 'technical', true),
      ('Machine Learning', 'technical', true),
      ('Data Analysis', 'technical', true),
      ('DevOps', 'technical', true),
      ('CI/CD', 'methodology', true),
      ('Testing', 'methodology', true),
      ('Quality Assurance', 'methodology', true),
      ('Teamwork', 'soft', true)
      ON CONFLICT (name) DO NOTHING
    `);

    // Step 10: Update timestamps for entities that didn't have them
    await queryRunner.query(`
      UPDATE companies 
      SET created_at = NOW(), updated_at = NOW()
      WHERE created_at IS NULL
    `);

    await queryRunner.query(`
      UPDATE job_posts 
      SET updated_at = posted_date
      WHERE updated_at IS NULL
    `);

    await queryRunner.query(`
      UPDATE resumes 
      SET created_at = NOW(), updated_at = NOW()
      WHERE created_at IS NULL
    `);

    await queryRunner.query(`
      UPDATE interviews 
      SET created_at = NOW(), updated_at = NOW()
      WHERE created_at IS NULL
    `);

    await queryRunner.query(`
      UPDATE saved_jobs 
      SET updated_at = saved_at
      WHERE updated_at IS NULL
    `);

    await queryRunner.query(`
      UPDATE followed_companies 
      SET created_at = followed_at, updated_at = followed_at
      WHERE created_at IS NULL
    `);

    await queryRunner.query(`
      UPDATE notifications 
      SET updated_at = created_at
      WHERE updated_at IS NULL
    `);

    // Step 11: Set default privacy consent for existing users (GDPR compliance)
    await queryRunner.query(`
      UPDATE users 
      SET 
        privacy_consent_date = created_at,
        data_processing_consent = true,
        marketing_consent = email_notifications_enabled,
        cookie_consent = true
      WHERE privacy_consent_date IS NULL
    `);

    // Step 12: Add some default interview questions if none exist
    await queryRunner.query(`
      INSERT INTO interview_questions (question_text, question_type, category, difficulty_level) 
      SELECT * FROM (VALUES
        ('What interests you about this role?', 'behavioral', 'motivation', 'easy'),
        ('How do you handle tight deadlines?', 'situational', 'pressure_handling', 'medium'),
        ('Describe your experience with our tech stack.', 'technical', 'experience', 'medium'),
        ('What are your salary expectations?', 'behavioral', 'compensation', 'medium'),
        ('Do you have any questions for us?', 'behavioral', 'engagement', 'easy')
      ) AS new_questions(question_text, question_type, category, difficulty_level)
      WHERE NOT EXISTS (SELECT 1 FROM interview_questions LIMIT 1)
    `);

    // Step 13: Log migration completion
    await queryRunner.query(`
      INSERT INTO notification_types (name, description, category, priority, is_active, template_subject, template_body)
      VALUES (
        'database_migration_completed',
        'System notification for completed database migration',
        'system',
        'normal',
        false,
        'Database Migration Completed',
        'The database has been successfully migrated to the new schema version.'
      )
      ON CONFLICT (name) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback operations (simplified - in production, you'd need more sophisticated rollback)

    // Remove added notification type
    await queryRunner.query(`
      DELETE FROM notification_types 
      WHERE name = 'database_migration_completed'
    `);

    // Reset privacy consent fields
    await queryRunner.query(`
      UPDATE users 
      SET 
        privacy_consent_date = NULL,
        data_processing_consent = false,
        marketing_consent = false,
        cookie_consent = false
    `);

    // Remove default job alerts
    await queryRunner.query(`
      DELETE FROM job_alerts 
      WHERE name = 'General Job Alert'
    `);

    // Reset followed company preferences
    await queryRunner.query(`
      UPDATE followed_companies 
      SET 
        interest_level = NULL,
        notification_frequency = NULL,
        job_alerts_enabled = NULL,
        company_updates_enabled = NULL,
        priority = NULL
    `);

    // Reset saved job match scores
    await queryRunner.query(`
      UPDATE saved_jobs 
      SET 
        overall_match_score = NULL,
        salary_match_score = NULL,
        location_match_score = NULL,
        skills_match_score = NULL,
        interest_level = NULL,
        priority = NULL
    `);

    // Reset file metadata
    await queryRunner.query(`
      UPDATE resumes 
      SET 
        file_type = NULL,
        mime_type = NULL,
        storage_provider = NULL,
        is_virus_scanned = NULL,
        is_processed = NULL,
        processing_status = NULL,
        download_count = NULL
    `);

    // Remove notification preferences
    await queryRunner.query(`
      DELETE FROM user_notification_preferences
    `);

    // Reset structured salary data
    await queryRunner.query(`
      UPDATE job_posts 
      SET 
        min_salary = NULL,
        max_salary = NULL,
        currency = NULL,
        pay_period = NULL
    `);

    // Make email nullable again
    await queryRunner.query(`
      ALTER TABLE users 
      ALTER COLUMN email DROP NOT NULL
    `);

    // Reset temporary emails
    await queryRunner.query(`
      UPDATE users 
      SET email = NULL
      WHERE email LIKE '%@temp-email.local'
    `);
  }
}
