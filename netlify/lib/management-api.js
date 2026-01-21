// Auth0 Management API helper with token caching
// Uses Machine-to-Machine (M2M) credentials to access Auth0 Management API

let cachedToken = null;
let tokenExpiry = null;

/**
 * Gets a Management API access token using M2M credentials
 * Implements caching to reduce API calls (tokens valid for 24 hours)
 * @returns {Promise<string>} Management API access token
 * @throws {Error} If token request fails
 */
async function getManagementToken() {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error('Missing Auth0 M2M credentials in environment variables');
  }

  const tokenUrl = `https://${domain}/oauth/token`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Management API token: ${error}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;

  // Set expiry based on expires_in (usually 86400 seconds = 24 hours)
  tokenExpiry = Date.now() + (data.expires_in * 1000);

  return cachedToken;
}

/**
 * Makes an authenticated request to Auth0 Management API
 * @param {string} endpoint - API endpoint path (e.g., '/users')
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>} Fetch response
 */
async function managementApiRequest(endpoint, options = {}) {
  const token = await getManagementToken();
  const domain = process.env.AUTH0_DOMAIN;
  const url = `https://${domain}/api/v2${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  return response;
}

module.exports = {
  getManagementToken,
  managementApiRequest
};
