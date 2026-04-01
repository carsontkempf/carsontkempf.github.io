/**
 * learn-secrets-sdk v1.2.0
 * Browser bundle for static sites
 * Secure API proxy SDK - keys never exposed to client
 */
(function(global) {
  'use strict';

  // Base SecretsSDKError class
  class SecretsSDKError extends Error {
    constructor(message, status, response) {
      super(message);
      this.status = status;
      this.response = response;
      this.name = 'SecretsSDKError';
    }
  }

  // OriginMismatchError - thrown when domain not authorized
  class OriginMismatchError extends SecretsSDKError {
    constructor(message = 'Origin not allowed for this token') {
      super(message, 403);
      this.name = 'OriginMismatchError';
    }
  }

  // RateLimitError - thrown when rate limit exceeded
  class RateLimitError extends SecretsSDKError {
    constructor(message = 'Rate limit exceeded', retryAfter = 60, remaining = 0, limit = 100) {
      super(message, 429);
      this.name = 'RateLimitError';
      this.retryAfter = retryAfter;
      this.remaining = remaining;
      this.limit = limit;
    }
  }

  // InvalidTokenError - thrown when token is invalid or expired
  class InvalidTokenError extends SecretsSDKError {
    constructor(message = 'Invalid or expired token') {
      super(message, 401);
      this.name = 'InvalidTokenError';
    }
  }

  // SecretsSDK class
  class SecretsSDK {
    constructor(options) {
      if (!options.appId) {
        throw new Error('appId is required');
      }

      // Support both 'token' and 'sessionToken' (deprecated)
      this.token = options.token || options.sessionToken;
      if (!this.token) {
        throw new Error('token is required');
      }

      this.appId = options.appId;
      this.baseUrl = options.baseUrl || 'https://ctklearn.carsontkempf.workers.dev';
      this.timeout = options.timeout || 30000;
      this.retryOn429 = options.retryOn429 !== undefined ? options.retryOn429 : true;
      this.rateLimitInfo = null;
    }

    /**
     * Get current rate limit information
     */
    getUsage() {
      return this.rateLimitInfo;
    }

    /**
     * Parse rate limit headers from response
     */
    parseRateLimitHeaders(headers) {
      const limit = headers.get('X-RateLimit-Limit');
      const remaining = headers.get('X-RateLimit-Remaining');
      const reset = headers.get('X-RateLimit-Reset');

      if (limit && remaining && reset) {
        this.rateLimitInfo = {
          limit: parseInt(limit),
          remaining: parseInt(remaining),
          reset: parseInt(reset)
        };
      }
    }

    /**
     * Sleep utility for retry backoff
     */
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Make fetch request with timeout
     */
    async fetchWithTimeout(url, options, timeout) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    /**
     * Call an external API securely through the proxy
     * @param {string} keyName - Name of the API key to use
     * @param {string} endpoint - API endpoint path (e.g., '/v1/chat/completions')
     * @param {Object} options - Request options (method, body, headers)
     * @returns {Promise<any>} Promise with the API response
     */
    async call(keyName, endpoint, options = {}) {
      let retries = 0;
      const maxRetries = this.retryOn429 ? 3 : 0;

      while (true) {
        try {
          // Log outgoing request details for CORS debugging
          const requestDetails = {
            url: `${this.baseUrl}/api/sdk/${this.appId}/proxy`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token.substring(0, 10)}...${this.token.substring(this.token.length - 2)}`
            },
            body: { keyName, endpoint, method: options.method || 'GET' },
            origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
            timestamp: new Date().toISOString()
          };

          if (typeof window !== 'undefined' && window.sdkTester?.logCORS) {
            window.sdkTester.logCORS('REQUEST_DETAILS', requestDetails);
          }

          const response = await this.fetchWithTimeout(
            `${this.baseUrl}/api/sdk/${this.appId}/proxy`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
              },
              body: JSON.stringify({
                keyName,
                endpoint,
                method: options.method || 'GET',
                body: options.body,
                headers: options.headers
              })
            },
            this.timeout
          );

          // Log response details for CORS debugging
          const responseDetails = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            ok: response.ok,
            type: response.type,
            url: response.url,
            timestamp: new Date().toISOString()
          };

          if (typeof window !== 'undefined' && window.sdkTester?.logCORS) {
            window.sdkTester.logCORS('RESPONSE_DETAILS', responseDetails);
          }

          this.parseRateLimitHeaders(response.headers);

          const result = await response.json();

          if (!response.ok) {
            const errorMessage = result.data?.message ||
              result?.message ||
              `Request failed with status ${response.status}`;

            // Check for specific error types
            if (response.status === 403 && errorMessage.includes('Origin')) {
              throw new OriginMismatchError(errorMessage);
            }

            if (response.status === 401) {
              throw new InvalidTokenError(errorMessage);
            }

            if (response.status === 429) {
              const retryAfter = this.rateLimitInfo
                ? this.rateLimitInfo.reset - Math.floor(Date.now() / 1000)
                : 60;

              const error = new RateLimitError(
                errorMessage,
                retryAfter,
                this.rateLimitInfo?.remaining || 0,
                this.rateLimitInfo?.limit || 100
              );

              // Retry logic with exponential backoff
              if (this.retryOn429 && retries < maxRetries) {
                retries++;
                const backoffMs = Math.min(1000 * Math.pow(2, retries - 1), 8000);
                await this.sleep(backoffMs);
                continue;
              }

              throw error;
            }

            throw new SecretsSDKError(errorMessage, response.status, result);
          }

          return result.data;
        } catch (err) {
          // Log network error details for CORS debugging
          if (typeof window !== 'undefined' && window.sdkTester?.logCORS) {
            window.sdkTester.logCORS('FETCH_ERROR', {
              name: err.name,
              message: err.message,
              stack: err.stack,
              timestamp: new Date().toISOString()
            });
          }

          if (err instanceof SecretsSDKError) {
            throw err;
          }

          if (err instanceof Error && err.name === 'AbortError') {
            throw new SecretsSDKError('Request timeout', 408);
          }

          throw new SecretsSDKError(
            err instanceof Error ? err.message : 'Unknown error occurred',
            500
          );
        }
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
  global.OriginMismatchError = OriginMismatchError;
  global.RateLimitError = RateLimitError;
  global.InvalidTokenError = InvalidTokenError;

})(typeof window !== 'undefined' ? window : this);
