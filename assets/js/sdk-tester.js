/**
 * SDK Proxy Testing Module
 * Verbose logging for debugging SDK and API wrapper functionality
 */
(function() {
  'use strict';

  // Configuration - UPDATE THESE VALUES
  const CONFIG = {
    LEARN_SITE_URL: 'https://ctklearn.workers.dev',
    APP_ID: '', // Will be set via UI input
    LOG_LEVEL: 'VERBOSE' // VERBOSE, INFO, ERROR
  };

  // Log levels
  const LOG_LEVELS = {
    VERBOSE: 0,
    INFO: 1,
    ERROR: 2
  };

  /**
   * Verbose debug logging with [SDK-TEST] prefix
   */
  function log(message, data = null, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = '[SDK-TEST]';

    // Console output
    const consoleMessage = `${prefix} ${timestamp} - ${message}`;
    if (data !== null) {
      console.log(consoleMessage, data);
    } else {
      console.log(consoleMessage);
    }

    // Visual debug panel output
    appendToDebugPanel(timestamp, message, data, level);
  }

  /**
   * Append entry to visible debug panel
   */
  function appendToDebugPanel(timestamp, message, data, level) {
    const panel = document.getElementById('debug-log');
    if (!panel) return;

    const entry = document.createElement('div');
    entry.className = `debug-entry ${level}`;

    // Timestamp
    const timestampEl = document.createElement('div');
    timestampEl.className = 'debug-timestamp';
    timestampEl.textContent = timestamp;
    entry.appendChild(timestampEl);

    // Message
    const messageEl = document.createElement('div');
    messageEl.className = 'debug-message';
    messageEl.innerHTML = `<span class="debug-prefix">[SDK-TEST]</span> ${message}`;
    entry.appendChild(messageEl);

    // Data
    if (data !== null) {
      const dataEl = document.createElement('div');
      dataEl.className = 'debug-data';
      const pre = document.createElement('pre');

      // Pretty print JSON
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

      // Decode header
      log('Decoding JWT header...', null, 'verbose');
      const header = JSON.parse(atob(parts[0]));
      log('JWT header decoded', header, 'verbose');

      // Decode payload
      log('Decoding JWT payload...', null, 'verbose');
      const payload = JSON.parse(atob(parts[1]));
      log('JWT payload decoded', payload, 'verbose');

      // Extract expiry
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
   * Test connection to learn site
   */
  async function testConnection() {
    log('=== STARTING CONNECTION TEST ===', null, 'info');
    log('Testing connection to learn site', { url: CONFIG.LEARN_SITE_URL }, 'info');

    const startTime = performance.now();

    try {
      // Build request
      const requestUrl = `${CONFIG.LEARN_SITE_URL}/api/session`;
      log('Building request', {
        url: requestUrl,
        method: 'GET',
        credentials: 'include',
        headers: 'default'
      }, 'verbose');

      log('Sending request...', null, 'info');
      const response = await fetch(requestUrl, {
        method: 'GET',
        credentials: 'include'
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      log('Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        duration: `${duration}ms`,
        headers: {
          contentType: response.headers.get('content-type'),
          server: response.headers.get('server'),
          date: response.headers.get('date')
        }
      }, response.ok ? 'success' : 'error');

      if (response.ok) {
        log('Parsing response body...', null, 'verbose');
        const data = await response.json();
        log('Session data received', data, 'success');

        updateConnectionStatus('connected', `Connected (${duration}ms)`);

        log('=== CONNECTION TEST SUCCESSFUL ===', null, 'success');
        return { success: true, data, duration };
      } else {
        log('Connection failed', {
          status: response.status,
          statusText: response.statusText
        }, 'error');

        updateConnectionStatus('disconnected', `Failed (${response.status})`);

        log('=== CONNECTION TEST FAILED ===', null, 'error');
        return { success: false, status: response.status, duration };
      }
    } catch (e) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      log('Connection error', {
        error: e.message,
        type: e.name,
        duration: `${duration}ms`
      }, 'error');

      updateConnectionStatus('disconnected', `Error: ${e.message}`);

      log('=== CONNECTION TEST FAILED ===', null, 'error');
      return { success: false, error: e.message, duration };
    }
  }

  /**
   * Update connection status UI
   */
  function updateConnectionStatus(status, message) {
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.className = status;
      statusEl.textContent = message;
    }
  }

  /**
   * Call NewsAPI through SDK proxy
   */
  async function callNewsAPI(endpoint, params = {}) {
    log('=== STARTING NEWSAPI REQUEST ===', null, 'info');
    log('Preparing NewsAPI request', {
      endpoint,
      params,
      appId: CONFIG.APP_ID
    }, 'info');

    if (!CONFIG.APP_ID) {
      log('No APP_ID configured', null, 'error');
      alert('Please enter your project App ID first');
      return { success: false, error: 'No APP_ID configured' };
    }

    // Build endpoint with query params
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `/${endpoint}?${queryString}` : `/${endpoint}`;

    log('Built full endpoint', { fullEndpoint }, 'verbose');

    // Build request body
    const requestBody = {
      keyName: 'newsapi',
      endpoint: fullEndpoint,
      method: 'GET',
      body: null,
      headers: {}
    };

    log('SDK Proxy request body', requestBody, 'verbose');

    const proxyUrl = `${CONFIG.LEARN_SITE_URL}/api/sdk/${CONFIG.APP_ID}/proxy`;
    log('SDK Proxy URL', { url: proxyUrl }, 'verbose');

    const startTime = performance.now();

    try {
      log('Sending request to SDK proxy...', null, 'info');
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      log('SDK Proxy response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        duration: `${duration}ms`,
        headers: {
          contentType: response.headers.get('content-type'),
          rateLimit: response.headers.get('x-ratelimit-remaining'),
          date: response.headers.get('date')
        }
      }, response.ok ? 'success' : 'error');

      log('Parsing SDK proxy response...', null, 'verbose');
      const data = await response.json();

      log('SDK Proxy response data', data, response.ok ? 'success' : 'error');

      if (data.success) {
        log('NewsAPI response data', {
          status: data.status,
          totalResults: data.data?.totalResults || 0,
          articlesCount: data.data?.articles?.length || 0,
          sourcesCount: data.data?.sources?.length || 0
        }, 'success');

        if (data.data?.articles && data.data.articles.length > 0) {
          log('First article preview', {
            title: data.data.articles[0].title,
            source: data.data.articles[0].source?.name,
            author: data.data.articles[0].author,
            publishedAt: data.data.articles[0].publishedAt,
            url: data.data.articles[0].url
          }, 'info');
        }

        if (data.data?.sources && data.data.sources.length > 0) {
          log('First source preview', {
            id: data.data.sources[0].id,
            name: data.data.sources[0].name,
            category: data.data.sources[0].category,
            country: data.data.sources[0].country,
            language: data.data.sources[0].language
          }, 'info');
        }

        log('=== NEWSAPI REQUEST SUCCESSFUL ===', null, 'success');
      } else {
        log('NewsAPI request failed', {
          error: data.error || 'Unknown error',
          status: data.status
        }, 'error');

        log('=== NEWSAPI REQUEST FAILED ===', null, 'error');
      }

      displayAPIResult(data, requestBody, duration);

      return data;
    } catch (e) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      log('NewsAPI request error', {
        error: e.message,
        type: e.name,
        stack: e.stack,
        duration: `${duration}ms`
      }, 'error');

      log('=== NEWSAPI REQUEST FAILED ===', null, 'error');

      const errorResult = { success: false, error: e.message };
      displayAPIResult(errorResult, requestBody, duration);

      return errorResult;
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

    // Create result display
    const resultDiv = document.createElement('div');
    resultDiv.className = 'request-response-display';

    // Request box
    const requestBox = document.createElement('div');
    requestBox.className = 'request-box';
    requestBox.innerHTML = `
      <h4>Request <span class="status-badge">${duration}ms</span></h4>
      <pre>${JSON.stringify(request, null, 2)}</pre>
    `;

    // Response box
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

    // Try to get token from learn site session cookie
    const cookies = document.cookie.split(';');
    log('Checking cookies', { count: cookies.length }, 'verbose');

    const sessionCookie = cookies.find(c => c.trim().startsWith('learn_session='));

    if (sessionCookie) {
      const token = sessionCookie.split('=')[1];
      log('Found learn_session cookie', {
        exists: true,
        length: token.length
      }, 'info');

      const decoded = decodeJWT(token);

      const claimsEl = document.getElementById('token-claims-display');
      if (claimsEl && decoded) {
        claimsEl.innerHTML = `
          <pre>${JSON.stringify(decoded, null, 2)}</pre>
        `;
      }
    } else {
      log('No learn_session cookie found', {
        message: 'User may not be logged into learn site',
        availableCookies: cookies.map(c => c.split('=')[0].trim())
      }, 'warning');

      const claimsEl = document.getElementById('token-claims-display');
      if (claimsEl) {
        claimsEl.innerHTML = `
          <p>No session token found. You may need to log in to the learn site first.</p>
          <p>Available cookies: ${cookies.map(c => c.split('=')[0].trim()).join(', ') || 'None'}</p>
        `;
      }
    }
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    log('SDK Tester module initializing...', null, 'info');
    log('Configuration', CONFIG, 'verbose');

    // Wire up test connection button
    const testConnBtn = document.getElementById('test-connection-btn');
    if (testConnBtn) {
      log('Wiring up test connection button', null, 'verbose');
      testConnBtn.addEventListener('click', async () => {
        testConnBtn.disabled = true;
        testConnBtn.innerHTML = 'Testing... <span class="loading-spinner"></span>';

        await testConnection();

        testConnBtn.disabled = false;
        testConnBtn.textContent = 'Test Connection';
      });
    }

    // Wire up test API button
    const testApiBtn = document.getElementById('test-api-btn');
    if (testApiBtn) {
      log('Wiring up test API button', null, 'verbose');
      testApiBtn.addEventListener('click', async () => {
        const endpoint = document.getElementById('endpoint-select').value;
        const query = document.getElementById('query-input').value;
        const appId = document.getElementById('app-id-input').value;

        if (appId) {
          CONFIG.APP_ID = appId;
          log('App ID updated', { appId: CONFIG.APP_ID }, 'info');
        }

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

    // Wire up inspect token button
    const inspectTokenBtn = document.getElementById('inspect-token-btn');
    if (inspectTokenBtn) {
      log('Wiring up inspect token button', null, 'verbose');
      inspectTokenBtn.addEventListener('click', updateTokenInspector);
    }

    log('SDK Tester module initialized successfully', null, 'success');
    log('Ready to test SDK proxy functionality', {
      learnSiteUrl: CONFIG.LEARN_SITE_URL,
      appIdConfigured: !!CONFIG.APP_ID
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
    testConnection,
    callNewsAPI,
    decodeJWT,
    log,
    clearLog,
    updateTokenInspector,
    config: CONFIG
  };

  log('SDK Tester module loaded', { version: '1.0.0' }, 'info');
})();
