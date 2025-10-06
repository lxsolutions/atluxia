const fs = require('fs');
const path = require('path');

// Map of old internal package names to new @atluxia scoped names
const internalPackageMappings = {
  '@nomad-life/db': '@atluxia/db',
  '@nomad-life/ui': '@atluxia/ui',
  '@nomad-life/core': '@atluxia/core',
  '@nomad-life/contracts': '@atluxia/contracts',
  '@nomad-life/rules': '@atluxia/rules',
  '@nomad-life/config': '@atluxia/nomad-config',
  '@polyverse/opengrid-client': '@atluxia/opengrid-client',
  '@polyverse/truth-archive': '@atluxia/truth-archive',
  '@polyverse/truth-archive-js': '@atluxia/truth-archive-js',
  '@polyverse/aegisgov': '@atluxia/aegisgov',
  '@polyverse/pvp-sdk-js': '@atluxia/pvp-sdk-js',
  '@polyverse/schemas': '@atluxia/schemas'
};

// Function to update package.json dependencies
function updatePackageDependencies(filePath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = false;
    
    // Update dependencies
    if (packageJson.dependencies) {
      for (const [dep, version] of Object.entries(packageJson.dependencies)) {
        if (internalPackageMappings[dep]) {
          packageJson.dependencies[internalPackageMappings[dep]] = version;
          delete packageJson.dependencies[dep];
          updated = true;
        }
      }
    }
    
    // Update devDependencies
    if (packageJson.devDependencies) {
      for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
        if (internalPackageMappings[dep]) {
          packageJson.devDependencies[internalPackageMappings[dep]] = version;
          delete packageJson.devDependencies[dep];
          updated = true;
        }
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`Updated dependencies in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

// Find all package.json files
const packageJsonFiles = [
  './apps/nomad-web/package.json',
  './apps/polyverse-web/package.json',
  './packages/db/package.json',
  './packages/truth-archive-js/package.json',
  './packages/contracts/package.json',
  './packages/rules/package.json',
  './packages/opengrid-client/package.json',
  './packages/ui/package.json',
  './packages/core/package.json',
  './packages/nomad-config/package.json',
  './packages/pvp-sdk-js/package.json',
  './packages/schemas/package.json',
  './services/drivers/package.json',
  './services/truth-graph/package.json',
  './services/vehicles/package.json',
  './services/activitypub-bridge/package.json',
  './services/opengrid/coordinator/package.json',
  './services/opengrid/ui/package.json',
  './services/immigration/package.json',
  './services/booking/package.json',
  './services/truth-agent/package.json'
];

// Update all package.json files
packageJsonFiles.forEach(updatePackageDependencies);

console.log('Internal dependency updates completed!');