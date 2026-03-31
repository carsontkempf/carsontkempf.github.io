/**
 * SDK Proxy Testing Module
 * Tests learn-secrets-sdk package functionality
 */
(function() {
  'use strict';

  // SDK instance
  let sdk = null;

  // Configuration
  const CONFIG = {
    LEARN_SITE_URL: 'https://learn.pages.dev',
    APP_ID: '',
    TOKEN: '',
    LOG_LEVEL: 'VERBOSE'
  };

  /**
   * Verbose debug logging with [SDK-TEST] prefix
   */
  function log(message, data = null, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = '[SDK-TEST]';

    const consoleMessage = `${prefix} ${timestamp} - ${message}`;
    if (data !== null) {
      console.log(consoleMessage, data);
    } else {
      console.log(consoleMessage);
    }

    appendToDebugPanel(timestamp, message, data, level);
  }

  /**
   * Log request phase for micro-communication tracking
   */
  function logRequestPhase(phase, data) {
    const phases = {
      'prepare': 'Preparing request parameters',
      'serialize': 'Serializing request body',
      'fetch-start': 'Initiating fetch to proxy',
      'fetch-sent': 'Request sent, awaiting response',
      'headers-received': 'Response headers received',
      'body-parse': 'Parsing response body',
      'complete': 'Request cycle complete'
    };
    log(`[PHASE: ${phase}] ${phases[phase] || phase}`, data, 'verbose');
  }

  /**
   * Append entry to visible debug panel
   */
  function appendToDebugPanel(timestamp, message, data, level) {
    const panel = document.getElementById('debug-log');
    if (!panel) return;

    const entry = document.createElement('div');
    entry.className = `debug-entry ${level}`;

    const timestampEl = document.createElement('div');
    timestampEl.className = 'debug-timestamp';
    timestampEl.textContent = timestamp;
    entry.appendChild(timestampEl);

    const messageEl = document.createElement('div');
    messageEl.className = 'debug-message';
    messageEl.innerHTML = `<span class="debug-prefix">[SDK-TEST]</span> ${message}`;
    entry.appendChild(messageEl);

    if (data !== null) {
      const dataEl = document.createElement('div');
      dataEl.className = 'debug-data';
      const pre = document.createElement('pre');
      if (typeof data === 'object') {
        pre.textContent = JSON.stringify(data, null, 2);
      } else {
        pre.textContent = String(data);
      }
      dataEl.appendChild(pre);
      entry.appendChild(dataEl);
    }

    panel.appendChild(entry);
    panel.scrollTop = panel.scrollHeight;
  }

  /**
   * Clear debug log
   */
  function clearLog() {
    const panel = document.getElementById('debug-log');
    if (panel) {
      panel.innerHTML = '';
    }
    console.clear();
    log('Debug log cleared', null, 'info');
  }

  /**
   * Export debug log as plaintext
   */
  function getPlaintextLog() {
    const entries = document.querySelectorAll('#debug-log .debug-entry');
    let output = '=== SDK TESTER DEBUG LOG ===\n';
    output += 'Generated: ' + new Date().toISOString() + '\n';
    output += 'URL: ' + window.location.href + '\n';
    output += 'SDK Version: learn-secrets-sdk@1.0.0\n';
    output += '================================\n\n';

    entries.forEach(entry => {
      const timestamp = entry.querySelector('.debug-timestamp')?.textContent || '';
      const message = entry.querySelector('.debug-message')?.textContent || '';
      const data = entry.querySelector('.debug-data pre')?.textContent || '';

      output += timestamp + '\n';
      output += message + '\n';
      if (data) {
        output += data + '\n';
      }
      output += '---\n';
    });

    return output;
  }

  /**
   * Copy debug log to clipboard
   */
  function copyLogToClipboard() {
    const text = getPlaintextLog();
    navigator.clipboard.writeText(text).then(() => {
      log('Log copied to clipboard', { chars: text.length }, 'success');
    }).catch(err => {
      log('Failed to copy log', { error: err.message }, 'error');
    });
  }

  /**
   * Decode JWT token without verification (for inspection only)
   */
  function decodeJWT(token) {
    log('Attempting to decode JWT token', { tokenLength: token ? token.length : 0 }, 'verbose');

    try {
      if (!token) {
        log('No token provided to decode', null, 'warning');
        return null;
      }

      const parts = token.split('.');
      log(`JWT split into ${parts.length} parts`, {
        expectedParts: 3,
        actualParts: parts.length
      }, 'verbose');

      if (parts.length !== 3) {
        log('Invalid JWT format - expected 3 parts (header.payload.signature)', null, 'error');
        return null;
      }

      log('Decoding JWT header...', null, 'verbose');
      const header = JSON.parse(atob(parts[0]));
      log('JWT header decoded', header, 'verbose');

      log('Decoding JWT payload...', null, 'verbose');
      const payload = JSON.parse(atob(parts[1]));
      log('JWT payload decoded', payload, 'verbose');

      const expiry = payload.exp ? new Date(payload.exp * 1000) : null;
      const isExpired = payload.exp ? Date.now() > payload.exp * 1000 : false;

      const decoded = {
        header,
        payload,
        signature: parts[2].substring(0, 20) + '...',
        expiry,
        isExpired,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : null
      };

      log('JWT successfully decoded', {
        algorithm: header.alg,
        type: header.typ,
        expiresAt: expiry ? expiry.toISOString() : 'N/A',
        isExpired,
        issuer: payload.iss,
        subject: payload.sub,
        audience: payload.aud
      }, 'success');

      return decoded;
    } catch (e) {
      log('JWT decode error', {
        error: e.message,
        stack: e.stack
      }, 'error');
      return null;
    }
  }

  /**
   * Initialize SDK with credentials
   */
  function initializeSDK() {
    log('=== INITIALIZING SDK ===', null, 'info');

    const appId = document.getElementById('app-id-input')?.value?.trim();
    const token = document.getElementById('sdk-token-input')?.value?.trim();

    if (!appId) {
      log('Missing App ID', null, 'error');
      updateSDKStatus('error', 'App ID is required');
      return false;
    }

    if (!token) {
      log('Missing SDK Token', null, 'error');
      updateSDKStatus('error', 'SDK Token is required');
      return false;
    }

    CONFIG.APP_ID = appId;
    CONFIG.TOKEN = token;

    // Mask token for logging
    const maskedToken = token.length > 10
      ? `${token.substring(0, 8)}****${token.substring(token.length - 2)}`
      : '****';

    log('Creating SecretsSDK instance', {
      appId: appId,
      token: maskedToken,
      baseUrl: CONFIG.LEARN_SITE_URL,
      timeout: 30000,
      retryOn429: true
    }, 'verbose');

    try {
      if (typeof SecretsSDK === 'undefined') {
        throw new Error('SecretsSDK not loaded - check script order');
      }

      sdk = new SecretsSDK({
        appId: appId,
        token: token,
        baseUrl: CONFIG.LEARN_SITE_URL,
        timeout: 30000,
        retryOn429: true
      });

      log('SDK initialized successfully', {
        appId: sdk.appId,
        baseUrl: sdk.baseUrl,
        timeout: sdk.timeout,
        retryOn429: sdk.retryOn429
      }, 'success');

      updateSDKStatus('success', 'SDK initialized');
      return true;
    } catch (e) {
      log('SDK initialization failed', {
        error: e.message
      }, 'error');
      updateSDKStatus('error', `Init failed: ${e.message}`);
      return false;
    }
  }

  /**
   * Update SDK status UI
   */
  function updateSDKStatus(status, message) {
    const statusEl = document.getElementById('sdk-status');
    if (statusEl) {
      statusEl.className = status === 'success' ? 'connected' :
                          status === 'error' ? 'disconnected' : 'checking';
      statusEl.textContent = message;
    }
  }

  /**
   * Update rate limit display UI
   */
  function updateRateLimitDisplay(usage) {
    const remainingEl = document.querySelector('.rate-remaining');
    const limitEl = document.querySelector('.rate-limit');
    const resetEl = document.querySelector('.rate-reset');

    if (remainingEl && limitEl && resetEl && usage) {
      const resetsIn = usage.reset - Math.floor(Date.now() / 1000);
      remainingEl.textContent = usage.remaining;
      limitEl.textContent = usage.limit;
      resetEl.textContent = `Resets in ${resetsIn}s`;
    }
  }

  /**
   * Call NewsAPI through SDK
   */
  async function callNewsAPI(endpoint, params = {}) {
    log('=== STARTING NEWSAPI REQUEST ===', null, 'info');

    if (!sdk) {
      log('SDK not initialized', null, 'error');
      alert('Please initialize the SDK first with your credentials');
      return { success: false, error: 'SDK not initialized' };
    }

    // Build endpoint with query params
    logRequestPhase('prepare', { endpoint, params });

    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `/v2/${endpoint}?${queryString}` : `/v2/${endpoint}`;

    log('Request details', {
      keyName: 'newsapi',
      endpoint: fullEndpoint,
      method: 'GET',
      sdkAppId: sdk.appId,
      sdkBaseUrl: sdk.baseUrl
    }, 'info');

    logRequestPhase('fetch-start', {
      url: `${sdk.baseUrl}/api/sdk/${sdk.appId}/proxy`,
      headers: ['Content-Type', 'Authorization']
    });

    const startTime = performance.now();

    try {
      log('Calling SDK.get()...', null, 'verbose');
      logRequestPhase('fetch-sent', { timestamp: new Date().toISOString() });

      const data = await sdk.get('newsapi', fullEndpoint);

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      logRequestPhase('body-parse', { status: 'complete' });

      // Get rate limit info
      const usage = sdk.getUsage();
      if (usage) {
        const resetsIn = usage.reset - Math.floor(Date.now() / 1000);
        log('Rate Limit Status', {
          remaining: usage.remaining,
          limit: usage.limit,
          resetsIn: `${resetsIn}s`
        }, 'info');

        // Update UI rate limit display
        updateRateLimitDisplay(usage);
      }

      log('SDK request successful', {
        duration: `${duration}ms`,
        status: data?.status || 'ok',
        totalResults: data?.totalResults || 0,
        articlesCount: data?.articles?.length || 0,
        sourcesCount: data?.sources?.length || 0
      }, 'success');

      if (data?.articles && data.articles.length > 0) {
        log('First article preview', {
          title: data.articles[0].title,
          source: data.articles[0].source?.name,
          author: data.articles[0].author,
          publishedAt: data.articles[0].publishedAt
        }, 'info');
      }

      if (data?.sources && data.sources.length > 0) {
        log('First source preview', {
          id: data.sources[0].id,
          name: data.sources[0].name,
          category: data.sources[0].category
        }, 'info');
      }

      logRequestPhase('complete', { duration: `${duration}ms`, success: true });
      log('=== NEWSAPI REQUEST SUCCESSFUL ===', null, 'success');

      const result = { success: true, data };
      displayAPIResult(result, { keyName: 'newsapi', endpoint: fullEndpoint }, duration);

      return result;
    } catch (e) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Error type specific handling
      if (typeof OriginMismatchError !== 'undefined' && e instanceof OriginMismatchError) {
        log('ORIGIN MISMATCH ERROR', {
          message: e.message,
          status: e.status,
          hint: 'Token not authorized for this domain'
        }, 'error');
      } else if (typeof RateLimitError !== 'undefined' && e instanceof RateLimitError) {
        log('RATE LIMIT ERROR', {
          message: e.message,
          status: e.status,
          retryAfter: e.retryAfter,
          remaining: e.remaining,
          limit: e.limit,
          hint: `Retry after ${e.retryAfter}s`
        }, 'error');
      } else if (typeof InvalidTokenError !== 'undefined' && e instanceof InvalidTokenError) {
        log('INVALID TOKEN ERROR', {
          message: e.message,
          status: e.status,
          hint: 'Check token is correct and not expired'
        }, 'error');
      } else if (typeof SecretsSDKError !== 'undefined' && e instanceof SecretsSDKError) {
        log('SECRETS SDK ERROR', {
          message: e.message,
          status: e.status,
          response: e.response
        }, 'error');
      } else {
        log('UNKNOWN ERROR', {
          message: e.message,
          error: e.toString()
        }, 'error');
      }

      log('NewsAPI request failed', {
        error: e.message,
        status: e.status || 'unknown',
        duration: `${duration}ms`
      }, 'error');

      logRequestPhase('complete', { duration: `${duration}ms`, success: false });
      log('=== NEWSAPI REQUEST FAILED ===', null, 'error');

      const result = {
        success: false,
        error: e.message,
        status: e.status || 500
      };
      displayAPIResult(result, { keyName: 'newsapi', endpoint: fullEndpoint }, duration);

      return result;
    }
  }

  /**
   * Display API result in UI
   */
  function displayAPIResult(result, request, duration) {
    log('Displaying API result in UI', {
      success: result.success,
      duration: `${duration}ms`
    }, 'verbose');

    const resultPanel = document.getElementById('api-result');
    if (!resultPanel) return;

    resultPanel.innerHTML = '';

    const resultDiv = document.createElement('div');
    resultDiv.className = 'request-response-display';

    const requestBox = document.createElement('div');
    requestBox.className = 'request-box';
    requestBox.innerHTML = `
      <h4>Request <span class="status-badge">${duration}ms</span></h4>
      <pre>${JSON.stringify(request, null, 2)}</pre>
    `;

    const responseBox = document.createElement('div');
    responseBox.className = 'response-box';
    responseBox.innerHTML = `
      <h4>Response <span class="status-badge ${result.success ? 'success' : 'error'}">${result.success ? 'Success' : 'Failed'}</span></h4>
      <pre>${JSON.stringify(result, null, 2)}</pre>
    `;

    resultDiv.appendChild(requestBox);
    resultDiv.appendChild(responseBox);
    resultPanel.appendChild(resultDiv);
  }

  /**
   * Update token inspector display
   */
  function updateTokenInspector() {
    log('Updating token inspector...', null, 'verbose');

    const tokenInput = document.getElementById('sdk-token-input');
    const token = tokenInput?.value?.trim();

    if (!token) {
      log('No token to inspect', null, 'warning');
      const claimsEl = document.getElementById('token-claims-display');
      if (claimsEl) {
        claimsEl.innerHTML = '<p style="color: #e74c3c;">Enter an SDK token above first</p>';
      }
      return;
    }

    const decoded = decodeJWT(token);

    const claimsEl = document.getElementById('token-claims-display');
    if (claimsEl && decoded) {
      claimsEl.innerHTML = `<pre>${JSON.stringify(decoded, null, 2)}</pre>`;
    } else if (claimsEl) {
      claimsEl.innerHTML = '<p style="color: #e74c3c;">Failed to decode token - invalid JWT format</p>';
    }
  }

  /**
   * Log CORS-specific details
   */
  function logCORS(phase, data) {
    log(`[CORS: ${phase}]`, data, 'verbose');

    // Also log to console with special formatting
    console.group(`%c[CORS] ${phase}`, 'color: #e74c3c; font-weight: bold');
    console.log(JSON.stringify(data, null, 2));
    console.groupEnd();
  }

  /**
   * Test CORS preflight directly
   */
  async function testCORSPreflight() {
    log('=== TESTING CORS PREFLIGHT ===', null, 'info');

    const url = `${CONFIG.LEARN_SITE_URL}/api/sdk/${CONFIG.APP_ID}/proxy`;

    log('Testing OPTIONS preflight request', { url }, 'info');

    try {
      // Manual OPTIONS request
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,authorization'
        }
      });

      log('OPTIONS Response Status', {
        status: response.status,
        statusText: response.statusText
      }, 'info');

      // Log all response headers
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      log('OPTIONS Response Headers', headers, 'verbose');

      // Check specific CORS headers
      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
        'access-control-max-age': response.headers.get('access-control-max-age')
      };

      log('CORS Headers Analysis', corsHeaders, 'info');

      if (!corsHeaders['access-control-allow-origin']) {
        log('CORS ISSUE FOUND', {
          issue: 'Missing Access-Control-Allow-Origin header',
          hint: 'Server must return this header on OPTIONS request'
        }, 'error');
      }

      if (!corsHeaders['access-control-allow-headers']?.includes('authorization')) {
        log('CORS ISSUE FOUND', {
          issue: 'Authorization header not in Access-Control-Allow-Headers',
          hint: 'Server must allow Authorization header'
        }, 'error');
      }

    } catch (err) {
      log('OPTIONS Request Failed', {
        error: err.message,
        name: err.name
      }, 'error');
    }
  }

  /**
   * Test simple GET request (no preflight)
   */
  async function testSimpleRequest() {
    log('=== TESTING SIMPLE REQUEST (NO PREFLIGHT) ===', null, 'info');

    const url = `${CONFIG.LEARN_SITE_URL}/api/sdk/${CONFIG.APP_ID}/proxy`;

    try {
      // Simple GET without custom headers - should not trigger preflight
      const response = await fetch(url, {
        method: 'GET'
      });

      log('Simple GET Response', {
        status: response.status,
        statusText: response.statusText
      }, 'info');

      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      log('Simple GET Response Headers', headers, 'verbose');

    } catch (err) {
      log('Simple GET Failed', {
        error: err.message
      }, 'error');
    }
  }

  /**
   * Diagnose CORS issues
   */
  async function diagnoseCORS() {
    if (!CONFIG.APP_ID) {
      log('Cannot run diagnostics - App ID not set', null, 'error');
      alert('Please enter an App ID first');
      return;
    }

    log('=== RUNNING CORS DIAGNOSTICS ===', null, 'info');

    log('Current Origin', { origin: window.location.origin }, 'info');
    log('Target Base URL', { baseUrl: CONFIG.LEARN_SITE_URL }, 'info');
    log('App ID', { appId: CONFIG.APP_ID }, 'info');

    // Test 1: Simple request
    await testSimpleRequest();

    // Test 2: OPTIONS preflight
    await testCORSPreflight();

    log('=== CORS DIAGNOSTICS COMPLETE ===', null, 'info');
    log('Review the logs above to identify the CORS issue', null, 'info');
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    log('SDK Tester module initializing...', null, 'info');
    log('Checking for SecretsSDK...', null, 'verbose');

    if (typeof SecretsSDK !== 'undefined') {
      log('SecretsSDK class found', { available: true }, 'success');
    } else {
      log('SecretsSDK class NOT found - SDK not loaded', null, 'error');
    }

    // Wire up init SDK button
    const initSDKBtn = document.getElementById('init-sdk-btn');
    if (initSDKBtn) {
      log('Wiring up init SDK button', null, 'verbose');
      initSDKBtn.addEventListener('click', () => {
        initializeSDK();
      });
    }

    // Wire up test API button
    const testApiBtn = document.getElementById('test-api-btn');
    if (testApiBtn) {
      log('Wiring up test API button', null, 'verbose');
      testApiBtn.addEventListener('click', async () => {
        const endpoint = document.getElementById('endpoint-select').value;
        const query = document.getElementById('query-input').value;

        const params = {};
        if (endpoint === 'top-headlines') {
          params.country = 'us';
          if (query) params.q = query;
        } else if (endpoint === 'everything') {
          params.q = query || 'technology';
          params.sortBy = 'publishedAt';
        } else if (endpoint === 'sources') {
          params.language = 'en';
          if (query) params.category = query;
        }

        testApiBtn.disabled = true;
        testApiBtn.innerHTML = 'Executing... <span class="loading-spinner"></span>';

        await callNewsAPI(endpoint, params);

        testApiBtn.disabled = false;
        testApiBtn.textContent = 'Execute Request';
      });
    }

    // Wire up clear log button
    const clearLogBtn = document.getElementById('clear-log-btn');
    if (clearLogBtn) {
      log('Wiring up clear log button', null, 'verbose');
      clearLogBtn.addEventListener('click', clearLog);
    }

    // Wire up copy log button
    const copyLogBtn = document.getElementById('copy-log-btn');
    if (copyLogBtn) {
      log('Wiring up copy log button', null, 'verbose');
      copyLogBtn.addEventListener('click', copyLogToClipboard);
    }

    // Wire up inspect token button
    const inspectTokenBtn = document.getElementById('inspect-token-btn');
    if (inspectTokenBtn) {
      log('Wiring up inspect token button', null, 'verbose');
      inspectTokenBtn.addEventListener('click', updateTokenInspector);
    }

    // Wire up CORS diagnostics button
    const diagnoseCorsBtn = document.getElementById('diagnose-cors-btn');
    if (diagnoseCorsBtn) {
      log('Wiring up CORS diagnostics button', null, 'verbose');
      diagnoseCorsBtn.addEventListener('click', async () => {
        diagnoseCorsBtn.disabled = true;
        diagnoseCorsBtn.textContent = 'Running diagnostics...';
        await diagnoseCORS();
        diagnoseCorsBtn.disabled = false;
        diagnoseCorsBtn.textContent = 'Run CORS Diagnostics';
      });
    }

    log('SDK Tester module initialized successfully', null, 'success');
    log('Ready to test SDK functionality', {
      sdkAvailable: typeof SecretsSDK !== 'undefined',
      baseUrl: CONFIG.LEARN_SITE_URL
    }, 'info');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external access
  window.sdkTester = {
    initializeSDK,
    callNewsAPI,
    decodeJWT,
    log,
    clearLog,
    getPlaintextLog,
    copyLogToClipboard,
    updateTokenInspector,
    logCORS,
    diagnoseCORS,
    testCORSPreflight,
    testSimpleRequest,
    getSDK: () => sdk,
    config: CONFIG
  };

  log('SDK Tester module loaded', { version: '2.0.0' }, 'info');
})();
