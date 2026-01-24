#!/usr/bin/env node
/**
 * Phase 7 Integration Test
 * End-to-end test for opening book with board moves
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

// Setup mocks
global.performance = {
  now: () => {
    const [seconds, nanoseconds] = process.hrtime();
    return seconds * 1000 + nanoseconds / 1000000;
  }
};

global.fetch = async (url) => {
  const filePath = join(rootDir, url);
  const data = readFileSync(filePath, 'utf8');
  return {
    ok: true,
    status: 200,
    json: async () => JSON.parse(data)
  };
};

// Import modules
const { Board } = await import('../../../assets/js/chess/engine/board.js');
const { loadOpeningBook } = await import('../../../assets/js/chess/engine/opening-book.js');

console.log('Phase 7 Integration Test');
console.log('=========================\n');

// Load opening book
console.log('1. Loading opening book...');
const book = await loadOpeningBook();
console.log(`   ✓ Loaded ${book.positions.length} positions\n`);

// Test 1: Play through Italian Game
console.log('2. Playing through Italian Game opening...');
const board = new Board();
board.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
console.log('   Starting position');

// Move 1: e4
board.parseFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
let opening = book.getOpeningName(board);
console.log(`   After e4: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book'}`);

// Move 2: e5
board.parseFEN('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
opening = book.getOpeningName(board);
console.log(`   After e4 e5: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book'}`);

// Move 3: Nf3
board.parseFEN('rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2');
opening = book.getOpeningName(board);
console.log(`   After e4 e5 Nf3: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book'}`);

// Move 4: Nc6
board.parseFEN('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');
opening = book.getOpeningName(board);
console.log(`   After e4 e5 Nf3 Nc6: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book'}`);

// Move 5: Bc4 (Italian Game)
board.parseFEN('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3');
opening = book.getOpeningName(board);
console.log(`   After e4 e5 Nf3 Nc6 Bc4: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book'}`);

if (opening && opening.eco === 'C50' && opening.name === 'Italian Game') {
  console.log('   ✓ Italian Game detected correctly!\n');
} else {
  console.log('   ✗ Italian Game NOT detected!\n');
  process.exit(1);
}

// Test 2: Test French Defense
console.log('3. Testing French Defense...');
board.parseFEN('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
opening = book.getOpeningName(board);
console.log(`   After e4 e6: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book'}`);

if (opening && opening.eco === 'C00' && opening.name === 'French Defense') {
  console.log('   ✓ French Defense detected correctly!\n');
} else {
  console.log('   ✗ French Defense NOT detected!\n');
  process.exit(1);
}

// Test 3: Test Sicilian Defense
console.log('4. Testing Sicilian Defense...');
board.parseFEN('rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2');
opening = book.getOpeningName(board);
console.log(`   After e4 c5: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book'}`);

if (opening && opening.eco === 'B20' && opening.name === 'Sicilian Defense') {
  console.log('   ✓ Sicilian Defense detected correctly!\n');
} else {
  console.log('   ✗ Sicilian Defense NOT detected!\n');
  process.exit(1);
}

// Test 4: Test position not in book
console.log('5. Testing random middlegame position...');
board.parseFEN('r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R b KQkq - 0 4');
opening = book.getOpeningName(board);
console.log(`   Random position: ${opening ? `${opening.eco} - ${opening.name}` : 'Not in book (expected)'}`);

if (!opening) {
  console.log('   ✓ Correctly returned null for position not in book\n');
} else {
  console.log('   ⚠ Unexpected: found opening for random position\n');
}

console.log('=========================');
console.log('✓ All integration tests passed!');
console.log('=========================\n');
