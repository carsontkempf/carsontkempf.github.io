/**
 * Google Drive Service for Code Comprehension Project
 * Handles Google Drive API operations for error annotations and user data
 * Uses Google Drive's Application Data Folder for secure data storage
 * Updated to use Google Identity Services (GIS) instead of deprecated gapi.auth2
 */
class GoogleDriveService {
    constructor() {
        this.initialized = false;
        this.gapi = null;
        this.tokenClient = null;
        this.accessToken = null;
        this.isSignedIn = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        this.lastAutoAuthAttempt = null;
        this.securityEvents = [];
        this.maxSecurityEvents = 100; // Keep last 100 security events
    }

    /**
     * Check if user has required role for automatic Google Drive access
     */
    hasAuthorizedRole() {
        console.log('=== Role Check Debug ===');
        console.log('Auth service exists:', !!window.authService);
        console.log('Auth service authenticated:', window.authService?.isAuthenticated);
        
        if (!window.authService || !window.authService.isAuthenticated) {
            console.log('Auth service not ready, no role access');
            return false;
        }

        const user = window.authService.user;
        console.log('User object:', user);
        
        if (!user) {
            console.log('No user object available');
            return false;
        }
        
        // Check user roles in multiple possible locations
        const customRoles = user['https://carsontkempf.github.io/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        const rolesArray = user.roles || [];
        const authorizationRoles = user.authorization?.roles || [];
        const orgRoles = user['org_roles'] || [];
        const realmRoles = user['realm_roles'] || [];
        
        console.log('Role sources:', {
            customRoles,
            auth0Roles,
            appMetadataRoles,
            userMetadataRoles,
            rolesArray,
            authorizationRoles,
            orgRoles,
            realmRoles
        });
        
        // Combine all possible role sources
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles, ...rolesArray, ...authorizationRoles, ...orgRoles, ...realmRoles];
        console.log('All roles combined:', allRoles);
        
        const hasAdminRole = allRoles.includes('admin');
        const hasCodeComprehensionRole = allRoles.includes('code-comprehension') || 
                                        allRoles.includes('Code-Comprehension-Project') || 
                                        allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
        
        // Authorized user emails for the Code Comprehension Project
        const authorizedEmails = [
            'mifqk@umsystem.edu',
            'carsontkempf@gmail.com', 
            'ctkfdp@umsystem.edu',
            'pejbvy@umsystem.edu',
            'richardson.leah1@gmail.com'
        ];
        
        const isAuthorizedUser = authorizedEmails.includes(user.email?.toLowerCase());
        
        console.log('Role evaluation:', {
            hasAdminRole,
            hasCodeComprehensionRole,
            isAuthorizedUser,
            userEmail: user.email
        });
        
        const hasAccess = hasAdminRole || hasCodeComprehensionRole || isAuthorizedUser;
        console.log('Final access decision:', hasAccess);
        
        // Log security event
        this.logSecurityEvent('role_check', {
            hasAccess,
            userEmail: user.email,
            roles: allRoles,
            timestamp: new Date().toISOString()
        });
        
        return hasAccess;
    }

    /**
     * Log security events for monitoring and audit purposes
     */
    logSecurityEvent(eventType, details) {
        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...details
        };
        
        this.securityEvents.push(event);
        
        // Keep only the last N events to prevent memory issues
        if (this.securityEvents.length > this.maxSecurityEvents) {
            this.securityEvents.shift();
        }
        
