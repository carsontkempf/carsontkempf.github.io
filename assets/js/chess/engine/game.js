/**
 * Game Logic Module
 * Handles make/unmake moves and legal move filtering
 * Part of Carson's Chess Engine
 * @module chess/engine/game
 */

import {
  WHITE, BLACK,
  PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
  setBit, clearBit, getBit,
  getFile, getRank,
  bitboardToSquares
} from './bitboard.js';

import {
  getKnightAttacks,
  getKingAttacks,
  getPawnAttacks,
  getRookAttacks,
  getBishopAttacks,
  getQueenAttacks
} from './attacks.js';

import {
  Move,
  generateMoves,
  MOVE_FLAG_DOUBLE_PAWN,
  MOVE_FLAG_KING_CASTLE,
  MOVE_FLAG_QUEEN_CASTLE,
  MOVE_FLAG_EP_CAPTURE
} from './movegen.js';

import {
  computeHash,
  updateHashMove,
  updateHashCapture,
  updateHashCastling,
  updateHashEnPassant,
  toggleSideToMove
} from './zobrist.js';

/**
 * Saved state for unmake move
 */
class GameState {
  constructor(board) {
    this.castlingRights = board.castlingRights;
    this.enPassantSquare = board.enPassantSquare;
    this.halfmoveClock = board.halfmoveClock;
    this.fullmoveNumber = board.fullmoveNumber;
    this.hash = board.hash;
    this.capturedPiece = null;
    this.movedPiece = null;  // Will store the piece type that was moved
  }
}

/**
 * Check if a square is attacked by a given side
 * @param {Board} board - Board instance
 * @param {number} square - Square to check
 * @param {number} attackingSide - Side doing the attacking
 * @returns {boolean} True if square is attacked
 */
export function isSquareAttacked(board, square, attackingSide) {
  const allPieces = board.occupancy[2];

  // Check pawn attacks
  const pawnAttacks = getPawnAttacks(square, 1 - attackingSide);
  if (pawnAttacks & board.bitboards[attackingSide][PAWN]) {
    return true;
  }

  // Check knight attacks
  const knightAttacks = getKnightAttacks(square);
  if (knightAttacks & board.bitboards[attackingSide][KNIGHT]) {
    return true;
  }

  // Check king attacks
  const kingAttacks = getKingAttacks(square);
  if (kingAttacks & board.bitboards[attackingSide][KING]) {
    return true;
  }

  // Check bishop/queen diagonal attacks
  const bishopAttacks = getBishopAttacks(square, allPieces);
  if (bishopAttacks & (board.bitboards[attackingSide][BISHOP] | board.bitboards[attackingSide][QUEEN])) {
    return true;
  }

  // Check rook/queen straight attacks
  const rookAttacks = getRookAttacks(square, allPieces);
  if (rookAttacks & (board.bitboards[attackingSide][ROOK] | board.bitboards[attackingSide][QUEEN])) {
    return true;
  }

  return false;
}

/**
 * Check if the current side to move is in check
 * @param {Board} board - Board instance
 * @returns {boolean} True if in check
 */
export function isInCheck(board) {
  const us = board.sideToMove;
  const them = 1 - us;
  const kingBB = board.bitboards[us][KING];

  if (kingBB === 0n) return false;

  const kingSquare = bitboardToSquares(kingBB)[0];
  return isSquareAttacked(board, kingSquare, them);
}

/**
 * Filter pseudo-legal moves to only legal moves
 * @param {Board} board - Board instance
 * @param {Move[]} moves - Pseudo-legal moves
 * @returns {Move[]} Legal moves
 */
