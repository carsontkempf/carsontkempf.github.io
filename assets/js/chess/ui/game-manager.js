/**
 * Game Manager
 *
 * Main orchestrator for the chess game
 * Manages game state, coordinates between board and engine
 */

import chessWrapper from '../core/chess-wrapper.js';
import boardManager from './board-manager.js';
import controls from './controls.js';

class GameManager {
  constructor() {
    this.mode = 'human-vs-computer';
    this.playerSide = 'white';
    this.difficulty = 5;
    this.engineManager = null;
    this.isGameActive = false;
  }

  /**
   * Initialize the game manager
   */
  async init() {
    // Initialize board
    boardManager.init();
    boardManager.setMoveCallback((move) => this.handleMove(move));

    // Initialize controls
    controls.init();

    // Start initial game
    this.startNewGame('human-vs-computer', 'white', 5);

    console.log('Chess game initialized');
  }

  /**
   * Start a new game
   * @param {string} mode - 'human-vs-human' or 'human-vs-computer'
   * @param {string} side - 'white' or 'black'
   * @param {number} difficulty - 1-10
   */
  async startNewGame(mode, side, difficulty) {
    this.mode = mode;
    this.playerSide = side;
    this.difficulty = difficulty;
    this.isGameActive = true;

    console.log(`[CHESS] Starting new game: mode=${mode}, side=${side}, difficulty=${difficulty}`);

    // Reset chess logic and board
    chessWrapper.reset();
    boardManager.reset();
    boardManager.updateStatus();

    // Set player color
    if (mode === 'human-vs-human') {
      boardManager.setPlayerColor('both');
    } else {
      boardManager.setPlayerColor(side);

      // If player is black, flip board and make computer move as white
      if (side === 'black') {
        boardManager.flip();
        setTimeout(() => this.makeComputerMove(), 500);
      }
    }

    // Update move list
    controls.updateMoveList([]);

    console.log(`New game started: ${mode}, playing as ${side}, difficulty ${difficulty}`);
  }

  /**
   * Handle a move being made
   * @param {object} move - Move object
   */
  async handleMove(move) {
    console.log('Move made:', move.san);

    // Update move list
    const history = chessWrapper.getHistory();
    controls.updateMoveList(history);

    // Check if game is over
    if (chessWrapper.isGameOver()) {
      this.handleGameOver();
      return;
    }

    // If playing vs computer, make computer move
    if (this.mode === 'human-vs-computer') {
      const currentTurn = chessWrapper.getTurn();
      const computerTurn = this.playerSide === 'white' ? 'b' : 'w';

      console.log(`[CHESS] Move made. Current turn: ${currentTurn}, Computer turn: ${computerTurn}`);

      if (currentTurn === computerTurn) {
        console.log('[CHESS] Computer should move now');
        setTimeout(() => this.makeComputerMove(), 500);
      }
    }
  }

  /**
   * Make computer move
   */
  async makeComputerMove() {
    if (!this.isGameActive) return;

    console.log('[CHESS] makeComputerMove() called');
    boardManager.setComputerThinking(true);
    controls.disableControls();

    try {
      // Get best move from engine manager
      if (!this.engineManager) {
        console.log('[CHESS] Loading engine manager...');
        // Lazy load engine manager
        const { default: EngineManager } = await import('../core/engine-manager.js');
        this.engineManager = EngineManager;
        console.log('[CHESS] Engine manager loaded');
      }

      const fen = chessWrapper.getFen();
      console.log('[CHESS] Getting best move for position:', fen);
      const move = await this.engineManager.getBestMove(fen, this.difficulty);

      if (move) {
        console.log('Computer move:', move);
        boardManager.makeMove(move);

        // Update move list
        const history = chessWrapper.getHistory();
        controls.updateMoveList(history);

        // Check if game is over
        if (chessWrapper.isGameOver()) {
          this.handleGameOver();
        }
      }
    } catch (error) {
      console.error('Error making computer move:', error);
      alert('Error: Computer could not make a move. Please try again.');
    } finally {
      boardManager.setComputerThinking(false);
      controls.enableControls();
    }
  }

  /**
   * Handle game over
   */
  handleGameOver() {
    this.isGameActive = false;
    console.log('Game over:', chessWrapper.getStatus());

    // Show game over message
    setTimeout(() => {
      const status = chessWrapper.getStatus();
      alert(status);
    }, 100);
  }

  /**
   * Set difficulty level
   * @param {number} difficulty - 1-10
   */
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    console.log('Difficulty set to:', difficulty);
  }

  /**
   * Set player side
   * @param {string} side - 'white' or 'black'
   */
  setPlayerSide(side) {
    this.playerSide = side;
    console.log('Player side set to:', side);
  }
}

// Export singleton instance
const gameManager = new GameManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => gameManager.init());
} else {
  gameManager.init();
}

export default gameManager;
