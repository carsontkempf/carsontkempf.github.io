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
    const errorDetails = serializeErrorForReporting(errorToReport);
    try {
        await fetch('http://localhost:3001/log-client-error', { // Dedicated error logging server
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ timestamp: new Date().toISOString(), url: window.location.href, error: errorDetails, userAgent: navigator.userAgent }),
        });
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

// These constants will be used by functions within onAuth0SdkReady
const auth0Domain = 'dev-l57dcpkhob0u7ykb.us.auth0.com';
const auth0ClientId = 'Dq4tBsHjgcIGbXkVU8PPvjAq3WYmnSBC'; // Ensure this is the Client ID for your "Carson's Meditations" APPLICATION
const auth0Audience = 'https://carsontkempf.github.io/api/carsons-meditations'; // <-- UPDATE THIS to your new API Identifier

document.addEventListener('DOMContentLoaded', async () => {
	siteAuthLog('DOMContentLoaded event fired. Starting Auth0 initialization process.');
	siteAuthLog('Auth0 Config:', { auth0Domain, auth0ClientId, auth0Audience });

	const loginButton = document.getElementById('btn-login');
	const logoutButton = document.getElementById('btn-logout');
	const userInfoP = document.getElementById('user-info');
	siteAuthLog('UI Elements:', { loginButton, logoutButton, userInfoP });

	async function waitForAuth0Spa() {
		siteAuthLog('waitForAuth0Spa: Starting to wait for Auth0 SPA SDK (window.auth0spa)...');
		return new Promise((resolve, reject) => {
			const maxRetries = 70; // Try for 7 seconds (70 * 100ms)
			let retries = 0;
			const intervalId = setInterval(() => {
				siteAuthLog(`waitForAuth0Spa: Retry #${retries + 1}. Checking for window.auth0spa...`);
				if (typeof window.auth0spa !== 'undefined' && typeof window.auth0spa.createAuth0Client === 'function') {
					clearInterval(intervalId);
					siteAuthLog("Auth0 SPA SDK (window.auth0spa) is now available.");
					resolve();
				} else {
					retries++;
					if (retries >= maxRetries) {
						clearInterval(intervalId);
						siteAuthError("CRITICAL: Auth0 SPA SDK (window.auth0spa) did not become available after waiting.");
						reject(new Error('Auth0 SDK (window.auth0spa) timed out or is not valid.'));
					}
				}
			}, 100);
		});
	}

		async function configureClient() {
			try {
				siteAuthLog('configureClient: Attempting to configure Auth0 client...');
				if (typeof window.auth0spa === 'undefined' || typeof window.auth0spa.createAuth0Client !== 'function') {
					siteAuthError('CRITICAL: window.auth0spa is undefined or not a function when calling createAuth0Client. Auth0 SDK might not be loaded or initialized correctly.');
					throw new Error('Auth0 SDK (window.auth0spa) is not available or invalid.');
				}
				window.siteAuth.auth0Client = await window.auth0spa.createAuth0Client({
					domain: auth0Domain,
					client_id: auth0ClientId,
					authorizationParams: {
						redirect_uri: window.location.origin,
						audience: auth0Audience
					},
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
			if (loginButton) loginButton.style.display = isAuthenticated ? 'none' : 'inline';
			if (logoutButton) logoutButton.style.display = isAuthenticated ? 'inline' : 'none';

			if (isAuthenticated) {
				siteAuthLog('updateUI: User is authenticated. Fetching user profile...');
				window.siteAuth.user = await window.siteAuth.auth0Client.getUser();
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

		// The main login button in default.html now redirects to /login/
		// This event listener in auth.js is less critical for that button,
		// but we'll keep it in case a #btn-login is used elsewhere that expects this behavior.
		if (loginButton && loginButton.getAttribute('onclick') === null) { // Only add if no inline onclick exists
			// loginButton.addEventListener('click', async () => {
			// 	siteAuthLog('Login button clicked (from auth.js). siteAuth.auth0Client:', window.siteAuth.auth0Client);
			// 	if (!window.siteAuth.auth0Client) {
			// 		siteAuthError('Auth0 client (window.siteAuth.auth0Client) is not available when login button clicked.');
			// 		alert('Authentication system not ready. Please try again in a moment or refresh the page.');
			// 		return;
			// 	}
			// 	try {
			// 		siteAuthLog('Attempting loginWithRedirect. Configured audience for redirect:', auth0Audience);
			// 		await window.siteAuth.auth0Client.loginWithRedirect({
			// 			authorizationParams: {
			// 				redirect_uri: window.location.origin,
			// 				audience: auth0Audience
			// 			}
			// 		});
			//      siteAuthLog('loginWithRedirect initiated.');
			// 	} catch (err) {
			// 		siteAuthError('Error during loginWithRedirect:', err);
			// 		alert('Error during login attempt. Check console.');
			// 	}
			// });
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
					console.log('User not authenticated. Redirecting to login for access check.');
					await window.siteAuth.auth0Client.loginWithRedirect({
						appState: { targetUrl: window.location.pathname }
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

		// Initialize and handle redirect
		try {
			siteAuthLog('Main initialization: Starting try block.');
			await waitForAuth0Spa(); // Wait for the SDK to be ready
			siteAuthLog('Main initialization: waitForAuth0Spa completed.');
			await configureClient();
			siteAuthLog('Main initialization: configureClient completed.');

			if (window.siteAuth.auth0Client && window.location.search.includes('code=') && window.location.search.includes('state=')) {
				try {
					const result = await window.siteAuth.auth0Client.handleRedirectCallback();
					if (result && result.appState && result.appState.targetUrl) {
						window.history.replaceState({}, document.title, result.appState.targetUrl);
					} else {
						siteAuthLog('Main initialization: handleRedirectCallback successful. Cleaning URL.');
						window.history.replaceState({}, document.title, window.location.pathname);
					}
				} catch (err) {
					siteAuthError("Main initialization: Error handling redirect callback: ", err);
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
