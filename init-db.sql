-- Initialize WorkFinder Database
-- This script runs when PostgreSQL container starts for the first time

-- Create database if not exists (already created by POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS workfinder_db;

-- Connect to the database
\c workfinder_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE workfinder_db TO workfinder_user;

-- Create schema if needed
-- CREATE SCHEMA IF NOT EXISTS public;

-- Note: Tables will be created automatically by TypeORM when the application starts
