/**
 * Analysis Manager - Bridge between main thread and engine worker
 * Part of Carson's Chess Engine
 * @module chess/ui/analysis-manager
 */

export class AnalysisManager {
  constructor() {
    this.worker = null;
    this.analyzing = false;
    this.currentPosition = null;
    this.callbacks = {
      onProgress: null,
      onComplete: null,
      onError: null,
      onReady: null
    };
  }

  /**
   * Initialize the web worker
   */
  initialize() {
    console.log('[AnalysisManager] Initializing worker...');

    try {
      // Create worker
      this.worker = new Worker('/assets/js/chess/workers/engine-worker.js');

      // Set up message handler
      this.worker.onmessage = (e) => this.handleMessage(e.data);

      // Set up error handler
      this.worker.onerror = (e) => this.handleError(e);

      console.log('[AnalysisManager] Worker created successfully');
    } catch (error) {
      console.error('[AnalysisManager] Failed to create worker:', error);
      this.handleError(error);
    }
  }

  /**
   * Start analyzing a position
   * @param {string} fen - FEN string of position
   * @param {object} options - Analysis options
   */
  analyze(fen, options = {}) {
    if (!this.worker) {
      console.error('[AnalysisManager] Worker not initialized');
      return;
    }

    const {
      depth = 10,
      timeLimit = 5000,
      ttConfig = null
    } = options;

    console.log(`[AnalysisManager] Starting analysis: depth=${depth}, timeLimit=${timeLimit}ms`);

    this.analyzing = true;
    this.currentPosition = fen;

    // Send analyze message to worker
    this.worker.postMessage({
      type: 'analyze',
      fen: fen,
      depth: depth,
      timeLimit: timeLimit,
      ttConfig: ttConfig
    });
  }

  /**
   * Stop current analysis
   */
  stop() {
    if (!this.worker) {
      console.error('[AnalysisManager] Worker not initialized');
      return;
    }

    if (!this.analyzing) {
      console.log('[AnalysisManager] No analysis in progress');
      return;
    }

    console.log('[AnalysisManager] Stopping analysis...');

    // Send stop message (for future graceful stop implementation)
    this.worker.postMessage({
      type: 'stop'
    });

    // For immediate stop: terminate worker and recreate it
    // This is necessary because SearchInfo is created internally
    // and cannot be accessed to set the stopped flag
    this.worker.terminate();
    this.worker = null;

    // Reinitialize worker for next analysis
    this.initialize();

    this.analyzing = false;

    console.log('[AnalysisManager] Analysis stopped and worker restarted');
  }

  /**
   * Configure worker settings
   * @param {object} ttConfig - Transposition table configuration
   */
  configure(ttConfig) {
    if (!this.worker) {
      console.error('[AnalysisManager] Worker not initialized');
      return;
    }

    console.log('[AnalysisManager] Configuring worker:', ttConfig);

    this.worker.postMessage({
      type: 'configure',
      ttConfig: ttConfig
    });
  }

  /**
   * Handle message from worker
   * @param {object} data - Message data
   */
  handleMessage(data) {
    const { type, ...payload } = data;

    switch (type) {
      case 'ready':
        console.log('[AnalysisManager] Worker ready');
        if (this.callbacks.onReady) {
          this.callbacks.onReady();
        }
        break;

      case 'progress':
        if (this.callbacks.onProgress) {
          this.callbacks.onProgress(payload);
        }
        break;

      case 'complete':
        console.log('[AnalysisManager] Analysis complete:', payload);
        this.analyzing = false;
        if (this.callbacks.onComplete) {
          this.callbacks.onComplete(payload);
        }
        break;

      case 'error':
        console.error('[AnalysisManager] Worker error:', payload.message);
        this.analyzing = false;
        if (this.callbacks.onError) {
          this.callbacks.onError(payload.message);
        }
        break;

      case 'configured':
        console.log('[AnalysisManager] Worker reconfigured:', payload.ttConfig);
        break;

      default:
        console.warn('[AnalysisManager] Unknown message type:', type);
    }
  }

  /**
   * Handle worker error
   * @param {Error} error - Error object
   */
  handleError(error) {
    console.error('[AnalysisManager] Worker error:', error);
    this.analyzing = false;

    if (this.callbacks.onError) {
      this.callbacks.onError(error.message || 'Worker error');
    }
  }

  /**
   * Terminate worker and clean up
   */
  destroy() {
    if (this.worker) {
      console.log('[AnalysisManager] Terminating worker...');
      this.worker.terminate();
      this.worker = null;
    }

    this.analyzing = false;
    this.currentPosition = null;
  }
}

// Singleton instance
let analysisManager = null;

/**
 * Get the singleton instance
 */
export function getAnalysisManager() {
  if (!analysisManager) {
    analysisManager = new AnalysisManager();
    analysisManager.initialize();
  }
  return analysisManager;
}

/**
 * Initialize and return the analysis manager
 */
export function initializeAnalysisManager() {
  return getAnalysisManager();
}