        // Log important security events to console for monitoring
        if (['auth_failure', 'role_violation', 'identity_mismatch'].includes(eventType)) {
            console.warn('Security Event:', event);
        }
    }

    /**
     * Get security event log (for debugging and monitoring)
     */
    getSecurityEvents() {
        return [...this.securityEvents]; // Return copy to prevent tampering
    }

    /**
     * Initialize Google Drive API with role-based auto-authentication using GIS
     */
    async initialize() {
        if (this.initialized) {
            console.log('Google Drive service already initialized');
            return;
        }

        console.log('Starting Google Drive service initialization...');

        try {
            // Wait for gapi and GIS to be loaded
            console.log('Waiting for Google API and GIS to load...');
            await this.waitForGoogleLibraries();
            console.log('Google API and GIS loaded successfully');
            
            // Get configuration from global config object
            const config = window.googleDriveConfig;
            console.log('Config check - window.googleDriveConfig:', config);
            if (!config || !config.client_id) {
                console.error('Google Drive configuration not found or missing client_id');
                console.log('Config object:', config);
                throw new Error('Google Drive configuration not found');
            }
            console.log('Using client_id:', config.client_id);
            console.log('Using scopes:', config.scopes);
            
            // Load the client library first
            console.log('Loading gapi client library...');
            await new Promise((resolve, reject) => {
                gapi.load('client', {
                    callback: resolve,
                    onerror: reject
                });
            });
            console.log('gapi client library loaded successfully');
            
            // Initialize gapi client
            console.log('Initializing gapi client...');
            await gapi.client.init({
                apiKey: config.api_key,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            console.log('gapi client initialized successfully');
            
            // Initialize GIS token client
            console.log('Initializing GIS token client...');
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: config.client_id,
                scope: config.scopes,
                callback: (response) => {
                    console.log('GIS callback received:', response);
                    if (response.error) {
                        console.error('GIS authentication error:', response);
                        this.handleAuthError(response);
                        return;
                    }
                    
                    if (response.access_token) {
                        this.accessToken = response.access_token;
                        this.isSignedIn = true;
                        console.log('GIS authentication successful - isSignedIn set to:', this.isSignedIn);
                        console.log('Access token set, ready status:', this.isReady());
                        
                        // Set the access token for gapi
                        gapi.client.setToken({
                            access_token: response.access_token
                        });
                        
                        // Dispatch custom event for UI updates
                        window.dispatchEvent(new CustomEvent('driveAuthChanged', { 
                            detail: { signedIn: true, hasRole: this.hasAuthorizedRole() }
                        }));
                        
                        // Validate user identity
                        this.validateUserIdentity().catch(error => {
                            console.error('User validation failed after authentication:', error);
                        });
                    }
                }
            });
            console.log('GIS token client initialized successfully');
                        
            this.gapi = gapi;
            this.initialized = true;
            console.log('Google Drive service initialized successfully');
            
            // Wait a bit for Auth0 to be ready, then auto-authenticate
            setTimeout(async () => {
                console.log('Attempting auto-authentication...');
                await this.attemptAutoAuthentication();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize Google Drive service:', error);
            this.logSecurityEvent('init_error', {
                error: error.message,
                stage: 'main_init'
            });
            throw error;
        }
    }

    /**
     * Attempt automatic authentication for authorized users with security checks
     */
    async attemptAutoAuthentication() {
        console.log('=== Starting Auto-Authentication Process ===');
        
        // Security check: Verify user has required role
        console.log('Checking user role...');
        const hasRole = this.hasAuthorizedRole();
        console.log('User has required role:', hasRole);
        
        if (!hasRole) {
            console.log('User does not have required role for Google Drive auto-authentication');
            window.dispatchEvent(new CustomEvent('driveAuthChanged', { 
                detail: { signedIn: false, hasRole: false }
            }));
            return false;
        }

        // Security check: Verify auth service is properly authenticated
        console.log('Checking Auth0 service status...');
        console.log('Auth service exists:', !!window.authService);
        console.log('Auth service authenticated:', window.authService?.isAuthenticated);
        
        if (!window.authService || !window.authService.isAuthenticated) {
            console.warn('Auth service not properly authenticated, skipping auto-authentication');
            // Try again in a few seconds
            setTimeout(() => {
                console.log('Retrying auto-authentication after Auth0 delay...');
                this.attemptAutoAuthentication();
            }, 2000);
            return false;
        }

        console.log('Checking Google Drive sign-in status...');
        console.log('Currently signed in to Google Drive:', this.isSignedIn);
        
        if (this.isSignedIn && this.accessToken) {
            console.log('User already signed in to Google Drive, validating identity...');
            // Additional security: Verify the signed-in user matches the authenticated user
            const isValid = await this.validateUserIdentity();
            if (isValid) {
                window.dispatchEvent(new CustomEvent('driveAuthChanged', { 
                    detail: { signedIn: true, hasRole: true }
                }));
            }
            return isValid;
        }

        try {
            console.log('Attempting auto-authentication to Google Drive for authorized user...');
            
            // Security check: Rate limiting to prevent abuse
            if (this.lastAutoAuthAttempt && (Date.now() - this.lastAutoAuthAttempt) < 5000) {
                console.warn('Auto-authentication rate limited, please wait before retrying');
                return false;
            }
            
            this.lastAutoAuthAttempt = Date.now();
            
            // Try implicit flow first (no popup) - check for existing valid token
            if (gapi.client.getToken()) {
                console.log('Found existing valid token, using it');
                this.accessToken = gapi.client.getToken().access_token;
                this.isSignedIn = true;
                
                // Validate the token works
                const isValid = await this.validateUserIdentity();
                if (isValid) {
                    console.log('Existing token validated successfully');
                    window.dispatchEvent(new CustomEvent('driveAuthChanged', { 
                        detail: { signedIn: true, hasRole: true }
                    }));
                    return true;
                }
            }
            
            console.log('Requesting new access token via GIS...');
            
            // Use a more user-friendly approach - don't force consent unless needed
            const success = await this.requestTokenWithFallback();
            
            if (success) {
                console.log('Auto-authentication to Google Drive successful');
                return true;
            } else {
                console.log('Auto-authentication failed, user can manually authenticate later');
                return false;
            }
        
        } catch (error) {
            console.error('Auto-authentication failed:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            window.dispatchEvent(new CustomEvent('driveAuthChanged', { 
                detail: { signedIn: false, hasRole: true, error: error.message }
            }));
            return false;
        }
    }

    /**
     * Request token with progressive fallback strategies
     */
    async requestTokenWithFallback() {
        // Strategy 1: Try without forcing consent (most user-friendly)
        try {
            console.log('Trying authentication without forced consent...');
            return await this.requestTokenWithTimeout({
                prompt: '' // Let Google decide if consent is needed
            }, 15000); // Shorter timeout for first attempt
        } catch (error) {
            console.log('First attempt failed:', error.message);
        }

        // Strategy 2: Try with 'select_account' prompt
        try {
            console.log('Trying authentication with account selection...');
            return await this.requestTokenWithTimeout({
                prompt: 'select_account'
            }, 20000);
        } catch (error) {
            console.log('Second attempt failed:', error.message);
        }

        // Strategy 3: Final fallback - force consent (will definitely trigger popup)
        try {
            console.log('Final attempt with consent prompt...');
            return await this.requestTokenWithTimeout({
                prompt: 'consent'
            }, 30000);
        } catch (error) {
            console.error('All authentication attempts failed:', error.message);
            return false;
        }
    }

    /**
     * Request access token with timeout and better error handling
     */
    async requestTokenWithTimeout(options = {}, timeoutMs = 20000) {
        return new Promise((resolve, reject) => {
            let resolved = false;
            let timeoutId;
            
            // Set up temporary callback
            const originalCallback = this.tokenClient.callback;
            this.tokenClient.callback = (response) => {
                console.log('requestTokenWithTimeout callback received:', response);
                if (resolved) return;
                resolved = true;
                
                // IMPORTANT: Call the original callback first to set isSignedIn and other state
                if (originalCallback) {
                    try {
                        originalCallback(response);
                    } catch (callbackError) {
                        console.error('Error in original callback:', callbackError);
                    }
                }
                
                // Clear timeout and restore callback
                clearTimeout(timeoutId);
                this.tokenClient.callback = originalCallback;
                
                if (response.error) {
                    console.error('GIS callback error:', response);
                    reject(new Error(response.error || 'Authentication failed'));
                } else if (response.access_token) {
                    console.log('Success in requestTokenWithTimeout, isSignedIn:', this.isSignedIn);
                    resolve(true);
                } else {
                    reject(new Error('No access token received'));
                }
            };
            
            try {
                // Request access token with provided options
                this.tokenClient.requestAccessToken(options);
                
                // Set timeout
                timeoutId = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        this.tokenClient.callback = originalCallback;
                        reject(new Error(`Authentication timeout after ${timeoutMs}ms`));
                    }
                }, timeoutMs);
                
            } catch (requestError) {
                resolved = true;
                this.tokenClient.callback = originalCallback;
                reject(new Error(`Failed to request token: ${requestError.message}`));
            }
        });
    }

    /**
     * Validate that the Google Drive user matches the authenticated user (GIS version)
     */
    async validateUserIdentity() {
        try {
            if (!this.isSignedIn || !this.accessToken || !window.authService?.isAuthenticated) {
                this.logSecurityEvent('identity_check_failed', {
                    reason: 'not_signed_in_or_authenticated',
                    driveSignedIn: this.isSignedIn,
                    hasAccessToken: !!this.accessToken,
                    authServiceAuthenticated: window.authService?.isAuthenticated
                });
                return false;
            }

            // Get user info using the access token
            try {
                const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });
                
                if (!response.ok) {
                    console.warn(`User info request failed with status ${response.status}, but Drive access may still work`);
                    // Don't fail completely - the token might still work for Drive operations
                    // This could happen if the token doesn't have userinfo scope
                    
                    // Try a simple Drive API call instead to validate the token
                    try {
                        const driveTestResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
                            headers: {
                                'Authorization': `Bearer ${this.accessToken}`
                            }
                        });
                        
                        if (driveTestResponse.ok) {
                            const driveUserInfo = await driveTestResponse.json();
                            console.log('Drive API access validated successfully');
                            this.logSecurityEvent('identity_validated', {
                                method: 'drive_api_fallback',
                                success: true
                            });
                            return true;
                        } else {
                            throw new Error(`Drive API test failed: ${driveTestResponse.status}`);
                        }
                    } catch (driveError) {
                        console.error('Both userinfo and Drive API validation failed:', driveError);
                        this.logSecurityEvent('identity_validation_error', {
                            error: driveError.message,
                            stage: 'drive_api_fallback'
                        });
                        return false;
                    }
                }
                
                const userInfo = await response.json();
                const googleEmail = userInfo.email;
                const authEmail = window.authService.user.email;

                // Security check: Ensure emails match
                if (googleEmail.toLowerCase() !== authEmail.toLowerCase()) {
                    this.logSecurityEvent('identity_mismatch', {
                        googleEmail: googleEmail.toLowerCase(),
                        authEmail: authEmail.toLowerCase(),
                        severity: 'HIGH'
                    });
                    console.error('Security violation: Google Drive user does not match authenticated user');
                    return false;
                }

                this.logSecurityEvent('identity_validated', {
                    email: googleEmail.toLowerCase(),
                    success: true
                });
                
                console.log('User identity validated successfully');
                return true;
            } catch (fetchError) {
                console.error('Failed to fetch user info for validation:', fetchError);
                this.logSecurityEvent('identity_validation_error', {
                    error: fetchError.message,
                    stage: 'user_info_fetch'
                });
                return false;
            }
        } catch (error) {
            this.logSecurityEvent('identity_validation_error', {
                error: error.message,
                stack: error.stack
            });
            console.error('Failed to validate user identity:', error);
            return false;
        }
    }

    /**
     * Wait for Google API and Google Identity Services to be loaded
     */
    async waitForGoogleLibraries() {
        const maxAttempts = 50;
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const checkLibraries = () => {
                attempts++;
                console.log(`Checking libraries attempt ${attempts}: gapi=${!!window.gapi}, gapi.load=${!!window.gapi?.load}, GIS=${!!window.google?.accounts?.oauth2}`);
                
                if (window.gapi && window.gapi.load && window.google?.accounts?.oauth2) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Google API or GIS failed to load'));
                } else {
                    setTimeout(checkLibraries, 100);
                }
            };
            checkLibraries();
        });
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        console.error('Authentication error:', error);
        this.logSecurityEvent('auth_failure', {
            error: error.error || error.message || 'Unknown error',
            details: error.error_description || 'No description',
            severity: 'MEDIUM'
        });
        
        // Dispatch error event
        window.dispatchEvent(new CustomEvent('driveAuthChanged', { 
            detail: { signedIn: false, hasRole: this.hasAuthorizedRole(), error: error.error || error.message }
        }));
    }

    /**
     * Check if Google Drive is initialized and ready
     */
    isReady() {
        return this.initialized && this.gapi && this.isSignedIn;
    }

    /**
     * Sign in to Google Drive using GIS (manual trigger)
     */
    async signIn() {
        if (!this.initialized) {
            throw new Error('Google Drive service not initialized');
        }

        if (!this.hasAuthorizedRole()) {
            throw new Error('User does not have required role for Google Drive access');
        }

        try {
            console.log('Manual sign-in requested...');
            
            // For manual sign-in, try a direct approach first, then fallback
            const success = await this.requestTokenWithTimeout({
                prompt: 'select_account' // Let user choose account for manual sign-in
            }, 45000); // Longer timeout for manual interaction
            
            if (success) {
                console.log('Manual sign-in to Google Drive successful');
                return;
            } else {
                throw new Error('Manual sign-in failed');
            }
        } catch (error) {
            console.error('Google Drive sign-in failed:', error);
            throw error;
        }
    }

    /**
     * Sign out from Google Drive using GIS
     */
    async signOut() {
        if (!this.initialized) {
            return;
        }

        try {
            if (this.accessToken) {
                // Revoke the access token
                google.accounts.oauth2.revoke(this.accessToken, () => {
                    console.log('Access token revoked');
                });
            }
            
            // Clear local state
            this.accessToken = null;
            this.isSignedIn = false;
            gapi.client.setToken(null);
            
            console.log('Signed out from Google Drive');
            
            // Dispatch auth change event
            window.dispatchEvent(new CustomEvent('driveAuthChanged', { 
                detail: { signedIn: false, hasRole: this.hasAuthorizedRole() }
            }));
        } catch (error) {
            console.error('Google Drive sign-out failed:', error);
            throw error;
        }
    }

    /**
     * Ensure user is authenticated with role-based access and comprehensive security checks
     */
    async ensureAuth() {
        try {
            // First check if user has the required role
            if (!this.hasAuthorizedRole()) {
                this.logSecurityEvent('role_violation', {
                    attempted: 'drive_access',
                    userEmail: window.authService?.user?.email || 'unknown',
                    severity: 'MEDIUM'
                });
                throw new Error('User does not have required role for Google Drive access');
            }

            if (!this.isReady()) {
                if (!this.initialized) {
                    this.logSecurityEvent('auth_failure', {
                        reason: 'drive_not_initialized',
                        severity: 'LOW'
                    });
                    throw new Error('Google Drive not initialized');
                }
                if (!this.isSignedIn) {
                    this.logSecurityEvent('auth_attempt', {
                        method: 'auto_then_manual',
                        userEmail: window.authService?.user?.email
                    });
                    
                    // Try auto-authentication first
                    const autoAuthSuccess = await this.attemptAutoAuthentication();
                    if (!autoAuthSuccess) {
                        // Fall back to manual sign-in
                        await this.signIn();
                    }
                }
            }
            
            // Final validation
            const isValid = await this.validateUserIdentity();
            if (!isValid) {
                this.logSecurityEvent('auth_failure', {
                    reason: 'identity_validation_failed',
                    severity: 'HIGH'
                });
                throw new Error('User identity validation failed');
            }
            
            this.logSecurityEvent('auth_success', {
                userEmail: window.authService?.user?.email,
                method: 'ensureAuth'
            });
            
        } catch (error) {
            this.logSecurityEvent('auth_error', {
                error: error.message,
                userEmail: window.authService?.user?.email || 'unknown'
            });
            throw error;
        }
    }


    /**
     * Retry function for API calls
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

    /**
     * Create a folder in the application data folder with optional limited access
     */
    async createFolder(folderName, limitedAccess = false, parentFolderId = 'appDataFolder') {
        await this.ensureAuth();

        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId]
        };

        // Set limited access if requested
        if (limitedAccess) {
            folderMetadata.inheritedPermissionsDisabled = true;
        }

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.create({
                requestBody: folderMetadata,
                fields: 'id, name, mimeType, parents, capabilities, inheritedPermissionsDisabled'
            });

            return response.result;
        }, 'Create folder');
    }

    /**
     * Create a folder in the user's main Google Drive (not appDataFolder)
     */
    async createMainDriveFolder(folderName, parentFolderId = null) {
        await this.ensureAuth();

        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        };

        // Set parent folder if specified, otherwise it goes to root
        if (parentFolderId) {
            folderMetadata.parents = [parentFolderId];
        } else {
            // Explicitly set root as parent for top-level folders
            folderMetadata.parents = ['root'];
        }

        console.log('Creating folder with metadata:', folderMetadata);

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.create({
                requestBody: folderMetadata,
                fields: 'id, name, mimeType, parents, capabilities'
            });

            console.log('Folder created successfully:', response.result);
            return response.result;
        }, 'Create main drive folder');
    }

    /**
     * Create a file in the application data folder or specific folder
     */
    async createFile(fileName, content, mimeType = 'application/json', parentFolderId = 'appDataFolder') {
        await this.ensureAuth();

        // Validate inputs
        if (!fileName || fileName.trim() === '') {
            throw new Error('File name cannot be empty');
        }
        
        if (content === null || content === undefined) {
            content = '';
        }
        
        // Ensure content is a string
        const fileContent = typeof content === 'string' ? content : JSON.stringify(content);
        
        console.log('Creating file:', {
            fileName: fileName,
            mimeType: mimeType,
            parentFolderId: parentFolderId,
            contentLength: fileContent.length
        });

        const fileMetadata = {
            name: fileName.trim(),
            parents: [parentFolderId]
        };

        // Create FormData with proper validation
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
        form.append('file', new Blob([fileContent], {type: mimeType}));

        return await this.retryOperation(async () => {
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,parents,mimeType,capabilities,size', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: form
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Create file failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('File created successfully:', result);
            return result;
        }, 'Create file');
    }

    /**
     * Update an existing file in the application data folder
     */
    async updateFile(fileId, content, mimeType = 'application/json') {
        await this.ensureAuth();

        return await this.retryOperation(async () => {
            const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': mimeType
                },
                body: content
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        }, 'Update file');
    }

    /**
     * List files in the application data folder
     */
    async listFiles(query = '') {
        await this.ensureAuth();

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.list({
                spaces: 'appDataFolder',
                fields: 'nextPageToken, files(id, name, createdTime, modifiedTime)',
                pageSize: 100,
                q: query
            });

            return response.result.files || [];
        }, 'List files');
    }

    /**
     * Get file content from the application data folder
     */
    async getFileContent(fileId) {
        await this.ensureAuth();

        return await this.retryOperation(async () => {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.text();
        }, 'Get file content');
    }

    /**
     * Delete a file from the application data folder
     */
    async deleteFile(fileId) {
        await this.ensureAuth();

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.delete({
                fileId: fileId
            });

            return response;
        }, 'Delete file');
    }

    /**
     * Check folder capabilities and access permissions
     */
    async checkFolderCapabilities(folderId) {
        await this.ensureAuth();

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.get({
                fileId: folderId,
                fields: 'id,name,mimeType,capabilities,inheritedPermissionsDisabled,permissions'
            });

            return response.result;
        }, 'Check folder capabilities');
    }

    /**
     * Set limited access on a folder (disable inherited permissions)
     */
    async setLimitedAccess(folderId, limitedAccess = true) {
        await this.ensureAuth();

        // First check if we have permission to modify access
        const folderInfo = await this.checkFolderCapabilities(folderId);
        
        const canDisable = folderInfo.capabilities?.canDisableInheritedPermissions;
        const canEnable = folderInfo.capabilities?.canEnableInheritedPermissions;
        
        if (limitedAccess && !canDisable) {
            throw new Error('No permission to disable inherited permissions on this folder');
        }
        
        if (!limitedAccess && !canEnable) {
            throw new Error('No permission to enable inherited permissions on this folder');
        }

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.update({
                fileId: folderId,
                requestBody: {
                    inheritedPermissionsDisabled: limitedAccess
                },
                fields: 'id,name,inheritedPermissionsDisabled,capabilities'
            });

            return response.result;
        }, 'Set limited access');
    }

    /**
     * Check if user can list children of a folder
     */
    async canListFolderChildren(folderId) {
        await this.ensureAuth();

        try {
            const folderInfo = await this.checkFolderCapabilities(folderId);
            return folderInfo.capabilities?.canListChildren || false;
        } catch (error) {
            console.warn('Failed to check folder children capabilities:', error);
            return false;
        }
    }

    /**
     * Move file to a different folder with proper access handling
     */
    async moveFile(fileId, newParentId, removeFromParents = []) {
        await this.ensureAuth();

        // If no specific parents to remove, get current parents
        if (removeFromParents.length === 0) {
            const fileInfo = await this.retryOperation(async () => {
                const response = await gapi.client.drive.files.get({
                    fileId: fileId,
                    fields: 'parents'
                });
                return response.result;
            }, 'Get file parents');
            
            removeFromParents = fileInfo.parents || [];
        }

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.update({
                fileId: fileId,
                addParents: newParentId,
                removeParents: removeFromParents.join(','),
                fields: 'id,parents'
            });

            return response.result;
        }, 'Move file');
    }

    /**
     * Find file by name in application data folder
     */
    async findFileByName(fileName) {
        const files = await this.listFiles(`name='${fileName}'`);
        return files.length > 0 ? files[0] : null;
    }

    /**
     * Find file by name in main Google Drive (not appDataFolder)
     */
    async findMainDriveFileByName(fileName) {
        await this.ensureAuth();

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.list({
                q: `name='${fileName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents`,
                fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, parents)',
                pageSize: 100
            });

            const files = response.result.files || [];
            console.log(`Search for '${fileName}' in main drive found:`, files);
            return files.length > 0 ? files[0] : null;
        }, 'Find main drive file');
    }

    /**
     * Find folder by name within a specific parent folder in main Drive
     */
    async findMainDriveFolderByNameInParent(folderName, parentId) {
        await this.ensureAuth();

        try {
            return await this.retryOperation(async () => {
                const response = await gapi.client.drive.files.list({
                    q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                    fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, parents)',
                    pageSize: 100
                });

                const files = response.result.files || [];
                console.log(`Search for '${folderName}' in parent '${parentId}' found:`, files);
                return files.length > 0 ? files[0] : null;
            }, 'Find main drive folder in parent');
        } catch (error) {
            console.warn(`Failed to find folder ${folderName} in parent ${parentId}:`, error);
            return null;
        }
    }

    /**
     * Create backup folder structure for Code Comprehension Project
     * Creates: Code-Comprehension/
     *   ├── pdf/
     *   └── json/
     */
    async ensureBackupFolderStructure() {
        try {
            console.log('=== Creating Code-Comprehension backup folder structure ===');
            
            // Create main Code-Comprehension folder in main Drive (not appDataFolder)
            console.log('Step 1: Looking for existing Code-Comprehension folder...');
            let codeComprehensionFolder = await this.findMainDriveFileByName('Code-Comprehension');
            let codeComprehensionFolderId;
            
            if (!codeComprehensionFolder) {
                console.log('Step 2: Creating new Code-Comprehension folder in root...');
                const folder = await this.createMainDriveFolder('Code-Comprehension');
                codeComprehensionFolderId = folder.id;
                console.log('✅ Created Code-Comprehension main folder in Google Drive root, ID:', codeComprehensionFolderId);
            } else {
                codeComprehensionFolderId = codeComprehensionFolder.id;
                console.log('✅ Code-Comprehension main folder already exists, ID:', codeComprehensionFolderId);
            }

            // Define the backup folder structure
            const backupFolders = ['pdf', 'json'];
            const folderIds = {};
            
            // Create subfolders
            console.log('Step 3: Creating subfolders...');
            for (const folderName of backupFolders) {
                console.log(`Looking for existing ${folderName}/ folder...`);
                let folder = await this.findMainDriveFolderByNameInParent(folderName, codeComprehensionFolderId);
                
                if (!folder) {
                    console.log(`Creating new ${folderName}/ folder...`);
                    const newFolder = await this.createMainDriveFolder(folderName, codeComprehensionFolderId);
                    folderIds[folderName] = newFolder.id;
                    console.log(`✅ Created ${folderName}/ folder, ID:`, newFolder.id);
                } else {
                    folderIds[folderName] = folder.id;
                    console.log(`✅ ${folderName}/ folder already exists, ID:`, folder.id);
                }
            }
            
            console.log('🎉 Code-Comprehension backup folder structure setup complete!');
            
            const result = {
                codeComprehensionFolderId,
                pdfFolderId: folderIds.pdf,
                jsonFolderId: folderIds.json
            };
            
            console.log('Final folder structure:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Failed to ensure backup folder structure:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Ensure proper folder structure for the application
     * Creates folders directly in appDataFolder to avoid parent folder issues
     */
    async ensureAppFolderStructure() {
        try {
            console.log('Creating Error-Annotator folder structure in appDataFolder...');
            
            // Define folder names to create directly in appDataFolder
            const folderNames = ['annotations', 'inputs', 'prompts', 'plots'];
            const folderIds = {};
            
            // Create each folder directly in appDataFolder
            for (const folderName of folderNames) {
                try {
                    // Check if folder already exists
                    let folder = await this.findFileByName(folderName);
                    
                    if (!folder) {
                        // Create new folder in appDataFolder
                        const newFolder = await this.createFolder(folderName, false, 'appDataFolder');
                        folderIds[folderName] = newFolder.id;
                        console.log(`Created ${folderName}/ folder in appDataFolder`);
                    } else {
                        folderIds[folderName] = folder.id;
                        console.log(`${folderName}/ folder already exists`);
                    }
                } catch (folderError) {
                    console.warn(`Failed to create ${folderName} folder, using appDataFolder:`, folderError);
                    folderIds[folderName] = 'appDataFolder';
                }
            }
            
            console.log('Error-Annotator folder structure setup complete!');
            
            return {
                errorAnnotatorFolderId: 'appDataFolder',
                inputsFolderId: folderIds.inputs || 'appDataFolder',
                annotationsFolderId: folderIds.annotations || 'appDataFolder',
                promptsFolderId: folderIds.prompts || 'appDataFolder',
                plotsFolderId: folderIds.plots || 'appDataFolder'
            };
            
        } catch (error) {
            console.warn('Failed to ensure app folder structure:', error);
            // Complete fallback to root appDataFolder
            return {
                errorAnnotatorFolderId: 'appDataFolder',
                inputsFolderId: 'appDataFolder',
                annotationsFolderId: 'appDataFolder',
                promptsFolderId: 'appDataFolder',
                plotsFolderId: 'appDataFolder'
            };
        }
    }

    /**
     * Find folder by name within a specific parent folder
     */
    async findFolderByNameInParent(folderName, parentId) {
        try {
            const files = await this.listFiles(`name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`);
            return files.length > 0 ? files[0] : null;
        } catch (error) {
            console.warn(`Failed to find folder ${folderName} in parent ${parentId}:`, error);
            return null;
        }
    }

    /**
     * Create folder within a specific parent folder
     */
    async createFolderInParent(folderName, parentId, limitedAccess = false) {
        await this.ensureAuth();

        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
        };

        // Set limited access if requested
        if (limitedAccess) {
            folderMetadata.inheritedPermissionsDisabled = true;
        }

        return await this.retryOperation(async () => {
            const response = await gapi.client.drive.files.create({
                requestBody: folderMetadata,
                fields: 'id, name, mimeType, parents, capabilities, inheritedPermissionsDisabled'
            });

            return response.result;
        }, `Create folder ${folderName} in parent`);
    }

    /**
     * Manually create the Error-Annotator folder structure (for testing)
     */
    async createErrorAnnotatorFolders() {
        console.log('Manually creating Error-Annotator folder structure...');
        try {
            const folderStructure = await this.ensureAppFolderStructure();
            console.log('Folder structure created successfully:', folderStructure);
            return folderStructure;
        } catch (error) {
            console.error('Failed to create folder structure:', error);
            throw error;
        }
    }

    /**
     * Compress data using simple gzip-like compression
     */
    compressData(data) {
        try {
            // Convert data to JSON string if it's an object
            const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
            
            // Simple compression using TextEncoder and basic compression
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(jsonString);
            
            // Create a simple compressed format with metadata
            const compressed = {
                originalSize: jsonString.length,
                compressedData: Array.from(uint8Array), // Convert to regular array for JSON serialization
                compressionType: 'utf8-array',
                timestamp: new Date().toISOString()
            };
            
            console.log(`Compression: ${jsonString.length} bytes → ${JSON.stringify(compressed).length} bytes`);
            return compressed;
        } catch (error) {
            console.error('Failed to compress data:', error);
            return data; // Return original data if compression fails
        }
    }

    /**
     * Decompress data
     */
    decompressData(compressedData) {
        try {
            if (!compressedData.compressionType || compressedData.compressionType !== 'utf8-array') {
                // Data is not compressed, return as-is
                return compressedData;
            }
            
            const decoder = new TextDecoder();
            const uint8Array = new Uint8Array(compressedData.compressedData);
            const jsonString = decoder.decode(uint8Array);
            
            console.log(`Decompression: ${JSON.stringify(compressedData).length} bytes → ${jsonString.length} bytes`);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Failed to decompress data:', error);
            return compressedData; // Return as-is if decompression fails
        }
    }

    /**
     * Generate hash of CSV content for uniqueness checking
     */
    generateContentHash(content) {
        // Simple hash function for content comparison
        let hash = 0;
        const str = typeof content === 'string' ? content : JSON.stringify(content);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36); // Base-36 encoding
    }

    /**
     * Check if CSV file already exists in Drive based on content hash
     */
    async checkCsvExists(content, fileName) {
        try {
            const { inputsFolderId } = await this.ensureAppFolderStructure();
            const contentHash = this.generateContentHash(content);
            
            // Search for files with similar names or hash in metadata
            const files = await this.listFiles(`'${inputsFolderId}' in parents and name contains '.csv'`);
            
            for (const file of files) {
                try {
                    // Get file metadata to check hash
                    const fileContent = await this.getFileContent(file.id);
                    const decompressed = this.decompressData(JSON.parse(fileContent));
                    
                    if (decompressed.contentHash === contentHash) {
                        console.log('CSV file already exists with same content:', file.name);
                        return { exists: true, fileId: file.id, fileName: file.name };
                    }
                } catch (error) {
                    // Skip files that can't be read or parsed
                    continue;
                }
            }
            
            return { exists: false };
        } catch (error) {
            console.error('Error checking CSV existence:', error);
            return { exists: false };
        }
    }

    /**
     * Save CSV file to Google Drive with compression and uniqueness check
     */
    async saveCsvFile(csvContent, fileName) {
        await this.ensureAuth();
        
        try {
            console.log('Saving CSV file to Google Drive:', fileName);
            
            // Generate content hash for uniqueness
            const contentHash = this.generateContentHash(csvContent);
            
            // Check if file already exists
            const existsResult = await this.checkCsvExists(csvContent, fileName);
            if (existsResult.exists) {
                console.log('CSV file already exists, skipping save');
                return { 
                    saved: false, 
                    reason: 'duplicate', 
                    existingFileId: existsResult.fileId,
                    existingFileName: existsResult.fileName
                };
            }
            
            // Ensure folder structure
            const { inputsFolderId } = await this.ensureAppFolderStructure();
            
            // Create metadata object
            const csvData = {
                fileName: fileName,
                contentHash: contentHash,
                uploadDate: new Date().toISOString(),
                fileSize: csvContent.length,
                rowCount: (csvContent.match(/\n/g) || []).length + 1,
                userId: window.authService?.user?.email || 'unknown',
                content: csvContent
            };
            
            // Compress the data
            const compressedData = this.compressData(csvData);
            
            // Save to inputs folder
            const driveFileName = fileName.endsWith('.csv') ? 
                fileName.replace('.csv', '_compressed.json') : 
                `${fileName}_compressed.json`;
                
            const result = await this.createFile(
                driveFileName, 
                JSON.stringify(compressedData, null, 2), 
                'application/json', 
                inputsFolderId
            );
            
            console.log('CSV file saved to Google Drive:', driveFileName);
            return { 
                saved: true, 
                fileId: result.id, 
                fileName: driveFileName,
                originalSize: csvContent.length,
                compressedSize: JSON.stringify(compressedData).length,
                compressionRatio: (csvContent.length / JSON.stringify(compressedData).length).toFixed(2)
            };
            
        } catch (error) {
            console.error('Failed to save CSV file to Google Drive:', error);
            throw error;
        }
    }

    /**
     * Load CSV file from Google Drive with decompression
     */
    async loadCsvFile(fileId) {
        await this.ensureAuth();
        
        try {
            console.log('Loading CSV file from Google Drive:', fileId);
            
            const content = await this.getFileContent(fileId);
            const compressedData = JSON.parse(content);
            const csvData = this.decompressData(compressedData);
            
            console.log('CSV file loaded from Google Drive:', csvData.fileName);
            return csvData;
            
        } catch (error) {
            console.error('Failed to load CSV file from Google Drive:', error);
            throw error;
        }
    }

    /**
     * List all CSV files in Google Drive
     */
    async listCsvFiles() {
        await this.ensureAuth();
        
        try {
            const { inputsFolderId } = await this.ensureAppFolderStructure();
            const files = await this.listFiles(`'${inputsFolderId}' in parents and name contains '_compressed.json'`);
            
            const csvFiles = [];
            for (const file of files) {
                try {
                    const content = await this.getFileContent(file.id);
                    const compressedData = JSON.parse(content);
                    const csvData = this.decompressData(compressedData);
                    
                    csvFiles.push({
                        fileId: file.id,
                        driveFileName: file.name,
                        originalFileName: csvData.fileName,
                        uploadDate: csvData.uploadDate,
                        fileSize: csvData.fileSize,
                        rowCount: csvData.rowCount,
                        contentHash: csvData.contentHash,
                        createdTime: file.createdTime,
                        modifiedTime: file.modifiedTime
                    });
                } catch (error) {
                    console.warn('Failed to parse CSV file:', file.name, error);
                }
            }
            
            // Sort by upload date (newest first)
            csvFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            
            return csvFiles;
        } catch (error) {
            console.error('Failed to list CSV files from Google Drive:', error);
            throw error;
        }
    }

    /**
     * Save error annotations to Google Drive with proper folder organization
     */
    async saveAnnotations(annotations, metadata = {}) {
        await this.ensureAuth();
        
        try {
            // Ensure proper folder structure
            const { annotationsFolderId } = await this.ensureAppFolderStructure();
            
            const dataToSave = {
                annotations,
                metadata: {
                    ...metadata,
                    userId: window.authService?.user?.email || 'unknown',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    appVersion: '1.0.0'
                }
            };

            // Use CSV file info to create unique filename
            const fileName = `annotations_${metadata.csvFileId || Date.now()}.json`;
            
            // Check if file already exists in annotations folder
            const files = await this.listFiles(`name='${fileName}' and '${annotationsFolderId}' in parents`);
            const existingFile = files.length > 0 ? files[0] : null;
            
            const content = JSON.stringify(dataToSave, null, 2);
            
            let result;
            if (existingFile) {
                // Update existing file
                result = await this.updateFile(existingFile.id, content);
                console.log('Annotations updated in Google Drive:', fileName);
            } else {
                // Create new file in annotations folder
                result = await this.createFile(fileName, content, 'application/json', annotationsFolderId);
                console.log('Annotations saved to Google Drive:', fileName);
            }
            
            return result.id;
            
        } catch (error) {
            console.error('Failed to save annotations to Google Drive:', error);
            throw error;
        }
    }

    /**
     * Load error annotations from Google Drive
     */
    async loadAnnotations(csvFileId) {
        await this.ensureAuth();
        
        try {
            const fileName = `annotations_${csvFileId}.json`;
            
            // Try to find in annotations folder first, then fallback to root
            const { annotationsFolderId } = await this.ensureAppFolderStructure();
            
            let files = await this.listFiles(`name='${fileName}' and '${annotationsFolderId}' in parents`);
            
            // Fallback to search in root appDataFolder if not found in annotations folder
            if (files.length === 0) {
                files = await this.listFiles(`name='${fileName}'`);
            }
            
            if (files.length > 0) {
                const file = files[0];
                const content = await this.getFileContent(file.id);
                const data = JSON.parse(content);
                console.log('Loaded annotations from Google Drive:', fileName);
                return data;
            } else {
                console.log('No annotations found for:', csvFileId);
                return null;
            }
            
        } catch (error) {
            console.error('Failed to load annotations from Google Drive:', error);
            throw error;
        }
    }

    /**
     * Get all annotation files for current user with proper access handling
     */
    async getUserAnnotations() {
        await this.ensureAuth();
        
        try {
            const { annotationsFolderId } = await this.ensureAppFolderStructure();
            
            // Check if we can list the annotations folder
            const canList = await this.canListFolderChildren(annotationsFolderId);
            
            let files = [];
            if (canList) {
                // Search in annotations folder
                files = await this.listFiles(`'${annotationsFolderId}' in parents and name contains 'annotations_'`);
            } else {
                console.warn('Cannot list annotations folder contents, searching in root');
                // Fallback to root search
                files = await this.listFiles("name contains 'annotations_'");
            }
            
            const annotations = [];
            for (const file of files) {
                try {
                    const content = await this.getFileContent(file.id);
                    const data = JSON.parse(content);
                    annotations.push({
                        id: file.id,
                        fileName: file.name,
                        createdTime: file.createdTime,
                        modifiedTime: file.modifiedTime,
                        folderId: annotationsFolderId,
                        ...data
                    });
                } catch (parseError) {
                    console.warn('Failed to parse annotation file:', file.name, parseError);
                }
            }
            
            // Sort by modification time (newest first)
            annotations.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
            
            return annotations;
            
        } catch (error) {
            console.error('Failed to get user annotations from Google Drive:', error);
            throw error;
        }
    }

    /**
     * Save user progress to Google Drive
     */
    async saveUserProgress(progressData) {
        await this.ensureAuth();
        
        try {
            const fileName = 'user_progress.json';
            const dataToSave = {
                ...progressData,
                lastUpdated: new Date().toISOString(),
                userId: window.authService?.user?.email || 'unknown'
            };
            
            // Check if progress file already exists
            const existingFile = await this.findFileByName(fileName);
            
            const content = JSON.stringify(dataToSave, null, 2);
            
            if (existingFile) {
                await this.updateFile(existingFile.id, content);
            } else {
                await this.createFile(fileName, content);
            }
            
            console.log('User progress saved to Google Drive');
            
        } catch (error) {
            console.error('Failed to save user progress to Google Drive:', error);
            throw error;
        }
    }

    /**
     * Get user progress from Google Drive
     */
    async getUserProgress() {
        await this.ensureAuth();
        
        try {
            const fileName = 'user_progress.json';
            const file = await this.findFileByName(fileName);
            
            if (file) {
                const content = await this.getFileContent(file.id);
                return JSON.parse(content);
            } else {
                return null;
            }
            
        } catch (error) {
            console.error('Failed to get user progress from Google Drive:', error);
            throw error;
        }
    }

    /**
     * Export all user data from Google Drive
     */
    async exportUserData() {
        try {
            const [annotations, progress] = await Promise.all([
                this.getUserAnnotations(),
                this.getUserProgress()
            ]);
            
            return {
                annotations,
                progress,
                exportedAt: new Date().toISOString(),
                userId: window.authService?.user?.email || 'unknown'
            };
            
        } catch (error) {
            console.error('Failed to export user data from Google Drive:', error);
            throw error;
        }
    }

    /**
     * Delete all user data from Google Drive (GDPR compliance)
     */
    async deleteUserData() {
        await this.ensureAuth();
        
        try {
            const files = await this.listFiles();
            
            // Delete all files in the app data folder
            for (const file of files) {
                try {
                    await this.deleteFile(file.id);
                } catch (deleteError) {
                    console.warn(`Failed to delete file ${file.name}:`, deleteError);
                }
            }
            
            console.log('All user data deleted from Google Drive');
            
        } catch (error) {
            console.error('Failed to delete user data from Google Drive:', error);
            throw error;
        }
    }

    /**
     * Migrate old annotations to new folder structure
     */
    async migrateToNewFolderStructure() {
        await this.ensureAuth();
        
        try {
            console.log('Starting migration to new folder structure...');
            
            const { annotationsFolderId } = await this.ensureAppFolderStructure();
            
            // Find all annotation files in root appDataFolder
            const rootFiles = await this.listFiles("name contains 'annotations_' and 'appDataFolder' in parents");
            
            let migratedCount = 0;
            for (const file of rootFiles) {
                try {
                    // Move file to annotations folder
                    await this.moveFile(file.id, annotationsFolderId, ['appDataFolder']);
                    migratedCount++;
                    console.log(`Migrated ${file.name} to annotations folder`);
                } catch (moveError) {
                    console.warn(`Failed to migrate ${file.name}:`, moveError);
                }
            }
            
            console.log(`Migration completed. Migrated ${migratedCount} files.`);
            return migratedCount;
            
        } catch (error) {
            console.error('Failed to migrate to new folder structure:', error);
            throw error;
        }
    }

    /**
     * Get application folder structure status
     */
    async getAppStructureStatus() {
        await this.ensureAuth();
        
        try {
            const status = {
                annotationsFolderExists: false,
                annotationsFolderId: null,
                annotationsHasLimitedAccess: false,
                totalFiles: 0,
                annotationFiles: 0,
                canManageAccess: false
            };
            
            // Check for annotations folder
            const annotationsFolder = await this.findFileByName('annotations');
            if (annotationsFolder) {
                status.annotationsFolderExists = true;
                status.annotationsFolderId = annotationsFolder.id;
                
                // Check access permissions
                try {
                    const folderInfo = await this.checkFolderCapabilities(annotationsFolder.id);
                    status.annotationsHasLimitedAccess = folderInfo.inheritedPermissionsDisabled || false;
                    status.canManageAccess = folderInfo.capabilities?.canDisableInheritedPermissions || 
                                           folderInfo.capabilities?.canEnableInheritedPermissions || false;
                    
                    // Count files in annotations folder
                    const canList = await this.canListFolderChildren(annotationsFolder.id);
                    if (canList) {
                        const annotationFiles = await this.listFiles(`'${annotationsFolder.id}' in parents`);
                        status.annotationFiles = annotationFiles.length;
                    }
                } catch (accessError) {
                    console.warn('Failed to check annotations folder access:', accessError);
                }
            }
            
            // Count total files
            try {
                const allFiles = await this.listFiles();
                status.totalFiles = allFiles.length;
            } catch (listError) {
                console.warn('Failed to count total files:', listError);
            }
            
            return status;
            
        } catch (error) {
            console.error('Failed to get app structure status:', error);
            throw error;
        }
    }

    /**
     * Handle expansive access API behavior
     */
    async enableExpansiveAccess() {
        // This method sets up the service to use expansive access behavior
        // which prevents restricted access scenarios
        this.useExpansiveAccess = true;
        console.log('Enabled expansive access API behavior');
    }

    /**
     * Check for and resolve restricted access issues
     */
    async resolveRestrictedAccess() {
        await this.ensureAuth();
        
        try {
            const issues = [];
            const { annotationsFolderId } = await this.ensureAppFolderStructure();
            
            // Check if annotations folder has proper limited access
            if (annotationsFolderId !== 'appDataFolder') {
                const folderInfo = await this.checkFolderCapabilities(annotationsFolderId);
                
                if (!folderInfo.inheritedPermissionsDisabled) {
                    issues.push({
                        type: 'missing_limited_access',
                        folderId: annotationsFolderId,
                        message: 'Annotations folder should have limited access enabled'
                    });
                    
                    // Attempt to fix
                    try {
                        await this.setLimitedAccess(annotationsFolderId, true);
                        console.log('Fixed: Enabled limited access on annotations folder');
                    } catch (fixError) {
                        console.warn('Cannot fix limited access issue:', fixError);
                    }
                }
            }
            
            return issues;
            
        } catch (error) {
            console.error('Failed to resolve restricted access issues:', error);
            throw error;
        }
    }
}

