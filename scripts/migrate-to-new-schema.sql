-- BrandBlueprint Database Migration Script
-- Migrates from 001_initial_schema.sql to 20250903000001-20250903000010 schema
-- CRITICAL: Run only after full database backup
-- Version: 1.0
-- Date: 2025-09-11

BEGIN;

-- Create a migration log table for tracking progress
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    step TEXT NOT NULL,
    status TEXT NOT NULL, -- 'started', 'completed', 'failed'
    message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Log migration start
INSERT INTO migration_log (step, status, message) 
VALUES ('migration_start', 'started', 'Beginning migration to new schema');

-- =============================================================================
-- STEP 1: CREATE NEW SCHEMA TABLES (if not exists)
-- =============================================================================

-- Load all new schema files (assumes they're already applied via migrations)
-- This step validates the new tables exist

INSERT INTO migration_log (step, status, message) 
VALUES ('validate_new_schema', 'started', 'Validating new schema exists');

-- Check critical new tables exist
DO $$
DECLARE
    missing_tables TEXT[] := '{}';
BEGIN
    -- Check for key new tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        missing_tables := array_append(missing_tables, 'organizations');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        missing_tables := array_append(missing_tables, 'clients');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
        missing_tables := array_append(missing_tables, 'business_profiles');
    END IF;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing required tables: %. Apply migrations 20250903000001-20250903000010 first.', 
            array_to_string(missing_tables, ', ');
    END IF;
    
    INSERT INTO migration_log (step, status, message, completed_at) 
    VALUES ('validate_new_schema', 'completed', 'New schema validated successfully', NOW());
END $$;

-- =============================================================================
-- STEP 2: CREATE TEMPORARY MAPPING TABLES  
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('create_mapping_tables', 'started', 'Creating temporary mapping tables');

-- Store old->new ID mappings for referential integrity
CREATE TEMP TABLE id_mappings (
    old_table TEXT,
    old_id UUID,
    new_table TEXT, 
    new_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('create_mapping_tables', 'completed', 'Mapping tables created', NOW());

-- =============================================================================
-- STEP 3: MIGRATE USER DATA
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('migrate_users', 'started', 'Migrating user data');

-- First, handle auth.users -> users table if needed
-- Note: This assumes auth.users already exists from Supabase Auth
INSERT INTO users (id, email, name, avatar_url, created_at)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'avatar_url',
    au.created_at
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Migrate user_roles if they exist in old schema
INSERT INTO users (id, email, name, created_at)
SELECT 
    ur.user_id,
    COALESCE(au.email, 'migrated-user-' || ur.user_id || '@example.com'),
    'Migrated User',
    ur.created_at
FROM user_roles ur
LEFT JOIN auth.users au ON au.id = ur.user_id
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = ur.user_id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('migrate_users', 'completed', 'User data migrated', NOW());

-- =============================================================================
-- STEP 4: CREATE ORGANIZATIONS FROM OLD BUSINESSES
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('migrate_organizations', 'started', 'Creating organizations from businesses');

-- Create organizations from old businesses table
-- Each business becomes an organization with the owner as admin
INSERT INTO organizations (id, name, slug, settings, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    b.name,
    LOWER(REGEXP_REPLACE(b.name, '[^a-zA-Z0-9]+', '-', 'g')),
    COALESCE(b.settings, '{}'),
    b.created_at,
    b.updated_at
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.slug = LOWER(REGEXP_REPLACE(b.name, '[^a-zA-Z0-9]+', '-', 'g'))
);

-- Store business -> organization mapping
INSERT INTO id_mappings (old_table, old_id, new_table, new_id)
SELECT 
    'businesses',
    b.id,
    'organizations', 
    o.id
FROM businesses b
JOIN organizations o ON o.slug = LOWER(REGEXP_REPLACE(b.name, '[^a-zA-Z0-9]+', '-', 'g'));

-- Create memberships for business owners
INSERT INTO memberships (organization_id, user_id, role, created_at)
SELECT DISTINCT
    im.new_id,
    b.owner_id,
    'owner',
    NOW()
FROM businesses b
JOIN id_mappings im ON im.old_id = b.id AND im.old_table = 'businesses'
WHERE b.owner_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO NOTHING;

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('migrate_organizations', 'completed', 'Organizations created from businesses', NOW());

-- =============================================================================
-- STEP 5: CONVERT BUSINESSES TO CLIENTS
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('migrate_clients', 'started', 'Converting businesses to clients');

-- Convert businesses to clients under their organization
INSERT INTO clients (id, organization_id, name, slug, industry, website, created_at)
SELECT 
    b.id, -- Keep same ID to maintain project relationships
    im.new_id, -- organization_id from mapping
    b.name,
    b.slug,
    b.settings->>'industry',
    b.settings->>'website',
    b.created_at
FROM businesses b
JOIN id_mappings im ON im.old_id = b.id AND im.old_table = 'businesses'
ON CONFLICT (id) DO NOTHING;

-- Create basic business profiles for migrated clients
INSERT INTO business_profiles (client_id, onboarding_completed, created_at)
SELECT 
    c.id,
    true, -- Mark as completed since they have existing data
    NOW()
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM business_profiles bp WHERE bp.client_id = c.id);

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('migrate_clients', 'completed', 'Businesses converted to clients', NOW());

-- =============================================================================
-- STEP 6: MIGRATE PROJECT DATA
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('migrate_projects', 'started', 'Migrating project data');

-- Migrate projects (business_id becomes client_id, status conversion)
UPDATE projects SET
    status = CASE 
        WHEN status = 'completed' THEN 'archived'
        WHEN status = 'in_progress' THEN 'active'
        ELSE 'active'
    END,
    strategy_mode = 'custom', -- Default to custom since old projects didn't have strategy paths
    updated_at = NOW()
WHERE status IN ('not_started', 'in_progress', 'completed');

-- Ensure all projects have valid client_id (should already be valid from businesses->clients)
-- This is a safety check
DO $$
DECLARE
    invalid_projects INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_projects
    FROM projects p
    WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = p.client_id);
    
    IF invalid_projects > 0 THEN
        RAISE EXCEPTION 'Found % projects with invalid client_id. Manual review required.', invalid_projects;
    END IF;
