---
layout: page 
title: Dashboard
permalink: /dashboard/
---

<h2>Welcome to Your Dashboard!</h2>

<div id="dashboard-content">
  <p>You have successfully logged in.</p>

  <p>From here, you can typically:</p>
  <ul>
    <li><a href="{{ '/account/' | relative_url }}">View Your Account Details</a></li>
    <!-- Add more links relevant to authenticated users -->
    <!-- Example: <li><a href="/settings/">Manage Your Settings</a></li> -->
    <!-- Example: <li><a href="/exclusive-content/">Access Exclusive Content</a></li> -->
  </ul>

  <p>If you need to log out, you can usually find the logout button in the site's header or navigation area.</p>
</div>

<script>
document.addEventListener('DOMContentLoaded', async () => {
  const dashboardContentEl = document.getElementById('dashboard-content');

  // This is a basic check. Your main auth.js should handle the heavy lifting
  // of ensuring authentication state is up-to-date.
  // This script could be enhanced to fetch dashboard-specific data.

  const checkAuthInterval = setInterval(() => {
    if (window.siteAuth && typeof window.siteAuth.isAuthenticated !== 'undefined') {
      clearInterval(checkAuthInterval); // Stop polling once siteAuth is available

      if (!window.siteAuth.isAuthenticated) {
        // If, for some reason, the user lands here without being authenticated,
        // provide a way to log in or redirect.
        // Your main auth.js and page-specific scripts like my-account.md
        // should ideally prevent unauthenticated access to protected routes.
        if (dashboardContentEl) {
          dashboardContentEl.innerHTML = '<p>Please <a href="#" onclick="window.siteAuth.auth0Client.loginWithRedirect({ appState: { targetUrl: \'/dashboard/\' } }); return false;">log in</a> to view your dashboard.</p>';
        }
      } else {
        // User is authenticated, dashboard can load normally or fetch additional data.
        console.log('User authenticated, welcome to the dashboard!', window.siteAuth.user);
      }
    }
  }, 200); // Poll for siteAuth
});
</script>