import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinalSimpleDatabase1722370000000 implements MigrationInterface {
  name = 'FinalSimpleDatabase1722370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all existing tables to start fresh
    await queryRunner.query(`DROP TABLE IF EXISTS interviews CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS saved_jobs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS applications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS resumes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_posts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);

    // 1. Users table
    await queryRunner.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(254) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(150),
        phone VARCHAR(25),
        role VARCHAR(20) DEFAULT 'job_seeker' 
          CHECK (role IN ('job_seeker', 'recruiter', 'admin')),
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Companies table
    await queryRunner.query(`
      CREATE TABLE companies (
        company_id SERIAL PRIMARY KEY,
        company_name VARCHAR(200) NOT NULL,
        description TEXT,
        industry VARCHAR(100),
        website VARCHAR(255),
        logo VARCHAR(255),
        address VARCHAR(500),
        recruiter_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 3. Categories table
    await queryRunner.query(`
      CREATE TABLE categories (
        category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 4. Job Posts table
    await queryRunner.query(`
      CREATE TABLE job_posts (
        job_id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
        job_title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        location VARCHAR(200),
        salary_min DECIMAL(10,2),
        salary_max DECIMAL(10,2),
        job_type VARCHAR(20) DEFAULT 'full_time' 
          CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
        status VARCHAR(20) DEFAULT 'active' 
          CHECK (status IN ('active', 'closed', 'draft')),
        posted_date TIMESTAMP DEFAULT NOW(),
        application_deadline TIMESTAMP,
        
        CONSTRAINT check_salary_range 
          CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
      )
    `);

    // 5. Job Categories junction table
    await queryRunner.query(`
      CREATE TABLE job_categories (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
        UNIQUE(job_id, category_id)
      )
    `);

    // 6. Resumes table
    await queryRunner.query(`
      CREATE TABLE resumes (
        resume_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        education TEXT,
        experience TEXT,
        skills TEXT,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 7. Applications table
    await queryRunner.query(`
      CREATE TABLE applications (
        application_id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        resume_id INTEGER REFERENCES resumes(resume_id) ON DELETE SET NULL,
        cover_letter TEXT,
        status VARCHAR(30) DEFAULT 'pending' 
          CHECK (status IN ('pending', 'reviewing', 'interview_scheduled', 'interviewed', 'accepted', 'rejected')),
        applied_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, job_id)
      )
    `);

    // 8. Saved Jobs table
    await queryRunner.query(`
      CREATE TABLE saved_jobs (
        saved_job_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, job_id)
      )
    `);

    // 9. Notifications table
    await queryRunner.query(`
      CREATE TABLE notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'system' 
          CHECK (type IN ('application_status', 'interview_invite', 'new_job', 'system')),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 10. SIMPLE Interviews table (for scheduling only)
    await queryRunner.query(`
      CREATE TABLE interviews (
        interview_id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
        interviewer_name VARCHAR(150) NOT NULL,
        interview_date DATE NOT NULL,
        interview_time TIME NOT NULL,
        interview_location VARCHAR(300) NOT NULL,
        interview_type VARCHAR(10) DEFAULT 'offline' 
          CHECK (interview_type IN ('offline', 'online')),
        notes TEXT,
        status VARCHAR(15) DEFAULT 'scheduled' 
          CHECK (status IN ('scheduled', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create function to auto-update application status when interview is created/updated
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_application_status_on_interview()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          -- When interview is created
          UPDATE applications 
          SET status = 'interview_scheduled' 
          WHERE application_id = NEW.application_id;
        ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
          -- When interview is completed
          UPDATE applications 
          SET status = 'interviewed' 
          WHERE application_id = NEW.application_id;
        END IF;
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger
    await queryRunner.query(`
      CREATE TRIGGER interview_status_trigger
        AFTER INSERT OR UPDATE ON interviews
        FOR EACH ROW
        EXECUTE FUNCTION update_application_status_on_interview();
    `);

    // Create essential indexes
    await queryRunner.query(`
      -- Job search performance
      CREATE INDEX idx_job_posts_location ON job_posts(location);
      CREATE INDEX idx_job_posts_status ON job_posts(status);
      CREATE INDEX idx_job_posts_posted_date ON job_posts(posted_date DESC);
      CREATE INDEX idx_job_posts_company ON job_posts(company_id);
      
      -- Application tracking
      CREATE INDEX idx_applications_user ON applications(user_id);
      CREATE INDEX idx_applications_job ON applications(job_id);
      CREATE INDEX idx_applications_status ON applications(status);
      
      -- Interview scheduling
      CREATE INDEX idx_interviews_application ON interviews(application_id);
      CREATE INDEX idx_interviews_date ON interviews(interview_date);
      CREATE INDEX idx_interviews_status ON interviews(status);
      
      -- User experience
      CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);
      CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
      CREATE INDEX idx_resumes_user ON resumes(user_id);
      
      -- Company management
      CREATE INDEX idx_companies_recruiter ON companies(recruiter_id);
      
      -- Full-text search (essential only)
      CREATE INDEX idx_job_posts_title_search ON job_posts 
        USING gin(to_tsvector('english', job_title));
      CREATE INDEX idx_companies_name_search ON companies 
        USING gin(to_tsvector('english', company_name));
    `);

    // Insert sample categories
    await queryRunner.query(`
      INSERT INTO categories (category_name, description) VALUES
      ('Công nghệ thông tin', 'Các vị trí liên quan đến IT, phần mềm, phát triển web'),
      ('Marketing/Sales', 'Các vị trí marketing, bán hàng, kinh doanh'),
      ('Kế toán/Tài chính', 'Các vị trí kế toán, tài chính, ngân hàng'),
      ('Nhân sự', 'Các vị trí nhân sự, tuyển dụng, đào tạo'),
      ('Thiết kế đồ họa', 'Các vị trí thiết kế, sáng tạo, nghệ thuật'),
      ('Kỹ thuật/Xây dựng', 'Các vị trí kỹ thuật, xây dựng, cơ khí'),
      ('Giáo dục/Đào tạo', 'Các vị trí giảng dạy, đào tạo, giáo dục'),
      ('Y tế/Chăm sóc sức khỏe', 'Các vị trí y tế, chăm sóc sức khỏe'),
      ('Dịch vụ khách hàng', 'Các vị trí chăm sóc khách hàng, hỗ trợ'),
      ('Logistics/Vận chuyển', 'Các vị trí logistics, vận chuyển, kho bãi')
    `);

    // Create sample admin user
    await queryRunner.query(`
      INSERT INTO users (email, password, full_name, role) VALUES
      ('admin@workfinder.com', '$2b$10$defaulthashhere', 'System Administrator', 'admin')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS interview_status_trigger ON interviews`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_application_status_on_interview()`);

    // Drop all tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS interviews CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS saved_jobs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS applications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS resumes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_posts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
  }
}