const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabaseUrl = 'https://xigzapsughpuqjxttsra.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZ3phcHN1Z2hwdXFqeHR0c3JhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU1MDAyMSwiZXhwIjoyMDcyMTI2MDIxfQ.wDagKCwaL77zS2e-OQ5q-UMvBC3gE2WRWn0iwAVyzhM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔧 Applying RLS Policy Fix\n');
console.log('=====================================\n');

async function applyFix() {
  try {
    // Read the SQL script
    const sqlScript = await fs.readFile(path.join(__dirname, 'fix-rls-policy.sql'), 'utf8');
    
    // Split into individual statements (this is a simplified approach)
    // For production, you'd want to use a proper SQL parser
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim().length < 5) {
        continue;
      }

      // Get a description of what we're doing
      let description = 'SQL Statement';
      if (statement.includes('DROP POLICY')) {
        description = 'Dropping old policy';
      } else if (statement.includes('CREATE POLICY')) {
        const policyName = statement.match(/CREATE POLICY "([^"]+)"/)?.[1];
        description = `Creating policy: ${policyName}`;
      } else if (statement.includes('ALTER TABLE')) {
        description = 'Altering table RLS settings';
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        description = 'Creating helper function';
      } else if (statement.includes('CREATE INDEX')) {
        description = 'Creating index';
      } else if (statement.includes('GRANT')) {
        description = 'Granting permissions';
      }

      console.log(`Step ${i + 1}: ${description}`);
      
      try {
        // Use the Supabase RPC to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try direct execution as fallback
          // Note: This requires the pg library which we'll try to use
          console.log(`   ⚠️  RPC failed, statement might need manual execution`);
          console.log(`   Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`   ❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n=====================================');
    console.log('📊 Execution Summary\n');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);

    // Test the fix
    console.log('\n🧪 Testing the Fix\n');
    
    // Test 1: Try to query memberships
    console.log('Test 1: Query memberships table');
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*');
      
      if (error && error.message.includes('infinite recursion')) {
        console.log('   ❌ Still has recursion issue');
      } else if (error) {
        console.log('   ⚠️  Query error (might be normal if no data):', error.message);
      } else {
        console.log('   ✅ Query successful! No recursion detected');
        console.log(`   Records found: ${data?.length || 0}`);
      }
    } catch (err) {
      console.log('   ❌ Unexpected error:', err.message);
    }

    // Test 2: Try to create a test membership
    console.log('\nTest 2: Create test membership');
    const crypto = require('crypto');
    const testUserId = crypto.randomUUID();
    const testBusinessId = crypto.randomUUID();
    
    try {
      // First create a test business
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
          id: testBusinessId,
          name: 'RLS Test Business',
          slug: 'rls-test-' + Date.now(),
          tenant_id: testUserId
        })
        .select()
        .single();

      if (bizError) {
        console.log('   ⚠️  Could not create test business:', bizError.message);
      } else {
        // Try to create membership
        const { data: membership, error: memError } = await supabase
          .from('memberships')
          .insert({
            business_id: testBusinessId,
            user_id: testUserId,
            role: 'owner'
          })
          .select()
          .single();

        if (memError && memError.message.includes('infinite recursion')) {
          console.log('   ❌ Still has recursion issue');
        } else if (memError) {
          console.log('   ⚠️  Insert error:', memError.message);
        } else {
          console.log('   ✅ Membership created successfully!');
          
          // Clean up
          await supabase.from('memberships').delete().eq('id', membership.id);
          await supabase.from('businesses').delete().eq('id', testBusinessId);
          console.log('   🧹 Test data cleaned up');
        }
      }
    } catch (err) {
      console.log('   ❌ Test failed:', err.message);
    }

    console.log('\n💡 Note: Some statements may need to be run directly in Supabase SQL Editor');
    console.log('   Go to: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql/new');
    console.log('   Copy the script from: scripts/fix-rls-policy.sql');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

applyFix();