const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    console.error('\nPlease add these to your .env.local file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read the corrected migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250916074014_add_language_versions_corrected.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying language versions migration...');
    console.log('Migration file:', migrationPath);
    console.log('Migration SQL length:', migrationSQL.length, 'characters');

    // Split the migration into individual statements, handling multi-line statements properly
    const statements = migrationSQL
      .split(/;\s*(?=\n|$)/m)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== '$$');

    console.log('Found', statements.length, 'SQL statements to execute');

    let successCount = 0;
    let warningCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

      try {
        // Try to execute the statement directly using raw SQL
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          if (error.message.includes('already exists') || error.message.includes('IF NOT EXISTS')) {
            console.log('⚠️  Statement skipped (already exists)');
            warningCount++;
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        } else {
          console.log('✅ Statement executed successfully');
          successCount++;
        }
      } catch (execError) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, execError.message);
        throw execError;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);

    // Verify the migration by checking if new columns exist
    console.log('\n📋 Verifying migration...');

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, label, content_language, parent_question_id, is_master')
      .limit(3);

    if (questionsError) {
      console.warn('Could not verify questions table:', questionsError.message);
    } else {
      console.log('✅ Questions table structure verified');
      console.log('Sample questions with new fields:');
      questions.forEach(q => console.log(`  - ${q.label} [${q.content_language}] master=${q.is_master}`));
    }

    // Check if the clone function was created
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'clone_question_for_translation');

    if (funcError) {
      console.warn('Could not verify functions:', funcError.message);
    } else if (functions.length > 0) {
      console.log('✅ Clone function created successfully');
    } else {
      console.warn('⚠️  Clone function not found');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Simple SQL execution function (fallback)
async function execSqlDirect(supabase, sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    return { data, error };
  } catch (error) {
    // If exec_sql doesn't exist, try direct execution
    return await supabase.from('').select(sql);
  }
}

applyMigration();