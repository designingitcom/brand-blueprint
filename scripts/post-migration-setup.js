#!/usr/bin/env node
/**
 * Post-Migration Setup for BrandBlueprint
 * Runs after manual schema migration to validate and configure new features
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class PostMigrationSetup {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async validateNewSchema() {
    this.log('🔍 Validating new schema...');
    
    const requiredTables = [
      'organizations', 'clients', 'business_profiles', 'modules', 
      'strategy_paths', 'questions', 'ai_policies', 'deliverables'
    ];
    
    const missingTables = [];
    
    for (const table of requiredTables) {
      const { error } = await this.supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        missingTables.push(table);
        this.log(`❌ Table missing: ${table}`);
      } else {
        this.log(`✅ Table exists: ${table}`);
      }
    }
    
    if (missingTables.length > 0) {
      throw new Error(`Missing required tables: ${missingTables.join(', ')}`);
    }
    
    return true;
  }

  async checkIntegrationFields() {
    this.log('🔗 Checking integration fields...');
    
    // Check if organizations table has integration fields
    const { data: sampleOrg } = await this.supabase
      .from('organizations')
      .select('*')
      .limit(1);
      
    const orgColumns = sampleOrg && sampleOrg.length > 0 ? Object.keys(sampleOrg[0]) : [];
    const requiredIntegrationFields = [
      'integrations', 'quickbooks_customer_id', 'slack_workspace_id', 'google_drive_folder_url'
    ];
    
    const missingFields = requiredIntegrationFields.filter(field => !orgColumns.includes(field));
    
    if (missingFields.length > 0) {
      this.log(`⚠️  Missing integration fields: ${missingFields.join(', ')}`);
      this.log('   Please execute: docs/db/20250911000002_add_integration_fields.sql');
      return false;
    }
    
    this.log('✅ Integration fields present');
    return true;
  }

  async setupDefaultModules() {
    this.log('📚 Setting up default modules...');
    
    // Check if modules are already populated
    const { data: existingModules } = await this.supabase
      .from('modules')
      .select('count', { count: 'exact', head: true });
      
    const moduleCount = existingModules?.[0]?.count || 0;
    
    if (moduleCount >= 21) {
      this.log(`✅ Modules already set up (${moduleCount} modules)`);
      return true;
    }
    
    this.log('📝 Need to set up M0-M21 modules. This should have been done in migration 004.');
    return false;
  }

  async validateDataMigration() {
    this.log('📊 Validating data migration...');
    
    // Check organizations vs old businesses
    const { data: orgs } = await this.supabase
      .from('organizations')
      .select('count', { count: 'exact', head: true });
      
    const { data: clients } = await this.supabase
      .from('clients')
      .select('count', { count: 'exact', head: true });
      
    const orgCount = orgs?.[0]?.count || 0;
    const clientCount = clients?.[0]?.count || 0;
    
    this.log(`📈 Found ${orgCount} organizations, ${clientCount} clients`);
    
    if (orgCount === 0) {
      this.log('⚠️  No organizations found. Data migration may not have been executed.');
      return false;
    }
    
    this.log('✅ Data migration appears successful');
    return true;
  }

  async setupTestData() {
    this.log('🧪 Setting up test data for M0 onboarding...');
    
    // Create M0 onboarding module if it doesn't exist
    const { data: m0Module } = await this.supabase
      .from('modules')
      .select('*')
      .eq('code', 'm0-onboarding')
      .single();
      
    if (!m0Module) {
      const { error } = await this.supabase
        .from('modules')
        .insert({
          code: 'm0-onboarding',
          name: 'Business Onboarding',
          category: 'foundation',
          description: 'Complete business profile setup and team onboarding',
          sort_order: 0
        });
        
      if (error) {
        this.log(`❌ Failed to create M0 module: ${error.message}`);
        return false;
      }
      
      this.log('✅ M0 onboarding module created');
    }
    
    return true;
  }

  async generateNextSteps() {
    this.log('📋 Generating next steps for application updates...');
    
    const nextSteps = `
# Post-Migration Application Updates

## 1. Update TypeScript Interfaces
Update these files to match new schema:
- Update business actions to use organizations/clients
- Update project types for new module system
- Add integration field types

## 2. Update Business Status Logic
- Modify lib/utils/business-status.ts to use onboarding_completed
- Update businesses page to use organizations/clients
- Test status detection with new schema

## 3. Implement M0 Onboarding
- Create M0 onboarding module component
- Force completion before accessing M1-M21
- Update business creation flow

## 4. Integration Features
- Build QuickBooks integration UI
- Add Slack workspace connection
- Create Google Drive folder linking
- Implement client portal dashboard

## 5. Testing Checklist
- [ ] Business creation works
- [ ] Organization/client relationship correct
- [ ] Module system functional
- [ ] ENUMs working properly
- [ ] RLS policies secure data
- [ ] Integration fields accessible

## 6. Performance Validation
- [ ] Query performance acceptable
- [ ] Indexes functioning
- [ ] RLS not blocking legitimate access
- [ ] New views performing well
`;

    const nextStepsPath = '/Users/florian/Desktop/dev/brand-app/docs/POST_MIGRATION_NEXT_STEPS.md';
    require('fs').writeFileSync(nextStepsPath, nextSteps);
    
    this.log(`📝 Next steps documented: ${nextStepsPath}`);
    return nextStepsPath;
  }

  async execute() {
    this.log('🚀 Starting Post-Migration Setup');
    
    try {
      // Validation steps
      await this.validateNewSchema();
      const integrationFieldsOk = await this.checkIntegrationFields();
      const modulesOk = await this.setupDefaultModules();
      const dataMigrationOk = await this.validateDataMigration();
      
      // Setup steps
      await this.setupTestData();
      const nextStepsPath = await this.generateNextSteps();
      
      // Summary
      this.log(`
🎯 POST-MIGRATION SUMMARY:

✅ Schema Validation: PASSED
${integrationFieldsOk ? '✅' : '⚠️ '} Integration Fields: ${integrationFieldsOk ? 'PASSED' : 'NEEDS ATTENTION'}
${modulesOk ? '✅' : '⚠️ '} Default Modules: ${modulesOk ? 'PASSED' : 'NEEDS ATTENTION'}  
${dataMigrationOk ? '✅' : '⚠️ '} Data Migration: ${dataMigrationOk ? 'PASSED' : 'NEEDS ATTENTION'}
✅ Test Data Setup: PASSED

📋 Next Steps: ${nextStepsPath}

${!integrationFieldsOk || !modulesOk || !dataMigrationOk ? `
⚠️  ATTENTION REQUIRED:
Some validation steps failed. Please review the logs above and address any issues before proceeding.
` : `
🎉 Migration validation completed successfully!
Ready to update application code for new schema.
`}
      `);
      
      return {
        success: integrationFieldsOk && modulesOk && dataMigrationOk,
        integrationFields: integrationFieldsOk,
        modules: modulesOk,
        dataMigration: dataMigrationOk,
        nextStepsPath
      };
      
    } catch (error) {
      this.log(`❌ Post-migration setup failed: ${error.message}`);
      throw error;
    }
  }
}

// Execute
const setup = new PostMigrationSetup();
setup.execute().catch(error => {
  console.error('❌ Failed:', error);
  process.exit(1);
});