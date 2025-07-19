// Auth0 client-side integration
window.siteAuth = {
	debug: true, // Global debug flag for siteAuth related logs
	isAuthenticated: false,
	user: null,
	accessToken: null,
	auth0Client: null,
	getApiKey: null,
	checkAccess: null
};

function siteAuthLog(...args) {
	if (window.siteAuth.debug) {
		console.log('[Auth.js]', ...args);
	}
}

// Helper to serialize error objects for sending to the server
function serializeErrorForReporting(error) {
    if (error instanceof Error) {
        const plainError = {};
        Object.getOwnPropertyNames(error).forEach(key => {
            plainError[key] = error[key];
        });
        // Ensure stack and message are included if not already enumerable
        if (!plainError.message) plainError.message = error.message;
        if (!plainError.stack) plainError.stack = error.stack;
        return plainError;
    }
    // If it's not an Error object, try to stringify it or return as is
    try {
        return JSON.parse(JSON.stringify(error)); // Basic attempt to clone/serialize
    } catch {
        return String(error);
    }
}

async function reportErrorToServer(errorToReport) {
    // Skip error reporting if we're in development and no error server is running
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[Auth.js] Skipping error reporting in development environment');
        return;
    }
    const errorDetails = serializeErrorForReporting(errorToReport);
    let requestBody;

    try {
        requestBody = JSON.stringify({
            timestamp: new Date().toISOString(),
            url: window.location.href,
            error: errorDetails,
            userAgent: navigator.userAgent
        });
    } catch (stringifyError) {
        console.error('[Auth.js] CRITICAL: Failed to stringify error report body:', stringifyError, '(Original error was:', errorToReport, ')');
        // Fallback: try sending a very basic error message if main serialization fails
        try {
            await fetch('http://localhost:3001/log-client-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    error: { message: "Error during client-side error serialization. Original: " + String(errorToReport) + (errorToReport && errorToReport.stack ? ". Stack: " + errorToReport.stack : "") },
                    userAgent: navigator.userAgent
                }),
            });
        } catch (fallbackReportingError) {
            console.warn('[Auth.js] Failed to report even fallback error to server:', fallbackReportingError);
        }
        return; // Don't proceed with the original fetch if stringify failed
    }

    try {
        const response = await fetch('http://localhost:3001/log-client-error', { // Dedicated error logging server
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: requestBody,
        });
        if (!response.ok) {
            console.warn('[Auth.js] Error logging server returned non-OK status:', response.status, response.statusText);
            return; // Don't try to parse response if it's not OK
        }
        // Only try to parse as JSON if response is OK
        const responseText = await response.text();
        if (responseText && responseText !== 'Not found.') {
            try {
                JSON.parse(responseText); // Validate it's JSON
            } catch (parseError) {
                console.warn('[Auth.js] Server returned non-JSON response:', responseText);
            }
        }
    } catch (reportingError) {
        console.warn('[Auth.js] Failed to report error to server:', reportingError, '(Original error was:', errorToReport, ')');
    }
}

function siteAuthError(...args) {
	console.error('[Auth.js ERROR]', ...args);
    // Attempt to find an Error object among args or construct one
    const errorArg = args.find(arg => arg instanceof Error);
    if (errorArg) {
        reportErrorToServer(errorArg);
    } else {
        // Create a new error from the arguments for reporting
        const message = args.map(arg => {
            if (typeof arg === 'string') return arg;
            try { return JSON.stringify(arg); } catch { return String(arg); }
        }).join(' ');
        reportErrorToServer(new Error(message));
    }
}

// --- Global Error Handlers to report unhandled issues to the server ---
// Attach these as early as possible.

