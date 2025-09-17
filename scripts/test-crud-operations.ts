/**
 * Test script for CRUD operations
 * 
 * This script tests all the major CRUD operations for:
 * - Organizations
 * - Clients  
 * - Business Profiles
 * - Projects
 * 
 * Run with: npx tsx scripts/test-crud-operations.ts
 * 
 * Make sure you have a test user authenticated in Supabase first.
 */

import { createClient } from '@supabase/supabase-js';

// Import CRUD functions (note: these are server actions, so we'll simulate them)
// For testing purposes, we'll interact with Supabase directly

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  data?: any;
}

class CRUDTester {
  private results: TestResult[] = [];
  private createdIds: { [key: string]: string } = {};

  private log(message: string) {
    console.log(`🔍 ${message}`);
  }

  private success(test: string, data?: any) {
    this.results.push({ test, passed: true, data });
    console.log(`✅ ${test}`);
  }

  private failure(test: string, error: string) {
    this.results.push({ test, passed: false, error });
    console.log(`❌ ${test}: ${error}`);
  }

  async runAllTests() {
    console.log('🚀 Starting CRUD Operations Test Suite');
    console.log('=====================================\\n');

    // Check authentication first
    if (!(await this.checkAuthentication())) {
      console.log('❌ Authentication failed. Please sign in to continue tests.');
      return;
    }

    await this.testOrganizationCRUD();
    await this.testClientCRUD();
    await this.testBusinessProfileCRUD();
    await this.testProjectCRUD();
    
    await this.cleanup();
    this.printResults();
  }

  async checkAuthentication(): Promise<boolean> {
    this.log('Checking user authentication...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      this.failure('Authentication Check', 'No authenticated user found');
      return false;
    }
    
    this.success('Authentication Check', { email: user.email, id: user.id });
    return true;
  }

  async testOrganizationCRUD() {
    console.log('\\n📁 Testing Organization CRUD');
    console.log('-----------------------------');

    // Create organization
    this.log('Creating test organization...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const orgData = {
        name: 'Test Organization',
        slug: 'test-organization',
        industry: 'Technology',
        company_size: 'startup',
        website: 'https://testorg.com'
      };

      const { data: organization, error } = await supabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single();

      if (error) throw error;

      // Create membership
      await supabase
        .from('memberships')
        .insert({
          organization_id: organization.id,
          user_id: user!.id,
          role: 'owner'
        });

      // Create user record if needed
      await supabase
        .from('users')
        .upsert({
          id: user!.id,
          email: user!.email!,
          name: user!.user_metadata?.full_name || 'Test User'
        }, { onConflict: 'id' });

      this.createdIds.organization = organization.id;
      this.success('Create Organization', organization);
    } catch (error) {
      this.failure('Create Organization', (error as Error).message);
      return;
    }

    // Read organization
    this.log('Reading organization...');
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .select(`
          *,
          memberships(role, users(name, email))
        `)
        .eq('id', this.createdIds.organization)
        .single();

