/**
 * Evaluation Function Tests
 * Tests material counting, piece-square tables, and tapered evaluation
 * Part of Carson's Chess Engine Tests
 */

import { initializeAttacks } from '../../../assets/js/chess/engine/attacks.js';
import { parseFEN, STARTING_FEN } from '../../../assets/js/chess/engine/board.js';
import { WHITE, BLACK } from '../../../assets/js/chess/engine/bitboard.js';
import {
  getMaterialScore,
  getPSTScore,
  getGamePhase,
  getPhaseRatio,
  evaluate,
  evaluateDetailed
} from '../../../assets/js/chess/engine/eval.js';

// Initialize attack tables before running tests
initializeAttacks();

/**
 * Test positions with expected evaluation characteristics
 */
const TEST_POSITIONS = [
  {
    name: 'Starting Position',
    fen: STARTING_FEN,
    expectedMaterial: 0,
    expectedPhase: 24,
    expectedEvalRange: [-50, 50]
  },
  {
    name: 'White Extra Pawn',
    fen: 'rnbqkbnr/ppppppp1/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    expectedMaterial: 100,
    expectedPhase: 24,
    expectedEvalRange: [90, 150]
  },
  {
    name: 'Black Extra Knight',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R1BQKBNR w KQkq - 0 1',
    expectedMaterial: -320,
    expectedPhase: 23,
    expectedEvalRange: [-400, -250]
  },
  {
    name: 'King and Pawn Endgame (White)',
    fen: '8/8/8/8/3k4/8/3P4/3K4 w - - 0 1',
    expectedMaterial: 100,
    expectedPhase: 0,
    expectedEvalRange: [50, 200]
  },
  {
    name: 'Middlegame Position',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    expectedMaterial: 0,
    expectedPhase: 24,
    expectedEvalRange: [-100, 100]
  },
  {
    name: 'Queen Endgame',
    fen: '8/8/4k3/8/8/4K3/3Q4/8 w - - 0 1',
    expectedMaterial: 900,
    expectedPhase: 4,
    expectedEvalRange: [850, 950]
  }
];

/**
 * Test material counting
 */
