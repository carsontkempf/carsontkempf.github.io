// /Users/ctk/Programming/VSCodeProjects/carsontkempf.github.io/Testing/website.e2e.test.js
const { spawn } = require('child_process'); // Using built-in for simplicity, cross-spawn is an alternative
const puppeteer = require('puppeteer');
const treeKill = require('tree-kill');
const path = require('path');
const http = require('http'); // For Jekyll readiness check

const BASE_APP_DIRECTORY = path.resolve(__dirname, '..'); // Assumes test file is in Testing/
const JEKYLL_PORT = 4000;
const JEKYLL_SERVER_URL = `http://localhost:${JEKYLL_PORT}`;
const JEKYLL_READINESS_CHECK_URL = JEKYLL_SERVER_URL; // Check the root path for readiness

let jekyllProcess;
let browser;
let page;
let nodeLoggerProcess; // Assuming you manage this process; define and initialize it if so.
// const jekyllStdoutLines = []; // Removed as it's not used in the proposed changes
const jekyllStderrLines = [];
function streamAndCollectOutput(processName, stream, collection, readyString = null, onReadyCallback = null) {
    // This function will now be used
    let readyCallbackCalled = false;
    stream.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(rawLine => {
            const trimmedLine = rawLine.trim();
            if (trimmedLine === '') return;
            collection.push(trimmedLine); // Collect all lines

            // Log only if it's the ready string or if verbose logging is explicitly enabled (optional)
            if (readyString && !readyCallbackCalled && trimmedLine.includes(readyString)) {
                const logMsg = `[${processName}] ${trimmedLine}`;
                console.log(logMsg); // Log ready message
                readyCallbackCalled = true;
                if (onReadyCallback) onReadyCallback();
            }
        });
    });
}

// Helper to kill a process and its children
async function killProcessTree(proc, processName, killTimeout = 1500) { // Reduced killTimeout to 5s
    return new Promise((outerResolve, outerReject) => {
        if (!proc || proc.killed) {
            console.log(`Process ${processName} (PID: ${proc ? proc.pid : 'N/A'}) already killed or not started.`);
            outerResolve();
            return;
        }
        const pid = proc.pid; // Capture pid in case proc becomes undefined
        console.log(`Attempting to kill process ${processName} (PID: ${pid})...`);

        let timeoutId;
        const timeoutPromise = new Promise((_, rejectTimeout) => {
            timeoutId = setTimeout(() => {
                console.warn(`Timeout waiting for ${processName} (PID: ${pid}) to exit after ${killTimeout}ms. Forcing rejection.`);
                // treeKill should have attempted SIGKILL if SIGTERM failed.
                // This rejection ensures Promise.race below doesn't hang.
                rejectTimeout(new Error(`Timeout killing ${processName} (PID: ${pid})`));
            }, killTimeout);
        });

        // Additionally, wait for the exit event for cleaner shutdown
        const exitPromise = new Promise((resolveExit, rejectExit) => {
            proc.on('exit', (code, signal) => {
                clearTimeout(timeoutId); // Clear the kill timeout
                console.log(`Process ${processName} (PID: ${pid}) exited with code ${code}, signal ${signal}.`);
                resolveExit();
            });
            // Handle cases where the process might error out during kill attempts
            proc.on('error', (err) => {
                clearTimeout(timeoutId);
                console.error(`Error event from process ${processName} (PID: ${pid}) during kill:`, err);
                rejectExit(err);
            });
        });

        treeKill(pid, 'SIGTERM', (err) => {
            if (err) {
                console.warn(`Failed to SIGTERM ${processName} (PID: ${pid}), attempting SIGKILL:`, err);
                treeKill(pid, 'SIGKILL', (killErr) => {
                    if (killErr) {
                        console.error(`Failed to SIGKILL ${processName} (PID: ${pid}):`, killErr);
                        clearTimeout(timeoutId);
                        // Don't wait for exitPromise if SIGKILL itself failed critically
                        outerReject(killErr);
                        return;
                    }
                    console.log(`Process ${processName} (PID: ${pid}) SIGKILLed.`);
                    Promise.race([exitPromise, timeoutPromise])
                        .then(outerResolve).catch(outerReject);
                });
            } else {
                console.log(`Process ${processName} (PID: ${pid}) SIGTERMed.`);
                Promise.race([exitPromise, timeoutPromise])
                    .then(outerResolve).catch(outerReject);
            }
        });
    });
}

