/**
 * Tier Manager Module
 *
 * Manages feature access based on user subscription tier (free vs premium)
 *
 * Dependencies: Requires auth-service.js to be loaded first
 */

(function() {
  'use strict';

  // Wait for auth service to be ready
  if (typeof authService === 'undefined') {
    console.error('[Tier Manager] authService not found. Load auth-service.js first.');
    return;
  }

  /**
   * Feature definitions per tier
   */
  const TIER_FEATURES = {
    free: [
      'read-articles',
      'basic-search',
      'browse-content',
      'comment'
    ],
    premium: [
      'read-articles',
      'basic-search',
      'browse-content',
      'comment',
      'advanced-search',
      'download-content',
      'api-access',
      'offline-mode',
      'priority-support',
      'custom-themes',
      'export-data'
    ]
  };

  /**
   * Get user's tier
   * @returns {Promise<'free'|'premium'>}
   */
  async function getUserTier() {
    try {
      const roles = await authService.getRoles();
      const tier = roles.includes('premium') ? 'premium' : 'free';
      console.log(`[Tier Manager] User tier: ${tier}`);
      return tier;
    } catch (err) {
      console.error('[Tier Manager] Error getting user tier:', err);
      return 'free'; // Default to free on error
    }
  }

  /**
   * Check if user has access to a specific feature
   * @param {string} feature - Feature name
   * @returns {Promise<boolean>}
   */
  async function hasFeature(feature) {
    try {
      const tier = await getUserTier();
      const hasAccess = TIER_FEATURES[tier].includes(feature);
      console.log(`[Tier Manager] Feature "${feature}" access:`, hasAccess);
      return hasAccess;
    } catch (err) {
      console.error('[Tier Manager] Error checking feature access:', err);
      return false;
    }
  }

  /**
   * Show premium content and hide free content based on user tier
   */
  async function showPremiumContent() {
    try {
      const tier = await getUserTier();
      const isPremium = tier === 'premium';

      // Show/hide premium-only elements
      const premiumElements = document.querySelectorAll('.premium-only, [data-tier="premium"]');
      premiumElements.forEach(el => {
        if (isPremium) {
          el.style.display = '';
          el.removeAttribute('data-tier-hidden');
        } else {
          el.style.display = 'none';
          el.setAttribute('data-tier-hidden', 'true');
        }
      });

      // Show/hide upgrade prompts
      const upgradePrompts = document.querySelectorAll('.upgrade-prompt, [data-upgrade-prompt]');
      upgradePrompts.forEach(el => {
        if (isPremium) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
        }
      });

      // Update tier badges
      const tierBadges = document.querySelectorAll('.tier-badge, [data-tier-badge]');
      tierBadges.forEach(el => {
        el.textContent = tier.toUpperCase();
        el.className = el.className.replace(/tier-\w+/, `tier-${tier}`);
      });

      console.log(`[Tier Manager] Updated ${premiumElements.length} premium elements and ${upgradePrompts.length} upgrade prompts`);
    } catch (err) {
      console.error('[Tier Manager] Error showing premium content:', err);
    }
  }

  /**
   * Show free-only content (content visible only to free users)
   */
  async function showFreeContent() {
    try {
      const tier = await getUserTier();
      const isFree = tier === 'free';

      const freeOnlyElements = document.querySelectorAll('.free-only, [data-tier="free"]');
      freeOnlyElements.forEach(el => {
        if (isFree) {
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });

      console.log(`[Tier Manager] Updated ${freeOnlyElements.length} free-only elements`);
    } catch (err) {
      console.error('[Tier Manager] Error showing free content:', err);
    }
  }

  /**
   * Update all tier-based content on the page
   */
  async function updateAllTierContent() {
    await showPremiumContent();
    await showFreeContent();
  }

  /**
   * Add upgrade prompt to a specific element
   * @param {string} selector - CSS selector for elements
   * @param {string} feature - Feature name requiring upgrade
   */
  async function addUpgradePrompt(selector, feature) {
    try {
      const hasPremium = await hasFeature(feature);
      if (hasPremium) return; // User already has access

      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'tier-upgrade-overlay';
        overlay.style.cssText = `
          position: relative;
          opacity: 0.6;
          pointer-events: none;
          filter: blur(2px);
        `;

        // Create prompt
        const prompt = document.createElement('div');
        prompt.className = 'tier-upgrade-prompt';
        prompt.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(231, 76, 60, 0.95);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          pointer-events: all;
          z-index: 100;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        `;
        prompt.innerHTML = `
          <strong>Premium Feature</strong><br>
          <p style="margin: 10px 0;">Upgrade to access ${feature}</p>
          <button onclick="window.location.href='/upgrade/'" style="
            background: white;
            color: #e74c3c;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
          ">Upgrade Now</button>
        `;

        // Wrap element
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
        wrapper.appendChild(prompt);
        el.style.cssText = overlay.style.cssText;
      });

      console.log(`[Tier Manager] Added upgrade prompts to ${elements.length} elements`);
    } catch (err) {
      console.error('[Tier Manager] Error adding upgrade prompt:', err);
    }
  }

  /**
   * Get list of features available to user's tier
   * @returns {Promise<string[]>}
   */
  async function getAvailableFeatures() {
    try {
      const tier = await getUserTier();
      return TIER_FEATURES[tier];
    } catch (err) {
      console.error('[Tier Manager] Error getting available features:', err);
      return [];
    }
  }

  /**
   * Check if user is premium
   * @returns {Promise<boolean>}
   */
  async function isPremium() {
    const tier = await getUserTier();
    return tier === 'premium';
  }

  /**
   * Initialize tier manager on page load
   */
  async function init() {
    console.log('[Tier Manager] Initializing...');

    // Wait for auth to be ready
    const isAuthed = await authService.isAuthenticated();

    if (isAuthed) {
      await updateAllTierContent();
    } else {
      console.log('[Tier Manager] User not authenticated, skipping tier content update');
    }
  }

  // Public API
  window.tierManager = {
    getUserTier,
    hasFeature,
    showPremiumContent,
    showFreeContent,
    updateAllTierContent,
    addUpgradePrompt,
    getAvailableFeatures,
    isPremium,
    init,
    TIER_FEATURES
  };

  // Auto-initialize on auth ready
  window.addEventListener('auth:ready', (event) => {
    if (event.detail.isAuthenticated) {
      init();
    }
  });

  console.log('[Tier Manager] Module loaded');
})();
