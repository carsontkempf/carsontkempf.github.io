/**
 * Phase 10: Game Management Tests - Node.js Runner
 * Tests PGN generation and FEN validation modules
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load modules
const pgnGeneratorPath = join(__dirname, '../../../assets/js/chess/utils/pgn-generator.js');
const fenValidatorPath = join(__dirname, '../../../assets/js/chess/utils/fen-validator.js');

const { generatePGN, parseResult, validatePGN } = await import(`file://${pgnGeneratorPath}`);
const { validateFEN, isFENSyntaxValid } = await import(`file://${fenValidatorPath}`);

let testResults = [];

function addTest(category, name, passed, error = null) {
  testResults.push({ category, name, passed, error });
  const status = passed ? '\x1b[32m✓ PASS\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m';
  console.log(`  ${status} ${name}`);
  if (error) {
    console.log(`    \x1b[31mError: ${error}\x1b[0m`);
  }
}

// PGN Generation Tests
console.log('\n\x1b[1m1. PGN Generation Tests\x1b[0m');

// Test 1.1: Basic PGN generation
try {
  const moveHistory = [
    { san: 'e4' },
    { san: 'e5' },
    { san: 'Nf3' },
    { san: 'Nc6' }
  ];

  const metadata = {
    white: 'Player',
    black: 'Engine',
    result: '1-0',
    eco: 'C50',
    opening: 'Italian Game'
  };

  const pgn = generatePGN(moveHistory, metadata);

  const hasHeaders = pgn.includes('[Event') && pgn.includes('[White "Player"]');
  const hasMoves = pgn.includes('1. e4 e5 2. Nf3 Nc6');
  const hasResult = pgn.includes('1-0');

  if (hasHeaders && hasMoves && hasResult) {
    addTest('pgn', 'Generate basic PGN', true);
  } else {
    addTest('pgn', 'Generate basic PGN', false, 'Missing headers, moves, or result');
  }
} catch (error) {
  addTest('pgn', 'Generate basic PGN', false, error.message);
}

// Test 1.2: PGN with long game
try {
  const longMoveHistory = [];
  for (let i = 0; i < 40; i++) {
    longMoveHistory.push({ san: 'Nf3' });
    longMoveHistory.push({ san: 'Nf6' });
  }

  const pgn = generatePGN(longMoveHistory, { white: 'A', black: 'B', result: '1/2-1/2' });

  if (pgn.includes('40.') && pgn.includes('1/2-1/2')) {
    addTest('pgn', 'Generate PGN with 40 moves', true);
  } else {
    addTest('pgn', 'Generate PGN with 40 moves', false, 'Move count incorrect');
  }
} catch (error) {
  addTest('pgn', 'Generate PGN with 40 moves', false, error.message);
}

// Test 1.3: Parse result function
try {
  const winWhite = parseResult('win', 'white');
  const winBlack = parseResult('win', 'black');
  const draw = parseResult('draw', 'white');
  const abandoned = parseResult('abandoned', 'white');

  if (winWhite === '1-0' && winBlack === '0-1' && draw === '1/2-1/2' && abandoned === '*') {
    addTest('pgn', 'Parse game results correctly', true);
  } else {
    addTest('pgn', 'Parse game results correctly', false, 'Result parsing incorrect');
  }
} catch (error) {
  addTest('pgn', 'Parse game results correctly', false, error.message);
}

// Test 1.4: Validate PGN
try {
  const validPGN = `[Event "Test"]
[Site "Test"]
[Date "2026.01.24"]
[Round "1"]
[White "A"]
[Black "B"]
[Result "1-0"]

1. e4 e5 1-0`;

  const validation = validatePGN(validPGN);

  if (validation.valid) {
    addTest('pgn', 'Validate correct PGN', true);
  } else {
    addTest('pgn', 'Validate correct PGN', false, validation.errors.join(', '));
  }
} catch (error) {
  addTest('pgn', 'Validate correct PGN', false, error.message);
}

// FEN Validation Tests
console.log('\n\x1b[1m2. FEN Validation Tests\x1b[0m');

// Test 2.1: Valid starting position
try {
  const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const result = validateFEN(startFEN);

  if (result.valid) {
    addTest('fen', 'Validate starting position', true);
  } else {
    addTest('fen', 'Validate starting position', false, result.error);
  }
} catch (error) {
  addTest('fen', 'Validate starting position', false, error.message);
}

// Test 2.2: Invalid FEN - missing field
try {
  const invalidFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0';
  const result = validateFEN(invalidFEN);

  if (!result.valid && result.error.includes('6 fields')) {
    addTest('fen', 'Reject FEN with missing field', true);
  } else {
    addTest('fen', 'Reject FEN with missing field', false, 'Should reject FEN with only 5 fields');
  }
} catch (error) {
  addTest('fen', 'Reject FEN with missing field', false, error.message);
}

// Test 2.3: Invalid FEN - invalid rank
try {
  const invalidFEN = 'rnbqkbnr/ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const result = validateFEN(invalidFEN);

  if (!result.valid && result.error.includes('7 squares')) {
    addTest('fen', 'Reject FEN with invalid rank', true);
  } else {
    addTest('fen', 'Reject FEN with invalid rank', false, 'Should reject rank with 7 squares');
  }
} catch (error) {
  addTest('fen', 'Reject FEN with invalid rank', false, error.message);
}

// Test 2.4: Invalid FEN - two white kings
try {
  const invalidFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKKNR w KQkq - 0 1';
  const result = validateFEN(invalidFEN);

  if (!result.valid && result.error.includes('white king')) {
    addTest('fen', 'Reject FEN with two white kings', true);
  } else {
    addTest('fen', 'Reject FEN with two white kings', false, 'Should reject multiple kings');
  }
} catch (error) {
  addTest('fen', 'Reject FEN with two white kings', false, error.message);
}

// Test 2.5: Valid FEN with en passant
try {
  const fenWithEP = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
  const result = validateFEN(fenWithEP);

  if (result.valid) {
    addTest('fen', 'Accept valid FEN with en passant', true);
  } else {
    addTest('fen', 'Accept valid FEN with en passant', false, result.error);
  }
} catch (error) {
  addTest('fen', 'Accept valid FEN with en passant', false, error.message);
}

// Test 2.6: Invalid castling rights
try {
  const invalidFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkqX - 0 1';
  const result = validateFEN(invalidFEN);

  if (!result.valid && result.error.includes('castling')) {
    addTest('fen', 'Reject invalid castling rights', true);
  } else {
    addTest('fen', 'Reject invalid castling rights', false, 'Should reject invalid castling character');
  }
} catch (error) {
  addTest('fen', 'Reject invalid castling rights', false, error.message);
}

// Test 2.7: Quick syntax check
try {
  const valid = isFENSyntaxValid('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const invalid = isFENSyntaxValid('invalid fen');

  if (valid && !invalid) {
    addTest('fen', 'Quick FEN syntax check', true);
  } else {
    addTest('fen', 'Quick FEN syntax check', false, 'Syntax check failed');
  }
} catch (error) {
  addTest('fen', 'Quick FEN syntax check', false, error.message);
}

// Summary
console.log('\n\x1b[1m' + '='.repeat(60) + '\x1b[0m');
console.log('\x1b[1mTEST SUMMARY\x1b[0m');
console.log('='.repeat(60));

const total = testResults.length;
const passed = testResults.filter(t => t.passed).length;
const failed = total - passed;
const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

console.log(`Total Tests: ${total}`);
console.log(`Passed:      \x1b[32m${passed}\x1b[0m`);
console.log(`Failed:      \x1b[31m${failed}\x1b[0m`);
console.log(`Pass Rate:   ${passRate}%`);

if (failed > 0) {
  console.log('\n\x1b[31mFailed Tests:\x1b[0m');
  testResults.filter(t => !t.passed).forEach(t => {
    console.log(`  - ${t.name}: ${t.error}`);
  });
}

console.log('\n\x1b[1mMANUAL TESTS (Verify on Chess Page):\x1b[0m');
console.log('  - Game serialization and save functionality');
console.log('  - FEN import via paste');
console.log('  - PGN export and download');
console.log('  - Load saved games from modal');

process.exit(failed > 0 ? 1 : 0);
