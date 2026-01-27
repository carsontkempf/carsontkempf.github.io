/**
 * Engine Manager
 *
 * Manages chess engine using Lichess cloud analysis API
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
  }

  /**
   * Get best move for a position
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
      console.log(`Engine thinking... (Difficulty: ${difficulty})`);

      // Get move from Lichess API
      const result = await lichessClient.getBestMove(fen, difficulty, Math.min(difficulty, 5));

      // Calculate actual think time
      const thinkTime = Date.now() - this.thinkingStartTime;

      // Add artificial delay if move came back too quickly
      // This makes the bot feel more natural
      const targetThinkTime = this.calculateThinkTime(difficulty);
      const remainingTime = Math.max(0, targetThinkTime - thinkTime);

      if (remainingTime > 0) {
        await this.delay(remainingTime);
      }

      console.log(`Engine found move: ${result.from}${result.to} (eval: ${result.evaluation})`);

      return {
        from: result.from,
        to: result.to,
        promotion: result.promotion
      };

    } catch (error) {
      console.error('Engine error:', error);
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
