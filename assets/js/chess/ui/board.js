/**
 * BoardManager - Visual board representation and interaction
 * Handles drag-and-drop, move list, and position navigation
 * Part of Carson's Chess Engine
 * @module chess/ui/board
 */

import { Board, parseFEN, generateFEN, STARTING_FEN } from '../engine/board.js';
import { generateLegalMoves, makeMove, unmakeMove, isInCheck } from '../engine/game.js';
import {
  algebraicToSquare,
  squareToAlgebraic,
  WHITE,
  BLACK,
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING,
  getRank
} from '../engine/bitboard.js';
import {
  Move,
  MOVE_FLAG_KING_CASTLE,
  MOVE_FLAG_QUEEN_CASTLE,
  MOVE_FLAG_EP_CAPTURE,
  MOVE_FLAG_KNIGHT_PROMO,
  MOVE_FLAG_BISHOP_PROMO,
  MOVE_FLAG_ROOK_PROMO,
  MOVE_FLAG_QUEEN_PROMO,
  MOVE_FLAG_KNIGHT_PROMO_CAPTURE,
  MOVE_FLAG_BISHOP_PROMO_CAPTURE,
  MOVE_FLAG_ROOK_PROMO_CAPTURE,
  MOVE_FLAG_QUEEN_PROMO_CAPTURE
} from '../engine/movegen.js';
import { openingDetector } from './opening-detector.js';

/**
 * BoardManager class
 * Manages the visual board, move validation, and game state
 */
export class BoardManager {
  constructor(boardElementId = 'chess-board') {
    this.boardElementId = boardElementId;
    this.visualBoard = null;
    this.engineBoard = parseFEN(STARTING_FEN);
    this.moveHistory = []; // Array of {move, state, fen, san}
    this.currentMoveIndex = -1; // -1 means at starting position
    this.isViewingHistory = false;
    this.pendingPromotion = null; // {from, to, moves}
    this.lastMoveSquares = null; // {from, to}

    this.initializeBoard();
    this.setupPromotionDialog();
  }

