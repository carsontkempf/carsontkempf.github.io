/**
 * Learn Auth SDK Service Wrapper
 *
 * Provides a backward-compatible interface for the Auth SDK
 * Maintains the same API as Auth0 for easy migration
 *
 * Dependencies: Requires learn-auth-sdk.js to be loaded first
 */

(function() {
  'use strict';

  const TENANT_URL = 'https://cloudprototype.org/api/auth';

  // Check if AuthSDK is loaded
  if (typeof AuthSDK === 'undefined') {
    console.error('[Auth Service] AuthSDK not loaded. Ensure learn-auth-sdk.js is included before this script.');
    return;
  }

  // Initialize AuthSDK
  let auth = null;
  let sessionCache = null;

  try {
    auth = new AuthSDK({ tenantUrl: TENANT_URL });
    console.log('[Auth Service] Initialized with tenant URL:', TENANT_URL);
  } catch (err) {
    console.error('[Auth Service] Failed to initialize AuthSDK:', err);
  }

  /**
   * Public API - maintains compatibility with existing code
   */
  window.authService = {
    /**
     * Login with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user, session}>}
     */
    async login(email, password) {
      console.log('[Auth Service] Attempting login for:', email);

      try {
        const result = await auth.signIn(email, password);

        if (result.error) {
          console.error('[Auth Service] Login failed:', result.error);
          throw new Error(result.error.message || 'Login failed');
        }

        // Update session cache
        sessionCache = result.data;

        console.log('[Auth Service] Login successful');
        return result.data;
      } catch (err) {
        console.error('[Auth Service] Login error:', err);
        throw err;
      }
    },

    /**
     * Sign up with email, password, and name
     * @param {string} email
     * @param {string} password
     * @param {string} name
     * @returns {Promise<{user, session}>}
     */
    async signup(email, password, name) {
      console.log('[Auth Service] Attempting signup for:', email);

      try {
        const result = await auth.signUp(email, password, name);

        if (result.error) {
          console.error('[Auth Service] Signup failed:', result.error);
          throw new Error(result.error.message || 'Signup failed');
        }

        // Update session cache
        sessionCache = result.data;

        console.log('[Auth Service] Signup successful');
        return result.data;
      } catch (err) {
        console.error('[Auth Service] Signup error:', err);
        throw err;
      }
    },

    /**
     * Logout current user
     * @returns {Promise<void>}
     */
    async logout() {
      console.log('[Auth Service] Logging out...');

      try {
        await auth.signOut();
        sessionCache = null;
        console.log('[Auth Service] Logout successful');

        // Redirect to home page
        window.location.href = '/';
      } catch (err) {
        console.error('[Auth Service] Logout error:', err);
        // Still clear cache and redirect even if server logout fails
        sessionCache = null;
        window.location.href = '/';
      }
    },

    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>}
     */
    async isAuthenticated() {
      try {
        const session = await auth.getSession();
        if (session?.data?.user) {
          console.log('[Auth Service] Authentication check: true (session)');
          return true;
        }
        // Fallback: trust stored token+user from login redirect
        const token = localStorage.getItem('learn_auth_token');
        const storedUser = localStorage.getItem('learn_auth_user');
        if (token && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user?.email) {
              console.log('[Auth Service] Authentication check: true (localStorage)');
              return true;
            }
          } catch(e) {}
        }
        console.log('[Auth Service] Authentication check: false');
        return false;
      } catch (err) {
        console.error('[Auth Service] Auth check error:', err);
        return false;
      }
    },

    /**
     * Get current user
     * Returns cached user if available, otherwise fetches from session
     * @returns {Promise<User|null>}
     */
    async getUser() {
      try {
        if (sessionCache?.user) {
          return sessionCache.user;
        }

        const session = await auth.getSession();
        if (session?.data?.user) {
          sessionCache = session.data;
          return session.data.user;
        }

        // Fallback: use stored user from login redirect
        const storedUser = localStorage.getItem('learn_auth_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user?.email) return user;
          } catch(e) {}
        }

        return null;
      } catch (err) {
        console.error('[Auth Service] Get user error:', err);
        return null;
      }
    },

    /**
     * Get session data
     * @returns {Promise<{user, session}|null>}
     */
    async getSession() {
      try {
        const session = await auth.getSession();
        if (session?.data) {
          sessionCache = session.data;
          return session.data;
        }
        return null;
      } catch (err) {
        console.error('[Auth Service] Get session error:', err);
        return null;
      }
    },

    /**
     * Check if user has a specific role
     * @param {string} role
     * @returns {Promise<boolean>}
     */
    async hasRole(role) {
      try {
        const result = await auth.hasRole(role);
        console.log(`[Auth Service] Role check for "${role}":`, result);
        return result;
      } catch (err) {
        console.error('[Auth Service] Role check error:', err);
        return false;
      }
    },

    /**
     * Get all user roles
     * @returns {Promise<string[]>}
     */
    async getRoles() {
      try {
        const roles = await auth.getRoles();
        console.log('[Auth Service] User roles:', roles);
        return roles;
      } catch (err) {
        console.error('[Auth Service] Get roles error:', err);
        return [];
      }
    },

    /**
     * Get raw auth SDK instance (for advanced usage)
     * @returns {AuthSDK}
     */
    get sdk() {
      return auth;
    }
  };

  // Auto-check authentication on load
  (async () => {
    const isAuthed = await window.authService.isAuthenticated();
    console.log('[Auth Service] Initial auth state:', isAuthed);

    // Trigger custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('auth:ready', {
      detail: { isAuthenticated: isAuthed }
    }));
  })();

  console.log('[Auth Service] Service initialized and ready');
})();
