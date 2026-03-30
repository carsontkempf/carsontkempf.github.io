/**
 * learn-secrets-sdk v1.0.0
 * Browser bundle for static sites
 * Secure API proxy SDK - keys never exposed to client
 */
(function(global) {
  'use strict';

  // SecretsSDKError class
  class SecretsSDKError extends Error {
    constructor(message, status, response) {
      super(message);
      this.status = status;
      this.response = response;
      this.name = 'SecretsSDKError';
    }
  }

  // SecretsSDK class
  class SecretsSDK {
    constructor(options) {
      if (!options.appId) {
        throw new Error('appId is required');
      }
      if (!options.sessionToken) {
        throw new Error('sessionToken is required');
      }
      this.appId = options.appId;
      this.sessionToken = options.sessionToken;
      this.baseUrl = options.baseUrl || 'https://ctklearn.workers.dev';
    }

    /**
     * Call an external API securely through the proxy
     * @param {string} keyName - Name of the API key to use
     * @param {string} endpoint - API endpoint path (e.g., '/v1/chat/completions')
     * @param {Object} options - Request options (method, body, headers)
     * @returns {Promise<any>} Promise with the API response
     */
    async call(keyName, endpoint, options = {}) {
      try {
        const response = await fetch(`${this.baseUrl}/api/sdk/${this.appId}/proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.sessionToken}`
          },
          body: JSON.stringify({
            keyName,
            endpoint,
            method: options.method || 'GET',
            body: options.body,
            headers: options.headers
          })
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.data?.message ||
            result?.message ||
            `Request failed with status ${response.status}`;
          throw new SecretsSDKError(errorMessage, response.status, result);
        }

        return result.data;
      } catch (err) {
        if (err instanceof SecretsSDKError) {
          throw err;
        }
        throw new SecretsSDKError(
          err instanceof Error ? err.message : 'Unknown error occurred',
          500
        );
      }
    }

    /**
     * Make a GET request
     */
    async get(keyName, endpoint, headers) {
      return this.call(keyName, endpoint, { method: 'GET', headers });
    }

    /**
     * Make a POST request
     */
    async post(keyName, endpoint, body, headers) {
      return this.call(keyName, endpoint, { method: 'POST', body, headers });
    }

    /**
     * Make a PUT request
     */
    async put(keyName, endpoint, body, headers) {
      return this.call(keyName, endpoint, { method: 'PUT', body, headers });
    }

    /**
     * Make a DELETE request
     */
    async delete(keyName, endpoint, headers) {
      return this.call(keyName, endpoint, { method: 'DELETE', headers });
    }

    /**
     * Make a PATCH request
     */
    async patch(keyName, endpoint, body, headers) {
      return this.call(keyName, endpoint, { method: 'PATCH', body, headers });
    }
  }

  // Export to global namespace
  global.SecretsSDK = SecretsSDK;
  global.SecretsSDKError = SecretsSDKError;

})(typeof window !== 'undefined' ? window : this);
