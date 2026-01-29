/**
 * Lichess API Client
 *
 * Frontend wrapper for calling the Lichess proxy Netlify function
 * Handles authentication, caching, and error handling
 */

// Netlify Functions API Base URLs (primary and fallback)
const NETLIFY_API_BASES_LICHESS = [
    'https://carsontkempf.netlify.app/.netlify/functions',
    'https://resonant-cheesecake-638dd1.netlify.app/.netlify/functions'
];
let currentApiBaseIndexLichess = 0;

// Helper function to make fetch requests with automatic fallback on CORS errors
async function fetchWithFallbackLichess(endpoint, options = {}) {
    // Handle query strings - split on ? to separate function name from params
    const [functionName, queryString] = endpoint.includes('?')
        ? endpoint.split('?')
        : [endpoint, ''];

    for (let i = currentApiBaseIndexLichess; i < NETLIFY_API_BASES_LICHESS.length; i++) {
        const baseUrl = NETLIFY_API_BASES_LICHESS[i];
        const url = queryString
            ? `${baseUrl}/${functionName}?${queryString}`
            : `${baseUrl}/${functionName}`;

        console.log(`[LICHESS-FALLBACK] Attempt ${i + 1}/${NETLIFY_API_BASES_LICHESS.length}: ${url}`);

        try {
            const response = await fetch(url, options);

            // If successful, update current index for future calls
            if (response.ok || response.status === 401 || response.status === 403) {
                if (i !== currentApiBaseIndexLichess) {
                    console.log(`[LICHESS-FALLBACK] Switched to fallback URL: ${baseUrl}`);
                    currentApiBaseIndexLichess = i;
                }
                return response;
            }

            console.log(`[LICHESS-FALLBACK] Response status ${response.status}, trying next URL...`);
        } catch (error) {
            console.error(`[LICHESS-FALLBACK] Error with ${baseUrl}:`, error.message);

            // Check if it's a CORS error
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                console.log(`[LICHESS-FALLBACK] CORS error detected, trying next URL...`);
                continue;
            }

            // If it's not a CORS error and we're on the last URL, throw
            if (i === NETLIFY_API_BASES_LICHESS.length - 1) {
                throw error;
            }
        }
    }

    throw new Error('All Netlify API endpoints failed');
}

class LichessClient {
  constructor() {
    this.baseUrl = 'chess-lichess-proxy'; // Just the function name, fetchWithFallback handles the base URL
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour in milliseconds
  }

  /**
   * Get auth token from Auth0
   * @returns {Promise<string|null>} Access token or null if not available
   */
  async getAuthToken() {
    console.log('[LICHESS] ========== AUTH CHECK ==========');
    console.log('[LICHESS] auth0Client exists:', typeof auth0Client !== 'undefined');
    console.log('[LICHESS] auth0Client is null:', typeof auth0Client !== 'undefined' && auth0Client === null);
    console.log('[LICHESS] auth0Client value:', typeof auth0Client !== 'undefined' ? auth0Client : 'undefined');

    // Access the global auth0Client if available
    if (typeof auth0Client !== 'undefined' && auth0Client !== null) {
      try {
        console.log('[LICHESS] Attempting to get token from Auth0...');
        const token = await auth0Client.getTokenSilently();
        console.log('[LICHESS] Token obtained successfully');
        console.log('[LICHESS] ========== AUTH SUCCESS ==========');
        return token;
      } catch (error) {
        console.warn('[LICHESS] Error getting auth token:', error);
        console.log('[LICHESS] ========== AUTH FAILED ==========');
        return null; // Return null instead of throwing
      }
    }

    console.log('[LICHESS] Auth0 client not available - using unauthenticated mode');
    console.log('[LICHESS] ========== AUTH NOT AVAILABLE ==========');
    return null; // Return null instead of throwing
  }

  /**
   * Make request to Lichess proxy
   * @param {string} endpoint - API endpoint ('eval', 'opening')
   * @param {object} params - Query parameters
   * @returns {Promise<object>} API response data
   */
  async request(endpoint, params = {}) {
    console.log('[LICHESS] ========== API REQUEST ==========');
    console.log('[LICHESS] Endpoint:', endpoint);
    console.log('[LICHESS] Params:', params);

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('endpoint', endpoint);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const functionNameWithQuery = `${this.baseUrl}?${queryString}`;

    console.log('[LICHESS] Function with query:', functionNameWithQuery);

    // Check cache
    const cacheKey = functionNameWithQuery;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('[LICHESS] Using cached result for:', endpoint);
      console.log('[LICHESS] ========== API CACHE HIT ==========');
      return cached.data;
    }

    // Get auth token
    const token = await this.getAuthToken();

    // If no token available, throw specific error that engine-manager can catch
    if (!token) {
      console.log('[LICHESS] No auth token - cannot use Lichess API');
      console.log('[LICHESS] ========== API AUTH REQUIRED ==========');
      throw new Error('LICHESS_AUTH_REQUIRED');
    }

    console.log('[LICHESS] Making authenticated request...');

    // Make request using fetchWithFallback
    const response = await fetchWithFallbackLichess(functionNameWithQuery, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('[LICHESS] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      console.error('[LICHESS] Request failed:', error);
      console.log('[LICHESS] ========== API ERROR ==========');
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('[LICHESS] Response received:', result);

    // Cache successful response
    this.cache.set(cacheKey, {
      data: result.data,
      timestamp: Date.now()
    });

    console.log('[LICHESS] ========== API SUCCESS ==========');
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
