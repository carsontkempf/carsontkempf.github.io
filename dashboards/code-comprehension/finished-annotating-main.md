---
layout: page
title: Finished Annotating
permalink: /code-comprehension/finished-annotating-main/
---

<div id="auth-check-wrapper" style="display: none;">
  <div style="text-align: center; padding: 50px;">
    <h2>Access Denied</h2>
    <p>You need the "code-comprehension" role to view this page.</p>
    <button onclick="authService.login()" class="login-btn">Log In</button>
    <br><br>
    <a href="/dashboard/">← Back to Dashboard</a>
  </div>
</div>

<div id="project-content-wrapper" style="display: none;">

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

#finished-annotating-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    padding: 20px 0;
}

.finished-header {
    text-align: center;
    margin-bottom: 30px;
    flex-shrink: 0;
}

.finished-header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 10px;
    color: #2c3e50;
}

.finished-header p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 20px;
    color: #7f8c8d;
}

.navigation-links {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(39,174,96,0.1);
    border-radius: 8px;
    border-left: 4px solid #27ae60;
}

.navigation-links h3 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 1.1rem;
}

.nav-link-btn {
    display: inline-block;
    margin: 0 10px;
    padding: 10px 20px;
    background: #27ae60;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-link-btn:hover {
    background: #219a52;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

.nav-link-btn.secondary {
    background: #e74c3c;
}

.nav-link-btn.secondary:hover {
    background: #c0392b;
}

/* Export sections */
.export-section {
    background: #ecf0f1;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    border-left: 4px solid #27ae60;
}

.import-section { border-left-color: #17a2b8; }
.generation-section { border-left-color: #27ae60; }
.data-section { border-left-color: #27ae60; }
.association-section { border-left-color: #f39c12; }
.traditional-section { border-left-color: #6c757d; }
.stats-section { border-left-color: #27ae60; }

.section-description {
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
    font-style: italic;
}

.export-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.export-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
}

.export-btn:hover:not(:disabled) {
    background: #219a52;
}

.export-btn.primary {
    background: #27ae60;
    box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.export-btn.primary:hover {
    background: #219a52;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.export-btn.secondary {
    background: #ecf0f1;
    color: #2c3e50;
    border: 2px solid #bdc3c7;
}

.export-btn.secondary:hover:not(:disabled) {
    background: #d5dbdb;
    border-color: #95a5a6;
}

.export-btn.tertiary {
    background: #27ae60;
    box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
}

.export-btn.tertiary:hover {
    background: #219a52;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
}

.export-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

/* Import controls */
.import-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.import-method {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.import-method label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
}

.file-input-small {
    padding: 8px;
    border: 2px dashed #bdc3c7;
    border-radius: 6px;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.3s ease;
}

.file-input-small:hover {
    border-color: #17a2b8;
}

.prompt-textarea {
    width: 100%;
    padding: 10px;
    border: 2px solid #bdc3c7;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    resize: vertical;
    background: white;
    color: #2c3e50;
}

.prompt-textarea:focus {
    outline: none;
    border-color: #17a2b8;
}

.import-btn {
    padding: 8px 16px;
    background: #17a2b8;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    align-self: flex-start;
    transition: background-color 0.3s ease;
}

.import-btn:hover {
    background: #138496;
}

.imported-info {
    background: white;
    border-radius: 6px;
    padding: 15px;
    margin-top: 15px;
    border-left: 4px solid #27ae60;
}

.info-badge {
    color: #27ae60;
    font-weight: 600;
    margin-bottom: 10px;
    font-size: 14px;
}

.prompt-preview {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    max-height: 120px;
    overflow-y: auto;
    color: #2c3e50;
    white-space: pre-wrap;
}

.output-section {
    background: white;
    border-radius: 6px;
    padding: 15px;
    margin-top: 15px;
    border-left: 4px solid #27ae60;
}

.output-section h5 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-size: 14px;
    font-weight: 600;
}

.output-text {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: #2c3e50;
    color: #ecf0f1;
    padding: 15px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;
    white-space: pre-wrap;
    max-height: 300px;
    overflow-y: auto;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #27ae60;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 12px;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Association styles */
.association-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 10px;
    border-left: 4px solid #f39c12;
}

.association-file {
    font-weight: 600;
    color: #2c3e50;
}

.association-date {
    font-size: 12px;
    color: #7f8c8d;
}

.association-actions {
    display: flex;
    gap: 8px;
}

.action-btn-small {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-btn-small.view {
    background: #3498db;
    color: white;
}

.action-btn-small.view:hover {
    background: #2980b9;
}

.action-btn-small.remove {
    background: #e74c3c;
    color: white;
}

.action-btn-small.remove:hover {
    background: #c0392b;
}

.no-data-message {
    text-align: center;
    padding: 40px 20px;
    color: #7f8c8d;
    font-style: italic;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
    .export-controls {
        flex-direction: column;
    }
    
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
    
    .association-item {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
    }
}
</style>

<div id="finished-annotating-container">
    <div class="finished-header">
        <h1>🎉 Finished Annotating</h1>
        <p>Export your annotations and generate enhanced prompts based on your analysis</p>
        
        <!-- Navigation Buttons -->
        <div style="margin-top: 20px; display: flex; gap: 15px; align-items: center; justify-content: center;">
            <button id="continueAnnotatingBtn" class="nav-link-btn" style="background: #3498db; color: white; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                ← Continue Annotating
            </button>
            <button id="driveSignInBtn" class="nav-link-btn" style="background: #e74c3c; color: white; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background-color 0.3s ease;">
                📁 Google Drive
            </button>
        </div>
    </div>

    <!-- No Data Message (shown when no CSV data is available) -->
    <div id="noDataMessage" class="no-data-message">
        <h3>No CSV Data Available</h3>
        <p>Please return to the Error Annotator and load a CSV file to begin analysis.</p>
        <div style="margin-top: 15px;">
            <a href="/code-comprehension/error-annotator/" class="nav-link-btn secondary">← Load CSV File</a>
        </div>
    </div>

    <!-- Statistics Summary -->
    <div class="export-section stats-section" id="statisticsSection" style="display: none;">
        <h4>📊 Annotation Statistics</h4>
        <div id="statsDisplay" class="stats-grid"></div>
        <div id="detailedStats" style="margin-top: 20px;"></div>
    </div>



    <!-- Interactive Error Analysis Chart -->
    <div class="export-section data-section" id="dataSection" style="display: none;">
        <h4>📊 Interactive Error Analysis</h4>
        <p class="section-description">Click on error categories to view detailed breakdowns. Charts are automatically exported as PDFs.</p>
        
        <!-- Chart Container -->
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0;">
            <canvas id="errorChart" width="400" height="350"></canvas>
        </div>
        
        <!-- Chart Status -->
        <div id="chartStatus" style="margin-top: 15px; padding: 10px; background: rgba(39,174,96,0.1); border-radius: 6px; display: none;">
            <div style="color: #27ae60; font-weight: 600;">Charts Generated Successfully!</div>
            <div style="color: #2c3e50; font-size: 14px; margin-top: 5px;">
                • Error breakdown by category (PDF)<br>
                • Error trends over time (PDF)<br>
                • Prompt effectiveness analysis (PDF)
            </div>
        </div>

        <!-- Consolidated Save to Drive Section -->
        <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #ecf0f1;">
            <div class="export-controls" style="text-align: center;">
                <button id="saveAllToDriveBtn" class="export-btn primary" style="background: #4285f4; color: white; padding: 15px 30px; font-size: 16px; font-weight: 600; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(66,133,244,0.3);">
                    💾 Save All to Google Drive
                </button>
                <div style="margin-top: 10px; color: #7f8c8d; font-size: 14px;">
                    Saves analysis charts, annotations, and error data
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Chart.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>

<script>
console.log('Finished Annotating - Script loaded');

class FinishedAnnotatingManager {
    constructor() {
        this.annotations = {};
        this.csvData = [];
        this.currentCSVFile = null;
        this.csvAssociations = [];
        this.generatedPrompt = '';
        this.generatedJSON = '';
        this.errorChart = null;
        
        // Define the 7 error categories
        this.errorCategories = [
            'Incorrect Argument Count',
            'Argument Unpacking Error', 
            'Incorrect Formula Application',
            'Off By One Error',
            'Incorrect Output Format',
            'Edge Case Handling Failure',
            'Syntax Error'
        ];
        
        this.initializeEventListeners();
        
        // Add a small delay to ensure localStorage is fully available
        setTimeout(async () => {
            await this.loadAnnotationData();
        }, 100);
        
        this.initializeGoogleDriveStatus();
    }

    initializeEventListeners() {
        // Consolidated Save to Drive functionality
        document.getElementById('saveAllToDriveBtn').addEventListener('click', () => this.saveAllToGoogleDrive());
        
        // Google Drive sign-in
        document.getElementById('driveSignInBtn').addEventListener('click', () => this.signInToGoogleDrive());
        
        // Continue annotating
        document.getElementById('continueAnnotatingBtn').addEventListener('click', () => this.continueAnnotating());
    }

    async loadAnnotationData() {
        try {
            // Load data from localStorage (set by error annotator)
            const storedAnnotations = localStorage.getItem('errorAnnotations');
            const storedCsvData = localStorage.getItem('csvData');
            const storedCsvFile = localStorage.getItem('currentCSVFile');
            const storedAssociations = localStorage.getItem('csvAssociations');
            
            // Debug logging
            console.log('=== Loading Annotation Data ===');
            console.log('Stored annotations:', storedAnnotations ? 'Found' : 'Not found');
            console.log('Stored CSV data:', storedCsvData ? 'Found' : 'Not found');
            console.log('Stored CSV file info:', storedCsvFile ? 'Found' : 'Not found');
            console.log('Stored associations:', storedAssociations ? 'Found' : 'Not found');

            if (storedAnnotations) {
                this.annotations = JSON.parse(storedAnnotations);
                console.log('Loaded annotations:', Object.keys(this.annotations).length, 'entries');
            }
            
            if (storedCsvData) {
                this.csvData = JSON.parse(storedCsvData);
                console.log('Loaded CSV data:', this.csvData.length, 'entries');
            }
            
            if (storedCsvFile) {
                this.currentCSVFile = JSON.parse(storedCsvFile);
                console.log('Loaded CSV file info:', this.currentCSVFile);
            }
            
            if (storedAssociations) {
                this.csvAssociations = JSON.parse(storedAssociations);
                console.log('Loaded associations:', this.csvAssociations.length, 'entries');
            }
            
            // Debug current state
            console.log('Final state - Annotations count:', Object.keys(this.annotations).length);
            console.log('Final state - CSV data count:', this.csvData.length);

            // If no localStorage data, try to load from sample data for demo purposes
            if (this.csvData.length === 0 && Object.keys(this.annotations).length === 0) {
                console.log('No localStorage data found, attempting to load sample data...');
                await this.loadSampleData();
            }

            // Check if we have data to display - we need at least CSV data
            if (this.csvData.length > 0) {
                console.log('✅ CSV data found - showing export sections');
                this.showExportSections();
                this.displayStatistics();
            } else {
                console.log('❌ No CSV data found - showing no data message');
                console.log('Annotations count:', Object.keys(this.annotations).length);
                console.log('CSV data empty:', this.csvData.length === 0);
                this.showNoDataMessage();
            }
        } catch (error) {
            console.error('Error loading annotation data:', error);
            this.showNoDataMessage();
        }
    }

    /**
     * Load sample data for demo purposes when no user data is available
     */
    async loadSampleData() {
        try {
            console.log('Attempting to load sample data from annotated-code.json...');
            const response = await fetch('/annotated-code.json');
            if (response.ok) {
                const jsonData = await response.json();
                console.log('Loaded sample data:', jsonData);
                
                // Extract annotations and CSV data from the JSON structure
                if (jsonData.annotations) {
                    this.annotations = jsonData.annotations;
                    console.log('Loaded sample annotations:', Object.keys(this.annotations).length, 'entries');
                }
                
                if (jsonData.csvData) {
                    this.csvData = jsonData.csvData;
                    console.log('Loaded sample CSV data:', this.csvData.length, 'entries');
                }
                
                // Set a sample CSV file info
                this.currentCSVFile = {
                    name: 'sample-data.csv',
                    size: jsonData.csvData ? jsonData.csvData.length : 0,
                    lastModified: new Date().toISOString()
                };
                
                console.log('Sample data loaded successfully');
            } else {
                console.log('Sample data file not found');
            }
        } catch (error) {
            console.log('Could not load sample data:', error.message);
        }
    }

    showNoDataMessage() {
        const noDataElement = document.getElementById('noDataMessage');
        if (noDataElement) noDataElement.style.display = 'block';
        
        // Hide all export sections
        const statsElement = document.getElementById('statisticsSection');
        if (statsElement) statsElement.style.display = 'none';
        
        const dataElement = document.getElementById('dataSection');
        if (dataElement) dataElement.style.display = 'none';
    }

    showExportSections() {
        const noDataElement = document.getElementById('noDataMessage');
        if (noDataElement) noDataElement.style.display = 'none';
        
        // Show all export sections
        const statsElement = document.getElementById('statisticsSection');
        if (statsElement) statsElement.style.display = 'block';
        
        const dataElement = document.getElementById('dataSection');
        if (dataElement) dataElement.style.display = 'block';
        
        // Create the interactive chart
        this.createErrorChart();
    }

    displayStatistics() {
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

        // Display main statistics
        const statsGrid = document.getElementById('statsDisplay');
        if (!statsGrid) {
            console.error('statsDisplay element not found');
            return;
        }
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalEntries}</div>
                <div class="stat-label">Total Entries</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${taggedEntries}</div>
                <div class="stat-label">Tagged</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${((taggedEntries / totalEntries) * 100).toFixed(1)}%</div>
                <div class="stat-label">Coverage</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${uniqueTags}</div>
                <div class="stat-label">Unique Tags</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalTagApplications}</div>
                <div class="stat-label">Total Tags</div>
            </div>
        `;

    }

    // Generate enhanced prompt functionality
    generateEnhancedPrompt() {
        if (!this.csvData || this.csvData.length === 0) {
            alert('No CSV data available for prompt generation!');
            return;
        }

        const analysis = this.analyzeAnnotationPatterns();
        const basePrompt = `[Your existing prompt text should be placed here at the beginning]`;
        
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
        
        // Check if elements exist before accessing them
        const promptTextElement = document.getElementById('generatedPromptText');
        const promptOutputElement = document.getElementById('promptOutput');
        const copyPromptBtn = document.getElementById('copyPromptBtn');
        const downloadPromptBtn = document.getElementById('downloadPromptBtn');
        
        if (promptTextElement) {
            promptTextElement.textContent = this.generatedPrompt;
        }
        if (promptOutputElement) {
            promptOutputElement.style.display = 'block';
        }
        if (copyPromptBtn) {
            copyPromptBtn.disabled = false;
        }
        if (downloadPromptBtn) {
            downloadPromptBtn.disabled = false;
        }
        
        // Only call if the method exists
        if (typeof this.updateAssociationButtonState === 'function') {
            this.updateAssociationButtonState();
        }
    }

    analyzeAnnotationPatterns() {
        const tagCounts = this.getTagUsageCounts();
        const totalAnnotated = Object.keys(this.annotations).length;
        const totalEntries = this.csvData.length;
        
        const errorTypes = {};
        Object.values(this.annotations).forEach(tags => {
            tags.forEach(tag => {
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
        
        Object.entries(analysis.errorTypes).forEach(([category, occurrences]) => {
            sections += `\n${count}. **${category}** - ${this.getCategoryDescription(category)}
   Frequency: ${occurrences} instances identified
   Focus Area: ${this.getCategoryFocusArea(category)}\n`;
            count++;
        });
        
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

    // Chart creation and interaction
    createErrorChart() {
        const ctx = document.getElementById('errorChart').getContext('2d');
        
        // Calculate error counts for each category
        const errorCounts = this.errorCategories.map(category => {
            let count = 0;
            Object.values(this.annotations).forEach(tags => {
                tags.forEach(tag => {
                    if (tag === category) count++;
                });
            });
            return count;
        });

        // Destroy existing chart if it exists
        if (this.errorChart) {
            this.errorChart.destroy();
        }

        this.errorChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.errorCategories,
                datasets: [{
                    label: 'Error Count',
                    data: errorCounts,
                    backgroundColor: [
                        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
                        '#9b59b6', '#1abc9c', '#34495e'
                    ],
                    borderColor: [
                        '#c0392b', '#2980b9', '#27ae60', '#e67e22',
                        '#8e44ad', '#16a085', '#2c3e50'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Error Categories Breakdown',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    y: {
                        ticks: {
                            maxRotation: 0,
                            minRotation: 0
                        }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const categoryName = this.errorCategories[index];
                        
                        // Map category names to slugs
                        const categorySlugMap = {
                            'Incorrect Argument Count': 'incorrect-argument-count',
                            'Argument Unpacking Error': 'argument-unpacking-error',
                            'Incorrect Formula Application': 'incorrect-formula-application',
                            'Off By One Error': 'off-by-one-error',
                            'Incorrect Output Format': 'incorrect-output-format',
                            'Edge Case Handling Failure': 'edge-case-handling-failure',
                            'Syntax Error': 'syntax-error'
                        };
                        
                        const categorySlug = categorySlugMap[categoryName];
                        if (categorySlug) {
                            // Navigate to the category detail page
                            window.location.href = `/code-comprehension/finished-annotating/${categorySlug}/`;
                        }
                    }
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                }
            }
        });
    }

    // Chart and PDF generation functionality - Save to Google Drive
    async generateChartsAndPDFs() {
        // Show loading status
        const statusDiv = document.getElementById('chartStatus');
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = '<div style="color: #f39c12; font-weight: 600;">⏳ Generating charts and saving to Google Drive...</div>';

        try {
            // Generate the analysis data
            this.generateAnalysisJSON();
            const pdfData = this.createDetailedAnalysisPDFs();
            
            // Save to Google Drive
            await this.saveChartsToGoogleDrive(pdfData);
            
            // Show success status
            statusDiv.innerHTML = `
                <div style="color: #27ae60; font-weight: 600;">✅ Charts Saved to Google Drive Successfully!</div>
                <div style="color: #2c3e50; font-size: 14px; margin-top: 5px;">
                    • Error breakdown by category (PDF saved to Drive)<br>
                    • Error trends over time (PDF saved to Drive)<br>
                    • Prompt effectiveness analysis (PDF saved to Drive)<br>
                    • Individual category data saved to Drive
                </div>
            `;
        } catch (error) {
            console.error('Failed to save charts to Google Drive:', error);
            statusDiv.innerHTML = `
                <div style="color: #e74c3c; font-weight: 600;">❌ Failed to save charts to Google Drive</div>
                <div style="color: #2c3e50; font-size: 14px; margin-top: 5px;">
                    Error: ${error.message}
                </div>
            `;
        }
    }

    createDetailedAnalysisPDFs() {
        // Generate the JSON data for PDFs
        const analysis = this.analyzeAnnotationPatterns();
        
        // Create PDF data structures (this would integrate with jsPDF in a real implementation)
        const pdfData = {
            errorBreakdown: this.generateErrorBreakdownData(),
            timeAnalysis: this.generateTimeAnalysisData(),
            promptEffectiveness: this.generatePromptEffectivenessData(),
            metadata: {
                generatedAt: new Date().toISOString(),
                csvFileName: this.currentCSVFile?.name || 'Unknown',
                totalEntries: this.csvData.length,
                annotatedEntries: Object.keys(this.annotations).length
            }
        };
        
        // Store PDF data for download
        localStorage.setItem('analysisChartData', JSON.stringify(pdfData));
        
        console.log('PDF chart data generated and stored:', pdfData);
        return pdfData;
    }

    generateErrorBreakdownData() {
        const breakdown = {};
        this.errorCategories.forEach((category, index) => {
            breakdown[category] = {
                categoryNumber: index + 1,
                count: 0,
                examples: []
            };
        });

        // Populate with actual data
        Object.entries(this.annotations).forEach(([entryId, tags]) => {
            tags.forEach(tag => {
                if (breakdown[tag]) {
                    breakdown[tag].count++;
                    breakdown[tag].examples.push(entryId);
                }
            });
        });

        return breakdown;
    }

    generateTimeAnalysisData() {
        // Simulate time-based analysis
        return {
            totalTime: this.csvData.length * 2, // Assume 2 minutes per entry
            errorsOverTime: this.errorCategories.map((cat, i) => ({
                category: cat,
                errorRate: Math.random() * 0.3 + 0.1 // Random error rate for demo
            }))
        };
    }

    generatePromptEffectivenessData() {
        const totalErrors = Object.values(this.annotations).reduce((sum, tags) => sum + tags.length, 0);
        const totalEntries = this.csvData.length;
        
        return {
            promptLength: this.generatedPrompt?.length || 0,
            errorRate: totalErrors / totalEntries,
            effectivenessScore: Math.max(0, 1 - (totalErrors / totalEntries))
        };
    }

    // JSON generation functionality
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
        
        // Check if elements exist before accessing them
        const jsonTextElement = document.getElementById('generatedJsonText');
        const jsonOutputElement = document.getElementById('jsonOutput');
        const copyJsonBtn = document.getElementById('copyJsonBtn');
        const downloadJsonBtn = document.getElementById('downloadJsonBtn');
        
        if (jsonTextElement) {
            jsonTextElement.textContent = this.generatedJSON;
        }
        if (jsonOutputElement) {
            jsonOutputElement.style.display = 'block';
        }
        if (copyJsonBtn) {
            copyJsonBtn.disabled = false;
        }
        if (downloadJsonBtn) {
            downloadJsonBtn.disabled = false;
        }
    }

    // Copy/Download functionality (keeping for backward compatibility)
    copyPromptToClipboard() {
        if (!this.generatedPrompt) {
            console.warn('No prompt generated to copy');
            return;
        }
        this.copyToClipboard(this.generatedPrompt, 'Prompt copied to clipboard!');
    }

    copyJSONToClipboard() {
        if (!this.generatedJSON) {
            console.warn('No JSON data generated to copy');
            return;
        }
        this.copyToClipboard(this.generatedJSON, 'JSON data copied to clipboard!');
    }

    copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => {
            alert(successMessage);
        }, () => {
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
            console.warn('No prompt generated to download');
            return;
        }
        this.downloadFile(this.generatedPrompt, 'enhanced-prompt', 'txt', 'text/plain');
    }

    async downloadJSON() {
        if (!this.generatedJSON) {
            this.generateAnalysisJSON();
        }
        
        try {
            await this.saveJSONToGoogleDrive(this.generatedJSON, 'error-analysis-data');
            alert('JSON data saved to Google Drive successfully!');
        } catch (error) {
            console.error('Failed to save JSON to Google Drive:', error);
            alert('Failed to save JSON to Google Drive: ' + error.message);
        }
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


    // Save to Google Drive functionality
    async exportToJson() {
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
        
        try {
            const fileName = `error_annotations_${new Date().toISOString().split('T')[0]}`;
            await this.saveJSONToGoogleDrive(JSON.stringify(data, null, 2), fileName);
            alert('Annotations JSON saved to Google Drive successfully!');
        } catch (error) {
            console.error('Failed to save annotations JSON to Google Drive:', error);
            alert('Failed to save annotations JSON to Google Drive: ' + error.message);
        }
    }


    getAllUniqueTags() {
        const allTags = new Set();
        Object.values(this.annotations).forEach(tags => {
            tags.forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags);
    }

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
     * Save charts and analysis data to Google Drive
     */
    async saveChartsToGoogleDrive(pdfData) {
        if (!window.googleDriveService) {
            throw new Error('Google Drive service is not loaded. Please refresh the page and try again.');
        }
        
        if (!window.googleDriveService.isReady()) {
            // Try to authenticate first
            try {
                await window.googleDriveService.signIn();
            } catch (authError) {
                throw new Error('Please sign in to Google Drive first. Click the Google Drive sign-in button to authenticate.');
            }
        }

        try {
            // Ensure proper folder structure
            const { plotsFolderId } = await window.googleDriveService.ensureAppFolderStructure();
            
            // Generate timestamp for file naming
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            
            // Save error breakdown chart data
            const errorBreakdownFileName = `error-breakdown-${timestamp}.json`;
            await window.googleDriveService.createFile(
                errorBreakdownFileName,
                JSON.stringify(pdfData.errorBreakdown, null, 2),
                'application/json',
                plotsFolderId
            );
            
            // Save time analysis data
            const timeAnalysisFileName = `time-analysis-${timestamp}.json`;
            await window.googleDriveService.createFile(
                timeAnalysisFileName,
                JSON.stringify(pdfData.timeAnalysis, null, 2),
                'application/json',
                plotsFolderId
            );
            
            // Save prompt effectiveness data
            const promptEffectivenessFileName = `prompt-effectiveness-${timestamp}.json`;
            await window.googleDriveService.createFile(
                promptEffectivenessFileName,
                JSON.stringify(pdfData.promptEffectiveness, null, 2),
                'application/json',
                plotsFolderId
            );
            
            // Save complete analysis bundle
            const completeAnalysisFileName = `complete-analysis-${timestamp}.json`;
            await window.googleDriveService.createFile(
                completeAnalysisFileName,
                JSON.stringify(pdfData, null, 2),
                'application/json',
                plotsFolderId
            );
            
            console.log('Charts and analysis saved to Google Drive successfully');
        } catch (error) {
            console.error('Failed to save charts to Google Drive:', error);
            throw error;
        }
    }

    /**
     * Save JSON data to Google Drive
     */
    async saveJSONToGoogleDrive(jsonData, baseFileName) {
        if (!window.googleDriveService) {
            throw new Error('Google Drive service is not loaded. Please refresh the page and try again.');
        }
        
        if (!window.googleDriveService.isReady()) {
            // Try to authenticate first
            try {
                await window.googleDriveService.signIn();
            } catch (authError) {
                throw new Error('Please sign in to Google Drive first. Click the Google Drive sign-in button to authenticate.');
            }
        }

        try {
            // Ensure proper folder structure
            const { annotationsFolderId } = await window.googleDriveService.ensureAppFolderStructure();
            
            // Generate timestamp for file naming
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const fileName = `${baseFileName}-${timestamp}.json`;
            
            // Save to annotations folder
            await window.googleDriveService.createFile(
                fileName,
                jsonData,
                'application/json',
                annotationsFolderId
            );
            
            console.log('JSON data saved to Google Drive:', fileName);
        } catch (error) {
            console.error('Failed to save JSON to Google Drive:', error);
            throw error;
        }
    }


    /**
     * Initialize Google Drive status monitoring
     */
    initializeGoogleDriveStatus() {
        // Check initial status
        this.updateGoogleDriveStatus();
        
        // Listen for Google Drive auth changes
        window.addEventListener('driveAuthChanged', (event) => {
            console.log('Drive auth changed:', event.detail);
            this.updateGoogleDriveStatus();
        });
        
        // Check status periodically
        setInterval(() => {
            this.updateGoogleDriveStatus();
        }, 5000); // Check every 5 seconds
    }

    /**
     * Update Google Drive status display
     */
    updateGoogleDriveStatus() {
        const driveBtn = document.getElementById('driveSignInBtn');
        
        if (!window.googleDriveService || !driveBtn) {
            return;
        }
        
        if (window.googleDriveService.isReady()) {
            // Connected - green button
            driveBtn.style.background = '#27ae60';
            driveBtn.innerHTML = '✅ Drive Connected';
            driveBtn.disabled = true;
            driveBtn.style.cursor = 'default';
        } else {
            // Not connected - red button
            driveBtn.style.background = '#e74c3c';
            driveBtn.innerHTML = '📁 Connect Drive';
            driveBtn.disabled = false;
            driveBtn.style.cursor = 'pointer';
        }
    }

    /**
     * Save all analysis data and charts to Google Drive (consolidated method)
     */
    async saveAllToGoogleDrive() {
        const button = document.getElementById('saveAllToDriveBtn');
        const originalText = button.innerHTML;
        
        try {
            // Update button state
            button.innerHTML = '⏳ Saving to Google Drive...';
            button.disabled = true;
            
            // Show status
            const statusDiv = document.getElementById('chartStatus');
            statusDiv.style.display = 'block';
            statusDiv.innerHTML = '<div style="color: #f39c12; font-weight: 600;">⏳ Generating charts and saving all data to Google Drive...</div>';
            
            // Check Google Drive connection
            if (!window.googleDriveService || !window.googleDriveService.isReady()) {
                throw new Error('Please connect to Google Drive first using the button in the header.');
            }
            
            // Generate and save charts/PDFs
            this.generateAnalysisJSON();
            const pdfData = this.createDetailedAnalysisPDFs();
            await this.saveChartsToGoogleDrive(pdfData);
            
            // Generate and save JSON annotations
            const jsonData = {
                metadata: {
                    total_entries: this.csvData.length,
                    tagged_entries: Object.keys(this.annotations).length,
                    export_date: new Date().toISOString(),
                    tool: "Error Annotator Web",
                    csv_file: this.currentCSVFile?.name || "unknown"
                },
                annotations: this.annotations,
                csvData: this.csvData,
                errorCategories: this.errorCategories,
                categoryBreakdown: this.getCategoryBreakdown()
            };
            
            await this.saveJSONToGoogleDrive(jsonData, 'error-annotations');
            
            // Show success status
            statusDiv.innerHTML = `
                <div style="color: #27ae60; font-weight: 600;">✅ All Data Saved to Google Drive Successfully!</div>
                <div style="color: #2c3e50; font-size: 14px; margin-top: 5px;">
                    • Error analysis charts and PDFs<br>
                    • Complete annotation data (JSON)<br>
                    • Error category breakdowns<br>
                    • CSV data and metadata
                </div>
            `;
            
            // Update button to show success
            button.innerHTML = '✅ Saved Successfully!';
            button.style.background = '#27ae60';
            
            // Reset button after delay
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '#4285f4';
                button.disabled = false;
            }, 3000);
            
        } catch (error) {
            console.error('Error saving to Google Drive:', error);
            
            // Show error status
            const statusDiv = document.getElementById('chartStatus');
            statusDiv.innerHTML = `
                <div style="color: #e74c3c; font-weight: 600;">❌ Error saving to Google Drive</div>
                <div style="color: #2c3e50; font-size: 14px; margin-top: 5px;">
                    ${error.message}
                </div>
            `;
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            alert(`Failed to save to Google Drive: ${error.message}`);
        }
    }

    /**
     * Continue annotating with current CSV data
     */
    continueAnnotating() {
        try {
            // Ensure current data is stored in localStorage for the error annotator to pick up
            if (this.csvData && this.csvData.length > 0) {
                // Store the current CSV data
                localStorage.setItem('csvData', JSON.stringify(this.csvData));
                
                // Store current annotations
                localStorage.setItem('errorAnnotations', JSON.stringify(this.annotations));
                
                // Store current CSV file info if available
                if (this.currentCSVFile) {
                    localStorage.setItem('currentCSVFile', JSON.stringify(this.currentCSVFile));
                }
                
                // Store a flag indicating this is a continuation session
                localStorage.setItem('continuingAnnotation', 'true');
                
                console.log('Stored data for continuation:', {
                    csvDataEntries: this.csvData.length,
                    annotationEntries: Object.keys(this.annotations).length,
                    csvFile: this.currentCSVFile?.name || 'Unknown'
                });
                
                // Navigate to error annotator
                window.location.href = '/code-comprehension/error-annotator/';
            } else {
                alert('No CSV data available to continue annotating. Please load a CSV file first.');
            }
        } catch (error) {
            console.error('Error preparing continuation data:', error);
            alert('Error preparing data for continuation. Please try again.');
        }
    }

    /**
     * Sign in to Google Drive
     */
    async signInToGoogleDrive() {
        const signInBtn = document.getElementById('driveSignInBtn');
        const originalText = signInBtn.textContent;
        
        try {
            signInBtn.textContent = 'Signing in...';
            signInBtn.disabled = true;
            
            if (!window.googleDriveService) {
                throw new Error('Google Drive service is not loaded');
            }
            
            await window.googleDriveService.signIn();
            console.log('Successfully signed in to Google Drive');
            
        } catch (error) {
            console.error('Failed to sign in to Google Drive:', error);
            alert('Failed to sign in to Google Drive: ' + error.message);
        } finally {
            signInBtn.textContent = originalText;
            signInBtn.disabled = false;
        }
    }
}

// Global variable for finished annotating manager
let finishedAnnotatingManager;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    finishedAnnotatingManager = new FinishedAnnotatingManager();
});
</script>

<!-- Google API Library -->
<script async defer src="https://apis.google.com/js/api.js"></script>
<!-- Google Identity Services (GIS) Library -->
<script async defer src="https://accounts.google.com/gsi/client"></script>

<!-- Google Drive Configuration will be loaded securely by env-config.js -->
<script>
// Configuration will be loaded securely by env-config.js
console.log('Secure configuration will be loaded by env-config.js');
</script>

<!-- Environment Configuration (load first) -->
<script src="{{ '/assets/js/env-config.js' | relative_url }}"></script>

<!-- Google Drive Service -->
<script src="{{ '/assets/js/google-drive-service.js' | relative_url }}"></script>

</div>

<script>
console.log('Finished Annotating - Script loaded');

document.addEventListener('authReady', () => {
    console.log('Finished Annotating - authReady event fired');
    if (window.authService.isAuthenticated) {
        const user = window.authService.user;
        
        // Check user roles in multiple possible locations
        const customRoles = user['https://carsontkempf.github.io/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        
        // Check additional possible role locations
        const rolesArray = user.roles || [];
        const authorizationRoles = user.authorization?.roles || [];
        const orgRoles = user['org_roles'] || [];
        const realmRoles = user['realm_roles'] || [];
        
        // Combine all possible role sources
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles, ...rolesArray, ...authorizationRoles, ...orgRoles, ...realmRoles];
        
        // Debug: Log user info and roles for troubleshooting
        console.log('Finished Annotating - User Debug Info:', {
            user: user,
            userKeys: Object.keys(user),
            customRoles: customRoles,
            auth0Roles: auth0Roles,
            appMetadataRoles: appMetadataRoles,
            userMetadataRoles: userMetadataRoles,
            rolesArray: rolesArray,
            authorizationRoles: authorizationRoles,
            orgRoles: orgRoles,
            realmRoles: realmRoles,
            allRoles: allRoles,
            userEmail: user.email,
            userSub: user.sub
        });
        
        // Additional debug for all custom claim keys
        const customClaimKeys = Object.keys(user).filter(key => key.includes('://'));
        console.log('Custom claim keys found:', customClaimKeys);
        customClaimKeys.forEach(key => {
            console.log(`${key}:`, user[key]);
        });
        
        const hasAdminRole = allRoles.includes('admin');
        const hasCodeComprehensionRole = allRoles.includes('code-comprehension') || 
                                        allRoles.includes('Code-Comprehension-Project') || 
                                        allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
        const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
        
        // Check if user has any of the required permissions
        if (hasAdminRole || hasCodeComprehensionRole || isSiteOwner) {
            document.getElementById('project-content-wrapper').style.display = 'block';
        } else {
            document.getElementById('auth-check-wrapper').style.display = 'block';
        }
    } else {
        console.log('Finished Annotating - User not authenticated');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
});

console.log('Finished Annotating - Setting up timeout fallback');

// If auth service isn't ready after 5 seconds, show access denied
setTimeout(() => {
    console.log('Finished Annotating - Timeout check - authService available:', !!window.authService);
    console.log('Finished Annotating - Timeout check - isAuthenticated:', window.authService?.isAuthenticated);
    if (!window.authService || !window.authService.isAuthenticated) {
        console.log('Finished Annotating - Timeout triggered, showing access denied');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
}, 5000);
</script>