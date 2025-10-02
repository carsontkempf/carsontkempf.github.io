/**
 * Google Picker Service for Code Comprehension Project
 * A reliable alternative to the problematic Google Drive API direct folder creation
 * Uses Google Picker API for file selection and uploads
 */
class GooglePickerService {
    constructor() {
        this.initialized = false;
        this.pickerInited = false;
        this.gisInited = false;
        this.accessToken = null;
        this.tokenClient = null;
        this.isSignedIn = false;
        this.config = null;
    }

    /**
     * Check if user has required role for Google Picker access
     */
    hasAuthorizedRole() {
        if (!window.authService || !window.authService.isAuthenticated) {
            return false;
        }

        const user = window.authService.user;
        if (!user) return false;
        
        // Check user roles (same logic as Drive service)
        const customRoles = user['https://carsontkempf.github.io/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        const rolesArray = user.roles || [];
        const authorizationRoles = user.authorization?.roles || [];
        const orgRoles = user['org_roles'] || [];
        const realmRoles = user['realm_roles'] || [];
        
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, 
                         ...userMetadataRoles, ...rolesArray, ...authorizationRoles, 
                         ...orgRoles, ...realmRoles];
        
        const hasAdminRole = allRoles.includes('admin');
        const hasCodeComprehensionRole = allRoles.includes('code-comprehension') || 
                                        allRoles.includes('Code-Comprehension-Project') || 
                                        allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
        
        const authorizedEmails = [
            'mifqk@umsystem.edu',
            'carsontkempf@gmail.com', 
            'ctkfdp@umsystem.edu',
            'pejbvy@umsystem.edu',
            'richardson.leah1@gmail.com'
        ];
        
        const isAuthorizedUser = authorizedEmails.includes(user.email?.toLowerCase());
        
        return hasAdminRole || hasCodeComprehensionRole || isAuthorizedUser;
    }

    /**
     * Initialize Google Picker API
     */
    async initialize() {
        if (this.initialized) {
            console.log('Google Picker service already initialized');
            return;
        }

        console.log('Starting Google Picker service initialization...');

        try {
            // Wait for secure configuration
            await this.waitForSecureConfig();
            
            // Get configuration
            this.config = window.envConfig.getGoogleDriveConfig();
            if (!this.config || !this.config.client_id) {
                throw new Error('Google Picker configuration not found');
            }

            // Wait for Google libraries to load
            await this.waitForGoogleLibraries();
            
            this.initialized = true;
            console.log('Google Picker service initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Google Picker service:', error);
            throw error;
        }
    }

