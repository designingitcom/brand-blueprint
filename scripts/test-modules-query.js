const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testModulesQuery() {
  console.log('🔍 Testing modules query...');
  
  try {
    // Try to fetch modules with basic query first
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching modules:', error);
      
      if (error.code === 'PGRST116' || error.code === '42P01') {
        console.log('🚨 Modules table does not exist!');
        console.log('📝 We need to create the modules table...');
        
        console.log('\n🔧 Let me check what tables DO exist...');
        
        // Try some existing tables to verify connection
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('id')
          .limit(1);
          
        if (orgsError) {
          console.log('Organizations table error:', orgsError.code);
        } else {
          console.log(`✅ Organizations table exists (${orgs?.length || 0} records)`);
        }
        
        const { data: businesses, error: businessError } = await supabase
          .from('businesses')
          .select('id')
          .limit(1);
          
        if (businessError) {
          console.log('Businesses table error:', businessError.code);
        } else {
          console.log(`✅ Businesses table exists (${businesses?.length || 0} records)`);
        }
        
      }
      return;
    }

    console.log(`✅ Modules table exists with ${data?.length || 0} records`);
    if (data && data.length > 0) {
      console.log('Sample record:', JSON.stringify(data[0], null, 2));
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testModulesQuery().then(() => {
  console.log('\n✨ Test complete');
  process.exit(0);
}).catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});