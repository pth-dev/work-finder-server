import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditFields1722345600000 implements MigrationInterface {
  name = 'AddAuditFields1722345600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add audit fields to companies table
    await queryRunner.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Add audit fields to job_posts table
    await queryRunner.query(`
      ALTER TABLE job_posts 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Add audit fields to resumes table
    await queryRunner.query(`
      ALTER TABLE resumes 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Add audit fields to interviews table
    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Add audit fields to saved_jobs table
    await queryRunner.query(`
      ALTER TABLE saved_jobs 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Add audit fields to followed_companies table
    await queryRunner.query(`
      ALTER TABLE followed_companies 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Add audit fields to notifications table
    await queryRunner.query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);

    // Create triggers to automatically update updated_at timestamps
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply triggers to all tables with updated_at
    const tablesWithUpdatedAt = [
      'companies',
      'job_posts',
      'resumes',
      'interviews',
      'saved_jobs',
      'followed_companies',
      'notifications',
      'applications',
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove triggers
    const tablesWithUpdatedAt = [
      'companies',
      'job_posts',
      'resumes',
      'interviews',
      'saved_jobs',
      'followed_companies',
      'notifications',
      'applications',
    ];

    for (const table of tablesWithUpdatedAt) {
      await queryRunner.query(
        `DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}`,
      );
    }

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column()`,
    );

    // Remove audit fields
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at`,
    );
    await queryRunner.query(
      `ALTER TABLE job_posts DROP COLUMN IF EXISTS updated_at`,
    );
    await queryRunner.query(
      `ALTER TABLE resumes DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at`,
    );
    await queryRunner.query(
      `ALTER TABLE interviews DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at`,
    );
    await queryRunner.query(
      `ALTER TABLE saved_jobs DROP COLUMN IF EXISTS updated_at`,
    );
    await queryRunner.query(
      `ALTER TABLE followed_companies DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at`,
    );
    await queryRunner.query(
      `ALTER TABLE notifications DROP COLUMN IF EXISTS updated_at`,
    );
  }
}
