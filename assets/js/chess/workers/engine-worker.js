/**
 * Engine Worker - Web Worker for multithreaded chess engine
 * Part of Carson's Chess Engine
 * @module chess/workers/engine-worker
 */

// TODO: Implement during Phase 9.1
// - Move search, movegen, eval into worker
// - Message protocol for communication

self.addEventListener('message', (e) => {
  // TODO: Implement worker message handling
  console.log('[WORKER] Message received:', e.data);
});
