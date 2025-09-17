#!/usr/bin/env node
/**
 * BrandBlueprint Database Migration Executor
 * Safely migrates from old schema to new comprehensive schema
 * 
 * Usage: node execute-migration.js [--dry-run] [--step=N]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class MigrationExecutor {
  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.migrationSteps = [];
  }

  async log(step, status, message = '') {
    const logEntry = {
      step,
      status,
      message,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[${logEntry.timestamp}] ${step}: ${status} - ${message}`);
    
    if (!this.dryRun) {
      try {
        await this.supabase.from('migration_log').insert(logEntry);
      } catch (error) {
        console.warn('Could not log to database:', error.message);
      }
    }
  }

  async executeSQL(sql, description) {
    this.log(description, 'started');
    
    if (this.dryRun) {
      console.log(`[DRY RUN] Would execute: ${description}`);
      console.log('SQL Preview:', sql.substring(0, 200) + '...');
      this.log(description, 'completed', 'Dry run - SQL not executed');
      return { success: true };
    }

    try {
      const { data, error } = await this.supabase.rpc('exec', { sql });
      
      if (error) {
        this.log(description, 'failed', error.message);
        throw error;
      }
      
      this.log(description, 'completed');
      return { success: true, data };
    } catch (error) {
      this.log(description, 'failed', error.message);
      throw error;
    }
  }

  async loadMigrationFiles() {
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const migrationFiles = [
      '20250903000001_create_enums_and_extensions.sql',
      '20250903000002_create_auth_and_tenancy.sql',
      '20250903000003_create_business_entities.sql',
      '20250903000004_create_strategy_system.sql',
      '20250903000005_create_questions_and_answers.sql',
      '20250903000006_create_ai_and_rag_system.sql',
      '20250903000007_create_deliverables_and_content.sql',
      '20250903000008_create_functions_and_triggers.sql',
      '20250903000009_create_views_and_performance.sql',
      '20250903000010_create_rls_policies.sql'
    ];

    const migrations = [];
    for (const fileName of migrationFiles) {
      const filePath = path.join(migrationsDir, fileName);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        migrations.push({ fileName, content });
      } else {
        console.warn(`Migration file not found: ${fileName}`);
      }
    }

    return migrations;
  }

  async backupExistingData() {
    console.log('\n=== STEP 1: BACKING UP EXISTING DATA ===');
    
    // Get all existing business data
    const { data: businesses, error: businessError } = await this.supabase
      .from('businesses')
      .select('*');
      
    if (businessError) throw businessError;

    // Get all existing project data  
    const { data: projects, error: projectError } = await this.supabase
      .from('projects')
      .select('*');
      
    if (projectError) throw projectError;

    // Save backup to file
    const backup = {
      timestamp: new Date().toISOString(),
      businesses: businesses || [],
      projects: projects || [],
      schema_version: 'pre_migration'
    };

    const backupPath = path.join(__dirname, '..', 'backups', `backup-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`✅ Data backed up to: ${backupPath}`);
    console.log(`   - ${businesses?.length || 0} businesses`);
    console.log(`   - ${projects?.length || 0} projects`);

    return backup;
  }

  async applyNewSchema() {
    console.log('\n=== STEP 2: APPLYING NEW SCHEMA ===');
    
    const migrations = await this.loadMigrationFiles();
    
    for (const migration of migrations) {
      console.log(`Applying: ${migration.fileName}`);
      
      try {
        await this.executeSQL(migration.content, `apply_${migration.fileName}`);
        console.log(`✅ Applied: ${migration.fileName}`);
      } catch (error) {
        console.error(`❌ Failed: ${migration.fileName}`);
        throw error;
      }
    }
  }

  async migrateBusinessData(backup) {
    console.log('\n=== STEP 3: MIGRATING BUSINESS DATA ===');

    for (const business of backup.businesses) {
      // Create organization for each business owner
      const orgData = {
        name: business.name,
        slug: business.slug,
        website: business.website,
        settings: business.settings || {},
        onboarding_completed: false // Will be determined by business completeness
      };

      console.log(`Creating organization: ${business.name}`);
      
      if (!this.dryRun) {
        const { data: org, error: orgError } = await this.supabase
          .from('organizations')
          .insert(orgData)
          .select()
          .single();

        if (orgError) {
          console.error(`Failed to create organization for ${business.name}:`, orgError);
          continue;
        }

        // Create client record
        const clientData = {
          organization_id: org.id,
          name: business.name,
          slug: business.slug,
          website: business.website,
          industry: business.type // Map old type to industry
        };

        const { error: clientError } = await this.supabase
          .from('clients')
          .insert(clientData);

        if (clientError) {
          console.error(`Failed to create client for ${business.name}:`, clientError);
        }

        console.log(`✅ Migrated: ${business.name}`);
      } else {
        console.log(`[DRY RUN] Would migrate: ${business.name}`);
      }
    }
  }

  async addIntegrationFields() {
    console.log('\n=== STEP 4: ADDING INTEGRATION FIELDS ===');
    
    const integrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'docs', 'db', '20250911000002_add_integration_fields.sql'),
      'utf8'
    );

    await this.executeSQL(integrationSQL, 'add_integration_fields');
    console.log('✅ Integration fields added');
  }

  async validateMigration() {
    console.log('\n=== STEP 5: VALIDATION ===');
    
    // Check that new tables exist
    const tablesToCheck = ['organizations', 'clients', 'business_profiles', 'modules'];
    
    for (const table of tablesToCheck) {
      const { data, error } = await this.supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        console.error(`❌ Table ${table} missing or inaccessible:`, error);
        throw error;
      } else {
        console.log(`✅ Table ${table} exists (${data?.length || 0} records)`);
      }
    }

    // Check ENUMs exist
    const { data: enums } = await this.supabase.rpc('exec', {
      sql: "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;"
    });

    console.log(`✅ ENUMs created: ${enums?.map(e => e.typname).join(', ')}`);
  }

  async execute(startStep = 1) {
    console.log('🚀 Starting BrandBlueprint Database Migration');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);
    console.log(`Starting from step: ${startStep}\n`);

    try {
      let backup;

      if (startStep <= 1) {
        backup = await this.backupExistingData();
      }

      if (startStep <= 2) {
        await this.applyNewSchema();
      }

      if (startStep <= 3) {
        if (!backup) {
          // Load backup if we're starting from a later step
          const backupFiles = fs.readdirSync(path.join(__dirname, '..', 'backups'))
            .filter(f => f.startsWith('backup-'))
            .sort()
            .reverse();
          
          if (backupFiles.length > 0) {
            const latestBackup = path.join(__dirname, '..', 'backups', backupFiles[0]);
            backup = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
            console.log(`Using backup: ${backupFiles[0]}`);
          }
        }

        if (backup) {
          await this.migrateBusinessData(backup);
        }
      }

      if (startStep <= 4) {
        await this.addIntegrationFields();
      }

      if (startStep <= 5) {
        await this.validateMigration();
      }

      console.log('\n🎉 Migration completed successfully!');
      console.log('Next steps:');
      console.log('1. Update your application code to use new schema');
      console.log('2. Test all functionality');
      console.log('3. Update business status logic');

    } catch (error) {
      console.error('\n❌ Migration failed:', error.message);
      console.log('Check migration_log table for details');
      console.log('Use rollback script if needed');
      throw error;
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const stepArg = args.find(arg => arg.startsWith('--step='));
const startStep = stepArg ? parseInt(stepArg.split('=')[1]) : 1;

if (args.includes('--help')) {
  console.log(`
BrandBlueprint Database Migration Executor

Usage: node execute-migration.js [options]

Options:
  --dry-run     Preview changes without executing
  --step=N      Start from step N (1-5)
  --help        Show this help

Steps:
  1. Backup existing data
  2. Apply new schema
  3. Migrate business data  
  4. Add integration fields
  5. Validate migration
`);
  process.exit(0);
}

// Execute migration
const executor = new MigrationExecutor(dryRun);
executor.execute(startStep).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});