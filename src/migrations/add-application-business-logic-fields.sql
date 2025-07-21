-- Migration: Add business logic fields to applications table
-- Date: 2025-01-21
-- Description: Add user_id and updated_at fields to support business logic validation

-- Add user_id column to applications table
ALTER TABLE applications 
ADD COLUMN user_id INTEGER;

-- Add updated_at column to applications table  
ALTER TABLE applications 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add foreign key constraint for user_id
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);

-- Update existing applications to set user_id from resume relationship
UPDATE applications a 
SET user_id = (
    SELECT r.user_id 
    FROM resumes r 
    WHERE r.resume_id = a.resume_id
)
WHERE a.user_id IS NULL;

-- Make user_id NOT NULL after updating existing records
ALTER TABLE applications 
MODIFY COLUMN user_id INTEGER NOT NULL;

-- Add unique constraint to prevent duplicate applications
ALTER TABLE applications 
ADD CONSTRAINT uk_applications_user_job 
UNIQUE (user_id, job_id);
