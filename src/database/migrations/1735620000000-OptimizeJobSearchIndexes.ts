import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeJobSearchIndexes1735620000000 implements MigrationInterface {
  name = 'OptimizeJobSearchIndexes1735620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add composite indexes for most common query patterns
    
    // Index for job search with location + status + posted_date (most common query)
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_search_location_status 
      ON job_posts(status, location, posted_date DESC) 
      WHERE status = 'active'
    `);

    // Index for job search with category + status + posted_date
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_search_category_status 
      ON job_posts(status, category, posted_date DESC) 
      WHERE status = 'active' AND category IS NOT NULL
    `);

    // Index for salary range searches
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_salary_range_active 
      ON job_posts(status, salary_min, salary_max, posted_date DESC) 
      WHERE status = 'active' AND salary_min IS NOT NULL AND salary_max IS NOT NULL
    `);

    // Index for job type + location searches
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_type_location_active 
      ON job_posts(status, job_type, location, posted_date DESC) 
      WHERE status = 'active'
    `);

    // Index for company job listings
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_company_active_recent 
      ON job_posts(company_id, status, posted_date DESC) 
      WHERE status = 'active'
    `);

    // Index for most saved jobs (featured jobs)
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_featured_by_saves 
      ON job_posts(status, save_count DESC, posted_date DESC) 
      WHERE status = 'active' AND save_count > 0
    `);

    // Index for recent jobs within expiry date
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_recent_not_expired 
      ON job_posts(status, posted_date DESC) 
      WHERE status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `);

    // Optimize company searches
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_companies_search_verified 
      ON companies(is_verified, company_name) 
      WHERE is_verified = true
    `);

    // Index for application count updates (frequently updated)
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_application_stats 
      ON job_posts(job_id, application_count, save_count, view_count)
    `);

    // Add partial index for expired jobs cleanup
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_expired_cleanup 
      ON job_posts(expires_at, status) 
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP AND status = 'active'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the created indexes
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_search_location_status`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_search_category_status`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_salary_range_active`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_type_location_active`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_company_active_recent`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_featured_by_saves`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_recent_not_expired`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_companies_search_verified`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_application_stats`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_jobs_expired_cleanup`);
  }
}