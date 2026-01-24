/**
 * GameManager - Game state serialization and save/load functionality
 * Handles automatic game saving, manual saves, and game restoration
 * Part of Carson's Chess Engine
 * @module chess/ui/game-manager
 */

import { generatePGN, parseResult } from '../utils/pgn-generator.js';
import { generateFEN } from '../engine/board.js';

/**
 * GameManager class
 * Manages game state, serialization, and persistence
 */
export class GameManager {
  constructor() {
    this.boardManager = null;
    this.controlsManager = null;
    this.currentGameId = null;
    this.gameStartTime = null;
    this.autoSaveEnabled = true;
    this.lastSaveTimestamp = null;
    this.movesSinceLastSave = 0;
    this.gameResult = null; // "win", "loss", "draw", "abandoned", null
    this.userColor = 'white'; // User plays white by default
    this.opponentName = 'Engine';

    this.setupEventListeners();
    console.log('[GameManager] Initialized');
  }

  /**
   * Set reference to BoardManager
   * @param {BoardManager} boardManager - BoardManager instance
   */
  setBoardManager(boardManager) {
    this.boardManager = boardManager;
  }

  /**
   * Set reference to ControlsManager
   * @param {ControlsManager} controlsManager - ControlsManager instance
   */
  setControlsManager(controlsManager) {
    this.controlsManager = controlsManager;
  }

  /**
   * Setup event listeners for game events
   */
  setupEventListeners() {
    // Listen for game start
    window.addEventListener('chessGameReset', () => {
      this.startNewGame();
    });

    // Listen for moves
    window.addEventListener('chessMoveMade', (event) => {
      this.handleMoveMade(event.detail);
    });

    // Listen for game end
    window.addEventListener('chessGameEnd', (event) => {
      this.handleGameEnd(event.detail);
    });
  }

  /**
   * Start tracking a new game
   */
  startNewGame() {
    this.currentGameId = null;
    this.gameStartTime = new Date();
    this.lastSaveTimestamp = null;
    this.movesSinceLastSave = 0;
    this.gameResult = null;
    console.log('[GameManager] New game started at', this.gameStartTime);
  }

  /**
   * Handle move made event
   * @param {Object} detail - Event detail with move information
   */
  handleMoveMade(detail) {
    this.movesSinceLastSave++;

    // Auto-save every 5 moves (configurable)
    if (this.autoSaveEnabled && this.movesSinceLastSave >= 5) {
      this.autoSaveGame();
    }
  }

  /**
   * Handle game end event
   * @param {Object} detail - Event detail with result information
   */
  handleGameEnd(detail) {
    this.gameResult = detail.result; // "win", "loss", "draw", "resigned"

    // Auto-save completed game if authenticated
    if (this.autoSaveEnabled && window.authService && window.authService.isAuthenticated) {
      this.autoSaveGame(true); // Force save on game end
    }
  }

  /**
   * Serialize current game state to JSON
   * @returns {Object} Game data object
   */
  serializeGameState() {
    if (!this.boardManager) {
      throw new Error('BoardManager not set');
    }

    const moveHistory = this.boardManager.getMoveHistory();
    const currentFEN = generateFEN(this.boardManager.engineBoard);
    const gameEndTime = new Date();
    const duration = this.gameStartTime
      ? Math.floor((gameEndTime - this.gameStartTime) / 1000)
      : 0;

    // Get opening information if available
    let opening = { eco: null, name: null };
    if (window.openingDetector) {
      const openingInfo = window.openingDetector.getCurrentOpening();
      if (openingInfo) {
        opening = openingInfo;
      }
    }

    // Determine result
    const result = this.gameResult || 'abandoned';
    const pgnResult = parseResult(result, this.userColor);

    // Generate PGN
    const pgnMetadata = {
      white: this.userColor === 'white' ? 'Player' : this.opponentName,
      black: this.userColor === 'black' ? 'Player' : this.opponentName,
      result: pgnResult,
      date: this.formatDateForPGN(this.gameStartTime),
      eco: opening.eco,
      opening: opening.name,
      plyCount: moveHistory.length
    };

    const pgn = generatePGN(moveHistory, pgnMetadata);

    // Build game data object
    const gameData = {
      timestamp: this.gameStartTime.toISOString(),
      opponent: this.opponentName,
      result: result,
      finalPosition: currentFEN,
      pgn: pgn,
      duration: duration,
      userColor: this.userColor,
      opening: opening,
      moveCount: moveHistory.length,
      metadata: {
        startTime: this.gameStartTime.toISOString(),
        endTime: gameEndTime.toISOString(),
        totalMoves: moveHistory.length
      }
    };

    return gameData;
  }

