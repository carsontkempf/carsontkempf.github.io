/**
 * Learn Secrets Worker Configuration
 *
 * This configuration file contains the Worker URL for the learn-secrets proxy.
 * The Worker handles all API secrets securely without exposing them to the client.
 *
 * To provision the Worker:
 * 1. Run: npx learn-secrets deploy
 * 2. Provide Cloudflare API token when prompted
 * 3. Worker URL will be displayed after successful deployment
 * 4. Update WORKER_BASE_URL below with the deployed URL
 */

// Updated Worker URL (current production deployment)
// The main Learn app Worker with proper CORS configuration
const WORKER_BASE_URL = 'https://ctklearn.carsontkempf.workers.dev';

// Fallback to local development if needed
const WORKER_BASE_URL_DEV = 'http://localhost:8787';

// Use production Worker by default
const USE_PRODUCTION = true;

// Export configuration
window.learnWorkerConfig = {
  baseUrl: USE_PRODUCTION ? WORKER_BASE_URL : WORKER_BASE_URL_DEV,

  // Helper to build full endpoint URLs
  getEndpoint(path) {
    return `${this.baseUrl}${path}`;
  },

  // Endpoint paths
  endpoints: {
    // Auth endpoints (generate tokens server-side)
    appleJwt: '/auth/apple-jwt',

    // Proxy endpoints (inject secrets into API calls)
    githubToken: '/proxy/github-token',
    lichess: '/proxy/lichess',

    // Config endpoint (public configuration only)
    config: '/config'
  }
};

console.log('[Worker Config] Initialized with base URL:', window.learnWorkerConfig.baseUrl);
