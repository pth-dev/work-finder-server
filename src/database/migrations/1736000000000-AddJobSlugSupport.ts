import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobSlugSupport1736000000000 implements MigrationInterface {
  name = 'AddJobSlugSupport1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add slug column to job_posts table
    await queryRunner.query(`
      ALTER TABLE "job_posts" 
      ADD COLUMN "slug" VARCHAR(255) UNIQUE
    `);

    // Create index for slug
    await queryRunner.query(`
      CREATE INDEX "IDX_job_slug" ON "job_posts" ("slug")
    `);

    // Generate slugs for existing jobs
    await queryRunner.query(`
      UPDATE "job_posts" 
      SET "slug" = LOWER(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            CONCAT(
              SUBSTRING("job_title", 1, 50), 
              '-', 
              (SELECT SUBSTRING("company_name", 1, 30) FROM "companies" WHERE "companies"."company_id" = "job_posts"."company_id")
            ), 
            '[^a-zA-Z0-9\\s-]', '', 'g'
          ), 
          '\\s+', '-', 'g'
        )
      )
      WHERE "slug" IS NULL
    `);

    // Handle duplicate slugs by appending numbers
    await queryRunner.query(`
      WITH duplicate_slugs AS (
        SELECT "slug", COUNT(*) as count
        FROM "job_posts" 
        WHERE "slug" IS NOT NULL
        GROUP BY "slug"
        HAVING COUNT(*) > 1
      ),
      numbered_jobs AS (
        SELECT 
          "job_id",
          "slug",
          ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "job_id") as rn
        FROM "job_posts"
        WHERE "slug" IN (SELECT "slug" FROM duplicate_slugs)
      )
      UPDATE "job_posts" 
      SET "slug" = CONCAT("job_posts"."slug", '-', numbered_jobs.rn)
      FROM numbered_jobs
      WHERE "job_posts"."job_id" = numbered_jobs."job_id" 
      AND numbered_jobs.rn > 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index first
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_job_slug"`);
    
    // Drop slug column
    await queryRunner.query(`ALTER TABLE "job_posts" DROP COLUMN IF EXISTS "slug"`);
  }
}