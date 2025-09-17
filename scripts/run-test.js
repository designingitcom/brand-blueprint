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

// Now run the test script
try {
  execSync('npx tsx scripts/test-crud-operations.ts', { 
    stdio: 'inherit',
    env: process.env 
  });
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}