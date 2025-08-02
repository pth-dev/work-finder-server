import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileMetadataAndJunctionEnhancements1722347300000
  implements MigrationInterface
{
  name = 'AddFileMetadataAndJunctionEnhancements1722347300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add file metadata to resumes table
    await queryRunner.query(`
      ALTER TABLE resumes 
      ADD COLUMN IF NOT EXISTS file_size BIGINT,
      ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS original_filename VARCHAR(500),
      ADD COLUMN IF NOT EXISTS file_checksum VARCHAR(64),
      ADD COLUMN IF NOT EXISTS upload_session_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS is_virus_scanned BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS virus_scan_result VARCHAR(50),
      ADD COLUMN IF NOT EXISTS virus_scan_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS extracted_text TEXT,
      ADD COLUMN IF NOT EXISTS page_count INTEGER,
      ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50) DEFAULT 'local',
      ADD COLUMN IF NOT EXISTS external_url VARCHAR(1000),
      ADD COLUMN IF NOT EXISTS compression_used BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(500)
    `);

    // Create file access log table for security and analytics
    await queryRunner.query(`
      CREATE TABLE file_access_log (
        id SERIAL PRIMARY KEY,
        file_id INTEGER NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        user_id INTEGER REFERENCES users(user_id),
        access_type VARCHAR(20) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        accessed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Enhance SavedJob table with additional metadata
    await queryRunner.query(`
      ALTER TABLE saved_jobs 
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS save_reason VARCHAR(200),
      ADD COLUMN IF NOT EXISTS reminder_date DATE,
      ADD COLUMN IF NOT EXISTS tags VARCHAR(500),
      ADD COLUMN IF NOT EXISTS application_deadline_reminder BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_applied BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS applied_date DATE,
      ADD COLUMN IF NOT EXISTS follow_up_date DATE,
      ADD COLUMN IF NOT EXISTS interest_level VARCHAR(20) DEFAULT 'medium',
      ADD COLUMN IF NOT EXISTS salary_match_score INTEGER,
      ADD COLUMN IF NOT EXISTS location_match_score INTEGER,
      ADD COLUMN IF NOT EXISTS skills_match_score INTEGER,
      ADD COLUMN IF NOT EXISTS overall_match_score INTEGER
    `);

    // Enhance FollowedCompany table with additional metadata
    await queryRunner.query(`
      ALTER TABLE followed_companies 
      ADD COLUMN IF NOT EXISTS follow_reason VARCHAR(200),
      ADD COLUMN IF NOT EXISTS interest_level VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS notification_frequency VARCHAR(20) DEFAULT 'weekly',
      ADD COLUMN IF NOT EXISTS job_alerts_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS company_updates_enabled BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS last_job_alert_sent TIMESTAMP,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS tags VARCHAR(500),
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS contact_attempted BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS contact_date DATE,
      ADD COLUMN IF NOT EXISTS contact_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS contact_person VARCHAR(200),
      ADD COLUMN IF NOT EXISTS contact_notes TEXT
    `);

    // Create job alerts table for granular job notifications
    await queryRunner.query(`
      CREATE TABLE job_alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        search_keywords TEXT,
        location VARCHAR(300),
        salary_min DECIMAL(10,2),
        salary_max DECIMAL(10,2),
        job_type VARCHAR(50),
        experience_level VARCHAR(50),
        remote_allowed BOOLEAN,
        company_ids INTEGER[],
        excluded_company_ids INTEGER[],
        skill_ids INTEGER[],
        categories VARCHAR(500),
        frequency VARCHAR(20) DEFAULT 'daily',
        is_active BOOLEAN DEFAULT true,
        last_sent TIMESTAMP,
        jobs_found_count INTEGER DEFAULT 0,
        total_notifications_sent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )
    `);

    // Add trigger for job_alerts updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_job_alerts_updated_at
        BEFORE UPDATE ON job_alerts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create table to track job alert matches
    await queryRunner.query(`
      CREATE TABLE job_alert_matches (
        id SERIAL PRIMARY KEY,
        job_alert_id INTEGER NOT NULL REFERENCES job_alerts(id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        match_score INTEGER,
        matched_at TIMESTAMP DEFAULT NOW(),
        notification_sent BOOLEAN DEFAULT false,
        notification_sent_at TIMESTAMP,
        UNIQUE(job_alert_id, job_id)
      )
    `);

    // Add constraints for new fields
    await queryRunner.query(`
      ALTER TABLE resumes 
      ADD CONSTRAINT check_file_size 
      CHECK (file_size IS NULL OR file_size > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE resumes 
      ADD CONSTRAINT check_processing_status 
      CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
    `);

    await queryRunner.query(`
      ALTER TABLE resumes 
      ADD CONSTRAINT check_virus_scan_result 
      CHECK (virus_scan_result IN ('clean', 'infected', 'suspicious', 'unknown'))
    `);

    await queryRunner.query(`
      ALTER TABLE resumes 
      ADD CONSTRAINT check_storage_provider 
      CHECK (storage_provider IN ('local', 'aws_s3', 'google_cloud', 'azure_blob'))
    `);

    await queryRunner.query(`
      ALTER TABLE saved_jobs 
      ADD CONSTRAINT check_saved_job_priority 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
    `);

    await queryRunner.query(`
      ALTER TABLE saved_jobs 
      ADD CONSTRAINT check_interest_level 
      CHECK (interest_level IN ('low', 'medium', 'high', 'very_high'))
    `);

    await queryRunner.query(`
      ALTER TABLE saved_jobs 
      ADD CONSTRAINT check_match_scores 
      CHECK (
        (salary_match_score IS NULL OR (salary_match_score >= 0 AND salary_match_score <= 100)) AND
        (location_match_score IS NULL OR (location_match_score >= 0 AND location_match_score <= 100)) AND
        (skills_match_score IS NULL OR (skills_match_score >= 0 AND skills_match_score <= 100)) AND
        (overall_match_score IS NULL OR (overall_match_score >= 0 AND overall_match_score <= 100))
      )
    `);

    await queryRunner.query(`
      ALTER TABLE followed_companies 
      ADD CONSTRAINT check_follow_interest_level 
      CHECK (interest_level IN ('low', 'normal', 'high', 'very_high'))
    `);

    await queryRunner.query(`
      ALTER TABLE followed_companies 
      ADD CONSTRAINT check_notification_frequency 
      CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'monthly', 'never'))
    `);

    await queryRunner.query(`
      ALTER TABLE followed_companies 
      ADD CONSTRAINT check_follow_priority 
      CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
    `);

    await queryRunner.query(`
      ALTER TABLE followed_companies 
      ADD CONSTRAINT check_contact_method 
      CHECK (contact_method IN ('email', 'phone', 'linkedin', 'website', 'in_person', 'job_fair'))
    `);

    await queryRunner.query(`
      ALTER TABLE file_access_log 
      ADD CONSTRAINT check_file_type 
      CHECK (file_type IN ('resume', 'cover_letter', 'portfolio', 'certificate'))
    `);

    await queryRunner.query(`
      ALTER TABLE file_access_log 
      ADD CONSTRAINT check_access_type 
      CHECK (access_type IN ('view', 'download', 'upload', 'delete', 'share'))
    `);

    await queryRunner.query(`
      ALTER TABLE job_alerts 
      ADD CONSTRAINT check_alert_frequency 
      CHECK (frequency IN ('immediate', 'daily', 'weekly', 'monthly'))
    `);

    await queryRunner.query(`
      ALTER TABLE job_alert_matches 
      ADD CONSTRAINT check_alert_match_score 
      CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 100))
    `);

    // Create performance indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_resumes_file_type ON resumes(file_type) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_resumes_processing_status ON resumes(processing_status) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_resumes_virus_scanned ON resumes(is_virus_scanned) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_resumes_file_size ON resumes(file_size) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_file_access_log_file_id_type ON file_access_log(file_id, file_type)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_file_access_log_user_id ON file_access_log(user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_file_access_log_accessed_at ON file_access_log(accessed_at)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_file_access_log_access_type ON file_access_log(access_type)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_priority ON saved_jobs(priority) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_interest_level ON saved_jobs(interest_level) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_reminder_date ON saved_jobs(reminder_date) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_is_applied ON saved_jobs(is_applied) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_match_score ON saved_jobs(overall_match_score) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_followed_companies_interest_level ON followed_companies(interest_level) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_followed_companies_job_alerts ON followed_companies(job_alerts_enabled) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_followed_companies_notification_freq ON followed_companies(notification_frequency) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_followed_companies_priority ON followed_companies(priority) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON job_alerts(is_active) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alerts_frequency ON job_alerts(frequency) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alerts_last_sent ON job_alerts(last_sent) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alert_matches_alert_id ON job_alert_matches(job_alert_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alert_matches_job_id ON job_alert_matches(job_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alert_matches_notification_sent ON job_alert_matches(notification_sent)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alert_matches_match_score ON job_alert_matches(match_score)`,
    );

    // Add GIN indexes for array columns
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alerts_company_ids ON job_alerts USING GIN(company_ids) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alerts_excluded_company_ids ON job_alerts USING GIN(excluded_company_ids) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_alerts_skill_ids ON job_alerts USING GIN(skill_ids) WHERE deleted_at IS NULL`,
    );

    // Create function to calculate match scores
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION calculate_job_match_score(
        user_id_param INTEGER,
        job_id_param INTEGER
      ) RETURNS INTEGER AS $$
      DECLARE
        salary_score INTEGER := 0;
        location_score INTEGER := 0;
        skills_score INTEGER := 0;
        total_score INTEGER := 0;
      BEGIN
        -- This is a simplified scoring algorithm
        -- In practice, this would be much more sophisticated
        
        -- Salary matching (30% weight)
        SELECT CASE 
          WHEN jp.min_salary IS NOT NULL AND u.preferred_min_salary IS NOT NULL THEN
            CASE 
              WHEN jp.min_salary >= u.preferred_min_salary AND jp.max_salary <= u.preferred_max_salary THEN 100
              WHEN jp.min_salary <= u.preferred_max_salary AND jp.max_salary >= u.preferred_min_salary THEN 70
              ELSE 30
            END
          ELSE 50
        END INTO salary_score
        FROM job_posts jp, users u 
        WHERE jp.job_id = job_id_param AND u.user_id = user_id_param;
        
        -- Location matching (20% weight)
        -- Simplified: exact match = 100, partial = 50, no match = 20
        location_score := 50; -- Default moderate score
        
        -- Skills matching (50% weight)
        -- Count matching skills vs required skills
        WITH user_skill_count AS (
          SELECT COUNT(*) as count FROM user_skills us 
          JOIN job_skills js ON us.skill_id = js.skill_id 
          WHERE us.user_id = user_id_param AND js.job_id = job_id_param AND js.is_required = true
        ),
        required_skill_count AS (
          SELECT COUNT(*) as count FROM job_skills js 
          WHERE js.job_id = job_id_param AND js.is_required = true
        )
        SELECT CASE 
          WHEN rsc.count = 0 THEN 70 -- No required skills specified
          ELSE LEAST(100, (usc.count * 100 / rsc.count))
        END INTO skills_score
        FROM user_skill_count usc, required_skill_count rsc;
        
        -- Calculate weighted total
        total_score := (salary_score * 30 + location_score * 20 + skills_score * 50) / 100;
        
        RETURN total_score;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove function
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS calculate_job_match_score(INTEGER, INTEGER)`,
    );

    // Remove triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_job_alerts_updated_at ON job_alerts`,
    );

    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_resumes_file_type`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_resumes_processing_status`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_resumes_virus_scanned`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_resumes_file_size`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_file_access_log_file_id_type`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_file_access_log_user_id`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_file_access_log_accessed_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_file_access_log_access_type`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_jobs_priority`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_saved_jobs_interest_level`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_saved_jobs_reminder_date`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_jobs_is_applied`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_jobs_match_score`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_followed_companies_interest_level`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_followed_companies_job_alerts`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_followed_companies_notification_freq`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_followed_companies_priority`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_alerts_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_alerts_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_alerts_frequency`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_alerts_last_sent`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_job_alert_matches_alert_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_job_alert_matches_job_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_job_alert_matches_notification_sent`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_job_alert_matches_match_score`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_alerts_company_ids`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_job_alerts_excluded_company_ids`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_alerts_skill_ids`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS job_alert_matches`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_alerts`);
    await queryRunner.query(`DROP TABLE IF EXISTS file_access_log`);

    // Remove added columns
    await queryRunner.query(`
      ALTER TABLE resumes 
      DROP COLUMN IF EXISTS file_size,
      DROP COLUMN IF EXISTS file_type,
      DROP COLUMN IF EXISTS mime_type,
      DROP COLUMN IF EXISTS original_filename,
      DROP COLUMN IF EXISTS file_checksum,
      DROP COLUMN IF EXISTS upload_session_id,
      DROP COLUMN IF EXISTS is_virus_scanned,
      DROP COLUMN IF EXISTS virus_scan_result,
      DROP COLUMN IF EXISTS virus_scan_date,
      DROP COLUMN IF EXISTS is_processed,
      DROP COLUMN IF EXISTS processing_status,
      DROP COLUMN IF EXISTS extracted_text,
      DROP COLUMN IF EXISTS page_count,
      DROP COLUMN IF EXISTS download_count,
      DROP COLUMN IF EXISTS last_downloaded_at,
      DROP COLUMN IF EXISTS storage_provider,
      DROP COLUMN IF EXISTS external_url,
      DROP COLUMN IF EXISTS compression_used,
      DROP COLUMN IF EXISTS thumbnail_path
    `);

    await queryRunner.query(`
      ALTER TABLE saved_jobs 
      DROP COLUMN IF EXISTS notes,
      DROP COLUMN IF EXISTS priority,
      DROP COLUMN IF EXISTS save_reason,
      DROP COLUMN IF EXISTS reminder_date,
      DROP COLUMN IF EXISTS tags,
      DROP COLUMN IF EXISTS application_deadline_reminder,
      DROP COLUMN IF EXISTS is_applied,
      DROP COLUMN IF EXISTS applied_date,
      DROP COLUMN IF EXISTS follow_up_date,
      DROP COLUMN IF EXISTS interest_level,
      DROP COLUMN IF EXISTS salary_match_score,
      DROP COLUMN IF EXISTS location_match_score,
      DROP COLUMN IF EXISTS skills_match_score,
      DROP COLUMN IF EXISTS overall_match_score
    `);

    await queryRunner.query(`
      ALTER TABLE followed_companies 
      DROP COLUMN IF EXISTS follow_reason,
      DROP COLUMN IF EXISTS interest_level,
      DROP COLUMN IF EXISTS notification_frequency,
      DROP COLUMN IF EXISTS job_alerts_enabled,
      DROP COLUMN IF EXISTS company_updates_enabled,
      DROP COLUMN IF EXISTS last_job_alert_sent,
      DROP COLUMN IF EXISTS notes,
      DROP COLUMN IF EXISTS tags,
      DROP COLUMN IF EXISTS priority,
      DROP COLUMN IF EXISTS contact_attempted,
      DROP COLUMN IF EXISTS contact_date,
      DROP COLUMN IF EXISTS contact_method,
      DROP COLUMN IF EXISTS contact_person,
      DROP COLUMN IF EXISTS contact_notes
    `);
  }
}
