/**
 * RBAC Protection Module
 *
 * Provides role-based access control helpers for protecting pages and content
 *
 * Dependencies: Requires auth-service.js to be loaded first
 */

(function() {
  'use strict';

  // Wait for auth service to be ready
  if (typeof authService === 'undefined') {
    console.error('[RBAC] authService not found. Load auth-service.js first.');
    return;
  }

  /**
   * Require a specific role to access content
   * Redirects to dashboard with error if access denied
   *
   * @param {string} requiredRole - Role name required
   * @param {string} redirectUrl - Where to redirect on failure (default: /dashboard/)
   * @returns {Promise<boolean>}
   */
  async function requireRole(requiredRole, redirectUrl = '/dashboard/?error=access_denied') {
    console.log(`[RBAC] Checking for required role: ${requiredRole}`);

    try {
      const hasAccess = await authService.hasRole(requiredRole);

      if (!hasAccess) {
        console.warn(`[RBAC] Access denied - missing role: ${requiredRole}`);

        // Show error message
        showAccessDeniedMessage(requiredRole);

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);

        return false;
      }

      console.log(`[RBAC] Access granted for role: ${requiredRole}`);
      return true;
    } catch (err) {
      console.error('[RBAC] Error checking role:', err);

      // On error, deny access
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);

      return false;
    }
  }

  /**
   * Require ANY of the specified roles
   *
   * @param {string[]} roles - Array of acceptable roles
   * @param {string} redirectUrl - Where to redirect on failure
   * @returns {Promise<boolean>}
   */
  async function requireAnyRole(roles, redirectUrl = '/dashboard/?error=access_denied') {
    console.log(`[RBAC] Checking for any of roles:`, roles);

    try {
      const userRoles = await authService.getRoles();
      const hasAccess = roles.some(role => userRoles.includes(role));

      if (!hasAccess) {
        console.warn(`[RBAC] Access denied - missing any of:`, roles);
        showAccessDeniedMessage(roles.join(' or '));

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);

        return false;
      }

      console.log(`[RBAC] Access granted - user has required role`);
      return true;
    } catch (err) {
      console.error('[RBAC] Error checking roles:', err);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);

      return false;
    }
  }

  /**
   * Require ALL of the specified roles
   *
   * @param {string[]} roles - Array of required roles
   * @param {string} redirectUrl - Where to redirect on failure
   * @returns {Promise<boolean>}
   */
  async function requireAllRoles(roles, redirectUrl = '/dashboard/?error=access_denied') {
    console.log(`[RBAC] Checking for all roles:`, roles);

    try {
      const userRoles = await authService.getRoles();
      const hasAccess = roles.every(role => userRoles.includes(role));

      if (!hasAccess) {
        console.warn(`[RBAC] Access denied - missing required roles`);
        showAccessDeniedMessage(`all of: ${roles.join(', ')}`);

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);

        return false;
      }

      console.log(`[RBAC] Access granted - user has all required roles`);
      return true;
    } catch (err) {
      console.error('[RBAC] Error checking roles:', err);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);

      return false;
    }
  }

  /**
   * Show/hide elements based on role
   *
   * @param {string} role - Role required to see element
   * @param {string} selector - CSS selector for elements
   */
  async function showIfRole(role, selector) {
    try {
      const hasRole = await authService.hasRole(role);
      const elements = document.querySelectorAll(selector);

      elements.forEach(el => {
        if (hasRole) {
          el.style.display = '';
          el.removeAttribute('data-rbac-hidden');
        } else {
          el.style.display = 'none';
          el.setAttribute('data-rbac-hidden', 'true');
        }
      });

      console.log(`[RBAC] Updated visibility for ${elements.length} elements (role: ${role})`);
    } catch (err) {
      console.error('[RBAC] Error updating element visibility:', err);
    }
  }

  /**
   * Hide elements from users without role
   *
   * @param {string} role - Role required to see element
   * @param {string} selector - CSS selector for elements
   */
  async function hideIfNotRole(role, selector) {
    await showIfRole(role, selector);
  }

  /**
   * Show access denied message to user
   *
   * @param {string} requiredRole - Role that was required
   */
  function showAccessDeniedMessage(requiredRole) {
    // Check if message container already exists
    let container = document.getElementById('rbac-access-denied');

    if (!container) {
      container = document.createElement('div');
      container.id = 'rbac-access-denied';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #e74c3c;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        max-width: 90%;
        text-align: center;
      `;
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <strong>Access Denied</strong><br>
      This page requires role: <strong>${requiredRole}</strong><br>
      <small>Redirecting in 2 seconds...</small>
    `;
  }

  /**
   * Check if user is authenticated, redirect if not
   *
   * @param {string} redirectUrl - Where to redirect (default: /login)
   * @returns {Promise<boolean>}
   */
  async function requireAuth(redirectUrl = '/?login=required') {
    console.log('[RBAC] Checking authentication...');

    try {
      const isAuthed = await authService.isAuthenticated();

      if (!isAuthed) {
        console.warn('[RBAC] Not authenticated - redirecting to login');

        showAccessDeniedMessage('authentication required');

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);

        return false;
      }

      console.log('[RBAC] User is authenticated');
      return true;
    } catch (err) {
      console.error('[RBAC] Error checking authentication:', err);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);

      return false;
    }
  }

  // Public API
  window.rbac = {
    requireRole,
    requireAnyRole,
    requireAllRoles,
    requireAuth,
    showIfRole,
    hideIfNotRole
  };

  console.log('[RBAC] Protection module loaded');
})();
