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
    this.selectedSquare = null;
    this.validMoves = [];
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

    // Add click handlers for click-to-move functionality
    this.addClickHandlers();
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
   * Add click handlers for click-to-move functionality
   */
  addClickHandlers() {
    const boardElement = document.getElementById(this.boardElement);
    if (!boardElement) return;

    boardElement.addEventListener('click', (e) => {
      // Find the clicked square
      const square = e.target.closest('.square-55d63');
      if (!square) {
        this.clearSelection();
        return;
      }

      const squareId = this.getSquareFromElement(square);
      if (!squareId) return;

      this.handleSquareClick(squareId);
    });
  }

  /**
   * Get square notation from DOM element
   * @param {Element} element - Square element
   * @returns {string} Square notation (e.g., 'e4')
   */
  getSquareFromElement(element) {
    const classes = element.className.split(' ');
    for (const cls of classes) {
      if (cls.startsWith('square-')) {
        const match = cls.match(/square-([a-h][1-8])/);
        if (match) return match[1];
      }
    }
    return null;
  }

  /**
   * Handle square click for click-to-move
   * @param {string} square - Square notation
   */
  handleSquareClick(square) {
    // Don't allow moves if game is over or computer is thinking
    if (chessWrapper.isGameOver() || this.isComputerThinking) {
      return;
    }

    const piece = chessWrapper.getPiece(square);
    const turn = chessWrapper.getTurn();

    // If no piece is selected yet
    if (!this.selectedSquare) {
      // Check if clicking on a piece that can be moved
      if (piece && this.canPlayerMovePiece(piece, turn)) {
        this.selectSquare(square);
      }
    } else {
      // A piece is already selected
      if (square === this.selectedSquare) {
        // Clicking the same square - deselect
        this.clearSelection();
      } else if (piece && this.canPlayerMovePiece(piece, turn)) {
        // Clicking another piece of the same color - switch selection
        this.selectSquare(square);
      } else {
        // Try to move to the clicked square
        this.attemptMove(this.selectedSquare, square);
      }
    }
  }

  /**
   * Check if player can move a piece
   * @param {object} piece - Piece object
   * @param {string} turn - Current turn ('w' or 'b')
   * @returns {boolean}
   */
  canPlayerMovePiece(piece, turn) {
    const pieceColor = piece.color;

    if (this.playerColor === 'white' && turn === 'w' && pieceColor === 'w') {
      return true;
    }
    if (this.playerColor === 'black' && turn === 'b' && pieceColor === 'b') {
      return true;
    }
    if (this.playerColor === 'both') {
      return (turn === 'w' && pieceColor === 'w') || (turn === 'b' && pieceColor === 'b');
    }
    return false;
  }

  /**
   * Select a square and highlight valid moves
   * @param {string} square - Square notation
   */
  selectSquare(square) {
    this.clearSelection();
    this.selectedSquare = square;

    // Get valid moves for this piece
    this.validMoves = chessWrapper.getMovesForSquare(square);

    // Highlight selected square
    this.highlightSquare(square, 'selected');

    // Highlight valid move squares
    this.validMoves.forEach(move => {
      this.highlightSquare(move.to, 'valid-move');
    });
  }

  /**
   * Clear selection and highlights
   */
  clearSelection() {
    if (this.selectedSquare) {
      this.removeHighlight(this.selectedSquare);
      this.selectedSquare = null;
    }

    this.validMoves.forEach(move => {
      this.removeHighlight(move.to);
    });
    this.validMoves = [];
  }

  /**
   * Attempt to move from selected square to target
   * @param {string} from - Source square
   * @param {string} to - Target square
   */
  attemptMove(from, to) {
    // Check if move needs promotion
    const piece = chessWrapper.getPiece(from);
    const needsPromotion = piece &&
                           piece.type === 'p' &&
                           ((piece.color === 'w' && to.charAt(1) === '8') ||
                            (piece.color === 'b' && to.charAt(1) === '1'));

    let promotion = 'q';
    if (needsPromotion) {
      promotion = 'q'; // Auto-promote to queen
    }

    // Attempt the move
    const move = chessWrapper.move({
      from: from,
      to: to,
      promotion: promotion
    });

    // Clear selection
    this.clearSelection();

    if (move) {
      // Move was successful
      this.board.position(chessWrapper.getFen(), true);
      this.updateStatus();

      if (this.onMoveCallback) {
        this.onMoveCallback(move);
      }
    }
  }

  /**
   * Highlight a square
   * @param {string} square - Square notation
   * @param {string} type - Highlight type ('selected' or 'valid-move')
   */
  highlightSquare(square, type) {
    const boardElement = document.getElementById(this.boardElement);
    if (!boardElement) return;

    const squareElement = boardElement.querySelector(`.square-${square}`);
    if (squareElement) {
      squareElement.classList.add(`highlight-${type}`);
    }
  }

  /**
   * Remove highlight from a square
   * @param {string} square - Square notation
   */
  removeHighlight(square) {
    const boardElement = document.getElementById(this.boardElement);
    if (!boardElement) return;

    const squareElement = boardElement.querySelector(`.square-${square}`);
    if (squareElement) {
      squareElement.classList.remove('highlight-selected', 'highlight-valid-move');
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
    // Clear any click-to-move selection
    this.clearSelection();

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
