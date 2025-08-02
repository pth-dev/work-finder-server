import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConstraintsAndSoftDelete1722345700000
  implements MigrationInterface
{
  name = 'AddConstraintsAndSoftDelete1722345700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique constraint to prevent duplicate applications
    await queryRunner.query(`
      ALTER TABLE applications 
      ADD CONSTRAINT unique_user_job UNIQUE (user_id, job_id)
    `);

    // Add soft delete support to all entities
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE resumes 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE saved_jobs 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE followed_companies 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL
    `);

    // Create indexes for soft delete queries (only show non-deleted records)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_posts_deleted_at ON job_posts(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_resumes_deleted_at ON resumes(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_applications_deleted_at ON applications(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_deleted_at ON interviews(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_saved_jobs_deleted_at ON saved_jobs(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_followed_companies_deleted_at ON followed_companies(deleted_at) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_notifications_deleted_at ON notifications(deleted_at) WHERE deleted_at IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_companies_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_posts_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_resumes_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_applications_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_deleted_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_saved_jobs_deleted_at`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_followed_companies_deleted_at`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_deleted_at`,
    );

    // Remove soft delete columns
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE resumes DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE applications DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE interviews DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE saved_jobs DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE followed_companies DROP COLUMN IF EXISTS deleted_at`,
    );
    await queryRunner.query(
      `ALTER TABLE notifications DROP COLUMN IF EXISTS deleted_at`,
    );

    // Remove unique constraint
    await queryRunner.query(
      `ALTER TABLE applications DROP CONSTRAINT IF EXISTS unique_user_job`,
    );
  }
}
