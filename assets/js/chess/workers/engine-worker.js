/**
 * Engine Worker - Web Worker for multithreaded chess engine
 * Part of Carson's Chess Engine
 * @module chess/workers/engine-worker
 */

// Import all engine modules
importScripts(
  '/assets/js/chess/engine/bitboard.js',
  '/assets/js/chess/engine/zobrist.js',
  '/assets/js/chess/engine/attacks.js',
  '/assets/js/chess/engine/board.js',
  '/assets/js/chess/engine/movegen.js',
  '/assets/js/chess/engine/game.js',
  '/assets/js/chess/engine/eval.js',
  '/assets/js/chess/engine/transposition-table.js',
  '/assets/js/chess/engine/search.js'
);

// Worker state
let transpositionTable = null;
let currentSearch = null;
let currentMaxDepth = 10; // Track max depth for progress updates

/**
 * Initialize transposition table with given configuration
 */
function initializeTranspositionTable(config) {
  const ttSizePower = config.ttSizePower || 22; // Default 4MB
  const depthPriority = config.depthPriority || 2.0;
  const agePriority = config.agePriority || 1.5;

  transpositionTable = new TranspositionTable(ttSizePower, depthPriority, agePriority);

  console.log(`[WORKER] TT initialized: ${transpositionTable.maxEntries} entries (${(transpositionTable.maxEntries * 64 / (1024 * 1024)).toFixed(1)}MB)`);
}

/**
 * Handle analyze message - start search on given position
 */
function handleAnalyze(data) {
  try {
    const { fen, depth, timeLimit, ttConfig } = data;

    // Initialize or reconfigure TT if needed
    if (!transpositionTable || ttConfig) {
      initializeTranspositionTable(ttConfig || {});
    }

    // Parse FEN to create board
    const board = Board.parseFEN(fen);

    // Store max depth for progress updates
    currentMaxDepth = depth || 10;

    // Prepare search options (use maxTime, not timeLimit)
    const options = {
      maxDepth: currentMaxDepth,
      maxTime: timeLimit || 5000,
      tt: transpositionTable,
      onDepthComplete: (result) => {
        // Send progress update
        sendProgress(result);
      }
    };

    // Start time
    const startTime = Date.now();

    // Perform iterative deepening search
    const result = findBestMoveIterative(board, options);

    // Calculate time elapsed
    const timeElapsed = Date.now() - startTime;

    // Add time to result
    result.timeElapsed = timeElapsed;

    // Send completion message
    sendComplete(result);

  } catch (error) {
    sendError(error.message);
  }
}

/**
 * Handle stop message - halt current search
 * Note: Currently, stopping is handled via time limits.
 * For immediate stop, the worker would need to be terminated and recreated.
 */
function handleStop() {
  console.log('[WORKER] Stop message received');
  // TODO: Implement graceful stop mechanism
  // Current limitation: SearchInfo is created internally by findBestMoveIterative
  // and cannot be accessed from the worker to set stopped flag.
  // For now, searches will complete naturally when time limit is reached.
}

/**
 * Handle configure message - update TT settings
 */
function handleConfigure(data) {
  try {
    const { ttConfig } = data;

    if (ttConfig) {
      initializeTranspositionTable(ttConfig);
      self.postMessage({
        type: 'configured',
        ttConfig: ttConfig
      });
    }
  } catch (error) {
    sendError(error.message);
  }
}

/**
 * Send progress update to main thread
 */
function sendProgress(result) {
  // Generate simple PV from best move (just the move itself for now)
  // Full PV tracking would require modifying search.js
  const pv = [];
  const pvSAN = [];

  if (result.move) {
    try {
      const moveStr = `${squareToAlgebraic(result.move.from)}${squareToAlgebraic(result.move.to)}`;
      pv.push(moveStr);
      pvSAN.push(moveStr); // TODO: Convert to SAN notation
    } catch (e) {
      // If move conversion fails, just use empty PV
    }
  }

  const message = {
    type: 'progress',
    depth: result.depth,
    score: result.score,
    nodes: result.nodes,
    nps: result.nps,
    pv: pv,
    pvSAN: pvSAN,
    timeElapsed: result.time || 0,
    maxDepth: currentMaxDepth
  };

  self.postMessage(message);
}

/**
 * Send completion message to main thread
 */
function sendComplete(result) {
  // Generate simple PV from best move
  const pv = [];
  const pvSAN = [];

  if (result.move) {
    try {
      const moveStr = `${squareToAlgebraic(result.move.from)}${squareToAlgebraic(result.move.to)}`;
      pv.push(moveStr);
      pvSAN.push(moveStr); // TODO: Convert to SAN notation
    } catch (e) {
      // If move conversion fails, just use empty PV
    }
  }

  const message = {
    type: 'complete',
    bestMove: result.move ? serializeMove(result.move) : null,
    bestMoveSAN: '', // TODO: Implement SAN conversion
    score: result.score,
    depth: result.depth,
    nodes: result.nodes,
    nps: result.nps,
    pv: pv,
    pvSAN: pvSAN,
    timeElapsed: result.timeElapsed || result.time,
    ttStats: result.ttStats || null
  };

  self.postMessage(message);
}

/**
 * Send error message to main thread
 */
function sendError(errorMessage) {
  self.postMessage({
    type: 'error',
    message: errorMessage
  });
}

/**
 * Serialize move object to simple format
 */
function serializeMove(move) {
  if (!move) return null;

  return {
    from: move.from,
    to: move.to,
    flags: move.flags,
    encoded: move.encode()
  };
}

/**
 * Main message handler
 */
self.addEventListener('message', (e) => {
  const { type, ...data } = e.data;

  console.log(`[WORKER] Received message: ${type}`);

  switch (type) {
    case 'analyze':
      handleAnalyze(data);
      break;

    case 'stop':
      handleStop();
      break;

    case 'configure':
      handleConfigure(data);
      break;

    default:
      console.warn(`[WORKER] Unknown message type: ${type}`);
  }
});

// Signal that worker is ready
self.postMessage({ type: 'ready' });
console.log('[WORKER] Engine worker initialized and ready');
