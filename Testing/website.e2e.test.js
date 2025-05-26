// /Users/ctk/Programming/VSCodeProjects/carsontkempf.github.io/Testing/website.e2e.test.js
const { spawn } = require('child_process'); // Using built-in for simplicity, cross-spawn is an alternative
const puppeteer = require('puppeteer');
const treeKill = require('tree-kill');
const path = require('path');
const http = require('http'); // For Jekyll readiness check

const BASE_APP_DIRECTORY = path.resolve(__dirname, '..'); // Assumes test file is in Testing/
const JEKYLL_PORT = 4000;
const JEKYLL_SERVER_URL = `http://localhost:${JEKYLL_PORT}`;
const LOGIN_PAGE_URL = `${JEKYLL_SERVER_URL}/login/`; // Used for Jekyll readiness
// const ERROR_LOGGER_URL = 'http://localhost:3001'; // If your error logger server has a health check endpoint

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
async function killProcessTree(proc, processName, killTimeout = 10000) { // Added killTimeout, default 10s
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

// Increase Jest's default timeout for async operations in beforeAll/afterAll
jest.setTimeout(180000); // 3 minutes for the entire test file setup/teardown/run

beforeAll(async () => {
    // 3. Launch Puppeteer (Moved to be the first operation)
    console.log('--- [Setup] Launching Puppeteer browser... ---');
    browser = await puppeteer.launch({
        headless: false, // Set to false to see the browser window
        slowMo: 100,      // Slows down Puppeteer operations by 100ms to make it easier to see
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common for CI environments
    });
    // page = await browser.newPage(); // Old: This creates a new, additional page.

    // New: Get existing pages and use the first one.
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

    // Enable request interception to log network requests
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        const url = interceptedRequest.url();
        // Log requests to the Auth0 CDN or other critical scripts
        if (url.includes('cdn.auth0.com') || url.includes('auth.js')) {
            console.log(`--- [Puppeteer Network] Requesting: ${url} ---`);
        }
        interceptedRequest.continue();
    });
    page.on('response', response => {
        const url = response.url();
        if (url.includes('cdn.auth0.com') || url.includes('auth.js')) { // Ensure auth.js responses are logged
            console.log(`--- [Puppeteer Network] Response from: ${url}, Status: ${response.status()} ---`);
        }
    });

    console.log('--- [Setup] Puppeteer browser launched and page object created. ---');

    // Placeholder: Start your Node.js Error Logger Server here if it's managed by the test
    // For example:
    // console.log('--- [Setup] Starting Node.js Error Logger Server ---');
    // nodeLoggerProcess = spawn('node', ['path/to/your/error-logger-server.js'], { cwd: BASE_APP_DIRECTORY });

    console.log('--- [Setup] Starting Jekyll Server ---');
    // let jekyllReadyPromiseResolved = false; // Removed - Unused

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
        const retryInterval = 1500; // ms
        const maxRetries = Math.floor(90000 / retryInterval); // Target ~90 seconds (60 retries * 1.5s/retry = 90s)
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
            http.get(LOGIN_PAGE_URL, (res) => {
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
        setTimeout(checkJekyllReady, 500); // Adjust delay as needed
    });
    console.log('--- [Setup] Jekyll Server presumed ready. ---');
});

afterAll(async () => {
    console.log('--- [Teardown] Cleaning up... ---');

    // Attempt to close browser first, as it might be holding resources or causing hangs
    if (browser) {
        try {
            console.log('--- [Teardown] Closing Puppeteer browser... ---');
            // Add a timeout for browser.close() as it can sometimes hang
            await Promise.race([
                browser.close(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('browser.close() timed out after 3s')), 3000)) // Reduced timeout
            ]);
            console.log('--- [Teardown] Puppeteer browser closed. ---');
        } catch (e) {
            console.error('--- [Teardown] Error closing Puppeteer browser:', e);
        }
    }

    const killPromises = [];

    // Terminate Node.js Error Logger Server if it was started
    if (nodeLoggerProcess) {
        console.log('--- [Teardown] Stopping Node.js Error Logger Server... ---');
        killPromises.push(killProcessTree(nodeLoggerProcess, 'NodeLogger', 2000) // Reduced timeout to 2s
            .catch(e => console.error("--- [Teardown] Error killing NodeLogger:", e)));
    }

    if (jekyllProcess) {
        console.log('--- [Teardown] Stopping Jekyll Server... ---');
        killPromises.push(killProcessTree(jekyllProcess, 'Jekyll', 3000) // Reduced timeout to 3s
            .catch(e => console.error("--- [Teardown] Error killing Jekyll:", e)));
    }

    await Promise.allSettled(killPromises); // Use allSettled to ensure all attempts are made

    console.log('--- [Teardown] Cleanup finished. ---');
}, 10000); // Further reduced afterAll timeout to 10 seconds

