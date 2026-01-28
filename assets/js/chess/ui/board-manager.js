/**
 * Board Manager
 *
 * Manages the visual chessboard using chessboard.js
 * Handles drag-and-drop, highlighting, and board updates
 */

import chessWrapper from '../core/chess-wrapper.js';

class BoardManager {
  constructor() {
    this.board = null;
    this.boardElement = 'chess-board';
    this.onMoveCallback = null;
    this.playerColor = 'white';
    this.isComputerThinking = false;
  }

  /**
   * Initialize the chessboard
   * @param {object} options - Configuration options
   */
  init(options = {}) {
    const config = {
      draggable: true,
      position: 'start',
      onDragStart: this.onDragStart.bind(this),
      onDrop: this.onDrop.bind(this),
      onSnapEnd: this.onSnapEnd.bind(this),
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
      ...options
    };

    this.board = Chessboard(this.boardElement, config);
    this.updateBoardSize();
    window.addEventListener('resize', () => this.updateBoardSize());
  }

  /**
   * Update board size based on container
   */
  updateBoardSize() {
    if (this.board) {
      this.board.resize();
    }
  }

  /**
   * Handle drag start event
   * @param {string} source - Source square
   * @param {string} piece - Piece being dragged
   * @returns {boolean} Whether drag is allowed
   */
  onDragStart(source, piece) {
    // Don't allow moves if game is over
    if (chessWrapper.isGameOver()) {
      return false;
    }

    // Don't allow moves if computer is thinking
    if (this.isComputerThinking) {
      return false;
    }

    // Only allow player to move their own pieces
    const turn = chessWrapper.getTurn();
    const pieceColor = piece.charAt(0);

    if (this.playerColor === 'white' && turn === 'w' && pieceColor !== 'w') {
      return false;
    }
    if (this.playerColor === 'black' && turn === 'b' && pieceColor !== 'b') {
      return false;
    }
    if (this.playerColor === 'both') {
      // Allow both sides in human vs human mode
      if ((turn === 'w' && pieceColor !== 'w') || (turn === 'b' && pieceColor !== 'b')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Handle piece drop event
   * @param {string} source - Source square
   * @param {string} target - Target square
   * @returns {string} 'snapback' if illegal, otherwise proceed
   */
  onDrop(source, target) {
    // Check if move needs promotion
    const piece = chessWrapper.getPiece(source);
    const needsPromotion = piece &&
                           piece.type === 'p' &&
                           ((piece.color === 'w' && target.charAt(1) === '8') ||
                            (piece.color === 'b' && target.charAt(1) === '1'));

    let promotion = 'q'; // Default to queen
    if (needsPromotion) {
      // For now, auto-promote to queen. TODO: Add promotion dialog
      promotion = 'q';
    }

    // Attempt the move
    const move = chessWrapper.move({
      from: source,
      to: target,
      promotion: promotion
    });

    // If move is illegal, snap back
    if (move === null) {
      return 'snapback';
    }

    // Update status and trigger callback
    this.updateStatus();
    if (this.onMoveCallback) {
      this.onMoveCallback(move);
    }

    return true;
  }

  /**
   * Handle snap end event (after piece animation completes)
   */
  onSnapEnd() {
    // No need to update position - drag-and-drop already updated it
    // Removing this prevents piece flickering after moves
  }

  /**
   * Set callback for when a move is made
   * @param {function} callback - Callback function
   */
  setMoveCallback(callback) {
    this.onMoveCallback = callback;
  }

  /**
   * Set player color (who can make moves)
   * @param {string} color - 'white', 'black', or 'both'
   */
  setPlayerColor(color) {
    this.playerColor = color;
  }

  /**
   * Set computer thinking state
   * @param {boolean} thinking - Whether computer is thinking
   */
  setComputerThinking(thinking) {
    this.isComputerThinking = thinking;
  }

  /**
   * Update the board position
   * @param {string} fen - FEN notation or 'start'
   * @param {boolean} animate - Whether to animate the change
   */
  setPosition(fen, animate = true) {
    if (this.board) {
      this.board.position(fen, animate);
    }
  }

  /**
   * Flip the board orientation
   */
  flip() {
    if (this.board) {
      this.board.flip();
    }
  }

  /**
   * Reset board to starting position
   */
  reset() {
    if (this.board) {
      this.board.start();
    }
  }

  /**
   * Make a move programmatically (for computer moves)
   * @param {object} move - Move object {from, to, promotion}
   */
  makeMove(move) {
    const result = chessWrapper.move(move);
    if (result) {
      this.board.position(chessWrapper.getFen());
      this.updateStatus();
      return result;
    }
    return null;
  }

  /**
   * Update game status display
   */
  updateStatus() {
    const statusElement = document.getElementById('game-status-text');
    const turnElement = document.getElementById('turn-indicator');

    if (statusElement) {
      statusElement.textContent = chessWrapper.getStatus();
    }

    if (turnElement) {
      const turn = chessWrapper.getTurn();
      const turnText = turn === 'w' ? 'White' : 'Black';
      turnElement.textContent = `${turnText} to move`;
    }
  }

  /**
   * Get the board instance
   * @returns {object} Chessboard.js instance
   */
  getBoard() {
    return this.board;
  }
}

// Export singleton instance
const boardManager = new BoardManager();
export default boardManager;
