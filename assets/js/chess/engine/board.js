/**
 * Board Module - FEN parsing, board state, and mailbox representation
 * Part of Carson's Chess Engine
 * @module chess/engine/board
 */

import {
  WHITE, BLACK,
  PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
  PIECE_SYMBOLS,
  setBit, clearBit, getBit,
  fileRankToSquare, getFile, getRank,
  algebraicToSquare, squareToAlgebraic,
  emptyBitboard
} from './bitboard.js';

import { computeHash } from './zobrist.js';

/**
 * Board State Class
 * Manages bitboards, mailbox, and game state
 */
export class Board {
  constructor() {
    // Bitboards: [color][pieceType]
    this.bitboards = [
      [0n, 0n, 0n, 0n, 0n, 0n], // White pieces
      [0n, 0n, 0n, 0n, 0n, 0n]  // Black pieces
    ];

    // Occupancy bitboards
    this.occupancy = [0n, 0n, 0n]; // [White, Black, All]

    // Mailbox representation (64-element array)
    // Each element: { piece: PAWN/KNIGHT/etc, color: WHITE/BLACK } or null
    this.mailbox = new Array(64).fill(null);

    // Game state
    this.sideToMove = WHITE;
    this.castlingRights = 0; // Bit flags: 0x1=WK, 0x2=WQ, 0x4=BK, 0x8=BQ
    this.enPassantSquare = -1;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;

    // Zobrist hash (will be computed later)
    this.hash = 0n;
  }

  /**
   * Reset board to empty state
   */
  clear() {
    for (let color = 0; color < 2; color++) {
      for (let piece = 0; piece < 6; piece++) {
        this.bitboards[color][piece] = 0n;
      }
    }
    this.occupancy = [0n, 0n, 0n];
    this.mailbox.fill(null);
    this.sideToMove = WHITE;
    this.castlingRights = 0;
    this.enPassantSquare = -1;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.hash = 0n;
  }

  /**
   * Place a piece on the board
   * @param {number} square - Square index (0-63)
   * @param {number} piece - Piece type (PAWN, KNIGHT, etc.)
   * @param {number} color - Piece color (WHITE or BLACK)
   */
  placePiece(square, piece, color) {
    // Update bitboards
    this.bitboards[color][piece] = setBit(this.bitboards[color][piece], square);

    // Update occupancy
    this.occupancy[color] = setBit(this.occupancy[color], square);
    this.occupancy[2] = setBit(this.occupancy[2], square);

    // Update mailbox
    this.mailbox[square] = { piece, color };
  }

  /**
   * Remove a piece from the board
   * @param {number} square - Square index (0-63)
   */
  removePiece(square) {
    const mailboxEntry = this.mailbox[square];
    if (!mailboxEntry) return;

    const { piece, color } = mailboxEntry;

    // Update bitboards
    this.bitboards[color][piece] = clearBit(this.bitboards[color][piece], square);

    // Update occupancy
    this.occupancy[color] = clearBit(this.occupancy[color], square);
    this.occupancy[2] = clearBit(this.occupancy[2], square);

    // Update mailbox
    this.mailbox[square] = null;
  }

  /**
   * Get piece at square
   * @param {number} square - Square index (0-63)
   * @returns {Object|null} {piece, color} or null if empty
   */
  getPieceAt(square) {
    return this.mailbox[square];
  }

  /**
   * Update occupancy bitboards from piece bitboards
   */
  updateOccupancy() {
    this.occupancy[WHITE] = 0n;
    this.occupancy[BLACK] = 0n;

    for (let piece = 0; piece < 6; piece++) {
      this.occupancy[WHITE] |= this.bitboards[WHITE][piece];
      this.occupancy[BLACK] |= this.bitboards[BLACK][piece];
    }

    this.occupancy[2] = this.occupancy[WHITE] | this.occupancy[BLACK];
  }

  /**
   * Parse FEN string into this board instance
   * @param {string} fen - FEN string
   */
  parseFEN(fen) {
    // Parse using standalone function
    const parsedBoard = parseFENInternal(fen);

    // Copy all properties to this instance
    this.bitboards = parsedBoard.bitboards;
    this.occupancy = parsedBoard.occupancy;
    this.mailbox = parsedBoard.mailbox;
    this.sideToMove = parsedBoard.sideToMove;
    this.castlingRights = parsedBoard.castlingRights;
    this.enPassantSquare = parsedBoard.enPassantSquare;
    this.halfmoveClock = parsedBoard.halfmoveClock;
    this.fullmoveNumber = parsedBoard.fullmoveNumber;
    this.hash = parsedBoard.hash;
    this.zobristHash = parsedBoard.zobristHash;
  }
}

/**
 * Internal FEN parser (used by both standalone and method)
 * @param {string} fen - FEN string
 * @returns {Board} Board instance
 */
