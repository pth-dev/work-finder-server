import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeFieldLengthsAndRemoveUsername1722346000000
  implements MigrationInterface
{
  name = 'OptimizeFieldLengthsAndRemoveUsername1722346000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove redundant username field from users table
    // Since the system now uses email-based authentication, username is no longer needed
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS username`);

    // Extend string field lengths to accommodate real-world data
    // Email field: Increase to 254 characters (RFC 5321 standard)
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(254)`,
    );

    // Company name: Increase to 300 characters for international companies
    await queryRunner.query(
      `ALTER TABLE companies ALTER COLUMN company_name TYPE VARCHAR(300)`,
    );

    // User full name: Increase to 150 characters for international names
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN full_name TYPE VARCHAR(150)`,
    );

    // Phone number: Increase to 25 characters for international phone numbers
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(25)`,
    );

    // Job title: Increase to 250 characters for detailed job titles
    await queryRunner.query(
      `ALTER TABLE job_posts ALTER COLUMN job_title TYPE VARCHAR(250)`,
    );

    // Location: Increase to 300 characters for detailed addresses
    await queryRunner.query(
      `ALTER TABLE job_posts ALTER COLUMN location TYPE VARCHAR(300)`,
    );

    // Company industry: Increase to 150 characters for detailed industry descriptions
    await queryRunner.query(
      `ALTER TABLE companies ALTER COLUMN industry TYPE VARCHAR(150)`,
    );

    // Website URL: Increase to 500 characters for long URLs
    await queryRunner.query(
      `ALTER TABLE companies ALTER COLUMN website TYPE VARCHAR(500)`,
    );

    // Resume file path: Already 500 characters, which is adequate

    // Add additional business logic fields that were missing
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP,
      ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50),
      ADD COLUMN IF NOT EXISTS remote_allowed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS number_of_positions INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS urgency_level VARCHAR(20) DEFAULT 'normal'
    `);

    await queryRunner.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS cover_letter TEXT,
      ADD COLUMN IF NOT EXISTS availability_date DATE,
      ADD COLUMN IF NOT EXISTS application_source VARCHAR(100)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS experience_years INTEGER,
      ADD COLUMN IF NOT EXISTS current_position VARCHAR(200),
      ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'open'
    `);

    await queryRunner.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS employee_count INTEGER,
      ADD COLUMN IF NOT EXISTS founding_year INTEGER,
      ADD COLUMN IF NOT EXISTS headquarters VARCHAR(300),
      ADD COLUMN IF NOT EXISTS company_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS benefits_offered TEXT
    `);

    // Add privacy compliance fields
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS privacy_consent_date TIMESTAMP,
      ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS cookie_consent BOOLEAN DEFAULT false
    `);

    // Add constraints for new fields
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD CONSTRAINT check_number_of_positions 
      CHECK (number_of_positions > 0)
    `);

    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD CONSTRAINT check_experience_level 
      CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'lead', 'executive'))
    `);

    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD CONSTRAINT check_urgency_level 
      CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent'))
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT check_experience_years 
      CHECK (experience_years >= 0 AND experience_years <= 60)
    `);

    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT check_availability_status 
      CHECK (availability_status IN ('open', 'passive', 'not_looking', 'unavailable'))
    `);

    await queryRunner.query(`
      ALTER TABLE companies 
      ADD CONSTRAINT check_employee_count 
      CHECK (employee_count >= 1)
    `);

    await queryRunner.query(`
      ALTER TABLE companies 
      ADD CONSTRAINT check_founding_year 
      CHECK (founding_year >= 1800 AND founding_year <= EXTRACT(YEAR FROM CURRENT_DATE))
    `);

    await queryRunner.query(`
      ALTER TABLE companies 
      ADD CONSTRAINT check_company_type 
      CHECK (company_type IN ('startup', 'small_business', 'corporation', 'non_profit', 'government', 'agency', 'consulting'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove constraints
    await queryRunner.query(
      `ALTER TABLE job_posts DROP CONSTRAINT IF EXISTS check_number_of_positions`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts DROP CONSTRAINT IF EXISTS check_experience_level`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts DROP CONSTRAINT IF EXISTS check_urgency_level`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS check_experience_years`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP CONSTRAINT IF EXISTS check_availability_status`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP CONSTRAINT IF EXISTS check_employee_count`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP CONSTRAINT IF EXISTS check_founding_year`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP CONSTRAINT IF EXISTS check_company_type`,
    );

    // Remove added fields
    await queryRunner.query(
      `ALTER TABLE job_posts DROP COLUMN IF EXISTS application_deadline, DROP COLUMN IF EXISTS experience_level, DROP COLUMN IF EXISTS remote_allowed, DROP COLUMN IF EXISTS number_of_positions, DROP COLUMN IF EXISTS urgency_level`,
    );
    await queryRunner.query(
      `ALTER TABLE applications DROP COLUMN IF EXISTS cover_letter, DROP COLUMN IF EXISTS availability_date, DROP COLUMN IF EXISTS application_source`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS experience_years, DROP COLUMN IF EXISTS current_position, DROP COLUMN IF EXISTS linkedin_url, DROP COLUMN IF EXISTS portfolio_url, DROP COLUMN IF EXISTS github_url, DROP COLUMN IF EXISTS availability_status`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS employee_count, DROP COLUMN IF EXISTS founding_year, DROP COLUMN IF EXISTS headquarters, DROP COLUMN IF EXISTS company_type, DROP COLUMN IF EXISTS benefits_offered`,
    );
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN IF EXISTS privacy_consent_date, DROP COLUMN IF EXISTS data_processing_consent, DROP COLUMN IF EXISTS marketing_consent, DROP COLUMN IF EXISTS cookie_consent`,
    );

    // Revert field length changes
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE companies ALTER COLUMN company_name TYPE VARCHAR(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN full_name TYPE VARCHAR(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts ALTER COLUMN job_title TYPE VARCHAR(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts ALTER COLUMN location TYPE VARCHAR(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE companies ALTER COLUMN industry TYPE VARCHAR(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE companies ALTER COLUMN website TYPE VARCHAR(255)`,
    );

    // Restore username field (if needed for rollback)
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE`,
    );
  }
}
