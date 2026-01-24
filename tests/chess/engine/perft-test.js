/**
 * Perft (Performance Test) - Move generation verification
 * Tests move generation accuracy by counting leaf nodes at various depths
 * Part of Carson's Chess Engine Tests
 */

import { initializeAttacks } from '../../../assets/js/chess/engine/attacks.js';
import { parseFEN, STARTING_FEN } from '../../../assets/js/chess/engine/board.js';
import { generateLegalMoves, makeMove, unmakeMove } from '../../../assets/js/chess/engine/game.js';

// Initialize attack tables before running tests
initializeAttacks();

/**
 * Perform perft test (count leaf nodes)
 * @param {Board} board - Board instance
 * @param {number} depth - Search depth
 * @returns {number} Number of leaf nodes
 */
function perft(board, depth) {
  if (depth === 0) return 1;

  const moves = generateLegalMoves(board);
  let nodes = 0;

  for (const move of moves) {
    const state = makeMove(board, move);
    nodes += perft(board, depth - 1);
    unmakeMove(board, move, state);
  }

  return nodes;
}

/**
 * Perform divide perft (show move breakdown)
 * @param {Board} board - Board instance
 * @param {number} depth - Search depth
 * @returns {Object} Map of moves to node counts
 */
function divide(board, depth) {
  const moves = generateLegalMoves(board);
  const results = {};
  let totalNodes = 0;

  console.log(`\nDivide perft (depth ${depth}):`);
  console.log('----------------------------');

  for (const move of moves) {
    const state = makeMove(board, move);
    const nodes = depth <= 1 ? 1 : perft(board, depth - 1);
    unmakeMove(board, move, state);

    const moveStr = move.toAlgebraic();
    results[moveStr] = nodes;
    totalNodes += nodes;

    console.log(`${moveStr}: ${nodes}`);
  }

  console.log('----------------------------');
  console.log(`Total nodes: ${totalNodes}`);

  return { results, totalNodes };
}

/**
 * Standard perft test positions with expected results
 */
const PERFT_POSITIONS = [
  {
    name: 'Starting Position',
    fen: STARTING_FEN,
    depths: [
      { depth: 1, expected: 20 },
      { depth: 2, expected: 400 },
      { depth: 3, expected: 8902 },
      { depth: 4, expected: 197281 },
      // Depth 5 is very slow without optimizations
      // { depth: 5, expected: 4865609 }
    ]
  },
  {
    name: 'Kiwipete Position',
    fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    depths: [
      { depth: 1, expected: 48 },
      { depth: 2, expected: 2039 },
      { depth: 3, expected: 97862 },
      // Depth 4 is slow
      // { depth: 4, expected: 4085603 }
    ]
  },
  {
    name: 'Position 3',
    fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    depths: [
      { depth: 1, expected: 14 },
      { depth: 2, expected: 191 },
      { depth: 3, expected: 2812 },
      { depth: 4, expected: 43238 },
      // { depth: 5, expected: 674624 }
    ]
  },
  {
    name: 'Position 4',
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    depths: [
      { depth: 1, expected: 6 },
      { depth: 2, expected: 264 },
      { depth: 3, expected: 9467 },
      // { depth: 4, expected: 422333 }
    ]
  },
  {
    name: 'Position 5',
    fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    depths: [
      { depth: 1, expected: 44 },
      { depth: 2, expected: 1486 },
      { depth: 3, expected: 62379 },
      // { depth: 4, expected: 2103487 }
    ]
  },
  {
    name: 'Position 6',
    fen: 'r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10',
    depths: [
      { depth: 1, expected: 46 },
      { depth: 2, expected: 2079 },
      { depth: 3, expected: 89890 },
      // { depth: 4, expected: 3894594 }
    ]
  }
];

/**
 * Run perft test suite
 */
function runPerftTests() {
  console.log('='.repeat(60));
  console.log('PERFT TEST SUITE - Move Generation Verification');
  console.log('='.repeat(60));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const position of PERFT_POSITIONS) {
    console.log(`\n${position.name}`);
    console.log(`FEN: ${position.fen}`);
    console.log('-'.repeat(60));

    const board = parseFEN(position.fen);

    for (const test of position.depths) {
      totalTests++;
      const startTime = Date.now();
      const result = perft(board, test.depth);
      const elapsed = Date.now() - startTime;
      const nps = Math.round(result / (elapsed / 1000));

      const passed = result === test.expected;
      const status = passed ? '✓ PASS' : '✗ FAIL';

      console.log(
        `Depth ${test.depth}: ${result.toLocaleString()} nodes ` +
        `(expected: ${test.expected.toLocaleString()}) ` +
        `[${elapsed}ms, ${nps.toLocaleString()} nps] ${status}`
      );

      if (passed) {
        passedTests++;
      } else {
        failedTests++;
        console.log(`  ERROR: Got ${result}, expected ${test.expected}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  return failedTests === 0;
}

/**
 * Run a single perft test with divide
 */
function runSingleTest(fen = STARTING_FEN, depth = 3) {
  console.log('='.repeat(60));
  console.log('SINGLE PERFT TEST');
  console.log('='.repeat(60));
  console.log(`FEN: ${fen}`);

  const board = parseFEN(fen);

  console.log(`\nRunning perft to depth ${depth}...`);
  const startTime = Date.now();
  const result = perft(board, depth);
  const elapsed = Date.now() - startTime;
  const nps = Math.round(result / (elapsed / 1000));

  console.log(`\nResult: ${result.toLocaleString()} nodes`);
  console.log(`Time: ${elapsed}ms`);
  console.log(`Speed: ${nps.toLocaleString()} nodes/second`);

  // Run divide at depth 1 to show move breakdown
  if (depth >= 1) {
    divide(board, Math.min(depth, 2));
  }
}

// Export for use in browser console or Node.js
export {
  perft,
  divide,
  runPerftTests,
  runSingleTest,
  PERFT_POSITIONS
};

// If running in Node.js, run tests automatically
if (typeof window === 'undefined') {
  runPerftTests();
}

export default {
  perft,
  divide,
  runPerftTests,
  runSingleTest,
  PERFT_POSITIONS
};
