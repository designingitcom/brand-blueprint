/**
 * Service Role Test Script for CRUD operations
 * 
 * This script tests CRUD operations using the Supabase service role key,
 * bypassing RLS policies for automated testing. This is useful for CI/CD
 * and development environments where you need to verify the CRUD layer
 * without requiring user authentication.
 * 
 * Run with: node scripts/run-service-test.js
 * 
 * Requirements:
 * - SUPABASE_SERVICE_ROLE_KEY in environment variables
 * - Valid Supabase project URL
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create service role client that bypasses RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  data?: any;
}

class ServiceRoleCRUDTester {
  private results: TestResult[] = [];
  private createdIds: { [key: string]: string } = {};
  private testUserId = '00000000-0000-0000-0000-000000000001'; // Test user ID

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
    console.log('🚀 Starting Service Role CRUD Test Suite');
    console.log('=========================================\\n');

    // Check service role connection
    if (!(await this.checkServiceRoleConnection())) {
      console.log('❌ Service role connection failed. Please check your configuration.');
      return;
    }

    await this.setupTestUser();
    await this.testOrganizationCRUD();
    await this.testClientCRUD();
    await this.testBusinessProfileCRUD();
    await this.testProjectCRUD();
    
    await this.cleanup();
    this.printResults();
  }

  async checkServiceRoleConnection(): Promise<boolean> {
    this.log('Checking service role connection...');
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('count(*)')
        .single();
      
      if (error) {
        this.failure('Service Role Connection', (error as Error).message);
        return false;
      }
      
      this.success('Service Role Connection');
      return true;
    } catch (error) {
      this.failure('Service Role Connection', (error as Error).message);
      return false;
    }
  }

  async setupTestUser() {
    this.log('Setting up test user...');
    
    try {
      // Insert test user (bypassing auth)
      const { error } = await supabase
        .from('users')
        .upsert({
          id: this.testUserId,
          email: 'test-service@example.com',
          name: 'Service Role Test User'
        }, { onConflict: 'id' });

      if (error) throw error;
      this.success('Setup Test User');
    } catch (error) {
      this.failure('Setup Test User', (error as Error).message);
    }
  }

  async testOrganizationCRUD() {
    console.log('\\n📁 Testing Organization CRUD (Service Role)');
    console.log('--------------------------------------------');

    // Create organization
    this.log('Creating test organization...');
    try {
      const orgData = {
        name: 'Service Test Organization',
        slug: 'service-test-organization',
        industry: 'Technology',
        company_size: 'startup',
        website: 'https://servicetestorg.com'
      };

      const { data: organization, error } = await supabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single();

      if (error) throw error;

      // Create membership for test user
      await supabase
        .from('memberships')
        .insert({
          organization_id: organization.id,
          user_id: this.testUserId,
          role: 'owner'
        });

      this.createdIds.organization = organization.id;
      this.success('Create Organization (Service Role)', organization);
    } catch (error) {
      this.failure('Create Organization (Service Role)', (error as Error).message);
      return;
    }

    // Test read, update operations
    await this.testOrganizationRead();
    await this.testOrganizationUpdate();
  }

  async testOrganizationRead() {
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
      this.success('Read Organization (Service Role)', organization);
    } catch (error) {
      this.failure('Read Organization (Service Role)', (error as Error).message);
    }
  }

  async testOrganizationUpdate() {
    this.log('Updating organization...');
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .update({ 
          name: 'Updated Service Test Organization',
          industry: 'Updated Technology'
        })
        .eq('id', this.createdIds.organization)
        .select()
        .single();

      if (error) throw error;
      this.success('Update Organization (Service Role)', organization);
    } catch (error) {
      this.failure('Update Organization (Service Role)', (error as Error).message);
    }
  }

  async testClientCRUD() {
    if (!this.createdIds.organization) {
      this.failure('Client Tests', 'No organization to test with');
      return;
    }

    console.log('\\n🏢 Testing Client CRUD (Service Role)');
    console.log('-------------------------------------');

    // Create client
    this.log('Creating test client...');
    try {
      const clientData = {
        organization_id: this.createdIds.organization,
        name: 'Service Test Client Business',
        slug: 'service-test-client-business',
        industry: 'E-commerce',
        website: 'https://servicetestclient.com',
        locale: 'en'
      };

      const { data: client, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;
      this.createdIds.client = client.id;
      this.success('Create Client (Service Role)', client);
    } catch (error) {
      this.failure('Create Client (Service Role)', (error as Error).message);
      return;
    }

    // Test read and update
    await this.testClientRead();
    await this.testClientUpdate();
  }

  async testClientRead() {
    this.log('Reading clients...');
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', this.createdIds.organization);

      if (error) throw error;
      this.success('Read Clients (Service Role)', { count: clients.length });
    } catch (error) {
      this.failure('Read Clients (Service Role)', (error as Error).message);
    }
  }

  async testClientUpdate() {
    this.log('Updating client...');
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .update({ 
          name: 'Updated Service Test Client',
          industry: 'Updated E-commerce'
        })
        .eq('id', this.createdIds.client)
        .select()
        .single();

      if (error) throw error;
      this.success('Update Client (Service Role)', client);
    } catch (error) {
      this.failure('Update Client (Service Role)', (error as Error).message);
    }
  }

  async testBusinessProfileCRUD() {
    if (!this.createdIds.client) {
      this.failure('Business Profile Tests', 'No client to test with');
      return;
    }

    console.log('\\n📋 Testing Business Profile CRUD (Service Role)');
    console.log('-----------------------------------------------');

    // Create business profile
    this.log('Creating business profile...');
    try {
      const profileData = {
        client_id: this.createdIds.client,
        legal_name: 'Service Test Client Legal Name',
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
        last_updated_by: this.testUserId
      };

      const { data: profile, error } = await supabase
        .from('business_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      this.createdIds.businessProfile = profile.id;
      this.success('Create Business Profile (Service Role)', { completeness: profile.profile_completeness });
    } catch (error) {
      this.failure('Create Business Profile (Service Role)', (error as Error).message);
      return;
    }

    await this.testBusinessProfileUpdate();
  }

  async testBusinessProfileUpdate() {
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
      this.success('Update Business Profile (Service Role)', { completeness: profile.profile_completeness });
    } catch (error) {
      this.failure('Update Business Profile (Service Role)', (error as Error).message);
    }
  }

  async testProjectCRUD() {
    if (!this.createdIds.client) {
      this.failure('Project Tests', 'No client to test with');
      return;
    }

    console.log('\\n🚀 Testing Project CRUD (Service Role)');
    console.log('-------------------------------------');

    // Create project
    this.log('Creating test project...');
    try {
      const projectData = {
        client_id: this.createdIds.client,
        name: 'Service Brand Refresh 2024',
        slug: 'service-brand-refresh-2024',
        code: 'SBR2024',
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
      this.success('Create Project (Service Role)', project);
    } catch (error) {
      this.failure('Create Project (Service Role)', (error as Error).message);
      return;
    }

    await this.testProjectRead();
    await this.testProjectUpdate();
  }

  async testProjectRead() {
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
      this.success('Read Project with Relations (Service Role)', project);
    } catch (error) {
      this.failure('Read Project with Relations (Service Role)', (error as Error).message);
    }
  }

  async testProjectUpdate() {
    this.log('Updating project...');
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .update({ 
          name: 'Updated Service Brand Refresh 2024',
          code: 'USBR2024'
        })
        .eq('id', this.createdIds.project)
        .select()
        .single();

      if (error) throw error;
      this.success('Update Project (Service Role)', project);
    } catch (error) {
      this.failure('Update Project (Service Role)', (error as Error).message);
    }
  }

  async cleanup() {
    console.log('\\n🧹 Cleaning up test data');
    console.log('-------------------------');

    // Delete in reverse order due to foreign key constraints
    const cleanupOperations = [
      { name: 'Project', table: 'projects', id: this.createdIds.project },
      { name: 'Business Profile', table: 'business_profiles', id: this.createdIds.businessProfile },
      { name: 'Client', table: 'clients', id: this.createdIds.client },
      { name: 'Membership', table: 'memberships', id: null, where: { organization_id: this.createdIds.organization } },
      { name: 'Organization', table: 'organizations', id: this.createdIds.organization },
      { name: 'Test User', table: 'users', id: this.testUserId }
    ];

    for (const operation of cleanupOperations) {
      if (operation.id || operation.where) {
        this.log(`Deleting ${operation.name}...`);
        try {
          let query = supabase.from(operation.table).delete();
          
          if (operation.id) {
            query = query.eq('id', operation.id);
          } else if (operation.where) {
            Object.entries(operation.where).forEach(([key, value]) => {
              query = query.eq(key, value);
            });
          }

          const { error } = await query;
          if (error) throw error;
          this.success(`Delete ${operation.name} (Service Role)`, null);
        } catch (error) {
          this.failure(`Delete ${operation.name} (Service Role)`, (error as Error).message);
        }
      }
    }
  }

  printResults() {
    console.log('\\n📊 Service Role Test Results Summary');
    console.log('=====================================');
    
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
    
    console.log(failed === 0 ? '\\n🎉 All service role tests passed!' : '\\n⚠️  Some service role tests failed.');
  }
}

// Main execution
async function main() {
  const tester = new ServiceRoleCRUDTester();
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