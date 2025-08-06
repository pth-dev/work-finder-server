import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSearchVectorTrigger1736000001000 implements MigrationInterface {
  name = 'FixSearchVectorTrigger1736000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing trigger first
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_job_search_vector ON job_posts`);
    
    // Drop existing function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_job_search_vector()`);

    // Create updated function WITHOUT category reference
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_job_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := 
          setweight(to_tsvector('english', COALESCE(NEW.job_title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.requirements, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'D');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Recreate trigger
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_job_search_vector
      BEFORE INSERT OR UPDATE ON job_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_job_search_vector();
    `);

    // Update existing records with corrected search_vector
    await queryRunner.query(`
      UPDATE job_posts SET 
        search_vector = 
          setweight(to_tsvector('english', COALESCE(job_title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(requirements, '')), 'C') ||
          setweight(to_tsvector('english', COALESCE(location, '')), 'D')
      WHERE search_vector IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_job_search_vector ON job_posts`);
    
    // Drop function
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_job_search_vector()`);

    // Recreate original function with category (this will fail if category doesn't exist)
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

    // Recreate trigger
    await queryRunner.query(`
      CREATE TRIGGER trigger_update_job_search_vector
      BEFORE INSERT OR UPDATE ON job_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_job_search_vector();
    `);
  }
}
