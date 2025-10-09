import { writeFileSync } from 'fs';
import { openApiSpec } from './openapi';

// Generate OpenAPI spec file
const spec = openApiSpec;
writeFileSync('./openapi.json', JSON.stringify(spec, null, 2));
console.log('✅ OpenAPI spec generated at ./openapi.json');