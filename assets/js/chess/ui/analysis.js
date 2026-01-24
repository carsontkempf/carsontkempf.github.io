/**
 * Analysis - Analysis panel and evaluation graphs
 * Part of Carson's Chess Engine
 * @module chess/ui/analysis
 */

import { squareToAlgebraic } from '../engine/bitboard.js';
import { ArrowOverlay } from './arrow-overlay.js';

export class AnalysisUI {
  constructor() {
    this.boardManager = null;
    this.analysisManager = null;
    this.arrowOverlay = null;
    this.currentAnalysis = null;

    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    this.evalScoreEl = document.getElementById('eval-score');
    this.searchDepthEl = document.getElementById('search-depth');
    this.nodesPerSecEl = document.getElementById('nodes-per-sec');
    this.pvEl = document.getElementById('principal-variation');
    this.timeEl = document.getElementById('analysis-time');
    this.startBtn = document.getElementById('start-analysis-btn');
    this.stopBtn = document.getElementById('stop-analysis-btn');

    console.log('[AnalysisUI] Elements initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen to moves (optional auto-analyze)
    window.addEventListener('chessMoveMade', () => this.onMoveMade());

    // Listen to new game
    window.addEventListener('chessGameReset', () => this.onGameReset());

    // Button handlers
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.startAnalysis());
    }

    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => this.stopAnalysis());
    }

    // Listen to TT config changes
    window.addEventListener('ttConfigChanged', (e) => this.onTTConfigChanged(e.detail));

    console.log('[AnalysisUI] Event listeners registered');
  }

  /**
   * Set board manager
   */
  setBoardManager(boardManager) {
    this.boardManager = boardManager;

    // Initialize arrow overlay
    this.arrowOverlay = new ArrowOverlay();

    console.log('[AnalysisUI] Board manager set');
  }

  /**
   * Set analysis manager
   */
  setAnalysisManager(analysisManager) {
    this.analysisManager = analysisManager;

    // Set up callbacks
    analysisManager.callbacks.onProgress = (data) => this.updateProgress(data);
    analysisManager.callbacks.onComplete = (data) => this.updateComplete(data);
    analysisManager.callbacks.onError = (error) => this.showError(error);

    console.log('[AnalysisUI] Analysis manager set with callbacks');
  }

  /**
   * Handle move made event
   */
  onMoveMade() {
    // Clear arrow on new move
    if (this.arrowOverlay) {
      this.arrowOverlay.clearArrow();
    }

    // Optional: Auto-analyze after each move
    // Uncomment to enable auto-analysis
    // this.startAnalysis();
  }

  /**
   * Handle game reset event
   */
  onGameReset() {
    // Clear analysis display
    this.resetDisplay();

    // Clear arrow
    if (this.arrowOverlay) {
      this.arrowOverlay.clearArrow();
    }
  }

  /**
   * Start analysis of current position
   */
  startAnalysis() {
    if (!this.boardManager || !this.analysisManager) {
      console.error('[AnalysisUI] Missing board or analysis manager');
      return;
    }

    // Get current FEN
    const fen = this.boardManager.getFEN();

    // Analysis options
    const options = {
      depth: 10,
      timeLimit: 5000,
      ttConfig: this.getTTConfig()
    };

    console.log('[AnalysisUI] Starting analysis:', fen);

    // Start analysis
    this.analysisManager.analyze(fen, options);

    // Update button states
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;

    // Show analyzing state
    this.pvEl.innerHTML = '<span class="pv-placeholder">Analyzing...</span>';

    // Clear arrow
    if (this.arrowOverlay) {
      this.arrowOverlay.clearArrow();
    }
  }

  /**
   * Stop current analysis
   */
  stopAnalysis() {
    if (!this.analysisManager) return;

    console.log('[AnalysisUI] Stopping analysis');

    this.analysisManager.stop();

    // Update button states
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
  }

  /**
   * Update display with progress data
   */
  updateProgress(data) {
    // Update eval score
    const score = (data.score / 100).toFixed(2);
    const scoreText = score >= 0 ? `+${score}` : score;
    this.evalScoreEl.textContent = scoreText;

    // Update color class
    this.evalScoreEl.className = 'eval-score ' +
      (score > 0.5 ? 'positive' : score < -0.5 ? 'negative' : 'neutral');

    // Update depth
    const maxDepth = data.maxDepth || 10;
    this.searchDepthEl.textContent = `${data.depth}/${maxDepth}`;

    // Update NPS (format with k/M suffix)
    const nps = this.formatNPS(data.nps);
    this.nodesPerSecEl.textContent = nps;

    // Update PV
    if (data.pvSAN && data.pvSAN.length > 0) {
      this.pvEl.innerHTML = this.formatPV(data.pvSAN);
    } else if (data.pv && data.pv.length > 0) {
      this.pvEl.innerHTML = this.formatPV(data.pv);
    }

    // Update time
    const timeSeconds = (data.timeElapsed / 1000).toFixed(1);
    this.timeEl.textContent = `${timeSeconds}s`;
  }

  /**
   * Update display with completion data
   */
  updateComplete(data) {
    console.log('[AnalysisUI] Analysis complete:', data);

    // Update all fields
    this.updateProgress(data);

    // Update button states
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;

    // Draw arrow for best move
    if (data.bestMove) {
      this.drawBestMoveArrow(data.bestMove);
    }
  }

  /**
   * Draw arrow for best move
   */
  drawBestMoveArrow(move) {
    if (!this.arrowOverlay || !move) return;

    const from = squareToAlgebraic(move.from);
    const to = squareToAlgebraic(move.to);

    console.log('[AnalysisUI] Drawing arrow:', from, '->', to);

    this.arrowOverlay.drawArrow(from, to, '#4ec9b0');
  }

  /**
   * Format NPS with k/M suffix
   */
  formatNPS(nps) {
    if (!nps || nps === 0) return '0';

    if (nps >= 1000000) {
      return (nps / 1000000).toFixed(2) + 'M';
    } else if (nps >= 1000) {
      return (nps / 1000).toFixed(1) + 'k';
    } else {
      return nps.toString();
    }
  }

  /**
   * Format principal variation as move list
   */
  formatPV(pv) {
    if (!pv || pv.length === 0) {
      return '<span class="pv-placeholder">No variation</span>';
    }

    let formatted = '';
    for (let i = 0; i < pv.length; i++) {
      if (i % 2 === 0) {
        formatted += `${Math.floor(i / 2) + 1}. `;
      }
      formatted += pv[i] + ' ';
    }

    return formatted.trim();
  }

  /**
   * Get TT config from storage or defaults
   */
  getTTConfig() {
    // Try to get from storage manager
    if (window.chessStorageManager && window.chessStorageManager.cachedProfile) {
      const engineConfig = window.chessStorageManager.cachedProfile.engineConfig;
      if (engineConfig) {
        return engineConfig;
      }
    }

    // Try localStorage
    const savedSettings = localStorage.getItem('chessEngineSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('[AnalysisUI] Failed to parse saved settings:', e);
      }
    }

    // Defaults
    return {
      ttSizePower: 22,
      depthPriority: 2.0,
      agePriority: 1.5
    };
  }

  /**
   * Handle TT config change
   */
  onTTConfigChanged(newConfig) {
    console.log('[AnalysisUI] TT config changed:', newConfig);

    if (this.analysisManager) {
      this.analysisManager.configure(newConfig);
    }
  }

  /**
   * Show error message
   */
  showError(error) {
    console.error('[AnalysisUI] Error:', error);

    this.pvEl.innerHTML = `<span class="pv-placeholder" style="color: #f48771;">Error: ${error}</span>`;

    // Reset button states
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
  }

  /**
   * Reset display to initial state
   */
  resetDisplay() {
    this.evalScoreEl.textContent = '+0.00';
    this.evalScoreEl.className = 'eval-score neutral';
    this.searchDepthEl.textContent = '0/0';
    this.nodesPerSecEl.textContent = '0';
    this.pvEl.innerHTML = '<span class="pv-placeholder">Click "Analyze" to start</span>';
    this.timeEl.textContent = '0.0s';

    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
  }
}

// Singleton instance
let analysisUI = null;

/**
 * Get the singleton instance
 */
export function getAnalysisUI() {
  if (!analysisUI) {
    analysisUI = new AnalysisUI();
  }
  return analysisUI;
}

/**
 * Initialize and return the analysis UI
 */
export function initializeAnalysisUI() {
  return getAnalysisUI();
}