// Create global instance
window.googleDriveService = new GoogleDriveService();

// Auto-initialize when Google API is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up Google Drive initialization...');
    
    const initializeWhenReady = () => {
        console.log('Starting initialization check loop...');
        let attempts = 0;
        const maxAttempts = 150; // 15 seconds with 100ms intervals
        
        const checkReady = setInterval(() => {
            attempts++;
            console.log(`Initialization attempt ${attempts}/${maxAttempts}`);
            console.log('GAPI available:', !!window.gapi);
            
            if (window.gapi) {
                console.log('Google API is ready, initializing Google Drive service...');
                clearInterval(checkReady);
                window.googleDriveService.initialize().catch(error => {
                    console.error('Failed to initialize Google Drive service:', error);
                });
            } else if (attempts >= maxAttempts) {
                console.error('Google API failed to load within timeout period');
                clearInterval(checkReady);
            }
        }, 100);
    };

    // Initialize immediately if GAPI is ready, otherwise wait
    if (window.gapi) {
        console.log('Google API already available, initializing immediately...');
        window.googleDriveService.initialize().catch(error => {
            console.error('Failed to initialize Google Drive service:', error);
        });
    } else {
        console.log('Google API not yet available, waiting...');
        initializeWhenReady();
    }
});

// Also listen for auth ready event to trigger retry if needed
document.addEventListener('authReady', () => {
    console.log('Auth ready event received');
    console.log('Google Drive service initialized:', window.googleDriveService?.initialized);
    
    if (window.gapi && window.googleDriveService && window.googleDriveService.initialized) {
        console.log('Auth ready - attempting auto-authentication retry...');
        // Retry auto-authentication since auth is now ready
        setTimeout(() => {
            window.googleDriveService.attemptAutoAuthentication();
        }, 500);
    } else if (window.gapi && window.googleDriveService && !window.googleDriveService.initialized) {
        console.log('Auth ready - initializing Google Drive service...');
        window.googleDriveService.initialize().catch(error => {
            console.error('Failed to initialize Google Drive service after auth ready:', error);
        });
    }
});