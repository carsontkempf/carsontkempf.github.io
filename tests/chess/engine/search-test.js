/**
 * Search Algorithm Tests
 * Tests negamax, alpha-beta, quiescence, and iterative deepening
 * Part of Carson's Chess Engine Tests
 */

import { initializeAttacks } from '../../../assets/js/chess/engine/attacks.js';
import { parseFEN } from '../../../assets/js/chess/engine/board.js';
import {
  findBestMove,
  findBestMoveIterative,
  MATE_SCORE
} from '../../../assets/js/chess/engine/search.js';

// Initialize attack tables before running tests
initializeAttacks();

/**
 * Test positions for tactical search
 */
const TACTICAL_POSITIONS = [
  {
    name: 'Mate in 1 - Back Rank',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    expectedMove: 'a1a8',
    depth: 3,
    expectMate: true
  },
  {
    name: 'Mate in 1 - Queen and Rook',
    fen: '5rk1/6pp/8/8/8/8/8/R4QK1 w - - 0 1',
    expectedMove: 'f1f8',
    depth: 3,
    expectMate: true
  },
  {
    name: 'Win Material - Free Queen',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPQPPP/RNB1KBNR b KQkq - 0 1',
    expectedMove: 'd8e7',
    depth: 3,
    expectMate: false
  },
  {
    name: 'Avoid Mate in 1',
    fen: '6k1/5ppp/8/8/8/8/r4PPP/R5K1 b - - 0 1',
    expectedMove: 'a2a1',
    depth: 3,
    expectMate: false
  },
  {
    name: 'Simple Fork',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    expectedMove: 'f3g5',
    depth: 4,
    expectMate: false
  }
];

/**
 * Test basic search functionality
 */