END $$;

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('migrate_projects', 'completed', 'Project data migrated', NOW());

-- =============================================================================
-- STEP 7: MIGRATE QUESTION/ANSWER DATA
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('migrate_answers', 'started', 'Migrating question/answer data');

-- Migrate user_answers to new answers table structure
-- Note: This assumes the new questions table has been populated with base questions
INSERT INTO answers (project_id, question_id, value_json, status, confidence, source, updated_by, created_at, updated_at)
SELECT 
    ua.project_id,
    ua.question_id,
    jsonb_build_object('text', ua.content), -- Wrap text content in JSON
    CASE 
        WHEN ua.is_approved THEN 'approved'::answer_status
        ELSE 'draft'::answer_status
    END,
    'medium'::confidence, -- Default confidence
    'user'::source_enum,
    ua.user_id,
    ua.created_at,
    ua.updated_at
FROM user_answers ua
WHERE EXISTS (SELECT 1 FROM projects p WHERE p.id = ua.project_id)
  AND EXISTS (SELECT 1 FROM questions q WHERE q.id = ua.question_id)
ON CONFLICT (project_id, question_id) DO NOTHING;

-- Migrate responses table to point to new answers
UPDATE responses SET
    status = CASE 
        WHEN status = 'ai_suggested' THEN 'draft'
        WHEN status = 'in_review' THEN 'draft'
        ELSE status
    END,
    updated_at = NOW()
WHERE status IN ('ai_suggested', 'in_review');

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('migrate_answers', 'completed', 'Answer data migrated', NOW());

-- =============================================================================
-- STEP 8: ADD INTEGRATION FIELDS
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('add_integration_fields', 'started', 'Adding integration fields');

-- Add integration settings to organizations if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'organizations' AND column_name = 'integrations') THEN
        ALTER TABLE organizations ADD COLUMN integrations JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add integration fields to business_profiles
DO $$
BEGIN
    -- QuickBooks fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'business_profiles' AND column_name = 'quickbooks_company_id') THEN
        ALTER TABLE business_profiles ADD COLUMN quickbooks_company_id TEXT;
        ALTER TABLE business_profiles ADD COLUMN quickbooks_sync_enabled BOOLEAN DEFAULT FALSE;
        ALTER TABLE business_profiles ADD COLUMN quickbooks_last_sync TIMESTAMPTZ;
    END IF;
    
    -- General integration settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'business_profiles' AND column_name = 'integration_settings') THEN
        ALTER TABLE business_profiles ADD COLUMN integration_settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add integration fields to projects