// Helper function to log authentication status
async function logAuthStatus(pageInstance, stepDescription) {
    try {
        const currentUrl = pageInstance.url();
        // Only attempt to get authState if not on an Auth0 domain
        if (!currentUrl.includes('dev-l57dcpkhob0u7ykb.us.auth0.com')) {
            const authState = await pageInstance.evaluate(() => {
                if (window.siteAuth && typeof window.siteAuth.isAuthenticated !== 'undefined') {
                    return {
                        defined: true,
                        isAuthenticated: window.siteAuth.isAuthenticated,
                        user: window.siteAuth.user ? window.siteAuth.user.name : null,
                        accessTokenExists: !!window.siteAuth.accessToken
                    };
                }
                return { defined: false };
            });

            if (authState.defined) {
                console.log(`--- [Auth Debug - ${stepDescription}] User Authenticated: ${authState.isAuthenticated}${authState.user ? `, User: ${authState.user}` : ''}${authState.accessTokenExists ? ', AccessToken Exists' : ', No AccessToken'}. URL: ${currentUrl} ---`);
            } else {
                console.log(`--- [Auth Debug - ${stepDescription}] window.siteAuth or window.siteAuth.isAuthenticated is not defined. URL: ${currentUrl} ---`);
            }
        } else {
            console.log(`--- [Auth Debug - ${stepDescription}] Currently on Auth0 domain. window.siteAuth not applicable. URL: ${currentUrl} ---`);
        }
    } catch (e) {
        // This might happen if the page is navigating or in a weird state (e.g., about:blank)
        console.warn(`--- [Auth Debug - ${stepDescription}] Error evaluating auth status (URL: ${pageInstance.url()}): ${e.message} ---`);
    }
}

// Increase Jest's default timeout for async operations in beforeAll/afterAll
jest.setTimeout(60000); // Increased overall Jest timeout to 60 seconds

