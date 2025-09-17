-- BrandBlueprint Database Rollback Script
-- Rollback from new schema (20250903000001-20250903000010) to old schema (001_initial_schema.sql)
-- CRITICAL: Only run if migration failed or needs to be reversed
-- Version: 1.0
-- Date: 2025-09-11

BEGIN;

-- Create rollback log table
CREATE TABLE IF NOT EXISTS rollback_log (
    id SERIAL PRIMARY KEY,
    step TEXT NOT NULL,
    status TEXT NOT NULL, -- 'started', 'completed', 'failed'
    message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

INSERT INTO rollback_log (step, status, message) 
VALUES ('rollback_start', 'started', 'Beginning rollback to old schema');

-- =============================================================================
-- STEP 1: VALIDATE ROLLBACK SAFETY
-- =============================================================================

INSERT INTO rollback_log (step, status, message) 
VALUES ('validate_rollback', 'started', 'Validating rollback safety');

-- Check if migration_log exists to confirm a migration occurred
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migration_log') THEN
        RAISE EXCEPTION 'No migration_log found. This database may not have been migrated.';
    END IF;
    
    -- Check if migration completed successfully
    IF NOT EXISTS (SELECT 1 FROM migration_log WHERE step = 'migration_complete' AND status = 'completed') THEN
        RAISE WARNING 'Migration may not have completed successfully. Proceeding with rollback anyway.';
    END IF;
END $$;

INSERT INTO rollback_log (step, status, message, completed_at) 
VALUES ('validate_rollback', 'completed', 'Rollback validation complete', NOW());

-- =============================================================================
-- STEP 2: PRESERVE CRITICAL DATA THAT MIGHT BE LOST
-- =============================================================================

INSERT INTO rollback_log (step, status, message) 
VALUES ('preserve_data', 'started', 'Preserving critical data before rollback');

-- Create temporary tables to preserve important data that might not exist in old schema
CREATE TEMP TABLE preserved_organizations AS 
SELECT * FROM organizations;

CREATE TEMP TABLE preserved_business_profiles AS 
SELECT * FROM business_profiles;

CREATE TEMP TABLE preserved_memberships AS 
SELECT * FROM memberships;

-- Preserve integration data
CREATE TEMP TABLE preserved_integration_settings AS
SELECT 
    'organization' as entity_type, 
    id::text as entity_id, 
    integrations as settings,
    created_at
FROM organizations 
WHERE integrations IS NOT NULL AND integrations != '{}'
UNION ALL
SELECT 
    'business_profile' as entity_type,
    id::text as entity_id,
    integration_settings as settings,
    created_at  
FROM business_profiles 
WHERE integration_settings IS NOT NULL AND integration_settings != '{}'
UNION ALL
SELECT 
    'project' as entity_type,
    id::text as entity_id,
    integration_settings as settings,
    created_at
FROM projects 
WHERE integration_settings IS NOT NULL AND integration_settings != '{}';

-- Preserve external integration tables
CREATE TEMP TABLE preserved_quickbooks_integrations AS 
SELECT * FROM quickbooks_integrations WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quickbooks_integrations');

CREATE TEMP TABLE preserved_slack_integrations AS 
SELECT * FROM slack_integrations WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slack_integrations');

CREATE TEMP TABLE preserved_gdrive_integrations AS 
SELECT * FROM gdrive_integrations WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gdrive_integrations');

INSERT INTO rollback_log (step, status, message, completed_at) 
VALUES ('preserve_data', 'completed', 'Critical data preserved in temp tables', NOW());

-- =============================================================================
-- STEP 3: RESTORE OLD SCHEMA STRUCTURE
-- =============================================================================

INSERT INTO rollback_log (step, status, message) 
VALUES ('restore_old_schema', 'started', 'Restoring old schema structure');

-- Recreate businesses table if it doesn't exist or restore from clients
DO $$
BEGIN
    -- If businesses table doesn't exist, recreate it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
        CREATE TABLE businesses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL DEFAULT 'in_house', -- 'agency' or 'in_house'
            owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            tenant_id UUID NOT NULL DEFAULT auth.uid(),
            settings JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy
        CREATE POLICY "Users can access businesses they're members of" 
        ON businesses FOR ALL 
        USING (
            owner_id = auth.uid() OR
            id IN (
                SELECT business_id FROM memberships 
                WHERE user_id = auth.uid()
            )
        );
        
        -- Create indexes
        CREATE INDEX idx_businesses_owner ON businesses(owner_id);
        CREATE INDEX idx_businesses_slug ON businesses(slug);
        
        RAISE NOTICE 'Recreated businesses table';
    END IF;
END $$;

-- Restore projects table to old structure (TEXT status instead of new ENUM)
DO $$
BEGIN
    -- Convert project status back to old values
    UPDATE projects SET status = CASE 
        WHEN status = 'archived' THEN 'completed'
        WHEN status = 'active' THEN 'in_progress'  
        ELSE 'not_started'
    END
    WHERE status IN ('archived', 'active');
    
    -- Remove new columns that didn't exist in old schema
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'strategy_mode') THEN
        ALTER TABLE projects DROP COLUMN IF EXISTS strategy_mode;
        ALTER TABLE projects DROP COLUMN IF EXISTS strategy_path_id;
        ALTER TABLE projects DROP COLUMN IF EXISTS base_project_id;
    END IF;
    
    -- Remove integration columns
    ALTER TABLE projects DROP COLUMN IF EXISTS slack_channel_id;
    ALTER TABLE projects DROP COLUMN IF EXISTS slack_notifications_enabled;
    ALTER TABLE projects DROP COLUMN IF EXISTS gdrive_folder_id;  
    ALTER TABLE projects DROP COLUMN IF EXISTS gdrive_permissions_granted;
    ALTER TABLE projects DROP COLUMN IF EXISTS integration_settings;
    
    RAISE NOTICE 'Restored projects table to old structure';
