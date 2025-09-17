#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixKPIChanges() {
  console.log('🔧 Fixing meaningless KPI change percentages...');

  // Find all TypeScript/JavaScript files in the app directory
  const files = glob.sync('app/**/*.{ts,tsx}', { cwd: process.cwd() });

  let totalFiles = 0;
  let totalReplacements = 0;

  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: Remove change: 0 from object literals
    const pattern1 = /, change: 0,/g;
    const matches1 = content.match(pattern1);
    if (matches1) {
      content = content.replace(pattern1, ',');
      modified = true;
      totalReplacements += matches1.length;
      console.log(`  ✅ ${file}: Removed ${matches1.length} meaningless change: 0 values`);
    }

    // Pattern 2: Handle cases where change: 0 is the last property before icon
    const pattern2 = /, change: 0, icon:/g;
    const matches2 = content.match(pattern2);
    if (matches2) {
      content = content.replace(pattern2, ', icon:');
      modified = true;
      totalReplacements += matches2.length;
      console.log(`  ✅ ${file}: Fixed ${matches2.length} change: 0 before icon`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      totalFiles++;
    }
  });

  console.log(`\n🎉 KPI Fix Complete!`);
  console.log(`📁 Files modified: ${totalFiles}`);
  console.log(`🔢 Total replacements: ${totalReplacements}`);
  console.log('\nNow KPI cards will only show percentages when they actually make sense!');
}

// Only run if glob is available, otherwise skip
try {
  require.resolve('glob');
  fixKPIChanges();
} catch (error) {
  console.log('📋 Manual fix needed: Remove "change: 0," from KPI card definitions');
  console.log('Files to check:');
  console.log('- app/businesses/page.tsx');
  console.log('- app/projects/[slug]/page.tsx');
  console.log('- app/organizations/page.tsx');
  console.log('- app/[locale] versions of the above');
}