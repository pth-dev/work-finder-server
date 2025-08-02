import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanOptimizedSchema1735568400000 implements MigrationInterface {
  name = 'CleanOptimizedSchema1735568400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all existing tables and constraints to start fresh
    await queryRunner.query(`DROP TABLE IF EXISTS notification_delivery_logs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_notification_preferences CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS notification_types CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_skills CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_skills CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS skills CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS applications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS interviews CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS saved_jobs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS followed_companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_posts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS resumes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS otps CASCADE`);

    // Create optimized users table
    await queryRunner.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        avatar VARCHAR(255),
        refresh_token TEXT,
        
        -- User role
        role VARCHAR(20) DEFAULT 'job_seeker' CHECK (role IN ('job_seeker', 'employer', 'admin')),
        
        -- Email verification and OTP
        email_verified BOOLEAN DEFAULT FALSE,
        otp_code VARCHAR(10),
        otp_expires_at TIMESTAMP,
        otp_type VARCHAR(20) CHECK (otp_type IN ('email_verification', 'password_reset')),
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create optimized companies table
    await queryRunner.query(`
      CREATE TABLE companies (
        company_id SERIAL PRIMARY KEY,
        company_name VARCHAR(200) NOT NULL,
        description TEXT,
        company_image VARCHAR(255),
        industry VARCHAR(100),
        website VARCHAR(255),
        
        -- Location and verification
        address TEXT,
        location VARCHAR(100),
        company_size VARCHAR(20) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
        is_verified BOOLEAN DEFAULT FALSE,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create optimized job_posts table
    await queryRunner.query(`
      CREATE TABLE job_posts (
        job_id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
        
        -- Job details
        job_title VARCHAR(200) NOT NULL,
        description TEXT,
        requirements TEXT,
        benefits TEXT,
        location VARCHAR(200),
        category VARCHAR(100),
        
        -- Salary structure for filtering
        salary_min DECIMAL(12,2),
        salary_max DECIMAL(12,2),
        salary VARCHAR(100), -- Keep for backward compatibility
        
        -- Job properties
        job_type VARCHAR(20) CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'freelance')),
        
        -- Status and lifecycle
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'expired')),
        posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        
        -- Engagement metrics
        view_count INTEGER DEFAULT 0,
        save_count INTEGER DEFAULT 0,
        application_count INTEGER DEFAULT 0
      )
    `);

    // Create resumes table
    await queryRunner.query(`
      CREATE TABLE resumes (
        resume_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500),
        file_size INTEGER,
        file_type VARCHAR(10),
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create applications table
    await queryRunner.query(`
      CREATE TABLE applications (
        application_id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        resume_id INTEGER NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
        
        -- Application status
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
          'pending', 'reviewing', 'shortlisted', 'interviewed', 
          'offered', 'accepted', 'rejected', 'withdrawn'
        )),
        
        -- Timestamps
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(job_id, user_id)
      )
    `);

    // Create interviews table
    await queryRunner.query(`
      CREATE TABLE interviews (
        interview_id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
        interviewer_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
        
        -- Interview details
        interview_type VARCHAR(20) DEFAULT 'video' CHECK (interview_type IN ('phone', 'video', 'onsite', 'online_test')),
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        location TEXT,
        meeting_link VARCHAR(500),
        
        -- Status and feedback
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
        notes TEXT,
        feedback TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create saved_jobs table
    await queryRunner.query(`
      CREATE TABLE saved_jobs (
        saved_job_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        job_id INTEGER NOT NULL REFERENCES job_posts(job_id) ON DELETE CASCADE,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(user_id, job_id)
      )
    `);

    // Create followed_companies table
    await queryRunner.query(`
      CREATE TABLE followed_companies (
        followed_company_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
        followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(user_id, company_id)
      )
    `);

    // Create optimized notifications table
    await queryRunner.query(`
      CREATE TABLE notifications (
        notification_id SERIAL PRIMARY KEY,
        recipient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        -- Notification content
        content TEXT NOT NULL,
        
        -- Status tracking
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        
        -- Type and priority
        notification_type VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        
        -- Expiration
        expires_at TIMESTAMP,
        
        -- Related entity tracking
        related_entity_type VARCHAR(20) CHECK (related_entity_type IN ('job_post', 'application', 'interview', 'company', 'user')),
        related_entity_id INTEGER,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create performance indexes
    
    // Users indexes
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX idx_users_role ON users(role)`);
    
    // Companies indexes
    await queryRunner.query(`CREATE INDEX idx_companies_location ON companies(location)`);
    await queryRunner.query(`CREATE INDEX idx_companies_verified ON companies(is_verified)`);
    
    // Job posts indexes - critical for search performance
    await queryRunner.query(`CREATE INDEX idx_jobs_search ON job_posts(status, category, location, posted_date DESC)`);
    await queryRunner.query(`CREATE INDEX idx_jobs_salary ON job_posts(salary_min, salary_max) WHERE salary_min IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX idx_jobs_company ON job_posts(company_id, status)`);
    await queryRunner.query(`CREATE INDEX idx_jobs_status ON job_posts(status, posted_date DESC)`);
    await queryRunner.query(`CREATE INDEX idx_jobs_expires ON job_posts(expires_at) WHERE expires_at IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX idx_jobs_category ON job_posts(category) WHERE category IS NOT NULL`);
    await queryRunner.query(`CREATE INDEX idx_jobs_location ON job_posts(location) WHERE location IS NOT NULL`);
    
    // Applications indexes
    await queryRunner.query(`CREATE INDEX idx_applications_job ON applications(job_id, status)`);
    await queryRunner.query(`CREATE INDEX idx_applications_user ON applications(user_id, status)`);
    await queryRunner.query(`CREATE INDEX idx_applications_status ON applications(status, applied_at DESC)`);
    
    // Interviews indexes
    await queryRunner.query(`CREATE INDEX idx_interviews_schedule ON interviews(scheduled_at, status)`);
    await queryRunner.query(`CREATE INDEX idx_interviews_application ON interviews(application_id)`);
    
    // Saved jobs indexes
    await queryRunner.query(`CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id, saved_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_saved_jobs_job ON saved_jobs(job_id)`);
    
    // Followed companies indexes
    await queryRunner.query(`CREATE INDEX idx_followed_companies_user ON followed_companies(user_id)`);
    await queryRunner.query(`CREATE INDEX idx_followed_companies_company ON followed_companies(company_id)`);
    
    // Notifications indexes
    await queryRunner.query(`CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC)`);
    await queryRunner.query(`CREATE INDEX idx_notifications_type ON notifications(notification_type, priority)`);
    await queryRunner.query(`CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL`);

    // Full-text search indexes for job posts
    await queryRunner.query(`CREATE INDEX idx_jobs_fulltext ON job_posts USING GIN(to_tsvector('english', job_title || ' ' || COALESCE(description, '') || ' ' || COALESCE(requirements, '')))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS notifications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS followed_companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS saved_jobs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS interviews CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS applications CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS resumes CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS job_posts CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
  }
}