window.siteAuth = {}; // Create the global object

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Auth.js] Initializing simple Auth0 client...');

    const auth0Domain = 'dev-l57dcpkhob0u7ykb.us.auth0.com';
    const auth0ClientId = 'Dq4tBsHjgcIGbXkVU8PPvjAq3WYmnSBC';
    let auth0Client = null;

    try {
        // 1. Wait for the Auth0 SDK script to load
        await new Promise((resolve, reject) => {
            let retries = 0;
            const interval = setInterval(() => {
                if (window.auth0) { clearInterval(interval); resolve(); }
                else if (retries++ > 50) { clearInterval(interval); reject(new Error('Auth0 SDK did not load.')); }
            }, 100);
        });

        // 2. Configure the client WITHOUT the audience
        auth0Client = await window.auth0.createAuth0Client({
            domain: auth0Domain,
            clientId: auth0ClientId,
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });
        window.siteAuth.auth0Client = auth0Client;

        // 3. Define the global login function
        window.siteAuth.login = () => {
            auth0Client.loginWithRedirect();
        };

        // 4. Handle the user returning from Auth0
        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            await auth0Client.handleRedirectCallback();
            const targetUrl = '/dashboard/';
            window.history.replaceState({}, document.title, targetUrl);
            window.location.href = targetUrl;
            return; 
        }

        // 5. Update UI
        const isAuthenticated = await auth0Client.isAuthenticated();
        const loginButton = document.getElementById('btn-login');
        const dashboardButton = document.getElementById('btn-dashboard');

        if (isAuthenticated) {
            if (loginButton) loginButton.style.display = 'none';
            if (dashboardButton) dashboardButton.style.display = 'inline-block';
        } else {
            if (loginButton) loginButton.style.display = 'inline-block';
            if (dashboardButton) dashboardButton.style.display = 'none';
        }

    } catch (error) {
        console.error("Fatal Error during Auth0 Initialization:", error);
    }
});