/**
 * Lichess API Client
 *
 * Frontend wrapper for calling the Lichess proxy Netlify function
 * Handles authentication, caching, and error handling
 */

class LichessClient {
  constructor() {
    this.baseUrl = '/.netlify/functions/chess-lichess-proxy';
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour in milliseconds
  }

  /**
   * Get auth token from Auth0
   * @returns {Promise<string>} Access token
   */
  async getAuthToken() {
    // Access the global auth0Client if available
    if (typeof auth0Client !== 'undefined' && auth0Client) {
      try {
        const token = await auth0Client.getTokenSilently();
        return token;
      } catch (error) {
        console.error('Error getting auth token:', error);
        throw new Error('Authentication required. Please log in.');
      }
    }
    throw new Error('Auth0 client not initialized');
  }

  /**
   * Make request to Lichess proxy
   * @param {string} endpoint - API endpoint ('eval', 'opening')
   * @param {object} params - Query parameters
   * @returns {Promise<object>} API response data
   */
  async request(endpoint, params = {}) {
    // Build URL with query parameters
    const url = new URL(this.baseUrl, window.location.origin);
    url.searchParams.append('endpoint', endpoint);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    // Check cache
    const cacheKey = url.toString();
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('Using cached result for:', endpoint);
      return cached.data;
    }

    // Get auth token
    const token = await this.getAuthToken();

    // Make request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    const result = await response.json();

    // Cache successful response
    this.cache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });

    return result.data;
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
    try {
      const result = await this.request('analysis', {
        fen: fen,
        multiPv: multiPv
      });

      return {
        fen: result.fen,
        depth: result.depth,
        pvs: result.pvs,
        knodes: result.knodes
      };
    } catch (error) {
      console.error('Error getting analysis:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
const lichessClient = new LichessClient();
export default lichessClient;
