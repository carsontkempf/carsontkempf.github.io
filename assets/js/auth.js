// Auth0 client-side integration
window.siteAuth = {
	isAuthenticated: false,
	user: null,
	accessToken: null,
	auth0Client: null,
	getApiKey: null,
	checkAccess: null
};

// These constants will be used by functions within onAuth0SdkReady
const auth0Domain = 'dev-l57dcpkhob0u7ykb.us.auth0.com';
const auth0ClientId = 'moH0QbZSCdnwIryD7FoElVSs3kEvUHbH';
const auth0Audience = 'https://carsontkempf.github.io/account/'; // this is correct

function onAuth0SdkReady() {
	console.log('Auth0 SDK onload event fired. Initializing Auth0 logic.');
	// The DOMContentLoaded listener ensures that DOM elements are available.
	document.addEventListener('DOMContentLoaded', async () => {
		const loginButton = document.getElementById('btn-login');
		const logoutButton = document.getElementById('btn-logout');
		const userInfoP = document.getElementById('user-info');

		async function configureClient() {
			try {
				console.log('Attempting to configure Auth0 client...');
				if (typeof window.auth0spa === 'undefined' || typeof window.auth0spa.createAuth0Client !== 'function') {
					console.error('CRITICAL: auth0spa is undefined or not a function when calling createAuth0Client. Auth0 SDK might not be loaded or initialized correctly.');
					throw new Error('Auth0 SDK (auth0spa) is not available or invalid.');
				}
				window.siteAuth.auth0Client = await window.auth0spa.createAuth0Client({
					domain: auth0Domain,
					client_id: auth0ClientId,
					authorizationParams: {
						redirect_uri: window.location.origin,
						audience: auth0Audience
					},
				});
			} catch (err) {
				console.error("Error configuring Auth0 client: ", err);
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
			if (!window.siteAuth.auth0Client) {
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
							audience: auth0Audience
						}
					});
				} catch (e) {
					console.warn("Silent token acquisition failed, trying popup:", e);
					if (e.error === 'login_required' || e.error === 'consent_required') {
						try {
							window.siteAuth.accessToken = await window.siteAuth.auth0Client.getTokenWithPopup({
								authorizationParams: {
									audience: auth0Audience
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
				console.log('Login button clicked. siteAuth.auth0Client:', window.siteAuth.auth0Client);
				if (!window.siteAuth.auth0Client) {
					console.error('Auth0 client (window.siteAuth.auth0Client) is not available when login button clicked.');
					alert('Authentication system not ready. Please try again in a moment or refresh the page.');
					return;
				}
				try {
					console.log('Attempting loginWithRedirect. Configured audience for redirect:', auth0Audience);
					await window.siteAuth.auth0Client.loginWithRedirect({
						authorizationParams: {
							redirect_uri: window.location.origin,
							audience: auth0Audience
						}
					});
				} catch (err) {
					console.error('Error during loginWithRedirect:', err);
					alert('Error during login attempt. Check console.');
				}
			});
		} else {
			console.warn('#btn-login not found during initial setup.');
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
			if (!window.siteAuth.auth0Client) {
				console.warn("Auth0 client not initialized. Cannot perform access check.");
				return false;
			}

			const isAuthenticated = await window.siteAuth.auth0Client.isAuthenticated();

			if (!isAuthenticated) {
				if (requiredLevel) {
					console.log('User not authenticated. Redirecting to login for access check.');
					await window.siteAuth.auth0Client.loginWithRedirect({
						appState: { targetUrl: window.location.pathname }
					});
					return false;
				}
				return false;
			}

			if (!requiredLevel) {
				return true;
			}

			if (requiredLevel === 'subscriber') {
				const user = await window.siteAuth.auth0Client.getUser();
				const isSubscriber = user && user['https://your-placeholder-namespace.com/roles'] && user['https://your-placeholder-namespace.com/roles'].includes('subscriber');
				if (!isSubscriber) {
					alert('Access Denied: Subscriber level required.');
					console.warn('Access denied for user:', user, 'Required role: subscriber');
					return false;
				}
			}
			return true;
		}
		window.siteAuth.checkAccess = checkAccess;

		// Initialize and handle redirect
		try {
			await configureClient();

			if (window.siteAuth.auth0Client && window.location.search.includes('code=') && window.location.search.includes('state=')) {
				try {
					const result = await window.siteAuth.auth0Client.handleRedirectCallback();
					if (result && result.appState && result.appState.targetUrl) {
						window.history.replaceState({}, document.title, result.appState.targetUrl);
					} else {
						window.history.replaceState({}, document.title, window.location.pathname);
					}
				} catch (err) {
					console.error("Error handling redirect callback: ", err);
					window.history.replaceState({}, document.title, window.location.pathname);
				}
			} else if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
				console.warn("Redirect params present, but Auth0 client might not have been ready for immediate handleRedirectCallback. UI update will proceed.");
				window.history.replaceState({}, document.title, window.location.pathname);
			}
			await updateUI();
		} catch (error) {
			console.error("Error during Auth0 initialization process:", error);
			if (userInfoP) {
				userInfoP.textContent = "Error initializing authentication. Please refresh. See console for details.";
				userInfoP.style.display = 'block';
				if (loginButton) loginButton.style.display = 'inline';
				if (logoutButton) logoutButton.style.display = 'none';
			}
		}
	});
}
