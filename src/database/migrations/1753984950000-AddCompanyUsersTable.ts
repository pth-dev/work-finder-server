import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyUsersTable1753984950000 implements MigrationInterface {
  name = 'AddCompanyUsersTable1753984950000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create company_users table
    await queryRunner.query(`
      CREATE TABLE company_users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        approved_by INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        CONSTRAINT FK_company_users_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        CONSTRAINT FK_company_users_company_id FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
        CONSTRAINT FK_company_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(user_id),
        CONSTRAINT UQ_company_users_user_id UNIQUE (user_id)
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IDX_company_users_company_id ON company_users(company_id)
    `);
    
    await queryRunner.query(`
      CREATE INDEX IDX_company_users_status ON company_users(status)
    `);

    // Create trigger to update updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_company_users_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_update_company_users_updated_at
        BEFORE UPDATE ON company_users
        FOR EACH ROW
        EXECUTE FUNCTION update_company_users_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS trigger_update_company_users_updated_at ON company_users`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_company_users_updated_at()`);
    
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_company_users_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_company_users_company_id`);
    
    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS company_users CASCADE`);
  }
}