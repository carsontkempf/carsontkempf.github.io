/**
 * Storage Manager - Client-side bridge to Netlify Functions
 * Handles user profile and game persistence with debouncing and caching
 * Part of Carson's Chess Engine
 * @module chess/storage/storage-manager
 */

class StorageManager {
  constructor() {
    this.baseUrl = '/.netlify/functions';
    this.userProfile = null;
    this.profileSha = null;
    this.saveTimeout = null;
    this.debounceMs = 2000;  // 2 second debounce
    this.cache = {
      profile: null,
      profileTimestamp: null,
      cacheDuration: 300000  // 5 minutes
    };
  }

  /**
   * Get Auth0 token from authService
   * @returns {Promise<string>} JWT token
   */
  async getAuthToken() {
    if (!window.authService || !window.authService.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      return await window.authService.client.getTokenSilently();
    } catch (error) {
      console.error('[StorageManager] Failed to get auth token:', error);
      throw new Error('Authentication token unavailable');
    }
  }

  /**
   * Load user profile from server (with caching)
   * @param {boolean} forceRefresh - Skip cache and fetch fresh data
   * @returns {Promise<Object>} User profile object
   */
  async loadUserProfile(forceRefresh = false) {
    // Check cache first
    if (!forceRefresh && this.cache.profile && this.cache.profileTimestamp) {
      const age = Date.now() - this.cache.profileTimestamp;
      if (age < this.cache.cacheDuration) {
        console.log('[StorageManager] Returning cached profile');
        return this.cache.profile;
      }
    }

    try {
      const token = await this.getAuthToken();

      console.log('[StorageManager] Loading user profile...');
      const response = await fetch(`${this.baseUrl}/db-get-user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load profile');
      }

      const data = await response.json();
      this.userProfile = data.profile;
      this.profileSha = data.sha || null;

      // Update cache
      this.cache.profile = data.profile;
      this.cache.profileTimestamp = Date.now();

      if (data.isNew) {
        console.log('[StorageManager] New user detected, using default profile');
        // Auto-save default profile
        await this.saveUserProfileNow(this.userProfile);
      } else {
        console.log('[StorageManager] Profile loaded successfully');
      }

      return this.userProfile;

    } catch (error) {
      console.error('[StorageManager] Error loading profile:', error);
      throw error;
    }
  }

  /**
   * Save user profile (debounced)
   * @param {Object} profileData - Profile data to save
   * @returns {Promise<Object>} Save result
   */
  saveUserProfile(profileData) {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Update local cache immediately
    this.userProfile = { ...this.userProfile, ...profileData };

    // Debounce the actual save
    return new Promise((resolve, reject) => {
      this.saveTimeout = setTimeout(async () => {
        try {
          const result = await this._performSave(this.userProfile);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, this.debounceMs);
    });
  }

  /**
   * Internal method to perform profile save
   * @private
   */
  async _performSave(profileData) {
    try {
      const token = await this.getAuthToken();

      console.log('[StorageManager] Saving user profile...');
      const response = await fetch(`${this.baseUrl}/db-save-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: profileData,
          sha: this.profileSha
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 409) {
          // Conflict - reload and prompt user
          console.warn('[StorageManager] Profile conflict detected');
          throw new Error('Profile has been modified elsewhere. Please refresh.');
        }

        throw new Error(errorData.message || 'Failed to save profile');
      }

      const data = await response.json();
      this.profileSha = data.sha;  // Update SHA for next save

      // Invalidate cache
      this.cache.profileTimestamp = Date.now();
      this.cache.profile = profileData;

      console.log('[StorageManager] Profile saved successfully');
      return data;

    } catch (error) {
      console.error('[StorageManager] Error saving profile:', error);
      throw error;
    }
  }

  /**
   * Save user profile immediately (no debounce)
   * @param {Object} profileData - Profile data to save
   * @returns {Promise<Object>} Save result
   */
  async saveUserProfileNow(profileData) {
    // Cancel debounced save
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }

    this.userProfile = { ...this.userProfile, ...profileData };
    return await this._performSave(this.userProfile);
  }

  /**
   * Save game to history
   * @param {Object} gameData - Game data to save
   * @returns {Promise<Object>} Save result with game ID
   */
  async saveGame(gameData) {
    try {
      const token = await this.getAuthToken();

      console.log('[StorageManager] Saving game...');
      const response = await fetch(`${this.baseUrl}/db-save-game`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save game');
      }

      const data = await response.json();
      console.log('[StorageManager] Game saved successfully:', data.gameId);

      // Update user stats
      if (this.userProfile && this.userProfile.stats) {
        this.userProfile.stats.gamesPlayed += 1;
        if (gameData.result === 'win') this.userProfile.stats.wins += 1;
        if (gameData.result === 'loss') this.userProfile.stats.losses += 1;
        if (gameData.result === 'draw') this.userProfile.stats.draws += 1;

        // Debounced save of updated stats
        this.saveUserProfile(this.userProfile);
      }

      return data;

    } catch (error) {
      console.error('[StorageManager] Error saving game:', error);
      throw error;
    }
  }

  /**
   * Get current profile
   * @returns {Object|null} Current user profile
   */
  getProfile() {
    return this.userProfile;
  }

  /**
   * Get user preferences
   * @returns {Object|null} User preferences
   */
  getPreferences() {
    return this.userProfile?.preferences || null;
  }

  /**
   * Get user stats
   * @returns {Object|null} User stats
   */
  getStats() {
    return this.userProfile?.stats || null;
  }

  /**
   * Update a single preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   * @returns {Promise<Object>} Save result
   */
  updatePreference(key, value) {
    if (!this.userProfile || !this.userProfile.preferences) {
      throw new Error('Profile not loaded');
    }

    this.userProfile.preferences[key] = value;
    return this.saveUserProfile(this.userProfile);
  }

  /**
   * Clear cache (force refresh on next load)
   */
  clearCache() {
    this.cache.profile = null;
    this.cache.profileTimestamp = null;
  }
}

// Export singleton instance
const storageManager = new StorageManager();

// Development/testing helper
if (typeof window !== 'undefined') {
  window.chessStorageTest = {
    async loadProfile() {
      const profile = await storageManager.loadUserProfile();
      console.log('Profile loaded:', profile);
      return profile;
    },

    async savePreference(key, value) {
      await storageManager.updatePreference(key, value);
      console.log(`Preference ${key} updated to ${value}`);
    },

    async saveTestGame() {
      await storageManager.saveGame({
        timestamp: new Date().toISOString(),
        opponent: 'Test Bot',
        result: 'win',
        finalPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        pgn: '1. e4',
        duration: 120,
        userColor: 'white'
      });
      console.log('Test game saved');
    }
  };
}

export default storageManager;
