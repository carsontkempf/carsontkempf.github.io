/**
 * Apple Music Service for Spotify to Apple Music conversion
 * Uses MusicKit JS for authentication and Apple Music Web API
 */
class AppleMusicService {
    constructor() {
        this.musicKit = null;
        this.isInitialized = false;
        this.isAuthorized = false;
        this.developerToken = null;
        this.userToken = null;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.catalogOnlyMode = false; // Fallback mode for when auth fails
    }

    /**
     * Initialize MusicKit with developer token
     */
    async initialize(developerToken) {
        if (this.isInitialized) {
            console.log('Apple Music service already initialized');
            return;
        }

        try {
            console.log('Initializing Apple Music service...');
            
            // Validate token
            if (!developerToken || developerToken.trim() === '' || developerToken.includes('site.data')) {
                throw new Error('Invalid or missing Apple Music developer token');
            }
            
            console.log('Developer token validation passed');
            this.developerToken = developerToken;

            // Wait for MusicKit to be loaded
            await this.waitForMusicKit();

            // Configure MusicKit
            await MusicKit.configure({
                developerToken: developerToken,
                app: {
                    name: 'Spotify Apple Integration',
                    build: '1.0.0',
                    version: '1.0.0'
                },
                debug: true, // Enable debug mode
                suppressErrorDialog: true // Suppress error dialogs to catch them programmatically
            });

            this.musicKit = MusicKit.getInstance();
            this.isInitialized = true;

            console.log('Apple Music service initialized successfully');

            // Set up event listeners
            this.musicKit.addEventListener(MusicKit.Events.authorizationStatusDidChange, (event) => {
                this.handleAuthStatusChange(event.authorizationStatus);
            });

        } catch (error) {
            console.error('Failed to initialize Apple Music service:', error);
            
            if (error.message.includes('Invalid or missing Apple Music developer token')) {
                console.error('Token issue detected. Please check:');
                console.error('1. _data/apple_music_token.yml exists and contains valid token');
                console.error('2. Jekyll is processing the template correctly');
                console.error('3. Netlify environment variables are set');
            }
            
            throw error;
        }
    }

