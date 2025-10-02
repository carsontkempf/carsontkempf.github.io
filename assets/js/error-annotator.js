/**
 * Error Annotator JavaScript
 * Web-based error categorization tool for CSV data
 */
class ErrorAnnotator {
    constructor() {
        this.csvData = [];
        this.currentIndex = 0;
        this.annotations = {};
        this.errorCategories = this.initializeErrorCategories();
        
        // Enhanced export properties
        this.importedPrompt = '';
        this.generatedPrompt = '';
        this.generatedJSON = '';
        this.currentCSVFile = null;
        this.csvAssociations = JSON.parse(localStorage.getItem('csvAssociations') || '[]');
        
        this.initializeEventListeners();
        this.clearOldAnnotations();  // Clear any old annotations with different category system
    }

    /**
     * Initialize error categories with simplified names
     */
    initializeErrorCategories() {
        return {
            'Function Signature Mismatch': {
                subcategories: [
                    'Incorrect Argument Count',
                    'Argument Unpacking Error'
                ]
            },
            'Logical/Algorithmic Errors': {
                subcategories: [
                    'Incorrect Formula Application',
                    'Off By One Error',
                    'Incorrect Output Format',
                    'Edge Case Handling Failure'
                ]
            },
            'Syntax/Environment Errors': {
                subcategories: [
                    'Syntax Error'
                ]
            }
        };
    }