function parseFENInternal(fen) {
  const board = new Board();
  board.clear();

  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) {
    throw new Error('Invalid FEN: Not enough parts');
  }

  const [piecePlacement, activeColor, castling, enPassant, halfmove, fullmove] = parts;

  // Parse piece placement
  const ranks = piecePlacement.split('/');
  if (ranks.length !== 8) {
    throw new Error('Invalid FEN: Must have 8 ranks');
  }

  for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
    const rank = 7 - rankIdx; // FEN starts from rank 8
    const rankStr = ranks[rankIdx];
    let file = 0;

    for (const char of rankStr) {
      if (file >= 8) {
        throw new Error(`Invalid FEN: Too many squares in rank ${rank + 1}`);
      }

      // Check if it's a digit (empty squares)
      if (char >= '1' && char <= '8') {
        file += parseInt(char);
        continue;
      }

      // It's a piece
      const pieceIndex = PIECE_SYMBOLS.indexOf(char);
      if (pieceIndex === -1) {
        throw new Error(`Invalid FEN: Unknown piece '${char}'`);
      }

      const color = pieceIndex < 6 ? WHITE : BLACK;
      const piece = pieceIndex % 6;
      const square = fileRankToSquare(file, rank);

      board.placePiece(square, piece, color);
      file++;
    }

    if (file !== 8) {
      throw new Error(`Invalid FEN: Not enough squares in rank ${rank + 1}`);
    }
  }

  // Parse active color
  if (activeColor === 'w') {
    board.sideToMove = WHITE;
  } else if (activeColor === 'b') {
    board.sideToMove = BLACK;
  } else {
    throw new Error(`Invalid FEN: Unknown active color '${activeColor}'`);
  }

  // Parse castling rights
  board.castlingRights = 0;
  if (castling !== '-') {
    if (castling.includes('K')) board.castlingRights |= 0x1;
    if (castling.includes('Q')) board.castlingRights |= 0x2;
    if (castling.includes('k')) board.castlingRights |= 0x4;
    if (castling.includes('q')) board.castlingRights |= 0x8;
  }

  // Parse en passant square
  if (enPassant === '-') {
    board.enPassantSquare = -1;
  } else {
    board.enPassantSquare = algebraicToSquare(enPassant);
    if (board.enPassantSquare === -1) {
      throw new Error(`Invalid FEN: Invalid en passant square '${enPassant}'`);
    }
  }

  // Parse halfmove clock
  if (halfmove) {
    board.halfmoveClock = parseInt(halfmove);
    if (isNaN(board.halfmoveClock) || board.halfmoveClock < 0) {
      throw new Error(`Invalid FEN: Invalid halfmove clock '${halfmove}'`);
    }
  }

  // Parse fullmove number
  if (fullmove) {
    board.fullmoveNumber = parseInt(fullmove);
    if (isNaN(board.fullmoveNumber) || board.fullmoveNumber < 1) {
      throw new Error(`Invalid FEN: Invalid fullmove number '${fullmove}'`);
    }
  }

  // Update occupancy bitboards
  board.updateOccupancy();

  // Compute zobrist hash
  board.hash = computeHash(board);
  board.zobristHash = board.hash;

  return board;
}

/**
 * Parse FEN string and return a new board (public API)
 * @param {string} fen - FEN string
 * @returns {Board} Board instance
 */
export function parseFEN(fen) {
  return parseFENInternal(fen);
}

/**
 * Generate FEN string from board
 * @param {Board} board - Board instance
 * @returns {string} FEN string
 */
export function generateFEN(board) {
  const parts = [];

  // Generate piece placement
  const ranks = [];
  for (let rank = 7; rank >= 0; rank--) {
    let rankStr = '';
    let emptyCount = 0;

    for (let file = 0; file < 8; file++) {
      const square = fileRankToSquare(file, rank);
      const piece = board.getPieceAt(square);

      if (piece === null) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rankStr += emptyCount.toString();
          emptyCount = 0;
        }
        const symbolIndex = piece.color * 6 + piece.piece;
        rankStr += PIECE_SYMBOLS[symbolIndex];
      }
    }

    if (emptyCount > 0) {
      rankStr += emptyCount.toString();
    }

    ranks.push(rankStr);
  }
  parts.push(ranks.join('/'));

  // Active color
  parts.push(board.sideToMove === WHITE ? 'w' : 'b');

  // Castling rights
  let castling = '';
  if (board.castlingRights & 0x1) castling += 'K';
  if (board.castlingRights & 0x2) castling += 'Q';
  if (board.castlingRights & 0x4) castling += 'k';
  if (board.castlingRights & 0x8) castling += 'q';
  parts.push(castling || '-');

  // En passant square
  parts.push(board.enPassantSquare === -1 ? '-' : squareToAlgebraic(board.enPassantSquare));

  // Halfmove clock and fullmove number
  parts.push(board.halfmoveClock.toString());
  parts.push(board.fullmoveNumber.toString());

  return parts.join(' ');
}

/**
 * Standard starting position FEN
 */
export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/**
 * Create board with starting position
 * @returns {Board} Board instance
 */
export function createStartingBoard() {
  return parseFEN(STARTING_FEN);
}

export default {
  Board,
  parseFEN,
  generateFEN,
  STARTING_FEN,
  createStartingBoard
};
