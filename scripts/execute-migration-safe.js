#!/usr/bin/env node
/**
 * Safe Database Migration for BrandBlueprint
 * Uses Supabase client methods instead of raw SQL execution
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SafeMigrationExecutor {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async backupData() {
    this.log('📦 Backing up existing data...');
    
    const { data: businesses, error: businessError } = await this.supabase
      .from('businesses')
      .select('*');
      
    if (businessError) throw businessError;

    const { data: projects, error: projectError } = await this.supabase
      .from('projects')
      .select('*');
      
    if (projectError) throw projectError;

    const backup = {
      timestamp: new Date().toISOString(),
      businesses: businesses || [],
      projects: projects || [],
      schema_version: 'pre_migration'
    };

    const backupPath = path.join(__dirname, '..', 'backups', `backup-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    this.log(`✅ Data backed up: ${backup.businesses.length} businesses, ${backup.projects.length} projects`);
    return backup;
  }

  async createManualMigrationInstructions() {
    this.log('📋 Creating manual migration instructions...');
    
    const instructions = `
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
`;

    const dataMigrationSQL = this.generateDataMigrationSQL();
    
    const fullInstructions = instructions + '\n\n```sql\n' + dataMigrationSQL + '\n```\n';
    
    const instructionsPath = path.join(__dirname, '..', 'docs', 'MANUAL_MIGRATION_INSTRUCTIONS.md');
    fs.writeFileSync(instructionsPath, fullInstructions);
    
    this.log(`✅ Manual migration instructions created: ${instructionsPath}`);
    
    return instructionsPath;
  }

  generateDataMigrationSQL() {
    // Load the backup to generate data migration SQL
    const backupFiles = fs.readdirSync(path.join(__dirname, '..', 'backups'))
      .filter(f => f.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backupFiles.length === 0) {
      return '-- No backup found. Please run backup first.';
    }

    const latestBackup = path.join(__dirname, '..', 'backups', backupFiles[0]);
    const backup = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));

    let sql = `
-- Data Migration SQL (Generated from backup)
-- Run this AFTER applying all schema migrations

BEGIN;

-- Create organizations from existing businesses
`;

    backup.businesses.forEach((business, index) => {
      sql += `
-- Migrate business: ${business.name}
INSERT INTO organizations (name, slug, website, settings) 
VALUES ('${business.name.replace(/'/g, "''")}', '${business.slug}', ${business.website ? "'" + business.website + "'" : 'NULL'}, '{}');

-- Get the organization ID for creating client
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = '${business.slug}';
    
    -- Create client record
    INSERT INTO clients (organization_id, name, slug, website, industry)
    VALUES (org_id, '${business.name.replace(/'/g, "''")}', '${business.slug}', ${business.website ? "'" + business.website + "'" : 'NULL'}, ${business.type ? "'" + business.type + "'" : 'NULL'});
    
    -- Create business profile if description exists
    ${business.description ? `
    INSERT INTO business_profiles (client_id, business_model)
    SELECT c.id, '${business.description.replace(/'/g, "''").substring(0, 50)}'
    FROM clients c WHERE c.slug = '${business.slug}';
    ` : ''}
END $$;
`;
    });

    sql += `
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
`;

    return sql;
  }

  async execute() {
    this.log('🚀 Starting Safe Database Migration for BrandBlueprint');
    
    try {
      // Step 1: Backup data
      await this.backupData();
      
      // Step 2: Create manual migration instructions
      const instructionsPath = await this.createManualMigrationInstructions();
      
      // Step 3: Show next steps
      this.log(`
🎯 NEXT STEPS:

1. ✅ Data backed up successfully
2. 📋 Manual migration instructions created

3. 🚧 MANUAL ACTIONS REQUIRED:
   - Open your Supabase Dashboard 
   - Go to SQL Editor
   - Follow instructions in: ${instructionsPath}
   - Execute each migration file in order

4. 🔄 After manual migration:
   - Run: node scripts/post-migration-setup.js
   - Update application code for new schema
   - Test all functionality

⚠️  IMPORTANT: 
- Execute migrations in the exact order specified
- Don't skip any migration files
- Verify each step completes successfully
- Keep the backup files safe
      `);
      
      this.log('✅ Safe migration preparation completed');
      
    } catch (error) {
      this.log(`❌ Migration preparation failed: ${error.message}`);
      throw error;
    }
  }
}

// Execute
const executor = new SafeMigrationExecutor();
executor.execute().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});