DO $$
BEGIN
    -- Slack integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'slack_channel_id') THEN
        ALTER TABLE projects ADD COLUMN slack_channel_id TEXT;
        ALTER TABLE projects ADD COLUMN slack_notifications_enabled BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Google Drive integration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'gdrive_folder_id') THEN
        ALTER TABLE projects ADD COLUMN gdrive_folder_id TEXT;
        ALTER TABLE projects ADD COLUMN gdrive_permissions_granted BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- General project integration settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'projects' AND column_name = 'integration_settings') THEN
        ALTER TABLE projects ADD COLUMN integration_settings JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add integration fields to deliverables if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverables') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'deliverables' AND column_name = 'gdrive_file_id') THEN
            ALTER TABLE deliverables ADD COLUMN gdrive_file_id TEXT;
            ALTER TABLE deliverables ADD COLUMN gdrive_share_url TEXT;
        END IF;
    END IF;
END $$;

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('add_integration_fields', 'completed', 'Integration fields added', NOW());

-- =============================================================================
-- STEP 9: CREATE INTEGRATION TRACKING TABLES
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('create_integration_tables', 'started', 'Creating integration tracking tables');

-- QuickBooks integration tracking
CREATE TABLE IF NOT EXISTS quickbooks_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    realm_id TEXT,
    last_sync_at TIMESTAMPTZ,
    sync_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, company_id)
);

-- Slack workspace connections  
CREATE TABLE IF NOT EXISTS slack_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL,
    bot_token_encrypted TEXT,
    webhook_url TEXT,
    default_channel TEXT,
    notification_types TEXT[] DEFAULT ARRAY['project_complete', 'deliverable_ready'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, workspace_id)
);

-- Google Drive folder mappings
CREATE TABLE IF NOT EXISTS gdrive_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    folder_id TEXT NOT NULL,
    folder_name TEXT,
    permissions_granted BOOLEAN DEFAULT FALSE,
    auto_sync_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- Add RLS policies for integration tables
ALTER TABLE quickbooks_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slack_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdrive_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for integration tables
CREATE POLICY "Users can access QB integrations for their orgs" ON quickbooks_integrations
    FOR ALL USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Users can access Slack integrations for their orgs" ON slack_integrations
    FOR ALL USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Users can access GDrive integrations for accessible projects" ON gdrive_integrations
    FOR ALL USING (auth.has_project_access(project_id));

-- Create indexes for integration tables
CREATE INDEX IF NOT EXISTS idx_quickbooks_integrations_org_id ON quickbooks_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_slack_integrations_org_id ON slack_integrations(organization_id);  
CREATE INDEX IF NOT EXISTS idx_gdrive_integrations_project_id ON gdrive_integrations(project_id);

-- Add updated_at triggers
CREATE TRIGGER update_quickbooks_integrations_updated_at 
    BEFORE UPDATE ON quickbooks_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slack_integrations_updated_at 
    BEFORE UPDATE ON slack_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdrive_integrations_updated_at 
    BEFORE UPDATE ON gdrive_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('create_integration_tables', 'completed', 'Integration tracking tables created', NOW());

-- =============================================================================
-- STEP 10: DATA VALIDATION
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('data_validation', 'started', 'Validating migrated data');

-- Validate data integrity
DO $$
DECLARE
    old_business_count INTEGER;
    new_client_count INTEGER;
    old_project_count INTEGER;
    new_project_count INTEGER;
    orphaned_projects INTEGER;
