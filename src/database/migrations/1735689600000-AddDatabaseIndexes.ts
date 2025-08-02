import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDatabaseIndexes1735689600000 implements MigrationInterface {
  name = 'AddDatabaseIndexes1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add full-text search column and index for job posts
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD COLUMN IF NOT EXISTS search_vector tsvector
    `);

    // Create function to update search vector
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_job_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := to_tsvector('english', 
          COALESCE(NEW.job_title, '') || ' ' || 
          COALESCE(NEW.description, '') || ' ' ||
          COALESCE(NEW.location, '') || ' ' ||
          COALESCE(NEW.category, '')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger to automatically update search vector
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS job_search_vector_update ON job_posts;
      CREATE TRIGGER job_search_vector_update
        BEFORE INSERT OR UPDATE ON job_posts
        FOR EACH ROW EXECUTE FUNCTION update_job_search_vector();
    `);

    // Update existing records
    await queryRunner.query(`
      UPDATE job_posts SET search_vector = to_tsvector('english', 
        COALESCE(job_title, '') || ' ' || 
        COALESCE(description, '') || ' ' ||
        COALESCE(location, '') || ' ' ||
        COALESCE(category, '')
      );
    `);

    // Create GIN index for full-text search
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_job_search_vector 
      ON job_posts USING GIN(search_vector);
    `);

    // Create additional performance indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_job_salary_range 
      ON job_posts (salary_min, salary_max) 
      WHERE salary_min IS NOT NULL AND salary_max IS NOT NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_job_active_recent 
      ON job_posts (posted_date DESC) 
      WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW());
    `);

    // Add indexes for companies table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_company_search 
      ON companies USING GIN(to_tsvector('english', company_name || ' ' || COALESCE(description, '')));
    `);

    // Add indexes for applications performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_application_job_recent 
      ON applications (job_id, applied_at DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_application_user_recent 
      ON applications (user_id, applied_at DESC);
    `);

    // Add indexes for notifications
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_notification_recipient_unread 
      ON notifications (recipient_id, is_read, created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_job_search_vector;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_job_salary_range;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_job_active_recent;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_company_search;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_application_job_recent;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_application_user_recent;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_notification_recipient_unread;`);

    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS job_search_vector_update ON job_posts;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_job_search_vector();`);

    // Drop search vector column
    await queryRunner.query(`ALTER TABLE job_posts DROP COLUMN IF EXISTS search_vector;`);
  }
}
