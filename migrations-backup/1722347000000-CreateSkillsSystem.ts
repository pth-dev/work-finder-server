import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSkillsSystem1722347000000 implements MigrationInterface {
  name = 'CreateSkillsSystem1722347000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create skills table
    await queryRunner.query(`
      CREATE TABLE skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50),
        description TEXT,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )
    `);

    // Add trigger for skills updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_skills_updated_at
        BEFORE UPDATE ON skills
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create job_skills junction table (many-to-many between jobs and skills)
    await queryRunner.query(`
      CREATE TABLE job_skills (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        is_required BOOLEAN DEFAULT true,
        proficiency_level VARCHAR(20) DEFAULT 'intermediate',
        years_required INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        UNIQUE(job_id, skill_id)
      )
    `);

    // Add trigger for job_skills updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_job_skills_updated_at
        BEFORE UPDATE ON job_skills
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create user_skills junction table (many-to-many between users and skills)
    await queryRunner.query(`
      CREATE TABLE user_skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        proficiency_level VARCHAR(20) DEFAULT 'intermediate',
        years_experience INTEGER,
        is_endorsed BOOLEAN DEFAULT false,
        last_used_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        UNIQUE(user_id, skill_id)
      )
    `);

    // Add trigger for user_skills updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_user_skills_updated_at
        BEFORE UPDATE ON user_skills
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add constraints for proficiency levels
    await queryRunner.query(`
      ALTER TABLE job_skills 
      ADD CONSTRAINT check_job_proficiency_level 
      CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert'))
    `);

    await queryRunner.query(`
      ALTER TABLE user_skills 
      ADD CONSTRAINT check_user_proficiency_level 
      CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert'))
    `);

    await queryRunner.query(`
      ALTER TABLE job_skills 
      ADD CONSTRAINT check_years_required 
      CHECK (years_required IS NULL OR years_required >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE user_skills 
      ADD CONSTRAINT check_years_experience 
      CHECK (years_experience IS NULL OR years_experience >= 0)
    `);

    // Add skill category constraint
    await queryRunner.query(`
      ALTER TABLE skills 
      ADD CONSTRAINT check_skill_category 
      CHECK (category IN ('technical', 'soft', 'language', 'certification', 'tool', 'framework', 'methodology'))
    `);

    // Create indexes for performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_skills_verified ON skills(is_verified) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills(job_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_skills_skill_id ON job_skills(skill_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_job_skills_required ON job_skills(is_required) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_skills_proficiency ON user_skills(proficiency_level) WHERE deleted_at IS NULL`,
    );

    // Add full-text search for skills
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_skills_fulltext_search 
      ON skills USING gin(to_tsvector('english', 
        coalesce(name,'') || ' ' || 
        coalesce(description,'')
      )) 
      WHERE deleted_at IS NULL
    `);

    // Insert common technical skills
    await queryRunner.query(`
      INSERT INTO skills (name, category, description, is_verified) VALUES
      ('JavaScript', 'technical', 'Programming language for web development', true),
      ('TypeScript', 'technical', 'Typed superset of JavaScript', true),
      ('React', 'framework', 'JavaScript library for building user interfaces', true),
      ('Node.js', 'technical', 'JavaScript runtime environment', true),
      ('PostgreSQL', 'technical', 'Relational database management system', true),
      ('Docker', 'tool', 'Containerization platform', true),
      ('Git', 'tool', 'Version control system', true),
      ('AWS', 'technical', 'Amazon Web Services cloud platform', true),
      ('REST API', 'methodology', 'Representational State Transfer architecture', true),
      ('GraphQL', 'technical', 'Query language for APIs', true),
      ('MongoDB', 'technical', 'NoSQL database', true),
      ('Redis', 'technical', 'In-memory data structure store', true),
      ('Kubernetes', 'tool', 'Container orchestration platform', true),
      ('Python', 'technical', 'High-level programming language', true),
      ('Java', 'technical', 'Object-oriented programming language', true),
      ('C#', 'technical', 'Microsoft programming language', true),
      ('PHP', 'technical', 'Server-side scripting language', true),
      ('Ruby', 'technical', 'Dynamic programming language', true),
      ('Go', 'technical', 'Programming language developed by Google', true),
      ('Rust', 'technical', 'Systems programming language', true),
      ('Communication', 'soft', 'Ability to convey information effectively', true),
      ('Leadership', 'soft', 'Ability to guide and motivate teams', true),
      ('Problem Solving', 'soft', 'Analytical thinking and solution finding', true),
      ('Project Management', 'soft', 'Planning and executing projects', true),
      ('Agile', 'methodology', 'Iterative development methodology', true),
      ('Scrum', 'methodology', 'Agile framework for product development', true),
      ('English', 'language', 'International business language', true),
      ('Spanish', 'language', 'Widely spoken language', true),
      ('French', 'language', 'International language', true),
      ('German', 'language', 'European business language', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_skills_updated_at ON skills`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_job_skills_updated_at ON job_skills`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_user_skills_updated_at ON user_skills`,
    );

    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skills_name`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skills_category`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skills_verified`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_skills_job_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_skills_skill_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_job_skills_required`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_skills_user_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_skills_skill_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_skills_proficiency`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_skills_fulltext_search`);

    // Drop tables (cascade will handle foreign key constraints)
    await queryRunner.query(`DROP TABLE IF EXISTS user_skills`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_skills`);
    await queryRunner.query(`DROP TABLE IF EXISTS skills`);
  }
}
