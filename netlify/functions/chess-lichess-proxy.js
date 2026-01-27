// Lichess API Proxy
// Provides secure access to Lichess cloud analysis and opening database
// Protected: Requires Auth0 authentication

const { withAuth } = require('../lib/auth');

/**
 * Get best move from Lichess cloud analysis
 * @param {string} fen - Position in FEN notation
 * @param {number} multiPv - Number of principal variations (1-5)
 * @returns {Promise<object>} Analysis result with best moves
 */
async function getCloudEvaluation(fen, multiPv = 1) {
  const encodedFen = encodeURIComponent(fen);
  const url = `https://lichess.org/api/cloud-eval?fen=${encodedFen}&multiPv=${multiPv}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Lichess API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get opening information from Lichess database
 * @param {string} fen - Position in FEN notation
 * @returns {Promise<object>} Opening data with moves and statistics
 */
async function getOpening(fen) {
  const encodedFen = encodeURIComponent(fen);
  const url = `https://explorer.lichess.ovh/lichess?fen=${encodedFen}&ratings=1600,1800,2000,2200,2500&speeds=blitz,rapid,classical`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Lichess Explorer API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Main handler function
 * Proxies requests to Lichess API
 */
async function handler(event, context, user) {
  try {
    // Parse query parameters
    const params = event.queryStringParameters || {};
    const endpoint = params.endpoint || 'eval';
    const fen = params.fen;
    const multiPv = parseInt(params.multiPv || '1');
    const difficulty = parseInt(params.difficulty || '5');

    // Validate FEN parameter
    if (!fen) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'FEN parameter is required'
        })
      };
    }

    let result;

    // Route to appropriate Lichess API endpoint
    switch (endpoint) {
      case 'eval':
      case 'analysis':
        result = await getCloudEvaluation(fen, multiPv);

        // If difficulty is specified and result has moves, select move based on difficulty
        if (result.pvs && result.pvs.length > 0) {
          // Adjust move selection based on difficulty (1-10)
          // Lower difficulty = more likely to pick weaker moves
          const moveIndex = selectMoveByDifficulty(result.pvs, difficulty);
          result.selectedMove = result.pvs[moveIndex];
          result.difficulty = difficulty;
        }
        break;

      case 'opening':
        result = await getOpening(fen);
        break;

      default:
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
          },
          body: JSON.stringify({
            error: 'Bad Request',
            message: `Unknown endpoint: ${endpoint}. Use 'eval', 'analysis', or 'opening'`
          })
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      },
      body: JSON.stringify({
        success: true,
        endpoint: endpoint,
        data: result,
        user: user.email,
        timestamp: new Date().toISOString()
      })
    };

  } catch (err) {
    console.error('Lichess proxy error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        error: 'Server Error',
        message: err.message,
        details: err.stack
      })
    };
  }
}

/**
 * Select move based on difficulty level
 * @param {array} pvs - Array of principal variations from Lichess
 * @param {number} difficulty - Difficulty level 1-10
 * @returns {number} Index of selected move
 */
function selectMoveByDifficulty(pvs, difficulty) {
  if (!pvs || pvs.length === 0) return 0;

  // Difficulty 10: Always pick best move
  if (difficulty >= 10) return 0;

  // Difficulty 1: More random, can pick any move
  // Difficulty 5: Sometimes picks 2nd or 3rd best
  // Difficulty 8-9: Mostly picks best, occasionally 2nd best

  const maxPvIndex = Math.min(pvs.length - 1, 4); // Consider up to 5 moves

  // Calculate probability distribution based on difficulty
  // Higher difficulty = stronger preference for best move
  const randomValue = Math.random();

  if (difficulty >= 8) {
    // 90% best, 10% second best
    return randomValue < 0.9 ? 0 : Math.min(1, maxPvIndex);
  } else if (difficulty >= 6) {
    // 70% best, 20% second, 10% third
    if (randomValue < 0.7) return 0;
    if (randomValue < 0.9) return Math.min(1, maxPvIndex);
    return Math.min(2, maxPvIndex);
  } else if (difficulty >= 4) {
    // 50% best, 30% second, 15% third, 5% worse
    if (randomValue < 0.5) return 0;
    if (randomValue < 0.8) return Math.min(1, maxPvIndex);
    if (randomValue < 0.95) return Math.min(2, maxPvIndex);
    return Math.min(3, maxPvIndex);
  } else if (difficulty >= 2) {
    // More evenly distributed
    if (randomValue < 0.3) return 0;
    if (randomValue < 0.55) return Math.min(1, maxPvIndex);
    if (randomValue < 0.75) return Math.min(2, maxPvIndex);
    if (randomValue < 0.9) return Math.min(3, maxPvIndex);
    return Math.min(4, maxPvIndex);
  } else {
    // Difficulty 1: Very random
    return Math.floor(Math.random() * Math.min(pvs.length, 5));
  }
}

// Export with auth middleware - all authenticated users can access
module.exports = {
  handler: withAuth(handler, { roles: [] }) // Empty roles = any authenticated user
};