function testMaterialCounting() {
  console.log('\n=== MATERIAL COUNTING TESTS ===\n');

  let passed = 0;
  let failed = 0;

  for (const test of TEST_POSITIONS) {
    const board = parseFEN(test.fen);
    const material = getMaterialScore(board);

    const isCorrect = material === test.expectedMaterial;

    if (isCorrect) {
      console.log(`✓ ${test.name}: ${material} (expected ${test.expectedMaterial})`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: ${material} (expected ${test.expectedMaterial})`);
      failed++;
    }
  }

  console.log(`\nMaterial Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test piece-square tables
 */
function testPieceSquareTables() {
  console.log('\n=== PIECE-SQUARE TABLE TESTS ===\n');

  let passed = 0;
  let failed = 0;

  // Test that PST values differ between opening and endgame for asymmetric positions
  const tests = [
    {
      name: 'PST Opening vs Endgame (KP Endgame)',
      fen: '8/8/8/8/3k4/8/3P4/3K4 w - - 0 1',
      expectDifferent: true
    },
    {
      name: 'PST score exists for different positions',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      checkExists: true
    }
  ];

  for (const test of tests) {
    const board = parseFEN(test.fen);
    const pstOpening = getPSTScore(board, 0);
    const pstEndgame = getPSTScore(board, 1);

    if (test.expectDifferent) {
      const isDifferent = pstOpening !== pstEndgame;
      if (isDifferent) {
        console.log(`✓ ${test.name}: Opening=${pstOpening}, Endgame=${pstEndgame}`);
        passed++;
      } else {
        console.log(`✗ ${test.name}: Values are identical (${pstOpening})`);
        failed++;
      }
    }

    if (test.checkExists) {
      // Just verify PST calculation works (any non-error value)
      const exists = typeof pstOpening === 'number' && !isNaN(pstOpening);
      if (exists) {
        console.log(`✓ ${test.name}: PST=${pstOpening}`);
        passed++;
      } else {
        console.log(`✗ ${test.name}: PST is invalid`);
        failed++;
      }
    }
  }

  console.log(`\nPST Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test game phase detection
 */
function testGamePhase() {
  console.log('\n=== GAME PHASE DETECTION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  for (const test of TEST_POSITIONS) {
    const board = parseFEN(test.fen);
    const phase = getGamePhase(board);
    const phaseRatio = getPhaseRatio(board);

    const isCorrect = phase === test.expectedPhase;

    if (isCorrect) {
      console.log(`✓ ${test.name}: Phase=${phase} Ratio=${phaseRatio.toFixed(2)}`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: Phase=${phase} (expected ${test.expectedPhase})`);
      failed++;
    }
  }

  console.log(`\nPhase Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test tapered evaluation
 */
function testTaperedEvaluation() {
  console.log('\n=== TAPERED EVALUATION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  for (const test of TEST_POSITIONS) {
    const board = parseFEN(test.fen);
    const eval1 = evaluate(board);
    const [min, max] = test.expectedEvalRange;

    const isInRange = eval1 >= min && eval1 <= max;

    if (isInRange) {
      console.log(`✓ ${test.name}: ${eval1} (expected ${min} to ${max})`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: ${eval1} (expected ${min} to ${max})`);
      failed++;
    }
  }

  console.log(`\nEvaluation Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test symmetry: eval(position) should equal -eval(flipped position)
 */
function testSymmetry() {
  console.log('\n=== SYMMETRY TESTS ===\n');

  let passed = 0;
  let failed = 0;

  // Helper to flip FEN (mirror position and swap colors)
  function flipFEN(fen) {
    const parts = fen.split(' ');
    const pieces = parts[0];
    const sideToMove = parts[1];

    // Split into ranks
    const ranks = pieces.split('/');

    // Reverse ranks and swap colors
    const flippedRanks = ranks.reverse().map(rank => {
      let flipped = '';
      for (const char of rank) {
        if (char >= 'a' && char <= 'z') {
          flipped += char.toUpperCase();
        } else if (char >= 'A' && char <= 'Z') {
          flipped += char.toLowerCase();
        } else {
          flipped += char;
        }
      }
      return flipped;
    });

    const flippedPieces = flippedRanks.join('/');

    // Swap side to move
    const newSide = sideToMove === 'w' ? 'b' : 'w';

    // For simplicity, reset castling and EP
    return `${flippedPieces} ${newSide} - - 0 1`;
  }

  const symmetryTests = [
    {
      name: 'Starting Position Symmetry',
      fen: STARTING_FEN
    },
    {
      name: 'Endgame Symmetry',
      fen: '8/8/4k3/8/8/4K3/3P4/8 w - - 0 1'
    }
  ];

  for (const test of symmetryTests) {
    const board1 = parseFEN(test.fen);
    const flippedFEN = flipFEN(test.fen);
    const board2 = parseFEN(flippedFEN);

    const eval1 = evaluate(board1);
    const eval2 = evaluate(board2);

    // Since we return from side-to-move perspective, symmetric positions
    // should have similar evaluations (both sides see similar advantage)
    const isSymmetric = Math.abs(eval1 - eval2) < 10; // Allow small rounding errors

    if (isSymmetric) {
      console.log(`✓ ${test.name}: eval=${eval1}, flipped=${eval2}`);
      passed++;
    } else {
      console.log(`✗ ${test.name}: eval=${eval1}, flipped=${eval2} (not symmetric)`);
      failed++;
    }
  }

  console.log(`\nSymmetry Tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

/**
 * Test detailed evaluation output
 */
function testDetailedEvaluation() {
  console.log('\n=== DETAILED EVALUATION TEST ===\n');

  const board = parseFEN(STARTING_FEN);
  const detailed = evaluateDetailed(board);

  console.log('Starting Position Breakdown:');
  console.log(`  Material: ${detailed.material}`);
  console.log(`  PST Opening: ${detailed.pstOpening}`);
  console.log(`  PST Endgame: ${detailed.pstEndgame}`);
  console.log(`  PST Tapered: ${detailed.pstTapered}`);
  console.log(`  Game Phase: ${detailed.phase} (ratio: ${detailed.phaseRatio})`);
  console.log(`  Total (White perspective): ${detailed.total}`);
  console.log(`  From Side Perspective: ${detailed.fromSidePerspective}`);

  return { passed: 1, failed: 0 };
}

/**
 * Run all evaluation tests
 */
function runAllTests() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   EVALUATION FUNCTION TEST SUITE      ║');
  console.log('╔═══════════════════════════════════════╝');

  const results = {
    material: testMaterialCounting(),
    pst: testPieceSquareTables(),
    phase: testGamePhase(),
    evaluation: testTaperedEvaluation(),
    symmetry: testSymmetry(),
    detailed: testDetailedEvaluation()
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
    console.log('\n✓ All evaluation tests PASSED!');
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
