/**
 * Phase 6 Test Suite: Transposition Table & Advanced Features
 * Tests TT functionality, move ordering, and null move pruning
 */

import { Board } from '../../../assets/js/chess/engine/board.js';
import { TranspositionTable, SCORE_EXACT, SCORE_ALPHA, SCORE_BETA } from '../../../assets/js/chess/engine/transposition-table.js';
import { findBestMoveIterative, findBestMove, MATE_SCORE } from '../../../assets/js/chess/engine/search.js';
import { Move, MOVE_FLAG_QUIET } from '../../../assets/js/chess/engine/movegen.js';

/**
 * Test results storage
 */
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

/**
 * Assert helper
 */
function assert(condition, testName, message = '') {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ name: testName, status: 'PASS', message });
    console.log(`✓ ${testName}`);
  } else {
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'FAIL', message });
    console.error(`✗ ${testName}: ${message}`);
  }
}

/**
 * Test TT basic functionality
 */
function testTTBasics() {
  console.log('\n=== TT Basic Functionality Tests ===');

  // Test 1: Store and retrieve
  const tt = new TranspositionTable(20); // Small table
  const hash = 12345n;
  const move = new Move(0, 8, MOVE_FLAG_QUIET);

  tt.store(hash, 5, 100, SCORE_EXACT, move);
  const entry = tt.probe(hash);

  assert(entry !== null, 'TT Store/Retrieve', 'Entry should be found');
  assert(entry.hash === hash, 'TT Hash Match', 'Hash should match');
  assert(entry.depth === 5, 'TT Depth Match', 'Depth should match');
  assert(entry.score === 100, 'TT Score Match', 'Score should match');
  assert(entry.flag === SCORE_EXACT, 'TT Flag Match', 'Flag should match');

  // Test 2: Miss
  const missing = tt.probe(99999n);
  assert(missing === null, 'TT Miss', 'Should return null for missing entry');

  // Test 3: Replacement strategy
  tt.store(hash, 3, 50, SCORE_ALPHA, move); // Lower depth
  const entry2 = tt.probe(hash);
  assert(entry2.depth === 5, 'TT Replacement - Depth Priority', 'Should keep deeper entry');

  tt.store(hash, 7, 150, SCORE_BETA, move); // Higher depth
  const entry3 = tt.probe(hash);
  assert(entry3.depth === 7, 'TT Replacement - Higher Depth', 'Should replace with deeper entry');

  // Test 4: Age increment
  tt.incrementAge();
  assert(tt.currentAge === 1, 'TT Age Increment', 'Age should increment');

  // Test 5: Statistics
  const stats = tt.getStatistics();
  assert(stats.stores > 0, 'TT Statistics - Stores', 'Should track stores');
  assert(stats.hits > 0, 'TT Statistics - Hits', 'Should track hits');
  assert(stats.hitRate >= 0 && stats.hitRate <= 100, 'TT Statistics - Hit Rate', 'Hit rate should be 0-100%');

  // Test 6: Clear
  tt.clear();
  const afterClear = tt.probe(hash);
  assert(afterClear === null, 'TT Clear', 'Should clear all entries');
  assert(tt.currentAge === 0, 'TT Clear Age', 'Should reset age');
}

/**
 * Test TT integration with search
 */
function testTTIntegration() {
  console.log('\n=== TT Integration Tests ===');

  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const board = new Board();
  board.parseFEN(fen);

  // Test 1: Search with TT should be faster on repeated search
  const tt = new TranspositionTable(22);

  const start1 = Date.now();
  const result1 = findBestMoveIterative(board, {
    maxDepth: 4,
    maxTime: 10000,
    tt: tt
  });
  const time1 = Date.now() - start1;

  // Clear board hash to force re-parse
  board.parseFEN(fen);

  const start2 = Date.now();
  const result2 = findBestMoveIterative(board, {
    maxDepth: 4,
    maxTime: 10000,
    tt: tt
  });
  const time2 = Date.now() - start2;

  assert(time2 < time1, 'TT Integration - Speedup',
    `Second search should be faster (${time1}ms vs ${time2}ms)`);

  // Test 2: TT hit rate should be > 0
  assert(result2.ttStats.hitRate > 0, 'TT Integration - Hit Rate',
    `Hit rate should be positive: ${result2.ttStats.hitRate}%`);

  // Test 3: Same position should give same result
  assert(result1.move.encode() === result2.move.encode(),
    'TT Integration - Consistency', 'Same position should give same move');
}

/**
 * Test move ordering improvements
 */
function testMoveOrdering() {
  console.log('\n=== Move Ordering Tests ===');

  // Test position with clear capture superiority
  // Queen can capture pawn or rook can capture pawn - QxP should be ordered first
  const fen = 'r3k3/8/8/8/4p3/3Q4/8/4K2R w - - 0 1';
  const board = new Board();
  board.parseFEN(fen);

  const result = findBestMove(board, 3);

  // The engine should find a good move (this is more about not crashing than specific move)
  assert(result.move !== null, 'Move Ordering - Found Move', 'Should find a move');
  assert(result.nodes > 0, 'Move Ordering - Nodes Searched', 'Should search nodes');

  console.log(`  Nodes searched: ${result.nodes}`);
}

/**
 * Test null move pruning effectiveness
 */
