#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Update package names to use @atluxia scope
const packages = [
  { old: '@nomad-life/db', new: '@atluxia/db' },
  { old: '@nomad-life/config', new: '@atluxia/config' },
  { old: '@nomad-life/core', new: '@atluxia/core' },
  { old: '@nomad-life/contracts', new: '@atluxia/contracts' },
  { old: '@nomad-life/rules', new: '@atluxia/rules' },
  { old: '@nomad-life/ui', new: '@atluxia/ui' },
  { old: '@polyverse/pvp-sdk-js', new: '@atluxia/pvp-sdk-js' },
  { old: 'polyverse-web', new: '@atluxia/polyverse-web' },
  { old: 'nomad-web', new: '@atluxia/nomad-web' },
  { old: 'everpath-web', new: '@atluxia/everpath-web' },
  { old: 'everpath-admin', new: '@atluxia/everpath-admin' },
  { old: 'critters-web', new: '@atluxia/critters-web' },
];

function updatePackageJson(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    let updated = content;
    
    for (const pkg of packages) {
      updated = updated.replace(new RegExp(pkg.old, 'g'), pkg.new);
    }
    
    if (updated !== content) {
      writeFileSync(filePath, updated, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Find all package.json files
import { execSync } from 'child_process';
const packageJsonFiles = execSync('find apps services packages -name "package.json"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

console.log(`Found ${packageJsonFiles.length} package.json files`);

for (const file of packageJsonFiles) {
  updatePackageJson(file);
}

console.log('Package scope update complete!');