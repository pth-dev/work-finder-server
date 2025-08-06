import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCategoryColumn1735568500000 implements MigrationInterface {
  name = 'RemoveCategoryColumn1735568500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop category index first
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_job_category"`);

    // Remove category column from job_posts table
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP COLUMN IF EXISTS "category"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add category column back
    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD COLUMN "category" VARCHAR(100)`,
    );

    // Recreate category index
    await queryRunner.query(
      `CREATE INDEX "IDX_job_category" ON "job_posts" ("category")`,
    );
  }
}
