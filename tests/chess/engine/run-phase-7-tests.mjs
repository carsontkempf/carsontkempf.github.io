#!/usr/bin/env node
/**
 * Phase 7 Test Runner (Node.js)
 * Runs opening book tests in Node.js environment
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

// Mock performance API for Node.js
global.performance = {
  now: () => {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1000000;
  }
};

// Mock fetch for Node.js
global.fetch = async (url) => {
  const filePath = join(rootDir, url);
  const data = readFileSync(filePath, 'utf8');
  return {
    ok: true,
    status: 200,
    json: async () => JSON.parse(data)
  };
};

console.log('Phase 7: Opening Book & ECO Detection Tests');
console.log('============================================\n');

// Import and run tests
const { runOpeningBookTests } = await import('./opening-book-test.js');

try {
  const results = await runOpeningBookTests();

  // Exit with appropriate code
  process.exit(results.failed === 0 ? 0 : 1);
} catch (error) {
  console.error('\nFATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
}
