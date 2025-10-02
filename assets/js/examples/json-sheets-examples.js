/**
 * JSON to Google Sheets Examples
 * Demonstrates various ways to use the JSON to Sheets functionality
 * Run these examples in the browser console after authentication
 */

// Example datasets for testing
const exampleData = {
    // Simple array of objects (common use case)
    employees: [
        {
            "name": "Alice Johnson",
            "email": "alice@example.com",
            "department": "Engineering",
            "salary": 95000,
            "start_date": "2022-01-15",
            "active": true
        },
        {
            "name": "Bob Smith", 
            "email": "bob@example.com",
            "department": "Marketing",
            "salary": 75000,
            "start_date": "2021-08-20",
            "active": true
        },
        {
            "name": "Carol Williams",
            "email": "carol@example.com",
            "department": "Sales", 
            "salary": 85000,
            "start_date": "2023-03-10",
            "active": false
        }
    ],

    // Single object
    company: {
        "name": "Tech Corp",
        "founded": 2015,
        "employees": 150,
        "headquarters": "San Francisco, CA",
        "revenue_2023": "$50M",
        "public": false,
        "products": ["Software A", "Platform B", "Service C"],
        "ceo": "Jane Doe"
    },

    // Nested data (will be flattened)
    orders: [
        {
            "id": 1,
            "customer": {
                "name": "John Doe",
                "email": "john@example.com",
                "address": {
                    "street": "123 Main St",
                    "city": "Anytown",
                    "zip": "12345"
                }
            },
            "order": {
                "total": 125.50,
                "items": ["Laptop", "Mouse"],
                "date": "2024-01-15",
                "status": "shipped"
            }
        },
        {
            "id": 2,
            "customer": {
                "name": "Jane Smith",
                "email": "jane@example.com", 
                "address": {
                    "street": "456 Oak Ave",
                    "city": "Other City",
                    "zip": "67890"
                }
            },
            "order": {
                "total": 89.99,
                "items": ["Keyboard", "Monitor"],
                "date": "2024-01-16",
                "status": "processing"
            }
        }
    ],

    // Array of primitives
    tags: ["javascript", "python", "react", "nodejs", "mongodb", "postgresql", "aws", "docker"],

    // Time series data
    metrics: [
        { "date": "2024-01-01", "visitors": 1250, "pageviews": 3200, "revenue": 4500.00 },
        { "date": "2024-01-02", "visitors": 1180, "pageviews": 2950, "revenue": 4200.00 },
        { "date": "2024-01-03", "visitors": 1340, "pageviews": 3600, "revenue": 5100.00 },
        { "date": "2024-01-04", "visitors": 1420, "pageviews": 3850, "revenue": 5400.00 },
        { "date": "2024-01-05", "visitors": 1380, "pageviews": 3700, "revenue": 5200.00 }
    ]
};

/**
 * Example functions that demonstrate different import scenarios
 */
