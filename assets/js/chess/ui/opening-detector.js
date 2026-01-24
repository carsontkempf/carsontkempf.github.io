/**
 * Opening Detector Module
 * Tracks current opening and displays name/ECO code
 * Part of Carson's Chess UI
 * @module chess/ui/opening-detector
 */

import { getOpeningBook } from '../engine/opening-book.js';

/**
 * Opening Detector Class
 * Manages opening detection and UI updates
 */
class OpeningDetector {
  constructor() {
    this.currentOpening = null;
    this.moveHistory = [];
    this.initialized = false;
  }

  /**
   * Initialize detector with DOM elements
   * @returns {boolean} True if initialized successfully
   */
  initialize() {
    // Check if DOM elements exist
    const openingNameEl = document.getElementById('opening-name');
    const ecoCodeEl = document.getElementById('eco-code');

    if (!openingNameEl || !ecoCodeEl) {
      console.warn('[OPENING] DOM elements not found, detector not initialized');
      return false;
    }

    this.initialized = true;
    console.log('[OPENING] Detector initialized');
    return true;
  }

  /**
   * Update after each move
   * @param {Board} board - Current board position
   */
  update(board) {
    if (!this.initialized) {
      this.initialize();
    }

    const book = getOpeningBook();
    if (!book || !book.loaded) {
      console.warn('[OPENING] Book not loaded');
      return;
    }

    const opening = book.getOpeningName(board);

    if (opening) {
      // Found opening in book
      this.currentOpening = opening;
      this.updateUI(opening);
      console.log(`[OPENING] Detected: ${opening.eco} - ${opening.name}`);
    }
    // If not found, keep the last known opening displayed
  }

  /**
   * Update UI display
   * @param {Object} opening - {eco, name}
   */
  updateUI(opening) {
    const openingNameEl = document.getElementById('opening-name');
    const ecoCodeEl = document.getElementById('eco-code');

    if (openingNameEl) {
      openingNameEl.textContent = opening.name;
    }

    if (ecoCodeEl) {
      ecoCodeEl.textContent = opening.eco;
    }
  }

  /**
   * Get current opening
   * @returns {Object|null} Current opening {eco, name} or null
   */
  getCurrent() {
    return this.currentOpening;
  }

  /**
   * Reset detector to starting position
   */
  reset() {
    this.currentOpening = null;
    this.moveHistory = [];

    const openingNameEl = document.getElementById('opening-name');
    const ecoCodeEl = document.getElementById('eco-code');

    if (openingNameEl) {
      openingNameEl.textContent = 'Starting Position';
    }

    if (ecoCodeEl) {
      ecoCodeEl.textContent = '—';
    }

    console.log('[OPENING] Detector reset');
  }
}

// Create singleton instance
const detector = new OpeningDetector();

// Export the singleton
export default detector;

// Also export for named imports
export { detector as openingDetector };
