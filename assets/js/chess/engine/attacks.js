/**
 * Attack Tables Module
 * Pre-computed attack tables and magic bitboards for move generation
 * Part of Carson's Chess Engine
 * @module chess/engine/attacks
 */

import {
  WHITE, BLACK,
  FILE_MASKS,
  setBit, getBit,
  getFile, getRank,
  emptyBitboard
} from './bitboard.js';

// Pre-computed attack tables
let knightAttacks = null;
let kingAttacks = null;
let whitePawnAttacks = null;
let blackPawnAttacks = null;

// Magic bitboard tables
let rookMagics = null;
let bishopMagics = null;
let rookAttackTable = null;
let bishopAttackTable = null;

/**
 * Initialize all attack tables
 * Must be called before using attack generation functions
 */
export function initializeAttacks() {
  knightAttacks = generateKnightAttacks();
  kingAttacks = generateKingAttacks();
  whitePawnAttacks = generatePawnAttacks(WHITE);
  blackPawnAttacks = generatePawnAttacks(BLACK);

  // Initialize magic bitboards
  initializeMagicBitboards();
}

/**
 * Generate knight attack table for all squares
 * @returns {BigInt[]} Array of 64 bitboards
 */
function generateKnightAttacks() {
  const attacks = new Array(64);
  const knightMoves = [
    { fileOffset: 1, rankOffset: 2 },
    { fileOffset: 2, rankOffset: 1 },
    { fileOffset: 2, rankOffset: -1 },
    { fileOffset: 1, rankOffset: -2 },
    { fileOffset: -1, rankOffset: -2 },
    { fileOffset: -2, rankOffset: -1 },
    { fileOffset: -2, rankOffset: 1 },
    { fileOffset: -1, rankOffset: 2 }
  ];

  for (let square = 0; square < 64; square++) {
    let attackBB = 0n;
    const file = getFile(square);
    const rank = getRank(square);

    for (const move of knightMoves) {
      const newFile = file + move.fileOffset;
      const newRank = rank + move.rankOffset;

      if (newFile >= 0 && newFile <= 7 && newRank >= 0 && newRank <= 7) {
        const targetSquare = newRank * 8 + newFile;
        attackBB = setBit(attackBB, targetSquare);
      }
    }

    attacks[square] = attackBB;
  }

  return attacks;
}

/**
 * Generate king attack table for all squares
 * @returns {BigInt[]} Array of 64 bitboards
 */
function generateKingAttacks() {
  const attacks = new Array(64);
  const kingMoves = [
    { fileOffset: 0, rankOffset: 1 },
    { fileOffset: 1, rankOffset: 1 },
    { fileOffset: 1, rankOffset: 0 },
    { fileOffset: 1, rankOffset: -1 },
    { fileOffset: 0, rankOffset: -1 },
    { fileOffset: -1, rankOffset: -1 },
    { fileOffset: -1, rankOffset: 0 },
    { fileOffset: -1, rankOffset: 1 }
  ];

  for (let square = 0; square < 64; square++) {
    let attackBB = 0n;
    const file = getFile(square);
    const rank = getRank(square);

    for (const move of kingMoves) {
      const newFile = file + move.fileOffset;
      const newRank = rank + move.rankOffset;

      if (newFile >= 0 && newFile <= 7 && newRank >= 0 && newRank <= 7) {
        const targetSquare = newRank * 8 + newFile;
        attackBB = setBit(attackBB, targetSquare);
      }
    }

    attacks[square] = attackBB;
  }

  return attacks;
}

/**
 * Generate pawn attack table for all squares
 * @param {number} color - Pawn color (WHITE or BLACK)
 * @returns {BigInt[]} Array of 64 bitboards
 */
function generatePawnAttacks(color) {
  const attacks = new Array(64);
  const direction = color === WHITE ? 1 : -1;

  for (let square = 0; square < 64; square++) {
    let attackBB = 0n;
    const file = getFile(square);
    const rank = getRank(square);
    const newRank = rank + direction;

    if (newRank >= 0 && newRank <= 7) {
      // Left capture
      if (file > 0) {
        const targetSquare = newRank * 8 + (file - 1);
        attackBB = setBit(attackBB, targetSquare);
      }
      // Right capture
      if (file < 7) {
        const targetSquare = newRank * 8 + (file + 1);
        attackBB = setBit(attackBB, targetSquare);
      }
    }

    attacks[square] = attackBB;
  }

  return attacks;
}

