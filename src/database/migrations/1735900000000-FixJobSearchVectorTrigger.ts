import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixJobSearchVectorTrigger1735900000000 implements MigrationInterface {
  name = 'FixJobSearchVectorTrigger1735900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update the trigger function to remove reference to deleted 'category' column
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_job_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector := 
          setweight(to_tsvector('english', COALESCE(NEW.job_title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Update existing records to fix search_vector without category
    await queryRunner.query(`
      UPDATE job_posts SET 
        search_vector = 
          setweight(to_tsvector('english', COALESCE(job_title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(location, '')), 'C')
      WHERE search_vector IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the original trigger function (this will fail if category column doesn't exist)
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
  }
}
