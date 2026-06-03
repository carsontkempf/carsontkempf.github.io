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

    const startTime = performance.now();

    try {
      addDebugLog('Sending request to SDK proxy...');
      addDebugLog(`Request: POST https://cloudprototype.org/api/sdk/proxy`);
      addDebugLog(`Body: ${JSON.stringify({
        keyName: scenario.keyName,
        endpoint: scenario.endpoint,
        method: scenario.method
      }, null, 2)}`);

      const response = await sdk.call(scenario.keyName, scenario.endpoint, {
        method: scenario.method
      });

      const duration = performance.now() - startTime;
      addDebugLog(`Response received in ${duration.toFixed(2)}ms`, 'success');
      addDebugLog(`Response data: ${JSON.stringify(response).substring(0, 200)}...`);

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

      addDebugLog('=== TEST COMPLETED SUCCESSFULLY ===', 'success');

    } catch (error) {
      const duration = performance.now() - startTime;
      addDebugLog(`Request failed after ${duration.toFixed(2)}ms`, 'error');
      addDebugLog(`Error: ${error.message}`, 'error');

      if (error.stack) {
        addDebugLog(`Stack: ${error.stack}`, 'error');
      }

      if (statusEl) {
        statusEl.innerHTML = `<span class="status-badge status-error">Error</span>`;
      }

      if (dataEl) {
        dataEl.textContent = `Error: ${error.message}\n\nCheck Debug Output for details.`;
        dataEl.style.color = '#721c24';
      }

      addDebugLog('=== TEST FAILED ===', 'error');
    }
  }

  // Run CORS diagnostics
  async function runCORSDiagnostics() {
    addDebugLog('=== CORS DIAGNOSTICS STARTED ===');
    addDebugLog('Testing CORS configuration for cloudprototype.org...');

    try {
      // Test 1: OPTIONS preflight
      addDebugLog('Test 1: OPTIONS preflight request...');
      const preflightResponse = await fetch('https://cloudprototype.org/api/sdk/proxy', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
        }
      });

      addDebugLog(`Preflight status: ${preflightResponse.status}`);
      addDebugLog('Preflight headers:');
      preflightResponse.headers.forEach((value, key) => {
        if (key.toLowerCase().startsWith('access-control')) {
          addDebugLog(`  ${key}: ${value}`);
        }
      });

      // Test 2: Simple GET request
      addDebugLog('Test 2: Simple GET request (no preflight)...');
      const getResponse = await fetch('https://cloudprototype.org/api/version');
      addDebugLog(`GET status: ${getResponse.status}`);

      const data = await getResponse.json();
      addDebugLog(`Response: ${JSON.stringify(data)}`);

      addDebugLog('=== CORS DIAGNOSTICS COMPLETED ===', 'success');

    } catch (error) {
      addDebugLog(`CORS diagnostic failed: ${error.message}`, 'error');
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
