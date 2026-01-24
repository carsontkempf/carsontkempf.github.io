/**
 * Move Generation Module
 * Handles move encoding and pseudo-legal move generation
 * Part of Carson's Chess Engine
 * @module chess/engine/movegen
 */

import {
  WHITE, BLACK,
  PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
  setBit, getBit, popLSB,
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

// Move encoding flags
export const MOVE_FLAG_QUIET = 0;
export const MOVE_FLAG_DOUBLE_PAWN = 1;
export const MOVE_FLAG_KING_CASTLE = 2;
export const MOVE_FLAG_QUEEN_CASTLE = 3;
export const MOVE_FLAG_CAPTURE = 4;
export const MOVE_FLAG_EP_CAPTURE = 5;
export const MOVE_FLAG_KNIGHT_PROMO = 8;
export const MOVE_FLAG_BISHOP_PROMO = 9;
export const MOVE_FLAG_ROOK_PROMO = 10;
export const MOVE_FLAG_QUEEN_PROMO = 11;
export const MOVE_FLAG_KNIGHT_PROMO_CAPTURE = 12;
export const MOVE_FLAG_BISHOP_PROMO_CAPTURE = 13;
export const MOVE_FLAG_ROOK_PROMO_CAPTURE = 14;
export const MOVE_FLAG_QUEEN_PROMO_CAPTURE = 15;

/**
 * Move encoding: 16 bits
 * - From square: 6 bits (0-63)
 * - To square: 6 bits (0-63)
 * - Flags: 4 bits
 */
export class Move {
  constructor(from, to, flags = MOVE_FLAG_QUIET) {
    this.from = from;
    this.to = to;
    this.flags = flags;
  }

  /**
   * Encode move to 16-bit integer
   * @returns {number} Encoded move
   */
  encode() {
    return (this.from & 0x3f) | ((this.to & 0x3f) << 6) | ((this.flags & 0xf) << 12);
  }

  /**
   * Decode move from 16-bit integer
   * @param {number} encoded - Encoded move
   * @returns {Move} Move instance
   */
  static decode(encoded) {
    const from = encoded & 0x3f;
    const to = (encoded >> 6) & 0x3f;
    const flags = (encoded >> 12) & 0xf;
    return new Move(from, to, flags);
  }

  /**
   * Check if move is a capture
   * @returns {boolean}
   */
  isCapture() {
    return this.flags >= MOVE_FLAG_CAPTURE && this.flags !== MOVE_FLAG_EP_CAPTURE;
  }

  /**
   * Check if move is a promotion
   * @returns {boolean}
   */
  isPromotion() {
    return this.flags >= MOVE_FLAG_KNIGHT_PROMO;
  }

  /**
   * Check if move is castling
   * @returns {boolean}
   */
  isCastling() {
    return this.flags === MOVE_FLAG_KING_CASTLE || this.flags === MOVE_FLAG_QUEEN_CASTLE;
  }

  /**
   * Check if move is en passant
   * @returns {boolean}
   */
  isEnPassant() {
    return this.flags === MOVE_FLAG_EP_CAPTURE;
  }

  /**
   * Get promotion piece type
   * @returns {number|null} Piece type or null if not promotion
   */
  getPromotionPiece() {
    if (!this.isPromotion()) return null;

    const promoType = this.flags & 0x3;
    switch (promoType) {
      case 0: return KNIGHT;
      case 1: return BISHOP;
      case 2: return ROOK;
      case 3: return QUEEN;
      default: return null;
    }
  }

  /**
   * Convert move to algebraic notation
   * @returns {string}
   */
  toAlgebraic() {
    const fromStr = String.fromCharCode('a'.charCodeAt(0) + getFile(this.from)) + (getRank(this.from) + 1);
    const toStr = String.fromCharCode('a'.charCodeAt(0) + getFile(this.to)) + (getRank(this.to) + 1);
    let result = fromStr + toStr;

    if (this.isPromotion()) {
      const promoType = this.getPromotionPiece();
      const promoPiece = ['n', 'b', 'r', 'q'][promoType - 1];
      result += promoPiece;
    }

    return result;
  }
}

/**
 * Generate all pseudo-legal moves for a position
 * @param {Board} board - Board instance
 * @returns {Move[]} Array of moves
 */
export function generateMoves(board) {
  const moves = [];
  const us = board.sideToMove;
  const them = 1 - us;
  const ourPieces = board.occupancy[us];
  const theirPieces = board.occupancy[them];
  const allPieces = board.occupancy[2];

  // Generate pawn moves
  generatePawnMoves(board, moves, us, them, ourPieces, theirPieces, allPieces);

  // Generate knight moves
  generateKnightMoves(board, moves, us, ourPieces, theirPieces);

  // Generate bishop moves
  generateBishopMoves(board, moves, us, ourPieces, theirPieces, allPieces);

  // Generate rook moves
  generateRookMoves(board, moves, us, ourPieces, theirPieces, allPieces);

  // Generate queen moves
  generateQueenMoves(board, moves, us, ourPieces, theirPieces, allPieces);

  // Generate king moves
  generateKingMoves(board, moves, us, ourPieces, theirPieces);

  // Generate castling moves
  generateCastlingMoves(board, moves, us, allPieces);

  return moves;
}

/**
 * Generate pawn moves
 */
function generatePawnMoves(board, moves, us, them, ourPieces, theirPieces, allPieces) {
  const pawns = board.bitboards[us][PAWN];
  const direction = us === WHITE ? 8 : -8;
  const startRank = us === WHITE ? 1 : 6;
  const promoRank = us === WHITE ? 6 : 1;

  let bb = pawns;
  while (bb > 0n) {
    const result = popLSB(bb);
    bb = result.bitboard;
    const from = result.square;
    const rank = getRank(from);

    // Single push
    const to = from + direction;
    if (to >= 0 && to < 64 && !getBit(allPieces, to)) {
      if (rank === promoRank) {
        // Promotions
        moves.push(new Move(from, to, MOVE_FLAG_QUEEN_PROMO));
        moves.push(new Move(from, to, MOVE_FLAG_ROOK_PROMO));
        moves.push(new Move(from, to, MOVE_FLAG_BISHOP_PROMO));
        moves.push(new Move(from, to, MOVE_FLAG_KNIGHT_PROMO));
      } else {
        moves.push(new Move(from, to, MOVE_FLAG_QUIET));

        // Double push
        if (rank === startRank) {
          const doubleTo = from + direction * 2;
          if (!getBit(allPieces, doubleTo)) {
            moves.push(new Move(from, doubleTo, MOVE_FLAG_DOUBLE_PAWN));
          }
        }
      }
    }

    // Captures
    const attacks = getPawnAttacks(from, us);
    let captures = attacks & theirPieces;
    while (captures > 0n) {
      const captResult = popLSB(captures);
      captures = captResult.bitboard;
      const captureTo = captResult.square;

      if (rank === promoRank) {
        // Promotion captures
        moves.push(new Move(from, captureTo, MOVE_FLAG_QUEEN_PROMO_CAPTURE));
        moves.push(new Move(from, captureTo, MOVE_FLAG_ROOK_PROMO_CAPTURE));
        moves.push(new Move(from, captureTo, MOVE_FLAG_BISHOP_PROMO_CAPTURE));
        moves.push(new Move(from, captureTo, MOVE_FLAG_KNIGHT_PROMO_CAPTURE));
      } else {
        moves.push(new Move(from, captureTo, MOVE_FLAG_CAPTURE));
      }
    }

    // En passant
    if (board.enPassantSquare !== -1) {
      const epAttacks = attacks & setBit(0n, board.enPassantSquare);
      if (epAttacks !== 0n) {
        moves.push(new Move(from, board.enPassantSquare, MOVE_FLAG_EP_CAPTURE));
      }
    }
  }
}

/**
 * Generate knight moves
 */
function generateKnightMoves(board, moves, us, ourPieces, theirPieces) {
  let knights = board.bitboards[us][KNIGHT];

  while (knights > 0n) {
    const result = popLSB(knights);
    knights = result.bitboard;
    const from = result.square;

    const attacks = getKnightAttacks(from) & ~ourPieces;

    // Quiet moves
    let quiets = attacks & ~theirPieces;
    while (quiets > 0n) {
      const quietResult = popLSB(quiets);
      quiets = quietResult.bitboard;
      moves.push(new Move(from, quietResult.square, MOVE_FLAG_QUIET));
    }

    // Captures
    let captures = attacks & theirPieces;
    while (captures > 0n) {
      const captResult = popLSB(captures);
      captures = captResult.bitboard;
      moves.push(new Move(from, captResult.square, MOVE_FLAG_CAPTURE));
    }
  }
}

/**
 * Generate bishop moves
 */
function generateBishopMoves(board, moves, us, ourPieces, theirPieces, allPieces) {
  let bishops = board.bitboards[us][BISHOP];

  while (bishops > 0n) {
    const result = popLSB(bishops);
    bishops = result.bitboard;
    const from = result.square;

    const attacks = getBishopAttacks(from, allPieces) & ~ourPieces;

    // Quiet moves
    let quiets = attacks & ~theirPieces;
    while (quiets > 0n) {
      const quietResult = popLSB(quiets);
      quiets = quietResult.bitboard;
      moves.push(new Move(from, quietResult.square, MOVE_FLAG_QUIET));
    }

    // Captures
    let captures = attacks & theirPieces;
    while (captures > 0n) {
      const captResult = popLSB(captures);
      captures = captResult.bitboard;
      moves.push(new Move(from, captResult.square, MOVE_FLAG_CAPTURE));
    }
  }
}

/**
 * Generate rook moves
 */
function generateRookMoves(board, moves, us, ourPieces, theirPieces, allPieces) {
  let rooks = board.bitboards[us][ROOK];

  while (rooks > 0n) {
    const result = popLSB(rooks);
    rooks = result.bitboard;
    const from = result.square;

    const attacks = getRookAttacks(from, allPieces) & ~ourPieces;

    // Quiet moves
    let quiets = attacks & ~theirPieces;
    while (quiets > 0n) {
      const quietResult = popLSB(quiets);
      quiets = quietResult.bitboard;
      moves.push(new Move(from, quietResult.square, MOVE_FLAG_QUIET));
    }

    // Captures
    let captures = attacks & theirPieces;
    while (captures > 0n) {
      const captResult = popLSB(captures);
      captures = captResult.bitboard;
      moves.push(new Move(from, captResult.square, MOVE_FLAG_CAPTURE));
    }
  }
}

/**
 * Generate queen moves
 */
function generateQueenMoves(board, moves, us, ourPieces, theirPieces, allPieces) {
  let queens = board.bitboards[us][QUEEN];

  while (queens > 0n) {
    const result = popLSB(queens);
    queens = result.bitboard;
    const from = result.square;

    const attacks = getQueenAttacks(from, allPieces) & ~ourPieces;

    // Quiet moves
    let quiets = attacks & ~theirPieces;
    while (quiets > 0n) {
      const quietResult = popLSB(quiets);
      quiets = quietResult.bitboard;
      moves.push(new Move(from, quietResult.square, MOVE_FLAG_QUIET));
    }

    // Captures
    let captures = attacks & theirPieces;
    while (captures > 0n) {
      const captResult = popLSB(captures);
      captures = captResult.bitboard;
      moves.push(new Move(from, captResult.square, MOVE_FLAG_CAPTURE));
    }
  }
}

/**
 * Generate king moves (non-castling)
 */
function generateKingMoves(board, moves, us, ourPieces, theirPieces) {
  const king = board.bitboards[us][KING];
  if (king === 0n) return;

  const from = bitboardToSquares(king)[0];
  const attacks = getKingAttacks(from) & ~ourPieces;

  // Quiet moves
  let quiets = attacks & ~theirPieces;
  while (quiets > 0n) {
    const result = popLSB(quiets);
    quiets = result.bitboard;
    moves.push(new Move(from, result.square, MOVE_FLAG_QUIET));
  }

  // Captures
  let captures = attacks & theirPieces;
  while (captures > 0n) {
    const result = popLSB(captures);
    captures = result.bitboard;
    moves.push(new Move(from, result.square, MOVE_FLAG_CAPTURE));
  }
}

/**
 * Check if a square is attacked by the given side
 * (Helper for castling move generation to avoid circular dependency with game.js)
 */
function isSquareAttackedBy(board, square, attackingSide, allPieces) {
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
 * Generate castling moves
 * According to chess rules, castling is illegal if:
 * 1. The king is currently in check
 * 2. The king passes through a square under attack
 * 3. The king ends on a square under attack
 */
function generateCastlingMoves(board, moves, us, allPieces) {
  const them = 1 - us;

  if (us === WHITE) {
    // White kingside castling
    if (board.castlingRights & 0x1) {
      // Check squares are empty
      if (!getBit(allPieces, 5) && !getBit(allPieces, 6)) {
        // Check king isn't in check and doesn't pass through or end in check
        if (!isSquareAttackedBy(board, 4, them, allPieces) &&
            !isSquareAttackedBy(board, 5, them, allPieces) &&
            !isSquareAttackedBy(board, 6, them, allPieces)) {
          moves.push(new Move(4, 6, MOVE_FLAG_KING_CASTLE));
        }
      }
    }
    // White queenside castling
    if (board.castlingRights & 0x2) {
      // Check squares are empty (b1, c1, d1)
      if (!getBit(allPieces, 1) && !getBit(allPieces, 2) && !getBit(allPieces, 3)) {
        // Check king isn't in check and doesn't pass through or end in check
        // Note: We don't check b1 (square 1) for attacks, only the king's path (e1, d1, c1)
        if (!isSquareAttackedBy(board, 4, them, allPieces) &&
            !isSquareAttackedBy(board, 3, them, allPieces) &&
            !isSquareAttackedBy(board, 2, them, allPieces)) {
          moves.push(new Move(4, 2, MOVE_FLAG_QUEEN_CASTLE));
        }
      }
    }
  } else {
    // Black kingside castling
    if (board.castlingRights & 0x4) {
      // Check squares are empty
      if (!getBit(allPieces, 61) && !getBit(allPieces, 62)) {
        // Check king isn't in check and doesn't pass through or end in check
        if (!isSquareAttackedBy(board, 60, them, allPieces) &&
            !isSquareAttackedBy(board, 61, them, allPieces) &&
            !isSquareAttackedBy(board, 62, them, allPieces)) {
          moves.push(new Move(60, 62, MOVE_FLAG_KING_CASTLE));
        }
      }
    }
    // Black queenside castling
    if (board.castlingRights & 0x8) {
      // Check squares are empty (b8, c8, d8)
      if (!getBit(allPieces, 57) && !getBit(allPieces, 58) && !getBit(allPieces, 59)) {
        // Check king isn't in check and doesn't pass through or end in check
        // Note: We don't check b8 (square 57) for attacks, only the king's path (e8, d8, c8)
        if (!isSquareAttackedBy(board, 60, them, allPieces) &&
            !isSquareAttackedBy(board, 59, them, allPieces) &&
            !isSquareAttackedBy(board, 58, them, allPieces)) {
          moves.push(new Move(60, 58, MOVE_FLAG_QUEEN_CASTLE));
        }
      }
    }
  }
}

export default {
  Move,
  generateMoves,
  MOVE_FLAG_QUIET,
  MOVE_FLAG_DOUBLE_PAWN,
  MOVE_FLAG_KING_CASTLE,
  MOVE_FLAG_QUEEN_CASTLE,
  MOVE_FLAG_CAPTURE,
  MOVE_FLAG_EP_CAPTURE,
  MOVE_FLAG_KNIGHT_PROMO,
  MOVE_FLAG_BISHOP_PROMO,
  MOVE_FLAG_ROOK_PROMO,
  MOVE_FLAG_QUEEN_PROMO,
  MOVE_FLAG_KNIGHT_PROMO_CAPTURE,
  MOVE_FLAG_BISHOP_PROMO_CAPTURE,
  MOVE_FLAG_ROOK_PROMO_CAPTURE,
  MOVE_FLAG_QUEEN_PROMO_CAPTURE
};
