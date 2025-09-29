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
            document.getElementById('statsBtn').addEventListener('click', () => this.showStatistics());
            document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
            document.getElementById('clearBtn').addEventListener('click', () => this.clearAllAnnotations());
            
            // Enhanced Export modal - new buttons
            document.getElementById('importPromptBtn').addEventListener('click', () => this.importPromptFromText());
            document.getElementById('promptFileInput').addEventListener('change', (e) => this.importPromptFromFile(e));
            document.getElementById('generatePromptBtn').addEventListener('click', () => this.generateEnhancedPrompt());
            document.getElementById('copyPromptBtn').addEventListener('click', () => this.copyPromptToClipboard());
            document.getElementById('downloadPromptBtn').addEventListener('click', () => this.downloadPrompt());
            document.getElementById('generateJsonBtn').addEventListener('click', () => this.generateAnalysisJSON());
            document.getElementById('copyJsonBtn').addEventListener('click', () => this.copyJSONToClipboard());
            document.getElementById('downloadJsonBtn').addEventListener('click', () => this.downloadJSON());
            document.getElementById('associateCurrentBtn').addEventListener('click', () => this.associateCurrentCSVWithPrompt());
            document.getElementById('viewAssociationsBtn').addEventListener('click', () => this.viewAssociations());
            
            // Traditional Export modal - existing buttons
            document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportToJson());
            document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportToCsv());
            
            // Modal close buttons
            document.getElementById('closeStatsModal').addEventListener('click', () => this.closeModal('statsModal'));
            document.getElementById('closeExportModal').addEventListener('click', () => this.closeModal('exportModal'));
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
            
            // Click outside modal to close
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            });
        }, 100);
    }

    /**
     * Handle CSV file upload
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            // Store current CSV file info for associations
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
            
            document.getElementById('loadStatus').textContent = 
                `Loaded ${this.csvData.length} entries with errors and refactored code`;
            document.getElementById('loadStatus').style.color = '#27ae60';
            
            // Enable CSV association if prompt exists
            this.updateAssociationButtonState();
            
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
     * Show statistics modal
     */
    showStatistics() {
        const modal = document.getElementById('statsModal');
        const content = document.getElementById('statsContent');
        
        // Calculate statistics
        const totalEntries = this.csvData.length;
        const taggedEntries = Object.keys(this.annotations).length;
        const allTags = [];
        
        Object.values(this.annotations).forEach(tags => {
            allTags.push(...tags);
        });
        
        const tagCounts = {};
        allTags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        const uniqueTags = Object.keys(tagCounts).length;
        const totalTagApplications = allTags.length;
        
        // Create statistics HTML
        let statsHtml = `
            <div class="stats-section">
                <h4>Overall Statistics</h4>
                <div>Total Entries: ${totalEntries}</div>
                <div>Tagged Entries: ${taggedEntries}</div>
                <div>Progress: ${((taggedEntries / totalEntries) * 100).toFixed(1)}%</div>
                <div>Unique Tags: ${uniqueTags}</div>
                <div>Total Tag Applications: ${totalTagApplications}</div>
            </div>
        `;
        
        if (uniqueTags > 0) {
            statsHtml += `<div class="stats-section"><h4>Tag Usage</h4>`;
            
            // Sort tags by usage count
            const sortedTags = Object.entries(tagCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10); // Show top 10
            
            sortedTags.forEach(([tag, count]) => {
                statsHtml += `<div>${tag}: ${count}</div>`;
            });
            
            statsHtml += `</div>`;
        }
        
        content.innerHTML = statsHtml;
        modal.style.display = 'block';
    }

    /**
     * Show export modal
     */
    showExportModal() {
        const modal = document.getElementById('exportModal');
        const preview = document.getElementById('exportPreview');
        
        // Show preview of annotations
        const previewData = {
            metadata: {
                total_entries: this.csvData.length,
                tagged_entries: Object.keys(this.annotations).length,
                export_date: new Date().toISOString()
            },
            annotations: this.annotations
        };
        
        preview.textContent = JSON.stringify(previewData, null, 2);
        modal.style.display = 'block';
    }

    /**
     * Export annotations to JSON
     */
    exportToJson() {
        const data = {
            metadata: {
                total_entries: this.csvData.length,
                tagged_entries: Object.keys(this.annotations).length,
                export_date: new Date().toISOString(),
                tool: 'Error Annotator Web'
            },
            all_tags: this.getAllUniqueTags(),
            entry_tags: this.annotations,
            tag_usage_count: this.getTagUsageCounts()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error_annotations_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.closeModal('exportModal');
    }

    /**
     * Export to CSV report
     */
    exportToCsv() {
        let csvContent = 'task_id,tags,tag_count,original_test_result,refactored_test_result,comparison\n';
        
        this.csvData.forEach((entry, index) => {
            const entryId = entry.task_id || `entry_${index}`;
            const tags = this.annotations[entryId] || [];
            const tagString = tags.join('; ');
            const tagCount = tags.length;
            
            // Escape CSV fields
            const escapeCsv = (field) => {
                if (!field) return '';
                const str = String(field);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            
            csvContent += `${escapeCsv(entryId)},${escapeCsv(tagString)},${tagCount},` +
                         `${escapeCsv(entry.original_test_result)},${escapeCsv(entry.refactored_test_result)},` +
                         `${escapeCsv(entry.comparison)}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error_annotation_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.closeModal('exportModal');
    }

    /**
     * Get all unique tags
     */
    getAllUniqueTags() {
        const allTags = new Set();
        Object.values(this.annotations).forEach(tags => {
            tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags);
    }

    /**
     * Get tag usage counts
     */
    getTagUsageCounts() {
        const counts = {};
        Object.values(this.annotations).forEach(tags => {
            tags.forEach(tag => {
                counts[tag] = (counts[tag] || 0) + 1;
            });
        });
        return counts;
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
     * Close modal
     */
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    /**
     * Save annotations to local storage
     */
    saveAnnotationsToStorage() {
        try {
            localStorage.setItem('errorAnnotations', JSON.stringify(this.annotations));
        } catch (error) {
            console.warn('Could not save annotations to local storage:', error);
        }
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

    // Additional methods for advanced export functionality
    importPromptFromText() {
        const textarea = document.getElementById('promptTextInput');
        const text = textarea.value.trim();
        
        if (!text) {
            alert('Please paste some prompt text first!');
            return;
        }
        
        this.importedPrompt = text;
        this.showImportedPrompt(this.importedPrompt);
        textarea.value = '';
        this.updateAssociationButtonState();
    }

    importPromptFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.importedPrompt = e.target.result;
            this.showImportedPrompt(this.importedPrompt);
            this.updateAssociationButtonState();
        };
        reader.readAsText(file);
    }

    showImportedPrompt(prompt) {
        const preview = prompt.length > 200 ? prompt.substring(0, 200) + '...' : prompt;
        document.getElementById('promptPreviewText').textContent = preview;
        document.getElementById('importedPromptInfo').style.display = 'block';
    }

    generateEnhancedPrompt() {
        if (!this.csvData || this.csvData.length === 0) {
            alert('Please load CSV data first to generate enhanced prompts!');
            return;
        }

        // Analyze annotation patterns
        const analysis = this.analyzeAnnotationPatterns();
        
        // Create enhanced prompt
        const basePrompt = this.importedPrompt || `[Your existing prompt text should be placed here at the beginning]`;
        
        const enhancedSection = `

## CRITICAL ERROR PREVENTION ANALYSIS

Based on analysis of ${this.csvData.length} annotated error cases, the following patterns have been identified to help prevent common LLM mistakes:

### Error Patterns Identified from Annotations:

${this.generateErrorPatternSections(analysis)}

### MANDATORY REQUIREMENTS:
1. **Function Signatures**: Always verify the exact number and names of parameters required
2. **Variable Names**: Ensure all variables are properly defined before use  
3. **Return Types**: Match expected return formats exactly
4. **Test Compatibility**: Code must pass the provided test cases without modification
5. **Syntax Validation**: Check for proper Python syntax, indentation, and brackets

### QUALITY CHECKLIST:
- [ ] Function signature matches test calls exactly
- [ ] All variables are defined before use
- [ ] Return format matches expected output
- [ ] No syntax errors or typos
- [ ] Logic handles edge cases properly

Remember: These ${this.csvData.length} errors were identified through careful analysis. Focus on correctness over complexity.`;

        this.generatedPrompt = basePrompt + enhancedSection;
        
        // Display the prompt
        document.getElementById('generatedPromptText').textContent = this.generatedPrompt;
        document.getElementById('promptOutput').style.display = 'block';
        
        // Show statistics
        this.displayExportStats(analysis);
        
        // Enable copy/download buttons
        document.getElementById('copyPromptBtn').disabled = false;
        document.getElementById('downloadPromptBtn').disabled = false;
        this.updateAssociationButtonState();
    }

    analyzeAnnotationPatterns() {
        const tagCounts = this.getTagUsageCounts();
        const totalAnnotated = Object.keys(this.annotations).length;
        const totalEntries = this.csvData.length;
        
        // Categorize error types from annotations
        const errorTypes = {};
        Object.values(this.annotations).forEach(tags => {
            tags.forEach(tag => {
                // Map tags to error categories
                if (tag.toLowerCase().includes('signature') || tag.toLowerCase().includes('argument')) {
                    errorTypes['Function Signature Issues'] = (errorTypes['Function Signature Issues'] || 0) + 1;
                } else if (tag.toLowerCase().includes('logical') || tag.toLowerCase().includes('algorithm')) {
                    errorTypes['Logic/Algorithm Errors'] = (errorTypes['Logic/Algorithm Errors'] || 0) + 1;
                } else if (tag.toLowerCase().includes('syntax') || tag.toLowerCase().includes('environment')) {
                    errorTypes['Syntax/Environment Issues'] = (errorTypes['Syntax/Environment Issues'] || 0) + 1;
                } else {
                    errorTypes['Other Issues'] = (errorTypes['Other Issues'] || 0) + 1;
                }
            });
        });
        
        return {
            totalEntries,
            totalAnnotated,
            tagCounts,
            errorTypes,
            annotationRate: ((totalAnnotated / totalEntries) * 100).toFixed(1)
        };
    }

    generateErrorPatternSections(analysis) {
        let sections = '';
        let count = 1;
        
        // Add insights based on tag analysis
        Object.entries(analysis.errorTypes).forEach(([category, occurrences]) => {
            sections += `\n${count}. **${category}** - ${this.getCategoryDescription(category)}
   Frequency: ${occurrences} instances identified
   Focus Area: ${this.getCategoryFocusArea(category)}\n`;
            count++;
        });
        
        // Add examples from high-frequency tags
        const topTags = Object.entries(analysis.tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
            
        if (topTags.length > 0) {
            sections += `\n### Most Common Annotation Tags:`;
            topTags.forEach(([tag, count]) => {
                sections += `\n• ${tag}: ${count} occurrences`;
            });
        }
        
        return sections;
    }

    getCategoryDescription(category) {
        const descriptions = {
            'Function Signature Issues': 'Wrong number/type of function parameters',
            'Logic/Algorithm Errors': 'Incorrect implementation of algorithm logic',
            'Syntax/Environment Issues': 'Code syntax and environment setup problems',
            'Other Issues': 'Various other coding problems identified'
        };
        return descriptions[category] || 'Code execution issues';
    }

    getCategoryFocusArea(category) {
        const focusAreas = {
            'Function Signature Issues': 'Parameter validation and function call matching',
            'Logic/Algorithm Errors': 'Algorithm correctness and edge case handling',
            'Syntax/Environment Issues': 'Python syntax rules and environment setup',
            'Other Issues': 'General code quality and best practices'
        };
        return focusAreas[category] || 'Code quality improvement';
    }

    generateAnalysisJSON() {
        const analysis = this.analyzeAnnotationPatterns();
        
        const analysisData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                csvFileName: this.currentCSVFile?.name || 'Unknown',
                totalEntries: this.csvData.length,
                annotatedEntries: Object.keys(this.annotations).length,
                analysisType: 'error_annotation_analysis'
            },
            statistics: {
                annotationRate: analysis.annotationRate + '%',
                totalTags: Object.values(analysis.tagCounts).reduce((a, b) => a + b, 0),
                uniqueTags: Object.keys(analysis.tagCounts).length,
                errorTypeBreakdown: analysis.errorTypes
            },
            annotations: this.annotations,
            tagFrequency: analysis.tagCounts,
            csvData: this.csvData.map(entry => ({
                task_id: entry.task_id,
                description: entry.description || entry.task_description,
                original_result: entry.original_test_result,
                refactored_result: entry.refactored_test_result,
                annotations: this.annotations[entry.task_id] || []
            })),
            associations: this.csvAssociations.filter(assoc => 
                assoc.csvFile.name === this.currentCSVFile?.name
            )
        };
        
        this.generatedJSON = JSON.stringify(analysisData, null, 2);
        
        // Display the JSON
        document.getElementById('generatedJsonText').textContent = this.generatedJSON;
        document.getElementById('jsonOutput').style.display = 'block';
        
        // Enable JSON copy/download buttons
        document.getElementById('copyJsonBtn').disabled = false;
        document.getElementById('downloadJsonBtn').disabled = false;
    }

    displayExportStats(analysis) {
        const statsHtml = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${analysis.totalEntries}</div>
                    <div class="stat-label">Total Entries</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${analysis.totalAnnotated}</div>
                    <div class="stat-label">Annotated</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${analysis.annotationRate}%</div>
                    <div class="stat-label">Coverage</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Object.keys(analysis.tagCounts).length}</div>
                    <div class="stat-label">Unique Tags</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Object.keys(analysis.errorTypes).length}</div>
                    <div class="stat-label">Error Types</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.generatedPrompt.length}</div>
                    <div class="stat-label">Prompt Length</div>
                </div>
            </div>
        `;
        
        document.getElementById('exportStatsGrid').innerHTML = statsHtml;
        document.getElementById('exportStatsSection').style.display = 'block';
    }

    copyPromptToClipboard() {
        if (!this.generatedPrompt) {
            alert('Please generate the prompt first!');
            return;
        }
        this.copyToClipboard(this.generatedPrompt, 'Prompt copied to clipboard!');
    }

    copyJSONToClipboard() {
        if (!this.generatedJSON) {
            alert('Please generate the JSON data first!');
            return;
        }
        this.copyToClipboard(this.generatedJSON, 'JSON data copied to clipboard!');
    }

    copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => {
            alert(successMessage);
        }, () => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                alert(successMessage);
            } catch (err) {
                alert('Could not copy to clipboard. Please select and copy manually.');
            }
            
            document.body.removeChild(textArea);
        });
    }

    downloadPrompt() {
        if (!this.generatedPrompt) {
            alert('Please generate the prompt first!');
            return;
        }
        this.downloadFile(this.generatedPrompt, 'enhanced-prompt', 'txt', 'text/plain');
    }

    downloadJSON() {
        if (!this.generatedJSON) {
            alert('Please generate the JSON data first!');
            return;
        }
        this.downloadFile(this.generatedJSON, 'error-analysis-data', 'json', 'application/json');
    }

    downloadFile(content, baseName, extension, mimeType) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `${baseName}-${timestamp}.${extension}`;
        
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    associateCurrentCSVWithPrompt() {
        if (!this.currentCSVFile) {
            alert('Please load a CSV file first!');
            return;
        }
        
        if (!this.importedPrompt && !this.generatedPrompt) {
            alert('Please import a prompt or generate an enhanced prompt first!');
            return;
        }
        
        const association = {
            id: Date.now(),
            csvFile: this.currentCSVFile,
            prompt: this.importedPrompt || this.generatedPrompt,
            associationDate: new Date().toISOString(),
            promptType: this.importedPrompt ? 'imported' : 'generated',
            annotationCount: Object.keys(this.annotations).length
        };
        
        this.csvAssociations.push(association);
        localStorage.setItem('csvAssociations', JSON.stringify(this.csvAssociations));
        
        alert('CSV file successfully associated with prompt!');
        this.updateAssociationButtonState();
    }

    viewAssociations() {
        const container = document.getElementById('associationsDisplay');
        
        if (this.csvAssociations.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No CSV-prompt associations found.</p>';
            container.style.display = 'block';
            return;
        }
        
        let html = '';
        this.csvAssociations.forEach(assoc => {
            const date = new Date(assoc.associationDate).toLocaleDateString();
            
            html += `
                <div class="association-item">
                    <div class="association-info">
                        <div class="association-file">${assoc.csvFile.name}</div>
                        <div class="association-date">Associated: ${date} (${assoc.promptType}, ${assoc.annotationCount || 0} annotations)</div>
                    </div>
                    <div class="association-actions">
                        <button class="action-btn-small view" onclick="errorAnnotator.viewAssociation(${assoc.id})">View</button>
                        <button class="action-btn-small remove" onclick="errorAnnotator.removeAssociation(${assoc.id})">Remove</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        container.style.display = 'block';
    }

    viewAssociation(id) {
        const assoc = this.csvAssociations.find(a => a.id === id);
        if (!assoc) return;
        
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
            <html>
            <head><title>Associated Prompt - ${assoc.csvFile.name}</title></head>
            <body style="font-family: Arial, sans-serif; margin: 20px;">
                <h2>Associated Prompt for: ${assoc.csvFile.name}</h2>
                <p><strong>Association Date:</strong> ${new Date(assoc.associationDate).toLocaleString()}</p>
                <p><strong>Prompt Type:</strong> ${assoc.promptType}</p>
                <p><strong>Annotations:</strong> ${assoc.annotationCount || 0}</p>
                <hr>
                <pre style="white-space: pre-wrap; background: #f8f9fa; padding: 20px; border-radius: 5px;">${assoc.prompt}</pre>
            </body>
            </html>
        `);
    }

    removeAssociation(id) {
        if (!confirm('Are you sure you want to remove this association?')) return;
        
        this.csvAssociations = this.csvAssociations.filter(a => a.id !== id);
        localStorage.setItem('csvAssociations', JSON.stringify(this.csvAssociations));
        this.viewAssociations(); // Refresh the list
    }

    updateAssociationButtonState() {
        const hasPrompt = !!(this.importedPrompt || this.generatedPrompt);
        const hasCSV = !!this.currentCSVFile;
        
        const btn = document.getElementById('associateCurrentBtn');
        if (btn) {
            btn.disabled = !(hasPrompt && hasCSV);
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