    /**
     * Initialize event listeners for UI elements
     */
    initializeEventListeners() {
        // Wait for elements to be available
        setTimeout(() => {
            const csvFileInput = document.getElementById('csvFileInput');
            if (!csvFileInput) return; // Elements not ready yet
            
            // File upload
            csvFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
            
            // Navigation
            document.getElementById('prevBtn').addEventListener('click', () => this.navigatePrevious());
            document.getElementById('nextBtn').addEventListener('click', () => this.navigateNext());
            
            // Tagging
            document.getElementById('addCustomTagBtn').addEventListener('click', () => this.addCustomTag());
            document.getElementById('customTagInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addCustomTag();
            });
            
            // Action buttons
            document.getElementById('finishedBtn').addEventListener('click', () => this.finishedAnnotating());
            document.getElementById('clearBtn').addEventListener('click', () => this.clearAllAnnotations());
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        }, 100);
    }

    /**
     * Handle CSV file upload
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // Store current CSV file info
            this.currentCSVFile = {
                name: file.name,
                size: file.size,
                lastModified: file.lastModified,
                uploadDate: new Date().toISOString()
            };
            
            const text = await this.readFileAsText(file);
            
            this.parseCsvData(text);
            this.showAnnotationInterface();
            this.renderErrorCategories();
            this.updateUI();
            
            // Store data for finished annotating page
            this.storeDataForFinishedPage();
            
            document.getElementById('loadStatus').textContent = 
                `Loaded ${this.csvData.length} entries with errors and refactored code`;
            document.getElementById('loadStatus').style.color = '#27ae60';
            
            // Log detailed info for debugging
            console.log(`Successfully loaded CSV with ${this.csvData.length} error entries`);
        } catch (error) {
            console.error('Error loading CSV:', error);
            alert('Error loading CSV file. Please check the file format.');
        }
    }

    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV data and filter for error entries
     */
    parseCsvData(csvText) {
        // Use a proper CSV parser that handles multiline fields and quotes
        const allData = this.parseComplexCsv(csvText);
        
        if (allData.length === 0) throw new Error('No data found in CSV file');
        
        // Filter for entries with errors AND refactored code
        this.csvData = allData.filter(entry => {
            const comparison = (entry.comparison || '').trim().toUpperCase();
            const refactoredCode = (entry.refactored_code || '').trim();
            const hasError = comparison !== 'SAME' && comparison !== 'TRUE';
            const hasRefactoredCode = refactoredCode && 
                refactoredCode.toLowerCase() !== 'none' && 
                refactoredCode.toLowerCase() !== 'null' &&
                refactoredCode.toLowerCase() !== '';
            
            return hasError && hasRefactoredCode;
        });
        
        console.log(`Loaded ${allData.length} total entries, ${this.csvData.length} entries with errors and refactored code`);
        
        // Reset to first entry
        this.currentIndex = 0;
    }

    /**
     * Parse complex CSV with multiline fields and proper quote handling
     */
    parseComplexCsv(csvText) {
        const lines = csvText.split('\n');
        if (lines.length === 0) throw new Error('Empty CSV file');
        
        // Parse header
        const header = this.parseCsvRecord(lines[0]);
        const records = [];
        
        let i = 1;
        while (i < lines.length) {
            const record = this.parseCsvRecord(lines, i);
            if (record.values.length === header.length) {
                const entry = {};
                header.forEach((key, index) => {
                    entry[key.trim()] = (record.values[index] || '').trim();
                });
                records.push(entry);
            }
            i = record.nextLineIndex;
        }
        
        return records;
    }

    /**
     * Parse a single CSV record that may span multiple lines
     */
    parseCsvRecord(lines, startIndex = 0) {
        if (typeof lines === 'string') {
            // Single line mode
            return this.parseSingleCsvLine(lines);
        }
        
        const result = [];
        let current = '';
        let inQuotes = false;
        let currentLineIndex = startIndex;
        
        while (currentLineIndex < lines.length) {
            const line = lines[currentLineIndex];
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        // Escaped quote - add single quote to current
                        current += '"';
                        i++; // Skip next quote
                    } else {
                        // Toggle quote state
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    // End of field
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            
            // If we're in quotes, add a newline and continue to next line
            if (inQuotes && currentLineIndex + 1 < lines.length) {
                current += '\n';
                currentLineIndex++;
            } else {
                // End of record
                result.push(current);
                break;
            }
        }
        
        return {
            values: result,
            nextLineIndex: currentLineIndex + 1
        };
    }

    /**
     * Parse single CSV line (for header)
     */
    parseSingleCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    /**
     * Show the annotation interface
     */
    showAnnotationInterface() {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('annotationInterface').style.display = 'block';
        document.getElementById('annotationNavigation').style.display = 'flex';
        document.getElementById('annotationActions').style.display = 'flex';
    }

    /**
     * Render error categories in the UI with organized sections
     */
    renderErrorCategories() {
        const container = document.getElementById('errorCategories');
        container.innerHTML = '';
        
        let shortcutIndex = 1;
        
        // Define the display order and custom headers
        const categoryOrder = [
            {
                header: 'Function Parameter / Return Type Mismatch Errors',
                categories: ['Function Signature Mismatch']
            },
            {
                header: 'Logical Errors', 
                categories: ['Logical/Algorithmic Errors']
            },
            {
                header: 'Syntax Errors',
                categories: ['Syntax/Environment Errors']
            }
        ];
        
        categoryOrder.forEach(section => {
            // Create section header
            const headerDiv = document.createElement('div');
            headerDiv.className = 'category-section-header';
            headerDiv.textContent = section.header;
            container.appendChild(headerDiv);
            
            // Create container for this section's buttons
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'category-section-container';
            
            // Add buttons for categories in this section
            section.categories.forEach(categoryKey => {
                if (this.errorCategories[categoryKey]) {
                    this.errorCategories[categoryKey].subcategories.forEach(subcategory => {
                        const tagButton = document.createElement('button');
                        tagButton.className = 'category-tag';
                        tagButton.classList.add('shortcut');
                        tagButton.innerHTML = `<span class="shortcut-key">${shortcutIndex}</span> ${subcategory}`;
                        shortcutIndex++;
                        
                        tagButton.addEventListener('click', () => this.addTagToCurrentEntry(subcategory));
                        sectionContainer.appendChild(tagButton);
                    });
                }
            });
            
            container.appendChild(sectionContainer);
        });
    }

    /**
     * Update the UI with current entry data
     */
    updateUI() {
        if (this.csvData.length === 0) return;
        
        const entry = this.csvData[this.currentIndex];
        
        // Update navigation
        document.getElementById('entryInfo').textContent = 
            `Entry ${this.currentIndex + 1} of ${this.csvData.length}`;
        document.getElementById('prevBtn').disabled = this.currentIndex === 0;
        document.getElementById('nextBtn').disabled = this.currentIndex === this.csvData.length - 1;
        
        // Update entry details
        document.getElementById('taskId').textContent = entry.task_id || '-';
        document.getElementById('taskDescription').textContent = entry.text || '-';
        document.getElementById('primaryMethod').textContent = entry.primary_method || '-';
        
        // Update test results
        const originalResult = entry.original_test_result || '-';
        const refactoredResult = entry.refactored_test_result || '-';
        
        // Extract error message if available
        const errorMessage = this.extractErrorMessage(refactoredResult);
        const displayMessage = errorMessage && errorMessage !== refactoredResult ? 
            errorMessage : (refactoredResult.length > 100 ? 
            refactoredResult.substring(0, 100) + '...' : refactoredResult);
        
        document.getElementById('originalResult').textContent = `Original: ${originalResult}`;
        document.getElementById('refactoredResult').textContent = `Refactored: ${displayMessage}`;
        
        // Check if refactored result indicates an error
        const hasError = this.hasTestError(refactoredResult);
        const refactoredDiv = document.getElementById('refactoredResult');
        if (hasError) {
            refactoredDiv.className = 'test-error';
            refactoredDiv.title = refactoredResult; // Show full result on hover
        } else {
            refactoredDiv.className = '';
            refactoredDiv.title = '';
        }
        
        // Update code sections
        const originalCodeElement = document.getElementById('originalCode');
        originalCodeElement.textContent = entry['original code'] || 'No original code available';
        
        const refactoredCodeElement = document.getElementById('refactoredCode');
        
        // Extract actual code from refactored_code field (may be JSON wrapped)
        let refactoredCode = entry.refactored_code || 'No refactored code available';
        refactoredCode = this.extractRefactoredCode(refactoredCode);
        
        refactoredCodeElement.textContent = refactoredCode;
        
        // Style original code as green if it's working (TRUE result)
        const originalIsWorking = originalResult === 'TRUE';
        if (originalIsWorking) {
            originalCodeElement.classList.add('code-success');
            originalCodeElement.classList.remove('code-error');
        } else {
            originalCodeElement.classList.remove('code-success');
            originalCodeElement.classList.remove('code-error');
        }
        
        // Style refactored code based on test results
        if (hasError) {
            refactoredCodeElement.classList.add('code-error');
            refactoredCodeElement.classList.remove('code-success');
        } else {
            refactoredCodeElement.classList.remove('code-error');
            refactoredCodeElement.classList.add('code-success');
        }
        
        // Update current tags
        this.updateCurrentTagsDisplay();
    }

    /**
     * Check if a test result indicates an error
     */
    hasTestError(testResult) {
        if (!testResult || testResult === 'TRUE') return false;
        
        // Try to parse as JSON first
        try {
            const parsed = JSON.parse(testResult.replace(/'/g, '"'));
            if (parsed.status) {
                return parsed.status.toUpperCase() === 'FAIL';
            }
        } catch (e) {
            // Not JSON, check as string
        }
        
        const result = testResult.toLowerCase();
        return result.includes('fail') || 
               result.includes('error') || 
               result.includes('exception') ||
               result.includes('false');
    }

    /**
     * Extract error message from test result
     */
    extractErrorMessage(testResult) {
        if (!testResult || testResult === 'TRUE') return null;
        
        // Try to parse as JSON first
        try {
            const parsed = JSON.parse(testResult.replace(/'/g, '"'));
            if (parsed.message) {
                return parsed.message;
            }
        } catch (e) {
            // Not JSON, return as is
        }
        
        return testResult;
    }

    /**
     * Extract actual code from refactored_code field (may be JSON-wrapped)
     */
    extractRefactoredCode(refactoredCodeField) {
        if (!refactoredCodeField) return 'No refactored code available';
        
        // Check if it starts with ```json (from the CSV)
        if (refactoredCodeField.trim().startsWith('```json')) {
            try {
                // Extract JSON content between ```json and ```
                const jsonMatch = refactoredCodeField.match(/```json\s*\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    const jsonStr = jsonMatch[1];
                    // Parse the JSON and extract the refactored_code
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.output && parsed.output.refactored_code) {
                        // Unescape the code
                        return parsed.output.refactored_code.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                    }
                }
            } catch (e) {
                console.warn('Failed to parse JSON-wrapped refactored code:', e);
            }
        }
        
        // Return as-is if not JSON-wrapped
        return refactoredCodeField;
    }

    /**
     * Update the current tags display
     */
    updateCurrentTagsDisplay() {
        const container = document.getElementById('currentTags');
        const entryId = this.getCurrentEntryId();
        const tags = this.annotations[entryId] || [];
        
        if (tags.length === 0) {
            container.innerHTML = '<div style="color: #7f8c8d; font-style: italic;">No tags assigned</div>';
            return;
        }
        
        container.innerHTML = '';
        tags.forEach(tag => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            
            const tagName = document.createElement('span');
            tagName.className = 'tag-name';
            tagName.textContent = tag;
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-tag';
            removeButton.textContent = '×';
            removeButton.title = 'Remove tag';
            removeButton.addEventListener('click', () => this.removeTagFromCurrentEntry(tag));
            
            tagItem.appendChild(tagName);
            tagItem.appendChild(removeButton);
            container.appendChild(tagItem);
        });
    }

    /**
     * Get current entry ID
     */
    getCurrentEntryId() {
        if (this.csvData.length === 0) return null;
        const entry = this.csvData[this.currentIndex];
        return entry.task_id || `entry_${this.currentIndex}`;
    }

    /**
     * Add custom tag
     */
    addCustomTag() {
        const input = document.getElementById('customTagInput');
        const tag = input.value.trim();
        
        if (!tag) return;
        
        this.addTagToCurrentEntry(tag);
        input.value = '';
    }

    /**
     * Add tag to current entry
     */
    addTagToCurrentEntry(tag) {
        const entryId = this.getCurrentEntryId();
        if (!entryId) return;
        
        if (!this.annotations[entryId]) {
            this.annotations[entryId] = [];
        }
        
        if (!this.annotations[entryId].includes(tag)) {
            this.annotations[entryId].push(tag);
            this.updateCurrentTagsDisplay();
            this.saveAnnotationsToStorage();
            this.saveUserProgress();
        }
    }

    /**
     * Remove tag from current entry
     */
    removeTagFromCurrentEntry(tag) {
        const entryId = this.getCurrentEntryId();
        if (!entryId || !this.annotations[entryId]) return;
        
        this.annotations[entryId] = this.annotations[entryId].filter(t => t !== tag);
        
        if (this.annotations[entryId].length === 0) {
            delete this.annotations[entryId];
        }
        
        this.updateCurrentTagsDisplay();
        this.saveAnnotationsToStorage();
        this.saveUserProgress();
    }

    /**
     * Navigate to previous entry
     */
    navigatePrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateUI();
        }
    }

    /**
     * Navigate to next entry
     */
    navigateNext() {
        if (this.currentIndex < this.csvData.length - 1) {
            this.currentIndex++;
            this.updateUI();
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Don't trigger shortcuts when typing in input fields or if error annotator isn't active
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' ||
            !document.getElementById('annotationInterface') ||
            document.getElementById('annotationInterface').style.display === 'none') {
            return;
        }
        
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.navigatePrevious();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.navigateNext();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                event.preventDefault();
                this.applyShortcutTag(parseInt(event.key));
                break;
        }
    }

    /**
     * Apply tag using keyboard shortcut
     */
    applyShortcutTag(shortcutNumber) {
        let tagIndex = 0;
        
        // Create ordered list of all subcategories
        const allTags = [];
        Object.entries(this.errorCategories).forEach(([categoryName, categoryData]) => {
            categoryData.subcategories.forEach(subcategory => {
                allTags.push(subcategory);
            });
        });
        
        // Apply tag if shortcut number is valid
        if (shortcutNumber >= 1 && shortcutNumber <= allTags.length) {
            const tagToApply = allTags[shortcutNumber - 1];
            this.addTagToCurrentEntry(tagToApply);
            console.log(`Applied tag via shortcut ${shortcutNumber}: ${tagToApply}`);
        }
    }



    /**
     * Clear all annotations
     */
    clearAllAnnotations() {
        if (confirm('Are you sure you want to clear all annotations? This cannot be undone.')) {
            this.annotations = {};
            this.updateCurrentTagsDisplay();
            this.saveAnnotationsToStorage();
        }
    }


    /**
     * Save annotations to local storage
     */
    async saveAnnotationsToStorage() {
        try {
            // Save to localStorage
            localStorage.setItem('errorAnnotations', JSON.stringify(this.annotations));
            
            // Also update data for finished annotating page
            this.storeDataForFinishedPage();
        } catch (error) {
            console.warn('Could not save annotations:', error);
        }
    }

    /**
     * Store data for the finished annotating page
     */
    storeDataForFinishedPage() {
        try {
            // Store current annotations
            localStorage.setItem('errorAnnotations', JSON.stringify(this.annotations));
            
            // Store CSV data
            localStorage.setItem('csvData', JSON.stringify(this.csvData));
            
            // Store current CSV file info
            if (this.currentCSVFile) {
                localStorage.setItem('currentCSVFile', JSON.stringify(this.currentCSVFile));
            }
        } catch (error) {
            console.warn('Could not store data for finished annotating page:', error);
        }
    }

    /**
     * Navigate to finished annotating page
     */
    async finishedAnnotating() {
        // Store current data before navigating
        this.storeDataForFinishedPage();
        
        // Check if we have any annotations
        const hasAnnotations = Object.keys(this.annotations).length > 0;
        const hasData = this.csvData.length > 0;
        
        if (!hasData) {
            alert('Please load a CSV file before finishing annotation.');
            return;
        }
        
        if (!hasAnnotations) {
            const confirm = window.confirm('You haven\'t made any annotations yet. Are you sure you want to continue to the finished page?');
            if (!confirm) return;
        }
        
        // Save to Google Drive if available
        await this.saveFinishedAnnotationsToGoogleDrive();
        
        // Navigate to finished annotating page
        window.location.href = '/finished-annotating/';
    }

    /**
     * Clear old annotations with different category system
     */
    clearOldAnnotations() {
        // Clear localStorage to remove old category system annotations
        try {
            localStorage.removeItem('errorAnnotations');
            console.log('Cleared old annotations to use new category system');
        } catch (error) {
            console.warn('Could not clear old annotations:', error);
        }
        this.annotations = {};
    }

    /**
     * Generate unique ID for CSV file based on its properties
     */
    generateCSVFileId() {
        if (!this.currentCSVFile) return `session_${Date.now()}`;
        
        const { name, size, lastModified } = this.currentCSVFile;
        return `csv_${btoa(`${name}_${size}_${lastModified}`).replace(/[^a-zA-Z0-9]/g, '')}`;
    }


    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('csv-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'csv-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                max-width: 400px;
            `;
            document.body.appendChild(notification);
        }

        // Set message and styling based on type
        notification.textContent = message;
        
        const styles = {
            'success': 'background-color: #27ae60;',
            'error': 'background-color: #e74c3c;',
            'warning': 'background-color: #f39c12;',
            'info': 'background-color: #3498db;'
        };
        
        notification.style.cssText += styles[type] || styles.info;
        notification.style.display = 'block';
        notification.style.opacity = '1';

        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 4000);
    }


    /**
     * Save user progress locally
     */
    async saveUserProgress() {
        try {
            const progress = {
                totalEntriesAnnotated: Object.keys(this.annotations).length,
                totalDatasets: 1,
                lastActive: new Date().toISOString(),
                currentDataset: {
                    fileName: this.currentCSVFile?.name,
                    totalEntries: this.csvData.length,
                    annotatedEntries: Object.keys(this.annotations).length,
                    completionPercentage: (Object.keys(this.annotations).length / this.csvData.length) * 100
                }
            };

            // Save to localStorage
            localStorage.setItem('userProgress', JSON.stringify(progress));
        } catch (error) {
            console.warn('Failed to save user progress:', error);
        }
    }

    /**
     * Save finished annotations to Google Drive JSON folder
     */
    async saveFinishedAnnotationsToGoogleDrive() {
        // Only save if Google Drive service is ready
        if (!window.googleDriveService || !window.googleDriveService.isReady()) {
            console.log('Google Drive not ready, skipping annotation save');
            return;
        }

        try {
            console.log('Saving finished annotations to Google Drive...');
            
            // Ensure the backup folder structure exists
            const folderStructure = await window.googleDriveService.ensureBackupFolderStructure();
            
            // Create the annotation data
            const annotationData = {
                metadata: {
                    csvFileName: this.currentCSVFile?.name || 'unknown',
                    totalEntries: this.csvData.length,
                    annotatedEntries: Object.keys(this.annotations).length,
                    completionPercentage: (Object.keys(this.annotations).length / this.csvData.length) * 100,
                    exportDate: new Date().toISOString(),
                    userEmail: window.authService?.user?.email || 'unknown',
                    categories: this.errorCategories
                },
                annotations: this.annotations,
                csvData: this.csvData
            };
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const baseName = this.currentCSVFile?.name?.replace('.csv', '') || 'annotations';
            const fileName = `${baseName}_annotations_${timestamp}.json`;
            
            // Save to the JSON folder in main Drive
            const result = await window.googleDriveService.createFile(
                fileName,
                JSON.stringify(annotationData, null, 2),
                'application/json',
                folderStructure.jsonFolderId
            );
            
            console.log('✅ Finished annotations saved to Google Drive:', fileName);
            this.showNotification('Annotations saved to Google Drive', 'success');
            
            return result;
            
        } catch (error) {
            console.error('Failed to save annotations to Google Drive:', error);
            this.showNotification('Failed to save annotations to Google Drive', 'warning');
        }
    }

}

// Global variable for error annotator instance
let errorAnnotator;

// Initialize the error annotator when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        errorAnnotator = new ErrorAnnotator();
    }, 200);
});