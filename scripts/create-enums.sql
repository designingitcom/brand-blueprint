-- Create proper ENUMs for the database
-- Run this in Supabase SQL Editor

-- Business Status ENUM
CREATE TYPE business_status_enum AS ENUM (
  'active',
  'onboarding', 
  'pending',
  'inactive',
  'suspended'
);

-- Project Status ENUM  
CREATE TYPE project_status_enum AS ENUM (
  'active',
  'planning',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
  'archived'
);

-- Module Status ENUM
CREATE TYPE module_status_enum AS ENUM (
  'not_started',
  'in_progress', 
  'completed',
  'skipped',
  'blocked'
);

-- Organization Type ENUM
CREATE TYPE organization_type_enum AS ENUM (
  'startup',
  'small_business',
  'enterprise',
  'nonprofit',
  'agency',
  'freelancer'
);

-- Add status columns with ENUM types to existing tables
-- Note: This will require careful migration as existing data uses TEXT

-- For businesses table (after backing up data):
-- ALTER TABLE businesses ADD COLUMN status_enum business_status_enum DEFAULT 'onboarding';
-- -- Copy existing data, then drop old column:
-- -- ALTER TABLE businesses DROP COLUMN status;
-- -- ALTER TABLE businesses RENAME COLUMN status_enum TO status;

-- For projects table:
-- ALTER TABLE projects ADD COLUMN status_enum project_status_enum DEFAULT 'planning';

-- For organizations table:
-- ALTER TABLE organizations ADD COLUMN type_enum organization_type_enum DEFAULT 'small_business';

-- Create indexes for performance
-- CREATE INDEX idx_businesses_status ON businesses(status);
-- CREATE INDEX idx_projects_status ON projects(status);
-- CREATE INDEX idx_organizations_type ON organizations(type);