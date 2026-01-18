---
layout: dashboard
title: Dashboard
permalink: /dashboard/
---

<script src="/assets/js/role-protection.js"></script>

<div id="auth-message"></div>

<script>
document.addEventListener('authReady', async () => {
  if (!window.authService.isAuthenticated) {
    document.querySelector('.site-content').style.display = 'none';
    const messageEl = document.getElementById('auth-message') || document.querySelector('.site-content');
    messageEl.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2>Authentication Required</h2>
        <p>Please log in to access your dashboard.</p>
        <button onclick="window.authService.login()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
          Log In
        </button>
      </div>
    `;
    messageEl.style.display = 'block';
  }
});
</script>