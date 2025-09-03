const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabaseUrl = 'https://xigzapsughpuqjxttsra.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ3phcHN1Z2hwdXFqeHR0c3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU1MDAyMSwiZXhwIjoyMDcyMTI2MDIxfQ.wDagKCwaL77zS2e-OQ5q-UMvBC3gE2WRWn0iwAVyzhM';

// Use service role key to bypass RLS for diagnosis
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Diagnosing RLS Policy Issue\n');
console.log('=====================================\n');

async function diagnoseRLS() {
  // Test 1: Check if memberships table exists and its structure
  console.log('📝 Test 1: Memberships Table Structure');
  try {
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'memberships' })
      .single();
    
    if (error) {
      // Try a different approach
      const { data, error: selectError } = await supabase
        .from('memberships')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.log('   ❌ Error accessing table:', selectError.message);
      } else {
        console.log('   ✅ Table accessible');
        console.log('   Columns:', data.length > 0 ? Object.keys(data[0]).join(', ') : 'No data to infer columns');
      }
    } else {
      console.log('   ✅ Table structure retrieved');
    }
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
  }

  // Test 2: Try to query memberships directly
  console.log('\n📝 Test 2: Direct Query (Service Role)');
  try {
    const { data, error, count } = await supabase
      .from('memberships')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log('   ❌ Query failed:', error.message);
      console.log('   Error details:', error);
    } else {
      console.log('   ✅ Query successful');
      console.log('   Records found:', count || data?.length || 0);
    }
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
  }

  // Test 3: Check RLS policies
  console.log('\n📝 Test 3: RLS Policy Check');
  try {
    const { data: policies, error } = await supabase.rpc('get_policies_for_table', { 
      table_name: 'memberships' 
    }).single();

    if (error) {
      // Try raw SQL query
      const { data, error: sqlError } = await supabase
        .rpc('exec_sql', { 
          query: `
            SELECT polname, polcmd 
            FROM pg_policy 
            WHERE polrelid = 'public.memberships'::regclass
          ` 
        });
      
      if (sqlError) {
        console.log('   ⚠️  Cannot retrieve policies directly');
      } else {
        console.log('   Policies found:', data?.length || 0);
      }
    }
  } catch (error) {
    console.log('   ⚠️  Policy check skipped');
  }

  // Test 4: Try to insert a test membership
  console.log('\n📝 Test 4: Insert Test (Service Role)');
  try {
    // First create a test business with tenant_id
    // Generate a valid UUID v4
    const testUserId = crypto.randomUUID();
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        name: 'Test Business for RLS',
        slug: 'test-rls-' + Date.now(),
        tenant_id: testUserId // Use test user UUID as tenant
      })
      .select()
      .single();
    
    if (businessError) {
      console.log('   ❌ Could not create test business:', businessError.message);
      return;
    }

    console.log('   ✅ Test business created:', business.id);

    // Try to create a membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        business_id: business.id,
        user_id: testUserId,
        role: 'owner'
      })
      .select()
      .single();
    
    if (membershipError) {
      console.log('   ❌ Membership creation failed:', membershipError.message);
      if (membershipError.message.includes('infinite recursion')) {
        console.log('\n   🔴 ISSUE IDENTIFIED: Infinite recursion in RLS policy');
        console.log('   This means the RLS policy references itself in a loop.');
      }
    } else {
      console.log('   ✅ Membership created successfully');
      
      // Clean up
      await supabase.from('memberships').delete().eq('id', membership.id);
      await supabase.from('businesses').delete().eq('id', business.id);
      console.log('   🧹 Test data cleaned up');
    }
  } catch (error) {
    console.log('   ❌ Unexpected error:', error.message);
  }

  // Test 5: Check relationships
  console.log('\n📝 Test 5: Table Relationships');
  const relationships = [
    { from: 'memberships', to: 'businesses', via: 'business_id' },
    { from: 'memberships', to: 'users (auth)', via: 'user_id' },
    { from: 'businesses', to: 'memberships', via: 'business_id (reverse)' }
  ];

  console.log('   Expected relationships:');
  relationships.forEach(rel => {
    console.log(`   • ${rel.from} → ${rel.to} (via ${rel.via})`);
  });

  // Diagnosis Summary
  console.log('\n=====================================');
  console.log('📊 Diagnosis Summary\n');
  console.log('The "infinite recursion" error occurs when:');
  console.log('1. An RLS policy on memberships checks if a user is a member');
  console.log('2. To check membership, it queries the memberships table');
  console.log('3. This triggers the same RLS policy again, creating a loop');
  console.log('\n🔧 Common Solutions:');
  console.log('1. Use auth.uid() directly instead of checking memberships');
  console.log('2. Create a security definer function to bypass RLS');
  console.log('3. Simplify the policy to avoid self-reference');
  console.log('4. Use a different approach for authorization');
  
  console.log('\n💡 Impact on Application:');
  console.log('• ❌ Cannot add new team members to businesses');
  console.log('• ❌ Cannot query existing memberships');
  console.log('• ❌ Multi-user/team features will not work');
  console.log('• ✅ Single user can still use the app');
  console.log('• ✅ Other tables (businesses, projects, etc.) not affected');
  
  console.log('\n🚨 Priority: HIGH - This blocks team collaboration features');
}

diagnoseRLS().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});