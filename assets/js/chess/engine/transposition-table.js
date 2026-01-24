/**
 * Transposition Table Module
 * Implements a hash table for storing position evaluations with exponential replacement strategy
 * Part of Carson's Chess Engine
 * @module chess/engine/transposition-table
 */

// TT Entry score types
export const SCORE_EXACT = 0;  // PV node - exact score
export const SCORE_ALPHA = 1;  // Fail-low - upper bound
export const SCORE_BETA = 2;   // Fail-high - lower bound

/**
 * Transposition table entry
 */
export class TTEntry {
  constructor(hash, depth, score, flag, bestMove, age) {
    this.hash = hash;           // BigInt - full zobrist hash for verification
    this.depth = depth;         // number - search depth
    this.score = score;         // number - position evaluation
    this.flag = flag;           // number - score type (EXACT, ALPHA, BETA)
    this.bestMove = bestMove;   // number - encoded move (16-bit)
    this.age = age;             // number - search generation
  }
}

/**
 * Transposition Table with exponential replacement strategy
 */
export class TranspositionTable {
  /**
   * Create a transposition table
   * @param {number} sizePower - Table size as power of 2 (e.g., 22 = 4MB)
   * @param {object} config - Configuration
   * @param {number} config.depthPriority - Depth exponent (1.0-3.0, default 2.0)
   * @param {number} config.agePriority - Age exponent (1.0-2.5, default 1.5)
   */
  constructor(sizePower = 22, config = {}) {
    this.depthPriority = config.depthPriority || 2.0;
    this.agePriority = config.agePriority || 1.5;

    // Calculate max entries based on size
    // Each entry ~48 bytes (hash: 8, depth: 8, score: 8, flag: 8, move: 8, age: 8)
    const bytesPerEntry = 48;
    const totalBytes = Math.pow(2, sizePower);
    this.maxEntries = Math.floor(totalBytes / bytesPerEntry);

    // Use Map for hash -> entry mapping
    this.table = new Map();

    // Statistics
    this.currentAge = 0;
    this.hits = 0;
    this.misses = 0;
    this.collisions = 0;
    this.stores = 0;
    this.overwrites = 0;
  }

  /**
   * Probe the transposition table
   * @param {BigInt} hash - Position hash
   * @returns {TTEntry | null} Entry if found, null otherwise
   */
  probe(hash) {
    const entry = this.table.get(hash);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Verify hash matches (collision detection)
    if (entry.hash !== hash) {
      this.misses++;
      this.collisions++;
      return null;
    }

    this.hits++;
    return entry;
  }

  /**
   * Determine if new entry should replace existing entry
   * Uses exponential weighting for depth and age
   * @param {TTEntry} existing - Existing entry
   * @param {number} newDepth - New entry depth
   * @returns {boolean} True if should replace
   */
  shouldReplace(existing, newDepth) {
    // Always replace entries from previous searches (age difference > 1)
    if (this.currentAge - existing.age > 1) {
      return true;
    }

    // Always replace if new depth is higher
    if (newDepth >= existing.depth) {
      return true;
    }

    // Exponential weighting formula
    // Higher existingScore = less likely to replace
    const depthWeight = Math.pow(existing.depth, this.depthPriority);
    const ageWeight = Math.pow(this.currentAge - existing.age, this.agePriority);

    const existingScore = depthWeight - ageWeight;
    const newScore = Math.pow(newDepth, this.depthPriority);

    return newScore > existingScore;
  }

  /**
   * Store position in transposition table
   * @param {BigInt} hash - Position hash
   * @param {number} depth - Search depth
   * @param {number} score - Position evaluation
   * @param {number} flag - Score type (EXACT, ALPHA, BETA)
   * @param {Move} bestMove - Best move found (can be null)
   */
  store(hash, depth, score, flag, bestMove) {
    this.stores++;

    // Encode move for compact storage (null = 0)
    const encodedMove = bestMove ? bestMove.encode() : 0;

    // Check if entry exists
    const existing = this.table.get(hash);

    if (existing) {
      // Apply replacement strategy
      if (!this.shouldReplace(existing, depth)) {
        return; // Don't replace
      }
      this.overwrites++;
    }

    // Check table size limit
    if (this.table.size >= this.maxEntries && !existing) {
      // Table is full - need to evict an entry
      // For now, just don't store (simple strategy)
      // Better: evict oldest/shallowest entry
      return;
    }

    // Create and store new entry
    const entry = new TTEntry(hash, depth, score, flag, encodedMove, this.currentAge);
    this.table.set(hash, entry);
  }

  /**
   * Increment age counter for new search
   */
  incrementAge() {
    this.currentAge++;
  }

  /**
   * Clear all entries from table
   */
  clear() {
    this.table.clear();
    this.currentAge = 0;
    this.resetStatistics();
  }

  /**
   * Reset statistics counters
   */
  resetStatistics() {
    this.hits = 0;
    this.misses = 0;
    this.collisions = 0;
    this.stores = 0;
    this.overwrites = 0;
  }

  /**
   * Get transposition table statistics
   * @returns {object} Statistics object
   */
  getStatistics() {
    const probes = this.hits + this.misses;
    const hitRate = probes > 0 ? (this.hits / probes * 100).toFixed(1) : 0;
    const fullness = (this.table.size / this.maxEntries * 100).toFixed(1);
    const overwriteRate = this.stores > 0 ? (this.overwrites / this.stores * 100).toFixed(1) : 0;

    return {
      size: this.table.size,
      maxEntries: this.maxEntries,
      fullness: parseFloat(fullness),
      hits: this.hits,
      misses: this.misses,
      collisions: this.collisions,
      hitRate: parseFloat(hitRate),
      stores: this.stores,
      overwrites: this.overwrites,
      overwriteRate: parseFloat(overwriteRate),
      currentAge: this.currentAge
    };
  }

  /**
   * Resize the transposition table
   * @param {number} newSizePower - New size as power of 2
   * @param {object} newConfig - Optional new configuration
   */
  resize(newSizePower, newConfig = null) {
    // Update config if provided
    if (newConfig) {
      this.depthPriority = newConfig.depthPriority || this.depthPriority;
      this.agePriority = newConfig.agePriority || this.agePriority;
    }

    // Recalculate max entries
    const bytesPerEntry = 48;
    const totalBytes = Math.pow(2, newSizePower);
    const newMaxEntries = Math.floor(totalBytes / bytesPerEntry);

    // If reducing size, may need to evict entries
    if (newMaxEntries < this.table.size) {
      // Keep only newest/deepest entries
      const entries = Array.from(this.table.entries());

      // Sort by age (descending) then depth (descending)
      entries.sort((a, b) => {
        if (b[1].age !== a[1].age) {
          return b[1].age - a[1].age;
        }
        return b[1].depth - a[1].depth;
      });

      // Keep only top entries
      this.table.clear();
      for (let i = 0; i < Math.min(newMaxEntries, entries.length); i++) {
        this.table.set(entries[i][0], entries[i][1]);
      }
    }

    this.maxEntries = newMaxEntries;
  }

  /**
   * Get memory usage information
   * @returns {object} Memory info
   */
  getMemoryInfo() {
    const bytesPerEntry = 48;
    const usedBytes = this.table.size * bytesPerEntry;
    const maxBytes = this.maxEntries * bytesPerEntry;

    return {
      usedMB: (usedBytes / (1024 * 1024)).toFixed(2),
      maxMB: (maxBytes / (1024 * 1024)).toFixed(2),
      usedBytes,
      maxBytes
    };
  }
}

export default TranspositionTable;
