/**
 * Evaluation - Position scoring and evaluation functions
 * Part of Carson's Chess Engine
 * @module chess/engine/eval
 */

import {
  WHITE, BLACK,
  PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING,
  popCount,
  bitboardToSquares
} from './bitboard.js';

// Piece values in centipawns
export const PIECE_VALUES = [
  100,   // PAWN
  320,   // KNIGHT
  330,   // BISHOP
  500,   // ROOK
  900,   // QUEEN
  20000  // KING
];

// Piece-Square Tables (PeSTO)
// Indexed from a1=0 to h8=63, from White's perspective
// Values in centipawns

const PST_PAWN_OPENING = [
  0,   0,   0,   0,   0,   0,   0,   0,
  50,  50,  50,  50,  50,  50,  50,  50,
  10,  10,  20,  30,  30,  20,  10,  10,
  5,   5,  10,  25,  25,  10,   5,   5,
  0,   0,   0,  20,  20,   0,   0,   0,
  5,  -5, -10,   0,   0, -10,  -5,   5,
  5,  10,  10, -20, -20,  10,  10,   5,
  0,   0,   0,   0,   0,   0,   0,   0
];

const PST_PAWN_ENDGAME = [
  0,   0,   0,   0,   0,   0,   0,   0,
  80,  80,  80,  80,  80,  80,  80,  80,
  50,  50,  50,  50,  50,  50,  50,  50,
  30,  30,  30,  30,  30,  30,  30,  30,
  20,  20,  20,  20,  20,  20,  20,  20,
  10,  10,  10,  10,  10,  10,  10,  10,
  10,  10,  10,  10,  10,  10,  10,  10,
  0,   0,   0,   0,   0,   0,   0,   0
];

const PST_KNIGHT_OPENING = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   0,   0,   0, -20, -40,
  -30,   0,  10,  15,  15,  10,   0, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   0,  15,  20,  20,  15,   0, -30,
  -30,   5,  10,  15,  15,  10,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50
];

const PST_KNIGHT_ENDGAME = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   0,   0,   0, -20, -40,
  -30,   0,  10,  15,  15,  10,   0, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   0,  15,  20,  20,  15,   0, -30,
  -30,   5,  10,  15,  15,  10,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50
];

const PST_BISHOP_OPENING = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,  10,  10,   5,   0, -10,
  -10,   5,   5,  10,  10,   5,   5, -10,
  -10,   0,  10,  10,  10,  10,   0, -10,
  -10,  10,  10,  10,  10,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20
];

const PST_BISHOP_ENDGAME = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,  10,  10,   5,   0, -10,
  -10,   5,   5,  10,  10,   5,   5, -10,
  -10,   0,  10,  10,  10,  10,   0, -10,
  -10,  10,  10,  10,  10,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20
];

const PST_ROOK_OPENING = [
  0,   0,   0,   0,   0,   0,   0,   0,
  5,  10,  10,  10,  10,  10,  10,   5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  0,   0,   0,   5,   5,   0,   0,   0
];

const PST_ROOK_ENDGAME = [
  0,   0,   0,   0,   0,   0,   0,   0,
  5,  10,  10,  10,  10,  10,  10,   5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  0,   0,   0,   5,   5,   0,   0,   0
];

const PST_QUEEN_OPENING = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,   5,   5,   5,   0, -10,
  -5,   0,   5,   5,   5,   5,   0,  -5,
  0,   0,   5,   5,   5,   5,   0,  -5,
  -10,   5,   5,   5,   5,   5,   0, -10,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20
];

const PST_QUEEN_ENDGAME = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,   5,   5,   5,   0, -10,
  -5,   0,   5,   5,   5,   5,   0,  -5,
  0,   0,   5,   5,   5,   5,   0,  -5,
  -10,   5,   5,   5,   5,   5,   0, -10,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20
];

const PST_KING_OPENING = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20,  20,   0,   0,   0,   0,  20,  20,
  20,  30,  10,   0,   0,  10,  30,  20
];

const PST_KING_ENDGAME = [
  -50, -40, -30, -20, -20, -30, -40, -50,
  -30, -20, -10,   0,   0, -10, -20, -30,
  -30, -10,  20,  30,  30,  20, -10, -30,
  -30, -10,  30,  40,  40,  30, -10, -30,
  -30, -10,  30,  40,  40,  30, -10, -30,
  -30, -10,  20,  30,  30,  20, -10, -30,
  -30, -30,   0,   0,   0,   0, -30, -30,
  -50, -30, -30, -30, -30, -30, -30, -50
];

// Organize PST by phase and piece type
const PIECE_SQUARE_TABLES = [
  // Opening phase (index 0)
  [
    PST_PAWN_OPENING,
    PST_KNIGHT_OPENING,
    PST_BISHOP_OPENING,
    PST_ROOK_OPENING,
    PST_QUEEN_OPENING,
    PST_KING_OPENING
  ],
  // Endgame phase (index 1)
  [
    PST_PAWN_ENDGAME,
    PST_KNIGHT_ENDGAME,
    PST_BISHOP_ENDGAME,
    PST_ROOK_ENDGAME,
    PST_QUEEN_ENDGAME,
    PST_KING_ENDGAME
  ]
];