beforeAll(async () => {
    // 3. Launch Puppeteer (Moved to be the first operation)
    console.log('--- [Setup] Launching Puppeteer browser... ---');
    browser = await puppeteer.launch({
        headless: false, // Set to false to see the browser window
        slowMo: 10,      // Reduced slowMo
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common for CI environments
    });
    const allPages = await browser.pages();
    if (allPages.length > 0) {
        page = allPages[0]; // Use the first existing page (browser's initial tab)
        // Optionally, close any other pages that might have opened if more than one exists.
        for (let i = 1; i < allPages.length; i++) {
            await allPages[i].close();
        }
    } else {
        // Fallback, though puppeteer.launch usually ensures at least one page.
        console.warn('--- [Setup] No initial pages found after launch, creating a new one. ---');
        page = await browser.newPage();
    }

    // Inject script to monitor window.auth0 definition
    await page.evaluateOnNewDocument(() => {
        let auth0ActualValue;
        // let errorDuringDefinition = null; // Not used currently
        console.log('[evaluateOnNewDocument] Setting updefineProperty for window.auth0');

        Object.defineProperty(window, 'auth0', {
            configurable: true,
            enumerable: true,
            get() {
                console.log('[evaluateOnNewDocument] GET window.auth0. Current type:', typeof auth0ActualValue);
                return auth0ActualValue;
            },
            set(newValue) {
                if (newValue && typeof newValue.createAuth0Client === 'function') {
                    console.log('[evaluateOnNewDocument] SET window.auth0: SDK fully loaded (createAuth0Client is function).');
                } else if (newValue && typeof newValue === 'object' && Object.keys(newValue).length === 0) {
                    console.log('[evaluateOnNewDocument] SET window.auth0: Initial empty object set by SDK script. Waiting for methods...');
                } else if (newValue) {
                    console.log('[evaluateOnNewDocument] SET window.auth0: SDK object set, but createAuth0Client not yet function. Keys:', Object.keys(newValue));
                } else {
                    console.log('[evaluateOnNewDocument] SET window.auth0: Value is null or undefined.');
                }
                auth0ActualValue = newValue;
            }
        });
        window.addEventListener('error', function(event) {
            if (event.filename && (event.filename.includes('auth0-spa-sdk') || event.filename.includes('auth0-spa-js'))) {
                console.error('[evaluateOnNewDocument] Error event potentially from Auth0 SDK:', event.message, 'at', event.filename, ':', event.lineno);
            }
        });
    });

    // Enable request interception to log network requests
    await page.setRequestInterception(true);

    // Mock the error reporting endpoint to prevent actual HTTP calls during tests
    page.on('request', async (interceptedRequest) => {
        const url = interceptedRequest.url();
        if (url === 'http://localhost:3001/log-client-error') {
            console.log(`--- [Puppeteer Mock] Intercepted and mocked POST to: ${url} ---`);
            await interceptedRequest.respond({
                status: 200,
                contentType: 'application/json',
                headers: { "Access-Control-Allow-Origin": "*" }, // Allow requests from any origin for the mock
                body: JSON.stringify({ message: 'Error report mocked successfully' })
            });
            return;
        }

        // Log requests to the Auth0 CDN, local auth scripts, or the Auth0 authorization domain
        if (url.includes('auth0-spa') || url.includes('auth.js') || url.includes('dev-l57dcpkhob0u7ykb.us.auth0.com')) {
            console.log(`--- [Puppeteer Network] Requesting: ${url} ---`);
        }
        await interceptedRequest.continue(); // Use await here
    });

    page.on('response', response => {
        const url = response.url();
        if (url.includes('auth0-spa') || url.includes('auth.js') || url.includes('dev-l57dcpkhob0u7ykb.us.auth0.com')) {
            console.log(`--- [Puppeteer Network] Response from: ${url}, Status: ${response.status()} ---`);
        }
    });

    console.log('--- [Setup] Puppeteer browser launched and page object created. ---');

    console.log('--- [Setup] Starting Jekyll Server ---');

    // Wrap Jekyll startup and readiness check in a single promise for beforeAll
    await new Promise((resolve, reject) => {
        // Force the use of rbenv to ensure the correct Ruby version is selected for bundle and jekyll
        const jekyllCommand = 'rbenv';
        const jekyllArgs = ['exec', 'bundle', 'exec', 'jekyll', 'serve', '--port', String(JEKYLL_PORT), '--host', 'localhost', '--livereload', '--trace'];
        console.log(`--- [Setup] Spawning Jekyll with command: ${jekyllCommand} ${jekyllArgs.join(' ')} in CWD: ${BASE_APP_DIRECTORY} ---`);

        jekyllProcess = spawn(
            jekyllCommand,
            jekyllArgs,
            {
                cwd: BASE_APP_DIRECTORY,
                env: { ...process.env } // Inherit parent process environment
            }
        );

        // Use streamAndCollectOutput to populate jekyllStderrLines
        streamAndCollectOutput('Jekyll_Stderr', jekyllProcess.stderr, jekyllStderrLines);

        jekyllProcess.on('error', (err) => {
            console.error('--- [Setup] Failed to start Jekyll Server process:', err);
            jekyllStderrLines.push(`Failed to start Jekyll Server process: ${err.message}`); // Capture error
            reject(err); // Reject the main promise for Jekyll setup
        });

        // HTTP readiness check logic
        let retries = 0;
        const retryInterval = 100; // Make retry interval even shorter
        const JEKYLL_READINESS_TIMEOUT_MS = 30000; // Allow 30 seconds for Jekyll to be ready
        const maxRetries = Math.floor(JEKYLL_READINESS_TIMEOUT_MS / retryInterval);
        let readinessTimeoutId;

        const checkJekyllReady = () => {
            if (jekyllProcess && jekyllProcess.exitCode !== null) {
                clearTimeout(readinessTimeoutId);
                let errMsg = `Jekyll server exited prematurely with code ${jekyllProcess.exitCode}`;
                if (jekyllProcess.signalCode) {
                    errMsg += ` (signal: ${jekyllProcess.signalCode})`;
                }
                errMsg += ` while checking readiness.`;

                if (jekyllProcess.exitCode !== 0) { // Only log if it's an error exit
                    console.error(`--- [Setup] Jekyll Server STDERR output (on premature exit during readiness check): ---`);
                    console.error(jekyllStderrLines.join('\n'));
                }
                return reject(new Error(errMsg));
            }
            http.get(JEKYLL_READINESS_CHECK_URL, (res) => {
                res.resume(); // Consume response data
                if (res.statusCode === 200) {
                    console.log('--- [Setup] Jekyll Server is ready (HTTP check successful). ---');
                    clearTimeout(readinessTimeoutId);
                    resolve();
                } else {
                    console.log(`--- [Setup] HTTP check for Jekyll readiness failed with status ${res.statusCode}.`);
                    retry();
                }
            }).on('error', (err) => {
                console.log(`--- [Setup] HTTP check for Jekyll readiness encountered an error: ${err.message}.`);
                retry();
            });
        };

        const retry = () => {
            retries++;
            if (retries > maxRetries) {
                clearTimeout(readinessTimeoutId);
                console.error('--- [Setup] Jekyll Server readiness timeout (HTTP check). ---');
                if (jekyllStderrLines.length > 0) {
                    console.error(`--- [Setup] Jekyll Server STDERR output (on timeout): ---`);
                    console.error(jekyllStderrLines.join('\n'));
                }
                return reject(new Error('Jekyll Server readiness timeout.'));
            }
            console.log(`--- [Setup] Jekyll server not ready, retrying HTTP check (${retries}/${maxRetries})... ---`);
            readinessTimeoutId = setTimeout(checkJekyllReady, retryInterval);
        };

        // Start checks after a brief moment to allow the process to spawn and potentially output errors.
        console.log('--- [Setup] Jekyll process spawned. Waiting briefly before first HTTP check... ---');
        setTimeout(checkJekyllReady, 100); // Further reduced initial delay before first check
    });
    console.log('--- [Setup] Jekyll Server presumed ready. ---');
});

