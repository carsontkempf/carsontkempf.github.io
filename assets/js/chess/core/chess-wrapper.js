/**
 * Chess Wrapper
 *
 * Wraps chess.js library to provide a consistent API for chess logic
 * Handles move validation, game state, and position management
 */

class ChessWrapper {
  constructor() {
    this.game = null;
    this.moveHistory = [];
    this.init();
  }

  /**
   * Initialize a new chess game
   */
  init() {
    this.game = new Chess();
    this.moveHistory = [];
  }

  /**
   * Reset the game to starting position
   */
  reset() {
    this.game.reset();
    this.moveHistory = [];
  }

  /**
   * Load a position from FEN string
   * @param {string} fen - FEN notation string
   * @returns {boolean} Success status
   */
  loadFen(fen) {
    try {
      this.game.load(fen);
      return true;
    } catch (error) {
      console.error('Invalid FEN:', error);
      return false;
    }
  }

  /**
   * Get current position as FEN string
   * @returns {string} FEN notation
   */
  getFen() {
    return this.game.fen();
  }

  /**
   * Get current position as PGN string
   * @returns {string} PGN notation
   */
  getPgn() {
    return this.game.pgn();
  }

  /**
   * Load game from PGN string
   * @param {string} pgn - PGN notation string
   * @returns {boolean} Success status
   */
  loadPgn(pgn) {
    try {
      this.game.load_pgn(pgn);
      return true;
    } catch (error) {
      console.error('Invalid PGN:', error);
      return false;
    }
  }

  /**
   * Make a move
   * @param {string|object} move - Move in SAN or object format {from, to, promotion}
   * @returns {object|null} Move object or null if invalid
   */
  move(move) {
    try {
      const result = this.game.move(move);
      if (result) {
        this.moveHistory.push(result);
      }
      return result;
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }

  /**
   * Undo the last move
   * @returns {object|null} Undone move or null
   */
  undo() {
    const move = this.game.undo();
    if (move && this.moveHistory.length > 0) {
      this.moveHistory.pop();
    }
    return move;
  }

  /**
   * Get all legal moves from a square or all legal moves
   * @param {string} square - Square in algebraic notation (e.g., 'e4')
   * @returns {array} Array of legal moves
   */
  getLegalMoves(square) {
    if (square) {
      return this.game.moves({ square: square, verbose: true });
    }
    return this.game.moves({ verbose: true });
  }

  /**
   * Check if a move is legal
   * @param {string} from - Source square
   * @param {string} to - Target square
   * @param {string} promotion - Promotion piece (optional)
   * @returns {boolean} Whether move is legal
   */
  isLegalMove(from, to, promotion) {
    const moves = this.getLegalMoves(from);
    return moves.some(m => m.to === to && (!promotion || m.promotion === promotion));
  }

  /**
   * Get current turn
   * @returns {string} 'w' for white, 'b' for black
   */
  getTurn() {
    return this.game.turn();
  }

  /**
   * Check if game is over
   * @returns {boolean}
   */
  isGameOver() {
    return this.game.game_over();
  }

  /**
   * Check if current position is checkmate
   * @returns {boolean}
   */
  isCheckmate() {
    return this.game.in_checkmate();
  }

  /**
   * Check if current position is stalemate
   * @returns {boolean}
   */
  isStalemate() {
    return this.game.in_stalemate();
  }

  /**
   * Check if current position is draw
   * @returns {boolean}
   */
  isDraw() {
    return this.game.in_draw();
  }

  /**
   * Check if current position is threefold repetition
   * @returns {boolean}
   */
  isThreefoldRepetition() {
    return this.game.in_threefold_repetition();
  }

  /**
   * Check if king is in check
   * @returns {boolean}
   */
  inCheck() {
    return this.game.in_check();
  }

  /**
   * Get piece at square
   * @param {string} square - Square in algebraic notation
   * @returns {object|null} Piece object {type, color} or null
   */
  getPiece(square) {
    return this.game.get(square);
  }

  /**
   * Get current board position
   * @returns {object} Board representation
   */
  getBoard() {
    return this.game.board();
  }

  /**
   * Get move history
   * @returns {array} Array of move objects
   */
  getHistory() {
    return this.moveHistory;
  }

  /**
   * Get game status message
   * @returns {string} Human-readable status
   */
  getStatus() {
    if (this.isCheckmate()) {
      const winner = this.getTurn() === 'w' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    }
    if (this.isStalemate()) {
      return 'Draw by stalemate';
    }
    if (this.isThreefoldRepetition()) {
      return 'Draw by threefold repetition';
    }
    if (this.isDraw()) {
      return 'Draw';
    }
    if (this.inCheck()) {
      const side = this.getTurn() === 'w' ? 'White' : 'Black';
      return `${side} is in check`;
    }
    const side = this.getTurn() === 'w' ? 'White' : 'Black';
    return `${side} to move`;
  }
}

// Export singleton instance
const chessWrapper = new ChessWrapper();
export default chessWrapper;
