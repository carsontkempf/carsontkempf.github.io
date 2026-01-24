/**
 * ControlsManager - Button and input controls
 * Handles New Game, Flip Board, Undo, Resign, Offer Draw
 * Part of Carson's Chess Engine
 * @module chess/ui/controls
 */

import { getBoardManager } from './board.js';

/**
 * ControlsManager class
 * Manages all game control buttons and their state
 */
export class ControlsManager {
  constructor() {
    this.boardManager = null;
    this.gameActive = true;
    this.gameResult = null; // 'white-win', 'black-win', 'draw', 'resigned'

    this.initializeButtons();
  }

  /**
   * Initialize button event listeners
   */
  initializeButtons() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupListeners());
    } else {
      this.setupListeners();
    }
  }

  /**
   * Setup event listeners for all buttons
   */
  setupListeners() {
    // Get button elements
    this.newGameBtn = document.getElementById('new-game-btn');
    this.flipBoardBtn = document.getElementById('flip-board-btn');
    this.undoBtn = document.getElementById('undo-btn');
    this.resignBtn = document.getElementById('resign-btn');
    this.drawBtn = document.getElementById('draw-btn');

    // Add event listeners
    if (this.newGameBtn) {
      this.newGameBtn.addEventListener('click', () => this.onNewGame());
      this.newGameBtn.disabled = false;
    }

    if (this.flipBoardBtn) {
      this.flipBoardBtn.addEventListener('click', () => this.onFlipBoard());
      this.flipBoardBtn.disabled = false;
    }

    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => this.onUndo());
      this.undoBtn.disabled = true; // Disabled initially (no moves)
    }

    if (this.resignBtn) {
      this.resignBtn.addEventListener('click', () => this.onResign());
    }

    if (this.drawBtn) {
      this.drawBtn.addEventListener('click', () => this.onOfferDraw());
    }

    // Listen for move events to update button states
    window.addEventListener('chessMoveMade', () => this.updateButtonStates());

    console.log('[ControlsManager] Buttons initialized');
  }

  /**
   * Set board manager reference
   */
  setBoardManager(boardManager) {
    this.boardManager = boardManager;
    this.updateButtonStates();
  }

  /**
   * Handle New Game button
   */
  onNewGame() {
    // Confirm if game is in progress
    if (this.boardManager && this.boardManager.getMoveHistory().length > 0 && this.gameActive) {
      const confirmed = confirm('Start a new game? Current game will be lost.');
      if (!confirmed) return;
    }

    // Reset board
    if (this.boardManager) {
      this.boardManager.reset();
    }

    // Reset game state
    this.gameActive = true;
    this.gameResult = null;

    // Update button states
    this.updateButtonStates();

    console.log('[ControlsManager] New game started');
  }

  /**
   * Handle Flip Board button
   */
  onFlipBoard() {
    if (this.boardManager) {
      this.boardManager.flip();
    }
    console.log('[ControlsManager] Board flipped');
  }

  /**
   * Handle Undo button
   */
  onUndo() {
    if (!this.boardManager) return;

    const success = this.boardManager.undo();
    if (success) {
      // Update button states
      this.updateButtonStates();
      console.log('[ControlsManager] Move undone');
    }
  }

  /**
   * Handle Resign button
   */
  onResign() {
    if (!this.gameActive) {
      alert('Game is already finished.');
      return;
    }

    const confirmed = confirm('Are you sure you want to resign?');
    if (!confirmed) return;

    // End game
    this.gameActive = false;
    const currentSide = this.boardManager ? this.boardManager.getBoardState().sideToMove : 0;
    this.gameResult = currentSide === 0 ? 'black-win' : 'white-win';

    // Show result
    alert(`You resigned. ${this.gameResult === 'white-win' ? 'Black' : 'White'} wins!`);

    // Update button states
    this.updateButtonStates();

    // Emit event for game end
    window.dispatchEvent(new CustomEvent('chessGameEnd', {
      detail: { result: this.gameResult, reason: 'resignation' }
    }));

    console.log('[ControlsManager] Game resigned:', this.gameResult);
  }

  /**
   * Handle Offer Draw button
   */
  onOfferDraw() {
    if (!this.gameActive) {
      alert('Game is already finished.');
      return;
    }

    const confirmed = confirm('Offer a draw? This will end the game.');
    if (!confirmed) return;

    // End game as draw
    this.gameActive = false;
    this.gameResult = 'draw';

    // Show result
    alert('Game drawn by agreement.');

    // Update button states
    this.updateButtonStates();

    // Emit event for game end
    window.dispatchEvent(new CustomEvent('chessGameEnd', {
      detail: { result: 'draw', reason: 'agreement' }
    }));

    console.log('[ControlsManager] Game drawn by agreement');
  }

  /**
   * Update button enabled/disabled states
   */
  updateButtonStates() {
    if (!this.boardManager) return;

    const moveHistory = this.boardManager.getMoveHistory();
    const isViewingHistory = this.boardManager.isViewingHistoricalPosition();
    const hasMove = moveHistory.length > 0;

    // Undo button: enabled if there are moves and not viewing history
    if (this.undoBtn) {
      this.undoBtn.disabled = !hasMove || isViewingHistory || !this.gameActive;
    }

    // Resign and Draw buttons: enabled only during active game
    if (this.resignBtn) {
      this.resignBtn.disabled = !this.gameActive;
    }
    if (this.drawBtn) {
      this.drawBtn.disabled = !this.gameActive;
    }

    // New Game and Flip Board are always enabled
    if (this.newGameBtn) {
      this.newGameBtn.disabled = false;
    }
    if (this.flipBoardBtn) {
      this.flipBoardBtn.disabled = false;
    }
  }

  /**
   * Disable all controls (e.g., during engine thinking)
   */
  disableControls() {
    if (this.newGameBtn) this.newGameBtn.disabled = true;
    if (this.flipBoardBtn) this.flipBoardBtn.disabled = true;
    if (this.undoBtn) this.undoBtn.disabled = true;
    if (this.resignBtn) this.resignBtn.disabled = true;
    if (this.drawBtn) this.drawBtn.disabled = true;
  }

  /**
   * Enable controls (after engine finishes)
   */
  enableControls() {
    this.updateButtonStates();
  }

  /**
   * Get game active status
   */
  isGameActive() {
    return this.gameActive;
  }

  /**
   * Get game result
   */
  getGameResult() {
    return this.gameResult;
  }

  /**
   * Set game result (called by external components)
   */
  setGameResult(result, reason) {
    this.gameActive = false;
    this.gameResult = result;
    this.updateButtonStates();

    // Emit event
    window.dispatchEvent(new CustomEvent('chessGameEnd', {
      detail: { result, reason }
    }));
  }
}

// Singleton instance
let controlsManager = null;

/**
 * Get ControlsManager singleton
 */
export function getControlsManager() {
  if (!controlsManager) {
    controlsManager = new ControlsManager();
  }
  return controlsManager;
}

/**
 * Initialize controls manager (called from HTML)
 */
export function initializeControlsManager() {
  return getControlsManager();
}

export default {
  ControlsManager,
  getControlsManager,
  initializeControlsManager
};
