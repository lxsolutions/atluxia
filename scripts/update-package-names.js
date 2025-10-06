const fs = require('fs');
const path = require('path');

// Map of old package names to new @atluxia scoped names
const packageMappings = {
  // Apps
  'web': '@atluxia/nomad-web',
  'polyverse': '@atluxia/polyverse-web',
  
  // Services
  'api-booking': '@atluxia/booking',
  'api-drivers': '@atluxia/drivers', 
  'api-immigration': '@atluxia/immigration',
  'api-vehicles': '@atluxia/vehicles',
  'opengrid': '@atluxia/opengrid',
  'ai-router': '@atluxia/ai-router',
  'relay': '@atluxia/relay',
  'bridge-apub': '@atluxia/activitypub-bridge',
  'truth-agent': '@atluxia/truth-agent',
  'truth-graph': '@atluxia/truth-graph',
  
  // Packages
  'db': '@atluxia/db',
  'ui': '@atluxia/ui',
  'core': '@atluxia/core',
  'contracts': '@atluxia/contracts',
  'rules': '@atluxia/rules',
  'opengrid-client': '@atluxia/opengrid-client',
  'truth-archive': '@atluxia/truth-archive',
  'truth-archive-js': '@atluxia/truth-archive-js',
  'aegisgov': '@atluxia/aegisgov'
};

// Function to update package.json
function updatePackageJson(filePath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const dirName = path.basename(path.dirname(filePath));
    
    // Update package name
    if (packageMappings[dirName]) {
      packageJson.name = packageMappings[dirName];
    }
    
    // Update dependencies to use @atluxia scope
    if (packageJson.dependencies) {
      for (const [dep, version] of Object.entries(packageJson.dependencies)) {
        if (packageMappings[dep]) {
          packageJson.dependencies[packageMappings[dep]] = version;
          delete packageJson.dependencies[dep];
        }
      }
    }
    
    // Update devDependencies to use @atluxia scope
    if (packageJson.devDependencies) {
      for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
        if (packageMappings[dep]) {
          packageJson.devDependencies[packageMappings[dep]] = version;
          delete packageJson.devDependencies[dep];
        }
      }
    }
    
    // Update engines to require Node >=20 and pnpm >=9
    if (!packageJson.engines) {
      packageJson.engines = {};
    }
    packageJson.engines.node = '>=20';
    packageJson.engines.pnpm = '>=9';
    
    // Write updated package.json
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated ${filePath}`);
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
packageJsonFiles.forEach(updatePackageJson);

console.log('Package name updates completed!');