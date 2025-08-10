---
---
// Create the global service object
window.authService = {
    isAuthenticated: false,
    user: null,
    client: null,
    login: () => console.error("Login service not ready."),
    logout: () => console.error("Login service not ready.")
};

/* ADD */
document.addEventListener('DOMContentLoaded', async () => {
    const config = {
        domain: '{{ site.auth0.domain }}',
        clientId: '{{ site.auth0.client_id }}',
        audience: '{{ site.auth0.audience }}'
    };

    try {
        // 1. Create the Auth0 client with REFRESH TOKEN support
        const auth0Client = await window.auth0.createAuth0Client({
            domain: config.domain,
            clientId: config.clientId,
            authorizationParams: {
                redirect_uri: window.location.origin,
                audience: config.audience
            },
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

        // 5. Get references to the UI buttons
        const loginBtn = document.getElementById('btn-login');
        const dashboardBtn = document.getElementById('btn-dashboard');
        const logoutBtn = document.getElementById('btn-logout');

        // 6. Update button visibility based on auth state and page location
        if (isAuthenticated) {
            if (loginBtn) loginBtn.style.display = 'none';
            
            const isOnDashboard = window.location.pathname.startsWith('/dashboard');
            const isOnProtectedPage = window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/spotify-apple');

            if (isOnProtectedPage) {
                if (dashboardBtn) dashboardBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline-block';
            } else {
                if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
                if (logoutBtn) logoutBtn.style.display = 'none';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }

        // 7. Wire up the buttons to the auth service methods
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.authService.login();
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.authService.logout();
            });
        }

        // 8. Fire the "ready" event for page-specific scripts
        document.dispatchEvent(new CustomEvent('authReady'));

    } catch (error) {
        console.error("Fatal Error during Auth0 Initialization:", error);
    }
});