BEGIN
    -- Count businesses vs clients
    SELECT COUNT(*) INTO old_business_count FROM businesses;
    SELECT COUNT(*) INTO new_client_count FROM clients;
    
    IF new_client_count < old_business_count THEN
        RAISE WARNING 'Client count (%) less than business count (%). Some businesses may not have been migrated.', 
            new_client_count, old_business_count;
    END IF;
    
    -- Count projects
    SELECT COUNT(*) INTO old_project_count FROM projects;
    SELECT COUNT(*) INTO new_project_count FROM projects;
    
    IF new_project_count != old_project_count THEN
        RAISE WARNING 'Project count changed during migration: % -> %', old_project_count, new_project_count;
    END IF;
    
    -- Check for orphaned projects
    SELECT COUNT(*) INTO orphaned_projects 
    FROM projects p 
    WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = p.client_id);
    
    IF orphaned_projects > 0 THEN
        RAISE EXCEPTION 'Found % orphaned projects without valid client_id', orphaned_projects;
    END IF;
    
    -- Check all users have at least one membership
    IF EXISTS (SELECT 1 FROM users u WHERE NOT EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = u.id)) THEN
        RAISE WARNING 'Some users do not have organization memberships. They may not be able to access data.';
    END IF;
    
    INSERT INTO migration_log (step, status, message, completed_at) 
    VALUES ('data_validation', 'completed', FORMAT('Validation complete. Clients: %s, Projects: %s', new_client_count, new_project_count), NOW());
END $$;

-- =============================================================================
-- STEP 11: PERFORMANCE OPTIMIZATION
-- =============================================================================

INSERT INTO migration_log (step, status, message) 
VALUES ('performance_optimization', 'started', 'Adding performance optimizations');

-- Add indexes for common queries with integration fields
CREATE INDEX IF NOT EXISTS idx_business_profiles_quickbooks_company_id 
    ON business_profiles(quickbooks_company_id) WHERE quickbooks_company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_slack_channel 
    ON projects(slack_channel_id) WHERE slack_channel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_gdrive_folder 
    ON projects(gdrive_folder_id) WHERE gdrive_folder_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deliverables_gdrive_file 
    ON deliverables(gdrive_file_id) WHERE gdrive_file_id IS NOT NULL;

-- Add GIN indexes for JSONB integration settings
CREATE INDEX IF NOT EXISTS idx_organizations_integrations_gin 
    ON organizations USING gin(integrations);

CREATE INDEX IF NOT EXISTS idx_business_profiles_integration_settings_gin 
    ON business_profiles USING gin(integration_settings);

CREATE INDEX IF NOT EXISTS idx_projects_integration_settings_gin 
    ON projects USING gin(integration_settings);

-- Update table statistics
ANALYZE organizations;
ANALYZE clients;
ANALYZE business_profiles;
ANALYZE projects;
ANALYZE answers;

INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('performance_optimization', 'completed', 'Performance optimizations added', NOW());

-- =============================================================================
-- MIGRATION COMPLETION
-- =============================================================================

-- Final migration log entry
INSERT INTO migration_log (step, status, message, completed_at) 
VALUES ('migration_complete', 'completed', 'Migration to new schema completed successfully', NOW());

-- Summary report
DO $$
DECLARE
    migration_summary TEXT;
BEGIN
    SELECT string_agg(
        FORMAT('%s: %s (%s)', step, status, 
               COALESCE(completed_at::text, 'In Progress')), 
        E'\n'
    ) INTO migration_summary
    FROM migration_log 
    ORDER BY id;
    
    RAISE NOTICE 'MIGRATION SUMMARY:%', E'\n' || migration_summary;
END $$;

COMMIT;

-- Instructions for post-migration
/*
POST-MIGRATION CHECKLIST:

1. APPLICATION CODE UPDATES REQUIRED:
   - Update database queries to use 'clients' instead of 'businesses'
   - Update status field handling (TEXT -> ENUM)
   - Add integration field handling in forms/APIs

2. TESTING REQUIRED:
   - Verify user authentication still works
   - Test CRUD operations on clients/projects
   - Validate all existing data is accessible
   - Test new integration fields

3. OPTIONAL CLEANUP:
   - Review and potentially drop old 'businesses' table after validation
   - Remove old 'user_answers' table if fully migrated to 'answers'
   - Clean up any unused columns from old schema

4. INTEGRATION SETUP:
   - Configure QuickBooks API credentials
   - Set up Slack bot and webhook URLs  
   - Configure Google Drive service account
   - Test integration functionality

5. MONITORING:
   - Monitor application error logs for migration issues
   - Check database performance with new indexes
   - Validate RLS policies are working correctly
   - Monitor integration API success rates
*/