  /**
   * Initialize Chessboard.js with drag-and-drop enabled
   */
  initializeBoard() {
    const config = {
      position: 'start',
      draggable: true,
      onDragStart: this.onDragStart.bind(this),
      onDrop: this.onDrop.bind(this),
      onSnapEnd: this.onSnapEnd.bind(this),
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    this.visualBoard = Chessboard(this.boardElementId, config);
    console.log('[BoardManager] Board initialized');
  }

  /**
   * Setup promotion dialog HTML and event listeners
   */
  setupPromotionDialog() {
    // Check if dialog already exists
    if (document.getElementById('promotion-dialog')) {
      this.attachPromotionListeners();
      return;
    }

    // Create promotion dialog
    const dialog = document.createElement('div');
    dialog.id = 'promotion-dialog';
    dialog.className = 'promotion-dialog';
    dialog.style.display = 'none';
    dialog.innerHTML = `
      <div class="promotion-overlay"></div>
      <div class="promotion-content">
        <h3>Choose Promotion Piece</h3>
        <div class="promotion-pieces">
          <button class="promotion-piece" data-piece="q">
            <img src="https://chessboardjs.com/img/chesspieces/wikipedia/wQ.png" alt="Queen">
            <span>Queen</span>
          </button>
          <button class="promotion-piece" data-piece="r">
            <img src="https://chessboardjs.com/img/chesspieces/wikipedia/wR.png" alt="Rook">
            <span>Rook</span>
          </button>
          <button class="promotion-piece" data-piece="b">
            <img src="https://chessboardjs.com/img/chesspieces/wikipedia/wB.png" alt="Bishop">
            <span>Bishop</span>
          </button>
          <button class="promotion-piece" data-piece="n">
            <img src="https://chessboardjs.com/img/chesspieces/wikipedia/wN.png" alt="Knight">
            <span>Knight</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);

    this.attachPromotionListeners();
    console.log('[BoardManager] Promotion dialog created');
  }

  /**
   * Attach event listeners to promotion buttons
   */
  attachPromotionListeners() {
    const buttons = document.querySelectorAll('.promotion-piece');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const piece = e.currentTarget.getAttribute('data-piece');
        this.completePromotion(piece);
      });
    });
  }

  /**
   * Called when user starts dragging a piece
   */
  onDragStart(source, piece, position, orientation) {
    // Don't allow moves if viewing history
    if (this.isViewingHistory) {
      return false;
    }

    // Don't allow dragging opponent's pieces
    const currentSide = this.engineBoard.sideToMove;
    if (currentSide === WHITE && piece.search(/^b/) !== -1) {
      return false;
    }
    if (currentSide === BLACK && piece.search(/^w/) !== -1) {
      return false;
    }

    return true;
  }

  /**
   * Called when user drops a piece
   */
  onDrop(source, target) {
    // Prevent drops if viewing history
    if (this.isViewingHistory) {
      return 'snapback';
    }

    // Check if this is a pawn promotion move
    const fromSquare = algebraicToSquare(source);
    const toSquare = algebraicToSquare(target);

    // Generate legal moves
    const legalMoves = generateLegalMoves(this.engineBoard);

    // Find matching moves (from and to match)
    const matchingMoves = legalMoves.filter(move =>
      move.from === fromSquare && move.to === toSquare
    );

    if (matchingMoves.length === 0) {
      // Illegal move
      return 'snapback';
    }

    // Check if this is a promotion
    const piece = this.engineBoard.mailbox[fromSquare];
    const pieceType = Math.abs(piece) - 1;
    const toRank = getRank(toSquare);

    if (pieceType === PAWN && (toRank === 0 || toRank === 7)) {
      // This is a promotion - show dialog
      this.pendingPromotion = {
        from: source,
        to: target,
        moves: matchingMoves
      };
      this.showPromotionDialog(this.engineBoard.sideToMove);
      return; // Don't snap back, dialog will handle it
    }

    // Not a promotion - execute the move (only one matching move)
    if (matchingMoves.length === 1) {
      this.executeMove(matchingMoves[0]);
      return;
    }

    // Should not reach here
    console.error('[BoardManager] Multiple non-promotion moves found', matchingMoves);
    return 'snapback';
  }

  /**
   * Called after piece snap animation completes
   */
  onSnapEnd() {
    // Update board to match engine state (in case of illegal move)
    this.updateVisualBoard();
  }

  /**
   * Show promotion dialog
   */
  showPromotionDialog(color) {
    const dialog = document.getElementById('promotion-dialog');
    if (!dialog) return;

    // Update piece images to match color
    const pieces = dialog.querySelectorAll('.promotion-piece img');
    const colorPrefix = color === WHITE ? 'w' : 'b';
    pieces[0].src = `https://chessboardjs.com/img/chesspieces/wikipedia/${colorPrefix}Q.png`;
    pieces[1].src = `https://chessboardjs.com/img/chesspieces/wikipedia/${colorPrefix}R.png`;
    pieces[2].src = `https://chessboardjs.com/img/chesspieces/wikipedia/${colorPrefix}B.png`;
    pieces[3].src = `https://chessboardjs.com/img/chesspieces/wikipedia/${colorPrefix}N.png`;

    dialog.style.display = 'block';
  }

  /**
   * Hide promotion dialog
   */
  hidePromotionDialog() {
    const dialog = document.getElementById('promotion-dialog');
    if (dialog) {
      dialog.style.display = 'none';
    }
  }

  /**
   * Complete promotion with selected piece
   */
  completePromotion(pieceSymbol) {
    if (!this.pendingPromotion) return;

    // Map piece symbol to promotion flag
    const promoPieceMap = {
      'q': QUEEN,
      'r': ROOK,
      'b': BISHOP,
      'n': KNIGHT
    };

    const promoPiece = promoPieceMap[pieceSymbol.toLowerCase()];
    if (promoPiece === undefined) {
      console.error('[BoardManager] Invalid promotion piece:', pieceSymbol);
      this.hidePromotionDialog();
      this.pendingPromotion = null;
      this.updateVisualBoard();
      return;
    }

    // Find the matching promotion move
    const move = this.pendingPromotion.moves.find(m => {
      const flag = m.flags;
      // Check if the promotion piece matches
      if (flag === MOVE_FLAG_QUEEN_PROMO || flag === MOVE_FLAG_QUEEN_PROMO_CAPTURE) {
        return promoPiece === QUEEN;
      } else if (flag === MOVE_FLAG_ROOK_PROMO || flag === MOVE_FLAG_ROOK_PROMO_CAPTURE) {
        return promoPiece === ROOK;
      } else if (flag === MOVE_FLAG_BISHOP_PROMO || flag === MOVE_FLAG_BISHOP_PROMO_CAPTURE) {
        return promoPiece === BISHOP;
      } else if (flag === MOVE_FLAG_KNIGHT_PROMO || flag === MOVE_FLAG_KNIGHT_PROMO_CAPTURE) {
        return promoPiece === KNIGHT;
      }
      return false;
    });

    if (!move) {
      console.error('[BoardManager] No matching promotion move found');
      this.hidePromotionDialog();
      this.pendingPromotion = null;
      this.updateVisualBoard();
      return;
    }

    // Execute the promotion move
    this.executeMove(move);
    this.hidePromotionDialog();
    this.pendingPromotion = null;
  }

  /**
   * Execute a move on the engine board and update UI
   */
  executeMove(move) {
    // Generate SAN before making the move
    const san = this.moveToSAN(move, this.engineBoard);

    // Save state and make move
    const state = makeMove(this.engineBoard, move);
    const fen = generateFEN(this.engineBoard);

    // Add to move history
    this.moveHistory.push({ move, state, fen, san });
    this.currentMoveIndex = this.moveHistory.length - 1;
    this.isViewingHistory = false;

    // Update last move highlighting
    this.lastMoveSquares = {
      from: squareToAlgebraic(move.from),
      to: squareToAlgebraic(move.to)
    };

    // Update visual board
    this.updateVisualBoard();
    this.highlightLastMove();

    // Update move list
    this.updateMoveList();

    // Update opening detector
    if (openingDetector) {
      openingDetector.update(this.engineBoard);
    }

    // Emit event for other components
    window.dispatchEvent(new CustomEvent('chessMoveMade', {
      detail: { move, san, fen }
    }));

    console.log('[BoardManager] Move executed:', san);
  }

  /**
   * Convert move to Standard Algebraic Notation (SAN)
   */
  moveToSAN(move, boardBeforeMove) {
    const { from, to, flags } = move;
    const piece = boardBeforeMove.mailbox[from];
    const pieceType = Math.abs(piece) - 1;
    const isCapture = boardBeforeMove.mailbox[to] !== 0 || flags === MOVE_FLAG_EP_CAPTURE;

    // Castling
    if (flags === MOVE_FLAG_KING_CASTLE) {
      return 'O-O';
    }
    if (flags === MOVE_FLAG_QUEEN_CASTLE) {
      return 'O-O-O';
    }

    let san = '';

    // Piece symbol (pawns have no symbol)
    if (pieceType !== PAWN) {
      const pieceSymbols = ['', 'N', 'B', 'R', 'Q', 'K'];
      san += pieceSymbols[pieceType];

      // Add disambiguation if needed
      const disambiguation = this.getDisambiguation(move, boardBeforeMove);
      san += disambiguation;
    } else if (isCapture) {
      // Pawn captures include file
      san += squareToAlgebraic(from)[0];
    }

    // Capture symbol
    if (isCapture) {
      san += 'x';
    }

    // Destination square
    san += squareToAlgebraic(to);

    // Promotion
    if (flags >= MOVE_FLAG_KNIGHT_PROMO) {
      const promoSymbols = {
        [MOVE_FLAG_KNIGHT_PROMO]: '=N',
        [MOVE_FLAG_BISHOP_PROMO]: '=B',
        [MOVE_FLAG_ROOK_PROMO]: '=R',
        [MOVE_FLAG_QUEEN_PROMO]: '=Q',
        [MOVE_FLAG_KNIGHT_PROMO_CAPTURE]: '=N',
        [MOVE_FLAG_BISHOP_PROMO_CAPTURE]: '=B',
        [MOVE_FLAG_ROOK_PROMO_CAPTURE]: '=R',
        [MOVE_FLAG_QUEEN_PROMO_CAPTURE]: '=Q'
      };
      san += promoSymbols[flags] || '';
    }

    // Check or checkmate (need to make move temporarily to check)
    const tempState = makeMove(boardBeforeMove, move);
    if (isInCheck(boardBeforeMove)) {
      const hasLegalMoves = generateLegalMoves(boardBeforeMove).length > 0;
      san += hasLegalMoves ? '+' : '#';
    }
    unmakeMove(boardBeforeMove, move, tempState);

    return san;
  }

  /**
   * Get disambiguation for piece moves (e.g., Nbd2 vs Nfd2)
   */
  getDisambiguation(move, board) {
    const { from, to } = move;
    const piece = board.mailbox[from];
    const pieceType = Math.abs(piece) - 1;

    // Only non-pawn pieces need disambiguation
    if (pieceType === PAWN) return '';

    // Find all legal moves that move the same piece type to the same square
    const legalMoves = generateLegalMoves(board);
    const ambiguousMoves = legalMoves.filter(m => {
      if (m.from === from) return false; // Skip the move itself
      if (m.to !== to) return false; // Must go to same square
      const otherPiece = board.mailbox[m.from];
      return Math.abs(otherPiece) - 1 === pieceType;
    });

    if (ambiguousMoves.length === 0) {
      return ''; // No ambiguity
    }

    // Check if file disambiguation is sufficient
    const fromAlg = squareToAlgebraic(from);
    const sameFile = ambiguousMoves.some(m =>
      squareToAlgebraic(m.from)[0] === fromAlg[0]
    );
    const sameRank = ambiguousMoves.some(m =>
      squareToAlgebraic(m.from)[1] === fromAlg[1]
    );

    if (!sameFile) {
      return fromAlg[0]; // File is sufficient
    } else if (!sameRank) {
      return fromAlg[1]; // Rank is sufficient
    } else {
      return fromAlg; // Need both file and rank
    }
  }

  /**
   * Update visual board from engine state
   */
  updateVisualBoard() {
    const fen = generateFEN(this.engineBoard);
    this.visualBoard.position(fen, false);
  }

  /**
   * Highlight last move on board
   */
  highlightLastMove() {
    // Remove old highlights
    document.querySelectorAll('.square-55d63').forEach(sq => {
      sq.classList.remove('highlight-last-move');
    });

    if (!this.lastMoveSquares) return;

    // Add new highlights
    const fromEl = document.querySelector(`.square-${this.lastMoveSquares.from}`);
    const toEl = document.querySelector(`.square-${this.lastMoveSquares.to}`);

    if (fromEl) fromEl.classList.add('highlight-last-move');
    if (toEl) toEl.classList.add('highlight-last-move');
  }

  /**
   * Update move list UI
   */
  updateMoveList() {
    const moveListEl = document.getElementById('move-list');
    if (!moveListEl) return;

    moveListEl.innerHTML = '';

    for (let i = 0; i < this.moveHistory.length; i++) {
      const moveData = this.moveHistory[i];
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhiteMove = i % 2 === 0;

      // Create or get move pair container
      let pairEl;
      if (isWhiteMove) {
        pairEl = document.createElement('div');
        pairEl.className = 'move-pair';
        pairEl.innerHTML = `<span class="move-number">${moveNumber}.</span>`;
        moveListEl.appendChild(pairEl);
      } else {
        pairEl = moveListEl.lastElementChild;
      }

      // Create move element
      const moveEl = document.createElement('span');
      moveEl.className = isWhiteMove ? 'white-move' : 'black-move';
      moveEl.textContent = moveData.san;
      moveEl.dataset.moveIndex = i;

      // Highlight current move
      if (i === this.currentMoveIndex) {
        moveEl.classList.add('current-move');
      }

      // Make clickable
      moveEl.addEventListener('click', () => {
        this.jumpToMove(i);
      });

      pairEl.appendChild(moveEl);
    }

    // Scroll to bottom of move list
    moveListEl.scrollTop = moveListEl.scrollHeight;
  }

  /**
   * Jump to a specific move in history
   */
  jumpToMove(index) {
    if (index < -1 || index >= this.moveHistory.length) {
      console.error('[BoardManager] Invalid move index:', index);
      return;
    }

    this.currentMoveIndex = index;
    this.isViewingHistory = index < this.moveHistory.length - 1;

    // Rebuild board state from start to this move
    this.engineBoard = parseFEN(STARTING_FEN);

    for (let i = 0; i <= index; i++) {
      const { move } = this.moveHistory[i];
      makeMove(this.engineBoard, move);
    }

    // Update last move highlighting
    if (index >= 0) {
      const move = this.moveHistory[index].move;
      this.lastMoveSquares = {
        from: squareToAlgebraic(move.from),
        to: squareToAlgebraic(move.to)
      };
    } else {
      this.lastMoveSquares = null;
    }

    // Update visual board
    this.updateVisualBoard();
    this.highlightLastMove();
    this.updateMoveList();

    // Update opening detector
    if (openingDetector) {
      openingDetector.update(this.engineBoard);
    }

    console.log('[BoardManager] Jumped to move index:', index);
  }

  /**
   * Reset board to starting position
   */
  reset() {
    this.engineBoard = parseFEN(STARTING_FEN);
    this.moveHistory = [];
    this.currentMoveIndex = -1;
    this.isViewingHistory = false;
    this.lastMoveSquares = null;
    this.pendingPromotion = null;

    this.updateVisualBoard();
    this.highlightLastMove();
    this.updateMoveList();

    // Reset opening detector
    if (openingDetector) {
      openingDetector.reset();
    }

    console.log('[BoardManager] Board reset');
  }

  /**
   * Flip board orientation
   */
  flip() {
    this.visualBoard.flip();
    console.log('[BoardManager] Board flipped');
  }

  /**
   * Undo last move
   */
  undo() {
    if (this.moveHistory.length === 0) {
      console.warn('[BoardManager] No moves to undo');
      return false;
    }

    // Remove last move from history
    const lastMove = this.moveHistory.pop();
    this.currentMoveIndex = this.moveHistory.length - 1;
    this.isViewingHistory = false;

    // Rebuild board state
    this.engineBoard = parseFEN(STARTING_FEN);
    for (let i = 0; i < this.moveHistory.length; i++) {
      makeMove(this.engineBoard, this.moveHistory[i].move);
    }

    // Update last move highlighting
    if (this.moveHistory.length > 0) {
      const move = this.moveHistory[this.moveHistory.length - 1].move;
      this.lastMoveSquares = {
        from: squareToAlgebraic(move.from),
        to: squareToAlgebraic(move.to)
      };
    } else {
      this.lastMoveSquares = null;
    }

    this.updateVisualBoard();
    this.highlightLastMove();
    this.updateMoveList();

    // Update opening detector
    if (openingDetector) {
      openingDetector.update(this.engineBoard);
    }

    console.log('[BoardManager] Move undone');
    return true;
  }

  /**
   * Get current FEN
   */
  getFEN() {
    return generateFEN(this.engineBoard);
  }

  /**
   * Get current board state
   */
  getBoardState() {
    return this.engineBoard;
  }

  /**
   * Get move history
   */
  getMoveHistory() {
    return this.moveHistory;
  }

  /**
   * Check if currently viewing history
   */
  isViewingHistoricalPosition() {
    return this.isViewingHistory;
  }

  /**
   * Return to latest position
   */
  goToLatestPosition() {
    if (!this.isViewingHistory) return;
    this.jumpToMove(this.moveHistory.length - 1);
  }
}

// Singleton instance
let boardManager = null;

/**
 * Get BoardManager singleton
 */
export function getBoardManager() {
  if (!boardManager) {
    boardManager = new BoardManager();
  }
  return boardManager;
}

/**
 * Initialize board manager (called from HTML)
 */
export function initializeBoardManager() {
  return getBoardManager();
}

export default {
  BoardManager,
  getBoardManager,
  initializeBoardManager
};
