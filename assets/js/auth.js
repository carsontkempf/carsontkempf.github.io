// Create the global service object
window.authService = {
    isAuthenticated: false,
    user: null,
    client: null,
    login: () => console.error("Login service not ready."),
    logout: () => console.error("Login service not ready.")
};

// This is the main function that runs when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const config = {
        domain: 'dev-l57dcpkhob0u7ykb.us.auth0.com',
        clientId: 'Dq4tBsHjgcIGbXkVU8PPvjAq3WYmnSBC'
    };

    try {
        // 1. Create the Auth0 client with REFRESH TOKEN support
        const auth0Client = await window.auth0.createAuth0Client({
            domain: config.domain,
            clientId: config.clientId,
            authorizationParams: {
                redirect_uri: window.location.origin
            },
            // These two lines enable the robust login flow
            useRefreshTokens: true,
            cacheLocation: 'localstorage'
        });
        window.authService.client = auth0Client;

        // 2. Handle the user returning from Auth0
        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, '/dashboard/');
            window.location.href = '/dashboard/';
            return;
        }

        // 3. Check the session and update the state
        const isAuthenticated = await auth0Client.isAuthenticated();
        window.authService.isAuthenticated = isAuthenticated;
        if (isAuthenticated) {
            window.authService.user = await auth0Client.getUser();
        }

        // 4. Define the global login/logout methods
        window.authService.login = () => auth0Client.loginWithRedirect();
        window.authService.logout = () => auth0Client.logout({
            logoutParams: { returnTo: window.location.origin }
        });

        // 5. Update the site-wide UI (the header buttons)
        const loginBtn = document.getElementById('btn-login');
        const dashboardBtn = document.getElementById('btn-dashboard');
        const logoutBtn = document.getElementById('btn-logout');

        if (isAuthenticated) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }

        // 6. Fire the "ready" event for page-specific scripts
        document.dispatchEvent(new CustomEvent('authReady'));

    } catch (error) {
        console.error("Fatal Error during Auth0 Initialization:", error);
    }
});