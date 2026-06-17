/**
 * Lichess API Client
 *
 * Calls Lichess public APIs directly from the browser.
 * No proxy needed — lichess.org and explorer.lichess.ovh both have CORS enabled.
 */

const LICHESS_EVAL_URL = 'https://lichess.org/api/cloud-eval';
const LICHESS_EXPLORER_URL = 'https://explorer.lichess.ovh/lichess';

function selectMoveByDifficulty(pvs, difficulty) {
    if (!pvs || pvs.length === 0) return 0;
    if (difficulty >= 10) return 0;
    const maxPvIndex = Math.min(pvs.length - 1, 4);
    const r = Math.random();
    if (difficulty >= 8) return r < 0.9 ? 0 : Math.min(1, maxPvIndex);
    if (difficulty >= 6) { if (r < 0.7) return 0; if (r < 0.9) return Math.min(1, maxPvIndex); return Math.min(2, maxPvIndex); }
    if (difficulty >= 4) { if (r < 0.5) return 0; if (r < 0.8) return Math.min(1, maxPvIndex); if (r < 0.95) return Math.min(2, maxPvIndex); return Math.min(3, maxPvIndex); }
    if (difficulty >= 2) { if (r < 0.3) return 0; if (r < 0.55) return Math.min(1, maxPvIndex); if (r < 0.75) return Math.min(2, maxPvIndex); if (r < 0.9) return Math.min(3, maxPvIndex); return Math.min(4, maxPvIndex); }
    return Math.floor(Math.random() * Math.min(pvs.length, 5));
}

class LichessClient {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 3600000;
  }

  /**
   * Make request directly to Lichess public APIs (CORS-enabled, no auth required)
   * @param {string} endpoint - 'eval' or 'opening'
   * @param {object} params - Query parameters
   */
  async request(endpoint, params = {}) {
    console.log('[ENGINE-DIAGNOSTIC] [NETWORK-START] Lichess API Request:', endpoint);

    const cacheKey = endpoint + '?' + JSON.stringify(params);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('[ENGINE-DIAGNOSTIC] [NETWORK-CACHE-HIT] age=' + Math.round((Date.now() - cached.timestamp) / 1000) + 's');
      return cached.data;
    }

    const startTime = performance.now();
    let url, response, data;

    try {
      if (endpoint === 'opening') {
        const fen = params.fen;
        if (!fen) throw new Error('FEN is required for opening lookup');
        url = `${LICHESS_EXPLORER_URL}?fen=${encodeURIComponent(fen)}&ratings=1600,1800,2000,2200,2500&speeds=blitz,rapid,classical`;
        response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (response.status === 404) {
          console.warn('[ENGINE-DIAGNOSTIC] [NETWORK-MISS] Opening not found in Lichess explorer');
          return null;
        }
        if (!response.ok) throw new Error(`Lichess Explorer API error: ${response.status}`);
        data = await response.json();
      } else {
        // eval or analysis
        const fen = params.fen;
        if (!fen) throw new Error('FEN is required for evaluation');
        const multiPv = params.multiPv || 1;
        url = `${LICHESS_EVAL_URL}?fen=${encodeURIComponent(fen)}&multiPv=${multiPv}`;
        response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (response.status === 404) {
          console.warn('[ENGINE-DIAGNOSTIC] [NETWORK-MISS] Position not in Lichess cloud database');
          return null;
        }
        if (!response.ok) throw new Error(`Lichess cloud-eval API error: ${response.status}`);
        data = await response.json();
        // Apply difficulty-based move selection
        if (data.pvs && data.pvs.length > 0 && params.difficulty) {
          const idx = selectMoveByDifficulty(data.pvs, parseInt(params.difficulty));
          data.selectedMove = data.pvs[idx];
          data.difficulty = parseInt(params.difficulty);
        }
      }

      console.log('[ENGINE-DIAGNOSTIC] [NETWORK-SUCCESS] Received in', Math.round(performance.now() - startTime), 'ms');
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('[ENGINE-DIAGNOSTIC] [NETWORK-ERROR]:', error.message);
      throw error;
    }
  }

  /**
   * Get best move analysis for a position
   * @param {string} fen - Position in FEN notation
   * @param {number} difficulty - Difficulty level 1-10
   * @param {number} multiPv - Number of variations (1-5)
   * @returns {Promise<object>} Analysis with best move
   */
  async getBestMove(fen, difficulty = 5, multiPv = 1) {
    try {
      const result = await this.request('eval', {
        fen: fen,
        difficulty: difficulty,
        multiPv: multiPv
      });

      if (!result) return null;

      // Extract move from result
      if (result.selectedMove && result.selectedMove.moves) {
        const uciMove = result.selectedMove.moves.split(' ')[0];
        return {
          uci: uciMove,
          from: uciMove.substring(0, 2),
          to: uciMove.substring(2, 4),
          promotion: uciMove.length > 4 ? uciMove.charAt(4) : undefined,
          evaluation: result.selectedMove.cp || result.selectedMove.mate,
          depth: result.depth,
          pvs: result.pvs,
          difficulty: result.difficulty
        };
      }

      // Fallback: return first PV if available
      if (result.pvs && result.pvs.length > 0 && result.pvs[0].moves) {
        const uciMove = result.pvs[0].moves.split(' ')[0];
        return {
          uci: uciMove,
          from: uciMove.substring(0, 2),
          to: uciMove.substring(2, 4),
          promotion: uciMove.length > 4 ? uciMove.charAt(4) : undefined,
          evaluation: result.pvs[0].cp || result.pvs[0].mate,
          depth: result.depth,
          pvs: result.pvs
        };
      }

      throw new Error('No moves found in analysis result');
    } catch (error) {
      console.error('Error getting best move:', error);
      throw error;
    }
  }

  /**
   * Get opening information for a position
   * @param {string} fen - Position in FEN notation
   * @returns {Promise<object>} Opening data with statistics
   */
  async getOpening(fen) {
    try {
      const result = await this.request('opening', { fen: fen });
      return {
        opening: result.opening,
        moves: result.moves || [],
        white: result.white || 0,
        draws: result.draws || 0,
        black: result.black || 0,
        topGames: result.topGames || []
      };
    } catch (error) {
      console.error('Error getting opening:', error);
      throw error;
    }
  }

  /**
   * Get full position analysis
   * @param {string} fen - Position in FEN notation
   * @param {number} multiPv - Number of variations (1-5)
   * @returns {Promise<object>} Full analysis with multiple lines
   */
  async getAnalysis(fen, multiPv = 3) {
    const data = await this.request('eval', {
      fen: fen,
      multiPv: multiPv
    });
    return data; // null when position not in Lichess DB
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create global singleton instance
window.lichessClient = new LichessClient();
