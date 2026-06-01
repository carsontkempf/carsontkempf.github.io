"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };

  // src/env-resolver.ts
  var init_env_resolver = __esm({
    "src/env-resolver.ts"() {
      "use strict";
    }
  });

  // src/types.ts
  var SecretsSDKError = class extends Error {
    constructor(message, status, response) {
      super(message);
      this.status = status;
      this.response = response;
      this.name = "SecretsSDKError";
    }
  };
  var OriginMismatchError = class extends SecretsSDKError {
    constructor(message = "Origin not allowed for this token") {
      super(message, 403);
      this.name = "OriginMismatchError";
    }
  };
  var RateLimitError = class extends SecretsSDKError {
    constructor(message = "Rate limit exceeded", retryAfter = 60, remaining = 0, limit = 100) {
      super(message, 429);
      this.name = "RateLimitError";
      this.retryAfter = retryAfter;
      this.remaining = remaining;
      this.limit = limit;
    }
  };
  var InvalidTokenError = class extends SecretsSDKError {
    constructor(message = "Invalid or expired token") {
      super(message, 401);
      this.name = "InvalidTokenError";
    }
  };

  // src/client.ts
  var SecretsSDK = class {
    /**
     * Create a new SecretsSDK instance
     *
     * Zero-config mode (recommended for static sites):
     *   const sdk = new SecretsSDK();
     *   // Origin header is used for authentication
     *
     * Token mode (for backward compatibility):
     *   const sdk = new SecretsSDK({ appId: '...', token: 'sk_live_...' });
     */
    constructor(options = {}) {
      this.rateLimitInfo = null;
      this.appId = options.appId || null;
      this.token = options.token || options.sessionToken || null;
      this.baseUrl = options.baseUrl || "https://cloudprototype.org";
      this.timeout = options.timeout || 3e4;
      this.retryOn429 = options.retryOn429 !== void 0 ? options.retryOn429 : true;
      this.zeroConfigMode = !this.appId && !this.token;
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
      const limit = headers.get("X-RateLimit-Limit");
      const remaining = headers.get("X-RateLimit-Remaining");
      const reset = headers.get("X-RateLimit-Reset");
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
      return new Promise((resolve) => setTimeout(resolve, ms));
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
     * @param keyName - Name of the API key to use
     * @param endpoint - API endpoint path (e.g., '/v1/chat/completions')
     * @param options - Request options (method, body, headers)
     * @returns Promise with the API response
     */
    async call(keyName, endpoint, options = {}) {
      let retries = 0;
      const maxRetries = this.retryOn429 ? 3 : 0;
      while (true) {
        try {
          const proxyUrl = this.zeroConfigMode ? `${this.baseUrl}/api/sdk/proxy` : `${this.baseUrl}/api/sdk/${this.appId}/proxy`;
          const requestHeaders = {
            "Content-Type": "application/json"
          };
          if (!this.zeroConfigMode && this.token) {
            requestHeaders["Authorization"] = `Bearer ${this.token}`;
          }
          const response = await this.fetchWithTimeout(
            proxyUrl,
            {
              method: "POST",
              headers: requestHeaders,
              body: JSON.stringify({
                keyName,
                endpoint,
                method: options.method || "GET",
                body: options.body,
                headers: options.headers
              })
            },
            this.timeout
          );
          this.parseRateLimitHeaders(response.headers);
          const result = await response.json();
          if (!response.ok) {
            const errorMessage = result.data?.message || result?.message || `Request failed with status ${response.status}`;
            if (response.status === 403 && errorMessage.includes("Origin")) {
              throw new OriginMismatchError(errorMessage);
            }
            if (response.status === 401) {
              throw new InvalidTokenError(errorMessage);
            }
            if (response.status === 429) {
              const retryAfter = this.rateLimitInfo ? this.rateLimitInfo.reset - Math.floor(Date.now() / 1e3) : 60;
              const error = new RateLimitError(
                errorMessage,
                retryAfter,
                this.rateLimitInfo?.remaining || 0,
                this.rateLimitInfo?.limit || 100
              );
              if (this.retryOn429 && retries < maxRetries) {
                retries++;
                const backoffMs = Math.min(1e3 * Math.pow(2, retries - 1), 8e3);
                await this.sleep(backoffMs);
                continue;
              }
              throw error;
            }
            throw new SecretsSDKError(errorMessage, response.status, result);
          }
          return result.data;
        } catch (err) {
          if (err instanceof SecretsSDKError) {
            throw err;
          }
          if (err instanceof Error && err.name === "AbortError") {
            throw new SecretsSDKError("Request timeout", 408);
          }
          throw new SecretsSDKError(
            err instanceof Error ? err.message : "Unknown error occurred",
            500
          );
        }
      }
    }
    /**
     * Make a GET request
     */
    async get(keyName, endpoint, headers) {
      return this.call(keyName, endpoint, { method: "GET", headers });
    }
    /**
     * Make a POST request
     */
    async post(keyName, endpoint, body, headers) {
      return this.call(keyName, endpoint, { method: "POST", body, headers });
    }
    /**
     * Make a PUT request
     */
    async put(keyName, endpoint, body, headers) {
      return this.call(keyName, endpoint, { method: "PUT", body, headers });
    }
    /**
     * Make a DELETE request
     */
    async delete(keyName, endpoint, headers) {
      return this.call(keyName, endpoint, { method: "DELETE", headers });
    }
    /**
     * Make a PATCH request
     */
    async patch(keyName, endpoint, body, headers) {
      return this.call(keyName, endpoint, { method: "PATCH", body, headers });
    }
    /**
     * Secrets Management API (zero-config mode)
     * These methods allow programmatic CRUD operations on project secrets
     * Requires appId to be set (can be set in constructor or via setAppId)
     */
    /**
     * Set App ID for secrets management
     * Required before calling secrets management methods
     */
    setAppId(appId) {
      this.appId = appId;
    }
    /**
     * Make authenticated request to secrets management API
     */
    async secretsRequest(action, body) {
      if (!this.appId) {
        throw new SecretsSDKError("App ID required for secrets management. Call setAppId() first.", 400);
      }
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/projects/${this.appId}/secrets/manage?action=${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: body ? JSON.stringify(body) : void 0
        },
        this.timeout
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new SecretsSDKError(
          errorData.message || `Secrets management failed: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      return response.json();
    }
    /**
     * List all secrets for the project
     * Returns secret metadata (no API keys)
     */
    async listSecrets() {
      return this.secretsRequest("list");
    }
    /**
     * Create a new secret
     */
    async createSecret(secret) {
      return this.secretsRequest("create", secret);
    }
    /**
     * Update an existing secret
     */
    async updateSecret(update) {
      return this.secretsRequest("update", update);
    }
    /**
     * Delete a secret
     */
    async deleteSecret(name) {
      return this.secretsRequest("delete", { name });
    }
    /**
     * Sync secrets from .env file format
     * Bulk upload/update secrets
     */
    async syncEnv(secrets, provider) {
      return this.secretsRequest("sync", { secrets, provider });
    }
  };

  // src/machine-id.ts
  var import_child_process = __require("child_process");
  var import_util = __require("util");
  var execAsync = (0, import_util.promisify)(import_child_process.exec);

  // src/index.ts
  init_env_resolver();

  // src/browser-global.ts
  if (typeof window !== "undefined") {
    console.log("[SecretsSDK] Setting window.SecretsSDK, typeof:", typeof SecretsSDK);
    window.SecretsSDK = SecretsSDK;
    console.log("[SecretsSDK] Set complete, window.SecretsSDK:", typeof window.SecretsSDK);
  } else {
    console.log("[SecretsSDK] window is undefined, not in browser?");
  }
  var browser_global_default = SecretsSDK;
})();
