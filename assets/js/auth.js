// Auth0 client-side integration
window.siteAuth = {
	isAuthenticated: false,
	user: null,
	accessToken: null,
	auth0Client: null,
	getApiKey: null,
	checkAccess: null
};

	document.addEventListener('DOMContentLoaded', async () => {
		// let auth0Client = null; // Now using window.siteAuth.auth0Client
		const auth0Domain = 'dev-l57dcpkhob0u7ykb.us.auth0.com';
		const auth0ClientId = 'moH0QbZSCdnwIryD7FoElVSs3kEvUHbH';
		const auth0Audience = 'https://carsontkempf.github.io/account/'; // FIXME: Replace with the Identifier of your API in Auth0

		const loginButton = document.getElementById('btn-login');
		const logoutButton = document.getElementById('btn-logout');
		const userInfoP = document.getElementById('user-info');

		async function waitForAuth0Spa() {
			return new Promise((resolve, reject) => {
				const maxRetries = 60; // Try for 6 seconds (60 * 100ms)
				let retries = 0;
				const intervalId = setInterval(() => {
					if (typeof window.auth0spa !== 'undefined' && typeof window.auth0spa.createAuth0Client === 'function') { // More robust check
						clearInterval(intervalId);
						console.log("Auth0 SPA SDK (auth0spa) is now available.");
						resolve();
					} else {
						retries++;
						if (retries >= maxRetries) {
							clearInterval(intervalId);
							console.error("CRITICAL: Auth0 SPA SDK (auth0spa) did not become available after waiting.");
							reject(new Error('Auth0 SDK (auth0spa) timed out or is not valid.'));
						}
					}
				}, 100);
			});
		}

		async function configureClient() {
			try {
				console.log('Attempting to configure Auth0 client...'); // DEBUG
				if (typeof window.auth0spa === 'undefined' || typeof window.auth0spa.createAuth0Client !== 'function') {
					console.error('CRITICAL: auth0spa is undefined at the time of calling createAuth0Client. Auth0 SDK might not be loaded or initialized correctly.');
					throw new Error('Auth0 SDK (auth0spa) is not available.');
				}
				window.siteAuth.auth0Client = await window.auth0spa.createAuth0Client({ // Use window.auth0spa
					domain: auth0Domain,
					client_id: auth0ClientId,
					authorizationParams: {
						redirect_uri: window.location.origin,
						audience: auth0Audience // <<< ADDED
					},
				});
				// auth0Client = window.siteAuth.auth0Client; // Keep local reference if preferred, or use window.siteAuth.auth0Client directly
			} catch (err) {
				// Error is already logged by the previous console.error or the one in the if block above
				console.error("Error configuring Auth0 client: ", err);
				if (loginButton) loginButton.disabled = true; // Disable login if config fails
				if (userInfoP) userInfoP.textContent = "Error: Auth0 not configured. See console.";
				if (userInfoP) userInfoP.style.display = 'block';
				if (loginButton) loginButton.style.display = 'inline';
				if (logoutButton) logoutButton.style.display = 'none';
			}
		}

		async function updateUI() {
			if (!window.siteAuth.auth0Client) {
				// If auth0Client is not initialized (e.g., due to config error), ensure UI reflects this.
				if (loginButton) loginButton.style.display = 'inline';
				if (loginButton) loginButton.disabled = true; // Ensure it's disabled if not configured
				if (logoutButton) logoutButton.style.display = 'none';
				if (userInfoP) userInfoP.style.display = 'block';
				if (userInfoP) userInfoP.textContent = "Auth0 client not initialized.";
				window.siteAuth.isAuthenticated = false;
				window.siteAuth.user = null;
				window.siteAuth.accessToken = null;
				return;
			}

			const isAuthenticated = await window.siteAuth.auth0Client.isAuthenticated();
			window.siteAuth.isAuthenticated = isAuthenticated;

			if (loginButton) loginButton.style.display = isAuthenticated ? 'none' : 'inline';
			if (logoutButton) logoutButton.style.display = isAuthenticated ? 'inline' : 'none';

			if (isAuthenticated) {
				window.siteAuth.user = await window.siteAuth.auth0Client.getUser();
				if (userInfoP) {
					userInfoP.textContent = `Welcome, ${window.siteAuth.user.name}!`;
					userInfoP.style.display = 'block';
				}
				try {
					window.siteAuth.accessToken = await window.siteAuth.auth0Client.getTokenSilently({
						authorizationParams: {
							audience: auth0Audience // <<< ADDED/ENSURED
						}
					});
				} catch (e) {
					console.warn("Silent token acquisition failed, trying popup:", e);
					if (e.error === 'login_required' || e.error === 'consent_required') {
						try {
							window.siteAuth.accessToken = await window.siteAuth.auth0Client.getTokenWithPopup({
								authorizationParams: {
									audience: auth0Audience // <<< ADDED/ENSURED
								}
							});
						} catch (popupError) {
							console.error("Popup token acquisition failed:", popupError);
							window.siteAuth.accessToken = null;
						}
					} else {
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
		}

		if (loginButton) {
			loginButton.addEventListener('click', async () => {
				console.log('Login button clicked. siteAuth.auth0Client:', window.siteAuth.auth0Client); // DEBUG
				if (!window.siteAuth.auth0Client) {
					console.error('Auth0 client (window.siteAuth.auth0Client) is not available when login button clicked.'); // DEBUG
					alert('Authentication system not ready. Please try again in a moment or refresh the page.');
					return;
				}
				try {
					console.log('Attempting loginWithRedirect. Configured audience for redirect:', auth0Audience); // DEBUG
					await window.siteAuth.auth0Client.loginWithRedirect({
						authorizationParams: {
							redirect_uri: window.location.origin, // Explicitly set for clarity, though often default
							audience: auth0Audience
						}
					});
					// If successful, the browser will redirect, so this log might not be seen.
				} catch (err) {
					console.error('Error during loginWithRedirect:', err); // DEBUG
					alert('Error during login attempt. Check console.');
				}
			});
		} else {
			console.warn('#btn-login not found during initial setup.'); // DEBUG
		}

		if (logoutButton) {
			logoutButton.addEventListener('click', () => {
				if (!window.siteAuth.auth0Client) {
					console.error("Auth0 client not available for logout.");
					return;
				}
				try {
					window.siteAuth.auth0Client.logout({
						logoutParams: {
							returnTo: window.location.origin,
						},
					});
				} catch (err) {
					console.error("Logout error: ", err);
				}
			});
		}

		async function getApiKey(netlifyFunctionName = 'get-api-key') {
			if (!window.siteAuth.isAuthenticated || !window.siteAuth.accessToken) {
				console.error('User not authenticated or access token not available. Cannot get API key.');
				alert('You must be logged in to get an API key.');
				return null;
			}
			try {
				const response = await fetch(`/.netlify/functions/${netlifyFunctionName}`, {
					headers: {
						Authorization: `Bearer ${window.siteAuth.accessToken}`,
					},
				});
				if (!response.ok) {
					const errorData = await response.json();
					console.error(`Error fetching API key (${response.status}):`, errorData.error || response.statusText);
					alert(`Error fetching API key: ${errorData.error || response.statusText}`);
					return null;
				}
				const data = await response.json();
				return data.apiKey;
			} catch (error) {
				console.error('Failed to fetch API key:', error);
				alert('Failed to fetch API key. See console for details.');
				return null;
			}
		}
		window.siteAuth.getApiKey = getApiKey;

		async function checkAccess(requiredLevel = null) {
			if (!window.siteAuth.auth0Client) { // Ensure client is initialized before checking access
					console.warn("Auth0 client not initialized. Cannot perform access check.");
					// Optionally try to reconfigure or prompt user
					return false; // Cannot determine access without client
			}

			const isAuthenticated = await window.siteAuth.auth0Client.isAuthenticated(); // Re-check current status

			if (!isAuthenticated) {
				if (requiredLevel) {
					console.log('User not authenticated. Redirecting to login for access check.');
					await window.siteAuth.auth0Client.loginWithRedirect({
						appState: { targetUrl: window.location.pathname }
					});
					return false; // loginWithRedirect will navigate away
				}
				return false; // Not authenticated, and no required level specified (or handled by login redirect)
			}

			// If authenticated and no specific level is required, access is granted.
			if (!requiredLevel) {
					return true;
			}

			if (requiredLevel === 'subscriber') {
				// TODO: Implement actual role check from Auth0 user profile/token (e.g., using custom claims)
				const user = await window.siteAuth.auth0Client.getUser(); // Ensure user object is fresh
				const isSubscriber = user && user['https://your-placeholder-namespace.com/roles'] && user['https://your-placeholder-namespace.com/roles'].includes('subscriber');
				if (!isSubscriber) {
					alert('Access Denied: Subscriber level required.');
					console.warn('Access denied for user:', user, 'Required role: subscriber');
					return false;
				}
			}
			// Add other role checks here if needed: else if (requiredLevel === 'admin') { ... }
			return true;
		}
		window.siteAuth.checkAccess = checkAccess;

		// Initialize and handle redirect
		try {
			await waitForAuth0Spa(); // Wait for the SDK to be ready
			await configureClient(); // Then configure your client

			if (window.siteAuth.auth0Client && window.location.search.includes('code=') && window.location.search.includes('state=')) {
				// Ensure client is configured before handling redirect
				try {
					const result = await window.siteAuth.auth0Client.handleRedirectCallback();
					if (result && result.appState && result.appState.targetUrl) {
						window.history.replaceState({}, document.title, result.appState.targetUrl);
					} else {
						window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
					}
				} catch (err) {
					console.error("Error handling redirect callback: ", err);
					window.history.replaceState({}, document.title, window.location.pathname); // Still clean URL
				}
			} else if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
				// This case handles if auth0Client wasn't ready immediately but redirect params are present
				console.warn("Redirect params present, but Auth0 client might not have been ready for immediate handleRedirectCallback. UI update will proceed.");
				window.history.replaceState({}, document.title, window.location.pathname); // Clean URL to prevent loop if updateUI re-triggers
			}
			await updateUI();
		} catch (error) {
			console.error("Error during Auth0 initialization process:", error);
			if (userInfoP) {
				userInfoP.textContent = "Error initializing authentication. Please refresh. See console for details.";
				userInfoP.style.display = 'block';
				if (loginButton) loginButton.style.display = 'inline'; // Show login button if init fails
				if (logoutButton) logoutButton.style.display = 'none';
			}
		}
	});
