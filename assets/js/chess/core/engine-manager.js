/**
 * Engine Manager
 *
 * Manages chess engine with hybrid approach:
 * - Tries Lichess cloud analysis API when authenticated
 * - Falls back to local Stockfish engine when not authenticated
 * Provides computer opponent with configurable difficulty
 */

import lichessClient from '../api/lichess-client.js';

class EngineManager {
  constructor() {
    this.difficulty = 5;
    this.isThinking = false;
    this.thinkingStartTime = null;
    this.minThinkTime = 500; // Minimum thinking time in ms
    this.maxThinkTime = 5000; // Maximum thinking time in ms
    this.stockfish = null;
    this.stockfishReady = false;
  }

  /**
   * Initialize local Stockfish engine
   * @returns {Promise<void>}
   */
  async initStockfish() {
    if (this.stockfish && this.stockfishReady) {
      console.log('[ENGINE] Stockfish already initialized');
      return;
    }

    console.log('[ENGINE] Initializing local Stockfish engine...');

    return new Promise((resolve, reject) => {
      try {
        // Check if StockfishEngine global is available
        if (typeof StockfishEngine === 'undefined') {
          console.error('[ENGINE] StockfishEngine not found. Loading stockfish-engine.js...');

          // Dynamically load stockfish-engine.js
          const script = document.createElement('script');
          script.src = '/assets/js/chess/stockfish-engine.js';
          script.onload = () => {
            console.log('[ENGINE] stockfish-engine.js loaded');
            this.initializeStockfishInstance(resolve, reject);
          };
          script.onerror = () => {
            console.error('[ENGINE] Failed to load stockfish-engine.js');
            reject(new Error('Failed to load Stockfish engine script'));
          };
          document.head.appendChild(script);
        } else {
          this.initializeStockfishInstance(resolve, reject);
        }
      } catch (error) {
        console.error('[ENGINE] Error initializing Stockfish:', error);
        reject(error);
      }
    });
  }

  /**
   * Initialize Stockfish instance
   * @param {Function} resolve - Promise resolve callback
   * @param {Function} reject - Promise reject callback
   */
  initializeStockfishInstance(resolve, reject) {
    try {
      this.stockfish = new StockfishEngine({
        skillLevel: this.difficulty * 2, // Map 1-10 to 2-20
        depth: Math.min(10 + this.difficulty, 20),
        enginePath: '/assets/js/chess/vendor/stockfish-17.1-lite-single-03e3232.js'
      });

      this.stockfish.init(() => {
        console.log('[ENGINE] Stockfish initialized successfully');
        this.stockfishReady = true;
        resolve();
      });
    } catch (error) {
      console.error('[ENGINE] Error creating Stockfish instance:', error);
      reject(error);
    }
  }

  /**
   * Get best move from local Stockfish
   * @param {string} fen - Position in FEN notation
   * @param {number} difficulty - Difficulty level 1-10
   * @returns {Promise<object>} Move object {from, to, promotion}
   */
  async getBestMoveFromStockfish(fen, difficulty) {
    console.log('[ENGINE] Using local Stockfish engine');

    // Initialize if needed
    if (!this.stockfish || !this.stockfishReady) {
      await this.initStockfish();
    }

    // Update skill level
    const skillLevel = Math.min(difficulty * 2, 20);
    this.stockfish.setSkillLevel(skillLevel);
    console.log('[ENGINE] Stockfish skill level:', skillLevel);

    return new Promise((resolve, reject) => {
      this.stockfish.getBestMove(fen, (bestMove) => {
        if (!bestMove) {
          console.error('[ENGINE] Stockfish returned no move');
          reject(new Error('Stockfish returned no move'));
          return;
        }

        console.log('[ENGINE] Stockfish returned move:', bestMove);

        const move = {
          from: bestMove.substring(0, 2),
          to: bestMove.substring(2, 4),
          promotion: bestMove.length > 4 ? bestMove.substring(4) : undefined,
          evaluation: 'N/A'
        };

        resolve(move);
      });
    });
  }

  /**
   * Get best move from Lichess API
   * @param {string} fen - Position in FEN notation
   * @param {number} difficulty - Difficulty level 1-10
   * @returns {Promise<object>} Move object {from, to, promotion}
   */
  async getBestMoveFromLichess(fen, difficulty) {
    console.log('[ENGINE] Using Lichess Cloud API');
    const result = await lichessClient.getBestMove(fen, difficulty, Math.min(difficulty, 5));
    console.log('[ENGINE] Lichess API returned:', result);

    return {
      from: result.from,
      to: result.to,
      promotion: result.promotion,
      evaluation: result.evaluation
    };
  }

