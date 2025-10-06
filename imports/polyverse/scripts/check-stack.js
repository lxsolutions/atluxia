#!/usr/bin/env node

/**
 * Check PolyVerse stack status for v0.4 baseline
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Checking PolyVerse v0.4 baseline...\n');

// Check if key directories exist
const requiredDirs = [
  'apps/polyverse',
  'services/relay',
  'services/indexer',
  'services/truth-graph',
  'services/consensus',
  'services/reputation',
  'services/ai-router',
  'services/bridge-apub',
  'packages/pvp-sdk-js',
  'packages/truth-archive',
  'infra'
];

console.log('📁 Checking directory structure...');
let allDirsExist = true;

requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
  if (!exists) allDirsExist = false;
});

// Check if key files exist
const requiredFiles = [
  'Makefile',
  'infra/docker-compose.yml',
  'docs/architecture-v0.4.md',
  'feature-flags.json',
  'TASKS.md'
];

console.log('\n📄 Checking key files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check package.json for v0.4 readiness
console.log('\n📦 Checking package configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasWorkspaces = packageJson.workspaces && packageJson.workspaces.length > 0;
  console.log(`  ${hasWorkspaces ? '✅' : '❌'} Workspaces configured`);
  
  const hasScripts = packageJson.scripts && Object.keys(packageJson.scripts).length > 0;
  console.log(`  ${hasScripts ? '✅' : '❌'} Build scripts available`);
} catch (error) {
  console.log('  ❌ Could not read package.json');
}

// Summary
console.log('\n📊 Summary:');
console.log(`  Directories: ${allDirsExist ? '✅ All present' : '❌ Missing some'}`);
console.log(`  Files: ${allFilesExist ? '✅ All present' : '❌ Missing some'}`);

if (allDirsExist && allFilesExist) {
  console.log('\n🎉 v0.4 baseline ready! Proceed with Task 1.');
} else {
  console.log('\n⚠️  Some baseline requirements missing. Check the items above.');
}

console.log('\n🚀 Next: Execute Task 1 - Media Service');