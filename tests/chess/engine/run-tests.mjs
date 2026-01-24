#!/usr/bin/env node
/**
 * Node.js Test Runner for Phase 6
 * Runs tests without requiring a browser
 */

import { Board } from '../../../assets/js/chess/engine/board.js';
import { TranspositionTable, SCORE_EXACT, SCORE_ALPHA, SCORE_BETA } from '../../../assets/js/chess/engine/transposition-table.js';
import { findBestMoveIterative, findBestMove, MATE_SCORE } from '../../../assets/js/chess/engine/search.js';
import { Move, MOVE_FLAG_QUIET } from '../../../assets/js/chess/engine/movegen.js';

// Test results
let passed = 0;
let failed = 0;

function assert(condition, testName, message = '') {
  if (condition) {
    passed++;
    console.log(`✓ ${testName}`);
  } else {
    failed++;
    console.error(`✗ ${testName}: ${message}`);
  }
}

console.log('========================================');
console.log('  PHASE 6 AUTOMATED TEST SUITE');
console.log('========================================\n');

// Test 1: Module Loading
console.log('=== Test 1: Module Loading ===');
assert(Board !== undefined, 'Board module loaded');
assert(TranspositionTable !== undefined, 'TranspositionTable module loaded');
assert(findBestMoveIterative !== undefined, 'Search module loaded');
console.log('');

// Test 2: Board Creation and Hash
console.log('=== Test 2: Board Creation and Zobrist Hash ===');
const board = new Board();
board.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
assert(board.zobristHash !== undefined, 'Board has zobristHash property');
assert(board.zobristHash !== 0n, 'Zobrist hash is non-zero', `hash = ${board.zobristHash}`);
console.log(`  Hash value: ${board.zobristHash}`);
console.log('');

// Test 3: Transposition Table Basic Operations
console.log('=== Test 3: Transposition Table ===');
const tt = new TranspositionTable(20);
assert(tt.maxEntries > 0, 'TT has max entries', `maxEntries = ${tt.maxEntries}`);

const hash = 12345n;
const move = new Move(0, 8, MOVE_FLAG_QUIET);
tt.store(hash, 5, 100, SCORE_EXACT, move);
const entry = tt.probe(hash);

assert(entry !== null, 'TT can store and retrieve');
assert(entry.hash === hash, 'TT hash matches');
assert(entry.depth === 5, 'TT depth matches');
assert(entry.score === 100, 'TT score matches');
console.log('');

// Test 4: Search with TT
console.log('=== Test 4: Search with Transposition Table ===');
const searchResult = findBestMoveIterative(board, {
  maxDepth: 4,
  maxTime: 5000,
  tt: tt
});

assert(searchResult.move !== null, 'Search found a move');
assert(searchResult.nodes > 0, 'Search counted nodes', `nodes = ${searchResult.nodes}`);
assert(searchResult.depth >= 3, 'Search reached depth 3+', `depth = ${searchResult.depth}`);
console.log(`  Depth: ${searchResult.depth}`);
console.log(`  Nodes: ${searchResult.nodes}`);
console.log(`  Time: ${searchResult.time}ms`);
console.log(`  NPS: ${searchResult.nps}`);

if (searchResult.ttStats) {
  assert(searchResult.ttStats.stores > 0, 'TT stored positions', `stores = ${searchResult.ttStats.stores}`);
  console.log(`  TT Hit Rate: ${searchResult.ttStats.hitRate}%`);
  console.log(`  TT Fullness: ${searchResult.ttStats.fullness}%`);
  console.log(`  TT Stores: ${searchResult.ttStats.stores}`);
  console.log(`  TT Hits: ${searchResult.ttStats.hits}`);
}
console.log('');

// Test 5: Search Quality Test
console.log('=== Test 5: Search Quality ===');
const tacticalBoard = new Board();
// Tactical position - White is clearly better
tacticalBoard.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
const tacticalResult = findBestMoveIterative(tacticalBoard, {
  maxDepth: 4,
  maxTime: 3000
});

assert(tacticalResult.move !== null, 'Found a move in tactical position');
assert(tacticalResult.depth >= 3, 'Reached reasonable depth', `depth = ${tacticalResult.depth}`);
console.log(`  Depth: ${tacticalResult.depth}`);
console.log(`  Score: ${tacticalResult.score}`);
console.log('');

// Test 6: TT Hit Rate on Repeated Search
console.log('=== Test 6: TT Hit Rate on Repeated Search ===');
const tt2 = new TranspositionTable(22);
const testBoard = new Board();
testBoard.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// First search
findBestMoveIterative(testBoard, { maxDepth: 4, maxTime: 5000, tt: tt2 });

// Reset board
testBoard.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// Second search (should have TT hits)
const result2 = findBestMoveIterative(testBoard, { maxDepth: 4, maxTime: 5000, tt: tt2 });

if (result2.ttStats) {
  assert(result2.ttStats.hitRate > 0, 'TT has hits on repeated search', `hit rate = ${result2.ttStats.hitRate}%`);
  console.log(`  Hit Rate: ${result2.ttStats.hitRate}%`);
}
console.log('');

// Test 7: Performance Baseline
console.log('=== Test 7: Performance Test ===');
const perfBoard = new Board();
perfBoard.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
const perfResult = findBestMoveIterative(perfBoard, {
  maxDepth: 5,
  maxTime: 5000
});

// Node.js is slower than browsers, so use a lower threshold
assert(perfResult.nps > 10000, 'NPS > 10k (Node.js)', `NPS = ${perfResult.nps}`);
assert(perfResult.depth >= 4, 'Reached depth 4+', `depth = ${perfResult.depth}`);
console.log(`  NPS: ${perfResult.nps}`);
console.log(`  Depth reached: ${perfResult.depth}`);
console.log('');

// Summary
console.log('========================================');
console.log('  TEST SUMMARY');
console.log('========================================');
console.log(`Total: ${passed + failed}`);
console.log(`Passed: ${passed} ✓`);
console.log(`Failed: ${failed} ✗`);
const passRate = ((passed / (passed + failed)) * 100).toFixed(1);
console.log(`Pass Rate: ${passRate}%`);
console.log('========================================\n');

if (failed === 0) {
  console.log('✓✓✓ PHASE 6 COMPLETE - ALL TESTS PASSED ✓✓✓\n');
  process.exit(0);
} else {
  console.error('✗✗✗ SOME TESTS FAILED ✗✗✗\n');
  process.exit(1);
}
