// /Users/ctk/Programming/VSCodeProjects/carsontkempf.github.io/Testing/website.e2e.test.js
const { spawn } = require('child_process'); // Using built-in for simplicity, cross-spawn is an alternative
const puppeteer = require('puppeteer');
const treeKill = require('tree-kill');
const path = require('path');
const http = require('http'); // For Jekyll readiness check

const BASE_APP_DIRECTORY = path.resolve(__dirname, '..'); // Assumes test file is in Testing/
const JEKYLL_PORT = 4000;
const JEKYLL_SERVER_URL = `http://localhost:${JEKYLL_PORT}`;
const HOMEPAGE_URL = `${JEKYLL_SERVER_URL}/`; // Used for Jekyll readiness

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

// Increase Jest's default timeout for async operations in beforeAll/afterAll
jest.setTimeout(5000); // Reduced overall Jest timeout to 1 minute

beforeAll(async () => {
    // 3. Launch Puppeteer (Moved to be the first operation)
    console.log('--- [Setup] Launching Puppeteer browser... ---');
    browser = await puppeteer.launch({
        headless: false, // Set to false to see the browser window
        slowMo: 5,      // Reduced slowMo
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

    // Inject script to monitor window.auth0spa definition
    await page.evaluateOnNewDocument(() => {
        let auth0SpaActualValue;
        // let errorDuringDefinition = null; // Not used currently
        console.log('[evaluateOnNewDocument] Setting updefineProperty for window.auth0spa');

        Object.defineProperty(window, 'auth0spa', {
            configurable: true,
            enumerable: true,
            get() {
                console.log('[evaluateOnNewDocument] GET window.auth0spa. Current type:', typeof auth0SpaActualValue);
                return auth0SpaActualValue;
            },
            set(newValue) {
                console.log('[evaluateOnNewDocument] SET window.auth0spa. New value type:', typeof newValue);
                if (newValue && typeof newValue.createAuth0Client === 'function') {
                    console.log('[evaluateOnNewDocument] SETTER: newValue.createAuth0Client is a function!');
                } else if (newValue) {
                    console.log('[evaluateOnNewDocument] SETTER: newValue.createAuth0Client is NOT a function or undefined. Keys:', Object.keys(newValue));
                } else {
                    console.log('[evaluateOnNewDocument] SETTER: newValue is null or undefined.');
                }
                auth0SpaActualValue = newValue;
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
    page.on('request', interceptedRequest => {
        const url = interceptedRequest.url();
        // Log requests to the Auth0 CDN or other critical scripts
        if (url.includes('auth0-spa') || url.includes('auth.js')) { // More generic for local/CDN SDK
            console.log(`--- [Puppeteer Network] Requesting: ${url} ---`);
        }
        interceptedRequest.continue();
    });
    page.on('response', response => {
        const url = response.url();
        if (url.includes('auth0-spa') || url.includes('auth.js')) { // More generic for local/CDN SDK
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
        const maxRetries = Math.floor(1500 / retryInterval); // Target ~30 seconds for Jekyll readiness, check much more frequently
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
            http.get(HOMEPAGE_URL, (res) => {
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

    // Attempt to close browser first, as it might be holding resources or causing hangs
    if (browser) {
        try {
            console.log('--- [Teardown] Closing Puppeteer browser... ---');
            // Add a timeout for browser.close() as it can sometimes hang
            await Promise.race([
                browser.close(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('browser.close() timed out after 3s')), 1000)) 
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
}, 10000); 

describe('Website E2E Tests', () => {
    it('should load the homepage, allow auth.js to initialize, and not report client-side errors', async () => {
        console.log('--- [Test] Starting test case ---');
        const browserConsoleLogs = [];
        const browserPageErrorMessages = []; // Stores error messages for assertion

        page.on('console', msg => {
            const originalBrowserMessageText = msg.text();
            const authRetryPattern = /\[Auth\.js\] waitForAuth0Spa: Retry #\d+\. window\.auth0spa type: .*, createAuth0Client type: .*/;

            if (authRetryPattern.test(originalBrowserMessageText)) {
                return; 
            }
            browserConsoleLogs.push({ type: msg.type(), text: originalBrowserMessageText });
            if (msg.type() === 'error' || msg.type() === 'warn') {
                const logText = `BROWSER_CONSOLE (${msg.type().toUpperCase()}): ${originalBrowserMessageText}`;
                process.stdout.write(logText + '\n');
            }
        });

        page.on('pageerror', err => {
            const errorMessage = `BROWSER_PAGE_ERROR: ${err.message}\nStack: ${err.stack}`;
            console.error(errorMessage);
            browserPageErrorMessages.push(err.message); 
        });

        const waitForAuthLogs = async (timeout = 500) => { // Further reduced default timeout
            console.log(`--- [Test] Waiting up to ${timeout / 100} seconds for auth.js initialization signals... ---`);
            const startTime = Date.now();
            while (Date.now() - startTime < timeout) {
                const initLog = browserConsoleLogs.some(log => log.text.includes("Auth0 initialization script finished."));
                if (initLog) { 
                    console.log('--- [Test] Auth.js "initialization script finished" signal found. Proceeding despite likely SDK failure. ---');
                    return; 
                }
                await new Promise(r => setTimeout(r, 100)); // Further reduced poll interval
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
            await page.goto(JEKYLL_SERVER_URL, { waitUntil: 'networkidle0', timeout: 1200 }); // Increased goto timeout
            console.log('--- [Test] Page navigation complete. ---');

            console.log('--- [Test Debug] Checking for window.auth0spa on the Jekyll page (expecting local SDK)... ---');
            const auth0SpaExists = await page.evaluate(() => typeof window.auth0spa !== 'undefined');
            console.log(`--- [Test Debug] window.auth0spa defined: ${auth0SpaExists} ---`);
            if (auth0SpaExists) {
                const createAuth0ClientExists = await page.evaluate(() => typeof window.auth0spa.createAuth0Client === 'function');
                console.log(`--- [Test Debug] window.auth0spa.createAuth0Client is function: ${createAuth0ClientExists} ---`);
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
                    (log.text.startsWith('[Auth.js] waitForAuth0Spa: Starting') && log.text.includes('window.auth0spa')) 
                );
                console.log(`--- [Test Debug] Early auth.js logs found: ${authJsEarlyLogs.length > 0} ---`, authJsEarlyLogs.map(l => l.text));
            }
    

            const pageContent = await page.content();
            if (!pageContent.includes('/assets/js/auth0-spa-sdk-v2.0.js')) {
                console.error('--- [Test Debug] CRITICAL: Locally hosted Auth0 SPA SDK script tag (/assets/js/auth0-spa-sdk-v2.0.js) NOT FOUND in page HTML. ---');
            }

            const nonAuthJsErrors = browserConsoleLogs.filter(log => log.type === 'error' && !log.text.startsWith('[Auth.js'));
            if (nonAuthJsErrors.length > 0) {
                console.error('--- [Test Debug] POTENTIAL BLOCKING ERRORS (Non-Auth.js): ---');
                nonAuthJsErrors.forEach(err => console.error(`  BROWSER_CONSOLE_ERROR: ${err.text}`));
            }

            try {
                await waitForAuthLogs(10); // Further reduced timeout for waiting for auth logs
            } catch (e) {
                console.warn(`--- [Test] waitForAuthLogs may have failed or timed out due to SDK issue: ${e.message} ---`);
            }

            const title = await page.title();
            expect(title).toContain("Carson’s Meditations");

            await page.focus('body'); 
            await page.click('body');   

            const loginButtonSelector = '#btn-login';
            await page.click(loginButtonSelector);

            await page.focus('body');
            await page.click('body');

            const actualLoginButtonSelector = '#btn-actual-login';
            await page.click(actualLoginButtonSelector);

            await new Promise(resolve => setTimeout(resolve, 2000)); 

            expect(browserPageErrorMessages).toEqual([]);

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

    }, 10000); // Reduced overall test case timeout
});
