
# BrandBlueprint Database Migration Instructions

Since we cannot execute raw SQL migrations directly via Supabase client, 
please follow these steps in your Supabase Dashboard:

## Step 1: Navigate to SQL Editor
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the sidebar

## Step 2: Execute Migration Files in Order

Copy and paste the contents of each file into the SQL Editor and execute:

### 1. Extensions and ENUMs
File: supabase/migrations/20250903000001_create_enums_and_extensions.sql
- Creates all ENUM types (role, module_status, etc.)
- Enables required extensions

### 2. Auth and Tenancy 
File: supabase/migrations/20250903000002_create_auth_and_tenancy.sql
- Creates organizations, users, memberships tables
- Sets up multi-tenant structure

### 3. Business Entities
File: supabase/migrations/20250903000003_create_business_entities.sql
- Creates clients and business_profiles tables
- Replaces single businesses table with proper structure

### 4. Strategy System
File: supabase/migrations/20250903000004_create_strategy_system.sql
- Creates modules, strategy_paths, project_modules
- Sets up M1-M21 module system

### 5. Questions & Answers
File: supabase/migrations/20250903000005_create_questions_and_answers.sql
- Creates questions, answers, responses tables
- Sets up 6-Question Framework

### 6. AI & RAG System
File: supabase/migrations/20250903000006_create_ai_and_rag_system.sql
- Creates AI policies, runs, messages
- Sets up vector embeddings

### 7. Deliverables & Content
File: supabase/migrations/20250903000007_create_deliverables_and_content.sql
- Creates deliverables, files, billing tables
- Sets up content management

### 8. Functions & Triggers
File: supabase/migrations/20250903000008_create_functions_and_triggers.sql
- Creates helper functions
- Sets up automated triggers

### 9. Views & Performance
File: supabase/migrations/20250903000009_create_views_and_performance.sql
- Creates performance views
- Optimizes queries

### 10. RLS Policies
File: supabase/migrations/20250903000010_create_rls_policies.sql
- Sets up Row Level Security
- Ensures data isolation

## Step 3: Add Integration Fields
File: docs/db/20250911000002_add_integration_fields.sql
- Adds QuickBooks, Slack, Google Drive integration
- Creates client portal tables

## Step 4: Migrate Existing Data

Run this after all schema changes are complete:


```sql

-- Data Migration SQL (Generated from backup)
-- Run this AFTER applying all schema migrations

BEGIN;

-- Create organizations from existing businesses

-- Migrate business: Test Business for RLS
INSERT INTO organizations (name, slug, website, settings) 
VALUES ('Test Business for RLS', 'test-rls-1756883144729', NULL, '{}');

-- Get the organization ID for creating client
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'test-rls-1756883144729';
    
    -- Create client record
    INSERT INTO clients (organization_id, name, slug, website, industry)
    VALUES (org_id, 'Test Business for RLS', 'test-rls-1756883144729', NULL, 'in_house');
    
    -- Create business profile if description exists
    
END $$;

-- Migrate business: Test Business for RLS
INSERT INTO organizations (name, slug, website, settings) 
VALUES ('Test Business for RLS', 'test-rls-1756885065469', NULL, '{}');

-- Get the organization ID for creating client
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'test-rls-1756885065469';
    
    -- Create client record
    INSERT INTO clients (organization_id, name, slug, website, industry)
    VALUES (org_id, 'Test Business for RLS', 'test-rls-1756885065469', NULL, 'in_house');
    
    -- Create business profile if description exists
    
END $$;

-- Migrate business: james bagles and subs
INSERT INTO organizations (name, slug, website, settings) 
VALUES ('james bagles and subs', 'james-bagles-and-subs', 'http://007subs.com', '{}');

-- Get the organization ID for creating client
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'james-bagles-and-subs';
    
    -- Create client record
    INSERT INTO clients (organization_id, name, slug, website, industry)
    VALUES (org_id, 'james bagles and subs', 'james-bagles-and-subs', 'http://007subs.com', 'SEO & SEM');
    
    -- Create business profile if description exists
    
    INSERT INTO business_profiles (client_id, business_model)
    SELECT c.id, 'the best subs, 007 stylle: Excepteur sint occaecat'
    FROM clients c WHERE c.slug = 'james-bagles-and-subs';
    
END $$;

-- Migrate business: Secret Service inc
INSERT INTO organizations (name, slug, website, settings) 
VALUES ('Secret Service inc', 'secret-service-inc', 'https://secrets.com', '{}');

-- Get the organization ID for creating client
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'secret-service-inc';
    
    -- Create client record
    INSERT INTO clients (organization_id, name, slug, website, industry)
    VALUES (org_id, 'Secret Service inc', 'secret-service-inc', 'https://secrets.com', 'Development');
    
    -- Create business profile if description exists
    
    INSERT INTO business_profiles (client_id, business_model)
    SELECT c.id, 'this is a serity firm..'
    FROM clients c WHERE c.slug = 'secret-service-inc';
    
END $$;

-- Migrate business: JPM
INSERT INTO organizations (name, slug, website, settings) 
VALUES ('JPM', 'jpm', 'http://jpm.com', '{}');

-- Get the organization ID for creating client
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'jpm';
    
    -- Create client record
    INSERT INTO clients (organization_id, name, slug, website, industry)
    VALUES (org_id, 'JPM', 'jpm', 'http://jpm.com', 'Web Development');
    
    -- Create business profile if description exists
    
    INSERT INTO business_profiles (client_id, business_model)
    SELECT c.id, 'jet lazer etc'
    FROM clients c WHERE c.slug = 'jpm';
    
END $$;

-- Migrate business: Hallow Games
INSERT INTO organizations (name, slug, website, settings) 
VALUES ('Hallow Games', 'hallow-games', NULL, '{}');

-- Get the organization ID for creating client
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'hallow-games';
    
    -- Create client record
    INSERT INTO clients (organization_id, name, slug, website, industry)
    VALUES (org_id, 'Hallow Games', 'hallow-games', NULL, 'Social Media');
    
    -- Create business profile if description exists
    
    INSERT INTO business_profiles (client_id, business_model)
    SELECT c.id, 'gaming comp'
    FROM clients c WHERE c.slug = 'hallow-games';
    
END $$;

COMMIT;

-- Verify migration
SELECT 
    o.name as organization_name,
    c.name as client_name,
    bp.business_model
FROM organizations o
LEFT JOIN clients c ON c.organization_id = o.id
LEFT JOIN business_profiles bp ON bp.client_id = c.id
ORDER BY o.name;

```
