/**
 * Search - AI thinking and move search algorithms
 * Part of Carson's Chess Engine
 * @module chess/engine/search
 */

import { generateLegalMoves, makeMove, unmakeMove, isInCheck, makeNullMove, unmakeNullMove, hasMajorPieces } from './game.js';
import { evaluate, PIECE_VALUES } from './eval.js';
import { TranspositionTable, SCORE_EXACT, SCORE_ALPHA, SCORE_BETA, TTEntry } from './transposition-table.js';
import { Move } from './movegen.js';

// Search constants
export const MATE_SCORE = 30000;
export const MAX_PLY = 100;
export const MAX_QUIESCENCE_PLY = 10;

/**
 * Killer moves table - stores quiet moves that caused beta cutoffs
 */
class KillerMoves {
  constructor() {
    // Two killer moves per ply
    this.table = new Array(MAX_PLY);
    for (let i = 0; i < MAX_PLY; i++) {
      this.table[i] = [null, null];
    }
  }

  /**
   * Store a killer move
   * @param {number} ply - Current ply
   * @param {Move} move - Move that caused cutoff
   */
  store(ply, move) {
    if (ply < 0 || ply >= MAX_PLY) return;

    // Don't store captures as killers
    if (move.isCapture() || move.isEnPassant()) return;

    // Don't duplicate
    if (this.table[ply][0] && this.table[ply][0].encode() === move.encode()) {
      return;
    }

    // Shift killers
    this.table[ply][1] = this.table[ply][0];
    this.table[ply][0] = move;
  }

  /**
   * Get killer moves for a ply
   * @param {number} ply - Current ply
   * @returns {Move[]} Array of killer moves
   */
  get(ply) {
    if (ply < 0 || ply >= MAX_PLY) return [null, null];
    return this.table[ply];
  }

  /**
   * Clear all killer moves
   */
  clear() {
    for (let i = 0; i < MAX_PLY; i++) {
      this.table[i] = [null, null];
    }
  }
}

/**
 * History heuristic table - tracks move success rates
 */
class HistoryTable {
  constructor() {
    // [side][from][to] = success count
    this.table = new Array(2);
    for (let side = 0; side < 2; side++) {
      this.table[side] = new Array(64);
      for (let from = 0; from < 64; from++) {
        this.table[side][from] = new Array(64).fill(0);
      }
    }
  }

  /**
   * Record a successful move
   * @param {number} side - Side to move
   * @param {Move} move - Move that caused cutoff
   * @param {number} depth - Search depth (weighted by depth^2)
   */
  record(side, move, depth) {
    if (move.from >= 0 && move.from < 64 && move.to >= 0 && move.to < 64) {
      this.table[side][move.from][move.to] += depth * depth;
    }
  }

  /**
   * Get history score for a move
   * @param {number} side - Side to move
   * @param {Move} move - Move to score
   * @returns {number} History score
   */
  get(side, move) {
    if (move.from >= 0 && move.from < 64 && move.to >= 0 && move.to < 64) {
      return this.table[side][move.from][move.to];
    }
    return 0;
  }

  /**
   * Clear all history scores
   */
  clear() {
    for (let side = 0; side < 2; side++) {
      for (let from = 0; from < 64; from++) {
        this.table[side][from].fill(0);
      }
    }
  }
}

/**
 * Get the piece being moved
 * @param {Board} board - Board state
 * @param {Move} move - Move
 * @returns {object|null} Piece object or null
 */
function getMovingPiece(board, move) {
  return board.getPieceAt(move.from);
}

/**
 * Get the piece being captured
 * @param {Board} board - Board state
 * @param {Move} move - Move
 * @returns {object|null} Piece object or null
 */
function getCapturedPiece(board, move) {
  if (!move.isCapture() && !move.isEnPassant()) {
    return null;
  }

  if (move.isEnPassant()) {
    // En passant capture
    const captureSquare = board.sideToMove === 0 ? move.to - 8 : move.to + 8;
    return board.getPieceAt(captureSquare);
  }

  return board.getPieceAt(move.to);
}

