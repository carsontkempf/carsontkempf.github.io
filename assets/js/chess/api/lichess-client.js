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
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour in milliseconds
    this.sdk = null;
  }

  /**
   * Initialize the Secrets SDK
   */
  initSDK() {
    if (this.sdk) return this.sdk;

    if (typeof SecretsSDK === 'undefined') {
      console.warn('[ENGINE-DIAGNOSTIC] [SDK] SecretsSDK not found. Falling back to direct fetch (might fail CORS/Auth).');
      return null;
    }

    // Initialize in zero-config mode (uses Origin header for auth)
    const baseUrl = window.learnWorkerConfig ? window.learnWorkerConfig.baseUrl : 'https://learn-secrets-ydxithfz95iajlqf.carsontkempf.workers.dev';
    
    this.sdk = new SecretsSDK({
      baseUrl: baseUrl,
      timeout: 30000
    });

    console.log('[ENGINE-DIAGNOSTIC] [SDK] SecretsSDK initialized (zero-config mode)');
    return this.sdk;
  }

  /**
   * Make request to Lichess proxy via SDK or fetch
   * @param {string} endpoint - API endpoint ('eval', 'opening')
   * @param {object} params - Query parameters
   * @returns {Promise<object>} API response data
   */
  async request(endpoint, params = {}) {
    console.log('[ENGINE-DIAGNOSTIC] [NETWORK-START] Lichess API Request:', endpoint);
    
    const sdk = this.initSDK();
    
    // Build path with query params
    const queryParams = new URLSearchParams();
    queryParams.append('endpoint', endpoint);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const path = `/proxy/lichess?${queryParams.toString()}`;
    const cacheKey = path;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('[ENGINE-DIAGNOSTIC] [NETWORK-CACHE-HIT] Using cached result');
      return cached.data;
    }

    const startTime = performance.now();

    try {
      let data;
      
      if (sdk) {
        console.log('[ENGINE-DIAGNOSTIC] [NETWORK-SDK] Fetching via SecretsSDK:', path);
        // The SDK handles the base URL and proxy logic
        const response = await sdk.get('lichess', path);
        
        // Handle nesting: sdk.get returns the proxy's JSON, which has its own .data property
        if (response && response.data) {
          data = response.data;
        } else {
          data = response; // Fallback if not nested
        }
      } else {
        // Fallback for when SDK isn't loaded (mostly for development/emergencies)
        const baseUrl = window.learnWorkerConfig ? window.learnWorkerConfig.baseUrl : 'https://learn-secrets-ydxithfz95iajlqf.carsontkempf.workers.dev';
        const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
        console.log('[ENGINE-DIAGNOSTIC] [NETWORK-FETCH] SDK missing, fetching directly:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Direct fetch failed: ${response.status}`);
        const json = await response.json();
        data = json.data;
      }

      const endTime = performance.now();
      console.log('[ENGINE-DIAGNOSTIC] [NETWORK-SUCCESS] Received in', Math.round(endTime - startTime), 'ms');

      // Cache successful response
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });

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
      const data = await this.request('eval', { // Use 'eval' endpoint for position analysis
        fen: fen,
        multiPv: multiPv
      });

      return data;
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

// Create global singleton instance
window.lichessClient = new LichessClient();