      if (error) throw error;
      this.success('Read Organization', organization);
    } catch (error) {
      this.failure('Read Organization', (error as Error).message);
    }

    // Update organization
    this.log('Updating organization...');
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .update({ 
          name: 'Updated Test Organization',
          industry: 'Updated Technology'
        })
        .eq('id', this.createdIds.organization)
        .select()
        .single();

      if (error) throw error;
      this.success('Update Organization', organization);
    } catch (error) {
      this.failure('Update Organization', (error as Error).message);
    }
  }

  async testClientCRUD() {
    if (!this.createdIds.organization) {
      this.failure('Client Tests', 'No organization to test with');
      return;
    }

    console.log('\\n🏢 Testing Client CRUD');
    console.log('---------------------');

    // Create client
    this.log('Creating test client...');
    try {
      const clientData = {
        organization_id: this.createdIds.organization,
        name: 'Test Client Business',
        slug: 'test-client-business',
        industry: 'E-commerce',
        website: 'https://testclient.com',
        locale: 'en'
      };

      const { data: client, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;
      this.createdIds.client = client.id;
      this.success('Create Client', client);
    } catch (error) {
      this.failure('Create Client', (error as Error).message);
      return;
    }

    // Read clients
    this.log('Reading clients...');
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', this.createdIds.organization);

      if (error) throw error;
      this.success('Read Clients', { count: clients.length });
    } catch (error) {
      this.failure('Read Clients', (error as Error).message);
    }

    // Update client
    this.log('Updating client...');
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .update({ 
          name: 'Updated Test Client',
          industry: 'Updated E-commerce'
        })
        .eq('id', this.createdIds.client)
        .select()
        .single();

      if (error) throw error;
      this.success('Update Client', client);
    } catch (error) {
      this.failure('Update Client', (error as Error).message);
    }
  }

  async testBusinessProfileCRUD() {
    if (!this.createdIds.client) {
      this.failure('Business Profile Tests', 'No client to test with');
      return;
    }

    console.log('\\n📋 Testing Business Profile CRUD');
    console.log('--------------------------------');

    // Create business profile
    this.log('Creating business profile...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const profileData = {
        client_id: this.createdIds.client,
        legal_name: 'Test Client Legal Name',
        founding_year: 2020,
        employee_count: 15,
        annual_revenue_min: 500000,
        annual_revenue_max: 1000000,
        business_model_structured: 'b2b',
        target_market: ['Small businesses', 'Startups'],
        primary_products: ['Software', 'Consulting'],
        current_challenges: ['Brand recognition', 'Market expansion'],
        growth_goals: ['Increase revenue', 'Expand team'],
        budget_range_structured: '25k_50k',
        timeline_urgency_structured: '3_months',
        has_existing_brand: true,
        brand_satisfaction_score: 6,
        last_updated_by: user!.id
      };

      const { data: profile, error } = await supabase
        .from('business_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      this.createdIds.businessProfile = profile.id;
      this.success('Create Business Profile', { completeness: profile.profile_completeness });
    } catch (error) {
      this.failure('Create Business Profile', (error as Error).message);
      return;
    }

    // Update business profile
    this.log('Updating business profile...');
    try {
      const { data: profile, error } = await supabase
        .from('business_profiles')
        .update({
          employee_count: 20,
          brand_satisfaction_score: 8,
          success_definition: 'Increased brand awareness and revenue growth'
        })
        .eq('id', this.createdIds.businessProfile)
        .select()
        .single();

      if (error) throw error;
      this.success('Update Business Profile', { completeness: profile.profile_completeness });
    } catch (error) {
      this.failure('Update Business Profile', (error as Error).message);
    }
  }

  async testProjectCRUD() {
    if (!this.createdIds.client) {
      this.failure('Project Tests', 'No client to test with');
      return;
    }

    console.log('\\n🚀 Testing Project CRUD');
    console.log('------------------------');

    // Create project
    this.log('Creating test project...');
    try {
      const projectData = {
        client_id: this.createdIds.client,
        name: 'Brand Refresh 2024',
        slug: 'brand-refresh-2024',
        code: 'BR2024',
        strategy_mode: 'custom',
        status: 'active'
      };

      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      this.createdIds.project = project.id;
      this.success('Create Project', project);
    } catch (error) {
      this.failure('Create Project', (error as Error).message);
      return;
    }

    // Read project with relations
    this.log('Reading project with relations...');
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(
            name,
            organization:organizations(name)
          )
        `)
        .eq('id', this.createdIds.project)
        .single();

      if (error) throw error;
      this.success('Read Project with Relations', project);
    } catch (error) {
      this.failure('Read Project with Relations', (error as Error).message);
    }

    // Update project
    this.log('Updating project...');
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .update({ 
          name: 'Updated Brand Refresh 2024',
          code: 'UBR2024'
        })
        .eq('id', this.createdIds.project)
        .select()
        .single();

      if (error) throw error;
      this.success('Update Project', project);
    } catch (error) {
      this.failure('Update Project', (error as Error).message);
    }
  }

  async cleanup() {
    console.log('\\n🧹 Cleaning up test data');
    console.log('-------------------------');

    // Delete in reverse order of creation due to foreign key constraints
    const cleanupOperations = [
      { name: 'Project', table: 'projects', id: this.createdIds.project },
      { name: 'Business Profile', table: 'business_profiles', id: this.createdIds.businessProfile },
      { name: 'Client', table: 'clients', id: this.createdIds.client },
      { name: 'Organization', table: 'organizations', id: this.createdIds.organization }
    ];

    for (const operation of cleanupOperations) {
      if (operation.id) {
        this.log(`Deleting ${operation.name}...`);
        try {
          const { error } = await supabase
            .from(operation.table)
            .delete()
            .eq('id', operation.id);

          if (error) throw error;
          this.success(`Delete ${operation.name}`, null);
        } catch (error) {
          this.failure(`Delete ${operation.name}`, (error as Error).message);
        }
      }
    }
  }

  printResults() {
    console.log('\\n📊 Test Results Summary');
    console.log('========================');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }
    
    console.log(failed === 0 ? '\\n🎉 All tests passed!' : '\\n⚠️  Some tests failed.');
  }
}

// Main execution
async function main() {
  const tester = new CRUDTester();
  await tester.runAllTests();
}

// Handle unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}