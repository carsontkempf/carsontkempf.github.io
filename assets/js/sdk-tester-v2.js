// SDK Tester V2 - Interactive API Test Console
// Auto-populated test scenarios for Lichess, NewsAPI, Spotify, etc.

(function() {
  'use strict';

  // Test scenario configurations
  const testScenarios = {
    'lichess-account': {
      name: 'Lichess: Get Account Info',
      keyName: 'lichess',
      endpoint: '/api/account',
      method: 'GET',
      description: 'Get authenticated user account information from Lichess'
    },
    'lichess-status': {
      name: 'Lichess: Server Status',
      keyName: 'lichess',
      endpoint: '/api',
      method: 'GET',
      description: 'Check Lichess API server status (no auth required)'
    },
    'lichess-games': {
      name: 'Lichess: Current Games',
      keyName: 'lichess',
      endpoint: '/api/account/playing',
      method: 'GET',
      description: 'Get list of games currently being played by authenticated user'
    },
    'lichess-profile': {
      name: 'Lichess: User Profile',
      keyName: 'lichess',
      endpoint: '/api/user/carsontkempf',
      method: 'GET',
      description: 'Get public profile information for user carsontkempf'
    },
    'lichess-leaderboard': {
      name: 'Lichess: Top Players',
      keyName: 'lichess',
      endpoint: '/api/player/top/10/bullet',
      method: 'GET',
      description: 'Get top 10 bullet chess players on Lichess'
    },
    'news-headlines': {
      name: 'NewsAPI: Top Headlines',
      keyName: 'news',
      endpoint: '/v2/top-headlines?country=us&pageSize=5',
      method: 'GET',
      description: 'Get top 5 breaking news headlines from US sources'
    },
    'news-everything': {
      name: 'NewsAPI: Search Everything',
      keyName: 'news',
      endpoint: '/v2/everything?q=technology&pageSize=5&sortBy=publishedAt',
      method: 'GET',
      description: 'Search for technology-related articles, sorted by publish date'
    },
    'news-sources': {
      name: 'NewsAPI: News Sources',
      keyName: 'news',
      endpoint: '/v2/sources?language=en',
      method: 'GET',
      description: 'Get list of available English news sources'
    },
    'spotify-profile': {
      name: 'Spotify: User Profile',
      keyName: 'spotify-client',
      endpoint: '/v1/me',
      method: 'GET',
      description: 'Get current authenticated user Spotify profile'
    }
  };

  let sdk = null;
  let currentScenario = 'lichess-account';

  // Debug logging
  function addDebugLog(message, type = 'info') {
    const debugLog = document.getElementById('debug-log');
    if (!debugLog) return;

    const entry = document.createElement('div');
    entry.className = `debug-entry ${type}`;

    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `
      <div class="debug-timestamp">${timestamp}</div>
      <div class="debug-message">
        <span class="debug-prefix">[SDK-TEST]</span> ${message}
      </div>
    `;

    debugLog.appendChild(entry);
    debugLog.scrollTop = debugLog.scrollHeight;
  }

  // Initialize SDK
  async function initSDK() {
    addDebugLog('Initializing SDK in zero-config mode...');

    try {
      if (typeof SecretsSDK === 'undefined') {
        throw new Error('SecretsSDK not loaded. Check that learn-secrets-sdk.js is included.');
      }

      // Initialize in zero-config mode (no appId or token)
      sdk = new SecretsSDK({
        baseUrl: 'https://cloudprototype.org'
      });

      addDebugLog('SDK initialized successfully', 'success');
      addDebugLog(`Base URL: https://cloudprototype.org`);
      addDebugLog(`Origin: ${window.location.origin}`);
      addDebugLog(`Zero-config mode: Origin-based authentication`);

      // Update SDK status
      const statusEl = document.getElementById('sdk-status');
      if (statusEl) {
        statusEl.textContent = 'SDK Ready';
        statusEl.className = 'ready';
      }

      return true;
    } catch (error) {
      addDebugLog(`SDK initialization failed: ${error.message}`, 'error');

      const statusEl = document.getElementById('sdk-status');
      if (statusEl) {
        statusEl.textContent = `Error: ${error.message}`;
        statusEl.className = 'error';
      }

      return false;
    }
  }

  // Update scenario details display
  function updateScenarioDetails() {
    const scenario = testScenarios[currentScenario];
    if (!scenario) return;

    const detailsEl = document.getElementById('scenario-details');
    if (!detailsEl) return;

    detailsEl.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Key Name:</span>
        <span class="detail-value">${scenario.keyName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Endpoint:</span>
        <span class="detail-value">${scenario.endpoint}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Method:</span>
        <span class="detail-value">${scenario.method}</span>
      </div>
      <div class="detail-description">
        ${scenario.description}
      </div>
    `;
  }

  // Update rate limit display
  function updateRateLimitDisplay() {
    if (!sdk) return;

    const usage = sdk.getUsage();
    const remainingEl = document.querySelector('.rate-remaining');
    const limitEl = document.querySelector('.rate-limit');
    const resetEl = document.querySelector('.rate-reset');

    if (!usage) {
      if (remainingEl) remainingEl.textContent = '--';
      if (limitEl) limitEl.textContent = '--';
      if (resetEl) resetEl.textContent = 'Resets: --';
      return;
    }

    if (remainingEl) {
      remainingEl.textContent = usage.remaining;
      // Change color based on remaining requests
      if (usage.remaining < 10) {
        remainingEl.style.color = '#dc3545'; // red
      } else if (usage.remaining < 30) {
        remainingEl.style.color = '#ffc107'; // yellow
      } else {
        remainingEl.style.color = '#27ae60'; // green
      }
    }

    if (limitEl) {
      limitEl.textContent = usage.limit;
    }

    if (resetEl) {
      const resetDate = new Date(usage.reset * 1000);
      const now = new Date();
      const secondsUntilReset = Math.max(0, Math.floor((resetDate - now) / 1000));
      const minutesUntilReset = Math.floor(secondsUntilReset / 60);
      const secondsRemainder = secondsUntilReset % 60;

      if (minutesUntilReset > 0) {
        resetEl.textContent = `Resets in: ${minutesUntilReset}m ${secondsRemainder}s`;
      } else if (secondsUntilReset > 0) {
        resetEl.textContent = `Resets in: ${secondsUntilReset}s`;
      } else {
        resetEl.textContent = 'Resets: now';
      }
    }
  }

  // Run API test
  async function runTest() {
    if (!sdk) {
      addDebugLog('SDK not initialized. Initializing now...', 'warning');
      const success = await initSDK();
      if (!success) {
        return;
      }
    }

    const scenario = testScenarios[currentScenario];
    if (!scenario) {
      addDebugLog('Invalid test scenario selected', 'error');
      return;
    }

    const statusEl = document.getElementById('test-result-status');
    const dataEl = document.getElementById('test-result-data');

    if (statusEl) {
      statusEl.innerHTML = '<span class="status-badge status-loading">Loading...</span>';
    }

    if (dataEl) {
      dataEl.textContent = 'Running test...';
    }

    addDebugLog('=== TEST STARTED ===');
    addDebugLog(`Scenario: ${scenario.name}`);
    addDebugLog(`Key Name: ${scenario.keyName}`);
    addDebugLog(`Endpoint: ${scenario.endpoint}`);
    addDebugLog(`Method: ${scenario.method}`);
    addDebugLog(`SDK Mode: ${sdk.zeroConfigMode ? 'Zero-Config (Origin-based)' : 'Token-based'}`);

    const startTime = performance.now();

    try {
      addDebugLog('Sending request to SDK proxy...');
      addDebugLog(`Proxy URL: POST https://cloudprototype.org/api/sdk/proxy`);
      addDebugLog(`Request Headers: { "Content-Type": "application/json", "Origin": "${window.location.origin}" }`);
      addDebugLog(`Request Body: ${JSON.stringify({
        keyName: scenario.keyName,
        endpoint: scenario.endpoint,
        method: scenario.method
      }, null, 2)}`);

      const response = await sdk.call(scenario.keyName, scenario.endpoint, {
        method: scenario.method
      });

      const duration = performance.now() - startTime;

      // Log rate limit information if available
      const usage = sdk.getUsage();
      if (usage) {
        addDebugLog(`Rate Limit Info:`, 'success');
        addDebugLog(`  - Limit: ${usage.limit} requests/minute`);
        addDebugLog(`  - Remaining: ${usage.remaining} requests`);
        addDebugLog(`  - Resets at: ${new Date(usage.reset * 1000).toLocaleTimeString()}`);
      } else {
        addDebugLog(`Rate Limit Info: Not available in response headers`);
      }

      addDebugLog(`Response Status: 200 OK`, 'success');
      addDebugLog(`Response Time: ${duration.toFixed(2)}ms`, 'success');
      addDebugLog(`Response Data Type: ${typeof response}`);
      addDebugLog(`Response Data Length: ${JSON.stringify(response).length} characters`);

      // Log first 500 chars of response
      const responsePreview = JSON.stringify(response, null, 2);
      if (responsePreview.length > 500) {
        addDebugLog(`Response Preview (first 500 chars):\n${responsePreview.substring(0, 500)}...`);
      } else {
        addDebugLog(`Response Data:\n${responsePreview}`);
      }

      if (statusEl) {
        statusEl.innerHTML = `
          <span class="status-badge status-success">Success</span>
          <span style="margin-left: 1rem; color: #666; font-size: 0.9rem;">
            ${duration.toFixed(0)}ms
          </span>
        `;
      }

      if (dataEl) {
        dataEl.textContent = JSON.stringify(response, null, 2);
      }

      // Update rate limit display
      updateRateLimitDisplay();

      addDebugLog('=== TEST COMPLETED SUCCESSFULLY ===', 'success');

    } catch (error) {
      const duration = performance.now() - startTime;

      addDebugLog(`Request failed after ${duration.toFixed(2)}ms`, 'error');
      addDebugLog(`Error Type: ${error.name || 'Error'}`, 'error');
      addDebugLog(`Error Message: ${error.message}`, 'error');

      // Log status code if available
      if (error.status) {
        addDebugLog(`HTTP Status Code: ${error.status}`, 'error');
      }

      // Log response body if available
      if (error.response) {
        addDebugLog(`Error Response Body: ${JSON.stringify(error.response, null, 2)}`, 'error');
      }

      // Log rate limit info even on error
      const usage = sdk.getUsage();
      if (usage) {
        addDebugLog(`Rate Limit Info (from headers):`, 'error');
        addDebugLog(`  - Limit: ${usage.limit}`);
        addDebugLog(`  - Remaining: ${usage.remaining}`);
        addDebugLog(`  - Resets at: ${new Date(usage.reset * 1000).toLocaleTimeString()}`);
      }

      // Log full stack trace
      if (error.stack) {
        addDebugLog(`Stack Trace:\n${error.stack}`, 'error');
      }

      // Log any additional error properties
      const errorKeys = Object.keys(error).filter(k => !['name', 'message', 'stack', 'status', 'response'].includes(k));
      if (errorKeys.length > 0) {
        addDebugLog(`Additional Error Properties:`, 'error');
        errorKeys.forEach(key => {
          addDebugLog(`  - ${key}: ${JSON.stringify(error[key])}`, 'error');
        });
      }

      if (statusEl) {
        statusEl.innerHTML = `
          <span class="status-badge status-error">Error</span>
          <span style="margin-left: 1rem; color: #721c24; font-size: 0.9rem;">
            ${error.status || 'Network Error'}
          </span>
        `;
      }

      if (dataEl) {
        const errorDetails = {
          error: error.message,
          type: error.name,
          status: error.status,
          response: error.response,
          timestamp: new Date().toISOString()
        };
        dataEl.textContent = JSON.stringify(errorDetails, null, 2);
        dataEl.style.color = '#721c24';
      }

      // Update rate limit display even on error
      updateRateLimitDisplay();

      addDebugLog('=== TEST FAILED ===', 'error');
    }
  }

  // Run CORS diagnostics
  async function runCORSDiagnostics() {
    addDebugLog('=== CORS DIAGNOSTICS STARTED ===');
    addDebugLog('Testing CORS configuration for cloudprototype.org...');
    addDebugLog(`Current Origin: ${window.location.origin}`);
    addDebugLog(`User Agent: ${navigator.userAgent.substring(0, 100)}...`);

    try {
      // Test 1: OPTIONS preflight
      addDebugLog('Test 1: OPTIONS preflight request...');
      addDebugLog('Sending OPTIONS request to /api/sdk/proxy');
      addDebugLog('Headers: Origin, Access-Control-Request-Method, Access-Control-Request-Headers');

      const preflightStart = performance.now();
      const preflightResponse = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });
      const preflightDuration = performance.now() - preflightStart;

      addDebugLog(`Preflight Status: ${preflightResponse.status} ${preflightResponse.statusText}`,
                  preflightResponse.status === 204 ? 'success' : 'warning');
      addDebugLog(`Preflight Duration: ${preflightDuration.toFixed(2)}ms`);

      addDebugLog('All Preflight Response Headers:');
      const corsHeaders = [];
      const otherHeaders = [];
      preflightResponse.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith('access-control')) {
          corsHeaders.push(`  ${key}: ${value}`);
        } else {
          otherHeaders.push(`  ${key}: ${value}`);
        }
      });

      if (corsHeaders.length > 0) {
        addDebugLog('CORS Headers:', 'success');
        corsHeaders.forEach(h => addDebugLog(h, 'success'));
      } else {
        addDebugLog('WARNING: No CORS headers found in preflight response!', 'warning');
      }

      if (otherHeaders.length > 0) {
        addDebugLog('Other Headers:');
        otherHeaders.forEach(h => addDebugLog(h));
      }

      // Test 2: Simple GET request
      addDebugLog('Test 2: Simple GET request to /api/version (no preflight)...');

      const getStart = performance.now();
      const getResponse = await fetch('https://cloudprototype.org/api/version');
      const getDuration = performance.now() - getStart;

      addDebugLog(`GET Status: ${getResponse.status} ${getResponse.statusText}`,
                  getResponse.ok ? 'success' : 'error');
      addDebugLog(`GET Duration: ${getDuration.toFixed(2)}ms`);

      const data = await getResponse.json();
      addDebugLog(`Response Data: ${JSON.stringify(data, null, 2)}`, 'success');

      // Test 3: Check if CORS allows our origin
      const allowedOrigin = preflightResponse.headers.get('access-control-allow-origin');
      if (allowedOrigin) {
        if (allowedOrigin === '*' || allowedOrigin === window.location.origin) {
          addDebugLog(`CORS Check: Origin "${window.location.origin}" is allowed ✓`, 'success');
        } else {
          addDebugLog(`CORS Check: Origin mismatch! Allowed: "${allowedOrigin}", Current: "${window.location.origin}"`, 'error');
        }
      } else {
        addDebugLog('CORS Check: No Access-Control-Allow-Origin header found', 'warning');
      }

      // Test 4: Check allowed methods
      const allowedMethods = preflightResponse.headers.get('access-control-allow-methods');
      if (allowedMethods) {
        const hasPOST = allowedMethods.includes('POST');
        addDebugLog(`Allowed Methods: ${allowedMethods}`, hasPOST ? 'success' : 'warning');
        if (!hasPOST) {
          addDebugLog('WARNING: POST method not in allowed methods!', 'warning');
        }
      }

      addDebugLog('=== CORS DIAGNOSTICS COMPLETED ===', 'success');

    } catch (error) {
      addDebugLog(`CORS diagnostic failed: ${error.message}`, 'error');
      addDebugLog(`Error Type: ${error.name}`, 'error');

      if (error.stack) {
        addDebugLog(`Stack Trace:\n${error.stack}`, 'error');
      }

      // Network error specific guidance
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        addDebugLog('This appears to be a network-level failure.', 'error');
        addDebugLog('Possible causes:', 'error');
        addDebugLog('  1. Server is unreachable', 'error');
        addDebugLog('  2. CORS is blocking the request entirely', 'error');
        addDebugLog('  3. Browser security policy preventing cross-origin request', 'error');
        addDebugLog('  4. SSL/TLS certificate issue', 'error');
      }

      addDebugLog('=== CORS DIAGNOSTICS FAILED ===', 'error');
    }
  }

  // Clear debug log
  function clearDebugLog() {
    const debugLog = document.getElementById('debug-log');
    if (debugLog) {
      debugLog.innerHTML = `
        <div class="debug-entry info">
          <div class="debug-timestamp">--</div>
          <div class="debug-message">
            <span class="debug-prefix">[SDK-TEST]</span> Debug log cleared
          </div>
        </div>
      `;
    }
  }

  // Copy debug log to clipboard
  function copyDebugLog() {
    const debugLog = document.getElementById('debug-log');
    if (!debugLog) return;

    const text = Array.from(debugLog.querySelectorAll('.debug-entry')).map(entry => {
      const timestamp = entry.querySelector('.debug-timestamp')?.textContent || '--';
      const message = entry.querySelector('.debug-message')?.textContent || '';
      return `[${timestamp}] ${message}`;
    }).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      addDebugLog('Debug log copied to clipboard', 'success');
    }).catch(err => {
      addDebugLog(`Failed to copy log: ${err.message}`, 'error');
    });
  }

  // Enhanced CORS diagnostics using dedicated endpoint
  async function runEnhancedCORSDiagnostics() {
    addDebugLog('=== ENHANCED CORS DIAGNOSTICS STARTED ===');
    addDebugLog(`Testing endpoint: https://cloudprototype.org/api/cors/diagnostic`);
    addDebugLog(`Current Origin: ${window.location.origin}`);

    try {
      // Test OPTIONS preflight
      addDebugLog('Step 1: Testing OPTIONS preflight request...');
      const preflightStart = performance.now();

      const preflightResponse = await fetch('https://cloudprototype.org/api/cors/diagnostic', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });

      const preflightDuration = performance.now() - preflightStart;
      addDebugLog(`Preflight Status: ${preflightResponse.status} ${preflightResponse.statusText}`, 'success');
      addDebugLog(`Preflight Duration: ${preflightDuration.toFixed(2)}ms`, 'success');

      // Log all preflight response headers
      addDebugLog('Preflight Response Headers:');
      const preflightHeaders = {};
      preflightResponse.headers.forEach((value, key) => {
        preflightHeaders[key] = value;
        if (key.toLowerCase().startsWith('access-control') || key.toLowerCase().startsWith('x-')) {
          addDebugLog(`  ${key}: ${value}`, 'success');
        }
      });

      // Test GET request
      addDebugLog('Step 2: Testing GET request with comprehensive diagnostics...');
      const getStart = performance.now();

      const getResponse = await fetch('https://cloudprototype.org/api/cors/diagnostic', {
        method: 'GET',
        headers: {
          'Origin': window.location.origin
        }
      });

      const getDuration = performance.now() - getStart;
      addDebugLog(`GET Status: ${getResponse.status} ${getResponse.statusText}`, 'success');
      addDebugLog(`GET Duration: ${getDuration.toFixed(2)}ms`, 'success');

      // Log all GET response headers
      addDebugLog('GET Response Headers:');
      getResponse.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith('access-control') || key.toLowerCase().startsWith('x-')) {
          addDebugLog(`  ${key}: ${value}`, 'success');
        }
      });

      // Parse and display diagnostic data
      const diagnosticData = await getResponse.json();
      addDebugLog('Diagnostic Data Received:', 'success');
      addDebugLog(`  Server Framework: ${diagnosticData.server_info?.framework}`, 'success');
      addDebugLog(`  Server Platform: ${diagnosticData.server_info?.platform}`, 'success');
      addDebugLog(`  Allowed Origin: ${diagnosticData.cors_config?.allowed_origin}`, 'success');
      addDebugLog(`  Allowed Methods: ${diagnosticData.cors_config?.allowed_methods.join(', ')}`, 'success');
      addDebugLog(`  Allowed Headers: ${diagnosticData.cors_config?.allowed_headers.join(', ')}`, 'success');

      // Display test results
      addDebugLog('Test Results:');
      Object.entries(diagnosticData.tests || {}).forEach(([key, value]) => {
        const status = value ? '' : '';
        addDebugLog(`  ${key}: ${value}${status}`, value ? 'success' : 'warning');
      });

      // Display recommendations
      if (diagnosticData.recommendations && diagnosticData.recommendations.length > 0) {
        addDebugLog('Recommendations:');
        diagnosticData.recommendations.forEach(rec => {
          addDebugLog(`  - ${rec}`, 'warning');
        });
      }

      // Test POST request
      addDebugLog('Step 3: Testing POST request...');
      const postStart = performance.now();

      const postResponse = await fetch('https://cloudprototype.org/api/cors/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          test: 'cors-diagnostic',
          timestamp: new Date().toISOString()
        })
      });

      const postDuration = performance.now() - postStart;
      addDebugLog(`POST Status: ${postResponse.status} ${postResponse.statusText}`, 'success');
      addDebugLog(`POST Duration: ${postDuration.toFixed(2)}ms`, 'success');

      const postData = await postResponse.json();
      addDebugLog(`POST Response: ${JSON.stringify(postData, null, 2)}`, 'success');

      addDebugLog('=== ENHANCED CORS DIAGNOSTICS COMPLETED SUCCESSFULLY ===', 'success');

    } catch (error) {
      addDebugLog(`Enhanced CORS diagnostic failed: ${error.message}`, 'error');

      if (error.message.includes('Failed to fetch')) {
        addDebugLog('Network-level failure detected:', 'error');
        addDebugLog('Possible causes:', 'error');
        addDebugLog('  1. Server is unreachable', 'error');
        addDebugLog('  2. DNS resolution failure', 'error');
        addDebugLog('  3. SSL/TLS certificate issue', 'error');
        addDebugLog('  4. CORS policy blocking at browser level', 'error');
        addDebugLog('  5. Network proxy or firewall blocking request', 'error');
      }

      if (error.stack) {
        addDebugLog(`Stack Trace: ${error.stack}`, 'error');
      }

      addDebugLog('=== ENHANCED CORS DIAGNOSTICS FAILED ===', 'error');
    }
  }

  // Secrets configuration diagnostics
  async function runSecretsDiagnostics() {
    const keyNameInput = document.getElementById('diagnostic-key-name');
    const keyName = keyNameInput ? keyNameInput.value.trim() : 'lichess';
    const resultContainer = document.getElementById('secrets-diagnostic-result');

    if (!keyName) {
      addDebugLog('Please enter a secret name to diagnose', 'error');
      return;
    }

    addDebugLog('=== SECRETS CONFIGURATION DIAGNOSTICS STARTED ===');
    addDebugLog(`Checking secret: "${keyName}"`);
    addDebugLog(`Project AppID: VtI8BSvhxAwNIIDR`);

    try {
      const diagnosticStart = performance.now();

      const response = await fetch(`https://cloudprototype.org/api/projects/VtI8BSvhxAwNIIDR/secrets/diagnostic?keyName=${encodeURIComponent(keyName)}`, {
        method: 'GET',
        headers: {
          'Origin': window.location.origin
        }
      });

      const diagnosticDuration = performance.now() - diagnosticStart;
      addDebugLog(`Response Status: ${response.status} ${response.statusText}`);
      addDebugLog(`Response Time: ${diagnosticDuration.toFixed(2)}ms`);

      const data = await response.json();

      if (!data.success) {
        addDebugLog(`Diagnostic failed: ${data.error}`, 'error');
        if (data.diagnostic) {
          addDebugLog(`Step: ${data.diagnostic.step}`, 'error');
          addDebugLog(`Message: ${data.diagnostic.message}`, 'error');
          addDebugLog(`Action: ${data.diagnostic.action}`, 'warning');
        }
        addDebugLog('=== SECRETS DIAGNOSTICS FAILED ===', 'error');
        return;
      }

      // Display project information
      addDebugLog('Project Information:', 'success');
      addDebugLog(`  Project ID: ${data.project.id}`, 'success');
      addDebugLog(`  App ID: ${data.project.appid}`, 'success');
      addDebugLog(`  Created By: ${data.project.created_by}`, 'success');
      addDebugLog(`  SDK Access Expires: ${data.project.sdk_access_expires_at || 'Never'}`, 'success');
      addDebugLog(`  Access Expired: ${data.project.access_expired ? 'YES' : 'NO'}`, data.project.access_expired ? 'error' : 'success');

      // Display secrets information
      addDebugLog('Secrets Information:', 'success');
      addDebugLog(`  Total Secrets in Project: ${data.secrets.total_count}`, 'success');
      addDebugLog(`  All Secret Names: ${data.secrets.all_names.join(', ') || '(none)'}`, 'success');
      addDebugLog(`  Requested Secret: "${data.secrets.requested_key}"`, 'success');
      addDebugLog(`  Secret Exists: ${data.secrets.key_exists ? 'YES' : 'NO'}`, data.secrets.key_exists ? 'success' : 'error');

      if (data.secrets.key_exists && data.secrets.key_config) {
        addDebugLog('Secret Configuration:', 'success');
        addDebugLog(`  Name: ${data.secrets.key_config.name}`, 'success');
        addDebugLog(`  Provider: ${data.secrets.key_config.provider}`, 'success');
        addDebugLog(`  Base URL: ${data.secrets.key_config.base_url}`, 'success');
        addDebugLog(`  Auth Header: ${data.secrets.key_config.auth_header}`, 'success');
        addDebugLog(`  Auth Prefix: ${data.secrets.key_config.auth_prefix}`, 'success');
        addDebugLog(`  Has API Key: ${data.secrets.key_config.has_api_key ? 'YES' : 'NO'}`, data.secrets.key_config.has_api_key ? 'success' : 'error');
        addDebugLog(`  API Key Length: ${data.secrets.key_config.api_key_length} characters`, 'success');
        addDebugLog(`  Encrypted: ${data.secrets.key_config.is_encrypted ? 'YES' : 'NO'}`, 'success');
        addDebugLog(`  Created: ${data.secrets.key_config.created}`, 'success');
        addDebugLog(`  Last Updated: ${data.secrets.key_config.updated}`, 'success');
      }

      // Display SDK token information
      addDebugLog('SDK Token Information:', 'success');
      addDebugLog(`  Total Tokens: ${data.sdk_tokens.total_count}`, 'success');

      if (data.sdk_tokens.tokens && data.sdk_tokens.tokens.length > 0) {
        data.sdk_tokens.tokens.forEach((token, index) => {
          addDebugLog(`  Token ${index + 1}:`, 'success');
          addDebugLog(`    Label: ${token.label}`, 'success');
          addDebugLog(`    Prefix: ${token.token_prefix}`, 'success');
          addDebugLog(`    Origins: ${token.origins.join(', ')}`, 'success');
          addDebugLog(`    Expires: ${token.expires_at || 'Never'}`, 'success');
          addDebugLog(`    Expired: ${token.is_expired ? 'YES' : 'NO'}`, token.is_expired ? 'error' : 'success');
        });
      } else {
        addDebugLog('  No SDK tokens found', 'warning');
      }

      // Display origin validation
      addDebugLog('Origin Validation:', 'success');
      addDebugLog(`  Request Origin: ${data.origin_validation.request_origin}`, 'success');
      addDebugLog(`  Origin Hostname: ${data.origin_validation.origin_hostname}`, 'success');
      addDebugLog(`  Is Configured: ${data.origin_validation.is_configured ? 'YES' : 'NO'}`, data.origin_validation.is_configured ? 'success' : 'error');

      if (data.origin_validation.matching_token) {
        addDebugLog(`  Matching Token: ${data.origin_validation.matching_token.label}`, 'success');
        addDebugLog(`  Token Origins: ${data.origin_validation.matching_token.origins.join(', ')}`, 'success');
      }

      // Display issues and recommendations
      if (data.issues_found && data.issues_found.length > 0) {
        addDebugLog('ISSUES FOUND:', 'error');
        data.issues_found.forEach(issue => {
          addDebugLog(`  - ${issue}`, 'error');
        });
      } else {
        addDebugLog('No issues found', 'success');
      }

      if (data.recommended_actions && data.recommended_actions.length > 0) {
        addDebugLog('RECOMMENDED ACTIONS:', 'warning');
        data.recommended_actions.forEach(action => {
          addDebugLog(`  - ${action}`, 'warning');
        });
      }

      // Update result container with visual summary
      if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `
          <div style="border: 1px solid ${data.secrets.key_exists ? '#d4edda' : '#f8d7da'}; border-radius: 4px; padding: 1rem; background: ${data.secrets.key_exists ? '#d4edda' : '#f8d7da'}; margin-top: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: ${data.secrets.key_exists ? '#155724' : '#721c24'};">
              ${data.secrets.key_exists ? 'Secret Found' : 'Secret Not Found'}
            </h4>
            <p style="margin: 0; color: #333;">
              ${data.secrets.key_exists
                ? `Secret "${keyName}" is configured in project VtI8BSvhxAwNIIDR.`
                : `Secret "${keyName}" does not exist. Available secrets: ${data.secrets.all_names.join(', ') || '(none)'}`
              }
            </p>
            ${data.issues_found && data.issues_found.length > 0 ? `
              <details style="margin-top: 1rem;">
                <summary style="cursor: pointer; font-weight: 600;">Issues (${data.issues_found.length})</summary>
                <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
                  ${data.issues_found.map(issue => `<li style="margin: 0.25rem 0;">${issue}</li>`).join('')}
                </ul>
              </details>
            ` : ''}
            ${data.recommended_actions && data.recommended_actions.length > 0 ? `
              <details style="margin-top: 1rem;">
                <summary style="cursor: pointer; font-weight: 600;">Recommended Actions (${data.recommended_actions.length})</summary>
                <ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">
                  ${data.recommended_actions.map(action => `<li style="margin: 0.25rem 0;">${action}</li>`).join('')}
                </ul>
              </details>
            ` : ''}
          </div>
        `;
      }

      addDebugLog('=== SECRETS DIAGNOSTICS COMPLETED SUCCESSFULLY ===', 'success');

    } catch (error) {
      addDebugLog(`Secrets diagnostic failed: ${error.message}`, 'error');

      if (error.stack) {
        addDebugLog(`Stack Trace: ${error.stack}`, 'error');
      }

      addDebugLog('=== SECRETS DIAGNOSTICS FAILED ===', 'error');
    }
  }

  // ========================================
  // SYSTEMATIC TEST FRAMEWORK
  // ========================================

  // Test runner state
  let systematicTestState = {
    currentLayer: null,
    currentTest: null,
    results: {},
    startTime: null,
    allPassed: false
  };

  // Layer 1: Network Connectivity Tests
  async function runLayer1NetworkTests() {
    addDebugLog('=== LAYER 1: NETWORK CONNECTIVITY TESTS ===', 'info');
    systematicTestState.currentLayer = 'layer1';

    const layer1Results = {
      layer: 1,
      name: 'Network Connectivity',
      tests: [],
      allPassed: true
    };

    // Test 1.1: DNS Resolution
    addDebugLog('[L1.1] Testing DNS resolution for cloudprototype.org...', 'info');
    try {
      const dnsStart = performance.now();
      const response = await fetch('https://cloudprototype.org/favicon.ico', {
        method: 'HEAD',
        cache: 'no-store'
      });
      const dnsTime = performance.now() - dnsStart;

      layer1Results.tests.push({
        id: 'L1.1',
        name: 'DNS Resolution',
        status: response.ok ? 'PASS' : 'FAIL',
        duration: dnsTime,
        details: `DNS resolved in ${dnsTime.toFixed(2)}ms, status: ${response.status}`
      });

      addDebugLog(`[L1.1] PASS - DNS resolution successful (${dnsTime.toFixed(2)}ms)`, 'success');
    } catch (error) {
      layer1Results.tests.push({
        id: 'L1.1',
        name: 'DNS Resolution',
        status: 'FAIL',
        error: error.message,
        details: 'Failed to resolve cloudprototype.org'
      });
      layer1Results.allPassed = false;
      addDebugLog(`[L1.1] FAIL - DNS resolution failed: ${error.message}`, 'error');
    }

    // Test 1.2: SSL Certificate Validation
    addDebugLog('[L1.2] Testing SSL certificate...', 'info');
    try {
      const sslStart = performance.now();
      const response = await fetch('https://cloudprototype.org/', {
        method: 'HEAD',
        cache: 'no-store'
      });
      const sslTime = performance.now() - sslStart;

      layer1Results.tests.push({
        id: 'L1.2',
        name: 'SSL Certificate',
        status: 'PASS',
        duration: sslTime,
        details: `SSL handshake successful (${sslTime.toFixed(2)}ms)`
      });

      addDebugLog(`[L1.2] PASS - SSL certificate valid (${sslTime.toFixed(2)}ms)`, 'success');
    } catch (error) {
      layer1Results.tests.push({
        id: 'L1.2',
        name: 'SSL Certificate',
        status: 'FAIL',
        error: error.message,
        details: 'SSL certificate validation failed'
      });
      layer1Results.allPassed = false;
      addDebugLog(`[L1.2] FAIL - SSL validation failed: ${error.message}`, 'error');
    }

    // Test 1.3: Basic HTTP Reachability (no-cors mode)
    addDebugLog('[L1.3] Testing basic HTTP reachability (no-cors mode)...', 'info');
    addDebugLog('[L1.3-VERBOSE] Using mode: no-cors to bypass CORS restrictions', 'info');
    try {
      const httpStart = performance.now();
      const response = await fetch('https://cloudprototype.org/', {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store'
      });
      const httpTime = performance.now() - httpStart;

      addDebugLog(`[L1.3-VERBOSE] Response type: ${response.type}`, 'info');
      addDebugLog(`[L1.3-VERBOSE] Response status: ${response.status}`, 'info');

      // With no-cors, we get opaque response (type: 'opaque', status: 0)
      // But if it completes without error, server is reachable
      const reachable = response.type === 'opaque' || response.ok;

      layer1Results.tests.push({
        id: 'L1.3',
        name: 'HTTP Reachability (no-cors)',
        status: reachable ? 'PASS' : 'FAIL',
        duration: httpTime,
        details: `Type: ${response.type}, Status: ${response.status}, Time: ${httpTime.toFixed(2)}ms`
      });

      if (reachable) {
        addDebugLog(`[L1.3] PASS - Server reachable (${response.type}, ${httpTime.toFixed(2)}ms)`, 'success');
      } else {
        layer1Results.allPassed = false;
        addDebugLog(`[L1.3] FAIL - Server returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer1Results.tests.push({
        id: 'L1.3',
        name: 'HTTP Reachability (no-cors)',
        status: 'FAIL',
        error: error.message,
        details: 'Failed to reach server'
      });
      layer1Results.allPassed = false;
      addDebugLog(`[L1.3] FAIL - Server unreachable: ${error.message}`, 'error');
    }

    // Test 1.3b: Same-Origin Request Test
    addDebugLog('[L1.3b] Testing same-origin request (control test)...', 'info');
    try {
      const sameOriginStart = performance.now();
      const response = await fetch(window.location.origin + '/', {
        method: 'HEAD',
        cache: 'no-store'
      });
      const sameOriginTime = performance.now() - sameOriginStart;

      layer1Results.tests.push({
        id: 'L1.3b',
        name: 'Same-Origin Control Test',
        status: response.ok ? 'PASS' : 'FAIL',
        duration: sameOriginTime,
        details: `Confirms fetch() works on same-origin (${response.status})`
      });

      if (response.ok) {
        addDebugLog(`[L1.3b] PASS - Same-origin fetch works (${sameOriginTime.toFixed(2)}ms)`, 'success');
      } else {
        addDebugLog(`[L1.3b] FAIL - Same-origin fetch failed (${response.status})`, 'error');
      }
    } catch (error) {
      layer1Results.tests.push({
        id: 'L1.3b',
        name: 'Same-Origin Control Test',
        status: 'FAIL',
        error: error.message
      });
      addDebugLog(`[L1.3b] FAIL - ${error.message}`, 'error');
    }

    // Test 1.4: API Endpoint Availability
    addDebugLog('[L1.4] Testing API endpoint availability...', 'info');
    try {
      const apiStart = performance.now();
      const response = await fetch('https://cloudprototype.org/api/version', {
        method: 'GET',
        cache: 'no-store'
      });
      const apiTime = performance.now() - apiStart;

      if (response.ok) {
        const data = await response.json();
        layer1Results.tests.push({
          id: 'L1.4',
          name: 'API Endpoint',
          status: 'PASS',
          duration: apiTime,
          details: `API version: ${data.version || 'unknown'}, Time: ${apiTime.toFixed(2)}ms`
        });
        addDebugLog(`[L1.4] PASS - API endpoint responding (v${data.version}, ${apiTime.toFixed(2)}ms)`, 'success');
      } else {
        layer1Results.tests.push({
          id: 'L1.4',
          name: 'API Endpoint',
          status: 'FAIL',
          duration: apiTime,
          details: `Status: ${response.status}`
        });
        layer1Results.allPassed = false;
        addDebugLog(`[L1.4] FAIL - API endpoint returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer1Results.tests.push({
        id: 'L1.4',
        name: 'API Endpoint',
        status: 'FAIL',
        error: error.message,
        details: 'API endpoint unreachable'
      });
      layer1Results.allPassed = false;
      addDebugLog(`[L1.4] FAIL - API endpoint error: ${error.message}`, 'error');
    }

    // Test 1.5: Log recommendation to run cURL test
    addDebugLog('[L1.5] Browser-based testing complete. Run server-side cURL test:', 'info');
    addDebugLog('  curl -i -X OPTIONS https://cloudprototype.org/api/sdk/proxy \\', 'info');
    addDebugLog(`    -H "Origin: ${origin}" \\`, 'info');
    addDebugLog('    -H "Access-Control-Request-Method: POST"', 'info');
    addDebugLog('  Check if CORS headers appear in server response', 'info');

    layer1Results.tests.push({
      id: 'L1.5',
      name: 'cURL Test Recommendation',
      status: 'INFO',
      details: {
        message: 'Run cURL command to bypass browser CORS restrictions',
        command: `curl -i -X OPTIONS https://cloudprototype.org/api/sdk/proxy -H "Origin: ${origin}" -H "Access-Control-Request-Method: POST"`
      }
    });

    addDebugLog(`=== LAYER 1 COMPLETE: ${layer1Results.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`,
                layer1Results.allPassed ? 'success' : 'error');

    return layer1Results;
  }

  // Layer 2: CORS Configuration Tests
  async function runLayer2CORSTests() {
    addDebugLog('=== LAYER 2: CORS CONFIGURATION TESTS ===', 'info');
    systematicTestState.currentLayer = 'layer2';

    const layer2Results = {
      layer: 2,
      name: 'CORS Configuration',
      tests: [],
      allPassed: true
    };

    const origin = window.location.origin;

    // Test 2.1: OPTIONS Preflight to SDK Proxy
    addDebugLog('[L2.1] Testing OPTIONS preflight to /api/sdk/proxy...', 'info');
    addDebugLog(`[L2.1-VERBOSE] Request details:`, 'info');
    addDebugLog(`  URL: https://cloudprototype.org/api/sdk/proxy`, 'info');
    addDebugLog(`  Method: OPTIONS`, 'info');
    addDebugLog(`  Origin: ${origin}`, 'info');
    addDebugLog(`  Request-Method: POST`, 'info');
    addDebugLog(`  Request-Headers: content-type`, 'info');

    try {
      const preflightStart = performance.now();
      const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });
      const preflightTime = performance.now() - preflightStart;

      // Capture ALL response headers
      const allResponseHeaders = {};
      response.headers.forEach((value, key) => {
        allResponseHeaders[key] = value;
      });

      addDebugLog(`[L2.1-VERBOSE] Response received:`, 'info');
      addDebugLog(`  Status: ${response.status} ${response.statusText}`, 'info');
      addDebugLog(`  Duration: ${preflightTime.toFixed(2)}ms`, 'info');
      addDebugLog(`  ALL Headers: ${JSON.stringify(allResponseHeaders, null, 2)}`, 'info');

      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      const allowMethods = response.headers.get('Access-Control-Allow-Methods');
      const allowHeaders = response.headers.get('Access-Control-Allow-Headers');
      const allowCredentials = response.headers.get('Access-Control-Allow-Credentials');
      const maxAge = response.headers.get('Access-Control-Max-Age');

      addDebugLog(`[L2.1-VERBOSE] CORS-specific headers:`, 'info');
      addDebugLog(`  Allow-Origin: ${allowOrigin}`, allowOrigin ? 'success' : 'error');
      addDebugLog(`  Allow-Methods: ${allowMethods}`, allowMethods ? 'success' : 'error');
      addDebugLog(`  Allow-Headers: ${allowHeaders}`, allowHeaders ? 'success' : 'error');
      addDebugLog(`  Allow-Credentials: ${allowCredentials}`, 'info');
      addDebugLog(`  Max-Age: ${maxAge}`, 'info');

      const passed = response.status === 204 && allowOrigin;

      layer2Results.tests.push({
        id: 'L2.1',
        name: 'SDK Proxy Preflight',
        status: passed ? 'PASS' : 'FAIL',
        duration: preflightTime,
        details: {
          status: response.status,
          allowOrigin: allowOrigin,
          allowMethods: allowMethods,
          allowHeaders: allowHeaders,
          allHeaders: allResponseHeaders,
          time: preflightTime
        }
      });

      if (passed) {
        addDebugLog(`[L2.1] PASS - Preflight OK (${response.status}, ${preflightTime.toFixed(2)}ms)`, 'success');
        addDebugLog(`  Allow-Origin: ${allowOrigin}`, 'success');
        addDebugLog(`  Allow-Methods: ${allowMethods}`, 'success');
      } else {
        layer2Results.allPassed = false;
        addDebugLog(`[L2.1] FAIL - Preflight failed (${response.status})`, 'error');
        if (!allowOrigin) {
          addDebugLog(`  CRITICAL: Access-Control-Allow-Origin header is MISSING`, 'error');
        }
      }
    } catch (error) {
      addDebugLog(`[L2.1-VERBOSE] Exception details:`, 'error');
      addDebugLog(`  Error message: ${error.message}`, 'error');
      addDebugLog(`  Error type: ${error.constructor.name}`, 'error');
      addDebugLog(`  Error stack: ${error.stack}`, 'error');

      layer2Results.tests.push({
        id: 'L2.1',
        name: 'SDK Proxy Preflight',
        status: 'FAIL',
        error: error.message,
        errorType: error.constructor.name
      });
      layer2Results.allPassed = false;
      addDebugLog(`[L2.1] FAIL - Preflight request failed: ${error.message}`, 'error');
    }

    // Test 2.2: OPTIONS Preflight to CORS Diagnostic Endpoint
    addDebugLog('[L2.2] Testing OPTIONS preflight to /api/cors/diagnostic...', 'info');
    addDebugLog(`[L2.2-VERBOSE] Request details:`, 'info');
    addDebugLog(`  URL: https://cloudprototype.org/api/cors/diagnostic`, 'info');
    addDebugLog(`  Method: OPTIONS`, 'info');
    addDebugLog(`  Origin: ${origin}`, 'info');

    try {
      const preflightStart = performance.now();
      const response = await fetch('https://cloudprototype.org/api/cors/diagnostic', {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'content-type'
        }
      });
      const preflightTime = performance.now() - preflightStart;

      // Capture ALL response headers
      const allResponseHeaders = {};
      response.headers.forEach((value, key) => {
        allResponseHeaders[key] = value;
      });

      addDebugLog(`[L2.2-VERBOSE] Response received:`, 'info');
      addDebugLog(`  Status: ${response.status} ${response.statusText}`, 'info');
      addDebugLog(`  Duration: ${preflightTime.toFixed(2)}ms`, 'info');
      addDebugLog(`  ALL Headers: ${JSON.stringify(allResponseHeaders, null, 2)}`, 'info');

      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      const diagnosticHeader = response.headers.get('X-CORS-Diagnostic');

      const passed = response.status === 204 && allowOrigin;

      layer2Results.tests.push({
        id: 'L2.2',
        name: 'CORS Diagnostic Preflight',
        status: passed ? 'PASS' : 'FAIL',
        duration: preflightTime,
        details: {
          status: response.status,
          allowOrigin: allowOrigin,
          diagnosticHeader: diagnosticHeader,
          allHeaders: allResponseHeaders,
          time: preflightTime
        }
      });

      if (passed) {
        addDebugLog(`[L2.2] PASS - CORS diagnostic preflight OK (${response.status})`, 'success');
      } else {
        layer2Results.allPassed = false;
        addDebugLog(`[L2.2] FAIL - CORS diagnostic preflight failed`, 'error');
      }
    } catch (error) {
      layer2Results.tests.push({
        id: 'L2.2',
        name: 'CORS Diagnostic Preflight',
        status: 'FAIL',
        error: error.message
      });
      layer2Results.allPassed = false;
      addDebugLog(`[L2.2] FAIL - ${error.message}`, 'error');
    }

    // Test 2.3: Actual CORS GET Request
    addDebugLog('[L2.3] Testing actual CORS GET request...', 'info');
    try {
      const corsStart = performance.now();
      const response = await fetch('https://cloudprototype.org/api/cors/diagnostic', {
        method: 'GET',
        headers: { 'Origin': origin }
      });
      const corsTime = performance.now() - corsStart;

      if (response.ok) {
        const data = await response.json();
        const allowOrigin = response.headers.get('Access-Control-Allow-Origin');

        layer2Results.tests.push({
          id: 'L2.3',
          name: 'CORS GET Request',
          status: 'PASS',
          duration: corsTime,
          details: {
            status: response.status,
            allowOrigin: allowOrigin,
            responseData: data,
            time: corsTime
          }
        });

        addDebugLog(`[L2.3] PASS - CORS GET successful (${response.status}, ${corsTime.toFixed(2)}ms)`, 'success');
        addDebugLog(`  Server Framework: ${data.server_info?.framework}`, 'success');
      } else {
        layer2Results.tests.push({
          id: 'L2.3',
          name: 'CORS GET Request',
          status: 'FAIL',
          duration: corsTime,
          details: { status: response.status }
        });
        layer2Results.allPassed = false;
        addDebugLog(`[L2.3] FAIL - CORS GET returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer2Results.tests.push({
        id: 'L2.3',
        name: 'CORS GET Request',
        status: 'FAIL',
        error: error.message
      });
      layer2Results.allPassed = false;
      addDebugLog(`[L2.3] FAIL - ${error.message}`, 'error');
    }

    // Test 2.4: CORS POST Request
    addDebugLog('[L2.4] Testing CORS POST request...', 'info');
    try {
      const postStart = performance.now();
      const response = await fetch('https://cloudprototype.org/api/cors/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin
        },
        body: JSON.stringify({ test: 'systematic', timestamp: new Date().toISOString() })
      });
      const postTime = performance.now() - postStart;

      if (response.ok) {
        const data = await response.json();

        layer2Results.tests.push({
          id: 'L2.4',
          name: 'CORS POST Request',
          status: 'PASS',
          duration: postTime,
          details: { status: response.status, echo: data.echo, time: postTime }
        });

        addDebugLog(`[L2.4] PASS - CORS POST successful (${response.status}, ${postTime.toFixed(2)}ms)`, 'success');
      } else {
        layer2Results.tests.push({
          id: 'L2.4',
          name: 'CORS POST Request',
          status: 'FAIL',
          duration: postTime,
          details: { status: response.status }
        });
        layer2Results.allPassed = false;
        addDebugLog(`[L2.4] FAIL - CORS POST returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer2Results.tests.push({
        id: 'L2.4',
        name: 'CORS POST Request',
        status: 'FAIL',
        error: error.message
      });
      layer2Results.allPassed = false;
      addDebugLog(`[L2.4] FAIL - ${error.message}`, 'error');
    }

    // Test 2.5: XMLHttpRequest Test (Alternative to fetch)
    addDebugLog('[L2.5] Testing with XMLHttpRequest (fetch alternative)...', 'info');
    try {
      await new Promise((resolve, reject) => {
        const xhrStart = performance.now();
        const xhr = new XMLHttpRequest();

        xhr.open('OPTIONS', 'https://cloudprototype.org/api/sdk/proxy', true);
        xhr.setRequestHeader('Access-Control-Request-Method', 'POST');
        xhr.setRequestHeader('Access-Control-Request-Headers', 'content-type');

        xhr.onload = function() {
          const xhrTime = performance.now() - xhrStart;
          const allowOrigin = xhr.getResponseHeader('Access-Control-Allow-Origin');
          const allowMethods = xhr.getResponseHeader('Access-Control-Allow-Methods');

          layer2Results.tests.push({
            id: 'L2.5',
            name: 'XMLHttpRequest Test',
            status: xhr.status === 204 && allowOrigin ? 'PASS' : 'FAIL',
            duration: xhrTime,
            details: {
              status: xhr.status,
              allowOrigin: allowOrigin,
              allowMethods: allowMethods,
              time: xhrTime
            }
          });

          if (xhr.status === 204 && allowOrigin) {
            addDebugLog(`[L2.5] PASS - XHR preflight OK (${xhr.status}, ${xhrTime.toFixed(2)}ms)`, 'success');
            addDebugLog(`  XHR Allow-Origin: ${allowOrigin}`, 'success');
          } else {
            layer2Results.allPassed = false;
            addDebugLog(`[L2.5] FAIL - XHR preflight failed (${xhr.status})`, 'error');
          }
          resolve();
        };

        xhr.onerror = function() {
          layer2Results.tests.push({
            id: 'L2.5',
            name: 'XMLHttpRequest Test',
            status: 'FAIL',
            error: 'XHR request failed'
          });
          layer2Results.allPassed = false;
          addDebugLog(`[L2.5] FAIL - XHR request failed`, 'error');
          resolve(); // Don't reject to continue tests
        };

        xhr.send();
      });
    } catch (error) {
      layer2Results.tests.push({
        id: 'L2.5',
        name: 'XMLHttpRequest Test',
        status: 'FAIL',
        error: error.message
      });
      layer2Results.allPassed = false;
      addDebugLog(`[L2.5] FAIL - ${error.message}`, 'error');
    }

    // Test 2.6: CORS Mode Variations Test
    addDebugLog('[L2.6] Testing different CORS modes...', 'info');
    const modes = ['cors', 'no-cors', 'same-origin'];

    for (const mode of modes) {
      try {
        addDebugLog(`[L2.6] Testing mode: ${mode}`, 'info');
        const modeStart = performance.now();
        const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
          method: 'OPTIONS',
          mode: mode,
          headers: {
            'Access-Control-Request-Method': 'POST'
          }
        });
        const modeTime = performance.now() - modeStart;

        const isOpaque = response.type === 'opaque';
        const hasHeaders = !isOpaque && response.headers.get('Access-Control-Allow-Origin');

        layer2Results.tests.push({
          id: `L2.6-${mode}`,
          name: `CORS Mode: ${mode}`,
          status: (mode === 'no-cors' && isOpaque) || (mode === 'cors' && response.status === 204) ? 'PASS' : 'FAIL',
          duration: modeTime,
          details: {
            mode: mode,
            type: response.type,
            status: response.status,
            hasHeaders: hasHeaders,
            time: modeTime
          }
        });

        addDebugLog(`[L2.6-${mode}] Type: ${response.type}, Status: ${response.status}, Headers: ${hasHeaders}`,
                    (mode === 'no-cors' && isOpaque) || (mode === 'cors' && response.status === 204) ? 'success' : 'warning');
      } catch (error) {
        layer2Results.tests.push({
          id: `L2.6-${mode}`,
          name: `CORS Mode: ${mode}`,
          status: mode === 'same-origin' ? 'EXPECTED-FAIL' : 'FAIL',
          error: error.message
        });
        addDebugLog(`[L2.6-${mode}] ${mode === 'same-origin' ? 'Expected failure' : 'Failed'}: ${error.message}`,
                    mode === 'same-origin' ? 'warning' : 'error');
      }
    }

    // Test 2.7: Response Header Enumeration Test
    addDebugLog('[L2.7] Testing response header enumeration...', 'info');
    try {
      const enumStart = performance.now();
      const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST'
        }
      });
      const enumTime = performance.now() - enumStart;

      // Count how many headers browser allows us to see
      let headerCount = 0;
      const headersList = [];
      response.headers.forEach((value, key) => {
        headerCount++;
        headersList.push(key);
      });

      layer2Results.tests.push({
        id: 'L2.7',
        name: 'Header Enumeration',
        status: headerCount > 0 ? 'PASS' : 'FAIL',
        duration: enumTime,
        details: {
          headerCount: headerCount,
          headers: headersList,
          interpretation: headerCount === 0 ? 'CORS blocking all header access' :
                         headerCount < 3 ? 'Limited header access' :
                         'Full header access',
          time: enumTime
        }
      });

      if (headerCount > 0) {
        addDebugLog(`[L2.7] PASS - Can enumerate ${headerCount} headers: ${headersList.join(', ')}`, 'success');
      } else {
        layer2Results.allPassed = false;
        addDebugLog(`[L2.7] FAIL - Cannot enumerate any headers (CORS blocking)`, 'error');
      }
    } catch (error) {
      layer2Results.tests.push({
        id: 'L2.7',
        name: 'Header Enumeration',
        status: 'FAIL',
        error: error.message
      });
      layer2Results.allPassed = false;
      addDebugLog(`[L2.7] FAIL - ${error.message}`, 'error');
    }

    // Test 2.8: Cloudflare-Specific Headers Test
    addDebugLog('[L2.8] Testing Cloudflare-specific headers...', 'info');
    try {
      const cfStart = performance.now();
      const response = await fetch('https://cloudprototype.org/api/version', {
        method: 'GET'
      });
      const cfTime = performance.now() - cfStart;

      const cfRay = response.headers.get('CF-Ray');
      const cfCacheStatus = response.headers.get('CF-Cache-Status');
      const server = response.headers.get('Server');

      layer2Results.tests.push({
        id: 'L2.8',
        name: 'Cloudflare Headers',
        status: cfRay || server === 'cloudflare' ? 'PASS' : 'FAIL',
        duration: cfTime,
        details: {
          cfRay: cfRay,
          cfCacheStatus: cfCacheStatus,
          server: server,
          isCloudflare: !!(cfRay || server === 'cloudflare'),
          time: cfTime
        }
      });

      if (cfRay || server === 'cloudflare') {
        addDebugLog(`[L2.8] PASS - Cloudflare detected (CF-Ray: ${cfRay})`, 'success');
      } else {
        addDebugLog(`[L2.8] WARNING - No Cloudflare headers detected`, 'warning');
      }
    } catch (error) {
      layer2Results.tests.push({
        id: 'L2.8',
        name: 'Cloudflare Headers',
        status: 'FAIL',
        error: error.message
      });
      addDebugLog(`[L2.8] FAIL - ${error.message}`, 'error');
    }

    // Test 2.9: Deep OPTIONS inspection with timing
    addDebugLog('[L2.9] Testing OPTIONS with deep response inspection...', 'info');
    try {
      const preflightStart = performance.now();

      // Make OPTIONS request
      const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });

      const preflightTime = performance.now() - preflightStart;

      // Try to enumerate ALL headers (even if blocked)
      const headerMap = {};
      const knownCorsHeaders = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Credentials',
        'Access-Control-Max-Age',
        'Access-Control-Expose-Headers'
      ];

      // Try to get each known header
      knownCorsHeaders.forEach(headerName => {
        const value = response.headers.get(headerName);
        headerMap[headerName] = value;
      });

      // Try to iterate (may be blocked)
      const iteratedHeaders = {};
      let iterationWorked = false;
      try {
        response.headers.forEach((value, key) => {
          iteratedHeaders[key] = value;
          iterationWorked = true;
        });
      } catch (e) {
        iteratedHeaders['_error'] = e.message;
      }

      layer2Results.tests.push({
        id: 'L2.9',
        name: 'Deep OPTIONS Inspection',
        status: headerMap['Access-Control-Allow-Origin'] ? 'PASS' : 'FAIL',
        duration: preflightTime,
        details: {
          status: response.status,
          statusText: response.statusText,
          type: response.type,
          url: response.url,
          redirected: response.redirected,
          ok: response.ok,
          knownHeaders: headerMap,
          iteratedHeaders: iteratedHeaders,
          iterationWorked: iterationWorked,
          time: preflightTime
        }
      });

      if (headerMap['Access-Control-Allow-Origin']) {
        addDebugLog(`[L2.9] PASS - CORS headers accessible via get()`, 'success');
        addDebugLog(`  Allow-Origin: ${headerMap['Access-Control-Allow-Origin']}`, 'success');
      } else {
        layer2Results.allPassed = false;
        addDebugLog(`[L2.9] FAIL - CORS headers not accessible`, 'error');
        addDebugLog(`  Iteration worked: ${iterationWorked}`, 'error');
      }
    } catch (error) {
      layer2Results.tests.push({
        id: 'L2.9',
        name: 'Deep OPTIONS Inspection',
        status: 'FAIL',
        error: error.message
      });
      layer2Results.allPassed = false;
      addDebugLog(`[L2.9] FAIL - ${error.message}`, 'error');
    }

    // Test 2.10: Test different fetch modes
    addDebugLog('[L2.10] Testing fetch with different CORS modes...', 'info');

    const modesTest = {
      id: 'L2.10',
      name: 'Fetch Mode Variations',
      status: 'PASS',
      details: { modes: {} }
    };

    const testModes = [
      { mode: 'cors', desc: 'Standard CORS' },
      { mode: 'same-origin', desc: 'Same-origin only' },
      { mode: 'no-cors', desc: 'No CORS (opaque)' }
    ];

    for (const testMode of testModes) {
      try {
        const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
          method: 'OPTIONS',
          mode: testMode.mode,
          headers: {
            'Origin': origin
          }
        });

        const allowOrigin = response.headers.get('Access-Control-Allow-Origin');

        modesTest.details.modes[testMode.mode] = {
          success: true,
          status: response.status,
          type: response.type,
          allowOrigin: allowOrigin,
          description: testMode.desc
        };

        addDebugLog(`[L2.10] Mode '${testMode.mode}': status ${response.status}, type '${response.type}', headers: ${allowOrigin ? 'accessible' : 'blocked'}`,
                   allowOrigin ? 'success' : 'warning');
      } catch (error) {
        modesTest.details.modes[testMode.mode] = {
          success: false,
          error: error.message,
          description: testMode.desc
        };
        modesTest.status = 'FAIL';
        layer2Results.allPassed = false;
        addDebugLog(`[L2.10] Mode '${testMode.mode}': FAILED - ${error.message}`, 'error');
      }
    }

    layer2Results.tests.push(modesTest);

    addDebugLog(`=== LAYER 2 COMPLETE: ${layer2Results.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`,
                layer2Results.allPassed ? 'success' : 'error');

    return layer2Results;
  }

  // Layer 3: Authentication Flow Tests
  async function runLayer3AuthTests() {
    addDebugLog('=== LAYER 3: AUTHENTICATION FLOW TESTS ===', 'info');
    systematicTestState.currentLayer = 'layer3';

    const layer3Results = {
      layer: 3,
      name: 'Authentication Flow',
      tests: [],
      allPassed: true
    };

    const origin = window.location.origin;
    const appId = 'VtI8BSvhxAwNIIDR';

    // Test 3.1: Origin Header Presence
    addDebugLog('[L3.1] Verifying Origin header...', 'info');
    const originTest = {
      id: 'L3.1',
      name: 'Origin Header',
      status: origin ? 'PASS' : 'FAIL',
      details: {
        origin: origin,
        hostname: new URL(origin).hostname
      }
    };
    layer3Results.tests.push(originTest);

    if (origin) {
      addDebugLog(`[L3.1] PASS - Origin: ${origin}`, 'success');
    } else {
      layer3Results.allPassed = false;
      addDebugLog(`[L3.1] FAIL - No origin available`, 'error');
    }

    // Test 3.2: SDK Token Configuration Check (diagnostic endpoint)
    addDebugLog('[L3.2] Checking SDK token configuration...', 'info');
    try {
      const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=test`, {
        method: 'GET',
        headers: { 'Origin': origin }
      });

      if (response.ok) {
        const data = await response.json();

        const tokenConfigured = data.sdk_tokens?.total_count > 0;
        const originConfigured = data.origin_validation?.is_configured === true;

        layer3Results.tests.push({
          id: 'L3.2',
          name: 'SDK Token Configuration',
          status: tokenConfigured ? 'PASS' : 'FAIL',
          details: {
            totalTokens: data.sdk_tokens?.total_count,
            originConfigured: originConfigured,
            matchingToken: data.origin_validation?.matching_token
          }
        });

        if (tokenConfigured) {
          addDebugLog(`[L3.2] PASS - SDK tokens configured (${data.sdk_tokens?.total_count} tokens)`, 'success');
          if (originConfigured) {
            addDebugLog(`  Origin ${origin} is configured`, 'success');
          } else {
            addDebugLog(`  WARNING: Origin ${origin} NOT configured`, 'warning');
          }
        } else {
          layer3Results.allPassed = false;
          addDebugLog(`[L3.2] FAIL - No SDK tokens found`, 'error');
        }
      } else {
        layer3Results.tests.push({
          id: 'L3.2',
          name: 'SDK Token Configuration',
          status: 'FAIL',
          details: { status: response.status }
        });
        layer3Results.allPassed = false;
        addDebugLog(`[L3.2] FAIL - Diagnostic endpoint returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer3Results.tests.push({
        id: 'L3.2',
        name: 'SDK Token Configuration',
        status: 'FAIL',
        error: error.message
      });
      layer3Results.allPassed = false;
      addDebugLog(`[L3.2] FAIL - ${error.message}`, 'error');
    }

    // Test 3.3: Zero-Config Authentication Test (minimal SDK proxy call)
    addDebugLog('[L3.3] Testing zero-config authentication...', 'info');
    try {
      const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin
        },
        body: JSON.stringify({
          keyName: 'test-nonexistent',
          endpoint: '/test',
          method: 'GET'
        })
      });

      // We expect either 200 (success) or 404 (key not found), NOT 403 (auth failed)
      const authPassed = response.status !== 403;

      layer3Results.tests.push({
        id: 'L3.3',
        name: 'Zero-Config Authentication',
        status: authPassed ? 'PASS' : 'FAIL',
        details: {
          status: response.status,
          interpretation: response.status === 403 ? 'Auth failed' :
                         response.status === 404 ? 'Auth passed, key not found (expected)' :
                         'Auth passed'
        }
      });

      if (authPassed) {
        addDebugLog(`[L3.3] PASS - Zero-config auth working (got ${response.status}, not 403)`, 'success');
      } else {
        layer3Results.allPassed = false;
        addDebugLog(`[L3.3] FAIL - Authentication failed (403)`, 'error');
      }
    } catch (error) {
      layer3Results.tests.push({
        id: 'L3.3',
        name: 'Zero-Config Authentication',
        status: 'FAIL',
        error: error.message
      });
      layer3Results.allPassed = false;
      addDebugLog(`[L3.3] FAIL - ${error.message}`, 'error');
    }

    // Test 3.4: Direct Token Validation Test
    addDebugLog('[L3.4] Testing direct SDK token validation...', 'info');
    try {
      const tokenStart = performance.now();
      // Try to make request with deliberately invalid token to test validation
      const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk_test_invalid123',
          'Origin': origin
        },
        body: JSON.stringify({
          keyName: 'test',
          endpoint: '/test',
          method: 'GET'
        })
      });
      const tokenTime = performance.now() - tokenStart;

      // Should get 401 or 403 for invalid token
      const validationWorks = response.status === 401 || response.status === 403;

      layer3Results.tests.push({
        id: 'L3.4',
        name: 'Token Validation',
        status: validationWorks ? 'PASS' : 'FAIL',
        duration: tokenTime,
        details: {
          status: response.status,
          validationWorks: validationWorks,
          interpretation: validationWorks ? 'Invalid token correctly rejected' : 'Token validation may not be working',
          time: tokenTime
        }
      });

      if (validationWorks) {
        addDebugLog(`[L3.4] PASS - Token validation working (rejected invalid token with ${response.status})`, 'success');
      } else {
        addDebugLog(`[L3.4] WARNING - Token validation unclear (got ${response.status})`, 'warning');
      }
    } catch (error) {
      layer3Results.tests.push({
        id: 'L3.4',
        name: 'Token Validation',
        status: 'FAIL',
        error: error.message
      });
      addDebugLog(`[L3.4] FAIL - ${error.message}`, 'error');
    }

    // Test 3.5: Origin Format Variations Test
    addDebugLog('[L3.5] Testing origin format variations...', 'info');
    const originVariations = [
      { name: 'standard', value: origin },
      { name: 'with-port', value: `${origin}:443` },
      { name: 'hostname-only', value: new URL(origin).hostname },
      { name: 'uppercase', value: origin.toUpperCase() }
    ];

    for (const variant of originVariations) {
      try {
        const varStart = performance.now();
        const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': variant.value
          },
          body: JSON.stringify({
            keyName: 'test',
            endpoint: '/test',
            method: 'GET'
          })
        });
        const varTime = performance.now() - varStart;

        // Standard format should work (404 = auth passed, key not found)
        // Other formats may fail with 403
        const expected = variant.name === 'standard' ? response.status !== 403 : true;

        layer3Results.tests.push({
          id: `L3.5-${variant.name}`,
          name: `Origin Format: ${variant.name}`,
          status: expected ? 'PASS' : 'FAIL',
          duration: varTime,
          details: {
            originValue: variant.value,
            status: response.status,
            authPassed: response.status !== 403,
            time: varTime
          }
        });

        addDebugLog(`[L3.5-${variant.name}] Origin: ${variant.value} -> ${response.status}`,
                    expected ? 'success' : 'warning');
      } catch (error) {
        layer3Results.tests.push({
          id: `L3.5-${variant.name}`,
          name: `Origin Format: ${variant.name}`,
          status: 'FAIL',
          error: error.message
        });
        addDebugLog(`[L3.5-${variant.name}] Failed: ${error.message}`, 'error');
      }
    }

    // Test 3.6: Browser Capabilities Test
    addDebugLog('[L3.6] Testing browser capabilities...', 'info');
    const capabilities = {
      fetch: typeof fetch !== 'undefined',
      xhr: typeof XMLHttpRequest !== 'undefined',
      crypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      webSocket: typeof WebSocket !== 'undefined'
    };

    const allCapabilities = Object.values(capabilities).every(v => v);

    layer3Results.tests.push({
      id: 'L3.6',
      name: 'Browser Capabilities',
      status: allCapabilities ? 'PASS' : 'WARNING',
      details: capabilities
    });

    if (allCapabilities) {
      addDebugLog(`[L3.6] PASS - All browser capabilities present`, 'success');
    } else {
      addDebugLog(`[L3.6] WARNING - Some capabilities missing:`, 'warning');
      Object.entries(capabilities).forEach(([key, value]) => {
        if (!value) {
          addDebugLog(`  Missing: ${key}`, 'warning');
        }
      });
    }

    addDebugLog(`=== LAYER 3 COMPLETE: ${layer3Results.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`,
                layer3Results.allPassed ? 'success' : 'error');

    return layer3Results;
  }

  // Layer 4: Secrets Configuration Tests
  async function runLayer4SecretsTests() {
    addDebugLog('=== LAYER 4: SECRETS CONFIGURATION TESTS ===', 'info');
    systematicTestState.currentLayer = 'layer4';

    const layer4Results = {
      layer: 4,
      name: 'Secrets Configuration',
      tests: [],
      allPassed: true
    };

    const origin = window.location.origin;
    const appId = 'VtI8BSvhxAwNIIDR';
    const targetSecret = 'lichess';

    // Test 4.1: Project Accessibility
    addDebugLog('[L4.1] Testing project accessibility...', 'info');
    try {
      const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=${targetSecret}`, {
        method: 'GET',
        headers: { 'Origin': origin }
      });

      if (response.ok) {
        const data = await response.json();

        const projectAccessible = data.project?.id !== undefined;
        const accessExpired = data.project?.access_expired === true;

        layer4Results.tests.push({
          id: 'L4.1',
          name: 'Project Accessibility',
          status: projectAccessible && !accessExpired ? 'PASS' : 'FAIL',
          details: {
            projectId: data.project?.id,
            appId: data.project?.appid,
            accessExpired: accessExpired,
            expiresAt: data.project?.expires_at
          }
        });

        if (projectAccessible && !accessExpired) {
          addDebugLog(`[L4.1] PASS - Project accessible (${data.project?.appid})`, 'success');
        } else if (accessExpired) {
          layer4Results.allPassed = false;
          addDebugLog(`[L4.1] FAIL - Project access expired`, 'error');
        } else {
          layer4Results.allPassed = false;
          addDebugLog(`[L4.1] FAIL - Project not accessible`, 'error');
        }
      } else {
        layer4Results.tests.push({
          id: 'L4.1',
          name: 'Project Accessibility',
          status: 'FAIL',
          details: { status: response.status }
        });
        layer4Results.allPassed = false;
        addDebugLog(`[L4.1] FAIL - Diagnostic returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer4Results.tests.push({
        id: 'L4.1',
        name: 'Project Accessibility',
        status: 'FAIL',
        error: error.message
      });
      layer4Results.allPassed = false;
      addDebugLog(`[L4.1] FAIL - ${error.message}`, 'error');
    }

    // Test 4.2: Secrets Existence Check
    addDebugLog('[L4.2] Checking if secrets exist...', 'info');
    try {
      const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=${targetSecret}`, {
        method: 'GET',
        headers: { 'Origin': origin }
      });

      if (response.ok) {
        const data = await response.json();

        const totalSecrets = data.secrets?.total_count || 0;
        const targetExists = data.secrets?.key_exists === true;
        const allSecretNames = data.secrets?.all_names || [];

        layer4Results.tests.push({
          id: 'L4.2',
          name: 'Secrets Existence',
          status: totalSecrets > 0 ? 'PASS' : 'FAIL',
          details: {
            totalSecrets: totalSecrets,
            targetExists: targetExists,
            targetName: targetSecret,
            allNames: allSecretNames
          }
        });

        if (totalSecrets > 0) {
          addDebugLog(`[L4.2] PASS - ${totalSecrets} secrets exist: ${allSecretNames.join(', ')}`, 'success');
          if (targetExists) {
            addDebugLog(`  Target secret "${targetSecret}" found`, 'success');
          } else {
            addDebugLog(`  WARNING: Target secret "${targetSecret}" NOT found`, 'warning');
          }
        } else {
          layer4Results.allPassed = false;
          addDebugLog(`[L4.2] FAIL - No secrets configured in project`, 'error');
        }
      } else {
        layer4Results.tests.push({
          id: 'L4.2',
          name: 'Secrets Existence',
          status: 'FAIL',
          details: { status: response.status }
        });
        layer4Results.allPassed = false;
        addDebugLog(`[L4.2] FAIL - Diagnostic returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer4Results.tests.push({
        id: 'L4.2',
        name: 'Secrets Existence',
        status: 'FAIL',
        error: error.message
      });
      layer4Results.allPassed = false;
      addDebugLog(`[L4.2] FAIL - ${error.message}`, 'error');
    }

    // Test 4.3: Lichess Secret Configuration
    addDebugLog('[L4.3] Checking lichess secret configuration...', 'info');
    try {
      const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=${targetSecret}`, {
        method: 'GET',
        headers: { 'Origin': origin }
      });

      if (response.ok) {
        const data = await response.json();

        const lichessExists = data.secrets?.key_exists === true;
        const lichessConfig = data.secrets?.key_config;

        if (lichessExists && lichessConfig) {
          const isConfigured = lichessConfig.base_url && lichessConfig.auth_header;

          layer4Results.tests.push({
            id: 'L4.3',
            name: 'Lichess Secret Configuration',
            status: isConfigured ? 'PASS' : 'FAIL',
            details: {
              name: lichessConfig.name,
              provider: lichessConfig.provider,
              baseUrl: lichessConfig.base_url,
              authHeader: lichessConfig.auth_header,
              authPrefix: lichessConfig.auth_prefix
            }
          });

          if (isConfigured) {
            addDebugLog(`[L4.3] PASS - Lichess configured properly`, 'success');
            addDebugLog(`  Base URL: ${lichessConfig.base_url}`, 'success');
            addDebugLog(`  Auth: ${lichessConfig.auth_header}`, 'success');
          } else {
            layer4Results.allPassed = false;
            addDebugLog(`[L4.3] FAIL - Lichess exists but missing configuration`, 'error');
          }
        } else {
          layer4Results.tests.push({
            id: 'L4.3',
            name: 'Lichess Secret Configuration',
            status: 'FAIL',
            details: { exists: false }
          });
          layer4Results.allPassed = false;
          addDebugLog(`[L4.3] FAIL - Lichess secret does not exist`, 'error');
        }
      } else {
        layer4Results.tests.push({
          id: 'L4.3',
          name: 'Lichess Secret Configuration',
          status: 'FAIL',
          details: { status: response.status }
        });
        layer4Results.allPassed = false;
        addDebugLog(`[L4.3] FAIL - Diagnostic returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer4Results.tests.push({
        id: 'L4.3',
        name: 'Lichess Secret Configuration',
        status: 'FAIL',
        error: error.message
      });
      layer4Results.allPassed = false;
      addDebugLog(`[L4.3] FAIL - ${error.message}`, 'error');
    }

    // Test 4.4: Recommendations Analysis
    addDebugLog('[L4.4] Analyzing diagnostic recommendations...', 'info');
    try {
      const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=${targetSecret}`, {
        method: 'GET',
        headers: { 'Origin': origin }
      });

      if (response.ok) {
        const data = await response.json();

        const issuesFound = data.issues_found || [];
        const recommendations = data.recommended_actions || [];

        layer4Results.tests.push({
          id: 'L4.4',
          name: 'Recommendations',
          status: issuesFound.length === 0 ? 'PASS' : 'FAIL',
          details: {
            issueCount: issuesFound.length,
            issues: issuesFound,
            recommendations: recommendations
          }
        });

        if (issuesFound.length === 0) {
          addDebugLog(`[L4.4] PASS - No issues found`, 'success');
        } else {
          layer4Results.allPassed = false;
          addDebugLog(`[L4.4] FAIL - ${issuesFound.length} issues found:`, 'error');
          issuesFound.forEach(issue => {
            addDebugLog(`  - ${issue}`, 'error');
          });
          addDebugLog(`Recommended actions:`, 'warning');
          recommendations.forEach(action => {
            addDebugLog(`  - ${action}`, 'warning');
          });
        }
      } else {
        layer4Results.tests.push({
          id: 'L4.4',
          name: 'Recommendations',
          status: 'FAIL',
          details: { status: response.status }
        });
        layer4Results.allPassed = false;
        addDebugLog(`[L4.4] FAIL - Could not fetch recommendations`, 'error');
      }
    } catch (error) {
      layer4Results.tests.push({
        id: 'L4.4',
        name: 'Recommendations',
        status: 'FAIL',
        error: error.message
      });
      layer4Results.allPassed = false;
      addDebugLog(`[L4.4] FAIL - ${error.message}`, 'error');
    }

    // Test 4.5: Database Connectivity Test
    addDebugLog('[L4.5] Testing database connectivity...', 'info');
    try {
      // Test if we can reach the database through diagnostic endpoint
      const dbStart = performance.now();
      const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=test`, {
        method: 'GET',
        headers: { 'Origin': origin }
      });
      const dbTime = performance.now() - dbStart;

      if (response.ok) {
        const data = await response.json();

        // If we can get project info, database is accessible
        const dbAccessible = data.project !== undefined;

        layer4Results.tests.push({
          id: 'L4.5',
          name: 'Database Connectivity',
          status: dbAccessible ? 'PASS' : 'FAIL',
          duration: dbTime,
          details: {
            accessible: dbAccessible,
            responseTime: dbTime,
            projectData: !!data.project
          }
        });

        if (dbAccessible) {
          addDebugLog(`[L4.5] PASS - Database accessible (${dbTime.toFixed(2)}ms)`, 'success');
        } else {
          layer4Results.allPassed = false;
          addDebugLog(`[L4.5] FAIL - Database not accessible`, 'error');
        }
      } else {
        layer4Results.tests.push({
          id: 'L4.5',
          name: 'Database Connectivity',
          status: 'FAIL',
          details: { status: response.status }
        });
        layer4Results.allPassed = false;
        addDebugLog(`[L4.5] FAIL - Database endpoint returned ${response.status}`, 'error');
      }
    } catch (error) {
      layer4Results.tests.push({
        id: 'L4.5',
        name: 'Database Connectivity',
        status: 'FAIL',
        error: error.message
      });
      layer4Results.allPassed = false;
      addDebugLog(`[L4.5] FAIL - ${error.message}`, 'error');
    }

    // Test 4.6: Secret Structure Validation
    addDebugLog('[L4.6] Validating secret data structure...', 'info');
    try {
      const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=${targetSecret}`, {
        method: 'GET',
        headers: { 'Origin': origin }
      });

      if (response.ok) {
        const data = await response.json();

        // Check if diagnostic response has expected structure
        const hasExpectedStructure =
          data.project !== undefined &&
          data.sdk_tokens !== undefined &&
          data.secrets !== undefined &&
          data.origin_validation !== undefined;

        const requiredFields = {
          project: !!data.project,
          sdk_tokens: !!data.sdk_tokens,
          secrets: !!data.secrets,
          origin_validation: !!data.origin_validation,
          issues_found: Array.isArray(data.issues_found),
          recommended_actions: Array.isArray(data.recommended_actions)
        };

        layer4Results.tests.push({
          id: 'L4.6',
          name: 'Secret Structure Validation',
          status: hasExpectedStructure ? 'PASS' : 'FAIL',
          details: {
            hasExpectedStructure: hasExpectedStructure,
            fields: requiredFields
          }
        });

        if (hasExpectedStructure) {
          addDebugLog(`[L4.6] PASS - Diagnostic response structure valid`, 'success');
        } else {
          layer4Results.allPassed = false;
          addDebugLog(`[L4.6] FAIL - Diagnostic response missing expected fields`, 'error');
          Object.entries(requiredFields).forEach(([field, present]) => {
            if (!present) {
              addDebugLog(`  Missing field: ${field}`, 'error');
            }
          });
        }
      } else {
        layer4Results.tests.push({
          id: 'L4.6',
          name: 'Secret Structure Validation',
          status: 'FAIL',
          details: { status: response.status }
        });
        layer4Results.allPassed = false;
        addDebugLog(`[L4.6] FAIL - Could not fetch diagnostic data (${response.status})`, 'error');
      }
    } catch (error) {
      layer4Results.tests.push({
        id: 'L4.6',
        name: 'Secret Structure Validation',
        status: 'FAIL',
        error: error.message
      });
      layer4Results.allPassed = false;
      addDebugLog(`[L4.6] FAIL - ${error.message}`, 'error');
    }

    // Test 4.7: Response Time Analysis
    addDebugLog('[L4.7] Analyzing diagnostic endpoint response times...', 'info');
    const timings = [];
    try {
      // Make 3 requests to get average timing
      for (let i = 0; i < 3; i++) {
        const start = performance.now();
        const response = await fetch(`https://cloudprototype.org/api/projects/${appId}/secrets/diagnostic?keyName=${targetSecret}`, {
          method: 'GET',
          headers: { 'Origin': origin }
        });
        const duration = performance.now() - start;

        if (response.ok) {
          timings.push(duration);
          addDebugLog(`[L4.7] Request ${i + 1}: ${duration.toFixed(2)}ms`, 'info');
        }
      }

      if (timings.length > 0) {
        const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
        const minTime = Math.min(...timings);
        const maxTime = Math.max(...timings);

        // Consider fast if average < 500ms
        const isFast = avgTime < 500;

        layer4Results.tests.push({
          id: 'L4.7',
          name: 'Response Time Analysis',
          status: isFast ? 'PASS' : 'WARNING',
          details: {
            averageMs: avgTime.toFixed(2),
            minMs: minTime.toFixed(2),
            maxMs: maxTime.toFixed(2),
            samples: timings.length,
            performance: isFast ? 'Fast' : 'Slow'
          }
        });

        if (isFast) {
          addDebugLog(`[L4.7] PASS - Average response time: ${avgTime.toFixed(2)}ms`, 'success');
        } else {
          addDebugLog(`[L4.7] WARNING - Slow response time: ${avgTime.toFixed(2)}ms`, 'warning');
        }
      } else {
        layer4Results.tests.push({
          id: 'L4.7',
          name: 'Response Time Analysis',
          status: 'FAIL',
          details: { error: 'No successful requests' }
        });
        layer4Results.allPassed = false;
        addDebugLog(`[L4.7] FAIL - Could not measure response times`, 'error');
      }
    } catch (error) {
      layer4Results.tests.push({
        id: 'L4.7',
        name: 'Response Time Analysis',
        status: 'FAIL',
        error: error.message
      });
      layer4Results.allPassed = false;
      addDebugLog(`[L4.7] FAIL - ${error.message}`, 'error');
    }

    addDebugLog(`=== LAYER 4 COMPLETE: ${layer4Results.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`,
                layer4Results.allPassed ? 'success' : 'error');

    return layer4Results;
  }

  // Layer 5: End-to-End Integration Tests
  async function runLayer5IntegrationTests() {
    addDebugLog('=== LAYER 5: END-TO-END INTEGRATION TESTS ===', 'info');
    systematicTestState.currentLayer = 'layer5';

    const layer5Results = {
      layer: 5,
      name: 'End-to-End Integration',
      tests: [],
      allPassed: true
    };

    // Test 5.1: SDK Initialization
    addDebugLog('[L5.1] Testing SDK initialization...', 'info');
    try {
      if (typeof SecretsSDK === 'undefined') {
        throw new Error('SecretsSDK not available');
      }

      const testSdk = new SecretsSDK({
        baseUrl: 'https://cloudprototype.org'
      });

      layer5Results.tests.push({
        id: 'L5.1',
        name: 'SDK Initialization',
        status: 'PASS',
        details: { initialized: true, type: typeof testSdk }
      });

      addDebugLog(`[L5.1] PASS - SDK initialized successfully`, 'success');
    } catch (error) {
      layer5Results.tests.push({
        id: 'L5.1',
        name: 'SDK Initialization',
        status: 'FAIL',
        error: error.message
      });
      layer5Results.allPassed = false;
      addDebugLog(`[L5.1] FAIL - ${error.message}`, 'error');
    }

    // Test 5.2: Lichess API Call (if secret exists)
    addDebugLog('[L5.2] Testing full Lichess API call...', 'info');
    try {
      if (!sdk) {
        throw new Error('SDK not initialized');
      }

      const start = performance.now();
      const response = await sdk.call('lichess', '/api/user/carsontkempf', {
        method: 'GET'
      });
      const duration = performance.now() - start;

      if (response && response.data) {
        layer5Results.tests.push({
          id: 'L5.2',
          name: 'Lichess API Call',
          status: 'PASS',
          duration: duration,
          details: {
            username: response.data.username || response.data.id,
            time: duration,
            status: 'success'
          }
        });

        addDebugLog(`[L5.2] PASS - Lichess API call successful (${duration.toFixed(2)}ms)`, 'success');
        addDebugLog(`  User: ${response.data.username || response.data.id}`, 'success');
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      layer5Results.tests.push({
        id: 'L5.2',
        name: 'Lichess API Call',
        status: 'FAIL',
        error: error.message
      });
      layer5Results.allPassed = false;

      // Differentiate error types
      if (error.message.includes('404') || error.message.includes('not found')) {
        addDebugLog(`[L5.2] FAIL - Lichess secret not found (expected if not configured yet)`, 'warning');
      } else if (error.message.includes('403')) {
        addDebugLog(`[L5.2] FAIL - Authentication failed`, 'error');
      } else {
        addDebugLog(`[L5.2] FAIL - ${error.message}`, 'error');
      }
    }

    // Test 5.3: Rate Limit Headers
    addDebugLog('[L5.3] Checking rate limit headers...', 'info');
    try {
      const response = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          keyName: 'lichess',
          endpoint: '/api/user/carsontkempf',
          method: 'GET'
        })
      });

      const rateLimit = response.headers.get('X-RateLimit-Limit');
      const rateRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateReset = response.headers.get('X-RateLimit-Reset');

      const hasRateLimit = rateLimit !== null;

      layer5Results.tests.push({
        id: 'L5.3',
        name: 'Rate Limit Headers',
        status: hasRateLimit ? 'PASS' : 'FAIL',
        details: {
          limit: rateLimit,
          remaining: rateRemaining,
          reset: rateReset
        }
      });

      if (hasRateLimit) {
        addDebugLog(`[L5.3] PASS - Rate limit headers present`, 'success');
        addDebugLog(`  Limit: ${rateLimit}, Remaining: ${rateRemaining}`, 'success');
      } else {
        layer5Results.allPassed = false;
        addDebugLog(`[L5.3] FAIL - No rate limit headers`, 'error');
      }
    } catch (error) {
      layer5Results.tests.push({
        id: 'L5.3',
        name: 'Rate Limit Headers',
        status: 'FAIL',
        error: error.message
      });
      layer5Results.allPassed = false;
      addDebugLog(`[L5.3] FAIL - ${error.message}`, 'error');
    }

    addDebugLog(`=== LAYER 5 COMPLETE: ${layer5Results.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'} ===`,
                layer5Results.allPassed ? 'success' : 'error');

    return layer5Results;
  }

  // Master test runner
  async function runSystematicTests() {
    addDebugLog('='.repeat(60), 'info');
    addDebugLog('SYSTEMATIC TEST FRAMEWORK - COMPREHENSIVE DIAGNOSTIC SUITE', 'info');
    addDebugLog('='.repeat(60), 'info');
    addDebugLog(`Start Time: ${new Date().toISOString()}`, 'info');
    addDebugLog(`Origin: ${window.location.origin}`, 'info');
    addDebugLog(`User Agent: ${navigator.userAgent}`, 'info');
    addDebugLog('', 'info');

    systematicTestState.startTime = Date.now();
    systematicTestState.results = {};

    try {
      // Layer 1: Network Connectivity
      systematicTestState.results.layer1 = await runLayer1NetworkTests();
      addDebugLog('', 'info');

      // Layer 2: CORS Configuration
      systematicTestState.results.layer2 = await runLayer2CORSTests();
      addDebugLog('', 'info');

      // Layer 3: Authentication Flow
      systematicTestState.results.layer3 = await runLayer3AuthTests();
      addDebugLog('', 'info');

      // Layer 4: Secrets Configuration
      systematicTestState.results.layer4 = await runLayer4SecretsTests();
      addDebugLog('', 'info');

      // Layer 5: End-to-End Integration
      systematicTestState.results.layer5 = await runLayer5IntegrationTests();
      addDebugLog('', 'info');

      // Summary
      const totalDuration = Date.now() - systematicTestState.startTime;
      const allLayers = Object.values(systematicTestState.results);
      const allPassed = allLayers.every(layer => layer.allPassed);

      systematicTestState.allPassed = allPassed;

      addDebugLog('='.repeat(60), 'info');
      addDebugLog('TEST SUITE SUMMARY', 'info');
      addDebugLog('='.repeat(60), 'info');

      allLayers.forEach(layer => {
        const passedTests = layer.tests.filter(t => t.status === 'PASS').length;
        const totalTests = layer.tests.length;
        const status = layer.allPassed ? 'PASS' : 'FAIL';
        const statusType = layer.allPassed ? 'success' : 'error';

        addDebugLog(`Layer ${layer.layer} (${layer.name}): ${passedTests}/${totalTests} tests passed [${status}]`, statusType);
      });

      addDebugLog('', 'info');
      addDebugLog(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`, 'info');
      addDebugLog(`Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`, allPassed ? 'success' : 'error');

      if (!allPassed) {
        addDebugLog('', 'info');
        addDebugLog('FAILED TESTS:', 'error');
        allLayers.forEach(layer => {
          const failedTests = layer.tests.filter(t => t.status === 'FAIL');
          failedTests.forEach(test => {
            addDebugLog(`  [${test.id}] ${test.name}: ${test.error || JSON.stringify(test.details)}`, 'error');
          });
        });
      }

      addDebugLog('='.repeat(60), 'info');

      // Display summary in UI
      displaySystematicTestSummary();

    } catch (error) {
      addDebugLog(`CRITICAL ERROR: Test suite failed to complete: ${error.message}`, 'error');
    }
  }

  // Display test summary in UI
  function displaySystematicTestSummary() {
    const resultContainer = document.getElementById('systematic-test-results');
    if (!resultContainer) return;

    const allLayers = Object.values(systematicTestState.results);
    const allPassed = systematicTestState.allPassed;

    let html = `
      <div style="border: 2px solid ${allPassed ? '#d4edda' : '#f8d7da'}; border-radius: 6px; padding: 1.5rem; background: ${allPassed ? '#d4edda' : '#f8d7da'}; margin-top: 1rem;">
        <h4 style="margin: 0 0 1rem 0; color: ${allPassed ? '#155724' : '#721c24'};">
          ${allPassed ? 'All Tests Passed' : 'Some Tests Failed'}
        </h4>
    `;

    allLayers.forEach(layer => {
      const passedTests = layer.tests.filter(t => t.status === 'PASS').length;
      const totalTests = layer.tests.length;
      const percentage = ((passedTests / totalTests) * 100).toFixed(0);

      html += `
        <div style="margin: 0.5rem 0; padding: 0.75rem; background: white; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">Layer ${layer.layer}: ${layer.name}</span>
            <span style="color: ${layer.allPassed ? '#155724' : '#721c24'}; font-weight: bold;">
              ${passedTests}/${totalTests} (${percentage}%)
            </span>
          </div>
          <div style="margin-top: 0.5rem;">
            ${layer.tests.map(test => `
              <div style="padding: 0.25rem 0; font-size: 0.9rem;">
                <span style="color: ${test.status === 'PASS' ? '#155724' : '#721c24'};">
                  ${test.status === 'PASS' ? '' : ''}
                </span>
                ${test.name}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    resultContainer.innerHTML = html;
    resultContainer.style.display = 'block';
  }

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', async function() {
    addDebugLog('Page loaded, initializing SDK tester v2...');

    // Scenario selector
    const scenarioSelect = document.getElementById('scenario-select');
    if (scenarioSelect) {
      scenarioSelect.addEventListener('change', (e) => {
        currentScenario = e.target.value;
        updateScenarioDetails();
        addDebugLog(`Switched to scenario: ${testScenarios[currentScenario].name}`);
      });
    }

    // Run test button
    const runTestBtn = document.getElementById('run-test-btn');
    if (runTestBtn) {
      runTestBtn.addEventListener('click', runTest);
    }

    // CORS diagnostics button
    const corsBtn = document.getElementById('diagnose-cors-btn');
    if (corsBtn) {
      corsBtn.addEventListener('click', runCORSDiagnostics);
    }

    // Enhanced CORS diagnostics button
    const corsEnhancedBtn = document.getElementById('diagnose-cors-enhanced-btn');
    if (corsEnhancedBtn) {
      corsEnhancedBtn.addEventListener('click', runEnhancedCORSDiagnostics);
    }

    // Secrets diagnostics button
    const secretsBtn = document.getElementById('diagnose-secrets-btn');
    if (secretsBtn) {
      secretsBtn.addEventListener('click', runSecretsDiagnostics);
    }

    // Systematic test runner button
    const systematicTestBtn = document.getElementById('run-systematic-tests-btn');
    if (systematicTestBtn) {
      systematicTestBtn.addEventListener('click', runSystematicTests);
    }

    // Clear log button
    const clearLogBtn = document.getElementById('clear-log-btn');
    if (clearLogBtn) {
      clearLogBtn.addEventListener('click', clearDebugLog);
    }

    // Copy log button
    const copyLogBtn = document.getElementById('copy-log-btn');
    if (copyLogBtn) {
      copyLogBtn.addEventListener('click', copyDebugLog);
    }

    // Initialize first scenario details
    updateScenarioDetails();

    // Auto-initialize SDK
    await initSDK();
  });

})();
