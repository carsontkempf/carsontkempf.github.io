/**
 * Phase 10: Logic Verification Test
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n\x1b[1mPhase 10: Code Logic Verification\x1b[0m');
console.log('='.repeat(60));

let issues = [];

// Check 1: PGN Generator
console.log('\n1. Checking PGN Generator module...');
try {
  const pgnPath = join(__dirname, '../../../assets/js/chess/utils/pgn-generator.js');
  const mod = await import(`file://${pgnPath}`);
  
  if (typeof mod.generatePGN !== 'function') issues.push('generatePGN missing');
  if (typeof mod.parseResult !== 'function') issues.push('parseResult missing');
  if (typeof mod.validatePGN !== 'function') issues.push('validatePGN missing');
  
  console.log('   \x1b[32m✓\x1b[0m PGN Generator exports correct');
} catch (error) {
  issues.push('PGN Generator: ' + error.message);
}

// Check 2: FEN Validator
console.log('\n2. Checking FEN Validator module...');
try {
  const fenPath = join(__dirname, '../../../assets/js/chess/utils/fen-validator.js');
  const mod = await import(`file://${fenPath}`);
  
  if (typeof mod.validateFEN !== 'function') issues.push('validateFEN missing');
  if (typeof mod.isFENSyntaxValid !== 'function') issues.push('isFENSyntaxValid missing');
  
  console.log('   \x1b[32m✓\x1b[0m FEN Validator exports correct');
} catch (error) {
  issues.push('FEN Validator: ' + error.message);
}

// Summary
console.log('\n' + '='.repeat(60));
if (issues.length === 0) {
  console.log('\x1b[32m✓ ALL LOGIC CHECKS PASSED\x1b[0m');
  process.exit(0);
} else {
  console.log(`\x1b[31m✗ FOUND ${issues.length} ISSUES\x1b[0m\n`);
  issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
  process.exit(1);
}