describe('Website E2E Tests', () => {
    it('should load the homepage, allow auth.js to initialize, and not report client-side errors', async () => {
        console.log('--- [Test] Starting test case ---');
        const browserConsoleLogs = [];
        const browserPageErrorMessages = []; // Stores error messages for assertion

        page.on('console', msg => {
            const originalBrowserMessageText = msg.text();

            // Pattern for the verbose Auth.js retry messages that you want to suppress.
            // These are the messages that, when logged by your test script,
            // would then have the Jest stack trace (like "at log (...)") appended by Jest.
            // Updated pattern to match the actual log output from auth.js:
            const authRetryPattern = /\[Auth\.js\] waitForAuth0Spa: Retry #\d+\. window\.auth0spa type: .*, createAuth0Client type: .*/;

            if (authRetryPattern.test(originalBrowserMessageText)) {
                // By returning here, we prevent these specific verbose browser messages
                // from being added to browserConsoleLogs and from being immediately printed.
                // This, in turn, means Jest won't append its stack trace for the logging of these messages.
                // You can uncomment the next line for debugging to see which messages are skipped.
                // process.stdout.write(`--- [Test] Debug: Skipping verbose browser log: "${originalBrowserMessageText.substring(0, 70)}..." ---\n`);
                return; // Skip adding this message to browserConsoleLogs
            }
            // To avoid verbose stack traces from this console.log call itself,
            // we'll collect the logs and print them more selectively,
            // or only print errors/warnings immediately.
            browserConsoleLogs.push({ type: msg.type(), text: originalBrowserMessageText });

            // Optionally, still log errors and warnings immediately for quicker feedback,
            // but without the default Node.js console.log stack trace for every message.
            if (msg.type() === 'error' || msg.type() === 'warn') {
                const logText = `BROWSER_CONSOLE (${msg.type().toUpperCase()}): ${originalBrowserMessageText}`;
                process.stdout.write(logText + '\n');
            }
        });

        page.on('pageerror', err => {
            const errorMessage = `BROWSER_PAGE_ERROR: ${err.message}\nStack: ${err.stack}`;
            console.error(errorMessage);
            browserPageErrorMessages.push(err.message); // Collect for assertion
            // Consider failing the test immediately if a page error is critical
            // throw err;
        });

        const waitForAuthLogs = async (timeout = 10000) => {
            console.log(`--- [Test] Waiting up to ${timeout / 1000} seconds for auth.js initialization signals... ---`);
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const initLog = browserConsoleLogs.some(log => log.text.includes("Auth0 initialization script finished."));
                const configLog = browserConsoleLogs.some(log => log.text.includes("Auth0 client configured successfully."));

                if (initLog && configLog) {
                    console.log('--- [Test] Auth.js initialization signals found. ---');
                    return; // Success
                }
                await new Promise(r => setTimeout(r, 500)); // Poll every 500ms
            }

            // If loop finishes, it's a timeout. Check what's missing.
            const missingLogs = [];
            if (!browserConsoleLogs.some(log => log.text.includes("Auth0 initialization script finished."))) {
                missingLogs.push("'Auth0 initialization script finished.'");
            }
            if (!browserConsoleLogs.some(log => log.text.includes("Auth0 client configured successfully."))) {
                missingLogs.push("'Auth0 client configured successfully.'");
            }
            if (missingLogs.length > 0) {
                throw new Error(`Timeout waiting for Auth.js initialization signals: ${missingLogs.join(' and ')} not found within ${timeout}ms.`);
            }
        };

        try {
            console.log(`--- [Test] Navigating to ${JEKYLL_SERVER_URL}... ---`);
            await page.goto(JEKYLL_SERVER_URL, { waitUntil: 'networkidle0', timeout: 30000 }); // Reduced goto timeout
            console.log('--- [Test] Page navigation complete. ---');

            // Give a slightly longer, explicit pause AFTER networkidle0 to ensure all scripts,
            // especially externally loaded ones like the Auth0 CDN, have had ample time to execute.
            console.log('--- [Test Debug] Waiting 3 seconds after networkidle0 for all scripts to fully execute... ---');
            await new Promise(r => setTimeout(r, 3000));

            // --- Reverted ISOLATION TEST - Now checking window.auth0spa on the actual Jekyll page ---
            // --- START ISOLATION TEST FOR AUTH0 CDN SCRIPT (TEMPORARY) ---
            console.log('--- [Test Debug] Starting ISOLATION TEST for Auth0 CDN script ---');
            const minimalHtmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Auth0 SDK Isolation Test</title>
                    <meta charset="utf-8">
                    <!-- Using defer as we did in the main layout -->
                    <script defer src="https://cdn.auth0.com/js/auth0-spa-js/1.13/auth0-spa-js.production.js"></script> <!-- TRYING OLDER VERSION -->
                </head>
                <body>
                    <h1>Testing Auth0 SDK Load</h1>
                    <p id="sdk-status">SDK status: Unknown</p>
                    <script>
                        // Give it a moment for the CDN script to potentially load and execute
                        // DOMContentLoaded might be more reliable here if defer is used
                        document.addEventListener('DOMContentLoaded', () => {
                            setTimeout(() => {
                                const spaType = typeof window.auth0spa;
                                console.log('[IsolationTest] After DOMContentLoaded + 1.5s timeout: window.auth0spa type:', spaType);
                                document.getElementById('sdk-status').textContent = 'SDK status: window.auth0spa type is ' + spaType;
                                if (spaType !== 'undefined' && window.auth0spa) {
                                    console.log('[IsolationTest] window.auth0spa.createAuth0Client type:', typeof window.auth0spa.createAuth0Client);
                                }
                            }, 1500);
                        });
                    </script>
                </body>
                </html>
            `;
            await page.setContent(minimalHtmlContent, { waitUntil: 'networkidle0' });
            console.log('--- [Test Debug] Minimal HTML page loaded via setContent. Waiting 3 seconds for its inline script to log... ---');
            await new Promise(r => setTimeout(r, 3000)); // Wait for console logs from the minimal page

            console.log('--- [Test Debug] Checking for window.auth0spa from test context after minimal HTML (setContent)... ---');
            const auth0SpaExists = await page.evaluate(() => typeof window.auth0spa !== 'undefined');
            console.log(`--- [Test Debug] window.auth0spa defined: ${auth0SpaExists} ---`);
            if (auth0SpaExists) {
                const createAuth0ClientExists = await page.evaluate(() => typeof window.auth0spa.createAuth0Client === 'function');
                console.log(`--- [Test Debug] window.auth0spa.createAuth0Client is function: ${createAuth0ClientExists} ---`);
            }
            console.log('--- [Test Debug] END ISOLATION TEST for Auth0 CDN script ---');
            // IMPORTANT: The test will likely fail after this point because we are no longer on JEKYLL_SERVER_URL.
            // This is for diagnosing the Auth0 CDN script in isolation.
            // To proceed with the full test, you'll need to comment out this setContent block
            // and ensure page.goto(JEKYLL_SERVER_URL,...) is the active navigation.

            // --- Check specifically for the document.write warning ---
            const documentWriteWarning = browserConsoleLogs.find(log =>
                log.type === 'warn' && log.text.includes('is invoked via document.write')
            );
            if (documentWriteWarning) {
                console.error('--- [Test Debug] CRITICAL BROWSER WARNING FOUND: Auth0 SDK likely blocked/interfered with due to document.write. ---');
                console.error(`   DETAILS: ${documentWriteWarning.text}`);
            }


            // --- BEGIN auth.js SPECIFIC DEBUG ---
            console.log('--- [Test Debug] Checking if window.siteAuth is defined (indicates auth.js started)... ---');
            const siteAuthExists = await page.evaluate(() => typeof window.siteAuth !== 'undefined');
            console.log(`--- [Test Debug] window.siteAuth defined: ${siteAuthExists} ---`);
            if (!siteAuthExists) {
                console.error('--- [Test Debug] CRITICAL: window.siteAuth is NOT defined. auth.js likely did not execute or failed very early. ---');
            } else {
                // If siteAuth exists, let's see if auth.js itself logged its early messages
                const authJsEarlyLogs = browserConsoleLogs.filter(log =>
                    log.text.startsWith('[Auth.js] DOMContentLoaded') ||
                    log.text.startsWith('[Auth.js] waitForAuth0Spa: Starting')
                );
                console.log(`--- [Test Debug] Early auth.js logs found: ${authJsEarlyLogs.length > 0} ---`, authJsEarlyLogs.map(l => l.text));
            }
            // --- END auth.js SPECIFIC DEBUG ---

            const pageContent = await page.content();
            if (!pageContent.includes('https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js')) {
                console.error('--- [Test Debug] CRITICAL: Auth0 SPA SDK script tag NOT FOUND in page HTML. ---');
            }

            // --- Check for any immediate JS errors from the browser console that aren't from auth.js
            const nonAuthJsErrors = browserConsoleLogs.filter(log => log.type === 'error' && !log.text.startsWith('[Auth.js'));
            if (nonAuthJsErrors.length > 0) {
                console.error('--- [Test Debug] POTENTIAL BLOCKING ERRORS (Non-Auth.js): ---');
                nonAuthJsErrors.forEach(err => console.error(`  BROWSER_CONSOLE_ERROR: ${err.text}`));
            }

            await waitForAuthLogs(30000); // Wait up to 30s for auth logs

            // Initial assertions
            const title = await page.title();
            expect(title).toContain("Carson’s Meditations");

            // If a pageerror occurred, the test would have failed. This confirms no errors were collected.
            expect(browserPageErrorMessages).toEqual([]);

            // Assert that auth logs were indeed found
            expect(browserConsoleLogs.some(log => log.text.includes("Auth0 initialization script finished."))).toBe(true);
            expect(browserConsoleLogs.some(log => log.text.includes("Auth0 client configured successfully."))).toBe(true);

            // Wait 2 seconds then simulate keypress on login button
            console.log('--- [Test] Waiting 2 seconds before interacting with login button... ---');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Keep a short delay or remove if page.click's internal waits are sufficient

            const loginButtonSelector = '#btn-login';
            console.log(`--- [Test] Attempting to click login button: ${loginButtonSelector} ---`);
            await page.click(loginButtonSelector);
            console.log('--- [Test] Login button clicked. Waiting for navigation to login page... ---');

            // Wait for the navigation to the login page to complete
            await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
            console.log(`--- [Test] Navigated to: ${page.url()}. Page should be the login page. ---`);
            // You could add an assertion here to check if the URL is indeed the login page, e.g.:
            // expect(page.url()).toContain('/login/');

            // If all above passed, start 90s observation window
            console.log('--- [Test] Initial checks and login button interaction complete. Entering 90-second observation window on the current page... ---');
            await new Promise(resolve => setTimeout(resolve, 90000));
            // If a pageerror occurs during these 90s, the 'pageerror' handler will throw and fail the test.
            console.log('--- [Test] 90-second observation window completed. ---');
            // Final check: ensure no errors were logged during the observation window.
            // If an error occurred, the test should have failed and not reached here.
            expect(browserPageErrorMessages).toEqual([]);

        } catch (error) {
            console.error("--- [Test] Test failed with error: ---", error.message);
            // Log collected browser console logs on any error
            if (browserConsoleLogs.length > 0) {
                process.stdout.write("--- [Test] Collected Browser Console Logs (on error):\n");
                browserConsoleLogs.forEach(logEntry => {
                    process.stdout.write(`  ${logEntry.type.toUpperCase()}: ${logEntry.text}\n`);
                });
            }
            throw error; // Rethrow to ensure Jest marks the test as failed
        }

        // If execution reaches here, the test is considered passed.
        if (browserConsoleLogs.length > 0) {
            process.stdout.write("--- [Test] Collected Browser Console Logs (end of successful test):\n");
            browserConsoleLogs.forEach(logEntry => {
                process.stdout.write(`  ${logEntry.type.toUpperCase()}: ${logEntry.text}\n`);
            });
        }
        process.stdout.write("--- [Test] Test completed successfully.\n");

    }, 70000); // Test case timeout: ~30s (goto) + ~30s (auth) + 2s (delay) + ~15s (login nav) + 90s (observe) + ~13s (buffer) = 180 seconds
});
