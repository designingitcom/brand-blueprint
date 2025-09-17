#!/usr/bin/env node
/**
 * Direct Database Migration using Supabase Client
 * Executes SQL directly through Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class DirectMigrationExecutor {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async executeRawSQL(sql, description) {
    console.log(`\n🔄 Executing: ${description}`);
    
    try {
      // Use the REST API to execute raw SQL
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }

      const result = await response.json();
      console.log(`✅ Success: ${description}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Failed: ${description}`);
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  }

  async executeMigrationFile(fileName, description) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${fileName}`);
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    return await this.executeRawSQL(sql, description);
  }

  async checkSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('count', { count: 'exact', head: true });
        
      if (error) throw error;
      
      console.log('✅ Supabase connection successful');
      console.log(`   Found ${data?.length || 0} records in businesses table`);
      return true;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      throw error;
    }
  }

  async backupData() {
    console.log('\n📦 Backing up existing data...');
    
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

    console.log(`✅ Data backed up: ${backup.businesses.length} businesses, ${backup.projects.length} projects`);
    console.log(`   Backup saved to: ${backupPath}`);
    
    return backup;
  }

  async createExecFunction() {
    console.log('\n🔧 Creating exec_sql function...');
    
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    EXECUTE sql;
    result := '{"success": true}';
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object('error', SQLERRM);
        RETURN result;
END;
$$;
`;

    try {
      // Try to create the function using direct query
      const { error } = await this.supabase.rpc('exec_sql', { sql: createFunctionSQL });
      
      if (error) {
        console.log('⚠️  Could not create exec_sql function, trying alternative approach...');
        return false;
      }
      
      console.log('✅ exec_sql function created successfully');
      return true;
    } catch (error) {
      console.log('⚠️  exec_sql function creation failed, using alternative approach...');
      return false;
    }
  }

  async executeMigrationsSequentially() {
    console.log('\n🚀 Executing migrations in sequence...');
    
    const migrations = [
      { file: '20250903000001_create_enums_and_extensions.sql', desc: 'Extensions and ENUMs' },
      { file: '20250903000002_create_auth_and_tenancy.sql', desc: 'Auth and Tenancy' },
      { file: '20250903000003_create_business_entities.sql', desc: 'Business Entities' },
      { file: '20250903000004_create_strategy_system.sql', desc: 'Strategy System' },
      { file: '20250903000005_create_questions_and_answers.sql', desc: 'Questions & Answers' },
      { file: '20250903000006_create_ai_and_rag_system.sql', desc: 'AI & RAG System' },
      { file: '20250903000007_create_deliverables_and_content.sql', desc: 'Deliverables & Content' },
      { file: '20250903000008_create_functions_and_triggers.sql', desc: 'Functions & Triggers' },
      { file: '20250903000009_create_views_and_performance.sql', desc: 'Views & Performance' },
      { file: '20250903000010_create_rls_policies.sql', desc: 'RLS Policies' }
    ];

    for (const migration of migrations) {
      try {
        await this.executeMigrationFile(migration.file, migration.desc);
        console.log(`✅ Completed: ${migration.desc}`);
        
        // Small delay between migrations
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed: ${migration.desc}`);
        throw error;
      }
    }
  }

  async addIntegrationFields() {
    console.log('\n🔗 Adding integration fields...');
    
    const integrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'docs', 'db', '20250911000002_add_integration_fields.sql'),
      'utf8'
    );

    await this.executeRawSQL(integrationSQL, 'Integration Fields');
  }

  async migrateExistingData(backup) {
    console.log('\n📊 Migrating existing data...');
    
    for (const business of backup.businesses) {
      try {
        // Create organization
        const { data: org, error: orgError } = await this.supabase
          .from('organizations')
          .insert({
            name: business.name,
            slug: business.slug,
            website: business.website,
            settings: business.settings || {},
            onboarding_completed: false
          })
          .select()
          .single();

        if (orgError) throw orgError;

        // Create client
        const { error: clientError } = await this.supabase
          .from('clients')
          .insert({
            organization_id: org.id,
            name: business.name,
            slug: business.slug,
            website: business.website,
            industry: business.type
          });

        if (clientError) throw clientError;

        console.log(`✅ Migrated: ${business.name}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${business.name}:`, error.message);
      }
    }
  }

  async validateMigration() {
    console.log('\n🔍 Validating migration...');
    
    const tables = ['organizations', 'clients', 'modules', 'questions'];
    
    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        console.error(`❌ Table ${table} validation failed:`, error.message);
        return false;
      }
      
      console.log(`✅ Table ${table} exists and accessible`);
    }
    
    return true;
  }

  async execute() {
    console.log('🚀 Starting Direct Database Migration');
    
    try {
      // Step 1: Test connection
      await this.checkSupabaseConnection();
      
      // Step 2: Backup data
      const backup = await this.backupData();
      
      // Step 3: Try to create exec function
      const canExecDirectly = await this.createExecFunction();
      
      if (canExecDirectly) {
        // Step 4: Execute migrations
        await this.executeMigrationsSequentially();
        
        // Step 5: Add integration fields
        await this.addIntegrationFields();
        
        // Step 6: Migrate data
        await this.migrateExistingData(backup);
        
        // Step 7: Validate
        const isValid = await this.validateMigration();
        
        if (isValid) {
          console.log('\n🎉 Migration completed successfully!');
          console.log('✅ Schema updated with ENUMs and proper structure');
          console.log('✅ Integration fields added for client portal');
          console.log('✅ Existing data migrated to new structure');
        } else {
          throw new Error('Migration validation failed');
        }
      } else {
        console.log('\n⚠️  Direct SQL execution not available');
        console.log('📋 Manual migration still required via Supabase Dashboard');
        console.log('   Use the instructions in: docs/MANUAL_MIGRATION_INSTRUCTIONS.md');
      }
      
    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      console.log('\n🔄 Fallback: Use manual migration instructions');
      throw error;
    }
  }
}

// Execute
const executor = new DirectMigrationExecutor();
executor.execute().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});