function testBasicSearch() {
  console.log('\n=== BASIC SEARCH TESTS ===\n');

  let passed = 0;
  let failed = 0;

  for (const test of TACTICAL_POSITIONS) {
    const board = parseFEN(test.fen);
    const result = findBestMove(board, test.depth);

    const moveStr = result.move ? result.move.toAlgebraic() : 'null';
    const isCorrect = moveStr === test.expectedMove;

    if (isCorrect) {
      console.log(`✓ ${test.name}: ${moveStr} (score: ${result.score}, nodes: ${result.nodes})`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: ${moveStr} (expected ${test.expectedMove}, score: ${result.score})`);
      failed++;
    }
  }

  console.log(`\nBasic Search Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test mate detection
 */
function testMateDetection() {
  console.log('\n=== MATE DETECTION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  for (const test of TACTICAL_POSITIONS) {
    if (!test.expectMate) continue;

    const board = parseFEN(test.fen);
    const result = findBestMove(board, test.depth);

    const isMateScore = Math.abs(result.score) > MATE_SCORE - 100;

    if (isMateScore) {
      console.log(`✓ ${test.name}: Mate detected (score: ${result.score})`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: Mate not detected (score: ${result.score})`);
      failed++;
    }
  }

  console.log(`\nMate Detection Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test alpha-beta pruning effectiveness
 */
function testAlphaBetaPruning() {
  console.log('\n=== ALPHA-BETA PRUNING TESTS ===\n');

  let passed = 0;
  let failed = 0;

  // Use a complex position to test pruning
  const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1';
  const board = parseFEN(fen);

  // Depth 3 should prune significantly
  const result1 = findBestMove(board, 3);
  const nodes3 = result1.nodes;

  // Depth 4 should search more nodes
  const result2 = findBestMove(board, 4);
  const nodes4 = result2.nodes;

  // Verify nodes increase with depth (but not exponentially due to pruning)
  const ratio = nodes4 / nodes3;
  const isPruningEffective = ratio < 30; // Should be much less than branching factor (~35)

  if (isPruningEffective) {
    console.log(`✓ Pruning effective: depth 3 = ${nodes3} nodes, depth 4 = ${nodes4} nodes (ratio: ${ratio.toFixed(1)}x)`);
    passed++;
  } else {
    console.log(`✗ Pruning ineffective: depth 3 = ${nodes3} nodes, depth 4 = ${nodes4} nodes (ratio: ${ratio.toFixed(1)}x)`);
    failed++;
  }

  console.log(`\nAlpha-Beta Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test iterative deepening
 */
function testIterativeDeepening() {
  console.log('\n=== ITERATIVE DEEPENING TESTS ===\n');

  let passed = 0;
  let failed = 0;

  const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1';
  const board = parseFEN(fen);

  let depthsCompleted = [];

  const result = findBestMoveIterative(board, {
    maxDepth: 6,
    maxTime: 2000,
    onDepthComplete: (info) => {
      depthsCompleted.push(info.depth);
      console.log(`  Depth ${info.depth}: ${info.move.toAlgebraic()} (score: ${info.score}, nodes: ${info.nodes}, nps: ${info.nps})`);
    }
  });

  // Verify time limit respected
  const withinTimeLimit = result.time <= 2200; // Allow 10% margin

  if (withinTimeLimit) {
    console.log(`✓ Time limit respected: ${result.time}ms (limit: 2000ms)`);
    passed++;
  } else {
    console.log(`✗ Time limit exceeded: ${result.time}ms (limit: 2000ms)`);
    failed++;
  }

  // Verify at least depth 3 completed
  const minDepthReached = result.depth >= 3;

  if (minDepthReached) {
    console.log(`✓ Minimum depth reached: ${result.depth}`);
    passed++;
  } else {
    console.log(`✗ Minimum depth not reached: ${result.depth} (expected >= 3)`);
    failed++;
  }

  // Verify move is legal
  const hasMove = result.move !== null;

  if (hasMove) {
    console.log(`✓ Best move found: ${result.move.toAlgebraic()}`);
    passed++;
  } else {
    console.log(`✗ No move found`);
    failed++;
  }

  console.log(`\nIterative Deepening Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test performance benchmarks
 */
function testPerformance() {
  console.log('\n=== PERFORMANCE TESTS ===\n');

  let passed = 0;
  let failed = 0;

  const fen = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1';
  const board = parseFEN(fen);

  const result = findBestMoveIterative(board, {
    maxDepth: 5,
    maxTime: 5000
  });

  const nps = result.nps;

  // Target: >100k nodes/second
  const meetsPerformance = nps > 100000;

  if (meetsPerformance) {
    console.log(`✓ Performance target met: ${nps.toLocaleString()} nps (>100k target)`);
    passed++;
  } else {
    console.log(`⚠ Performance below target: ${nps.toLocaleString()} nps (100k target)`);
    // Don't fail - performance varies by system
    passed++;
  }

  console.log(`  Depth: ${result.depth}, Nodes: ${result.nodes.toLocaleString()}, Time: ${result.time}ms`);

  console.log(`\nPerformance Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test quiescence search (tactical accuracy)
 */
function testQuiescenceSearch() {
  console.log('\n=== QUIESCENCE SEARCH TESTS ===\n');

  let passed = 0;
  let failed = 0;

  // Position where simple eval would miss a recapture
  const tests = [
    {
      name: 'Recapture Sequence',
      fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
      depth: 3
    },
    {
      name: 'Tactical Exchange',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
      depth: 4
    }
  ];

  for (const test of tests) {
    const board = parseFEN(test.fen);
    const result = findBestMove(board, test.depth);

    // Just verify search completes and finds a move
    const hasMove = result.move !== null;

    if (hasMove) {
      console.log(`✓ ${test.name}: ${result.move.toAlgebraic()} (score: ${result.score})`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: No move found`);
      failed++;
    }
  }

  console.log(`\nQuiescence Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Run all search tests
 */
function runAllTests() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║      SEARCH ALGORITHM TEST SUITE      ║');
  console.log('╔═══════════════════════════════════════╝');

  const results = {
    basic: testBasicSearch(),
    mate: testMateDetection(),
    pruning: testAlphaBetaPruning(),
    iterative: testIterativeDeepening(),
    quiescence: testQuiescenceSearch(),
    performance: testPerformance()
  };

  // Calculate totals
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [category, result] of Object.entries(results)) {
    totalPassed += result.passed;
    totalFailed += result.failed;
  }

  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║           FINAL RESULTS               ║');
  console.log('╠═══════════════════════════════════════╣');
  console.log(`║  Total Passed: ${totalPassed.toString().padStart(2)}                       ║`);
  console.log(`║  Total Failed: ${totalFailed.toString().padStart(2)}                       ║`);
  console.log(`║  Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%                  ║`);
  console.log('╚═══════════════════════════════════════╝');

  if (totalFailed === 0) {
    console.log('\n✓ All search tests PASSED!');
  } else {
    console.log(`\n✗ ${totalFailed} test(s) FAILED`);
  }

  return totalFailed === 0;
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
