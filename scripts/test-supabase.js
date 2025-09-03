const { createClient } = require('@supabase/supabase-js');

// You need to get these from your Supabase dashboard
// Settings > API
const supabaseUrl = 'https://xigzapsughpuqjxttsra.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE'; // Get from dashboard

// For direct database connection (admin operations)
const databaseUrl = 'postgresql://postgres:baE53fb5GNkc*gM@db.xigzapsughpuqjxttsra.supabase.co:5432/postgres';

console.log('Supabase Project Details:');
console.log('========================');
console.log('Project URL:', supabaseUrl);
console.log('Database URL:', databaseUrl);
console.log('');
console.log('To complete setup:');
console.log('1. Go to: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/settings/api');
console.log('2. Copy the "anon public" key');
console.log('3. Copy the "service_role" key (keep this secret!)');
console.log('4. Update the .env file with these keys');
console.log('');
console.log('To run the database migration:');
console.log('1. Go to: https://supabase.com/dashboard/project/xigzapsughpuqjxttsra/sql/new');
console.log('2. Paste the contents of supabase/migrations/001_initial_schema.sql');
console.log('3. Click "Run" to create all tables');