/**
 * Get knight attacks for a square
 * @param {number} square - Square index (0-63)
 * @returns {BigInt} Attack bitboard
 */
export function getKnightAttacks(square) {
  return knightAttacks[square];
}

/**
 * Get king attacks for a square
 * @param {number} square - Square index (0-63)
 * @returns {BigInt} Attack bitboard
 */
export function getKingAttacks(square) {
  return kingAttacks[square];
}

/**
 * Get pawn attacks for a square
 * @param {number} square - Square index (0-63)
 * @param {number} color - Pawn color (WHITE or BLACK)
 * @returns {BigInt} Attack bitboard
 */
export function getPawnAttacks(square, color) {
  return color === WHITE ? whitePawnAttacks[square] : blackPawnAttacks[square];
}

/**
 * Generate rook attack mask (excluding edges for magic bitboards)
 * @param {number} square - Square index (0-63)
 * @returns {BigInt} Mask bitboard
 */
function generateRookMask(square) {
  let mask = 0n;
  const file = getFile(square);
  const rank = getRank(square);

  // North - exclude rank 8 (edge)
  for (let r = rank + 1; r < 7; r++) {
    mask = setBit(mask, r * 8 + file);
  }
  // South - exclude rank 1 (edge)
  for (let r = rank - 1; r > 0; r--) {
    mask = setBit(mask, r * 8 + file);
  }
  // East - exclude file H (edge)
  for (let f = file + 1; f < 7; f++) {
    mask = setBit(mask, rank * 8 + f);
  }
  // West - exclude file A (edge)
  for (let f = file - 1; f > 0; f--) {
    mask = setBit(mask, rank * 8 + f);
  }

  return mask;
}

/**
 * Generate bishop attack mask (excluding edges for magic bitboards)
 * @param {number} square - Square index (0-63)
 * @returns {BigInt} Mask bitboard
 */
function generateBishopMask(square) {
  let mask = 0n;
  const file = getFile(square);
  const rank = getRank(square);

  // Northeast - exclude edges
  for (let f = file + 1, r = rank + 1; f < 7 && r < 7; f++, r++) {
    mask = setBit(mask, r * 8 + f);
  }
  // Northwest - exclude edges
  for (let f = file - 1, r = rank + 1; f > 0 && r < 7; f--, r++) {
    mask = setBit(mask, r * 8 + f);
  }
  // Southeast - exclude edges
  for (let f = file + 1, r = rank - 1; f < 7 && r > 0; f++, r--) {
    mask = setBit(mask, r * 8 + f);
  }
  // Southwest - exclude edges
  for (let f = file - 1, r = rank - 1; f > 0 && r > 0; f--, r--) {
    mask = setBit(mask, r * 8 + f);
  }

  return mask;
}

/**
 * Generate rook attacks on the fly with blockers
 * @param {number} square - Square index (0-63)
 * @param {BigInt} blockers - Blocker bitboard
 * @returns {BigInt} Attack bitboard
 */
function generateRookAttacksOnFly(square, blockers) {
  let attacks = 0n;
  const file = getFile(square);
  const rank = getRank(square);

  // North
  for (let r = rank + 1; r <= 7; r++) {
    const sq = r * 8 + file;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }
  // South
  for (let r = rank - 1; r >= 0; r--) {
    const sq = r * 8 + file;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }
  // East
  for (let f = file + 1; f <= 7; f++) {
    const sq = rank * 8 + f;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }
  // West
  for (let f = file - 1; f >= 0; f--) {
    const sq = rank * 8 + f;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }

  return attacks;
}

/**
 * Generate bishop attacks on the fly with blockers
 * @param {number} square - Square index (0-63)
 * @param {BigInt} blockers - Blocker bitboard
 * @returns {BigInt} Attack bitboard
 */
function generateBishopAttacksOnFly(square, blockers) {
  let attacks = 0n;
  const file = getFile(square);
  const rank = getRank(square);

  // Northeast
  for (let f = file + 1, r = rank + 1; f <= 7 && r <= 7; f++, r++) {
    const sq = r * 8 + f;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }
  // Northwest
  for (let f = file - 1, r = rank + 1; f >= 0 && r <= 7; f--, r++) {
    const sq = r * 8 + f;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }
  // Southeast
  for (let f = file + 1, r = rank - 1; f <= 7 && r >= 0; f++, r--) {
    const sq = r * 8 + f;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }
  // Southwest
  for (let f = file - 1, r = rank - 1; f >= 0 && r >= 0; f--, r--) {
    const sq = r * 8 + f;
    attacks = setBit(attacks, sq);
    if (getBit(blockers, sq)) break;
  }

  return attacks;
}