/**
 * Score moves for move ordering
 * @param {Move[]} moves - Moves to score
 * @param {Board} board - Board state
 * @param {Move|null} ttMove - TT best move
 * @param {KillerMoves} killerMoves - Killer moves table
 * @param {HistoryTable} historyTable - History heuristic table
 * @param {number} ply - Current ply
 * @returns {Array} Moves with scores
 */
function scoreMoves(moves, board, ttMove, killerMoves, historyTable, ply) {
  const scoredMoves = [];

  for (const move of moves) {
    let score = 0;

    // TT move gets highest priority
    if (ttMove && move.encode() === ttMove.encode()) {
      score = 10000000;
    }
    // MVV-LVA for captures
    else if (move.isCapture() || move.isEnPassant()) {
      const victim = getCapturedPiece(board, move);
      const attacker = getMovingPiece(board, move);

      if (victim && attacker) {
        const victimValue = PIECE_VALUES[victim.piece];
        const attackerValue = PIECE_VALUES[attacker.piece];
        score = 1000000 + (victimValue * 10 - attackerValue);
      } else {
        score = 1000000;
      }

      // Queen promotions with capture
      if (move.isPromotion() && move.getPromotionPiece() === 4) {
        score += 900;
      }
    }
    // Queen promotions without capture
    else if (move.isPromotion() && move.getPromotionPiece() === 4) {
      score = 950000;
    }
    // Killer moves
    else {
      const killers = killerMoves.get(ply);
      if (killers[0] && move.encode() === killers[0].encode()) {
        score = 900000;
      } else if (killers[1] && move.encode() === killers[1].encode()) {
        score = 800000;
      } else {
        // History heuristic
        const historyScore = historyTable.get(board.sideToMove, move);
        score = Math.min(historyScore, 100000);
      }
    }

    scoredMoves.push({ move, score });
  }

  // Sort by score descending
  scoredMoves.sort((a, b) => b.score - a.score);

  return scoredMoves.map(sm => sm.move);
}

// Node counter for testing pruning effectiveness
let nodesSearched = 0;

/**
 * Reset node counter
 */
export function resetNodeCount() {
  nodesSearched = 0;
}

/**
 * Get current node count
 */
export function getNodeCount() {
  return nodesSearched;
}

/**
 * Quiescence search - extends search for tactical moves to avoid horizon effect
 * @param {Board} board - Board state
 * @param {number} alpha - Alpha bound
 * @param {number} beta - Beta bound
 * @param {number} ply - Current ply from root
 * @param {SearchInfo} searchInfo - Search control (optional)
 * @returns {number} Static evaluation or best tactical score
 */
function quiescence(board, alpha, beta, ply, searchInfo = null) {
  nodesSearched++;

  // Check if we should stop
  if (searchInfo && searchInfo.shouldStop()) {
    return 0;
  }

  // Prevent infinite quiescence search
  if (ply >= MAX_QUIESCENCE_PLY) {
    return evaluate(board);
  }

  // Stand pat - assume we can at least maintain current position
  const standPat = evaluate(board);

  // Beta cutoff - position is already too good
  if (standPat >= beta) {
    return beta;
  }

  // Update alpha with stand-pat score
  if (standPat > alpha) {
    alpha = standPat;
  }

  // Generate all legal moves
  const allMoves = generateLegalMoves(board);

  // Filter for captures only (including en passant)
  const captures = allMoves.filter(move => move.isCapture() || move.isEnPassant());

  // Search all captures
  for (const move of captures) {
    const state = makeMove(board, move);
    const score = -quiescence(board, -beta, -alpha, ply + 1, searchInfo);
    unmakeMove(board, move, state);

    // Beta cutoff
    if (score >= beta) {
      return beta;
    }

    // Update alpha
    if (score > alpha) {
      alpha = score;
    }
  }

  return alpha;
}

