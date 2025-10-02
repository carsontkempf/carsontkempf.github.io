/**
 * Annotation Drive Service
 * Handles uploading JSON annotations to Google Sheets and PDF files to Google Drive
 * Extends the existing Google Drive and Sheets services for annotation workflows
 */
class AnnotationDriveService {
    constructor() {
        this.initialized = false;
        this.projectFolderId = null;
        this.jsonFolderId = null;
        this.pdfFolderId = null;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Initialize the annotation service
     */
    async initialize() {
        if (this.initialized) {
            console.log('Annotation Drive service already initialized');
            return;
        }

        try {
            // Wait for dependencies
            await this.waitForServices();
            
            // Create folder structure
            await this.ensureAnnotationFolderStructure();
            
            this.initialized = true;
            console.log('Annotation Drive service initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Annotation Drive service:', error);
            throw error;
        }
    }

    /**
     * Wait for required services to be ready
     */
    async waitForServices() {
        const maxAttempts = 50;
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const checkServices = () => {
                attempts++;
                
                const driveReady = window.googleDriveService && window.googleDriveService.isReady();
                const sheetsReady = window.googleSheetsService && window.googleSheetsService.initialized;
                
                if (driveReady && sheetsReady) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Required services failed to initialize'));
                } else {
                    setTimeout(checkServices, 200);
                }
            };
            checkServices();
        });
    }

    /**
     * Ensure authentication
     */
    async ensureAuth() {
        await window.googleDriveService.ensureAuth();
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
                
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
    }

    /**
     * Create folder structure for annotations project
     * Creates: Annotations Project/
     *   ├── JSON Sheets/
     *   └── PDF Files/
     */
    async ensureAnnotationFolderStructure() {
        try {
            await this.ensureAuth();
            
            console.log('Creating annotation project folder structure...');
            
            // Create main project folder
            console.log('Creating main Annotations Project folder...');
            let projectFolder = await window.googleDriveService.findMainDriveFileByName('Annotations Project');
            
            if (!projectFolder) {
                projectFolder = await window.googleDriveService.createMainDriveFolder('Annotations Project');
                console.log('Created Annotations Project folder:', projectFolder.id);
            } else {
                console.log('Annotations Project folder already exists:', projectFolder.id);
            }
            
            this.projectFolderId = projectFolder.id;

            // Create JSON Sheets subfolder
            console.log('Creating JSON Sheets subfolder...');
            let jsonFolder = await window.googleDriveService.findMainDriveFolderByNameInParent(
                'JSON Sheets', 
                this.projectFolderId
            );
            
            if (!jsonFolder) {
                jsonFolder = await window.googleDriveService.createMainDriveFolder(
                    'JSON Sheets', 
                    this.projectFolderId
                );
                console.log('Created JSON Sheets folder:', jsonFolder.id);
            } else {
                console.log('JSON Sheets folder already exists:', jsonFolder.id);
            }
            
            this.jsonFolderId = jsonFolder.id;

            // Create PDF Files subfolder
            console.log('Creating PDF Files subfolder...');
            let pdfFolder = await window.googleDriveService.findMainDriveFolderByNameInParent(
                'PDF Files', 
                this.projectFolderId
            );
            
            if (!pdfFolder) {
                pdfFolder = await window.googleDriveService.createMainDriveFolder(
                    'PDF Files', 
                    this.projectFolderId
                );
                console.log('Created PDF Files folder:', pdfFolder.id);
            } else {
                console.log('PDF Files folder already exists:', pdfFolder.id);
            }
            
            this.pdfFolderId = pdfFolder.id;

            console.log('Annotation folder structure ready:', {
                projectFolderId: this.projectFolderId,
                jsonFolderId: this.jsonFolderId,
                pdfFolderId: this.pdfFolderId
            });

            return {
                projectFolderId: this.projectFolderId,
                jsonFolderId: this.jsonFolderId,
                pdfFolderId: this.pdfFolderId
            };

        } catch (error) {
            console.error('Failed to create annotation folder structure:', error);
            throw error;
        }
    }

    /**
     * Upload PDF file to Google Drive
     */
    async uploadPdfFile(file, filename = null, metadata = {}) {
        try {
            await this.ensureAuth();
            
            if (!this.initialized) {
                await this.initialize();
            }

            const fileName = filename || file.name || 'annotation.pdf';
            
            console.log('Uploading PDF file:', fileName);

            // Validate file type
            if (file.type !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
                throw new Error('File must be a PDF');
            }

            // Create file metadata
            const fileMetadata = {
                name: fileName,
                parents: [this.pdfFolderId],
                description: metadata.description || 'Uploaded PDF annotation file'
            };

            // Upload using multipart upload for files under 5MB
            if (file.size <= 5 * 1024 * 1024) {
                return await this.uploadPdfMultipart(fileMetadata, file, metadata);
            } else {
                return await this.uploadPdfResumable(fileMetadata, file, metadata);
            }

        } catch (error) {
            console.error('Failed to upload PDF file:', error);
            throw error;
        }
    }

    /**
     * Upload PDF using multipart upload (for files ≤ 5MB)
     */
    async uploadPdfMultipart(fileMetadata, file, metadata) {
        return await this.retryOperation(async () => {
            // Create FormData for multipart upload
            const form = new FormData();
            
            // Add metadata
            form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {
                type: 'application/json'
            }));
            
            // Add file data
            form.append('file', file);

            const response = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,parents,size,createdTime,webViewLink',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${window.googleDriveService.accessToken}`
                    },
                    body: form
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            
            console.log('PDF uploaded successfully:', result);
            
            return {
                id: result.id,
                name: result.name,
                size: result.size,
                createdTime: result.createdTime,
                webViewLink: result.webViewLink,
                driveViewLink: `https://drive.google.com/file/d/${result.id}/view`,
                folderId: this.pdfFolderId,
                folderName: 'PDF Files',
                uploadMethod: 'multipart',
                metadata: metadata
            };

        }, 'PDF multipart upload');
    }

    /**
     * Upload PDF using resumable upload (for files > 5MB)
     */
    async uploadPdfResumable(fileMetadata, file, metadata) {
        try {
            // Step 1: Initiate resumable upload
            const initResponse = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${window.googleDriveService.accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Upload-Content-Type': 'application/pdf',
                        'X-Upload-Content-Length': file.size.toString()
                    },
                    body: JSON.stringify(fileMetadata)
                }
            );

            if (!initResponse.ok) {
                throw new Error(`Failed to initiate resumable upload: ${initResponse.status}`);
            }

            const uploadUrl = initResponse.headers.get('Location');
            if (!uploadUrl) {
                throw new Error('No upload URL received from resumable upload initiation');
            }

            // Step 2: Upload the file content
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Length': file.size.toString()
                },
                body: file
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload file content: ${uploadResponse.status}`);
            }

            const result = await uploadResponse.json();
            
            console.log('PDF uploaded successfully (resumable):', result);
            
            return {
                id: result.id,
                name: result.name,
                size: result.size,
                createdTime: result.createdTime,
                webViewLink: result.webViewLink,
                driveViewLink: `https://drive.google.com/file/d/${result.id}/view`,
                folderId: this.pdfFolderId,
                folderName: 'PDF Files',
                uploadMethod: 'resumable',
                metadata: metadata
            };

        } catch (error) {
            console.error('Resumable upload failed:', error);
            throw error;
        }
    }

    /**
     * Save JSON annotation data to Google Sheets
     */
    async saveJsonAnnotationToSheets(jsonData, filename = null, metadata = {}) {
        try {
            await this.ensureAuth();
            
            if (!this.initialized) {
                await this.initialize();
            }

            const sheetTitle = filename ? 
                filename.replace(/\.json$/i, '') + ' - Annotations' : 
                `Annotations ${new Date().toISOString().split('T')[0]}`;

            console.log('Saving JSON annotations to Google Sheets:', sheetTitle);

            // Use existing sheets service to import JSON
            const result = await window.googleSheetsService.importJsonToSheets(jsonData, {
                spreadsheetTitle: sheetTitle,
                folderId: this.jsonFolderId,
                applyFormatting: true,
                sheetName: 'Annotations'
            });

            console.log('JSON annotations saved to Google Sheets:', result);

            return {
                ...result,
                folderId: this.jsonFolderId,
                folderName: 'JSON Sheets',
                dataType: 'json_annotations',
                metadata: metadata
            };

        } catch (error) {
            console.error('Failed to save JSON annotations to Sheets:', error);
            throw error;
        }
    }

    /**
     * Upload both JSON and PDF files as a complete annotation set
     */
    async uploadAnnotationSet(jsonData, pdfFile, setName = null, metadata = {}) {
        try {
            await this.ensureAuth();
            
            if (!this.initialized) {
                await this.initialize();
            }

            const baseName = setName || `Annotation Set ${new Date().toISOString().split('T')[0]}`;
            
            console.log('Uploading complete annotation set:', baseName);

            const results = {
                setName: baseName,
                timestamp: new Date().toISOString(),
                success: true,
                errors: []
            };

            // Upload JSON to Sheets
            try {
                console.log('Uploading JSON annotations...');
                const jsonResult = await this.saveJsonAnnotationToSheets(
                    jsonData, 
                    baseName + '.json',
                    { ...metadata, setName: baseName, type: 'json_annotations' }
                );
                results.jsonSheet = jsonResult;
                console.log('✅ JSON annotations uploaded successfully');
            } catch (jsonError) {
                console.error('❌ JSON upload failed:', jsonError);
                results.errors.push(`JSON upload failed: ${jsonError.message}`);
                results.success = false;
            }

            // Upload PDF to Drive
            try {
                console.log('Uploading PDF file...');
                const pdfResult = await this.uploadPdfFile(
                    pdfFile,
                    baseName + '.pdf',
                    { ...metadata, setName: baseName, type: 'pdf_annotation' }
                );
                results.pdfFile = pdfResult;
                console.log('✅ PDF file uploaded successfully');
            } catch (pdfError) {
                console.error('❌ PDF upload failed:', pdfError);
                results.errors.push(`PDF upload failed: ${pdfError.message}`);
                results.success = false;
            }

            // Store set metadata
            results.metadata = {
                ...metadata,
                projectFolderId: this.projectFolderId,
                jsonFolderId: this.jsonFolderId,
                pdfFolderId: this.pdfFolderId,
                uploadedBy: window.authService?.user?.email || 'unknown',
                userAgent: navigator.userAgent
            };

            // Save set record to localStorage for tracking
            this.saveAnnotationSetRecord(results);

            console.log('Annotation set upload completed:', results);
            return results;

        } catch (error) {
            console.error('Failed to upload annotation set:', error);
            throw error;
        }
    }

    /**
     * Save annotation set record for tracking
     */
    saveAnnotationSetRecord(setResult) {
        try {
            const records = JSON.parse(localStorage.getItem('annotationSets') || '[]');
            
            const record = {
                id: Date.now(),
                setName: setResult.setName,
                timestamp: setResult.timestamp,
                success: setResult.success,
                jsonSheetId: setResult.jsonSheet?.spreadsheetId,
                jsonSheetUrl: setResult.jsonSheet?.spreadsheetUrl,
                pdfFileId: setResult.pdfFile?.id,
                pdfFileUrl: setResult.pdfFile?.webViewLink,
                errors: setResult.errors,
                metadata: setResult.metadata
            };

            records.unshift(record);
            
            // Keep only last 50 records
            const trimmedRecords = records.slice(0, 50);
            
            localStorage.setItem('annotationSets', JSON.stringify(trimmedRecords));
            
        } catch (error) {
            console.warn('Failed to save annotation set record:', error);
        }
    }

    /**
     * Get annotation set history
     */
    getAnnotationSetHistory() {
        try {
            return JSON.parse(localStorage.getItem('annotationSets') || '[]');
        } catch (error) {
            console.warn('Failed to get annotation set history:', error);
            return [];
        }
    }

    /**
     * Clear annotation set history
     */
    clearAnnotationSetHistory() {
        localStorage.removeItem('annotationSets');
    }

    /**
     * Get folder structure information
     */
    getFolderStructure() {
        return {
            initialized: this.initialized,
            projectFolderId: this.projectFolderId,
            jsonFolderId: this.jsonFolderId,
            pdfFolderId: this.pdfFolderId,
            projectFolderUrl: this.projectFolderId ? 
                `https://drive.google.com/drive/folders/${this.projectFolderId}` : null,
            jsonFolderUrl: this.jsonFolderId ? 
                `https://drive.google.com/drive/folders/${this.jsonFolderId}` : null,
            pdfFolderUrl: this.pdfFolderId ? 
                `https://drive.google.com/drive/folders/${this.pdfFolderId}` : null
        };
    }

    /**
     * Check if service is ready
     */
    isReady() {
        return this.initialized && 
               window.googleDriveService && 
               window.googleDriveService.isReady() &&
               window.googleSheetsService && 
               window.googleSheetsService.initialized;
    }

    /**
     * Validate file before upload
     */
    validatePdfFile(file) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };

        // Check file type
        if (file.type !== 'application/pdf') {
            validation.errors.push('File must be a PDF document');
            validation.valid = false;
        }

        // Check file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            validation.errors.push('File size must be less than 100MB');
            validation.valid = false;
        }

        // Warnings for large files
        if (file.size > 10 * 1024 * 1024) { // 10MB
            validation.warnings.push('Large file detected. Upload may take some time.');
        }

        return validation;
    }

    /**
     * Get upload progress (for resumable uploads)
     */
    async getUploadProgress(uploadUrl) {
        try {
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Range': '*/*'
                }
            });

            if (response.status === 308) {
                const range = response.headers.get('Range');
                if (range) {
                    const match = range.match(/bytes=0-(\d+)/);
                    if (match) {
                        return parseInt(match[1]) + 1;
                    }
                }
                return 0;
            }

            return null; // Upload complete or error
        } catch (error) {
            console.error('Failed to get upload progress:', error);
            return null;
        }
    }

    /**
     * Generates a breakdown of annotations by category.
     * @param {Array} annotations - The array of annotation objects.
     * @returns {Object} An object with category counts.
     */
    getCategoryBreakdown(annotations) {
        if (!annotations || !Array.isArray(annotations)) {
            console.warn('getCategoryBreakdown received invalid input');
            return {};
        }
        console.log('Generating category breakdown...');
        return annotations.reduce((acc, annotation) => {
            const category = annotation.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Generates comprehensive chart data from annotations.
     * @param {Array} annotations - The array of annotation objects.
     * @returns {Object} An object containing various chart data points.
     */
    generateChartData(annotations) {
        if (!annotations) return {};
        console.log('Generating chart data...');
        const errorBreakdown = this.getCategoryBreakdown(annotations);
        // You can add more data generation logic here in the future
        return {
            errorBreakdown,
            totalAnnotations: annotations.length,
            // timeAnalysis: {}, // Placeholder for future analysis
        };
    }
}

// Create global instance
window.annotationDriveService = new AnnotationDriveService();

// Auto-initialize when dependencies are ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Setting up Annotation Drive service initialization...');
    
    const initializeAnnotationService = () => {
        let attempts = 0;
        const maxAttempts = 100;
        
        const checkReady = setInterval(() => {
            attempts++;
            
            const driveReady = window.googleDriveService && window.googleDriveService.initialized;
            const sheetsReady = window.googleSheetsService && window.googleSheetsService.initialized;
            
            if (driveReady && sheetsReady) {
                console.log('Dependencies ready, initializing Annotation Drive service...');
                clearInterval(checkReady);
                window.annotationDriveService.initialize().catch(error => {
                    console.error('Failed to initialize Annotation Drive service:', error);
                });
            } else if (attempts >= maxAttempts) {
                console.warn('Annotation Drive service initialization timeout');
                clearInterval(checkReady);
            }
        }, 300);
    };

    initializeAnnotationService();
});

// Listen for auth changes
window.addEventListener('driveAuthChanged', (event) => {
    if (event.detail.signedIn && !window.annotationDriveService.initialized) {
        console.log('Drive auth ready, initializing Annotation Drive service...');
        window.annotationDriveService.initialize().catch(error => {
            console.error('Failed to initialize Annotation Drive service after auth:', error);
        });
    }
});