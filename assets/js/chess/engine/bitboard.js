/**
 * Bitboard Module - Core bitboard operations and utilities
 * Uses BigUint64 for 64-bit board representation
 * Part of Carson's Chess Engine
 * @module chess/engine/bitboard
 */

// Constants
export const WHITE = 0;
export const BLACK = 1;

export const PAWN = 0;
export const KNIGHT = 1;
export const BISHOP = 2;
export const ROOK = 3;
export const QUEEN = 4;
export const KING = 5;

export const PIECE_SYMBOLS = ['P', 'N', 'B', 'R', 'Q', 'K', 'p', 'n', 'b', 'r', 'q', 'k'];

// Files and Ranks
export const FILE_A = 0n;
export const FILE_B = 1n;
export const FILE_C = 2n;
export const FILE_D = 3n;
export const FILE_E = 4n;
export const FILE_F = 5n;
export const FILE_G = 6n;
export const FILE_H = 7n;

export const RANK_1 = 0n;
export const RANK_2 = 1n;
export const RANK_3 = 2n;
export const RANK_4 = 3n;
export const RANK_5 = 4n;
export const RANK_6 = 5n;
export const RANK_7 = 6n;
export const RANK_8 = 7n;

// File masks (all squares in a file)
export const FILE_MASKS = [
  0x0101010101010101n, // A file
  0x0202020202020202n, // B file
  0x0404040404040404n, // C file
  0x0808080808080808n, // D file
  0x1010101010101010n, // E file
  0x2020202020202020n, // F file
  0x4040404040404040n, // G file
  0x8080808080808080n  // H file
];

// Rank masks (all squares in a rank)
export const RANK_MASKS = [
  0x00000000000000FFn, // Rank 1
  0x000000000000FF00n, // Rank 2
  0x0000000000FF0000n, // Rank 3
  0x00000000FF000000n, // Rank 4
  0x000000FF00000000n, // Rank 5
  0x0000FF0000000000n, // Rank 6
  0x00FF000000000000n, // Rank 7
  0xFF00000000000000n  // Rank 8
];

/**
 * Set a bit at the given square
 * @param {BigInt} bitboard - The bitboard to modify
 * @param {number} square - Square index (0-63)
 * @returns {BigInt} Modified bitboard
 */
export function setBit(bitboard, square) {
  return bitboard | (1n << BigInt(square));
}

/**
 * Clear a bit at the given square
 * @param {BigInt} bitboard - The bitboard to modify
 * @param {number} square - Square index (0-63)
 * @returns {BigInt} Modified bitboard
 */
export function clearBit(bitboard, square) {
  return bitboard & ~(1n << BigInt(square));
}

/**
 * Get the value of a bit at the given square
 * @param {BigInt} bitboard - The bitboard to check
 * @param {number} square - Square index (0-63)
 * @returns {boolean} True if bit is set
 */
export function getBit(bitboard, square) {
  return (bitboard & (1n << BigInt(square))) !== 0n;
}

/**
 * Toggle a bit at the given square
 * @param {BigInt} bitboard - The bitboard to modify
 * @param {number} square - Square index (0-63)
 * @returns {BigInt} Modified bitboard
 */
export function toggleBit(bitboard, square) {
  return bitboard ^ (1n << BigInt(square));
}

/**
 * Count the number of set bits in a bitboard (population count)
 * @param {BigInt} bitboard - The bitboard to count
 * @returns {number} Number of set bits
 */
export function popCount(bitboard) {
  let count = 0;
  let bb = bitboard;
  while (bb > 0n) {
    bb &= bb - 1n; // Clear the least significant bit
    count++;
  }
  return count;
}

/**
 * Get the index of the least significant bit (LSB)
 * @param {BigInt} bitboard - The bitboard to check
 * @returns {number} Square index of LSB, or -1 if bitboard is empty
 */
export function getLSB(bitboard) {
  if (bitboard === 0n) return -1;

  // Count trailing zeros
  let square = 0;
  let bb = bitboard;

  if ((bb & 0xFFFFFFFFn) === 0n) {
    square += 32;
    bb >>= 32n;
  }
  if ((bb & 0xFFFFn) === 0n) {
    square += 16;
    bb >>= 16n;
  }
  if ((bb & 0xFFn) === 0n) {
    square += 8;
    bb >>= 8n;
  }
  if ((bb & 0xFn) === 0n) {
    square += 4;
    bb >>= 4n;
  }
  if ((bb & 0x3n) === 0n) {
    square += 2;
    bb >>= 2n;
  }
  if ((bb & 0x1n) === 0n) {
    square += 1;
  }

  return square;
}

/**
 * Pop the least significant bit and return its square index
 * @param {BigInt} bitboard - The bitboard to modify (pass by value)
 * @returns {Object} {square: number, bitboard: BigInt}
 */
export function popLSB(bitboard) {
  const square = getLSB(bitboard);
  const newBitboard = bitboard & (bitboard - 1n);
  return { square, bitboard: newBitboard };
}

/**
 * Get the index of the most significant bit (MSB)
 * @param {BigInt} bitboard - The bitboard to check
 * @returns {number} Square index of MSB, or -1 if bitboard is empty
 */