window.addEventListener('unhandledrejection', function(event) {
	siteAuthLog('[Global Handler] Unhandled promise rejection detected.');
	let errorToReport;
	if (event.reason instanceof Error) {
		errorToReport = event.reason;
	} else {
		let message = `Unhandled promise rejection. Reason type: ${typeof event.reason}.`;
		try {
			message += ` Reason: ${JSON.stringify(event.reason)}`;
		} catch {
			message += ` Reason: ${String(event.reason)}`;
		}
		errorToReport = new Error(message);
		// Attempt to capture some detail if reason is not an error
		if (typeof event.reason !== 'undefined' && event.reason !== null) {
			try {
				// If event.reason is an object, copy its properties to the error object
				if (typeof event.reason === 'object') {
					Object.assign(errorToReport, event.reason);
				}
				errorToReport.originalReason = JSON.stringify(event.reason); // Keep a serialized version
			} catch (e) {
				errorToReport.details = String(event.reason);
			}
		}
	}
	console.warn('[Auth.js Global] Unhandled Rejection:', event.reason, errorToReport);
	reportErrorToServer(errorToReport);
});

window.onerror = function(message, source, lineno, colno, error) {
	siteAuthLog('[Global Handler] Unhandled error detected by window.onerror.');
	let errorToReport = error;
	if (error instanceof Error) {
		// Ensure all properties are captured if it's already an Error
		errorToReport.message = error.message || message; // Prefer error object's message
		errorToReport.source = error.source || source;
		errorToReport.lineno = error.lineno || lineno;
		errorToReport.colno = error.colno || colno;
	} else {
		// Construct an error if one isn't provided
		errorToReport = new Error(message || 'Unknown global error');
		errorToReport.source = source;
		errorToReport.lineno = lineno;
		errorToReport.colno = colno;
	}
	console.warn('[Auth.js Global] window.onerror captured:', errorToReport);
	reportErrorToServer(errorToReport);
	return false; // Let default browser error handling also run
};

// These constants will be used by functions within onAuth0SdkReady
const auth0Domain = 'dev-l57dcpkhob0u7ykb.us.auth0.com';
const auth0ClientId = 'Dq4tBsHjgcIGbXkVU8PPvjAq3WYmnSBC'; // Ensure this is the Client ID for your "Carson's Meditations" APPLICATION
const auth0Audience = 'https://carsontkempf.github.io/api/carsons-meditations'; // <-- UPDATE THIS to your new API Identifier

// To be determined once on DOMContentLoaded
let siteBaseUrl = '';

function determineSiteBaseUrl() {
	const baseElement = document.querySelector('base[href]');
	// For GitHub Pages, site.baseurl is usually empty for user/org pages (carsontkempf.github.io)
	// and /repo-name for project pages.
	if (baseElement) {
		try {
			// Get the full href, then extract the pathname, then remove trailing slash
			const fullBaseHref = new URL(baseElement.href, window.location.origin).href;
			siteBaseUrl = new URL(fullBaseHref).pathname.replace(/\/$/, '');
		} catch (e) {
			siteAuthLog('determineSiteBaseUrl: Could not parse base href, defaulting to empty base URL.', baseElement.href, e);
			siteBaseUrl = '';
		}
	} else {
		// Fallback if no <base> tag: For localhost or root deployments, base is empty.
		// For GitHub Pages project sites, this would need more specific logic if not using <base> tag.
		siteBaseUrl = ''; // Default to empty if no base tag, common for root deployments.
		siteAuthLog(`determineSiteBaseUrl: No <base> tag found, assuming root deployment. siteBaseUrl: "${siteBaseUrl}"`);
	}
}

