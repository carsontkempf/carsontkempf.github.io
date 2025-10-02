/**
 * JSON to Google Sheets Utility
 * A simple utility for programmatically importing JSON data to Google Sheets
 * Can be used independently or integrated into other applications
 */

class JsonSheetsUtility {
    constructor() {
        this.sheetsService = null;
        this.initialized = false;
    }

    /**
     * Initialize the utility
     */
    async initialize() {
        if (this.initialized) return;

        // Wait for Google Sheets service to be ready
        if (!window.googleSheetsService) {
            throw new Error('Google Sheets service not available');
        }

        await window.googleSheetsService.initialize();
        this.sheetsService = window.googleSheetsService;
        this.initialized = true;
    }

    /**
     * Import JSON from URL
     */
    async importFromUrl(jsonUrl, options = {}) {
        await this.initialize();

        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
            }

            const jsonData = await response.json();
            const title = options.title || this.extractTitleFromUrl(jsonUrl);

            return await this.sheetsService.importJsonToSheets(jsonData, {
                ...options,
                spreadsheetTitle: title
            });

        } catch (error) {
            console.error('Failed to import JSON from URL:', error);
            throw error;
        }
    }

    /**
     * Import JSON data directly
     */
    async importData(jsonData, options = {}) {
        await this.initialize();

        const defaultOptions = {
            spreadsheetTitle: `JSON Import ${new Date().toISOString().split('T')[0]}`,
            applyFormatting: true
        };

        return await this.sheetsService.importJsonToSheets(jsonData, {
            ...defaultOptions,
            ...options
        });
    }

    /**
     * Import multiple JSON datasets to one spreadsheet
     */
    async importMultiple(datasets, options = {}) {
        await this.initialize();

        const defaultOptions = {
            spreadsheetTitle: `Multi-JSON Import ${new Date().toISOString().split('T')[0]}`,
            applyFormatting: true
        };

        const jsonObjects = datasets.map((dataset, index) => ({
            name: dataset.name || `Dataset ${index + 1}`,
            data: dataset.data
        }));

        return await this.sheetsService.importMultipleJsonToSheets(jsonObjects, {
            ...defaultOptions,
            ...options
        });
    }

    /**
     * Batch import from multiple URLs
     */
    async batchImportFromUrls(urls, options = {}) {
        await this.initialize();

        const datasets = [];

        for (const url of urls) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn(`Failed to fetch ${url}: ${response.status}`);
                    continue;
                }

                const data = await response.json();
                datasets.push({
                    name: this.extractTitleFromUrl(url),
                    data: data
                });

            } catch (error) {
                console.warn(`Error processing ${url}:`, error);
            }
        }

        if (datasets.length === 0) {
            throw new Error('No valid JSON data could be fetched from the provided URLs');
        }

        return await this.importMultiple(datasets, options);
    }

    /**
     * Import JSON with automatic folder organization
     */
    async importWithFolderOrganization(jsonData, category = 'General', options = {}) {
        await this.initialize();

        // Create category folder
        const folderName = `JSON Imports - ${category}`;
        const folder = await this.sheetsService.createJsonImportFolder(folderName);

        return await this.importData(jsonData, {
            ...options,
            folderId: folder.id
        });
    }

    /**
     * Get import history from localStorage
     */
    getImportHistory() {
        try {
            return JSON.parse(localStorage.getItem('jsonSheetsImports') || '[]');
        } catch (error) {
            console.warn('Failed to get import history:', error);
            return [];
        }
    }

    /**
     * Clear import history
     */
    clearImportHistory() {
        localStorage.removeItem('jsonSheetsImports');
    }

    /**
     * Validate JSON data structure
     */
    validateJsonData(jsonData) {
        if (jsonData === null || jsonData === undefined) {
            return { valid: false, error: 'JSON data is null or undefined' };
        }

        if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
            return { valid: true, type: 'object', description: 'Single object' };
        }

        if (Array.isArray(jsonData)) {
            if (jsonData.length === 0) {
                return { valid: false, error: 'Array is empty' };
            }

            const firstItem = jsonData[0];
            if (typeof firstItem === 'object') {
                return { 
                    valid: true, 
                    type: 'array_of_objects', 
                    description: `Array of ${jsonData.length} objects` 
                };
            } else {
                return { 
                    valid: true, 
                    type: 'array_of_primitives', 
                    description: `Array of ${jsonData.length} primitive values` 
                };
            }
        }

        return { 
            valid: true, 
            type: 'primitive', 
            description: 'Single primitive value' 
        };
    }

    /**
     * Extract a meaningful title from URL
     */
    extractTitleFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            
            // Get the last part of the path
            const segments = pathname.split('/').filter(s => s.length > 0);
            let title = segments[segments.length - 1] || 'JSON Import';
            
            // Remove file extension
            title = title.replace(/\.(json|js)$/i, '');
            
            // Convert to title case
            title = title.replace(/[-_]/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
            
            return title + ' - Import';
            
        } catch (error) {
            return 'JSON Import';
        }
    }

    /**
     * Generate a preview of how JSON will be converted
     */
    previewConversion(jsonData) {
        const validation = this.validateJsonData(jsonData);
        if (!validation.valid) {
            return { error: validation.error };
        }

        // Use the same conversion logic as the sheets service
        const { headers, rows } = this.sheetsService.convertJsonToSheetData(jsonData);
        
        const preview = {
            headers: headers,
            sampleRows: rows.slice(0, 5), // Show first 5 rows
            totalRows: rows.length,
            totalColumns: headers.length,
            dataType: validation.type,
            description: validation.description
        };

        return preview;
    }

    /**
     * Check if user is authenticated and ready
     */
    isReady() {
        return this.initialized && 
               window.googleDriveService && 
               window.googleDriveService.isReady();
    }

    /**
     * Get authentication status
     */
    getAuthStatus() {
        if (!window.googleDriveService) {
            return { authenticated: false, hasRole: false, ready: false };
        }

        return {
            authenticated: window.googleDriveService.isSignedIn,
            hasRole: window.googleDriveService.hasAuthorizedRole(),
            ready: window.googleDriveService.isReady()
        };
    }
}

// Create global instance
window.jsonSheetsUtility = new JsonSheetsUtility();

// Convenience functions for quick access
window.importJsonToSheets = async function(jsonData, options = {}) {
    return await window.jsonSheetsUtility.importData(jsonData, options);
};

window.importJsonFromUrl = async function(url, options = {}) {
    return await window.jsonSheetsUtility.importFromUrl(url, options);
};

window.batchImportJson = async function(datasets, options = {}) {
    return await window.jsonSheetsUtility.importMultiple(datasets, options);
};

// Auto-initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('JSON Sheets Utility ready for use');
    
    // Listen for auth changes to reinitialize
    window.addEventListener('driveAuthChanged', (event) => {
        if (event.detail.signedIn) {
            window.jsonSheetsUtility.initialize().catch(error => {
                console.error('Failed to initialize JSON Sheets Utility:', error);
            });
        }
    });
});