export function getMSB(bitboard) {
  if (bitboard === 0n) return -1;

  let square = 0;
  let bb = bitboard;

  if (bb > 0xFFFFFFFFn) {
    square += 32;
    bb >>= 32n;
  }
  if (bb > 0xFFFFn) {
    square += 16;
    bb >>= 16n;
  }
  if (bb > 0xFFn) {
    square += 8;
    bb >>= 8n;
  }
  if (bb > 0xFn) {
    square += 4;
    bb >>= 4n;
  }
  if (bb > 0x3n) {
    square += 2;
    bb >>= 2n;
  }
  if (bb > 0x1n) {
    square += 1;
  }

  return square;
}

/**
 * Get file index from square (0-7 for files A-H)
 * @param {number} square - Square index (0-63)
 * @returns {number} File index (0-7)
 */
export function getFile(square) {
  return square & 7;
}

/**
 * Get rank index from square (0-7 for ranks 1-8)
 * @param {number} square - Square index (0-63)
 * @returns {number} Rank index (0-7)
 */
export function getRank(square) {
  return square >> 3;
}

/**
 * Convert file and rank to square index
 * @param {number} file - File index (0-7)
 * @param {number} rank - Rank index (0-7)
 * @returns {number} Square index (0-63)
 */
export function fileRankToSquare(file, rank) {
  return rank * 8 + file;
}

/**
 * Convert algebraic notation to square index
 * @param {string} algebraic - Algebraic notation (e.g., "e4")
 * @returns {number} Square index (0-63), or -1 if invalid
 */
export function algebraicToSquare(algebraic) {
  if (typeof algebraic !== 'string' || algebraic.length !== 2) {
    return -1;
  }

  const file = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(algebraic[1]) - 1;

  if (file < 0 || file > 7 || rank < 0 || rank > 7) {
    return -1;
  }

  return fileRankToSquare(file, rank);
}

/**
 * Convert square index to algebraic notation
 * @param {number} square - Square index (0-63)
 * @returns {string} Algebraic notation (e.g., "e4")
 */
export function squareToAlgebraic(square) {
  if (square < 0 || square > 63) {
    return '??';
  }

  const file = getFile(square);
  const rank = getRank(square);
  return String.fromCharCode('a'.charCodeAt(0) + file) + (rank + 1);
}

/**
 * Shift bitboard in a direction
 * @param {BigInt} bitboard - The bitboard to shift
 * @param {number} direction - Shift direction (8=north, -8=south, 1=east, -1=west, etc.)
 * @returns {BigInt} Shifted bitboard
 */
export function shiftBitboard(bitboard, direction) {
  if (direction > 0) {
    return bitboard << BigInt(direction);
  } else if (direction < 0) {
    return bitboard >> BigInt(-direction);
  }
  return bitboard;
}

/**
 * Print bitboard to console (for debugging)
 * @param {BigInt} bitboard - The bitboard to print
 * @param {string} label - Optional label for the output
 */
export function printBitboard(bitboard, label = '') {
  if (label) {
    console.log(`\n=== ${label} ===`);
  }

  let output = '\n  a b c d e f g h\n';

  for (let rank = 7; rank >= 0; rank--) {
    output += `${rank + 1} `;
    for (let file = 0; file < 8; file++) {
      const square = fileRankToSquare(file, rank);
      output += getBit(bitboard, square) ? '1 ' : '. ';
    }
    output += `${rank + 1}\n`;
  }

  output += '  a b c d e f g h\n';
  console.log(output);
}

/**
 * Create an empty bitboard
 * @returns {BigInt} Empty bitboard (0)
 */
export function emptyBitboard() {
  return 0n;
}

/**
 * Create a full bitboard (all bits set)
 * @returns {BigInt} Full bitboard
 */
export function fullBitboard() {
  return 0xFFFFFFFFFFFFFFFFn;
}

/**
 * Create bitboard from array of squares
 * @param {number[]} squares - Array of square indices
 * @returns {BigInt} Bitboard with specified squares set
 */
export function squaresToBitboard(squares) {
  let bitboard = 0n;
  for (const square of squares) {
    bitboard = setBit(bitboard, square);
  }
  return bitboard;
}

/**
 * Convert bitboard to array of square indices
 * @param {BigInt} bitboard - The bitboard to convert
 * @returns {number[]} Array of square indices
 */
export function bitboardToSquares(bitboard) {
  const squares = [];
  let bb = bitboard;

  while (bb > 0n) {
    const result = popLSB(bb);
    squares.push(result.square);
    bb = result.bitboard;
  }

  return squares;
}

export default {
  WHITE,
  BLACK,
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING,
  PIECE_SYMBOLS,
  FILE_MASKS,
  RANK_MASKS,
  setBit,
  clearBit,
  getBit,
  toggleBit,
  popCount,
  getLSB,
  popLSB,
  getMSB,
  getFile,
  getRank,
  fileRankToSquare,
  algebraicToSquare,
  squareToAlgebraic,
  shiftBitboard,
  printBitboard,
  emptyBitboard,
  fullBitboard,
  squaresToBitboard,
  bitboardToSquares
};