document.addEventListener('DOMContentLoaded', async () => {
	siteAuthLog('DOMContentLoaded event fired. Starting Auth0 initialization process.');
	siteAuthLog('Auth0 Config:', { auth0Domain, auth0ClientId, auth0Audience });

	const loginButton = document.getElementById('btn-login');
	// Define and assign core methods to siteAuth EARLY
	// so they are available when updateUI or other functions run.
	async function appLogin() {
		siteAuthLog('[Auth.js] appLogin (siteAuth.login) called, preparing for Auth0 redirect.');
		try {
			if (!window.siteAuth.auth0Client) {
				siteAuthError('[Auth.js] appLogin: auth0Client is not initialized! Cannot redirect.');
				return;
			}
			await window.siteAuth.auth0Client.loginWithRedirect({
				authorizationParams: {
					redirect_uri: window.location.origin,
					audience: auth0Audience
				}
			});
			siteAuthLog('[Auth.js] appLogin: loginWithRedirect initiated.');
		} catch (e) {
			siteAuthError('[Auth.js] appLogin: Error during loginWithRedirect', e);
		}
	}
	window.siteAuth.login = appLogin;
	siteAuthLog('login function (appLogin) assigned to window.siteAuth.login');


	const logoutButton = document.getElementById('btn-logout');
	const userInfoP = document.getElementById('user-info');
	siteAuthLog('UI Elements:', { loginButton, logoutButton, userInfoP });

	determineSiteBaseUrl(); // Determine and set siteBaseUrl
	window.siteAuth.siteBaseUrl = siteBaseUrl; // Make it accessible if needed elsewhere

	async function waitForAuth0Sdk() {
		siteAuthLog('waitForAuth0Sdk: Starting to wait for Auth0 SDK (window.auth0)...');
		return new Promise((resolve, reject) => {
			const maxRetries = 70; // Try for 7 seconds (70 * 100ms)
			let retries = 0;
			const intervalId = setInterval(() => {
				const auth0Sdk = window.auth0;
				const createClientFn = auth0Sdk ? auth0Sdk.createAuth0Client : undefined;

				siteAuthLog(`waitForAuth0Sdk: Retry #${retries + 1}. ` +
					`window.auth0 type: ${typeof auth0Sdk}, ` +
					`createAuth0Client type: ${typeof createClientFn}`);

				if (auth0Sdk && typeof auth0Sdk.createAuth0Client === 'function') {
					clearInterval(intervalId);
					siteAuthLog("waitForAuth0Sdk: Auth0 SDK (window.auth0.createAuth0Client) is now available.");
					resolve();
				} else {
					retries++;
					if (retries >= maxRetries) {
						clearInterval(intervalId);
						siteAuthError(`CRITICAL: Auth0 SDK (window.auth0.createAuth0Client) did not become available after ${maxRetries} retries. ` +
							`Last state: window.auth0 type: ${typeof auth0Sdk}, createAuth0Client type: ${typeof createClientFn}`);
						reject(new Error('Auth0 SDK (window.auth0.createAuth0Client) timed out or is not valid.'));
					}
				}
			}, 100);
		});
	}

		async function configureClient() {
			try {
				siteAuthLog('configureClient: Attempting to configure Auth0 client...');
				if (!window.auth0 || typeof window.auth0.createAuth0Client !== 'function') {
					siteAuthError('CRITICAL: window.auth0 or window.auth0.createAuth0Client is not available. Auth0 SDK might not be loaded or initialized correctly.');
					throw new Error('Auth0 SDK (window.auth0.createAuth0Client) is not available or invalid.');
				}
				const clientOptions = {
					domain: auth0Domain,
					clientId: auth0ClientId, // Corrected to camelCase
					authorizationParams: {
						redirect_uri: window.location.origin, // Ensure this matches Auth0 allowed callback URLs
						audience: auth0Audience
					},
				};
				siteAuthLog(`configureClient: About to call createAuth0Client with options:`, JSON.parse(JSON.stringify(clientOptions)));
				window.siteAuth.auth0Client = await window.auth0.createAuth0Client({
					...clientOptions // Spread the defined options
				});
				siteAuthLog('configureClient: Auth0 client configured successfully.', window.siteAuth.auth0Client);
			} catch (err) {
				siteAuthError("Error configuring Auth0 client: ", err);
				if (loginButton) {
					loginButton.disabled = true;
					loginButton.style.display = 'inline';
				}
				if (logoutButton) logoutButton.style.display = 'none';
				if (userInfoP) {
					userInfoP.textContent = "Error: Auth0 not configured. See console.";
					userInfoP.style.display = 'block';
				}
			}
		}

		async function updateUI() {
			siteAuthLog('updateUI: Starting UI update. Current auth0Client:', window.siteAuth.auth0Client);
			if (!window.siteAuth.auth0Client) {
				siteAuthLog('updateUI: Auth0 client not available. Setting UI to logged-out state.');
				if (loginButton) {
					loginButton.style.display = 'inline';
					loginButton.disabled = true; // Ensure it's disabled if not configured
				}
				if (logoutButton) logoutButton.style.display = 'none';
				if (userInfoP) {
					userInfoP.style.display = 'block';
					userInfoP.textContent = "Auth0 client not initialized.";
				}
				window.siteAuth.isAuthenticated = false;
				window.siteAuth.user = null;
				window.siteAuth.accessToken = null;
				return;
			}

			const isAuthenticated = await window.siteAuth.auth0Client.isAuthenticated();
			siteAuthLog('updateUI: isAuthenticated result:', isAuthenticated);
			window.siteAuth.isAuthenticated = isAuthenticated;

			siteAuthLog('updateUI: Setting button visibility based on isAuthenticated:', isAuthenticated);
			
			const currentSiteBaseUrl = window.siteAuth.siteBaseUrl || ''; // Use stored or default to empty
   			const dashboardButton = document.getElementById('btn-dashboard');

			if (loginButton) {
				if (isAuthenticated) {
   					// When authenticated, the main "login" button might be hidden or repurposed.
   					// For clarity, let's assume #btn-login is hidden and #btn-dashboard is shown.
   					loginButton.style.display = 'none'; 
   					if (dashboardButton) dashboardButton.style.display = 'inline';
				} else {
					loginButton.textContent = 'Log In';
					// Do NOT override the onclick here. Rely on the HTML's onclick="siteAuth.login()"
					// which should call the siteAuth.login method responsible for Auth0 redirect.
					// Ensure window.siteAuth.login is correctly defined elsewhere to call 
					// auth0Client.loginWithRedirect().
					// If we need to be absolutely sure the correct handler is attached (e.g., if it could be cleared):
					if (typeof window.siteAuth.login === 'function') {
						loginButton.onclick = window.siteAuth.login;
					} else {
						siteAuthError('updateUI: window.siteAuth.login is not a function! Login button may not work as expected.');
					}
					loginButton.style.display = 'inline';
   					if (dashboardButton) dashboardButton.style.display = 'none';
				}
			}

			if (logoutButton) logoutButton.style.display = isAuthenticated ? 'inline' : 'none';
   			// If loginButton is not found, but dashboardButton is, ensure its visibility is also handled.
   			else if (dashboardButton) dashboardButton.style.display = isAuthenticated ? 'inline' : 'none';

			if (isAuthenticated) {
				siteAuthLog('updateUI: User is authenticated. Fetching user profile...');
				window.siteAuth.user = await window.siteAuth.auth0Client.getUser() || {}; // Ensure user is an object
				siteAuthLog('updateUI: User profile fetched:', window.siteAuth.user);
				if (userInfoP) {
					userInfoP.textContent = `Welcome, ${window.siteAuth.user.name}!`;
					userInfoP.style.display = 'block';
				}
				try {
					siteAuthLog('updateUI: Attempting to get token silently...');
					window.siteAuth.accessToken = await window.siteAuth.auth0Client.getTokenSilently({
						authorizationParams: {
							audience: auth0Audience
						}
					});
					siteAuthLog('updateUI: Token acquired silently:', window.siteAuth.accessToken ? 'Token received' : 'No token');
				} catch (e) {
					siteAuthLog("updateUI: Silent token acquisition failed. Error:", e);
					if (e.error === 'login_required' || e.error === 'consent_required') {
						siteAuthLog("updateUI: Silent token failed due to login/consent required. Trying popup...");
						try {
							window.siteAuth.accessToken = await window.siteAuth.auth0Client.getTokenWithPopup({
								authorizationParams: {
									audience: auth0Audience
								}
							});
							siteAuthLog('updateUI: Token acquired with popup:', window.siteAuth.accessToken ? 'Token received' : 'No token');
						} catch (popupError) {
							siteAuthError("updateUI: Popup token acquisition failed:", popupError);
							window.siteAuth.accessToken = null;
						}
					} else {
						siteAuthLog("updateUI: Silent token acquisition failed for other reasons. No token acquired.");
						window.siteAuth.accessToken = null;
					}
				}
			} else {
				if (userInfoP) {
					userInfoP.textContent = '';
					userInfoP.style.display = 'none';
				}
				window.siteAuth.user = null;
				window.siteAuth.accessToken = null;
			}
			siteAuthLog('updateUI: Finished. siteAuth state:', JSON.parse(JSON.stringify(window.siteAuth))); // stringify to avoid circular refs in console
		}

		// The #btn-login's onclick is now fully managed by updateUI.
		if (loginButton) {
			siteAuthLog('#btn-login found and no inline onclick. Event listener would be attached if uncommented.');
		} else {
			siteAuthLog('#btn-login not found or has inline onclick during initial setup.');
		}

		if (logoutButton) {
			siteAuthLog('Logout button found. Attaching click listener.');
			logoutButton.addEventListener('click', () => {
				siteAuthLog('Logout button clicked.');
				if (!window.siteAuth.auth0Client) {
					siteAuthError("Auth0 client not available for logout.");
					return;
				}
				try {
					siteAuthLog('Attempting logout with returnTo:', window.location.origin);
					window.siteAuth.auth0Client.logout({
						logoutParams: {
							returnTo: window.location.origin,
						},
					});
					siteAuthLog('Logout initiated.');
				} catch (err) {
					siteAuthError("Logout error: ", err);
				}
			});
		}

		async function getApiKey(netlifyFunctionName = 'get-api-key') {
			if (!window.siteAuth.isAuthenticated || !window.siteAuth.accessToken) {
				siteAuthError('getApiKey: User not authenticated or access token not available. Cannot get API key.');
				alert('You must be logged in to get an API key.');
				return null;
			}
			siteAuthLog(`getApiKey: Attempting to fetch API key from /.netlify/functions/${netlifyFunctionName}`);
			try {
				const response = await fetch(`/.netlify/functions/${netlifyFunctionName}`, {
					headers: {
						Authorization: `Bearer ${window.siteAuth.accessToken}`,
					},
				});
				siteAuthLog('getApiKey: Fetch response status:', response.status);
				if (!response.ok) {
					const errorData = await response.json();
					siteAuthError(`getApiKey: Error fetching API key (${response.status}):`, errorData.error || response.statusText, errorData);
					alert(`Error fetching API key: ${errorData.error || response.statusText}`);
					return null;
				}
				const data = await response.json();
				siteAuthLog('getApiKey: Successfully fetched API key data:', data);
				return data.apiKey;
			} catch (error) {
				siteAuthError('getApiKey: Failed to fetch API key due to network or parsing error:', error);
				alert('Failed to fetch API key. See console for details.');
				return null;
			}
		}
		window.siteAuth.getApiKey = getApiKey;
		siteAuthLog('getApiKey function assigned to window.siteAuth.getApiKey');

		async function checkAccess(requiredLevel = null) {
			siteAuthLog(`checkAccess: Called with requiredLevel: ${requiredLevel}`);
			if (!window.siteAuth.auth0Client) {
				siteAuthLog("checkAccess: Auth0 client not initialized. Cannot perform access check. Returning false.");
				return false;
			}

			const isAuthenticated = await window.siteAuth.auth0Client.isAuthenticated();
			siteAuthLog(`checkAccess: isAuthenticated: ${isAuthenticated}`);
			if (!isAuthenticated) {
				if (requiredLevel) {
					siteAuthLog('checkAccess: User not authenticated and requiredLevel set. Redirecting to login.');
					const loginOptions = {
						appState: { targetUrl: window.location.pathname }
						// The SDK should automatically pick up client_id, domain, redirect_uri, audience from its initial config
					};
					siteAuthLog('checkAccess: Calling loginWithRedirect with options:', JSON.parse(JSON.stringify(loginOptions)));
					await window.siteAuth.auth0Client.loginWithRedirect({
					});
					siteAuthLog('checkAccess: User not authenticated and requiredLevel set. Redirecting to login. Returning false.');
					return false;
				}
				siteAuthLog('checkAccess: User not authenticated and no requiredLevel. Returning false.');
				return false;
			}

			// If no specific level is required, being authenticated is enough.
			// This covers your "registered user" case.
			if (!requiredLevel) {
				siteAuthLog('checkAccess: User authenticated and no requiredLevel. Returning true.');
				return true;
			}

			if (requiredLevel === 'subscriber') {
				siteAuthLog('checkAccess: Required level is "subscriber". Fetching user details for role check.');
				// Ensure user object is available
				const user = await window.siteAuth.auth0Client.getUser();
				siteAuthLog('checkAccess: User object for role check:', user);
				// If you've set up roles in Auth0 and added them to the ID token using a Rule,
				// you'll access them via a namespaced claim.
				// Example: user['https://carsonsmeditations.com/roles']
				// This MUST match the claim name set by your Auth0 Action (namespace + 'roles')
				const rolesNamespace = 'https://carsontkempf.github.io/auth/roles'; // Your specified namespace + 'roles'
				siteAuthLog(`checkAccess: Checking for role "subscriber" in namespace "${rolesNamespace}"`);
				const isSubscriber = user && user[rolesNamespace] && user[rolesNamespace].includes('subscriber');
				
				if (!isSubscriber) {
					alert('Access Denied: Subscriber level required.');
					siteAuthLog('checkAccess: Access denied for user. Not a subscriber. User roles:', user ? user[rolesNamespace] : 'N/A', 'Returning false.');
					return false;
				}
				siteAuthLog('checkAccess: User is a subscriber. Returning true.');
				return true; // User is a subscriber
			}

			// You could add other role checks here if needed
			// else if (requiredLevel === 'admin') { ... }

			siteAuthLog(`checkAccess: Unknown requiredLevel: ${requiredLevel}. Denying access. Returning false.`);
			return false; // Default to false if requiredLevel is unknown
		}
		window.siteAuth.checkAccess = checkAccess;
		siteAuthLog('checkAccess function assigned to window.siteAuth.checkAccess');

async function performRedirects() {
    siteAuthLog('performRedirects: Checking authentication status for potential redirects.');
    const isAuthenticated = window.siteAuth.isAuthenticated;
    const currentSiteBaseUrl = window.siteAuth.siteBaseUrl || '';
    
    // Get current path relative to the site's base URL
    let currentPath = window.location.pathname.replace(/\/$/, ""); // Normalize path
    if (currentSiteBaseUrl && currentPath.startsWith(currentSiteBaseUrl)) {
        currentPath = currentPath.substring(currentSiteBaseUrl.length);
    }
    currentPath = currentPath || '/';

    siteAuthLog(`performRedirects: Path is "${currentPath}", Auth status: ${isAuthenticated}`);

    const loginPage = '/login';
    const dashboardPage = '/dashboard';

    if (isAuthenticated) {
        // If a logged-in user is on the login page, send them to the dashboard.
        if (currentPath === loginPage) {
            siteAuthLog(`Redirecting authenticated user from login to dashboard.`);
            window.location.href = `${currentSiteBaseUrl}${dashboardPage}/`;
        }
    } else {
        // If a logged-out user tries to access the dashboard, send them to login.
        if (currentPath === dashboardPage) {
            siteAuthLog(`Redirecting unauthenticated user from dashboard to login.`);
            window.location.href = `${currentSiteBaseUrl}${loginPage}/`;
        }
    }
    // For all other cases, do nothing. This allows anyone to view any other page.
}

		// Initialize and handle redirect
		try {
			siteAuthLog('Main initialization: Starting try block.');
			await waitForAuth0Sdk(); // Wait for the SDK to be ready
			siteAuthLog('Main initialization: waitForAuth0Sdk completed.');
			await configureClient();
			siteAuthLog('Main initialization: configureClient completed.');

			if (window.siteAuth.auth0Client && window.location.search.includes('code=') && window.location.search.includes('state=')) {
				try {
					const currentUrl = window.location.href;
					siteAuthLog(`Main initialization: Found "code" and "state" in URL (${currentUrl}). Attempting handleRedirectCallback().`);
					
					// Log the SDK's configured options right before handleRedirectCallback
					if (window.siteAuth.auth0Client.options) {
						// Be careful with logging the full options object if it contains sensitive defaults or too much data.
						// Let's log key parts.
						const opts = window.siteAuth.auth0Client.options;
						siteAuthLog('Main initialization: Auth0 client options before handleRedirectCallback:', {
							domain: opts.domain,
							client_id: opts.clientId, // Note: SDK stores it as clientId
							redirect_uri: opts.authorizationParams ? opts.authorizationParams.redirect_uri : 'N/A',
							audience: opts.authorizationParams ? opts.authorizationParams.audience : 'N/A'
						});
					} else {
						siteAuthLog('Main initialization: Auth0 client.options is undefined before handleRedirectCallback. This is unexpected.');
					}
					const result = await window.siteAuth.auth0Client.handleRedirectCallback();
					siteAuthLog('Main initialization: handleRedirectCallback() completed successfully. Result:', result);

					if (result && result.appState && result.appState.targetUrl) {
						siteAuthLog(`Main initialization: handleRedirectCallback successful. Redirecting to appState.targetUrl: ${result.appState.targetUrl}`);
						window.history.replaceState({}, document.title, result.appState.targetUrl);
					} else {
						siteAuthLog('Main initialization: handleRedirectCallback successful. Cleaning URL (no specific appState.targetUrl).');
						window.history.replaceState({}, document.title, window.location.pathname);
					}
				} catch (err) {
					// Log the error object itself for more details if it's an Auth0 error object
					if (err.error && err.error_description) { // Auth0 errors often have these properties
						siteAuthError(`Main initialization: Auth0 Error from handleRedirectCallback: ${err.error} - ${err.error_description}. Full error object:`, err);
					} else {
						siteAuthError("Main initialization: Generic error from handleRedirectCallback: ", err);
					}
					window.history.replaceState({}, document.title, window.location.pathname);
				}
			} else if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
				siteAuthLog("Main initialization: Redirect params present, but Auth0 client might not have been ready for immediate handleRedirectCallback. UI update will proceed. Cleaning URL.");
				window.history.replaceState({}, document.title, window.location.pathname);
			} else {
				siteAuthLog('Main initialization: No redirect parameters found in URL (code & state).');
			}
			siteAuthLog('Main initialization: Calling updateUI.');
			await updateUI();
			siteAuthLog('Main initialization: updateUI completed.');
			
			// Dispatch the siteAuthReady event to notify other scripts that auth is initialized
			const authReadyEvent = new CustomEvent('siteAuthReady', {
				detail: window.siteAuth
			});
			document.dispatchEvent(authReadyEvent);
			siteAuthLog('Main initialization: Dispatched siteAuthReady event.');
			
			await performRedirects(); // Call the redirect logic after UI and auth state are known
			siteAuthLog('Main initialization: performRedirects completed.');
		} catch (error) {
			siteAuthError("Main initialization: Error during Auth0 initialization process (outer try/catch):", error);
			if (userInfoP) {
				userInfoP.textContent = "Error initializing authentication. Please refresh. See console for details.";
				userInfoP.style.display = 'block';
				siteAuthLog('Main initialization: Displayed error message in userInfoP.');
				if (loginButton) loginButton.style.display = 'inline';
				if (logoutButton) logoutButton.style.display = 'none';
			}
		}
		siteAuthLog('Auth0 initialization script finished.');
	});
