/**
 * Opening Book Tests
 * Test suite for opening book lookup and ECO detection
 * Part of Carson's Chess Engine Test Suite
 */

import { Board } from '../../../assets/js/chess/engine/board.js';
import { loadOpeningBook, getOpeningBook, resetOpeningBook } from '../../../assets/js/chess/engine/opening-book.js';

/**
 * Test runner
 */
export async function runOpeningBookTests() {
  console.log('\n=== OPENING BOOK TESTS ===\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Helper function to run a test
  const test = (name, fn) => {
    results.total++;
    try {
      fn();
      results.passed++;
      results.tests.push({ name, passed: true });
      console.log(`✓ ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, passed: false, error: error.message });
      console.error(`✗ ${name}`);
      console.error(`  Error: ${error.message}`);
    }
  };

  // Helper function for async tests
  const asyncTest = async (name, fn) => {
    results.total++;
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, passed: true });
      console.log(`✓ ${name}`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, passed: false, error: error.message });
      console.error(`✗ ${name}`);
      console.error(`  Error: ${error.message}`);
    }
  };

  // Helper to assert equality
  const assertEqual = (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
    }
  };

  const assertNotNull = (value, message) => {
    if (value === null || value === undefined) {
      throw new Error(message || 'Expected non-null value');
    }
  };

  const assertTrue = (value, message) => {
    if (!value) {
      throw new Error(message || 'Expected true');
    }
  };

  const assertFalse = (value, message) => {
    if (value) {
      throw new Error(message || 'Expected false');
    }
  };

  // Load opening book first
  console.log('Loading opening book...');
  await loadOpeningBook();
  const book = getOpeningBook();
  assertNotNull(book, 'Opening book should be loaded');
  console.log(`Book loaded with ${book.positions.length} positions\n`);

  // Test 1: Book loaded successfully
  test('Book loaded with positions', () => {
    assertTrue(book.loaded, 'Book should be marked as loaded');
    assertTrue(book.positions.length > 0, 'Book should have positions');
  });

  // Test 2: Starting position not in book
  test('Starting position not in book', () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const opening = book.getOpeningName(board);
    assertEqual(opening, null, 'Starting position should not be in book');
  });

  // Test 3: e4 position (King's Pawn)
  test('e4 position detected', () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, 'e4 position should be in book');
    assertEqual(opening.eco, 'B00', 'ECO code should be B00');
    assertEqual(opening.name, "King's Pawn", 'Opening name should be King\'s Pawn');
  });

  // Test 4: French Defense (e4 e6)
  test('French Defense detected', () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, 'French Defense position should be in book');
    assertEqual(opening.eco, 'C00', 'ECO code should be C00');
    assertEqual(opening.name, 'French Defense', 'Opening name should be French Defense');
  });

  // Test 5: Italian Game (e4 e5 Nf3 Nc6 Bc4)
  test('Italian Game detected', () => {
    const board = new Board();
    board.parseFEN('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, 'Italian Game position should be in book');
    assertEqual(opening.eco, 'C50', 'ECO code should be C50');
    assertEqual(opening.name, 'Italian Game', 'Opening name should be Italian Game');
  });

  // Test 6: Sicilian Defense (e4 c5)
  test('Sicilian Defense detected', () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, 'Sicilian Defense position should be in book');
    assertEqual(opening.eco, 'B20', 'ECO code should be B20');
    assertEqual(opening.name, 'Sicilian Defense', 'Opening name should be Sicilian Defense');
  });

  // Test 7: Ruy Lopez (e4 e5 Nf3 Nc6 Bb5)
  test('Ruy Lopez detected', () => {
    const board = new Board();
    board.parseFEN('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, 'Ruy Lopez position should be in book');
    assertEqual(opening.eco, 'C60', 'ECO code should be C60');
    assertEqual(opening.name, 'Ruy Lopez', 'Opening name should be Ruy Lopez');
  });

  // Test 8: Queen's Gambit (d4 d5 c4)
  test("Queen's Gambit detected", () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, "Queen's Gambit position should be in book");
    assertEqual(opening.eco, 'D06', 'ECO code should be D06');
    assertEqual(opening.name, "Queen's Gambit", "Opening name should be Queen's Gambit");
  });

  // Test 9: Caro-Kann Defense (e4 c6)
  test('Caro-Kann Defense detected', () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, 'Caro-Kann Defense position should be in book');
    assertEqual(opening.eco, 'B10', 'ECO code should be B10');
    assertEqual(opening.name, 'Caro-Kann Defense', 'Opening name should be Caro-Kann Defense');
  });

  // Test 10: Scandinavian Defense (e4 d5)
  test('Scandinavian Defense detected', () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
    const opening = book.getOpeningName(board);
    assertNotNull(opening, 'Scandinavian Defense position should be in book');
    assertEqual(opening.eco, 'B01', 'ECO code should be B01');
    assertEqual(opening.name, 'Scandinavian Defense', 'Opening name should be Scandinavian Defense');
  });

  // Test 11: isInBook() method
  test('isInBook() returns correct values', () => {
    const board1 = new Board();
    board1.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    assertFalse(book.isInBook(board1), 'Starting position should not be in book');

    const board2 = new Board();
    board2.parseFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    assertTrue(book.isInBook(board2), 'e4 position should be in book');
  });

  // Test 12: getPhase() method
  test('getPhase() returns correct phases', () => {
    const board1 = new Board();
    board1.parseFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    const phase1 = book.getPhase(board1);
    assertEqual(phase1, 'opening', 'e4 should be in opening phase');

    const board2 = new Board();
    board2.parseFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const phase2 = book.getPhase(board2);
    assertEqual(phase2, 'middlegame', 'Unknown position should return middlegame');
  });

  // Test 13: Hash consistency
  test('Same position produces same hash', () => {
    const board1 = new Board();
    board1.parseFEN('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const hash1 = board1.hash.toString();

    const board2 = new Board();
    board2.parseFEN('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const hash2 = board2.hash.toString();

    assertEqual(hash1, hash2, 'Same position should produce same hash');
  });

  // Test 14: getBookMoves() method
  test('getBookMoves() returns move sequence', () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    const moves = book.getBookMoves(board);
    assertTrue(Array.isArray(moves), 'getBookMoves should return an array');
    assertTrue(moves.length > 0, 'Book moves should not be empty');
    assertEqual(moves[0], 'e4', 'First move should be e4');
  });

  // Test 15: getStats() method
  test('getStats() returns book statistics', () => {
    const stats = book.getStats();
    assertNotNull(stats, 'Stats should not be null');
    assertTrue(stats.totalPositions > 0, 'Should have positions');
    assertTrue(stats.loaded, 'Book should be loaded');
  });

  // Performance test
  console.log('\n--- Performance Tests ---\n');

  const perfTest = () => {
    const board = new Board();
    board.parseFEN('rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      book.lookup(board);
    }

    const end = performance.now();
    const avgTime = (end - start) / iterations;

    console.log(`Lookup performance: ${avgTime.toFixed(3)}ms per lookup (${iterations} iterations)`);
    assertTrue(avgTime < 5, 'Lookup should be faster than 5ms');
  };

  test('Lookup performance < 5ms', perfTest);

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  return results;
}

// Export for use in test runner
export default { runOpeningBookTests };
