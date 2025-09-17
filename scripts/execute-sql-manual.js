#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 RLS Policy Fix - Manual Execution Instructions');
console.log('='.repeat(60));
console.log('');

// Read the SQL file
const sqlFilePath = path.join(__dirname, '..', 'fix-organizations-rls.sql');

if (!fs.existsSync(sqlFilePath)) {
  console.error(`❌ SQL file not found: ${sqlFilePath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('📋 INSTRUCTIONS:');
console.log('1. Copy the SQL statements below');
console.log('2. Go to your Supabase dashboard > SQL Editor');
console.log('3. Paste and execute the SQL statements');
console.log('4. Or run them via psql if you have direct database access');
console.log('');
console.log('🗒️  SQL TO EXECUTE:');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('');
console.log('✅ After execution, this will:');
console.log('   • Remove problematic restrictive RLS policies');
console.log('   • Create simple policies that allow authenticated users to create organizations');
console.log('   • Give service role full access for server actions');
console.log('   • Use simple auth.uid() IS NOT NULL checks instead of complex membership lookups');
console.log('');
console.log('🔔 Note: These policies are permissive for now to fix the immediate issue.');
console.log('   You can make them more restrictive later based on your business logic.');
console.log('');