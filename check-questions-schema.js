const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  // Get all columns from questions table
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
  } else if (questions && questions.length > 0) {
    console.log('Questions table columns:');
    console.log(Object.keys(questions[0]));
    console.log('\nSample question data:');
    console.log(JSON.stringify(questions[0], null, 2));
  }
}

checkSchema().catch(console.error);