END $$;

INSERT INTO rollback_log (step, status, message, completed_at) 
VALUES ('restore_old_schema', 'completed', 'Old schema structure restored', NOW());

-- =============================================================================
-- STEP 4: MIGRATE DATA BACK TO OLD FORMAT
-- =============================================================================

INSERT INTO rollback_log (step, status, message) 
VALUES ('migrate_data_back', 'started', 'Migrating data back to old format');

-- Restore businesses from clients data  
INSERT INTO businesses (id, name, slug, type, owner_id, tenant_id, settings, created_at, updated_at)
SELECT 
    c.id,
    c.name,
    c.slug,
    'in_house', -- Default type
    m.user_id, -- Get owner from memberships 
    m.user_id, -- Use user_id as tenant_id for backward compatibility
    jsonb_build_object(
        'industry', COALESCE(c.industry, 'technology'),
        'website', c.website
    ),
    c.created_at,
    NOW()
FROM clients c
JOIN memberships m ON m.organization_id = c.organization_id
WHERE m.role = 'owner'
  AND NOT EXISTS (SELECT 1 FROM businesses b WHERE b.id = c.id)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- Restore user_answers table structure if it was changed
DO $$
BEGIN
    -- Convert new answers back to old user_answers format
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'answers') THEN
        INSERT INTO user_answers (project_id, question_id, user_id, tenant_id, content, is_approved, version_number, created_at, updated_at)
        SELECT 
            a.project_id,
            a.question_id,
            COALESCE(a.updated_by, (SELECT owner_id FROM businesses b JOIN projects p ON p.client_id = b.id WHERE p.id = a.project_id)),
            (SELECT owner_id FROM businesses b JOIN projects p ON p.client_id = b.id WHERE p.id = a.project_id), -- tenant_id
            COALESCE(a.value_json->>'text', a.value_json::text), -- Extract text from JSON
            (a.status = 'approved'),
            1, -- Default version
            a.created_at,
            a.updated_at
        FROM answers a
        WHERE NOT EXISTS (SELECT 1 FROM user_answers ua WHERE ua.project_id = a.project_id AND ua.question_id = a.question_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

INSERT INTO rollback_log (step, status, message, completed_at) 
VALUES ('migrate_data_back', 'completed', 'Data migrated back to old format', NOW());

-- =============================================================================
-- STEP 5: DROP NEW SCHEMA ELEMENTS  
-- =============================================================================

INSERT INTO rollback_log (step, status, message) 
VALUES ('cleanup_new_schema', 'started', 'Cleaning up new schema elements');

-- Drop integration tracking tables
DROP TABLE IF EXISTS quickbooks_integrations CASCADE;
DROP TABLE IF EXISTS slack_integrations CASCADE;
DROP TABLE IF EXISTS gdrive_integrations CASCADE;

-- Drop new tables that don't exist in old schema (in reverse dependency order)
DROP TABLE IF EXISTS project_canonical_values CASCADE;
DROP TABLE IF EXISTS framework_bindings CASCADE;
DROP TABLE IF EXISTS framework_fields CASCADE;  
DROP TABLE IF EXISTS frameworks CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS review_requests CASCADE;
DROP TABLE IF EXISTS answer_revisions CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS module_question_overrides CASCADE;
DROP TABLE IF EXISTS question_dependencies CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS module_set_modules CASCADE;
DROP TABLE IF EXISTS module_sets CASCADE;
DROP TABLE IF EXISTS project_modules CASCADE;
DROP TABLE IF EXISTS strategy_path_modules CASCADE;
DROP TABLE IF EXISTS module_dependencies CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS strategy_paths CASCADE;
DROP TABLE IF EXISTS business_profiles CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop new ENUMs
DROP TYPE IF EXISTS role CASCADE;
DROP TYPE IF EXISTS invitation_status CASCADE;
DROP TYPE IF EXISTS strategy_mode_enum CASCADE;
DROP TYPE IF EXISTS module_source_enum CASCADE;
DROP TYPE IF EXISTS module_status CASCADE;
DROP TYPE IF EXISTS module_visibility CASCADE;  
DROP TYPE IF EXISTS module_dependency_type_enum CASCADE;
DROP TYPE IF EXISTS answer_status CASCADE;
DROP TYPE IF EXISTS confidence CASCADE;
DROP TYPE IF EXISTS canonical_status CASCADE;
DROP TYPE IF EXISTS source_enum CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS framework_code CASCADE;
DROP TYPE IF EXISTS sixq_slot CASCADE;
DROP TYPE IF EXISTS ai_provider CASCADE;
DROP TYPE IF EXISTS ai_run_status CASCADE;
DROP TYPE IF EXISTS ai_message_role_enum CASCADE;
DROP TYPE IF EXISTS deliverable_type CASCADE;
DROP TYPE IF EXISTS deliverable_status CASCADE;
DROP TYPE IF EXISTS approval_decision CASCADE;
DROP TYPE IF EXISTS export_format_enum CASCADE;
DROP TYPE IF EXISTS job_status_enum CASCADE;
DROP TYPE IF EXISTS company_size_enum CASCADE;
DROP TYPE IF EXISTS budget_range_enum CASCADE;
DROP TYPE IF EXISTS timeline_urgency_enum CASCADE;
DROP TYPE IF EXISTS business_model_enum CASCADE;
DROP TYPE IF EXISTS plan_code CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS auth.user_organizations() CASCADE;
DROP FUNCTION IF EXISTS auth.is_org_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS auth.has_project_access(UUID) CASCADE;

INSERT INTO rollback_log (step, status, message, completed_at) 
VALUES ('cleanup_new_schema', 'completed', 'New schema elements cleaned up', NOW());

-- =============================================================================
-- STEP 6: RESTORE OLD CONSTRAINTS AND INDEXES
-- =============================================================================

INSERT INTO rollback_log (step, status, message) 
VALUES ('restore_constraints', 'started', 'Restoring old constraints and indexes');

-- Restore old project constraints if needed
DO $$
BEGIN
    -- Add back old-style status check constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name LIKE '%status%' 
                   AND table_name = 'projects') THEN
        ALTER TABLE projects ADD CONSTRAINT projects_status_check 
        CHECK (status IN ('not_started', 'in_progress', 'completed'));
    END IF;
