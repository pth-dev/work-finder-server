import { MigrationInterface, QueryRunner } from 'typeorm';

export class RestructureSalaryFields1722345800000
  implements MigrationInterface
{
  name = 'RestructureSalaryFields1722345800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, create new structured salary columns
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD COLUMN IF NOT EXISTS min_salary DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS max_salary DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS pay_period VARCHAR(20) DEFAULT 'yearly'
    `);

    // Add check constraints to ensure data integrity
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD CONSTRAINT check_salary_range 
      CHECK (min_salary IS NULL OR max_salary IS NULL OR min_salary <= max_salary)
    `);

    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD CONSTRAINT check_positive_salary 
      CHECK (min_salary IS NULL OR min_salary >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD CONSTRAINT check_pay_period 
      CHECK (pay_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly'))
    `);

    // Add similar structured salary fields to users for preferred salary range
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferred_min_salary DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS preferred_max_salary DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS preferred_pay_period VARCHAR(20) DEFAULT 'yearly'
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT check_user_salary_range 
      CHECK (preferred_min_salary IS NULL OR preferred_max_salary IS NULL OR preferred_min_salary <= preferred_max_salary)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT check_user_positive_salary 
      CHECK (preferred_min_salary IS NULL OR preferred_min_salary >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT check_user_pay_period 
      CHECK (preferred_pay_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly'))
    `);

    // Add expected salary to applications
    await queryRunner.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS expected_salary DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS expected_currency VARCHAR(3) DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS expected_pay_period VARCHAR(20) DEFAULT 'yearly'
    `);

    await queryRunner.query(`
      ALTER TABLE applications 
      ADD CONSTRAINT check_application_positive_salary 
      CHECK (expected_salary IS NULL OR expected_salary >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE applications 
      ADD CONSTRAINT check_application_pay_period 
      CHECK (expected_pay_period IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly'))
    `);

    // Note: We keep the old salary column for now to preserve existing data
    // It can be dropped in a future migration after data migration is complete
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ALTER COLUMN salary DROP NOT NULL
    `);

    // Add comment to old salary column to indicate it's deprecated
    await queryRunner.query(`
      COMMENT ON COLUMN job_posts.salary IS 'DEPRECATED: Use min_salary, max_salary, currency, pay_period instead'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove constraints
    await queryRunner.query(
      `ALTER TABLE job_posts DROP CONSTRAINT IF EXISTS check_salary_range`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts DROP CONSTRAINT IF EXISTS check_positive_salary`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts DROP CONSTRAINT IF EXISTS check_pay_period`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_salary_range`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_positive_salary`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_pay_period`,
    );
    await queryRunner.query(
      `ALTER TABLE applications DROP CONSTRAINT IF EXISTS check_application_positive_salary`,
    );
    await queryRunner.query(
      `ALTER TABLE applications DROP CONSTRAINT IF EXISTS check_application_pay_period`,
    );

    // Remove new salary columns
    await queryRunner.query(
      `ALTER TABLE job_posts DROP COLUMN IF EXISTS min_salary, DROP COLUMN IF EXISTS max_salary, DROP COLUMN IF EXISTS currency, DROP COLUMN IF EXISTS pay_period`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS preferred_min_salary, DROP COLUMN IF EXISTS preferred_max_salary, DROP COLUMN IF EXISTS preferred_currency, DROP COLUMN IF EXISTS preferred_pay_period`,
    );
    await queryRunner.query(
      `ALTER TABLE applications DROP COLUMN IF EXISTS expected_salary, DROP COLUMN IF EXISTS expected_currency, DROP COLUMN IF EXISTS expected_pay_period`,
    );

    // Restore old salary column comment
    await queryRunner.query(`COMMENT ON COLUMN job_posts.salary IS NULL`);
  }
}