    /**
     * Wait for Google API and GIS libraries
     */
    async waitForGoogleLibraries() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkLibraries = () => {
                attempts++;
                console.log(`Checking Picker libraries attempt ${attempts}: gapi=${!!window.gapi}, GIS=${!!window.google?.accounts?.oauth2}, picker=${!!window.google?.picker}`);
                
                if (window.gapi && window.google?.accounts?.oauth2) {
                    // Load picker library
                    gapi.load('client:picker', () => {
                        this.pickerInited = true;
                        this.gisInited = true;
                        resolve();
                    });
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Google libraries failed to load'));
                } else {
                    setTimeout(checkLibraries, 100);
                }
            };
            checkLibraries();
        });
    }

    /**
     * Wait for secure configuration
     */
    async waitForSecureConfig() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkConfig = () => {
                attempts++;
                if (window.envConfig && window.envConfig.isReady()) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Secure configuration failed to load'));
                } else {
                    setTimeout(checkConfig, 100);
                }
            };
            checkConfig();
        });
    }

    /**
     * Ensure user is authenticated
     */
    async ensureAuth() {
        if (!this.hasAuthorizedRole()) {
            throw new Error('User does not have required role for Google Picker access');
        }

        if (!this.initialized) {
            await this.initialize();
        }

        if (!this.isSignedIn) {
            await this.signIn();
        }
    }

    /**
     * Sign in to Google and get access token
     */
    async signIn() {
        return new Promise((resolve, reject) => {
            if (!this.config) {
                reject(new Error('Google Picker not initialized'));
                return;
            }

            // Initialize token client if not already done
            if (!this.tokenClient) {
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.config.client_id,
                    scope: this.config.scopes,
                    callback: (response) => {
                        if (response.error !== undefined) {
                            console.error('Google Picker auth error:', response);
                            reject(new Error(response.error));
                            return;
                        }
                        
                        this.accessToken = response.access_token;
                        this.isSignedIn = true;
                        console.log('Google Picker authentication successful');
                        
                        // Dispatch auth change event
                        window.dispatchEvent(new CustomEvent('pickerAuthChanged', { 
                            detail: { signedIn: true, hasRole: this.hasAuthorizedRole() }
                        }));
                        
                        resolve();
                    }
                });
            }

            // Request access token
            if (this.accessToken === null) {
                this.tokenClient.requestAccessToken({prompt: 'consent'});
            } else {
                this.tokenClient.requestAccessToken({prompt: ''});
            }
        });
    }

    /**
     * Sign out from Google Picker
     */
    signOut() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken);
            this.accessToken = null;
            this.isSignedIn = false;
            
            window.dispatchEvent(new CustomEvent('pickerAuthChanged', { 
                detail: { signedIn: false, hasRole: this.hasAuthorizedRole() }
            }));
        }
    }

    /**
     * Create and show a folder picker for uploads
     */
    async createFolderPicker() {
        await this.ensureAuth();

        return new Promise((resolve, reject) => {
            try {
                const picker = new google.picker.PickerBuilder()
                    .addView(google.picker.ViewId.FOLDERS)
                    .setOAuthToken(this.accessToken)
                    .setDeveloperKey(this.config.api_key)
                    .setAppId('53684428529')
                    .setCallback((data) => this.handleFolderPickerCallback(data, resolve, reject))
                    .setTitle('Select or Create a Folder for Code Comprehension Data')
                    .enableFeature(google.picker.Feature.NAV_HIDDEN)
                    .build();
                
                picker.setVisible(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Create and show an upload picker
     */
    async createUploadPicker(targetFolderId = null) {
        await this.ensureAuth();

        return new Promise((resolve, reject) => {
            try {
                const uploadView = new google.picker.DocsUploadView();
                if (targetFolderId) {
                    uploadView.setParent(targetFolderId);
                }

                const picker = new google.picker.PickerBuilder()
                    .addView(uploadView)
                    .setOAuthToken(this.accessToken)
                    .setDeveloperKey(this.config.api_key)
                    .setAppId('53684428529')
                    .setCallback((data) => this.handleUploadPickerCallback(data, resolve, reject))
                    .setTitle('Upload Files to Google Drive')
                    .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                    .build();
                
                picker.setVisible(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Handle folder picker callback
     */
    handleFolderPickerCallback(data, resolve, reject) {
        if (data.action === google.picker.Action.PICKED) {
            const folder = data[google.picker.Response.DOCUMENTS][0];
            const folderId = folder[google.picker.Document.ID];
            const folderName = folder[google.picker.Document.NAME];
            
            console.log('Folder selected:', folderName, folderId);
            resolve({ id: folderId, name: folderName, url: folder[google.picker.Document.URL] });
            
        } else if (data.action === google.picker.Action.CANCEL) {
            resolve(null);
        } else {
            reject(new Error('Unexpected picker action'));
        }
    }

    /**
     * Handle upload picker callback
     */
    handleUploadPickerCallback(data, resolve, reject) {
        if (data.action === google.picker.Action.PICKED) {
            const files = data[google.picker.Response.DOCUMENTS];
            const uploadedFiles = files.map(file => ({
                id: file[google.picker.Document.ID],
                name: file[google.picker.Document.NAME],
                url: file[google.picker.Document.URL],
                mimeType: file[google.picker.Document.MIME_TYPE]
            }));
            
            console.log('Files uploaded:', uploadedFiles);
            resolve(uploadedFiles);
            
        } else if (data.action === google.picker.Action.CANCEL) {
            resolve([]);
        } else {
            reject(new Error('Unexpected picker action'));
        }
    }

    /**
     * Upload file content directly using Drive API (simpler approach)
     */
    async uploadFileContent(fileName, content, mimeType = 'application/json', parentFolderId = null) {
        await this.ensureAuth();

        const metadata = {
            name: fileName,
            parents: parentFolderId ? [parentFolderId] : undefined
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', new Blob([content], {type: mimeType}));

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            },
            body: form
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('File uploaded successfully:', result);
        return result;
    }

    /**
     * Save annotation data using the picker approach
     */
    async saveAnnotationData(annotationData, csvMetadata) {
        try {
            console.log('Starting annotation data save with Google Picker...');
            
            // First, let user select or create a folder
            const folder = await this.createFolderPicker();
            
            if (!folder) {
                console.log('User cancelled folder selection');
                return { cancelled: true };
            }

            console.log('Using folder:', folder.name, folder.id);

            // Create the annotation file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `error-annotations-${timestamp}.json`;
            
            const fileData = {
                metadata: {
                    created: new Date().toISOString(),
                    csvFile: csvMetadata?.name || 'unknown',
                    totalAnnotations: Object.keys(annotationData).length,
                    tool: 'Code Comprehension Error Annotator'
                },
                annotations: annotationData
            };

            const uploadedFile = await this.uploadFileContent(
                fileName,
                JSON.stringify(fileData, null, 2),
                'application/json',
                folder.id
            );

            return {
                success: true,
                folder: folder,
                file: uploadedFile,
                fileName: fileName
            };

        } catch (error) {
            console.error('Failed to save annotation data:', error);
            throw error;
        }
    }

    /**
     * Check if picker is ready
     */
    isReady() {
        return this.initialized && this.pickerInited && this.gisInited && this.isSignedIn;
    }
}

// Create global instance
window.googlePickerService = new GooglePickerService();

// Auto-initialize when libraries are loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up Google Picker initialization...');
    
    const initializeWhenReady = () => {
        let attempts = 0;
        const maxAttempts = 100;
        
        const checkReady = setInterval(() => {
            attempts++;
            
            if (window.gapi && window.google?.accounts?.oauth2) {
                console.log('Google libraries ready, initializing Picker service...');
                clearInterval(checkReady);
                window.googlePickerService.initialize().catch(error => {
                    console.error('Failed to initialize Google Picker service:', error);
                });
            } else if (attempts >= maxAttempts) {
                console.error('Google libraries failed to load within timeout');
                clearInterval(checkReady);
            }
        }, 100);
    };

    // Initialize immediately if libraries are ready, otherwise wait
    if (window.gapi && window.google?.accounts?.oauth2) {
        console.log('Google libraries already available, initializing immediately...');
        window.googlePickerService.initialize().catch(error => {
            console.error('Failed to initialize Google Picker service:', error);
        });
    } else {
        console.log('Google libraries not yet available, waiting...');
        initializeWhenReady();
    }
});