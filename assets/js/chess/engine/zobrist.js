/**
 * Zobrist Hashing Module
 * Generates and manages Zobrist hash keys for position hashing
 * Part of Carson's Chess Engine
 * @module chess/engine/zobrist
 */

import { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING } from './bitboard.js';

/**
 * Zobrist keys structure
 * - pieces: [square][color * 6 + pieceType] (64 × 12 = 768 keys)
 * - castling: [rights] (4 keys for KQkq)
 * - enPassant: [file] (8 keys for files a-h)
 * - sideToMove: 1 key
 * Total: 781 keys
 */
class ZobristKeys {
  constructor() {
    // 64 squares × 12 piece types (6 white + 6 black)
    this.pieces = new Array(64);
    for (let sq = 0; sq < 64; sq++) {
      this.pieces[sq] = new Array(12);
    }

    // 4 castling rights (WK, WQ, BK, BQ)
    this.castling = new Array(4);

    // 8 en passant files
    this.enPassant = new Array(8);

    // Side to move (black)
    this.sideToMove = 0n;

    this.initialize();
  }

  /**
   * Initialize all Zobrist keys with pseudo-random 64-bit numbers
   * Uses a simple pseudo-random number generator for consistency
   */
  initialize() {
    let seed = 1070372n; // Arbitrary seed for reproducibility

    const random64 = () => {
      // XORShift64 algorithm for 64-bit random numbers
      seed ^= seed << 13n;
      seed ^= seed >> 7n;
      seed ^= seed << 17n;
      return seed;
    };

    // Initialize piece keys
    for (let square = 0; square < 64; square++) {
      for (let piece = 0; piece < 12; piece++) {
        this.pieces[square][piece] = random64();
      }
    }

    // Initialize castling keys
    for (let i = 0; i < 4; i++) {
      this.castling[i] = random64();
    }

    // Initialize en passant keys
    for (let file = 0; file < 8; file++) {
      this.enPassant[file] = random64();
    }

    // Initialize side to move key
    this.sideToMove = random64();
  }

  /**
   * Get Zobrist key for a piece on a square
   * @param {number} square - Square index (0-63)
   * @param {number} piece - Piece type (PAWN, KNIGHT, etc.)
   * @param {number} color - Piece color (WHITE or BLACK)
   * @returns {BigInt} Zobrist key
   */
  getPieceKey(square, piece, color) {
    const pieceIndex = color * 6 + piece;
    return this.pieces[square][pieceIndex];
  }

  /**
   * Get Zobrist key for castling rights
   * @param {number} rights - Castling rights bit flags
   * @returns {BigInt} Zobrist key
   */
  getCastlingKey(rights) {
    let key = 0n;
    if (rights & 0x1) key ^= this.castling[0]; // White kingside
    if (rights & 0x2) key ^= this.castling[1]; // White queenside
    if (rights & 0x4) key ^= this.castling[2]; // Black kingside
    if (rights & 0x8) key ^= this.castling[3]; // Black queenside
    return key;
  }

  /**
   * Get Zobrist key for en passant file
   * @param {number} square - En passant square (-1 if none)
   * @returns {BigInt} Zobrist key
   */
  getEnPassantKey(square) {
    if (square === -1) return 0n;
    const file = square & 7;
    return this.enPassant[file];
  }

  /**
   * Get Zobrist key for side to move
   * @param {number} side - Side to move (WHITE or BLACK)
   * @returns {BigInt} Zobrist key
   */
  getSideKey(side) {
    return side === BLACK ? this.sideToMove : 0n;
  }
}

// Global Zobrist keys instance
export const zobristKeys = new ZobristKeys();

/**
 * Compute Zobrist hash for a board position
 * @param {Board} board - Board instance
 * @returns {BigInt} Zobrist hash
 */
export function computeHash(board) {
  let hash = 0n;

  // Hash all pieces
  for (let square = 0; square < 64; square++) {
    const piece = board.getPieceAt(square);
    if (piece) {
      hash ^= zobristKeys.getPieceKey(square, piece.piece, piece.color);
    }
  }

  // Hash castling rights
  hash ^= zobristKeys.getCastlingKey(board.castlingRights);

  // Hash en passant square
  hash ^= zobristKeys.getEnPassantKey(board.enPassantSquare);

  // Hash side to move
  hash ^= zobristKeys.getSideKey(board.sideToMove);

  return hash;
}

/**
 * Update hash incrementally when moving a piece
 * @param {BigInt} hash - Current hash
 * @param {number} fromSquare - Source square
 * @param {number} toSquare - Destination square
 * @param {number} piece - Piece type
 * @param {number} color - Piece color
 * @returns {BigInt} Updated hash
 */
export function updateHashMove(hash, fromSquare, toSquare, piece, color) {
  // Remove piece from source square
  hash ^= zobristKeys.getPieceKey(fromSquare, piece, color);
  // Add piece to destination square
  hash ^= zobristKeys.getPieceKey(toSquare, piece, color);
  return hash;
}

/**
 * Update hash when capturing a piece
 * @param {BigInt} hash - Current hash
 * @param {number} square - Capture square
 * @param {number} piece - Captured piece type
 * @param {number} color - Captured piece color
 * @returns {BigInt} Updated hash
 */
export function updateHashCapture(hash, square, piece, color) {
  // Remove captured piece
  hash ^= zobristKeys.getPieceKey(square, piece, color);
  return hash;
}

/**
 * Update hash when castling rights change
 * @param {BigInt} hash - Current hash
 * @param {number} oldRights - Old castling rights
 * @param {number} newRights - New castling rights
 * @returns {BigInt} Updated hash
 */
export function updateHashCastling(hash, oldRights, newRights) {
  // Remove old castling rights
  hash ^= zobristKeys.getCastlingKey(oldRights);
  // Add new castling rights
  hash ^= zobristKeys.getCastlingKey(newRights);
  return hash;
}

/**
 * Update hash when en passant square changes
 * @param {BigInt} hash - Current hash
 * @param {number} oldSquare - Old en passant square
 * @param {number} newSquare - New en passant square
 * @returns {BigInt} Updated hash
 */
export function updateHashEnPassant(hash, oldSquare, newSquare) {
  // Remove old en passant
  if (oldSquare !== -1) {
    hash ^= zobristKeys.getEnPassantKey(oldSquare);
  }
  // Add new en passant
  if (newSquare !== -1) {
    hash ^= zobristKeys.getEnPassantKey(newSquare);
  }
  return hash;
}

/**
 * Toggle side to move in hash
 * @param {BigInt} hash - Current hash
 * @returns {BigInt} Updated hash
 */
export function toggleSideToMove(hash) {
  return hash ^ zobristKeys.sideToMove;
}

export default {
  zobristKeys,
  computeHash,
  updateHashMove,
  updateHashCapture,
  updateHashCastling,
  updateHashEnPassant,
  toggleSideToMove
};
