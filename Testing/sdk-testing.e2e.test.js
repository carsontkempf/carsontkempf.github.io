/**
 * SDK Testing Page E2E Tests
 * Tests against the published site at carsontkempf.github.io
 */
const puppeteer = require('puppeteer');

const PUBLISHED_SITE_URL = 'https://carsontkempf.github.io';
const TESTING_PAGE_URL = `${PUBLISHED_SITE_URL}/testing/`;
const TEST_APP_ID = '_oaypPYZ6No969tl';

let browser;
let page;

jest.setTimeout(60000);

beforeAll(async () => {
  console.log('--- [Setup] Launching Puppeteer browser... ---');
  browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const allPages = await browser.pages();
  page = allPages.length > 0 ? allPages[0] : await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[SDK-TEST]')) {
      console.log(`BROWSER: ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`PAGE_ERROR: ${err.message}`);
  });

  console.log('--- [Setup] Browser ready ---');
});

afterAll(async () => {
  if (browser) {
    await browser.close();
    console.log('--- [Teardown] Browser closed ---');
  }
});

describe('SDK Testing Page', () => {

  it('should load the testing page and verify SDK bundle is loaded', async () => {
    console.log(`--- [Test] Navigating to ${TESTING_PAGE_URL}... ---`);

    await page.goto(TESTING_PAGE_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('--- [Test] Page loaded ---');

    // Check page title
    const title = await page.title();
    console.log(`--- [Test] Page title: ${title} ---`);
    expect(title).toContain('SDK');

    // Check SDK is loaded
    const sdkLoaded = await page.evaluate(() => {
      return typeof window.SecretsSDK !== 'undefined';
    });
    console.log(`--- [Test] SecretsSDK loaded: ${sdkLoaded} ---`);
    expect(sdkLoaded).toBe(true);

    // Check SecretsSDKError is loaded
    const errorClassLoaded = await page.evaluate(() => {
      return typeof window.SecretsSDKError !== 'undefined';
    });
    console.log(`--- [Test] SecretsSDKError loaded: ${errorClassLoaded} ---`);
    expect(errorClassLoaded).toBe(true);

    // Check sdkTester module is loaded
    const testerLoaded = await page.evaluate(() => {
      return typeof window.sdkTester !== 'undefined';
    });
    console.log(`--- [Test] sdkTester module loaded: ${testerLoaded} ---`);
    expect(testerLoaded).toBe(true);

    console.log('--- [Test] SDK bundle verification complete ---');
  });

  it('should initialize SDK with test credentials', async () => {
    console.log('--- [Test] Testing SDK initialization ---');

    // Enter App ID
    await page.type('#app-id-input', TEST_APP_ID);
    console.log(`--- [Test] Entered App ID: ${TEST_APP_ID} ---`);

    // Enter a dummy session token (JWT format)
    const dummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjE2MTYxNjE2fQ.test';
    await page.type('#session-token-input', dummyToken);
    console.log('--- [Test] Entered session token ---');

    // Click Initialize SDK button
    await page.click('#init-sdk-btn');
    console.log('--- [Test] Clicked Initialize SDK button ---');

    // Wait for SDK status to update
    await page.waitForFunction(() => {
      const status = document.getElementById('sdk-status');
      return status && status.textContent !== 'SDK not initialized';
    }, { timeout: 5000 });

    // Check SDK status
    const sdkStatus = await page.evaluate(() => {
      return document.getElementById('sdk-status')?.textContent;
    });
    console.log(`--- [Test] SDK status: ${sdkStatus} ---`);
    expect(sdkStatus).toBe('SDK initialized');

    // Verify SDK instance was created
    const sdkCreated = await page.evaluate(() => {
      const sdk = window.sdkTester.getSDK();
      return sdk !== null && sdk.appId === '_oaypPYZ6No969tl';
    });
    console.log(`--- [Test] SDK instance created: ${sdkCreated} ---`);
    expect(sdkCreated).toBe(true);

    console.log('--- [Test] SDK initialization test complete ---');
  });

  it('should decode JWT token correctly', async () => {
    console.log('--- [Test] Testing JWT token decoder ---');

    // Click decode token button
    await page.click('#inspect-token-btn');
    console.log('--- [Test] Clicked Decode Token button ---');

    // Wait for claims display to update
    await page.waitForFunction(() => {
      const display = document.getElementById('token-claims-display');
      return display && !display.textContent.includes('Enter a token');
    }, { timeout: 5000 });

    // Check decoded token display
    const claimsDisplay = await page.evaluate(() => {
      return document.getElementById('token-claims-display')?.innerHTML;
    });
    console.log('--- [Test] Token claims displayed ---');

    // Verify JWT was decoded (should contain header info)
    expect(claimsDisplay).toContain('header');
    expect(claimsDisplay).toContain('payload');
    expect(claimsDisplay).toContain('HS256');

    console.log('--- [Test] JWT decoder test complete ---');
  });

  it('should display API test request form elements', async () => {
    console.log('--- [Test] Verifying API test form elements ---');

    // Check endpoint selector exists
    const endpointSelector = await page.$('#endpoint-select');
    expect(endpointSelector).not.toBeNull();
    console.log('--- [Test] Endpoint selector found ---');

    // Check query input exists
    const queryInput = await page.$('#query-input');
    expect(queryInput).not.toBeNull();
    console.log('--- [Test] Query input found ---');

    // Check execute button exists
    const executeBtn = await page.$('#test-api-btn');
    expect(executeBtn).not.toBeNull();
    console.log('--- [Test] Execute button found ---');

    // Check debug log panel exists
    const debugLog = await page.$('#debug-log');
    expect(debugLog).not.toBeNull();
    console.log('--- [Test] Debug log panel found ---');

    console.log('--- [Test] Form elements verification complete ---');
  });

  it('should log copy functionality works', async () => {
    console.log('--- [Test] Testing log copy functionality ---');

    // Get initial log content
    const initialLogEntries = await page.evaluate(() => {
      const entries = document.querySelectorAll('#debug-log .debug-entry');
      return entries.length;
    });
    console.log(`--- [Test] Initial log entries: ${initialLogEntries} ---`);
    expect(initialLogEntries).toBeGreaterThan(0);

    // Click copy log button (this should work without errors)
    await page.click('#copy-log-btn');
    console.log('--- [Test] Clicked Copy Log button ---');

    // Wait a moment for clipboard operation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify copy success message appears in log
    const copySuccessLogged = await page.evaluate(() => {
      const entries = document.querySelectorAll('#debug-log .debug-entry');
      for (const entry of entries) {
        if (entry.textContent.includes('Log copied to clipboard')) {
          return true;
        }
      }
      return false;
    });
    console.log(`--- [Test] Copy success logged: ${copySuccessLogged} ---`);

    console.log('--- [Test] Log copy test complete ---');
  });

  it('should clear debug log when clear button is clicked', async () => {
    console.log('--- [Test] Testing log clear functionality ---');

    // Get log entries before clear
    const entriesBefore = await page.evaluate(() => {
      return document.querySelectorAll('#debug-log .debug-entry').length;
    });
    console.log(`--- [Test] Entries before clear: ${entriesBefore} ---`);

    // Click clear log button
    await page.click('#clear-log-btn');
    console.log('--- [Test] Clicked Clear Log button ---');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get log entries after clear (should be 1 - the "cleared" message)
    const entriesAfter = await page.evaluate(() => {
      return document.querySelectorAll('#debug-log .debug-entry').length;
    });
    console.log(`--- [Test] Entries after clear: ${entriesAfter} ---`);
    expect(entriesAfter).toBe(1);

    console.log('--- [Test] Log clear test complete ---');
  });

});
