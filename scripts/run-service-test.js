#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read .env file and set environment variables
const envFile = fs.readFileSync('.env', 'utf8');
const envLines = envFile.split('\n');

envLines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
});

// Check if service role key is available
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required for service role tests');
  console.error('   Please add it to your .env file');
  process.exit(1);
}

// Now run the service role test script
try {
  console.log('🔧 Running CRUD tests with service role authentication...\n');
  execSync('npx tsx scripts/test-crud-service-role.ts', { 
    stdio: 'inherit',
    env: process.env 
  });
} catch (error) {
  console.error('Service role test failed:', error.message);
  process.exit(1);
}