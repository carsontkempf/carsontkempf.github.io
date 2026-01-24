/**
 * Opening Book Module
 * Hash-based opening book lookup with ECO detection
 * Part of Carson's Chess Engine
 * @module chess/engine/opening-book
 */

/**
 * Opening Book Class
 * Manages opening positions with Zobrist hash lookup
 */
class OpeningBook {
  constructor(bookData) {
    this.positions = bookData.positions || [];
    this.index = bookData.index || {};
    this.metadata = bookData.metadata || {};
    this.loaded = this.positions.length > 0;

    console.log(`[BOOK] Initialized with ${this.positions.length} positions`);
  }

  /**
   * Lookup position by Zobrist hash
   * @param {Board} board - Board instance with computed hash
   * @returns {Object|null} Opening entry or null if not found
   */
  lookup(board) {
    if (!board || !board.hash) return null;

    const hash = board.hash.toString(); // BigInt to string
    const idx = this.index[hash];

    if (idx !== undefined && idx >= 0 && idx < this.positions.length) {
      return this.positions[idx];
    }

    return null;
  }

  /**
   * Get opening name and ECO code
   * @param {Board} board - Current board position
   * @returns {Object|null} {eco, name} or null
   */
  getOpeningName(board) {
    const entry = this.lookup(board);
    if (entry) {
      return {
        eco: entry.eco,
        name: entry.name
      };
    }
    return null;
  }

  /**
   * Get all book moves for position (for future use)
   * @param {Board} board - Current board position
   * @returns {Array} Array of moves in SAN notation
   */
  getBookMoves(board) {
    const entry = this.lookup(board);
    if (entry && entry.moves) {
      return entry.moves.trim().split(/\s+/);
    }
    return [];
  }

  /**
   * Check if position is in book
   * @param {Board} board - Current board position
   * @returns {boolean} True if position found in book
   */
  isInBook(board) {
    return this.lookup(board) !== null;
  }

  /**
   * Get opening phase based on depth
   * @param {Board} board - Current board position
   * @returns {string} 'opening', 'transition', or 'middlegame'
   */
  getPhase(board) {
    const entry = this.lookup(board);
    if (!entry) return 'middlegame';

    if (entry.depth <= 3) return 'opening';
    if (entry.depth <= 5) return 'transition';
    return 'middlegame';
  }

  /**
   * Get statistics about the book
   * @returns {Object} Book statistics
   */
  getStats() {
    return {
      totalPositions: this.positions.length,
      loaded: this.loaded,
      metadata: this.metadata
    };
  }
}

// Singleton instance
let bookInstance = null;

/**
 * Load opening book data asynchronously
 * @returns {Promise<OpeningBook>} Promise that resolves to OpeningBook instance
 */
export async function loadOpeningBook() {
  if (bookInstance) {
    console.log('[BOOK] Already loaded, returning cached instance');
    return bookInstance;
  }

  try {
    console.log('[BOOK] Loading opening book data...');
    const startTime = performance.now();

    // Fetch from assets directory (served by Jekyll)
    const response = await fetch('/assets/data/chess/openings.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookData = await response.json();
    const loadTime = performance.now() - startTime;

    bookInstance = new OpeningBook(bookData);

    console.log(`[BOOK] Loaded successfully in ${loadTime.toFixed(2)}ms`);
    console.log(`[BOOK] Positions: ${bookInstance.positions.length}`);
    console.log(`[BOOK] Metadata:`, bookInstance.metadata);

    return bookInstance;
  } catch (error) {
    console.error('[BOOK] Failed to load:', error);
    // Return empty book on error
    bookInstance = new OpeningBook({ positions: [], index: {}, metadata: {} });
    return bookInstance;
  }
}

/**
 * Get current book instance (synchronous)
 * @returns {OpeningBook|null} Current instance or null if not loaded
 */
export function getOpeningBook() {
  return bookInstance;
}

/**
 * Reset book instance (for testing)
 */
export function resetOpeningBook() {
  bookInstance = null;
}

export default {
  loadOpeningBook,
  getOpeningBook,
  resetOpeningBook,
  OpeningBook
};