export function filterLegalMoves(board, moves) {
  const legalMoves = [];

  for (const move of moves) {
    // makeMove returns the state we need for unmakeMove
    const movingSide = board.sideToMove;
    const state = makeMove(board, move);

    // After makeMove, sideToMove has switched to opponent
    // We need to check if the side that JUST MOVED left their king in check
    // Temporarily switch back to check the moving side's king
    const currentSide = board.sideToMove;
    board.sideToMove = movingSide;
    const wasLegal = !isInCheck(board);
    board.sideToMove = currentSide;

    unmakeMove(board, move, state);

    if (wasLegal) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

/**
 * Generate all legal moves for current position
 * @param {Board} board - Board instance
 * @returns {Move[]} Legal moves
 */
export function generateLegalMoves(board) {
  const pseudoLegalMoves = generateMoves(board);
  return filterLegalMoves(board, pseudoLegalMoves);
}

/**
 * Make a move on the board
 * @param {Board} board - Board instance
 * @param {Move} move - Move to make
 * @returns {GameState} Previous game state (for unmake)
 */
export function makeMove(board, move) {
  const state = new GameState(board);
  const us = board.sideToMove;
  const them = 1 - us;
  const from = move.from;
  const to = move.to;

  // Get piece being moved
  const piece = board.getPieceAt(from);
  if (!piece) {
    throw new Error(`No piece at square ${from}`);
  }

  // Handle special moves
  if (move.isCastling()) {
    makeCastlingMove(board, move, us);
  } else if (move.isEnPassant()) {
    makeEnPassantMove(board, move, us, them);
  } else if (move.isPromotion()) {
    makePromotionMove(board, move, us, them, state);
  } else {
    makeNormalMove(board, move, us, them, piece.piece, state);
  }

  // Update castling rights
  updateCastlingRights(board, move, piece.piece);

  // Update en passant square
  const oldEP = board.enPassantSquare;
  if (move.flags === MOVE_FLAG_DOUBLE_PAWN) {
    const direction = us === WHITE ? -8 : 8;
    board.enPassantSquare = to + direction;
  } else {
    board.enPassantSquare = -1;
  }

  // Update hash for en passant change
  board.hash = updateHashEnPassant(board.hash, oldEP, board.enPassantSquare);

  // Update halfmove clock
  if (piece.piece === PAWN || state.capturedPiece) {
    board.halfmoveClock = 0;
  } else {
    board.halfmoveClock++;
  }

  // Update fullmove number
  if (us === BLACK) {
    board.fullmoveNumber++;
  }

  // Switch side to move
  board.sideToMove = them;
  board.hash = toggleSideToMove(board.hash);

  return state;
}

/**
 * Unmake a move on the board
 * @param {Board} board - Board instance
 * @param {Move} move - Move to unmake
 * @param {GameState} state - Previous game state
 */
export function unmakeMove(board, move, state) {
  const us = 1 - board.sideToMove; // Side that made the move
  const them = board.sideToMove;
  const from = move.from;
  const to = move.to;

  // Reverse special moves
  if (move.isCastling()) {
    unmakeCastlingMove(board, move, us);
  } else if (move.isEnPassant()) {
    unmakeEnPassantMove(board, move, us, them);
  } else if (move.isPromotion()) {
    unmakePromotionMove(board, move, us, them, state);
  } else {
    unmakeNormalMove(board, move, us, them, state);
  }

  // Restore game state
  board.castlingRights = state.castlingRights;
  board.enPassantSquare = state.enPassantSquare;
  board.halfmoveClock = state.halfmoveClock;
  board.fullmoveNumber = state.fullmoveNumber;
  board.hash = state.hash;
  board.sideToMove = us;
}

/**
 * Make normal (non-special) move
 */
function makeNormalMove(board, move, us, them, pieceType, state) {
  const from = move.from;
  const to = move.to;

  // Save the piece type being moved
  state.movedPiece = pieceType;

  // Check for capture
  const capturedPiece = board.getPieceAt(to);
  if (capturedPiece) {
    state.capturedPiece = capturedPiece;
    board.removePiece(to);
    board.hash = updateHashCapture(board.hash, to, capturedPiece.piece, capturedPiece.color);
  }

  // Move piece
  board.removePiece(from);
  board.placePiece(to, pieceType, us);

  // Update hash
  board.hash = updateHashMove(board.hash, from, to, pieceType, us);
}

/**
 * Unmake normal move
 */
function unmakeNormalMove(board, move, us, them, state) {
  const from = move.from;
  const to = move.to;

  // Use the saved piece type from state
  const pieceType = state.movedPiece;

  // Move piece back
  board.removePiece(to);
  board.placePiece(from, pieceType, us);

  // Restore captured piece
  if (state.capturedPiece) {
    board.placePiece(to, state.capturedPiece.piece, state.capturedPiece.color);
  }
}

/**
 * Make castling move
 */
function makeCastlingMove(board, move, us) {
  if (move.flags === MOVE_FLAG_KING_CASTLE) {
    // Kingside castling
    if (us === WHITE) {
      board.removePiece(4); // King from e1
      board.removePiece(7); // Rook from h1
      board.placePiece(6, KING, WHITE); // King to g1
      board.placePiece(5, ROOK, WHITE); // Rook to f1

      board.hash = updateHashMove(board.hash, 4, 6, KING, WHITE);
      board.hash = updateHashMove(board.hash, 7, 5, ROOK, WHITE);
    } else {
      board.removePiece(60); // King from e8
      board.removePiece(63); // Rook from h8
      board.placePiece(62, KING, BLACK); // King to g8
      board.placePiece(61, ROOK, BLACK); // Rook to f8

      board.hash = updateHashMove(board.hash, 60, 62, KING, BLACK);
      board.hash = updateHashMove(board.hash, 63, 61, ROOK, BLACK);
    }
  } else {
    // Queenside castling
    if (us === WHITE) {
      board.removePiece(4); // King from e1
      board.removePiece(0); // Rook from a1
      board.placePiece(2, KING, WHITE); // King to c1
      board.placePiece(3, ROOK, WHITE); // Rook to d1

      board.hash = updateHashMove(board.hash, 4, 2, KING, WHITE);
      board.hash = updateHashMove(board.hash, 0, 3, ROOK, WHITE);
    } else {
      board.removePiece(60); // King from e8
      board.removePiece(56); // Rook from a8
      board.placePiece(58, KING, BLACK); // King to c8
      board.placePiece(59, ROOK, BLACK); // Rook to d8

      board.hash = updateHashMove(board.hash, 60, 58, KING, BLACK);
      board.hash = updateHashMove(board.hash, 56, 59, ROOK, BLACK);
    }
  }
}

/**
 * Unmake castling move
 */
function unmakeCastlingMove(board, move, us) {
  if (move.flags === MOVE_FLAG_KING_CASTLE) {
    // Kingside castling
    if (us === WHITE) {
      board.removePiece(6);
      board.removePiece(5);
      board.placePiece(4, KING, WHITE);
      board.placePiece(7, ROOK, WHITE);
    } else {
      board.removePiece(62);
      board.removePiece(61);
      board.placePiece(60, KING, BLACK);
      board.placePiece(63, ROOK, BLACK);
    }
  } else {
    // Queenside castling
    if (us === WHITE) {
      board.removePiece(2);
      board.removePiece(3);
      board.placePiece(4, KING, WHITE);
      board.placePiece(0, ROOK, WHITE);
    } else {
      board.removePiece(58);
      board.removePiece(59);
      board.placePiece(60, KING, BLACK);
      board.placePiece(56, ROOK, BLACK);
    }
  }
}

/**
 * Make en passant move
 */
function makeEnPassantMove(board, move, us, them) {
  const from = move.from;
  const to = move.to;
  const captureSquare = us === WHITE ? to - 8 : to + 8;

  // Remove captured pawn
  board.removePiece(captureSquare);

  // Move pawn
  board.removePiece(from);
  board.placePiece(to, PAWN, us);

  // Update hash
  board.hash = updateHashCapture(board.hash, captureSquare, PAWN, them);
  board.hash = updateHashMove(board.hash, from, to, PAWN, us);
}

/**
 * Unmake en passant move
 */
function unmakeEnPassantMove(board, move, us, them) {
  const from = move.from;
  const to = move.to;
  const captureSquare = us === WHITE ? to - 8 : to + 8;

  // Move pawn back
  board.removePiece(to);
  board.placePiece(from, PAWN, us);

  // Restore captured pawn
  board.placePiece(captureSquare, PAWN, them);
}

/**
 * Make promotion move
 */
function makePromotionMove(board, move, us, them, state) {
  const from = move.from;
  const to = move.to;
  const promoType = move.getPromotionPiece();

  // Save the promoted piece type
  state.movedPiece = promoType;

  // Check for capture
  const capturedPiece = board.getPieceAt(to);
  if (capturedPiece) {
    state.capturedPiece = capturedPiece;
    board.removePiece(to);
    board.hash = updateHashCapture(board.hash, to, capturedPiece.piece, capturedPiece.color);
  }

  // Remove pawn and place promoted piece
  board.removePiece(from);
  board.placePiece(to, promoType, us);

  // Update hash (remove pawn, add promoted piece)
  board.hash = updateHashCapture(board.hash, from, PAWN, us);
  board.hash = updateHashMove(board.hash, to, to, promoType, us);
}

/**
 * Unmake promotion move
 */
function unmakePromotionMove(board, move, us, them, state) {
  const from = move.from;
  const to = move.to;

  // Remove promoted piece
  board.removePiece(to);

  // Restore pawn
  board.placePiece(from, PAWN, us);

  // Restore captured piece
  if (state.capturedPiece) {
    board.placePiece(to, state.capturedPiece.piece, state.capturedPiece.color);
  }
}

/**
 * Update castling rights after a move
 */
function updateCastlingRights(board, move, pieceType) {
  const oldRights = board.castlingRights;

  // King moves remove all castling rights for that side
  if (pieceType === KING) {
    if (board.sideToMove === WHITE) {
      board.castlingRights &= ~0x3; // Remove white castling rights
    } else {
      board.castlingRights &= ~0xC; // Remove black castling rights
    }
  }

  // Rook moves or captures remove castling on that side
  if (move.from === 0 || move.to === 0) board.castlingRights &= ~0x2; // White queenside
  if (move.from === 7 || move.to === 7) board.castlingRights &= ~0x1; // White kingside
  if (move.from === 56 || move.to === 56) board.castlingRights &= ~0x8; // Black queenside
  if (move.from === 63 || move.to === 63) board.castlingRights &= ~0x4; // Black kingside

  // Update hash if castling rights changed
  if (oldRights !== board.castlingRights) {
    board.hash = updateHashCastling(board.hash, oldRights, board.castlingRights);
  }
}

/**
 * Make a null move (skip turn for null move pruning)
 * @param {Board} board - Board instance
 * @returns {GameState} State to restore
 */
export function makeNullMove(board) {
  const state = new GameState(board);

  // Toggle side to move
  board.sideToMove = 1 - board.sideToMove;
  board.hash = toggleSideToMove(board.hash);

  // Clear en passant if it exists
  if (board.enPassantSquare !== -1) {
    board.hash = updateHashEnPassant(board.hash, board.enPassantSquare, -1);
    board.enPassantSquare = -1;
  }

  // Update zobristHash for external use
  board.zobristHash = board.hash;

  return state;
}

/**
 * Unmake a null move
 * @param {Board} board - Board instance
 * @param {GameState} state - Saved state
 */
export function unmakeNullMove(board, state) {
  board.sideToMove = 1 - board.sideToMove;
  board.enPassantSquare = state.enPassantSquare;
  board.hash = state.hash;
  board.zobristHash = state.hash;
}

/**
 * Check if position has major pieces (non-pawn, non-king pieces)
 * Used to avoid null move pruning in zugzwang-prone endgames
 * @param {Board} board - Board instance
 * @returns {boolean} True if side to move has major pieces
 */
export function hasMajorPieces(board) {
  const side = board.sideToMove;

  // Check for knights, bishops, rooks, or queens
  const hasKnight = board.bitboards[side][KNIGHT] !== 0n;
  const hasBishop = board.bitboards[side][BISHOP] !== 0n;
  const hasRook = board.bitboards[side][ROOK] !== 0n;
  const hasQueen = board.bitboards[side][QUEEN] !== 0n;

  return hasKnight || hasBishop || hasRook || hasQueen;
}

export default {
  isSquareAttacked,
  isInCheck,
  filterLegalMoves,
  generateLegalMoves,
  makeMove,
  unmakeMove,
  makeNullMove,
  unmakeNullMove,
  hasMajorPieces,
  GameState
};