END $$;

-- Recreate old indexes
CREATE INDEX IF NOT EXISTS idx_projects_business ON projects(client_id); -- Note: still uses client_id
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(client_id, slug);

INSERT INTO rollback_log (step, status, message, completed_at) 
VALUES ('restore_constraints', 'completed', 'Old constraints and indexes restored', NOW());

-- =============================================================================
-- STEP 7: DATA VALIDATION
-- =============================================================================

INSERT INTO rollback_log (step, status, message) 
VALUES ('validate_rollback_data', 'started', 'Validating rollback data integrity');

-- Validate rollback was successful
DO $$
DECLARE
    business_count INTEGER;
    project_count INTEGER;  
    answer_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO business_count FROM businesses;
    SELECT COUNT(*) INTO project_count FROM projects;  
    SELECT COUNT(*) INTO answer_count FROM user_answers;
    
    IF business_count = 0 THEN
        RAISE WARNING 'No businesses found after rollback. Data may have been lost.';
    END IF;
    
    IF project_count = 0 THEN
        RAISE WARNING 'No projects found after rollback. Data may have been lost.';
    END IF;
    
    -- Check for orphaned projects
    IF EXISTS (SELECT 1 FROM projects p WHERE NOT EXISTS (SELECT 1 FROM businesses b WHERE b.id = p.client_id)) THEN
        RAISE WARNING 'Some projects are orphaned (no matching business). Manual cleanup may be required.';
    END IF;
    
    INSERT INTO rollback_log (step, status, message, completed_at) 
    VALUES ('validate_rollback_data', 'completed', 
           FORMAT('Rollback validation complete. Businesses: %s, Projects: %s, Answers: %s', 
                  business_count, project_count, answer_count), NOW());