  /**
   * Auto-save game (debounced)
   * @param {boolean} force - Force save even if not enough moves
   */
  async autoSaveGame(force = false) {
    // Check if authenticated
    if (!window.authService || !window.authService.isAuthenticated) {
      console.log('[GameManager] Auto-save skipped: not authenticated');
      return;
    }

    // Check if should save
    if (!force && this.movesSinceLastSave < 5) {
      console.log('[GameManager] Auto-save skipped: not enough moves');
      return;
    }

    // Check if game has moves
    if (!this.boardManager || this.boardManager.getMoveHistory().length === 0) {
      console.log('[GameManager] Auto-save skipped: no moves');
      return;
    }

    try {
      const gameData = this.serializeGameState();

      // Save via StorageManager
      if (window.chessStorageManager) {
        await window.chessStorageManager.saveGame(gameData);
        this.lastSaveTimestamp = new Date();
        this.movesSinceLastSave = 0;
        console.log('[GameManager] Auto-saved game');
      }
    } catch (error) {
      console.error('[GameManager] Auto-save failed:', error);
    }
  }

  /**
   * Manually save game
   * @returns {Promise<void>}
   */
  async manualSaveGame() {
    // Check if authenticated
    if (!window.authService || !window.authService.isAuthenticated) {
      throw new Error('Must be authenticated to save games');
    }

    // Check if game has moves
    if (!this.boardManager || this.boardManager.getMoveHistory().length === 0) {
      throw new Error('No moves to save');
    }

    try {
      const gameData = this.serializeGameState();

      // Save via StorageManager
      if (window.chessStorageManager) {
        await window.chessStorageManager.saveGame(gameData);
        this.lastSaveTimestamp = new Date();
        this.movesSinceLastSave = 0;
        console.log('[GameManager] Manually saved game');
      } else {
        throw new Error('StorageManager not available');
      }
    } catch (error) {
      console.error('[GameManager] Manual save failed:', error);
      throw error;
    }
  }

  /**
   * Load saved games list
   * @returns {Promise<Array>} Array of game summaries
   */
  async loadSavedGames() {
    if (!window.authService || !window.authService.isAuthenticated) {
      throw new Error('Must be authenticated to load games');
    }

    if (!window.chessStorageManager) {
      throw new Error('StorageManager not available');
    }

    try {
      const games = await window.chessStorageManager.loadUserGames();
      return games;
    } catch (error) {
      console.error('[GameManager] Failed to load games:', error);
      throw error;
    }
  }

  /**
   * Restore a saved game to the board
   * @param {Object} gameData - Game object from database
   */
  restoreGame(gameData) {
    if (!this.boardManager) {
      throw new Error('BoardManager not set');
    }

    // Confirm if current game in progress
    if (this.boardManager.getMoveHistory().length > 0) {
      const confirmed = confirm('Load saved game? Current game will be lost.');
      if (!confirmed) return;
    }

    try {
      // Load final position
      this.boardManager.loadFEN(gameData.finalPosition);

      // Update metadata
      this.currentGameId = gameData.id;
      this.gameResult = gameData.result;
      this.opponentName = gameData.opponent || 'Engine';
      this.userColor = gameData.userColor || 'white';

      // Emit event
      window.dispatchEvent(new CustomEvent('chessGameLoaded', {
        detail: { gameData }
      }));

      console.log('[GameManager] Game loaded:', gameData.id || 'unknown');
    } catch (error) {
      console.error('[GameManager] Failed to restore game:', error);
      throw error;
    }
  }

  /**
   * Get game metadata
   * @returns {Object} Game metadata
   */
  getGameMetadata() {
    return {
      startTime: this.gameStartTime,
      result: this.gameResult,
      userColor: this.userColor,
      opponent: this.opponentName,
      duration: this.getGameDuration()
    };
  }

  /**
   * Get game duration in seconds
   * @returns {number} Duration in seconds
   */
  getGameDuration() {
    if (!this.gameStartTime) return 0;
    return Math.floor((new Date() - this.gameStartTime) / 1000);
  }

  /**
   * Format date for PGN (YYYY.MM.DD)
   * @param {Date} date - JavaScript Date object
   * @returns {string} Formatted date string
   */
  formatDateForPGN(date) {
    if (!date) return '????.??.??';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  /**
   * Set user color
   * @param {string} color - "white" or "black"
   */
  setUserColor(color) {
    if (color !== 'white' && color !== 'black') {
      throw new Error('Invalid color: must be "white" or "black"');
    }
    this.userColor = color;
  }

  /**
   * Set opponent name
   * @param {string} name - Opponent name
   */
  setOpponentName(name) {
    this.opponentName = name || 'Engine';
  }
}

// Singleton instance
let gameManagerInstance = null;

/**
 * Get GameManager singleton instance
 * @returns {GameManager} GameManager instance
 */
export function getGameManager() {
  if (!gameManagerInstance) {
    gameManagerInstance = new GameManager();
  }
  return gameManagerInstance;
}