function testNullMovePruning() {
  console.log('\n=== Null Move Pruning Tests ===');

  // Position where null move pruning should help
  const fen = 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1';
  const board = new Board();
  board.parseFEN(fen);

  // Search without TT (to isolate null move effect)
  const start = Date.now();
  const result = findBestMoveIterative(board, {
    maxDepth: 5,
    maxTime: 10000
  });
  const timeWithNMP = Date.now() - start;

  assert(result.move !== null, 'Null Move Pruning - Found Move', 'Should find a move');
  assert(result.nodes > 0, 'Null Move Pruning - Nodes Searched', 'Should search nodes');

  console.log(`  Nodes: ${result.nodes}, Time: ${timeWithNMP}ms, NPS: ${result.nps}`);

  // We can't easily test without NMP since it's always on, but we can verify it doesn't break anything
  assert(result.nps > 0, 'Null Move Pruning - NPS', 'Should have positive NPS');
}

/**
 * Test mate finding still works with all optimizations
 */
function testMateWithOptimizations() {
  console.log('\n=== Mate Finding with Optimizations ===');

  // Mate in 1: Qh7#
  const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1';
  const board = new Board();
  board.parseFEN(fen);

  const result = findBestMoveIterative(board, {
    maxDepth: 3,
    maxTime: 5000
  });

  assert(result.move !== null, 'Mate with Optimizations - Found Move', 'Should find mate move');
  assert(Math.abs(result.score) > MATE_SCORE - 100, 'Mate with Optimizations - Mate Score',
    `Score should indicate mate: ${result.score}`);

  // Verify TT stats are populated
  if (result.ttStats) {
    assert(result.ttStats.hitRate >= 0, 'Mate with Optimizations - TT Stats',
      `TT hit rate: ${result.ttStats.hitRate}%`);
  }
}

/**
 * Performance baseline test
 */
function testPerformance() {
  console.log('\n=== Performance Tests ===');

  const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const board = new Board();
  board.parseFEN(fen);

  const result = findBestMoveIterative(board, {
    maxDepth: 5,
    maxTime: 5000
  });

  console.log(`  Depth: ${result.depth}`);
  console.log(`  Nodes: ${result.nodes}`);
  console.log(`  Time: ${result.time}ms`);
  console.log(`  NPS: ${result.nps}`);

  if (result.ttStats) {
    console.log(`  TT Hit Rate: ${result.ttStats.hitRate}%`);
    console.log(`  TT Fullness: ${result.ttStats.fullness}%`);
  }

  // Basic performance assertions
  assert(result.nps > 50000, 'Performance - NPS > 50k',
    `NPS should be > 50k: ${result.nps}`);
  assert(result.depth >= 4, 'Performance - Depth >= 4',
    `Should reach depth 4 in 5s: ${result.depth}`);

  if (result.ttStats) {
    assert(result.ttStats.hitRate > 0, 'Performance - TT Hit Rate > 0',
      `TT should have hits: ${result.ttStats.hitRate}%`);
  }
}

/**
 * Test TT configuration
 */
function testTTConfiguration() {
  console.log('\n=== TT Configuration Tests ===');

  // Test 1: Different sizes
  const tt1 = new TranspositionTable(20); // 1MB
  const tt2 = new TranspositionTable(24); // 16MB

  assert(tt2.maxEntries > tt1.maxEntries, 'TT Config - Size Scaling',
    `Larger TT should have more entries: ${tt1.maxEntries} vs ${tt2.maxEntries}`);

  // Test 2: Different priorities
  const tt3 = new TranspositionTable(22, { depthPriority: 3.0, agePriority: 1.0 });
  const tt4 = new TranspositionTable(22, { depthPriority: 1.0, agePriority: 2.0 });

  assert(tt3.depthPriority === 3.0, 'TT Config - Depth Priority', 'Should set depth priority');
  assert(tt4.agePriority === 2.0, 'TT Config - Age Priority', 'Should set age priority');

  // Test 3: Resize
  const tt5 = new TranspositionTable(20);
  const originalSize = tt5.maxEntries;
  tt5.resize(22);
  const newSize = tt5.maxEntries;

  assert(newSize > originalSize, 'TT Config - Resize',
    `Resized TT should be larger: ${originalSize} -> ${newSize}`);
}

/**
 * Run all tests
 */
export function runPhase6Tests() {
  console.log('========================================');
  console.log('  PHASE 6 TEST SUITE');
  console.log('  Transposition Table & Advanced Features');
  console.log('========================================');

  testResults.passed = 0;
  testResults.failed = 0;
  testResults.tests = [];

  try {
    testTTBasics();
    testTTConfiguration();
    testTTIntegration();
    testMoveOrdering();
    testNullMovePruning();
    testMateWithOptimizations();
    testPerformance();
  } catch (error) {
    console.error('Test suite error:', error);
    testResults.tests.push({
      name: 'Test Suite Execution',
      status: 'ERROR',
      message: error.message
    });
  }

  // Summary
  console.log('\n========================================');
  console.log('  TEST SUMMARY');
  console.log('========================================');
  console.log(`Total: ${testResults.passed + testResults.failed}`);
  console.log(`Passed: ${testResults.passed} ✓`);
  console.log(`Failed: ${testResults.failed} ✗`);
  console.log(`Pass Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  return testResults;
}

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
  window.runPhase6Tests = runPhase6Tests;
}
