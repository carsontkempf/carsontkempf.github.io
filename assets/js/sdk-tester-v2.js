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