afterAll(async () => {
    console.log('--- [Teardown] Cleaning up... ---');

    // Conditionally close the browser
    if (process.env.KEEP_BROWSER_OPEN !== 'true') {
        const pauseDuration = 10; // Hardcoded to 10 seconds
        console.log(`--- [Teardown Debug] Pausing for ${pauseDuration} seconds before potentially closing browser. Allows dashboard inspection. ---`);
        await new Promise(resolve => setTimeout(resolve, pauseDuration * 1000));
        if (browser) {
            try {
                console.log('--- [Teardown] Closing Puppeteer browser... ---');
                let timeoutId;
                // Add a timeout for browser.close() as it can sometimes hang
                await Promise.race([
                    browser.close(),
                    new Promise((_, reject) => {
                        timeoutId = setTimeout(() => reject(new Error('browser.close() timed out after 5s')), 5000);
                    })
                ]).finally(() => {
                    clearTimeout(timeoutId); // Always clear the timeout
                });
                console.log('--- [Teardown] Puppeteer browser closed. ---');
            } catch (e) {
                console.error('--- [Teardown] Error closing Puppeteer browser:', e);
            }
        }
    } else {
        console.log('--- [Teardown] KEEP_BROWSER_OPEN is true. Browser will remain open. ---');
    }

    const killPromises = [];

    // Terminate Node.js Error Logger Server if it was started
    if (nodeLoggerProcess) {
        console.log('--- [Teardown] Stopping Node.js Error Logger Server... ---');
        killPromises.push(killProcessTree(nodeLoggerProcess, 'NodeLogger', 1000) 
            .catch(e => console.error("--- [Teardown] Error killing NodeLogger:", e)));
    }

    if (jekyllProcess) {
        console.log('--- [Teardown] Stopping Jekyll Server... ---');
        killPromises.push(killProcessTree(jekyllProcess, 'Jekyll', 1000) 
            .catch(e => console.error("--- [Teardown] Error killing Jekyll:", e)));
    }

    await Promise.allSettled(killPromises); // Use allSettled to ensure all attempts are made

    console.log('--- [Teardown] Cleanup finished. ---');
}, 20000); // Increased afterAll timeout to 20 seconds

