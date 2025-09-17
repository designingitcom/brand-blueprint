import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 Starting database setup...');
  
  const migrations = [
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

  for (const migration of migrations) {
    console.log(`📝 Running migration: ${migration}`);
    
    try {
      const sql = readFileSync(
        join(process.cwd(), 'supabase', 'migrations', migration),
        'utf-8'
      );
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`❌ Error in ${migration}:`, error);
        // Continue with next migration
      } else {
        console.log(`✅ ${migration} completed`);
      }
    } catch (err) {
      console.error(`❌ Failed to run ${migration}:`, err);
    }
  }
  
  console.log('✨ Database setup complete!');
}

runMigrations().catch(console.error);