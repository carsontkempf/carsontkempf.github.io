/**
 * FEN Validator Utility
 * Validates FEN (Forsyth-Edwards Notation) strings
 */

/**
 * Validate a FEN string
 * @param {string} fen - FEN string to validate
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateFEN(fen) {
  if (!fen || typeof fen !== 'string') {
    return { valid: false, error: 'FEN must be a non-empty string' };
  }

  const parts = fen.trim().split(/\s+/);

  // FEN must have 6 fields
  if (parts.length !== 6) {
    return {
      valid: false,
      error: `FEN must have 6 fields (found ${parts.length}). Format: position side castling ep halfmove fullmove`
    };
  }

  const [position, side, castling, enPassant, halfmove, fullmove] = parts;

  // Validate position (field 1)
  const positionResult = validatePosition(position);
  if (!positionResult.valid) {
    return positionResult;
  }

  // Validate side to move (field 2)
  if (side !== 'w' && side !== 'b') {
    return {
      valid: false,
      error: `Invalid side to move: "${side}". Must be "w" or "b"`
    };
  }

  // Validate castling rights (field 3)
  const castlingResult = validateCastling(castling);
  if (!castlingResult.valid) {
    return castlingResult;
  }

  // Validate en passant square (field 4)
  const epResult = validateEnPassant(enPassant);
  if (!epResult.valid) {
    return epResult;
  }

  // Validate halfmove clock (field 5)
  const halfmoveNum = parseInt(halfmove, 10);
  if (isNaN(halfmoveNum) || halfmoveNum < 0) {
    return {
      valid: false,
      error: `Invalid halfmove clock: "${halfmove}". Must be a non-negative integer`
    };
  }

  // Validate fullmove number (field 6)
  const fullmoveNum = parseInt(fullmove, 10);
  if (isNaN(fullmoveNum) || fullmoveNum < 1) {
    return {
      valid: false,
      error: `Invalid fullmove number: "${fullmove}". Must be a positive integer`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate position part of FEN
 * @param {string} position - Position string (e.g., "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
 * @returns {Object} {valid: boolean, error: string|null}
 */
function validatePosition(position) {
  const ranks = position.split('/');

  // Must have exactly 8 ranks
  if (ranks.length !== 8) {
    return {
      valid: false,
      error: `Position must have 8 ranks separated by "/" (found ${ranks.length})`
    };
  }

  const validPieces = new Set(['p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K']);
  let whiteKings = 0;
  let blackKings = 0;

  // Validate each rank
  for (let i = 0; i < ranks.length; i++) {
    const rank = ranks[i];
    let squareCount = 0;

    for (const char of rank) {
      if (/[1-8]/.test(char)) {
        // Empty squares
        squareCount += parseInt(char, 10);
      } else if (validPieces.has(char)) {
        // Piece
        squareCount++;
        if (char === 'K') whiteKings++;
        if (char === 'k') blackKings++;
      } else {
        return {
          valid: false,
          error: `Invalid character "${char}" in rank ${i + 1}. Valid: p,n,b,r,q,k,P,N,B,R,Q,K,1-8`
        };
      }
    }

    // Each rank must have exactly 8 squares
    if (squareCount !== 8) {
      return {
        valid: false,
        error: `Rank ${i + 1} has ${squareCount} squares (expected 8): "${rank}"`
      };
    }
  }

  // Must have exactly one white king and one black king
  if (whiteKings !== 1) {
    return {
      valid: false,
      error: `Must have exactly one white king (found ${whiteKings})`
    };
  }
  if (blackKings !== 1) {
    return {
      valid: false,
      error: `Must have exactly one black king (found ${blackKings})`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate castling rights
 * @param {string} castling - Castling rights string (e.g., "KQkq", "Kq", "-")
 * @returns {Object} {valid: boolean, error: string|null}
 */
function validateCastling(castling) {
  if (castling === '-') {
    return { valid: true, error: null };
  }

  const validChars = new Set(['K', 'Q', 'k', 'q']);
  const seen = new Set();

  for (const char of castling) {
    if (!validChars.has(char)) {
      return {
        valid: false,
        error: `Invalid castling character: "${char}". Valid: K,Q,k,q or "-"`
      };
    }
    if (seen.has(char)) {
      return {
        valid: false,
        error: `Duplicate castling character: "${char}"`
      };
    }
    seen.add(char);
  }

  // Castling rights should be in order: KQkq
  const order = ['K', 'Q', 'k', 'q'];
  let lastIndex = -1;
  for (const char of castling) {
    const currentIndex = order.indexOf(char);
    if (currentIndex < lastIndex) {
      return {
        valid: false,
        error: `Castling rights not in standard order (KQkq): "${castling}"`
      };
    }
    lastIndex = currentIndex;
  }

  return { valid: true, error: null };
}

/**
 * Validate en passant square
 * @param {string} ep - En passant square (e.g., "e3", "a6", "-")
 * @returns {Object} {valid: boolean, error: string|null}
 */
function validateEnPassant(ep) {
  if (ep === '-') {
    return { valid: true, error: null };
  }

  // Must be algebraic notation (a-h)(1-8)
  const match = ep.match(/^([a-h])([1-8])$/);
  if (!match) {
    return {
      valid: false,
      error: `Invalid en passant square: "${ep}". Must be algebraic notation (e.g., "e3") or "-"`
    };
  }

  const rank = parseInt(match[2], 10);

  // En passant square must be on rank 3 or 6
  if (rank !== 3 && rank !== 6) {
    return {
      valid: false,
      error: `En passant square must be on rank 3 or 6 (found rank ${rank})`
    };
  }

  return { valid: true, error: null };
}

/**
 * Quick FEN syntax check (less strict than full validation)
 * @param {string} fen - FEN string to check
 * @returns {boolean} True if FEN has basic valid syntax
 */
export function isFENSyntaxValid(fen) {
  if (!fen || typeof fen !== 'string') {
    return false;
  }

  const parts = fen.trim().split(/\s+/);
  if (parts.length !== 6) {
    return false;
  }

  const [position, side] = parts;

  // Quick checks
  if (position.split('/').length !== 8) {
    return false;
  }

  if (side !== 'w' && side !== 'b') {
    return false;
  }

  return true;
}

/**
 * Get FEN error message (user-friendly)
 * @param {string} fen - FEN string
 * @returns {string|null} Error message or null if valid
 */
export function getFENError(fen) {
  const result = validateFEN(fen);
  return result.valid ? null : result.error;
}