describe('Website E2E Tests', () => { // Removed the explicit timeout from describe, will use it() timeout
    it('should load the homepage, allow auth.js to initialize, and not report client-side errors', async () => {
        console.log('--- [Test] Starting test case ---');
        const browserConsoleLogs = [];
        const browserPageErrorMessages = []; // Stores error messages for assertion

        page.on('console', async msg => { // Made async to handle msg.args()
            const originalBrowserMessageText = msg.text();
            const messageType = msg.type().toUpperCase();
            const location = msg.location(); // { url, lineNumber, columnNumber }

            // Updated pattern for waitForAuth0Sdk
            const authRetryPattern = /\[Auth\.js\] waitForAuth0Sdk: Retry #\d+\. window\.auth0 type: .*, createAuth0Client type: .*/;

            if (authRetryPattern.test(originalBrowserMessageText)) {
                return;
            }

            let detailedText = originalBrowserMessageText;
            if (messageType === 'ERROR' || messageType === 'WARN') {
                detailedText = `URL: ${location.url || 'N/A'}:${location.lineNumber || 'N/A'} - ${originalBrowserMessageText}`;
                // Attempt to get more details from arguments for "Failed to load resource"
                if (originalBrowserMessageText.startsWith('Failed to load resource')) {
                    const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => '[Unserializable Argument]')));
                    detailedText += ` (Details: ${args.join(', ')})`;
                }
            }
            
            browserConsoleLogs.push({ type: msg.type(), text: detailedText, rawText: originalBrowserMessageText });

            if (msg.type() === 'error' || msg.type() === 'warn') { // Log with more detail
                const logText = `BROWSER_CONSOLE (${messageType}): ${detailedText}`;
                process.stdout.write(logText + '\n');
            }
        });

        page.on('pageerror', err => {
            const errorMessage = `BROWSER_PAGE_ERROR: ${err.message}\nStack: ${err.stack}`;
            console.error(errorMessage);
            browserPageErrorMessages.push(err.message); 
        });

        const waitForAuthLogs = async (timeout = 10000) => { // Increased timeout to 10 seconds (aligns with auth.js internal timeout + buffer)
            console.log(`--- [Test] Waiting up to ${timeout / 1000} seconds for auth.js initialization signals... ---`);
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const initLog = browserConsoleLogs.some(log => log.text.includes("Auth0 initialization script finished."));
                const configLog = browserConsoleLogs.some(log => log.text.includes("Auth0 client configured successfully."));
                if (initLog && configLog) {
                    console.log('--- [Test] Auth.js initialization and configuration signals found. ---');
                    return;
                }
                await new Promise(r => setTimeout(r, 200)); // Poll interval
            }
            const missingLogs = [];
            if (!browserConsoleLogs.some(log => log.text.includes("Auth0 initialization script finished."))) {
                missingLogs.push("'Auth0 initialization script finished.'");
            }
            const configLogFound = browserConsoleLogs.some(log => log.text.includes("Auth0 client configured successfully."));
            if (!configLogFound) {
                missingLogs.push("'Auth0 client configured successfully.'");
            }
            if (missingLogs.length > 0) {
                throw new Error(`Timeout waiting for Auth.js initialization signals: ${missingLogs.join(' and ')} not found within ${timeout}ms.`);
            }
        };

        try {
            console.log(`--- [Test] Navigating to ${JEKYLL_SERVER_URL}... ---`);
            await page.goto(JEKYLL_SERVER_URL, { waitUntil: 'networkidle0', timeout: 20000 }); // Increased goto timeout to 20 seconds
            console.log('--- [Test] Page navigation complete. ---');
            await logAuthStatus(page, "After navigating to homepage");

            console.log('--- [Test Debug] Checking for window.auth0 on the Jekyll page... ---');
            const auth0Exists = await page.evaluate(() => typeof window.auth0 !== 'undefined');
            console.log(`--- [Test Debug] window.auth0 defined: ${auth0Exists} ---`);
            if (auth0Exists) {
                const createAuth0ClientExists = await page.evaluate(() => typeof window.auth0.createAuth0Client === 'function');
                console.log(`--- [Test Debug] window.auth0.createAuth0Client is function: ${createAuth0ClientExists} ---`);
            }

            const documentWriteWarning = browserConsoleLogs.find(log =>
                log.type === 'warn' && log.text.includes('is invoked via document.write')
            );
            if (documentWriteWarning) {
                console.error('--- [Test Debug] CRITICAL BROWSER WARNING FOUND: Auth0 SDK likely blocked/interfered with due to document.write. ---');
                console.error(`   DETAILS: ${documentWriteWarning.text}`);
            }

            console.log('--- [Test Debug] Checking if window.siteAuth is defined (indicates auth.js started)... ---');
            const siteAuthExists = await page.evaluate(() => typeof window.siteAuth !== 'undefined');
            console.log(`--- [Test Debug] window.siteAuth defined: ${siteAuthExists} ---`);
            if (!siteAuthExists) {
                console.error('--- [Test Debug] CRITICAL: window.siteAuth is NOT defined. auth.js likely did not execute or failed very early. ---');
            } else {
                const authJsEarlyLogs = browserConsoleLogs.filter(log =>
                    log.text.startsWith('[Auth.js] DOMContentLoaded') ||
                    (log.text.startsWith('[Auth.js] waitForAuth0Sdk: Starting') && log.text.includes('window.auth0'))
                );
                console.log(`--- [Test Debug] Early auth.js logs found: ${authJsEarlyLogs.length > 0} ---`, authJsEarlyLogs.map(l => l.text));
            }
    
            // Assuming CDN is the primary way to load Auth0 SDK.
            // If a local SDK (/assets/js/auth0-spa-sdk-v2.0.js) is intentionally also being used,
            // this check might be relevant. Otherwise, it can be removed if CDN is sole source.
            // For now, let's comment it out as the CDN version is clearly loading and working.
            // const pageContent = await page.content();
            // if (pageContent.includes('/assets/js/auth0-spa-sdk-v2.0.js')) {
            //     console.log('--- [Test Debug] Locally hosted Auth0 SPA SDK script tag found in page HTML. Ensure this is intended alongside CDN version. ---');
            // } else if (browserConsoleLogs.some(log => log.text.includes('Requesting: http://localhost:4000/assets/js/auth0-spa-sdk-v2.0.js'))) {
            //     // This case is if the file is requested but tag wasn't found - might indicate dynamic script injection or an issue.
            //     console.warn('--- [Test Debug] Locally hosted Auth0 SPA SDK was requested by the browser, but its script tag was not found in initial page HTML. ---');
            // }

            // Check for any browser console errors (not just pageerror events)
            const consoleErrors = browserConsoleLogs.filter(log => log.type === 'error');
            if (consoleErrors.length > 0) {
                console.error('--- [Test Debug] BROWSER CONSOLE ERRORS DETECTED: ---');
                consoleErrors.forEach(err => console.error(`  BROWSER_CONSOLE_ERROR: ${err.text}`));
            }

            try {
                await waitForAuthLogs(10000); // Use the increased default timeout
            } catch (e) {
                console.warn(`--- [Test] waitForAuthLogs may have failed or timed out due to SDK issue: ${e.message} ---`);
            }

            const title = await page.title();
            expect(title).toContain("Carson’s Meditations");

            await page.focus('body'); 
            await page.click('body');   

            const loginButtonSelector = '#btn-login';
            await page.click(loginButtonSelector);
            // After clicking #btn-login, we should be redirected to Auth0.
            // We can wait for the URL to change to the Auth0 domain.
            console.log('--- [Test] Clicked #btn-login (main login button). Expecting redirect to Auth0... ---');
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log('Navigation after #btn-login click to Auth0 might have timed out or was not a full navigation. Current URL:', page.url()));
            
            // Temporarily log the URL to see where it went, then make the assertion
            console.log(`--- [Test Debug] URL after #btn-login click: ${page.url()} ---`);
            expect(page.url()).toContain('dev-l57dcpkhob0u7ykb.us.auth0.com'); // Verify redirection to Auth0
            await logAuthStatus(page, "After clicking #btn-login and redirecting to Auth0 (before Auth0 page fully loads)");

            // --- [New Feature] Automate typing email on Auth0 page ---
            console.log('--- [Test] Waiting for Auth0 login page elements (email input)... ---');
            try {
                // Wait for the email input field on the Auth0 login page to be visible
                // The selector 'input#username' is standard for Auth0 Universal Login email field.
                const emailInputSelector = 'input#username';
                await page.waitForSelector(emailInputSelector, { visible: true, timeout: 5000 }); // Reduced timeout to 10 seconds
                console.log(`--- [Test] Email input field (${emailInputSelector}) found on Auth0 page. Typing email... ---`);
                
                await logAuthStatus(page, "On Auth0 page, before typing email");
                await page.type(emailInputSelector, 'carsontkempf@gmail.com', { delay: 50 }); // Type the email with a slight delay
                console.log('--- [Test] Email "carsontkempf@gmail.com" typed. ---');

                // --- [New] Automate typing password and clicking Continue ---
                const passwordInputSelector = 'input#password'; // Standard Auth0 password field ID
                await page.waitForSelector(passwordInputSelector, { visible: true, timeout: 7000 }); // Reduced timeout to 7 seconds
                console.log(`--- [Test] Password input field (${passwordInputSelector}) found. Typing password... ---`);
                await logAuthStatus(page, "On Auth0 page, before typing password");
                await page.type(passwordInputSelector, 'Testing1!', { delay: 50 });
                console.log('--- [Test] Password "Testing1!" typed. ---');

                // Selector for the "Continue" button based on provided attributes
                const continueButtonSelector = 'button[type="submit"][name="action"][value="default"]';
                await page.waitForSelector(continueButtonSelector, { visible: true, timeout: 10000 });
                console.log(`--- [Test] Continue button (${continueButtonSelector}) found. Clicking... ---`);
                await logAuthStatus(page, "On Auth0 page, before clicking Continue");
                await page.click(continueButtonSelector);
                console.log('--- [Test] Clicked the Continue button. ---');
                await logAuthStatus(page, "Immediately after clicking Continue on Auth0 page");
                // --- [End of New] ---
                
                // The test will now proceed to the 70-second wait, allowing for manual password entry
                // or further automated steps if added later.
            } catch (e) {
                // Updated error message to be more generic for this block
                console.error(`--- [Test] Error interacting with Auth0 login page (email/password/continue): ${e.message} ---`);
                // Depending on desired behavior, you might want to fail the test here
                // For now, it will proceed to the long wait, allowing for manual recovery.
            }
            // --- [End of New Feature] ---

            console.log('--- [Test] Waiting for redirect back to application and Auth0 processing (up to 70s)... ---');
            await logAuthStatus(page, "Before 70s wait (after Auth0 redirect initiated)");

            // Wait for the URL to be back on the app, without code/state, and for auth to process
            // This also implies that auth.js has run and handled the redirect.
            try {
                await page.waitForFunction(
                    () => window.location.href.startsWith('http://localhost:4000') && // Back on our app
                          !window.location.search.includes('code=') && // Code processed
                          !window.location.search.includes('state=') && // State processed
                          window.siteAuth && typeof window.siteAuth.isAuthenticated !== 'undefined' && // siteAuth initialized
                          window.siteAuth.isAuthenticated === true, // User is authenticated
                    { timeout: 25000 } // Timeout for Auth0 processing and auth.js to update state
                );
                console.log('--- [Test] Redirected back to application and window.siteAuth.isAuthenticated is true. ---');
            } catch (e) {
                console.error(`--- [Test] Timeout or error waiting for authentication to complete: ${e.message} ---`);
                await logAuthStatus(page, "After failed wait for siteAuth.isAuthenticated");
                const pageContentAfterFail = await page.content();
                console.log("Page content after failed auth wait:", pageContentAfterFail.substring(0, 1000)); // Log first 1KB
                throw e; // Re-throw to fail the test
            }

            await logAuthStatus(page, "After successful Auth0 redirect and processing");

            expect(browserPageErrorMessages).toEqual([]);
            const finalConsoleErrors = browserConsoleLogs.filter(log => 
                log.type === 'error' && 
                !log.text.includes("favicon.ico") && // Optionally ignore favicon errors
                !log.rawText.includes('log-client-error')); // Ignore mocked error reporting calls if they still somehow log an error text
            expect(finalConsoleErrors.map(e => e.text)).toEqual([]);

        } catch (error) {
            console.error("--- [Test] Test failed with error: ---", error.message);
            if (browserConsoleLogs.length > 0) {
                process.stdout.write("--- [Test] Collected Browser Console Logs (on error):\n");
                browserConsoleLogs.forEach(logEntry => {
                    process.stdout.write(`  ${logEntry.type.toUpperCase()}: ${logEntry.text}\n`);
                });
            }
            throw error; 
        }

        if (browserConsoleLogs.length > 0) {
            process.stdout.write("--- [Test] Collected Browser Console Logs (end of successful test):\n");
            browserConsoleLogs.forEach(logEntry => {
                process.stdout.write(`  ${logEntry.type.toUpperCase()}: ${logEntry.text}\n`);
            });
        }
        process.stdout.write("--- [Test] Test completed successfully.\n");

    }, 60000); // Increased overall test case timeout to 60 seconds for the full flow.
});
