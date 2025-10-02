/**
 * Google Sheets Service for JSON Import
 * Handles Google Sheets API operations for automatic JSON to spreadsheet conversion
 * Integrates with existing Google Drive authentication system
 */
class GoogleSheetsService {
    constructor() {
        this.initialized = false;
        this.gapi = null;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Initialize Google Sheets API using existing Google Drive authentication
     */
    async initialize() {
        if (this.initialized) {
            console.log('Google Sheets service already initialized');
            return;
        }

        try {
            // Wait for Google Drive service to be initialized
            await this.waitForDriveService();
            
            console.log('Google Sheets service initialized successfully');
            this.initialized = true;
            
        } catch (error) {
            console.error('Failed to initialize Google Sheets service:', error);
            throw error;
        }
    }

    /**
     * Wait for Google Drive service to be ready (reuse auth)
     */
    async waitForDriveService() {
        const maxAttempts = 50;
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const checkDriveService = () => {
                attempts++;
                
                if (window.googleDriveService && window.googleDriveService.initialized && window.googleDriveService.isReady()) {
                    this.gapi = window.googleDriveService.gapi;
                    
                    // Load Sheets API
                    this.loadSheetsApi().then(resolve).catch(reject);
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Google Drive service failed to initialize'));
                } else {
                    setTimeout(checkDriveService, 100);
                }
            };
            checkDriveService();
        });
    }

    /**
     * Load Google Sheets API
     */
    async loadSheetsApi() {
        try {
            if (!this.gapi.client.sheets) {
                console.log('Loading Google Sheets API...');
                await this.gapi.client.load('sheets', 'v4');
                console.log('Google Sheets API loaded successfully');
            }
        } catch (error) {
            console.error('Failed to load Google Sheets API:', error);
            throw new Error('Failed to load Google Sheets API: ' + error.message);
        }
    }

    /**
     * Ensure authentication using existing Google Drive auth
     */
    async ensureAuth() {
        if (!window.googleDriveService || !window.googleDriveService.isReady()) {
            throw new Error('Google Drive service not ready. Please authenticate first.');
        }
        
        // Use existing Drive service authentication
        await window.googleDriveService.ensureAuth();
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
                
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
            }
        }
    }

    /**
     * Create a new Google Spreadsheet
     */
    async createSpreadsheet(title, parentFolderId = null) {
        await this.ensureAuth();

        const resource = {
            properties: {
                title: title
            }
        };

        return await this.retryOperation(async () => {
            const response = await this.gapi.client.sheets.spreadsheets.create({
                resource: resource,
                fields: 'spreadsheetId,properties.title,spreadsheetUrl'
            });

            const spreadsheet = response.result;
            console.log('Created spreadsheet:', spreadsheet.properties.title, 'ID:', spreadsheet.spreadsheetId);

            // Move to specific folder if requested
            if (parentFolderId && parentFolderId !== 'root') {
                try {
                    await window.googleDriveService.moveFile(
                        spreadsheet.spreadsheetId, 
                        parentFolderId, 
                        ['root']
                    );
                    console.log('Moved spreadsheet to folder:', parentFolderId);
                } catch (moveError) {
                    console.warn('Failed to move spreadsheet to folder:', moveError);
                }
            }

            return spreadsheet;
        }, 'Create spreadsheet');
    }

    /**
     * Validate JSON data before conversion
     */
    validateJsonData(jsonData) {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            type: 'unknown',
            estimatedSize: 0
        };

        try {
            // Check for null/undefined
            if (jsonData === null || jsonData === undefined) {
                validation.valid = false;
                validation.errors.push('JSON data is null or undefined');
                return validation;
            }

            // Estimate data size for performance warnings
            const jsonString = JSON.stringify(jsonData);
            validation.estimatedSize = jsonString.length;

            // Warn about large datasets
            if (validation.estimatedSize > 1000000) { // 1MB
                validation.warnings.push('Large dataset detected. Consider splitting into smaller chunks.');
            }

            // Determine data type and validate structure
            if (Array.isArray(jsonData)) {
                if (jsonData.length === 0) {
                    validation.valid = false;
                    validation.errors.push('Array is empty');
                    return validation;
                }

                if (jsonData.length > 50000) {
                    validation.warnings.push('Dataset has over 50,000 rows. Google Sheets may have performance issues.');
                }

                const firstItem = jsonData[0];
                if (typeof firstItem === 'object' && firstItem !== null) {
                    validation.type = 'array_of_objects';
                    
                    // Check for consistent structure
                    const firstKeys = Object.keys(firstItem);
                    if (firstKeys.length > 26) {
                        validation.warnings.push('More than 26 columns detected. Some columns may be difficult to navigate.');
                    }

                    // Check for inconsistent object structures
                    const inconsistentItems = jsonData.slice(1, 10).filter(item => {
                        const keys = Object.keys(item || {});
                        return keys.length !== firstKeys.length || 
                               !firstKeys.every(key => keys.includes(key));
                    });

                    if (inconsistentItems.length > 0) {
                        validation.warnings.push('Inconsistent object structures detected. Some cells may be empty.');
                    }
                } else {
                    validation.type = 'array_of_primitives';
                }
            } else if (typeof jsonData === 'object') {
                validation.type = 'single_object';
                const keys = Object.keys(jsonData);
                if (keys.length > 1000) {
                    validation.warnings.push('Object has many properties. Consider restructuring data.');
                }
            } else {
                validation.type = 'primitive';
            }

        } catch (error) {
            validation.valid = false;
            validation.errors.push('Failed to validate JSON data: ' + error.message);
        }

        return validation;
    }

    /**
     * Convert JSON data to spreadsheet format with validation
     */
    convertJsonToSheetData(jsonData) {
        // Validate data first
        const validation = this.validateJsonData(jsonData);
        
        if (!validation.valid) {
            throw new Error('Invalid JSON data: ' + validation.errors.join(', '));
        }

        // Log warnings
        validation.warnings.forEach(warning => {
            console.warn('JSON conversion warning:', warning);
        });

        try {
            // Handle array of objects (most common case)
            if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object') {
                const allKeys = new Set();
                
                // Collect all possible keys from all objects
                jsonData.forEach(item => {
                    if (item && typeof item === 'object') {
                        Object.keys(item).forEach(key => allKeys.add(key));
                    }
                });

                const headers = Array.from(allKeys).sort();
                const rows = jsonData.map((item, index) => {
                    if (!item || typeof item !== 'object') {
                        // Handle null/invalid items in array
                        return headers.map(() => `[Invalid item at index ${index}]`);
                    }
                    
                    return headers.map(header => {
                        const value = item[header];
                        if (value === null || value === undefined) return '';
                        if (typeof value === 'object') {
                            try {
                                return JSON.stringify(value);
                            } catch (e) {
                                return '[Complex Object]';
                            }
                        }
                        return String(value);
                    });
                });
                return { headers, rows };
            }

            // Handle single object
            if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
                const headers = ['Key', 'Value'];
                const rows = Object.entries(jsonData).map(([key, value]) => {
                    if (value === null || value === undefined) return [key, ''];
                    if (typeof value === 'object') {
                        try {
                            return [key, JSON.stringify(value)];
                        } catch (e) {
                            return [key, '[Complex Object]'];
                        }
                    }
                    return [key, String(value)];
                });
                return { headers, rows };
            }

            // Handle array of primitives
            if (Array.isArray(jsonData)) {
                const headers = ['Index', 'Value'];
                const rows = jsonData.map((value, index) => {
                    if (value === null || value === undefined) return [index, ''];
                    if (typeof value === 'object') {
                        try {
                            return [index, JSON.stringify(value)];
                        } catch (e) {
                            return [index, '[Complex Object]'];
                        }
                    }
                    return [index, String(value)];
                });
                return { headers, rows };
            }

            // Handle primitive value
            return { 
                headers: ['Value'], 
                rows: [[typeof jsonData === 'object' ? JSON.stringify(jsonData) : String(jsonData)]] 
            };

        } catch (error) {
            console.error('Error converting JSON to sheet data:', error);
            throw new Error('Failed to convert JSON data: ' + error.message);
        }
    }

    /**
     * Add data to a specific sheet in a spreadsheet
     */
    async addDataToSheet(spreadsheetId, sheetName, headers, rows) {
        await this.ensureAuth();

        // Prepare the data with headers
        const values = [headers, ...rows];

        const resource = {
            values: values
        };

        return await this.retryOperation(async () => {
            const response = await this.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                resource: resource
            });

            console.log('Updated sheet with data:', response.result);
            return response.result;
        }, 'Add data to sheet');
    }

    /**
     * Create a new sheet in an existing spreadsheet
     */
    async addSheet(spreadsheetId, sheetTitle) {
        await this.ensureAuth();

        const requests = [{
            addSheet: {
                properties: {
                    title: sheetTitle
                }
            }
        }];

        return await this.retryOperation(async () => {
            const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    requests: requests
                }
            });

            console.log('Added new sheet:', sheetTitle);
            return response.result.replies[0].addSheet.properties;
        }, 'Add sheet');
    }

    /**
     * Apply formatting to a sheet
     */
    async formatSheet(spreadsheetId, sheetId, totalRows, totalColumns) {
        await this.ensureAuth();

        const requests = [
            // Format header row
            {
                repeatCell: {
                    range: {
                        sheetId: sheetId,
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: 0,
                        endColumnIndex: totalColumns
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
                            textFormat: { bold: true },
                            horizontalAlignment: 'CENTER'
                        }
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                }
            },
            // Auto-resize columns
            {
                autoResizeDimensions: {
                    dimensions: {
                        sheetId: sheetId,
                        dimension: 'COLUMNS',
                        startIndex: 0,
                        endIndex: totalColumns
                    }
                }
            },
            // Freeze header row
            {
                updateSheetProperties: {
                    properties: {
                        sheetId: sheetId,
                        gridProperties: {
                            frozenRowCount: 1
                        }
                    },
                    fields: 'gridProperties.frozenRowCount'
                }
            }
        ];

        return await this.retryOperation(async () => {
            const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    requests: requests
                }
            });

            console.log('Applied formatting to sheet');
            return response.result;
        }, 'Format sheet');
    }

    /**
     * Import JSON data to Google Sheets
     */
    async importJsonToSheets(jsonData, options = {}) {
        try {
            await this.ensureAuth();

            const {
                spreadsheetTitle = `JSON Import ${new Date().toISOString().split('T')[0]}`,
                sheetName = 'Sheet1',
                folderId = null,
                applyFormatting = true
            } = options;

            console.log('Starting JSON to Sheets import...');

            // Convert JSON to sheet format
            const { headers, rows } = this.convertJsonToSheetData(jsonData);
            
            if (rows.length === 0) {
                throw new Error('No data to import');
            }

            // Create new spreadsheet
            const spreadsheet = await this.createSpreadsheet(spreadsheetTitle, folderId);
            const spreadsheetId = spreadsheet.spreadsheetId;

            // Add data to the default sheet
            await this.addDataToSheet(spreadsheetId, sheetName, headers, rows);

            // Apply formatting if requested
            if (applyFormatting) {
                const sheetId = 0; // Default sheet ID
                await this.formatSheet(spreadsheetId, sheetId, rows.length + 1, headers.length);
            }

            const result = {
                spreadsheetId: spreadsheetId,
                spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
                title: spreadsheet.properties.title,
                rowsImported: rows.length,
                columnsImported: headers.length,
                sheetName: sheetName
            };

            console.log('JSON import completed successfully:', result);
            return result;

        } catch (error) {
            console.error('Failed to import JSON to Google Sheets:', error);
            throw error;
        }
    }

    /**
     * Import multiple JSON objects to separate sheets in one spreadsheet
     */
    async importMultipleJsonToSheets(jsonObjects, options = {}) {
        try {
            await this.ensureAuth();

            const {
                spreadsheetTitle = `Multi-JSON Import ${new Date().toISOString().split('T')[0]}`,
                folderId = null,
                applyFormatting = true
            } = options;

            console.log('Starting multiple JSON to Sheets import...');

            if (!Array.isArray(jsonObjects) || jsonObjects.length === 0) {
                throw new Error('jsonObjects must be a non-empty array');
            }

            // Create new spreadsheet
            const spreadsheet = await this.createSpreadsheet(spreadsheetTitle, folderId);
            const spreadsheetId = spreadsheet.spreadsheetId;

            const results = [];

            for (let i = 0; i < jsonObjects.length; i++) {
                const { name, data } = jsonObjects[i];
                const sheetName = name || `Sheet${i + 1}`;

                try {
                    // Convert JSON to sheet format
                    const { headers, rows } = this.convertJsonToSheetData(data);

                    if (i === 0) {
                        // Use the default sheet for the first import
                        await this.addDataToSheet(spreadsheetId, 'Sheet1', headers, rows);
                        
                        // Rename the default sheet if needed
                        if (sheetName !== 'Sheet1') {
                            await this.renameSheet(spreadsheetId, 0, sheetName);
                        }

                        if (applyFormatting) {
                            await this.formatSheet(spreadsheetId, 0, rows.length + 1, headers.length);
                        }
                    } else {
                        // Create new sheet for subsequent imports
                        const newSheet = await this.addSheet(spreadsheetId, sheetName);
                        await this.addDataToSheet(spreadsheetId, sheetName, headers, rows);

                        if (applyFormatting) {
                            await this.formatSheet(spreadsheetId, newSheet.sheetId, rows.length + 1, headers.length);
                        }
                    }

                    results.push({
                        sheetName: sheetName,
                        rowsImported: rows.length,
                        columnsImported: headers.length,
                        success: true
                    });

                } catch (sheetError) {
                    console.error(`Failed to import sheet ${sheetName}:`, sheetError);
                    results.push({
                        sheetName: sheetName,
                        error: sheetError.message,
                        success: false
                    });
                }
            }

            const result = {
                spreadsheetId: spreadsheetId,
                spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
                title: spreadsheet.properties.title,
                sheets: results,
                successCount: results.filter(r => r.success).length,
                totalSheets: results.length
            };

            console.log('Multiple JSON import completed:', result);
            return result;

        } catch (error) {
            console.error('Failed to import multiple JSON to Google Sheets:', error);
            throw error;
        }
    }

    /**
     * Rename a sheet in a spreadsheet
     */
    async renameSheet(spreadsheetId, sheetId, newTitle) {
        await this.ensureAuth();

        const requests = [{
            updateSheetProperties: {
                properties: {
                    sheetId: sheetId,
                    title: newTitle
                },
                fields: 'title'
            }
        }];

        return await this.retryOperation(async () => {
            const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    requests: requests
                }
            });

            console.log('Renamed sheet to:', newTitle);
            return response.result;
        }, 'Rename sheet');
    }

    /**
     * Get all spreadsheets in a specific folder
     */
    async getSpreadsheetsByFolder(folderId) {
        await this.ensureAuth();

        try {
            const query = `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
            
            const response = await this.gapi.client.drive.files.list({
                q: query,
                fields: 'files(id,name,createdTime,modifiedTime,webViewLink)',
                pageSize: 100
            });

            return response.result.files || [];
        } catch (error) {
            console.error('Failed to get spreadsheets by folder:', error);
            throw error;
        }
    }

    /**
     * Create a dedicated folder for JSON imports
     */
    async createJsonImportFolder(folderName = 'JSON Imports') {
        await this.ensureAuth();

        try {
            // Check if folder already exists
            const existingFolder = await window.googleDriveService.findMainDriveFileByName(folderName);
            
            if (existingFolder) {
                console.log('JSON Import folder already exists:', existingFolder.id);
                return existingFolder;
            }

            // Create new folder
            const folder = await window.googleDriveService.createMainDriveFolder(folderName);
            console.log('Created JSON Import folder:', folder.id);
            return folder;

        } catch (error) {
            console.error('Failed to create JSON import folder:', error);
            throw error;
        }
    }

    /**
     * Quick import from JSON string
     */
    async quickImportFromJsonString(jsonString, filename = null) {
        try {
            const jsonData = JSON.parse(jsonString);
            const title = filename ? 
                filename.replace(/\.json$/i, '') + ' - Import' : 
                `JSON Import ${new Date().toLocaleDateString()}`;

            // Create folder for imports
            const folder = await this.createJsonImportFolder();

            return await this.importJsonToSheets(jsonData, {
                spreadsheetTitle: title,
                folderId: folder.id
            });

        } catch (error) {
            console.error('Failed to quick import JSON:', error);
            throw error;
        }
    }
}

// Create global instance
window.googleSheetsService = new GoogleSheetsService();

// Auto-initialize when Google Drive service is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Setting up Google Sheets service initialization...');
    
    const initializeSheetsService = () => {
        let attempts = 0;
        const maxAttempts = 100;
        
        const checkReady = setInterval(() => {
            attempts++;
            
            if (window.googleDriveService && window.googleDriveService.initialized) {
                console.log('Google Drive service ready, initializing Sheets service...');
                clearInterval(checkReady);
                window.googleSheetsService.initialize().catch(error => {
                    console.error('Failed to initialize Google Sheets service:', error);
                });
            } else if (attempts >= maxAttempts) {
                console.warn('Google Sheets service initialization timeout');
                clearInterval(checkReady);
            }
        }, 200);
    };

    // Start initialization check
    initializeSheetsService();
});

// Listen for drive auth changes to reinitialize if needed
window.addEventListener('driveAuthChanged', (event) => {
    if (event.detail.signedIn && !window.googleSheetsService.initialized) {
        console.log('Drive auth ready, initializing Sheets service...');
        window.googleSheetsService.initialize().catch(error => {
            console.error('Failed to initialize Google Sheets service after auth:', error);
        });
    }
});