const examples = {

    /**
     * Basic import example
     */
    async basicImport() {
        console.log('🚀 Running basic import example...');
        
        try {
            const result = await importJsonToSheets(exampleData.employees, {
                spreadsheetTitle: 'Employee Data - Example',
                applyFormatting: true
            });
            
            console.log('✅ Basic import successful!');
            console.log('Spreadsheet URL:', result.spreadsheetUrl);
            console.log('Rows imported:', result.rowsImported);
            
            return result;
        } catch (error) {
            console.error('❌ Basic import failed:', error);
            throw error;
        }
    },

    /**
     * Multiple datasets in one spreadsheet
     */
    async multiSheetImport() {
        console.log('🚀 Running multi-sheet import example...');
        
        try {
            const datasets = [
                { name: 'Employees', data: exampleData.employees },
                { name: 'Company Info', data: exampleData.company },
                { name: 'Metrics', data: exampleData.metrics },
                { name: 'Tags', data: exampleData.tags }
            ];
            
            const result = await batchImportJson(datasets, {
                spreadsheetTitle: 'Multi-Dataset Import Example',
                applyFormatting: true
            });
            
            console.log('✅ Multi-sheet import successful!');
            console.log('Spreadsheet URL:', result.spreadsheetUrl);
            console.log('Sheets created:', result.sheets.length);
            
            return result;
        } catch (error) {
            console.error('❌ Multi-sheet import failed:', error);
            throw error;
        }
    },

    /**
     * Import with folder organization
     */
    async organizedImport() {
        console.log('🚀 Running organized import example...');
        
        try {
            const result = await window.jsonSheetsUtility.importWithFolderOrganization(
                exampleData.orders,
                'Sales Data',
                {
                    spreadsheetTitle: 'Order Data - Q1 2024',
                    applyFormatting: true
                }
            );
            
            console.log('✅ Organized import successful!');
            console.log('Spreadsheet URL:', result.spreadsheetUrl);
            console.log('Data organized in Sales Data folder');
            
            return result;
        } catch (error) {
            console.error('❌ Organized import failed:', error);
            throw error;
        }
    },

    /**
     * Import from JSON URL (simulated with data)
     */
    async urlImport() {
        console.log('🚀 Running URL import example...');
        
        try {
            // Create a data URL for demonstration
            const jsonString = JSON.stringify(exampleData.metrics, null, 2);
            const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);
            
            const result = await importJsonFromUrl(dataUrl, {
                title: 'Metrics from Data URL',
                applyFormatting: true
            });
            
            console.log('✅ URL import successful!');
            console.log('Spreadsheet URL:', result.spreadsheetUrl);
            
            return result;
        } catch (error) {
            console.error('❌ URL import failed:', error);
            throw error;
        }
    },

    /**
     * Preview conversion without importing
     */
    previewConversion() {
        console.log('🔍 Previewing conversion for different data types...');
        
        Object.entries(exampleData).forEach(([name, data]) => {
            const preview = window.jsonSheetsUtility.previewConversion(data);
            
            console.log(`\n📋 ${name.toUpperCase()}:`);
            console.log('Data type:', preview.dataType);
            console.log('Description:', preview.description);
            console.log('Columns:', preview.totalColumns);
            console.log('Total rows:', preview.totalRows);
            console.log('Headers:', preview.headers.join(', '));
            
            if (preview.sampleRows && preview.sampleRows.length > 0) {
                console.log('Sample row:', preview.sampleRows[0]);
            }
        });
    },

    /**
     * Batch import from multiple URLs (example)
     */
    async batchUrlImport() {
        console.log('🚀 Running batch URL import example...');
        
        try {
            // Create data URLs for demonstration
            const urls = [
                'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exampleData.employees)),
                'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exampleData.company)),
                'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exampleData.metrics))
            ];
            
            const result = await window.jsonSheetsUtility.batchImportFromUrls(urls, {
                spreadsheetTitle: 'Batch URL Import Example',
                applyFormatting: true
            });
            
            console.log('✅ Batch URL import successful!');
            console.log('Spreadsheet URL:', result.spreadsheetUrl);
            console.log('Sheets created:', result.sheets.length);
            
            return result;
        } catch (error) {
            console.error('❌ Batch URL import failed:', error);
            throw error;
        }
    },

    /**
     * Check authentication and service status
     */
    checkStatus() {
        console.log('🔍 Checking service status...');
        
        const authStatus = window.jsonSheetsUtility.getAuthStatus();
        console.log('Authentication status:', authStatus);
        
        const isReady = window.jsonSheetsUtility.isReady();
        console.log('Service ready:', isReady);
        
        if (!isReady) {
            console.log('💡 To use the service, please:');
            console.log('1. Sign in to Google');
            console.log('2. Grant necessary permissions');
            console.log('3. Try running examples.checkStatus() again');
        }
        
        return { authStatus, isReady };
    },

    /**
     * Run all examples in sequence
     */
    async runAllExamples() {
        console.log('🎯 Running all examples...\n');
        
        const status = this.checkStatus();
        if (!status.isReady) {
            console.error('❌ Service not ready. Please authenticate first.');
            return;
        }
        
        try {
            console.log('\n=== BASIC IMPORT ===');
            await this.basicImport();
            
            console.log('\n=== PREVIEW ===');
            this.previewConversion();
            
            console.log('\n=== MULTI-SHEET IMPORT ===');
            await this.multiSheetImport();
            
            console.log('\n=== ORGANIZED IMPORT ===');
            await this.organizedImport();
            
            console.log('\n=== URL IMPORT ===');
            await this.urlImport();
            
            console.log('\n=== BATCH URL IMPORT ===');
            await this.batchUrlImport();
            
            console.log('\n🎉 All examples completed successfully!');
            console.log('Check your Google Drive for the created spreadsheets.');
            
        } catch (error) {
            console.error('❌ Examples failed:', error);
        }
    }
};

// Make examples available globally
window.jsonSheetsExamples = examples;

// Quick access to example data
window.exampleJsonData = exampleData;

// Usage instructions
console.log(`
📚 JSON to Google Sheets Examples
=================================

Available examples:
• examples.checkStatus() - Check authentication status
• examples.previewConversion() - Preview how data will be converted  
• examples.basicImport() - Import a simple dataset
• examples.multiSheetImport() - Create multiple sheets in one spreadsheet
• examples.organizedImport() - Import with folder organization
• examples.urlImport() - Import from a JSON URL
• examples.batchUrlImport() - Import multiple URLs to one spreadsheet
• examples.runAllExamples() - Run all examples

Quick functions:
• importJsonToSheets(data, options) - Direct import
• importJsonFromUrl(url, options) - Import from URL
• batchImportJson(datasets, options) - Multi-dataset import

Example data available in: window.exampleJsonData

To get started:
1. Make sure you're signed in to Google
2. Run: examples.checkStatus()
3. Try: examples.basicImport()
`);

// Auto-run status check when loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.jsonSheetsExamples) {
            console.log('🔍 Auto-checking service status...');
            window.jsonSheetsExamples.checkStatus();
        }
    }, 3000);
});