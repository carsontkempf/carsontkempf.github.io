// Auth0 client-side integration
window.siteAuth	= {
    isAuthenticated: false,
    user:	null,
    accessToken: null,
    auth0Client: null,
    getApiKey: null,
    checkAccess: null
};

function initializeAuth() {
    document.addEventListener('DOMContentLoaded', async () => {
        // let auth0Client = null; // Now	using window.siteAuth.auth0Client
        const auth0Domain = 'dev-l57dcpkhob0u7ykb.us.auth0.com'; // Replace with your	Auth0 domain
        const auth0ClientId = 'moH0QbZSCdnwIryD7FoElVSs3kEvUHbH'; // Replace with	your Auth0 client ID
        const auth0Audience = 'https://dev-l57dcpkhob0u7ykb.us.auth0.com/api/v2/'; // TODO: Replace with your	Auth0 API Identifier/Audience

        const loginButton = document.getElementById('btn-login');
        const logoutButton = document.getElementById('btn-logout');
        const userInfoP = document.getElementById('user-info');

        async function configureClient() {
            try {
                if (typeof auth0spa === 'undefined') {
                    console.error("auth0spa is not defined at the time of calling createAuth0Client. SDK might not be loaded or initialized correctly.");
                    throw new Error("Auth0 SDK (auth0spa) is not available.");
                }
                window.siteAuth.auth0Client = await auth0spa.createAuth0Client({
                    domain: auth0Domain,
                    client_id: auth0ClientId,
                    authorizationParams: {
			redirect_uri:	window.location.origin,
		    audience:	auth0Audience // <<< ADDED
		},
		});
                // auth0Client = window.siteAuth.auth0Client;	// Keep	local reference	if preferred, or use window.siteAuth.auth0Client directly
            } catch (err) {
                console.error("Error configuring Auth0 client: ", err);
		if (loginButton) loginButton.style.display = 'inline';
	    if (loginButton) loginButton.disabled	= true;	// Ensure it's disabled	if not configured
		if (logoutButton)	logoutButton.style.display = 'none';
		if (userInfoP) userInfoP.style.display = 'block';
		if (userInfoP) userInfoP.textContent = "Auth0	client not initialized.";
		window.siteAuth.isAuthenticated =	false;
		window.siteAuth.user = null;
                window.siteAuth.accessToken = null; // Ensure it's null if config fails
            }
        }

        async function updateUI() {
            if (!window.siteAuth.auth0Client) {
                // If auth0Client	is not initialized (e.g., due to config	error),	ensure UI reflects this.
                if (loginButton) loginButton.style.display = 'inline';
                if (loginButton) loginButton.disabled = true; // Ensure it's disabled	if not configured
                if (logoutButton) logoutButton.style.display = 'none';
                if (userInfoP) userInfoP.style.display = 'block';
                if (userInfoP) userInfoP.textContent = "Auth0	client not initialized.";
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
                if (!window.siteAuth.auth0Client) {
                    console.error("Auth0 client	not	available for login.");
                    return;
                }
                try {
                    await window.siteAuth.auth0Client.loginWithRedirect({
                        authorizationParams: {
                            redirect_uri: window.location.origin,
                            audience: auth0Audience // <<< ADDED/ENSURED
                        },
                    });
                } catch (err) {
                    console.error("Login error:	", err);
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                if (!window.siteAuth.auth0Client) {
                    console.error("Auth0 client	not	available for logout.");
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
                console.error('User not authenticated	or access token	not	available. Cannot get API key.');
                alert('You must be logged	in to get an API key.');
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
                console.error('Failed	to fetch API key:', error);
                alert('Failed	to fetch API key. See console for details.');
                return null;
            }
        }
        window.siteAuth.getApiKey = getApiKey;

        async function checkAccess(requiredLevel = null) {
            if (!window.siteAuth.auth0Client) { // Ensure client is initialized	before checking	access
                console.warn("Auth0	client not initialized.	Cannot perform access check.");
                // Optionally try to reconfigure or prompt user
                return false; // Cannot	determine access without client
            }

            const isAuthenticated = await window.siteAuth.auth0Client.isAuthenticated(); // Re-check current status

            if (!isAuthenticated) {
                if (requiredLevel) {
                    console.log('User not authenticated. Redirecting to login for access check.');
                    await window.siteAuth.auth0Client.loginWithRedirect({
                        appState: { targetUrl: window.location.pathname }
                    });
                    return false; // loginWithRedirect will	navigate away
                }
                return false; // Not authenticated, and no required level	specified (or handled by login redirect)
            }

            // If authenticated	and	no specific	level is required, access is granted.
            if (!requiredLevel) {
                return true;
            }

            if (requiredLevel === 'subscriber') {
                // TODO: Implement actual	role check from	Auth0 user profile/token (e.g.,	using custom claims)
                const user = await window.siteAuth.auth0Client.getUser(); // Ensure user object is fresh
                const isSubscriber = user && user['https://your-placeholder-namespace.com/roles'] && user['https://your-placeholder-namespace.com/roles'].includes('subscriber');
                if (!isSubscriber) {
                    alert('Access Denied: Subscriber level required.');
                    console.warn('Access denied	for	user:', user, 'Required	role: subscriber');
                    return false;
                }
            }
            // Add other role checks here if needed: else if (requiredLevel	===	'admin') { ... }
            return true;
        }
        window.siteAuth.checkAccess = checkAccess;

        // Initialize	and	handle redirect
        await configureClient();

        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            if (window.siteAuth.auth0Client) { // Ensure client	is configured before handling redirect
                try {
                    const result = await window.siteAuth.auth0Client.handleRedirectCallback();
                    if (result && result.appState && result.appState.targetUrl) {
                        window.history.replaceState({}, document.title, result.appState.targetUrl);
                    } else {
                        window.history.replaceState({}, document.title, window.location.pathname); // Clean	URL
                    }
                } catch (err) {
                    console.error("Error handling redirect callback: ", err);
                    window.history.replaceState({}, document.title, window.location.pathname); // Still	clean URL
                }
            } else {
                console.error("Auth0 client	not	configured,	cannot handle redirect callback.");
                window.history.replaceState({}, document.title, window.location.pathname); // Still	clean URL
            }
        }
        await updateUI();
    });
}

// Poll for auth0spa to be available before setting up the DOMContentLoaded listener
const checkAuth0SpaReadyInterval = setInterval(() => {
    if (typeof auth0spa !== 'undefined') {
        clearInterval(checkAuth0SpaReadyInterval);
        console.log("Auth0 SPA SDK (auth0spa) is ready.");
        initializeAuth(); // Proceed with Auth0 initialization
    } else {
        console.log("Waiting for Auth0 SPA SDK (auth0spa) to be ready...");
    }
}, 100); // Check every 100ms