/**
 * Negamax search with alpha-beta pruning and transposition table
 * @param {Board} board - Board state
 * @param {number} depth - Remaining search depth
 * @param {number} alpha - Alpha bound (best score for maximizing player)
 * @param {number} beta - Beta bound (best score for minimizing player)
 * @param {number} ply - Current ply from root (for mate distance)
 * @param {SearchInfo} searchInfo - Search control (optional)
 * @param {boolean} allowNullMove - Allow null move pruning (default true)
 * @returns {number} Best score for current side
 */
function negamax(board, depth, alpha, beta, ply = 0, searchInfo = null, allowNullMove = true) {
  nodesSearched++;

  // Save original alpha for TT flag determination
  const originalAlpha = alpha;

  // Probe transposition table
  let ttMove = null;
  if (searchInfo?.tt && board.zobristHash) {
    const ttEntry = searchInfo.tt.probe(board.zobristHash);
    if (ttEntry && ttEntry.depth >= depth) {
      // Adjust mate scores from TT (mate distance relative to root)
      let ttScore = ttEntry.score;
      if (ttScore > MATE_SCORE - 100) {
        ttScore -= ply;
      } else if (ttScore < -MATE_SCORE + 100) {
        ttScore += ply;
      }

      // Use TT score if applicable
      if (ttEntry.flag === SCORE_EXACT) {
        return ttScore;
      }
      if (ttEntry.flag === SCORE_ALPHA && ttScore <= alpha) {
        return alpha;
      }
      if (ttEntry.flag === SCORE_BETA && ttScore >= beta) {
        return beta;
      }

      // Update alpha/beta with TT bounds
      if (ttEntry.flag === SCORE_ALPHA) {
        alpha = Math.max(alpha, ttScore);
      } else if (ttEntry.flag === SCORE_BETA) {
        beta = Math.min(beta, ttScore);
      }
    }

    // Extract TT move for move ordering (will use later)
    if (ttEntry && ttEntry.bestMove !== 0) {
      ttMove = Move.decode(ttEntry.bestMove);
    }
  }

  // Check if we should stop
  if (searchInfo && searchInfo.shouldStop()) {
    return 0;
  }

  // Terminal condition - call quiescence search instead of static eval
  if (depth === 0) {
    return quiescence(board, alpha, beta, ply, searchInfo);
  }

  // Null move pruning
  // Don't use if: in check, depth too low, no major pieces (zugzwang risk), or not allowed
  if (allowNullMove && depth >= 3 && !isInCheck(board) && hasMajorPieces(board)) {
    const R = 2; // Reduction factor

    const nullState = makeNullMove(board);
    // Recursive search with reduced depth and negated bounds, null move not allowed
    const nullScore = -negamax(board, depth - 1 - R, -beta, -beta + 1, ply + 1, searchInfo, false);
    unmakeNullMove(board, nullState);

    // Beta cutoff - position is so good opponent would avoid it
    if (nullScore >= beta) {
      return beta;
    }
  }

  // Generate all legal moves
  let moves = generateLegalMoves(board);

  // Checkmate or stalemate detection
  if (moves.length === 0) {
    if (isInCheck(board)) {
      // Checkmate - return negative mate score (adjusted by ply for faster mates)
      return -MATE_SCORE + ply;
    }
    // Stalemate - draw
    return 0;
  }

  // Order moves for better alpha-beta pruning
  if (searchInfo) {
    moves = scoreMoves(moves, board, ttMove, searchInfo.killerMoves, searchInfo.historyTable, ply);
  }

  let bestScore = -Infinity;
  let bestMove = null;

  // Try each legal move
  for (const move of moves) {
    const state = makeMove(board, move);
    const score = -negamax(board, depth - 1, -beta, -alpha, ply + 1, searchInfo, true);
    unmakeMove(board, move, state);

    // Update best score and move
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    // Beta cutoff - opponent has a better option elsewhere
    if (score >= beta) {
      // Update killer moves and history heuristic for quiet moves
      if (searchInfo && !move.isCapture() && !move.isEnPassant()) {
        searchInfo.killerMoves.store(ply, move);
        searchInfo.historyTable.record(board.sideToMove, move, depth);
      }

      // Store in transposition table
      if (searchInfo?.tt && board.zobristHash) {
        let storeScore = beta;
        // Adjust mate scores for TT storage
        if (storeScore > MATE_SCORE - 100) {
          storeScore += ply;
        } else if (storeScore < -MATE_SCORE + 100) {
          storeScore -= ply;
        }
        searchInfo.tt.store(board.zobristHash, depth, storeScore, SCORE_BETA, move);
      }
      return beta;
    }

    // Update alpha (best score so far)
    if (score > alpha) {
      alpha = score;
    }
  }

  // Store in transposition table
  if (searchInfo?.tt && board.zobristHash) {
    let storeScore = bestScore;
    // Adjust mate scores for TT storage
    if (storeScore > MATE_SCORE - 100) {
      storeScore += ply;
    } else if (storeScore < -MATE_SCORE + 100) {
      storeScore -= ply;
    }

    // Determine flag
    let flag = SCORE_ALPHA; // Fail-low
    if (bestScore >= beta) {
      flag = SCORE_BETA; // Fail-high
    } else if (bestScore > originalAlpha) {
      flag = SCORE_EXACT; // PV node
    }

    searchInfo.tt.store(board.zobristHash, depth, storeScore, flag, bestMove);
  }

  return bestScore;
}