/**
 * Initialize magic bitboards (simplified version)
 * For production, use pre-computed magic numbers
 */
function initializeMagicBitboards() {
  rookAttackTable = new Array(64);
  bishopAttackTable = new Array(64);

  // For each square, store all possible attack patterns
  for (let square = 0; square < 64; square++) {
    rookAttackTable[square] = new Map();
    bishopAttackTable[square] = new Map();

    // Generate all blocker configurations
    const rookMask = generateRookMask(square);
    const bishopMask = generateBishopMask(square);

    // For simplicity, we'll use a direct lookup approach
    // In production, use proper magic bitboards with magic numbers
    generateAttackTableForSquare(square, rookMask, true);
    generateAttackTableForSquare(square, bishopMask, false);
  }
}

/**
 * Generate attack table for a square (helper for magic bitboards)
 * @param {number} square - Square index
 * @param {BigInt} mask - Attack mask
 * @param {boolean} isRook - True for rook, false for bishop
 */
function generateAttackTableForSquare(square, mask, isRook) {
  const table = isRook ? rookAttackTable[square] : bishopAttackTable[square];

  // Generate all possible blocker configurations (2^bits combinations)
  const bits = countBits(mask);
  const numConfigs = 1 << bits;

  for (let i = 0; i < numConfigs; i++) {
    const blockers = indexToBlockers(i, mask);
    const attacks = isRook
      ? generateRookAttacksOnFly(square, blockers)
      : generateBishopAttacksOnFly(square, blockers);

    table.set(blockers.toString(), attacks);
  }
}

/**
 * Count bits in a bitboard
 */
function countBits(bb) {
  let count = 0;
  while (bb > 0n) {
    bb &= bb - 1n;
    count++;
  }
  return count;
}

/**
 * Convert index to blocker configuration
 */
function indexToBlockers(index, mask) {
  let blockers = 0n;
  let tempMask = mask;
  let bitIndex = 0;

  while (tempMask > 0n) {
    const lsb = tempMask & -tempMask;
    tempMask ^= lsb;

    if (index & (1 << bitIndex)) {
      blockers |= lsb;
    }
    bitIndex++;
  }

  return blockers;
}

/**
 * Get rook attacks for a square with blockers
 * @param {number} square - Square index (0-63)
 * @param {BigInt} blockers - Blocker bitboard
 * @returns {BigInt} Attack bitboard
 */
export function getRookAttacks(square, blockers) {
  const mask = generateRookMask(square);
  const relevantBlockers = blockers & mask;
  const key = relevantBlockers.toString();

  let attacks = rookAttackTable[square].get(key);
  if (attacks === undefined) {
    // Fallback: generate on the fly
    attacks = generateRookAttacksOnFly(square, blockers);
  }

  return attacks;
}

/**
 * Get bishop attacks for a square with blockers
 * @param {number} square - Square index (0-63)
 * @param {BigInt} blockers - Blocker bitboard
 * @returns {BigInt} Attack bitboard
 */
export function getBishopAttacks(square, blockers) {
  const mask = generateBishopMask(square);
  const relevantBlockers = blockers & mask;
  const key = relevantBlockers.toString();

  let attacks = bishopAttackTable[square].get(key);
  if (attacks === undefined) {
    // Fallback: generate on the fly
    attacks = generateBishopAttacksOnFly(square, blockers);
  }

  return attacks;
}

/**
 * Get queen attacks (combination of rook and bishop)
 * @param {number} square - Square index (0-63)
 * @param {BigInt} blockers - Blocker bitboard
 * @returns {BigInt} Attack bitboard
 */
export function getQueenAttacks(square, blockers) {
  return getRookAttacks(square, blockers) | getBishopAttacks(square, blockers);
}

// Auto-initialize attack tables when module loads
initializeAttacks();

export default {
  initializeAttacks,
  getKnightAttacks,
  getKingAttacks,
  getPawnAttacks,
  getRookAttacks,
  getBishopAttacks,
  getQueenAttacks
};