    /**
     * Wait for MusicKit to be loaded
     */
    async waitForMusicKit() {
        const maxAttempts = 50;
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const checkMusicKit = () => {
                attempts++;
                console.log(`Checking MusicKit attempt ${attempts}: available=${!!window.MusicKit}`);
                
                if (window.MusicKit) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('MusicKit failed to load'));
                } else {
                    setTimeout(checkMusicKit, 100);
                }
            };
            checkMusicKit();
        });
    }

    /**
     * Handle authorization status changes
     */
    handleAuthStatusChange(status) {
        console.log('Apple Music auth status changed:', status);
        
        // Handle both numeric status and object with status property
        const actualStatus = typeof status === 'object' && status.authorizationStatus !== undefined 
            ? status.authorizationStatus 
            : status;
        
        this.isAuthorized = actualStatus === MusicKit.AuthorizationStatus.authorized;
        
        if (this.isAuthorized) {
            this.userToken = this.musicKit.musicUserToken;
            console.log('Apple Music authorization successful');
        } else {
            this.userToken = null;
            console.log('Apple Music authorization lost or denied');
        }

        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('appleMusicAuthChanged', { 
            detail: { 
                isAuthorized: this.isAuthorized,
                status: status
            }
        }));
    }

    /**
     * Request user authorization
     */
    async authorize() {
        if (!this.isInitialized) {
            throw new Error('Apple Music service not initialized');
        }

        try {
            console.log('🎵 Apple Music: Opening authorization popup...');
            console.log('📋 Instructions: A popup will appear - click "Allow" to authorize');
            
            // Check for popup blockers
            console.log('🔍 Testing popup permissions...');
            const testPopup = window.open('', '_blank', 'width=1,height=1');
            if (!testPopup || testPopup.closed) {
                console.warn('🚫 POPUP BLOCKER DETECTED!');
                console.log('💡 Fix: Enable popups for 127.0.0.1 in your browser');
                console.log('   Chrome: Click the popup icon in address bar');
                console.log('   Safari: Safari > Settings > Websites > Pop-up Windows');
                console.log('   Firefox: Click the shield icon in address bar');
            } else {
                console.log('✅ Popup permissions OK');
                testPopup.close();
            }
            
            const authPromise = this.musicKit.authorize();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('No response to authorization popup after 30 seconds')), 30000)
            );
            
            const userToken = await Promise.race([authPromise, timeoutPromise]);
            
            this.userToken = userToken;
            this.isAuthorized = true;
            
            console.log('✅ Apple Music authorization successful');
            return true;
        } catch (error) {
            if (error.message.includes('30 seconds')) {
                console.log('❌ Authorization popup timed out');
                console.log('💡 Possible causes:');
                console.log('   • Popup was blocked by browser');
                console.log('   • Popup appeared but user didn\'t click "Allow"'); 
                console.log('   • User clicked "Don\'t Allow"');
                console.log('   • Popup is hidden behind other windows');
            } else {
                console.log('❌ Apple Music authorization failed:', error.message);
            }
            
            this.isAuthorized = false;
            this.userToken = null;
            
            console.log('🔄 Enabling catalog-only mode (can search but not create playlists)');
            this.catalogOnlyMode = true;
            
            // Dispatch event for UI updates in catalog-only mode
            window.dispatchEvent(new CustomEvent('appleMusicAuthChanged', { 
                detail: { 
                    isAuthorized: false,
                    catalogOnlyMode: true,
                    status: 'catalog-only'
                }
            }));
            
            return false;
        }
    }

    /**
     * Disconnect Apple Music
     */
    async disconnect() {
        if (!this.isInitialized) {
            return;
        }

        try {
            await this.musicKit.unauthorize();
            this.isAuthorized = false;
            this.userToken = null;
            
            console.log('Disconnected from Apple Music');
            
            // Dispatch auth change event
            window.dispatchEvent(new CustomEvent('appleMusicAuthChanged', { 
                detail: { 
                    isAuthorized: false,
                    status: MusicKit.AuthorizationStatus.notDetermined
                }
            }));
        } catch (error) {
            console.error('Apple Music disconnect failed:', error);
            throw error;
        }
    }

    /**
     * Ensure user is authorized
     */
    async ensureAuth() {
        if (!this.isInitialized) {
            throw new Error('Apple Music service not initialized');
        }

        if (!this.isAuthorized) {
            await this.authorize();
        }

        return this.isAuthorized;
    }

    /**
     * Make authenticated Apple Music API request
     */
    async apiRequest(endpoint, options = {}) {
        if (!this.isAuthorized || !this.userToken) {
            if (this.catalogOnlyMode) {
                // Use catalog-only request
                return this.catalogRequest(endpoint, options);
            }
            throw new Error('Not authorized with Apple Music');
        }

        const headers = {
            'Authorization': `Bearer ${this.developerToken}`,
            'Music-User-Token': this.userToken,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(`https://api.music.apple.com/v1${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`Apple Music API error: ${response.status} ${response.statusText}`);
        }

        return response;
    }

    /**
     * Make catalog-only API request (no user authorization required)
     */
    async catalogRequest(endpoint, options = {}) {
        const headers = {
            'Authorization': `Bearer ${this.developerToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(`https://api.music.apple.com/v1${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`Apple Music Catalog API error: ${response.status} ${response.statusText}`);
        }

        return response;
    }

    /**
     * Search for songs in Apple Music catalog by ISRC
     */
    async searchByISRC(isrc) {
        try {
            const response = await this.apiRequest(`/catalog/us/songs?filter[isrc]=${isrc}`);
            const data = await response.json();
            
            return data.data && data.data.length > 0 ? data.data[0] : null;
        } catch (error) {
            console.error('Error searching by ISRC:', error);
            return null;
        }
    }

    /**
     * Search for songs by artist and track name with explicit/clean preference
     */
    async searchByArtistAndTrack(artist, track, album = null, preferExplicit = null) {
        try {
            let searchTerm = `${artist} ${track}`;
            if (album) {
                searchTerm += ` ${album}`;
            }

            const encodedTerm = encodeURIComponent(searchTerm);
            const response = await this.apiRequest(`/catalog/us/search?term=${encodedTerm}&types=songs&limit=20`);
            const data = await response.json();
            
            if (data.results && data.results.songs && data.results.songs.data.length > 0) {
                // Find the best match using fuzzy matching with explicit preference
                return this.findBestMatch(data.results.songs.data, artist, track, album, preferExplicit);
            }
            
            return null;
        } catch (error) {
            console.error('Error searching by artist and track:', error);
            return null;
        }
    }

    /**
     * Find the best matching song from search results with explicit/clean preference
     */
    findBestMatch(songs, targetArtist, targetTrack, targetAlbum = null, preferExplicit = null) {
        let bestMatch = null;
        let bestScore = 0;
        let exactExplicitMatch = null;

        for (const song of songs) {
            const songArtist = song.attributes.artistName.toLowerCase();
            const songTrack = song.attributes.name.toLowerCase();
            const songAlbum = song.attributes.albumName ? song.attributes.albumName.toLowerCase() : '';
            const songIsExplicit = song.attributes.contentRating === 'explicit';

            // Calculate similarity scores
            const artistScore = this.calculateSimilarity(targetArtist.toLowerCase(), songArtist);
            const trackScore = this.calculateSimilarity(targetTrack.toLowerCase(), songTrack);
            const albumScore = targetAlbum ? this.calculateSimilarity(targetAlbum.toLowerCase(), songAlbum) : 0.5;

            // Weighted average (track name is most important, then artist, then album)
            const totalScore = (trackScore * 0.5) + (artistScore * 0.4) + (albumScore * 0.1);

            if (totalScore > 0.7) { // Minimum threshold
                // Prioritize explicit/clean preference if specified
                if (preferExplicit !== null && songIsExplicit === preferExplicit) {
                    if (totalScore > bestScore || !exactExplicitMatch) {
                        bestScore = totalScore;
                        bestMatch = song;
                        exactExplicitMatch = song;
                    }
                } else if (exactExplicitMatch === null && totalScore > bestScore) {
                    // Use as fallback if no explicit preference match found
                    bestScore = totalScore;
                    bestMatch = song;
                }
            }
        }

        return exactExplicitMatch || bestMatch;
    }

    /**
     * Calculate string similarity using Levenshtein distance
     */
    calculateSimilarity(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const maxLen = Math.max(len1, len2);
        return maxLen === 0 ? 1 : 1 - (matrix[len2][len1] / maxLen);
    }

    /**
     * Convert Spotify track to Apple Music song with explicit/clean preference
     */
    async convertSpotifyTrack(spotifyTrack, options = {}) {
        if (!spotifyTrack || !spotifyTrack.track) {
            return { success: false, error: 'Invalid Spotify track' };
        }

        const track = spotifyTrack.track;
        const artist = track.artists && track.artists.length > 0 ? track.artists[0].name : 'Unknown Artist';
        const trackName = track.name;
        const album = track.album ? track.album.name : null;
        const isrc = track.external_ids ? track.external_ids.isrc : null;
        const isExplicit = track.explicit || false;
        
        // Use explicit preference from options or maintain original explicit status
        const preferExplicit = options.maintainExplicit !== false ? isExplicit : null;

        try {
            let appleMusicSong = null;
            let matchMethod = 'none';

            // Strategy 1: Search by ISRC (most accurate)
            if (isrc) {
                console.log(`🔍 Searching for "${trackName}" by ISRC: ${isrc} (explicit: ${isExplicit})`);
                appleMusicSong = await this.searchByISRC(isrc);
                if (appleMusicSong) matchMethod = 'isrc';
            }

            // Strategy 2: Search by artist and track name with explicit preference
            if (!appleMusicSong) {
                console.log(`🔍 Searching for "${trackName}" by ${artist} (explicit: ${isExplicit}, prefer: ${preferExplicit})`);
                appleMusicSong = await this.searchByArtistAndTrack(artist, trackName, album, preferExplicit);
                if (appleMusicSong) matchMethod = 'search_with_explicit';
            }

            // Strategy 3: Fallback search without explicit preference
            if (!appleMusicSong && preferExplicit !== null) {
                console.log(`🔍 Fallback search for "${trackName}" by ${artist} (any version)`);
                appleMusicSong = await this.searchByArtistAndTrack(artist, trackName, album, null);
                if (appleMusicSong) matchMethod = 'search_fallback';
            }

            if (appleMusicSong) {
                const appleMusicExplicit = appleMusicSong.attributes.contentRating === 'explicit';
                const explicitMatch = isExplicit === appleMusicExplicit;
                
                console.log(`✅ Found match: "${appleMusicSong.attributes.name}" by ${appleMusicSong.attributes.artistName}`);
                console.log(`   Explicit match: Spotify(${isExplicit}) → Apple Music(${appleMusicExplicit}) = ${explicitMatch ? '✅' : '⚠️'}`);
                
                return {
                    success: true,
                    appleMusicSong: appleMusicSong,
                    matchMethod: matchMethod,
                    originalTrack: track,
                    explicitMatch: explicitMatch,
                    explicitInfo: {
                        spotify: isExplicit,
                        appleMusic: appleMusicExplicit,
                        maintained: explicitMatch
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'No matching song found in Apple Music',
                    originalTrack: track,
                    explicitInfo: {
                        spotify: isExplicit,
                        appleMusic: null,
                        maintained: false
                    }
                };
            }

        } catch (error) {
            console.error('Error converting Spotify track:', error);
            return {
                success: false,
                error: error.message,
                originalTrack: track,
                explicitInfo: {
                    spotify: isExplicit,
                    appleMusic: null,
                    maintained: false
                }
            };
        }
    }

    /**
     * Convert multiple Spotify tracks with progress tracking and explicit filtering
     */
    async convertSpotifyTracks(spotifyTracks, onProgress = null, options = {}) {
        const results = {
            successful: [],
            failed: [],
            explicitMatches: 0,
            explicitMismatches: 0,
            total: spotifyTracks.length
        };

        for (let i = 0; i < spotifyTracks.length; i++) {
            const track = spotifyTracks[i];
            
            try {
                const result = await this.convertSpotifyTrack(track, options);
                
                if (result.success) {
                    results.successful.push(result);
                    if (result.explicitMatch) {
                        results.explicitMatches++;
                    } else {
                        results.explicitMismatches++;
                    }
                } else {
                    results.failed.push(result);
                }

                // Call progress callback with enhanced info
                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total: results.total,
                        successful: results.successful.length,
                        failed: results.failed.length,
                        explicitMatches: results.explicitMatches,
                        explicitMismatches: results.explicitMismatches,
                        currentTrack: track.track ? track.track.name : 'Unknown',
                        currentExplicit: track.track ? track.track.explicit : false
                    });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error('Error processing track:', error);
                results.failed.push({
                    success: false,
                    error: error.message,
                    originalTrack: track.track,
                    explicitInfo: {
                        spotify: track.track ? track.track.explicit : false,
                        appleMusic: null,
                        maintained: false
                    }
                });
            }
        }

        return results;
    }

    /**
     * Create a new playlist in Apple Music
     */
    async createPlaylist(name, description = '', isPublic = false) {
        await this.ensureAuth();

        try {
            const playlistData = {
                data: [{
                    type: 'library-playlists',
                    attributes: {
                        name: name,
                        description: description,
                        isPublic: isPublic
                    }
                }]
            };

            const response = await this.apiRequest('/me/library/playlists', {
                method: 'POST',
                body: JSON.stringify(playlistData)
            });

            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                return data.data[0];
            } else {
                throw new Error('Failed to create playlist');
            }

        } catch (error) {
            console.error('Error creating Apple Music playlist:', error);
            throw error;
        }
    }

    /**
     * Add songs to an Apple Music playlist
     */
    async addSongsToPlaylist(playlistId, appleMusicSongs) {
        await this.ensureAuth();

        try {
            // First, add songs to user's library
            const songIds = appleMusicSongs.map(song => song.id);
            await this.addSongsToLibrary(songIds);

            // Then add to playlist
            const tracksData = {
                data: appleMusicSongs.map(song => ({
                    id: song.id,
                    type: 'library-songs'
                }))
            };

            const response = await this.apiRequest(`/me/library/playlists/${playlistId}/tracks`, {
                method: 'POST',
                body: JSON.stringify(tracksData)
            });

            console.log(`Added ${appleMusicSongs.length} songs to playlist ${playlistId}`);
            return true;

        } catch (error) {
            console.error('Error adding songs to playlist:', error);
            throw error;
        }
    }

    /**
     * Add songs to user's Apple Music library
     */
    async addSongsToLibrary(songIds) {
        await this.ensureAuth();

        try {
            const params = new URLSearchParams();
            params.append('ids[songs]', songIds.join(','));

            const response = await this.apiRequest(`/me/library?${params.toString()}`, {
                method: 'POST'
            });

            console.log(`Added ${songIds.length} songs to library`);
            return true;

        } catch (error) {
            console.error('Error adding songs to library:', error);
            throw error;
        }
    }

    /**
     * Convert entire Spotify playlist to Apple Music with explicit filtering options
     */
    async convertSpotifyPlaylist(spotifyPlaylist, spotifyTracks, onProgress = null, options = {}) {
        if (!this.catalogOnlyMode) {
            await this.ensureAuth();
        }

        try {
            console.log(`🎵 Starting conversion of playlist: ${spotifyPlaylist.name}`);
            console.log(`🔧 Options: maintainExplicit=${options.maintainExplicit !== false}`);

            // Convert tracks with explicit filtering
            const conversionResults = await this.convertSpotifyTracks(spotifyTracks, onProgress, options);

            if (conversionResults.successful.length === 0) {
                throw new Error('No tracks could be converted');
            }

            const explicitMatchRate = conversionResults.successful.length > 0 
                ? Math.round((conversionResults.explicitMatches / conversionResults.successful.length) * 100)
                : 0;

            console.log(`📊 Conversion stats: ${conversionResults.successful.length}/${conversionResults.total} converted, ${explicitMatchRate}% explicit matches`);

            if (this.catalogOnlyMode) {
                // Catalog-only mode: return results without creating playlist
                console.log('🔍 Catalog-only mode: Showing conversion results without creating playlist');
                return {
                    success: true,
                    catalogOnlyMode: true,
                    appleMusicPlaylist: {
                        attributes: {
                            name: `${spotifyPlaylist.name} (Preview)`
                        }
                    },
                    conversionResults: conversionResults,
                    summary: {
                        originalTracks: conversionResults.total,
                        convertedTracks: conversionResults.successful.length,
                        failedTracks: conversionResults.failed.length,
                        successRate: Math.round((conversionResults.successful.length / conversionResults.total) * 100),
                        explicitMatches: conversionResults.explicitMatches,
                        explicitMismatches: conversionResults.explicitMismatches,
                        explicitMatchRate: explicitMatchRate
                    },
                    message: 'Authorization failed, but we found matching songs in Apple Music catalog. Sign in to Apple Music to create the actual playlist.'
                };
            }

            // Full mode: create actual playlist
            const playlistName = `${spotifyPlaylist.name} (from Spotify)`;
            const description = `Converted from Spotify playlist "${spotifyPlaylist.name}" • ${conversionResults.successful.length}/${conversionResults.total} tracks converted • ${explicitMatchRate}% explicit matches preserved`;
            
            const appleMusicPlaylist = await this.createPlaylist(playlistName, description, false);

            // Add converted songs to playlist
            const appleMusicSongs = conversionResults.successful.map(result => result.appleMusicSong);
            await this.addSongsToPlaylist(appleMusicPlaylist.id, appleMusicSongs);

            return {
                success: true,
                catalogOnlyMode: false,
                appleMusicPlaylist: appleMusicPlaylist,
                conversionResults: conversionResults,
                summary: {
                    originalTracks: conversionResults.total,
                    convertedTracks: conversionResults.successful.length,
                    failedTracks: conversionResults.failed.length,
                    successRate: Math.round((conversionResults.successful.length / conversionResults.total) * 100),
                    explicitMatches: conversionResults.explicitMatches,
                    explicitMismatches: conversionResults.explicitMismatches,
                    explicitMatchRate: explicitMatchRate
                }
            };

        } catch (error) {
            console.error('Error converting Spotify playlist:', error);
            throw error;
        }
    }

    /**
     * Retry operation with exponential backoff
     */
    async retryOperation(operation, context = '') {
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`${context} attempt ${attempt} failed:`, error);
                
                if (attempt === this.retryAttempts) {
                    throw error;
                }
                
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
    }
}

// Create global instance
window.appleMusicService = new AppleMusicService();

console.log('Apple Music Service loaded');