/**
 * Get Piece-Square Table score for a given phase
 * @param {Board} board - Board state
 * @param {number} phase - 0 for opening, 1 for endgame
 * @returns {number} PST score in centipawns (positive = White advantage)
 */
export function getPSTScore(board, phase) {
  let score = 0;

  // Iterate through colors and piece types
  for (let color = WHITE; color <= BLACK; color++) {
    for (let pieceType = PAWN; pieceType <= KING; pieceType++) {
      const bitboard = board.bitboards[color][pieceType];
      const pst = PIECE_SQUARE_TABLES[phase][pieceType];

      // Get all squares for this piece type
      const squares = bitboardToSquares(bitboard);

      for (const square of squares) {
        // For Black pieces, mirror the square (63 - square)
        const pstIndex = color === WHITE ? square : 63 - square;
        const pstValue = pst[pstIndex];

        // Add to score (positive for White, negative for Black)
        score += color === WHITE ? pstValue : -pstValue;
      }
    }
  }

  return score;
}

// Phase weights for calculating game phase
// Total starting phase: 2 * (1+1+2+4) * 2 = 24
const PHASE_WEIGHTS = [
  0,  // PAWN (doesn't count towards phase)
  1,  // KNIGHT
  1,  // BISHOP
  2,  // ROOK
  4,  // QUEEN
  0   // KING (doesn't count towards phase)
];

/**
 * Calculate game phase value based on remaining material
 * @param {Board} board - Board state
 * @returns {number} Phase value (0-24, where 24 = opening, 0 = endgame)
 */
export function getGamePhase(board) {
  let phase = 0;

  // Count non-pawn, non-king pieces
  for (let pieceType = KNIGHT; pieceType <= QUEEN; pieceType++) {
    const whitePieces = popCount(board.bitboards[WHITE][pieceType]);
    const blackPieces = popCount(board.bitboards[BLACK][pieceType]);
    const totalPieces = whitePieces + blackPieces;

    phase += totalPieces * PHASE_WEIGHTS[pieceType];
  }

  return phase;
}

/**
 * Calculate game phase ratio (0.0 = pure endgame, 1.0 = pure opening)
 * @param {Board} board - Board state
 * @returns {number} Phase ratio (0.0 to 1.0)
 */
export function getPhaseRatio(board) {
  const phase = getGamePhase(board);
  const maxPhase = 24; // Starting position phase value

  // Calculate ratio and clamp to [0, 1]
  const ratio = phase / maxPhase;
  return Math.max(0, Math.min(1, ratio));
}

/**
 * Calculate material score (piece count * values)
 * @param {Board} board - Board state
 * @returns {number} Material score in centipawns (positive = White advantage)
 */
export function getMaterialScore(board) {
  let score = 0;

  // Iterate through all piece types
  for (let pieceType = PAWN; pieceType <= KING; pieceType++) {
    // Count white pieces
    const whitePieces = popCount(board.bitboards[WHITE][pieceType]);

    // Count black pieces
    const blackPieces = popCount(board.bitboards[BLACK][pieceType]);

    // Add to score (positive for White, negative for Black)
    score += (whitePieces - blackPieces) * PIECE_VALUES[pieceType];
  }

  return score;
}

/**
 * Main evaluation function - combines material and positional evaluation
 * @param {Board} board - Board state
 * @returns {number} Evaluation in centipawns from current side's perspective
 */
export function evaluate(board) {
  // Material score
  const material = getMaterialScore(board);

  // Phase calculation
  const phaseRatio = getPhaseRatio(board);

  // Piece-square tables for both phases
  const pstOpening = getPSTScore(board, 0);
  const pstEndgame = getPSTScore(board, 1);

  // Tapered evaluation (interpolate between opening and endgame)
  const pstScore = Math.round(
    pstOpening * phaseRatio + pstEndgame * (1 - phaseRatio)
  );

  // Total evaluation (White perspective)
  const score = material + pstScore;

  // Return from current side's perspective
  return board.sideToMove === WHITE ? score : -score;
}

/**
 * Detailed evaluation function for debugging
 * @param {Board} board - Board state
 * @returns {object} Breakdown of evaluation components
 */
export function evaluateDetailed(board) {
  const material = getMaterialScore(board);
  const phase = getGamePhase(board);
  const phaseRatio = getPhaseRatio(board);
  const pstOpening = getPSTScore(board, 0);
  const pstEndgame = getPSTScore(board, 1);
  const pstTapered = Math.round(
    pstOpening * phaseRatio + pstEndgame * (1 - phaseRatio)
  );
  const total = material + pstTapered;

  return {
    material,
    pstOpening,
    pstEndgame,
    pstTapered,
    phase,
    phaseRatio: phaseRatio.toFixed(2),
    total,
    fromSidePerspective: board.sideToMove === WHITE ? total : -total
  };
}
