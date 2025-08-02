import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobSearchVector1735754400000 implements MigrationInterface {
  name = 'AddJobSearchVector1735754400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add search_vector column to job_posts table
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD COLUMN search_vector tsvector
    `);

    // Create function to update search_vector
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_job_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := 
          setweight(to_tsvector('english', COALESCE(NEW.job_title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'D');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger to automatically update search_vector
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_job_search_vector
      BEFORE INSERT OR UPDATE ON job_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_job_search_vector();
    `);

    // Populate existing records with search_vector data
    await queryRunner.query(`
      UPDATE job_posts SET 
        search_vector = 
          setweight(to_tsvector('english', COALESCE(job_title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(location, '')), 'D')
      WHERE search_vector IS NULL;
    `);

    // Create GIN index for fast full-text search
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_search_vector_gin 
      ON job_posts USING gin(search_vector);
    `);

    // Create additional index for search with status filter
    await queryRunner.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_search_vector_status 
      ON job_posts USING gin(search_vector) 
      WHERE status = 'active';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_job_search_vector_gin`);
    await queryRunner.query(`DROP INDEX CONCURRENTLY IF EXISTS idx_job_search_vector_status`);
    
    // Drop trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_job_search_vector ON job_posts`);
    
    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_job_search_vector()`);
    
    // Drop column
    await queryRunner.query(`ALTER TABLE job_posts DROP COLUMN IF EXISTS search_vector`);
  }
}
