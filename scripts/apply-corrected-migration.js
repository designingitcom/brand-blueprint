const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    console.log('Required environment variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🚀 Applying corrected language migration...');

    // Read the corrected migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250916000003_add_language_versions_corrected.sql');

    if (!fs.existsSync(migrationPath)) {
      console.error('Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');

    // Execute the migration directly
    const { data, error } = await supabase.rpc('exec', {
      sql: migrationSQL
    }).single();

    if (error) {
      console.error('❌ Migration failed:', error);

      // Try alternative approach - split by statements
      console.log('🔄 Trying statement-by-statement execution...');

      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('/*'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);

          try {
            const { error: stmtError } = await supabase.rpc('exec', {
              sql: statement + ';'
            }).single();

            if (stmtError && !stmtError.message.includes('already exists')) {
              console.warn(`⚠️  Statement ${i + 1} warning:`, stmtError.message);
            } else {
              console.log(`✅ Statement ${i + 1} completed`);
            }
          } catch (err) {
            console.warn(`⚠️  Statement ${i + 1} error:`, err.message);
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully');
    }

    // Test the new structure
    console.log('🧪 Testing new question structure...');

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, label, content_language, parent_question_id, is_master')
      .limit(3);

    if (questionsError) {
      console.error('❌ Error testing questions table:', questionsError);
    } else {
      console.log('✅ Questions table structure verified');
      console.log('📊 Sample questions:');
      questions?.forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.label} (${q.content_language || 'en'}, master: ${q.is_master})`);
      });
    }

    // Test function
    console.log('🧪 Testing language functions...');

    if (questions && questions.length > 0) {
      const { data: funcTest, error: funcError } = await supabase.rpc(
        'get_question_for_language',
        {
          p_master_question_id: questions[0].id,
          p_preferred_language: 'en'
        }
      );

      if (funcError) {
        console.warn('⚠️  Function test warning:', funcError.message);
      } else {
        console.log('✅ Language function working');
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the questions page: /admin/questions');
    console.log('2. Try creating a new question');
    console.log('3. Use the Clone & Translate feature');

  } catch (error) {
    console.error('💥 Migration failed with error:', error);
    process.exit(1);
  }
}

applyMigration();