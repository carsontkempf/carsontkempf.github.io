(function () {
  'use strict';

  var TOKEN_KEY = 'learn_auth_token';
  var USER_KEY = 'learn_auth_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function setLoggedIn() {
    var btnLogin = document.getElementById('btn-login');
    var btnDashboard = document.getElementById('btn-dashboard');
    var btnLogout = document.getElementById('btn-logout');
    if (btnLogin) btnLogin.style.display = 'none';
    if (btnDashboard) btnDashboard.style.display = '';
    if (btnLogout) btnLogout.style.display = '';
  }

  function setLoggedOut() {
    var btnLogin = document.getElementById('btn-login');
    var btnDashboard = document.getElementById('btn-dashboard');
    var btnLogout = document.getElementById('btn-logout');
    if (btnLogin) btnLogin.style.display = '';
    if (btnDashboard) btnDashboard.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
  }

  function init() {
    var btnLogin = document.getElementById('btn-login');
    var btnLogout = document.getElementById('btn-logout');

    if (btnLogin) {
      btnLogin.addEventListener('click', function () {
        window.location.href = '/login/';
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', function () {
        clearAuth();
        setLoggedOut();
        if (typeof window.authService !== 'undefined') {
          window.authService.logout().catch(function () {});
        }
      });
    }

    var token = getToken();
    if (token) {
      setLoggedIn();
    } else {
      setLoggedOut();
    }

    window.addEventListener('auth:ready', function (e) {
      if (e.detail && e.detail.isAuthenticated) {
        setLoggedIn();
      } else if (!getToken()) {
        setLoggedOut();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
