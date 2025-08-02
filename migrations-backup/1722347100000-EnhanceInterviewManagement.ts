import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceInterviewManagement1722347100000
  implements MigrationInterface
{
  name = 'EnhanceInterviewManagement1722347100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add comprehensive interview management fields
    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD COLUMN IF NOT EXISTS interviewer_id INTEGER REFERENCES users(user_id),
      ADD COLUMN IF NOT EXISTS interview_duration INTEGER DEFAULT 60,
      ADD COLUMN IF NOT EXISTS interview_location VARCHAR(500),
      ADD COLUMN IF NOT EXISTS interview_type VARCHAR(50) DEFAULT 'in_person',
      ADD COLUMN IF NOT EXISTS interview_status VARCHAR(50) DEFAULT 'scheduled',
      ADD COLUMN IF NOT EXISTS interview_round INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(500),
      ADD COLUMN IF NOT EXISTS interview_notes TEXT,
      ADD COLUMN IF NOT EXISTS feedback TEXT,
      ADD COLUMN IF NOT EXISTS technical_rating INTEGER,
      ADD COLUMN IF NOT EXISTS communication_rating INTEGER,
      ADD COLUMN IF NOT EXISTS cultural_fit_rating INTEGER,
      ADD COLUMN IF NOT EXISTS overall_rating INTEGER,
      ADD COLUMN IF NOT EXISTS recommendation VARCHAR(50),
      ADD COLUMN IF NOT EXISTS next_steps TEXT,
      ADD COLUMN IF NOT EXISTS follow_up_date DATE,
      ADD COLUMN IF NOT EXISTS cancelled_reason TEXT,
      ADD COLUMN IF NOT EXISTS rescheduled_from TIMESTAMP,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP
    `);

    // Add constraints for ratings (1-10 scale)
    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_technical_rating 
      CHECK (technical_rating IS NULL OR (technical_rating >= 1 AND technical_rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_communication_rating 
      CHECK (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_cultural_fit_rating 
      CHECK (cultural_fit_rating IS NULL OR (cultural_fit_rating >= 1 AND cultural_fit_rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_overall_rating 
      CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 10))
    `);

    // Add constraints for enums
    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_interview_type 
      CHECK (interview_type IN ('in_person', 'video_call', 'phone_call', 'online_assessment', 'group_interview'))
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_interview_status 
      CHECK (interview_status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'))
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_recommendation 
      CHECK (recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'))
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_interview_round 
      CHECK (interview_round >= 1 AND interview_round <= 10)
    `);

    await queryRunner.query(`
      ALTER TABLE interviews 
      ADD CONSTRAINT check_interview_duration 
      CHECK (interview_duration > 0 AND interview_duration <= 480)
    `);

    // Create interview feedback table for multiple interviewers
    await queryRunner.query(`
      CREATE TABLE interview_feedback (
        id SERIAL PRIMARY KEY,
        interview_id INTEGER NOT NULL REFERENCES interviews(interview_id) ON DELETE CASCADE,
        interviewer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        technical_rating INTEGER,
        communication_rating INTEGER,
        cultural_fit_rating INTEGER,
        overall_rating INTEGER,
        strengths TEXT,
        weaknesses TEXT,
        feedback_notes TEXT,
        recommendation VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL,
        UNIQUE(interview_id, interviewer_id)
      )
    `);

    // Add trigger for interview_feedback updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_interview_feedback_updated_at
        BEFORE UPDATE ON interview_feedback
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add constraints for interview_feedback ratings
    await queryRunner.query(`
      ALTER TABLE interview_feedback 
      ADD CONSTRAINT check_feedback_technical_rating 
      CHECK (technical_rating IS NULL OR (technical_rating >= 1 AND technical_rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interview_feedback 
      ADD CONSTRAINT check_feedback_communication_rating 
      CHECK (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interview_feedback 
      ADD CONSTRAINT check_feedback_cultural_fit_rating 
      CHECK (cultural_fit_rating IS NULL OR (cultural_fit_rating >= 1 AND cultural_fit_rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interview_feedback 
      ADD CONSTRAINT check_feedback_overall_rating 
      CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interview_feedback 
      ADD CONSTRAINT check_feedback_recommendation 
      CHECK (recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'))
    `);

    // Create interview questions table for structured interviews
    await queryRunner.query(`
      CREATE TABLE interview_questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'behavioral',
        category VARCHAR(100),
        difficulty_level VARCHAR(20) DEFAULT 'medium',
        expected_answer TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by INTEGER REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )
    `);

    // Add trigger for interview_questions updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_interview_questions_updated_at
        BEFORE UPDATE ON interview_questions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add constraints for interview questions
    await queryRunner.query(`
      ALTER TABLE interview_questions 
      ADD CONSTRAINT check_question_type 
      CHECK (question_type IN ('technical', 'behavioral', 'situational', 'cultural', 'case_study', 'coding'))
    `);

    await queryRunner.query(`
      ALTER TABLE interview_questions 
      ADD CONSTRAINT check_difficulty_level 
      CHECK (difficulty_level IN ('easy', 'medium', 'hard'))
    `);

    // Create junction table for interview questions asked
    await queryRunner.query(`
      CREATE TABLE interview_question_responses (
        id SERIAL PRIMARY KEY,
        interview_id INTEGER NOT NULL REFERENCES interviews(interview_id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
        candidate_answer TEXT,
        interviewer_notes TEXT,
        rating INTEGER,
        time_spent_minutes INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP NULL
      )
    `);

    // Add trigger for interview_question_responses updated_at
    await queryRunner.query(`
      CREATE TRIGGER update_interview_question_responses_updated_at
        BEFORE UPDATE ON interview_question_responses
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      ALTER TABLE interview_question_responses 
      ADD CONSTRAINT check_response_rating 
      CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10))
    `);

    await queryRunner.query(`
      ALTER TABLE interview_question_responses 
      ADD CONSTRAINT check_time_spent 
      CHECK (time_spent_minutes IS NULL OR time_spent_minutes >= 0)
    `);

    // Create performance indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_interviewer_id ON interviews(interviewer_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(interview_status) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_round ON interviews(interview_round) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_type ON interviews(interview_type) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interviews_completed_at ON interviews(completed_at) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON interview_feedback(interview_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_feedback_interviewer_id ON interview_feedback(interviewer_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_feedback_recommendation ON interview_feedback(recommendation) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_questions_type ON interview_questions(question_type) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_questions_category ON interview_questions(category) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_questions_active ON interview_questions(is_active) WHERE deleted_at IS NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_responses_interview_id ON interview_question_responses(interview_id) WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_interview_responses_question_id ON interview_question_responses(question_id) WHERE deleted_at IS NULL`,
    );

    // Add full-text search for interview questions
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_interview_questions_fulltext_search 
      ON interview_questions USING gin(to_tsvector('english', 
        coalesce(question_text,'') || ' ' || 
        coalesce(category,'')
      )) 
      WHERE deleted_at IS NULL
    `);

    // Insert common interview questions
    await queryRunner.query(`
      INSERT INTO interview_questions (question_text, question_type, category, difficulty_level) VALUES
      ('Tell me about yourself and your background.', 'behavioral', 'introduction', 'easy'),
      ('Why are you interested in this position?', 'behavioral', 'motivation', 'easy'),
      ('What are your greatest strengths?', 'behavioral', 'self_assessment', 'easy'),
      ('What are your areas for improvement?', 'behavioral', 'self_assessment', 'medium'),
      ('Describe a challenging project you worked on.', 'behavioral', 'experience', 'medium'),
      ('How do you handle conflict in a team?', 'behavioral', 'teamwork', 'medium'),
      ('Where do you see yourself in 5 years?', 'behavioral', 'career_goals', 'easy'),
      ('Why are you leaving your current job?', 'behavioral', 'motivation', 'medium'),
      ('Describe your ideal work environment.', 'behavioral', 'culture_fit', 'easy'),
      ('How do you prioritize tasks when you have multiple deadlines?', 'situational', 'time_management', 'medium'),
      ('Tell me about a time you failed and how you handled it.', 'behavioral', 'resilience', 'hard'),
      ('How do you stay updated with industry trends?', 'behavioral', 'learning', 'medium'),
      ('Describe a time you had to learn something new quickly.', 'behavioral', 'adaptability', 'medium'),
      ('How do you handle stress and pressure?', 'behavioral', 'stress_management', 'medium'),
      ('What motivates you to do your best work?', 'behavioral', 'motivation', 'easy')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_interview_feedback_updated_at ON interview_feedback`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_interview_questions_updated_at ON interview_questions`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_interview_question_responses_updated_at ON interview_question_responses`,
    );

    // Remove indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interviews_interviewer_id`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_round`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_type`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_interviews_completed_at`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_feedback_interview_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_feedback_interviewer_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_feedback_recommendation`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_questions_type`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_questions_category`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_questions_active`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_responses_interview_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_responses_question_id`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_interview_questions_fulltext_search`,
    );

    // Drop tables
    await queryRunner.query(
      `DROP TABLE IF EXISTS interview_question_responses`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS interview_questions`);
    await queryRunner.query(`DROP TABLE IF EXISTS interview_feedback`);

    // Remove added columns from interviews table
    await queryRunner.query(`
      ALTER TABLE interviews 
      DROP COLUMN IF EXISTS interviewer_id,
      DROP COLUMN IF EXISTS interview_duration,
      DROP COLUMN IF EXISTS interview_location,
      DROP COLUMN IF EXISTS interview_type,
      DROP COLUMN IF EXISTS interview_status,
      DROP COLUMN IF EXISTS interview_round,
      DROP COLUMN IF EXISTS meeting_link,
      DROP COLUMN IF EXISTS interview_notes,
      DROP COLUMN IF EXISTS feedback,
      DROP COLUMN IF EXISTS technical_rating,
      DROP COLUMN IF EXISTS communication_rating,
      DROP COLUMN IF EXISTS cultural_fit_rating,
      DROP COLUMN IF EXISTS overall_rating,
      DROP COLUMN IF EXISTS recommendation,
      DROP COLUMN IF EXISTS next_steps,
      DROP COLUMN IF EXISTS follow_up_date,
      DROP COLUMN IF EXISTS cancelled_reason,
      DROP COLUMN IF EXISTS rescheduled_from,
      DROP COLUMN IF EXISTS completed_at
    `);
  }
}