END $$;

-- =============================================================================
-- ROLLBACK COMPLETION
-- =============================================================================

-- Final rollback log entry
INSERT INTO rollback_log (step, status, message, completed_at) 
VALUES ('rollback_complete', 'completed', 'Rollback to old schema completed successfully', NOW());

-- Summary report
DO $$
DECLARE
    rollback_summary TEXT;
BEGIN
    SELECT string_agg(
        FORMAT('%s: %s (%s)', step, status, 
               COALESCE(completed_at::text, 'In Progress')), 
        E'\n'
    ) INTO rollback_summary
    FROM rollback_log 
    ORDER BY id;
    
    RAISE NOTICE 'ROLLBACK SUMMARY:%', E'\n' || rollback_summary;
END $$;

-- Create a summary table for post-rollback analysis
CREATE TABLE rollback_data_summary AS
SELECT 
    'businesses' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM businesses
UNION ALL
SELECT 
    'projects',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)  
FROM projects
UNION ALL
SELECT 
    'user_answers',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
FROM user_answers
UNION ALL
SELECT 
    'preserved_integration_settings',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
FROM preserved_integration_settings;

COMMIT;

-- Instructions for post-rollback
/*
POST-ROLLBACK CHECKLIST:

1. APPLICATION CODE UPDATES REQUIRED:
   - Revert database queries back to 'businesses' from 'clients'
   - Revert status field handling (ENUM -> TEXT)
   - Remove integration field handling from forms/APIs
   - Restore old RLS policy expectations

2. TESTING REQUIRED:
   - Verify user authentication works with old schema
   - Test CRUD operations on businesses/projects  
   - Validate all pre-migration data is accessible
   - Confirm old application functionality works

3. DATA RECOVERY:
   - Review preserved_integration_settings table for integration data
   - Manual restore of any critical data from temp tables if needed
   - Verify no data loss occurred during rollback

4. INTEGRATION CLEANUP:
   - Disable QuickBooks API connections (tokens are preserved in temp table)
   - Disable Slack bot and webhooks  
   - Revoke Google Drive service account access
   - Notify users that integrations are temporarily unavailable

5. MONITORING:
   - Monitor application for rollback-related errors
   - Check database performance with old schema
   - Validate old RLS policies are working correctly
   - Monitor for any data inconsistencies

6. FUTURE PLANNING:
   - Analyze what caused the need for rollback
   - Plan improvements for next migration attempt
   - Consider keeping integration data in preserved tables for future use

PRESERVED DATA LOCATIONS:
- Integration settings: preserved_integration_settings (temp table)
- QuickBooks data: preserved_quickbooks_integrations (temp table)
- Slack data: preserved_slack_integrations (temp table)  
- Google Drive data: preserved_gdrive_integrations (temp table)
- Organizations: preserved_organizations (temp table)
- Business profiles: preserved_business_profiles (temp table)
- Memberships: preserved_memberships (temp table)

Note: Temp tables will be lost when the session ends. 
Export important data before closing the connection.
*/