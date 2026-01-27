/**
 * Controls Manager
 *
 * Handles UI controls (buttons, selectors) for the chess game
 */

import chessWrapper from '../core/chess-wrapper.js';
import boardManager from './board-manager.js';
import gameManager from './game-manager.js';

class Controls {
  constructor() {
    this.newGameBtn = null;
    this.flipBoardBtn = null;
    this.gameModeSelect = null;
    this.difficultySelect = null;
    this.sideSelect = null;
    this.difficultySelector = null;
    this.sideSelector = null;
  }

  /**
   * Initialize controls and attach event listeners
   */
  init() {
    // Get DOM elements
    this.newGameBtn = document.getElementById('new-game-btn');
    this.flipBoardBtn = document.getElementById('flip-board-btn');
    this.gameModeSelect = document.getElementById('game-mode-select');
    this.difficultySelect = document.getElementById('difficulty-select');
    this.sideSelect = document.getElementById('side-select');
    this.difficultySelector = document.getElementById('difficulty-selector');
    this.sideSelector = document.getElementById('side-selector');

    // Attach event listeners
    if (this.newGameBtn) {
      this.newGameBtn.addEventListener('click', () => this.handleNewGame());
    }

    if (this.flipBoardBtn) {
      this.flipBoardBtn.addEventListener('click', () => this.handleFlipBoard());
    }

    if (this.gameModeSelect) {
      this.gameModeSelect.addEventListener('change', () => this.handleGameModeChange());
    }

    if (this.difficultySelect) {
      this.difficultySelect.addEventListener('change', () => this.handleDifficultyChange());
    }

    if (this.sideSelect) {
      this.sideSelect.addEventListener('change', () => this.handleSideChange());
    }

    // Initialize game mode visibility
    this.handleGameModeChange();
  }

  /**
   * Handle new game button click
   */
  handleNewGame() {
    const mode = this.gameModeSelect?.value || 'human-vs-human';
    const difficulty = parseInt(this.difficultySelect?.value || '5');
    const side = this.sideSelect?.value || 'white';

    gameManager.startNewGame(mode, side, difficulty);
  }

  /**
   * Handle flip board button click
   */
  handleFlipBoard() {
    boardManager.flip();
  }

  /**
   * Handle game mode selection change
   */
  handleGameModeChange() {
    const mode = this.gameModeSelect?.value;

    if (mode === 'human-vs-computer') {
      // Show difficulty and side selectors
      if (this.difficultySelector) {
        this.difficultySelector.style.display = 'block';
      }
      if (this.sideSelector) {
        this.sideSelector.style.display = 'block';
      }
    } else {
      // Hide difficulty and side selectors
      if (this.difficultySelector) {
        this.difficultySelector.style.display = 'none';
      }
      if (this.sideSelector) {
        this.sideSelector.style.display = 'none';
      }
    }
  }

  /**
   * Handle difficulty selection change
   */
  handleDifficultyChange() {
    const difficulty = parseInt(this.difficultySelect?.value || '5');
    gameManager.setDifficulty(difficulty);
  }

  /**
   * Handle side selection change
   */
  handleSideChange() {
    const side = this.sideSelect?.value || 'white';
    gameManager.setPlayerSide(side);
  }

  /**
   * Update move list display
   * @param {array} moves - Array of move objects
   */
  updateMoveList(moves) {
    const moveListElement = document.getElementById('move-list');
    if (!moveListElement) return;

    moveListElement.innerHTML = '';

    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];

      const movePair = document.createElement('div');
      movePair.className = 'move-pair';

      const numberSpan = document.createElement('span');
      numberSpan.className = 'move-number';
      numberSpan.textContent = `${moveNumber}.`;
      movePair.appendChild(numberSpan);

      const whiteSpan = document.createElement('span');
      whiteSpan.className = 'move';
      whiteSpan.textContent = whiteMove.san;
      whiteSpan.dataset.index = i;
      whiteSpan.addEventListener('click', () => this.handleMoveClick(i));
      movePair.appendChild(whiteSpan);

      if (blackMove) {
        const blackSpan = document.createElement('span');
        blackSpan.className = 'move';
        blackSpan.textContent = blackMove.san;
        blackSpan.dataset.index = i + 1;
        blackSpan.addEventListener('click', () => this.handleMoveClick(i + 1));
        movePair.appendChild(blackSpan);
      }

      moveListElement.appendChild(movePair);
    }

    // Auto-scroll to bottom
    moveListElement.scrollTop = moveListElement.scrollHeight;
  }

  /**
   * Handle move click in history
   * @param {number} index - Move index
   */
  handleMoveClick(index) {
    // TODO: Implement move navigation
    console.log('Navigate to move:', index);
  }

  /**
   * Disable controls during computer thinking
   */
  disableControls() {
    if (this.newGameBtn) {
      this.newGameBtn.disabled = true;
    }
  }

  /**
   * Enable controls
   */
  enableControls() {
    if (this.newGameBtn) {
      this.newGameBtn.disabled = false;
    }
  }
}

// Export singleton instance
const controls = new Controls();
export default controls;
