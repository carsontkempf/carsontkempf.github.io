/**
 * ImportExportManager - FEN import and PGN export functionality
 * Handles FEN validation, position loading, and PGN file export
 * Part of Carson's Chess Engine
 * @module chess/ui/import-export-manager
 */

import { validateFEN } from '../utils/fen-validator.js';
import { generatePGN } from '../utils/pgn-generator.js';
import { generateFEN } from '../engine/board.js';

/**
 * ImportExportManager class
 * Manages FEN import, PGN export, and clipboard operations
 */
export class ImportExportManager {
  constructor() {
    this.boardManager = null;
    this.gameManager = null;

    this.setupUI();
    console.log('[ImportExportManager] Initialized');
  }

  /**
   * Set reference to BoardManager
   * @param {BoardManager} boardManager - BoardManager instance
   */
  setBoardManager(boardManager) {
    this.boardManager = boardManager;
  }

  /**
   * Set reference to GameManager
   * @param {GameManager} gameManager - GameManager instance
   */
  setGameManager(gameManager) {
    this.gameManager = gameManager;
  }

  /**
   * Setup UI event listeners
   */
  setupUI() {
    document.addEventListener('DOMContentLoaded', () => {
      // FEN Import button
      const importBtn = document.getElementById('import-fen-btn');
      if (importBtn) {
        importBtn.addEventListener('click', () => this.handleFENImport());
      }

      // PGN Export button
      const exportBtn = document.getElementById('export-pgn-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => this.handlePGNExport());
      }

      // Copy FEN button
      const copyBtn = document.getElementById('copy-fen-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => this.handleFENCopy());
      }

      // FEN input - allow Enter key to trigger import
      const fenInput = document.getElementById('fen-input');
      if (fenInput) {
        fenInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.handleFENImport();
          }
        });
      }
    });
  }

  /**
   * Handle FEN import
   */
  async handleFENImport() {
    const fenInput = document.getElementById('fen-input');
    if (!fenInput) {
      console.error('[ImportExportManager] FEN input not found');
      return;
    }

    const fen = fenInput.value.trim();

    // Clear previous errors
    this.clearImportError();

    // Validate FEN
    const validation = validateFEN(fen);
    if (!validation.valid) {
      this.showImportError(validation.error);
      return;
    }

    // Confirm with user if game in progress
    if (this.boardManager && this.boardManager.getMoveHistory().length > 0) {
      const confirmed = confirm('Load new position? Current game will be lost.');
      if (!confirmed) {
        return;
      }
    }

    try {
      // Load FEN
      if (this.boardManager) {
        this.boardManager.loadFEN(fen);

        // Clear input and show success
        fenInput.value = '';
        this.showImportSuccess();

        console.log('[ImportExportManager] FEN loaded successfully');
      } else {
        throw new Error('BoardManager not set');
      }
    } catch (error) {
      console.error('[ImportExportManager] FEN import failed:', error);
      this.showImportError('Failed to load position: ' + error.message);
    }
  }

  /**
   * Handle PGN export
   */
  handlePGNExport() {
    if (!this.boardManager) {
      alert('Board not initialized');
      return;
    }

    const moveHistory = this.boardManager.getMoveHistory();

    // Check if game has moves
    if (moveHistory.length === 0) {
      alert('No moves to export. Play some moves first!');
      return;
    }

    try {
      // Get game data
      let gameData;
      if (this.gameManager) {
        gameData = this.gameManager.serializeGameState();
      } else {
        // Fallback if GameManager not available
        gameData = {
          pgn: generatePGN(moveHistory, {
            white: 'Player',
            black: 'Engine',
            result: '*'
          })
        };
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `chess-game-${timestamp}.pgn`;

      // Download PGN file
      this.downloadFile(gameData.pgn, filename, 'text/plain');

      console.log('[ImportExportManager] PGN exported:', filename);
    } catch (error) {
      console.error('[ImportExportManager] PGN export failed:', error);
      alert('Failed to export PGN: ' + error.message);
    }
  }

  /**
   * Handle FEN copy to clipboard
   */
  async handleFENCopy() {
    if (!this.boardManager) {
      alert('Board not initialized');
      return;
    }

    try {
      const fen = generateFEN(this.boardManager.engineBoard);

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fen);
        this.showCopySuccess();
      } else {
        // Fallback for older browsers
        this.copyToClipboardFallback(fen);
        this.showCopySuccess();
      }

      console.log('[ImportExportManager] FEN copied to clipboard');
    } catch (error) {
      console.error('[ImportExportManager] Copy failed:', error);
      alert('Failed to copy FEN to clipboard: ' + error.message);
    }
  }

  /**
   * Download file (trigger browser download)
   * @param {string} content - File content
   * @param {string} filename - Filename
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy to clipboard (fallback method for older browsers)
   * @param {string} text - Text to copy
   */
  copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  /**
   * Show import error message
   * @param {string} message - Error message
   */
  showImportError(message) {
    const errorDiv = document.getElementById('fen-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  /**
   * Clear import error message
   */
  clearImportError() {
    const errorDiv = document.getElementById('fen-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    }
  }

  /**
   * Show import success message
   */
  showImportSuccess() {
    const fenInput = document.getElementById('fen-input');
    if (fenInput) {
      const originalPlaceholder = fenInput.placeholder;
      fenInput.placeholder = 'Position loaded successfully!';
      setTimeout(() => {
        fenInput.placeholder = originalPlaceholder;
      }, 2000);
    }
  }

  /**
   * Show copy success notification
   */
  showCopySuccess() {
    const copyBtn = document.getElementById('copy-fen-btn');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.disabled = false;
      }, 2000);
    }
  }
}

// Singleton instance
let importExportManagerInstance = null;

/**
 * Get ImportExportManager singleton instance
 * @returns {ImportExportManager} ImportExportManager instance
 */
export function getImportExportManager() {
  if (!importExportManagerInstance) {
    importExportManagerInstance = new ImportExportManager();
  }
  return importExportManagerInstance;
}
