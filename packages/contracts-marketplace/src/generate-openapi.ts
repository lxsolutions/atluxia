import { writeFileSync } from 'fs';
import { openApiDocument } from './openapi';

// Simple OpenAPI generation for now
const spec = JSON.stringify(openApiDocument, null, 2);
writeFileSync('openapi.json', spec);
console.log('✅ OpenAPI spec generated at openapi.json');