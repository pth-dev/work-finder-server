import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEssentialIndexes1722345900000 implements MigrationInterface {
  name = 'AddEssentialIndexes1722345900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Job Posts - Essential for job search functionality
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_location ON job_posts(location) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_category ON job_posts(category) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_status_type ON job_posts(status, job_type) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_company_id ON job_posts(company_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_posted_date ON job_posts(posted_date) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_salary_range ON job_posts(min_salary, max_salary) WHERE deleted_at IS NULL AND min_salary IS NOT NULL`,
    );

    // Applications - Critical for user application tracking
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications(user_id, status) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_applications_status_applied_at ON applications(status, applied_at) WHERE deleted_at IS NULL`,
    );

    // Notifications - For real-time notification queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_id, is_read) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at) WHERE deleted_at IS NULL`,
    );

    // Users - For authentication and profile lookups
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE deleted_at IS NULL`,
    );

    // Companies - For company search and filtering
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(company_name) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry) WHERE deleted_at IS NULL`,
    );

    // Resumes - For user resume management
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id) WHERE deleted_at IS NULL`,
    );

    // Interviews - For interview scheduling and management
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON interviews(application_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_time ON interviews(interview_time) WHERE deleted_at IS NULL`,
    );

    // Saved Jobs - For user saved jobs functionality
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_saved_at ON saved_jobs(user_id, saved_at) WHERE deleted_at IS NULL`,
    );

    // Followed Companies - For company following functionality
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_followed_companies_user_id ON followed_companies(user_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_followed_companies_company_id ON followed_companies(company_id) WHERE deleted_at IS NULL`,
    );

    // Full-text search indexes for better search performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_job_posts_fulltext_search 
      ON job_posts USING gin(to_tsvector('english', 
        coalesce(job_title,'') || ' ' || 
        coalesce(description,'') || ' ' || 
        coalesce(requirements,'')
      )) 
      WHERE deleted_at IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_fulltext_search 
      ON companies USING gin(to_tsvector('english', 
        coalesce(company_name,'') || ' ' || 
        coalesce(description,'')
      )) 
      WHERE deleted_at IS NULL
    `);

    // Composite indexes for complex queries
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_location_category_status ON job_posts(location, category, status) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_applications_job_status_applied ON applications(job_id, status, applied_at) WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all created indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posts_location`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posts_category`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posts_status_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posts_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posts_posted_date`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posts_salary_range`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_applications_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_applications_job_id`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_applications_user_status`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_applications_status_applied_at`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_recipient_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_recipient_read`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_created_at`,
    );

    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email_verified`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_companies_name`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_companies_industry`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_resumes_user_id`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interviews_application_id`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_time`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_jobs_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_jobs_job_id`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_saved_jobs_user_saved_at`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_followed_companies_user_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_followed_companies_company_id`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_job_posts_fulltext_search`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_companies_fulltext_search`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_job_posts_location_category_status`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_applications_job_status_applied`,
    );
  }
}