/**
 * Find the best move for the current position (with alpha-beta)
 * @param {Board} board - Board state
 * @param {number} depth - Search depth
 * @returns {object} Object with {move, score, nodes}
 */
export function findBestMove(board, depth) {
  resetNodeCount();

  const moves = generateLegalMoves(board);

  if (moves.length === 0) {
    return { move: null, score: 0, nodes: 0 };
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  for (const move of moves) {
    const state = makeMove(board, move);
    const score = -negamax(board, depth - 1, -beta, -alpha, 0);
    unmakeMove(board, move, state);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    // Update alpha
    alpha = Math.max(alpha, score);
  }

  return { move: bestMove, score: bestScore, nodes: getNodeCount() };
}

/**
 * Search information and time management
 */
class SearchInfo {
  constructor(tt = null) {
    this.startTime = 0;
    this.maxTime = 0;
    this.depth = 0;
    this.nodes = 0;
    this.stopped = false;
    this.tt = tt; // Transposition table
    this.killerMoves = new KillerMoves();
    this.historyTable = new HistoryTable();
  }

  /**
   * Check if search should stop
   * @returns {boolean}
   */
  shouldStop() {
    if (this.stopped) return true;

    if (this.maxTime > 0 && Date.now() - this.startTime >= this.maxTime) {
      this.stopped = true;
      return true;
    }

    return false;
  }

  /**
   * Clear move ordering tables for new search
   */
  clearMoveOrdering() {
    this.killerMoves.clear();
    this.historyTable.clear();
  }
}

/**
 * Find best move at a specific depth (for iterative deepening)
 * @param {Board} board - Board state
 * @param {number} depth - Search depth
 * @param {SearchInfo} searchInfo - Search control information
 * @returns {object} Object with {move, score}
 */
function findBestMoveAtDepth(board, depth, searchInfo) {
  let moves = generateLegalMoves(board);

  if (moves.length === 0) {
    return { move: null, score: 0 };
  }

  // Get TT move for root position
  let ttMove = null;
  if (searchInfo?.tt && board.zobristHash) {
    const ttEntry = searchInfo.tt.probe(board.zobristHash);
    if (ttEntry && ttEntry.bestMove !== 0) {
      ttMove = Move.decode(ttEntry.bestMove);
    }
  }

  // Order moves
  if (searchInfo) {
    moves = scoreMoves(moves, board, ttMove, searchInfo.killerMoves, searchInfo.historyTable, 0);
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  for (const move of moves) {
    // Check if we should stop
    if (searchInfo.shouldStop()) {
      break;
    }

    const state = makeMove(board, move);
    const score = -negamax(board, depth - 1, -beta, -alpha, 0, searchInfo, true);
    unmakeMove(board, move, state);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    alpha = Math.max(alpha, score);
  }

  return { move: bestMove, score: bestScore };
}

/**
 * Iterative deepening search with time management
 * @param {Board} board - Board state
 * @param {object} options - Search options
 * @param {number} options.maxDepth - Maximum depth to search (default: 10)
 * @param {number} options.maxTime - Maximum time in milliseconds (default: 5000)
 * @param {function} options.onDepthComplete - Callback called after each depth
 * @param {TranspositionTable} options.tt - Transposition table (optional, will create if not provided)
 * @param {object} options.ttConfig - TT configuration (optional)
 * @returns {object} Object with {move, score, depth, nodes, time, ttStats}
 */
export function findBestMoveIterative(board, options = {}) {
  const {
    maxDepth = 10,
    maxTime = 5000,
    onDepthComplete = null,
    tt = null,
    ttConfig = {}
  } = options;

  // Create or use provided transposition table
  const transpositionTable = tt || new TranspositionTable(
    ttConfig.ttSizePower || 22,
    {
      depthPriority: ttConfig.depthPriority || 2.0,
      agePriority: ttConfig.agePriority || 1.5
    }
  );

  const searchInfo = new SearchInfo(transpositionTable);
  searchInfo.startTime = Date.now();
  searchInfo.maxTime = maxTime;

  // Clear move ordering tables for new search
  // Note: We don't clear between iterations to preserve killer/history info
  searchInfo.clearMoveOrdering();

  let bestMove = null;
  let bestScore = 0;
  let completedDepth = 0;

  // Iterative deepening loop
  for (let depth = 1; depth <= maxDepth; depth++) {
    resetNodeCount();
    searchInfo.depth = depth;
    searchInfo.stopped = false;

    // Increment age for new search iteration
    transpositionTable.incrementAge();

    const result = findBestMoveAtDepth(board, depth, searchInfo);

    // If search was stopped mid-depth and we have a previous result, use it
    if (searchInfo.stopped && depth > 1) {
      break;
    }

    // Update best move and score
    bestMove = result.move;
    bestScore = result.score;
    completedDepth = depth;

    // Callback for progress updates
    if (onDepthComplete) {
      const elapsed = Date.now() - searchInfo.startTime;
      const nodes = getNodeCount();
      const nps = elapsed > 0 ? Math.round(nodes / (elapsed / 1000)) : 0;
      const ttStats = transpositionTable.getStatistics();

      onDepthComplete({
        depth,
        score: bestScore,
        move: bestMove,
        nodes,
        time: elapsed,
        nps,
        ttHitRate: ttStats.hitRate,
        ttFullness: ttStats.fullness
      });
    }

    // Stop if mate found
    if (Math.abs(bestScore) > MATE_SCORE - 100) {
      break;
    }

    // Check if we should stop for next iteration
    if (searchInfo.shouldStop()) {
      break;
    }
  }

  const totalTime = Date.now() - searchInfo.startTime;
  const totalNodes = getNodeCount();

  return {
    move: bestMove,
    score: bestScore,
    depth: completedDepth,
    nodes: totalNodes,
    time: totalTime,
    nps: totalTime > 0 ? Math.round(totalNodes / (totalTime / 1000)) : 0,
    ttStats: transpositionTable.getStatistics()
  };
}