  /**
   * Get best move for a position
   * Tries Lichess API first if authenticated, falls back to Stockfish
   * @param {string} fen - Position in FEN notation
   * @param {number} difficulty - Difficulty level 1-10
   * @returns {Promise<object>} Move object {from, to, promotion}
   */
  async getBestMove(fen, difficulty = this.difficulty) {
    if (this.isThinking) {
      throw new Error('Engine is already thinking');
    }

    this.isThinking = true;
    this.thinkingStartTime = Date.now();
    this.difficulty = difficulty;

    try {
      console.log(`[ENGINE] ========== ENGINE THINKING ==========`);
      console.log(`[ENGINE] Difficulty: ${difficulty}`);
      console.log(`[ENGINE] Position: ${fen}`);
      console.log(`[ENGINE] Auth0 available: ${typeof auth0Client !== 'undefined'}`);
      console.log(`[ENGINE] Auth0 client initialized: ${typeof auth0Client !== 'undefined' && auth0Client !== null}`);

      let result;

      // Try Lichess API if Auth0 is available and initialized
      if (typeof auth0Client !== 'undefined' && auth0Client !== null) {
        try {
          console.log('[ENGINE] Attempting to use Lichess Cloud API...');
          result = await this.getBestMoveFromLichess(fen, difficulty);
        } catch (error) {
          console.warn('[ENGINE] Lichess API failed, falling back to Stockfish:', error.message);
          console.log('[ENGINE] Fallback reason:', error);
          result = await this.getBestMoveFromStockfish(fen, difficulty);
        }
      } else {
        console.log('[ENGINE] Auth0 not available, using local Stockfish');
        result = await this.getBestMoveFromStockfish(fen, difficulty);
      }

      // Calculate actual think time
      const thinkTime = Date.now() - this.thinkingStartTime;
      console.log(`[ENGINE] Analysis took: ${thinkTime}ms`);

      // Add artificial delay if move came back too quickly
      // This makes the bot feel more natural
      const targetThinkTime = this.calculateThinkTime(difficulty);
      const remainingTime = Math.max(0, targetThinkTime - thinkTime);

      if (remainingTime > 0) {
        console.log(`[ENGINE] Adding ${remainingTime}ms delay for natural feel`);
        await this.delay(remainingTime);
      }

      console.log(`[ENGINE] Engine found move: ${result.from}${result.to} (eval: ${result.evaluation})`);
      console.log(`[ENGINE] ========== ENGINE DONE ==========`);

      return result;

    } catch (error) {
      console.error('[ENGINE] ========== ENGINE ERROR ==========');
      console.error('[ENGINE] Error:', error);
      console.error('[ENGINE] Stack:', error.stack);
      throw error;
    } finally {
      this.isThinking = false;
      this.thinkingStartTime = null;
    }
  }

  /**
   * Calculate thinking time based on difficulty
   * Higher difficulty = longer think time (appears more "thoughtful")
   * @param {number} difficulty - Difficulty level 1-10
   * @returns {number} Think time in milliseconds
   */
  calculateThinkTime(difficulty) {
    // Beginner (1-2): 500-800ms
    // Easy (3-4): 800-1200ms
    // Intermediate (5-6): 1200-2000ms
    // Advanced (7-8): 2000-3000ms
    // Master (9-10): 3000-5000ms

    const baseTime = this.minThinkTime;
    const difficultyMultiplier = (difficulty / 10) * 4;
    const randomVariation = Math.random() * 500;

    return Math.min(
      this.maxThinkTime,
      Math.max(
        this.minThinkTime,
        baseTime + (difficultyMultiplier * 1000) + randomVariation
      )
    );
  }

  /**
   * Get position analysis
   * @param {string} fen - Position in FEN notation
   * @param {number} lines - Number of lines to analyze (1-5)
   * @returns {Promise<object>} Analysis result
   */
  async analyze(fen, lines = 3) {
    try {
      const result = await lichessClient.getAnalysis(fen, lines);
      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  /**
   * Get opening information
   * @param {string} fen - Position in FEN notation
   * @returns {Promise<object>} Opening data
   */
  async getOpening(fen) {
    try {
      const result = await lichessClient.getOpening(fen);
      return result;
    } catch (error) {
      console.error('Opening lookup error:', error);
      return null; // Non-critical, return null on error
    }
  }

  /**
   * Set difficulty level
   * @param {number} difficulty - Difficulty level 1-10
   */
  setDifficulty(difficulty) {
    this.difficulty = Math.max(1, Math.min(10, difficulty));
    console.log(`Engine difficulty set to: ${this.difficulty}`);
  }

  /**
   * Check if engine is currently thinking
   * @returns {boolean}
   */
  isEngineThinking() {
    return this.isThinking;
  }

  /**
   * Stop engine thinking (if possible)
   */
  stop() {
    if (this.isThinking) {
      console.log('Stopping engine...');
      this.isThinking = false;
    }
  }

  /**
   * Delay helper
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
const engineManager = new EngineManager();
export default engineManager;
