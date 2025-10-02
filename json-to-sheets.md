---
layout: page
title: JSON to Google Sheets Importer
permalink: /json-to-sheets/
---

<div id="json-to-sheets-dashboard">
  <header class="section-header">
    <h1>{{ page.title }}</h1>
    <p class="section-description">Automatically convert JSON files to Google Sheets with formatting and organization.</p>
  </header>

  <main class="section-main-content">
    <!-- Authentication Status -->
    <div id="auth-status" class="auth-status-card">
      <div class="status-indicator">
        <span id="auth-indicator" class="status-dot disconnected"></span>
        <span id="auth-text">Checking authentication...</span>
      </div>
      <button id="auth-button" class="auth-button" style="display: none;">Sign In to Google</button>
    </div>

    <!-- JSON Input Section -->
    <section class="input-section">
      <h2>JSON Data Input</h2>
      
      <!-- File Upload -->
      <div class="input-method">
        <h3>Upload JSON File</h3>
        <div class="file-upload-area" id="file-upload-area">
          <input type="file" id="json-file-input" accept=".json" style="display: none;">
          <div class="upload-placeholder">
            <div class="upload-icon">📁</div>
            <p>Click to select a JSON file or drag and drop</p>
            <small>Supported format: .json</small>
          </div>
        </div>
      </div>

      <!-- Text Input -->
      <div class="input-method">
        <h3>Paste JSON Text</h3>
        <textarea id="json-text-input" placeholder='Paste your JSON data here...
Example:
[
  {"name": "John", "age": 30, "city": "New York"},
  {"name": "Jane", "age": 25, "city": "Los Angeles"}
]' rows="8"></textarea>
      </div>

      <!-- Options -->
      <div class="import-options">
        <h3>Import Options</h3>
        <div class="option-group">
          <label for="spreadsheet-title">Spreadsheet Title:</label>
          <input type="text" id="spreadsheet-title" placeholder="Auto-generated title">
        </div>
        <div class="option-group">
          <label>
            <input type="checkbox" id="apply-formatting" checked>
            Apply automatic formatting (headers, freezing, colors)
          </label>
        </div>
        <div class="option-group">
          <label>
            <input type="checkbox" id="create-folder" checked>
            Create "JSON Imports" folder in Google Drive
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button id="import-button" class="primary-button" disabled>Import to Google Sheets</button>
        <button id="clear-button" class="secondary-button">Clear Input</button>
      </div>
    </section>

    <!-- Progress Section -->
    <section id="progress-section" class="progress-section" style="display: none;">
      <h2>Import Progress</h2>
      <div class="progress-bar">
        <div id="progress-fill" class="progress-fill"></div>
      </div>
      <div id="progress-text" class="progress-text">Starting import...</div>
    </section>

    <!-- Results Section -->
    <section id="results-section" class="results-section" style="display: none;">
      <h2>Import Results</h2>
      <div id="results-content" class="results-content"></div>
    </section>

    <!-- Sample Data Section -->
    <section class="sample-section">
      <h2>Sample JSON Data</h2>
      <p>Try these sample JSON formats to see how they're converted to spreadsheets:</p>
      
      <div class="sample-tabs">
        <button class="sample-tab active" data-sample="array-objects">Array of Objects</button>
        <button class="sample-tab" data-sample="single-object">Single Object</button>
        <button class="sample-tab" data-sample="nested-data">Nested Data</button>
      </div>

      <div class="sample-content">
        <pre id="sample-array-objects" class="sample-data active">[
  {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "department": "Engineering",
    "salary": 95000,
    "start_date": "2022-01-15"
  },
  {
    "name": "Bob Smith",
    "email": "bob@example.com", 
    "department": "Marketing",
    "salary": 75000,
    "start_date": "2021-08-20"
  },
  {
    "name": "Carol Williams",
    "email": "carol@example.com",
    "department": "Sales",
    "salary": 85000,
    "start_date": "2023-03-10"
  }
]</pre>

        <pre id="sample-single-object" class="sample-data">{
  "company": "Tech Corp",
  "founded": 2015,
  "employees": 150,
  "headquarters": "San Francisco, CA",
  "revenue_2023": "$50M",
  "products": ["Software A", "Platform B", "Service C"]
}</pre>

        <pre id="sample-nested-data" class="sample-data">[
  {
    "id": 1,
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "order": {
      "total": 125.50,
      "items": ["Laptop", "Mouse"],
      "date": "2024-01-15"
    }
  },
  {
    "id": 2,
    "customer": {
      "name": "Jane Smith", 
      "email": "jane@example.com"
    },
    "order": {
      "total": 89.99,
      "items": ["Keyboard", "Monitor"],
      "date": "2024-01-16"
    }
  }
]</pre>
      </div>

      <button id="use-sample-button" class="secondary-button">Use This Sample</button>
    </section>

    <!-- Recent Imports -->
    <section id="recent-imports" class="recent-section" style="display: none;">
      <h2>Recent Imports</h2>
      <div id="recent-imports-list" class="imports-list"></div>
    </section>
  </main>
</div>

<style>
.auth-status-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.connected {
  background: #28a745;
}

.status-dot.disconnected {
  background: #dc3545;
}

.status-dot.connecting {
  background: #ffc107;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.input-section, .sample-section, .progress-section, .results-section, .recent-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.input-method {
  margin-bottom: 1.5rem;
}

.file-upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.file-upload-area:hover {
  border-color: #007bff;
}

.file-upload-area.dragover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

#json-text-input {
  width: 100%;
  min-height: 150px;
  font-family: 'Courier New', monospace;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.75rem;
  resize: vertical;
}

.import-options {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin: 1rem 0;
}

.option-group {
  margin-bottom: 0.75rem;
}

.option-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.option-group input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.primary-button, .secondary-button, .auth-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.primary-button {
  background: #007bff;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background: #0056b3;
}

.primary-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.secondary-button {
  background: #6c757d;
  color: white;
}

.secondary-button:hover {
  background: #545b62;
}

.auth-button {
  background: #28a745;
  color: white;
}

.auth-button:hover {
  background: #1e7e34;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #28a745);
  width: 0%;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: #666;
}

.results-content {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.success-result {
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.error-result {
  color: #721c24;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.sample-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sample-tab {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: #f8f9fa;
  cursor: pointer;
  border-radius: 4px 4px 0 0;
}

.sample-tab.active {
  background: white;
  border-bottom: 1px solid white;
}

.sample-data {
  background: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 0 6px 6px 6px;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  margin: 0;
  display: none;
}

.sample-data.active {
  display: block;
}

.imports-list {
  display: grid;
  gap: 1rem;
}

.import-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-details h4 {
  margin: 0 0 0.25rem 0;
  color: #007bff;
}

.import-meta {
  font-size: 0.875rem;
  color: #666;
}

.import-actions {
  display: flex;
  gap: 0.5rem;
}

.link-button {
  padding: 0.25rem 0.75rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
}

.link-button:hover {
  background: #0056b3;
  color: white;
  text-decoration: none;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const jsonFileInput = document.getElementById('json-file-input');
    const jsonTextInput = document.getElementById('json-text-input');
    const fileUploadArea = document.getElementById('file-upload-area');
    const importButton = document.getElementById('import-button');
    const clearButton = document.getElementById('clear-button');
    const authStatus = document.getElementById('auth-status');
    const authIndicator = document.getElementById('auth-indicator');
    const authText = document.getElementById('auth-text');
    const authButton = document.getElementById('auth-button');
    const progressSection = document.getElementById('progress-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    const spreadsheetTitle = document.getElementById('spreadsheet-title');
    const applyFormatting = document.getElementById('apply-formatting');
    const createFolder = document.getElementById('create-folder');
    const recentImports = document.getElementById('recent-imports');
    const recentImportsList = document.getElementById('recent-imports-list');

    let recentImportsData = JSON.parse(localStorage.getItem('jsonSheetsImports') || '[]');

    // Sample data management
    const sampleTabs = document.querySelectorAll('.sample-tab');
    const useSampleButton = document.getElementById('use-sample-button');
    
    sampleTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            sampleTabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sample-data').forEach(d => d.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById('sample-' + this.dataset.sample).classList.add('active');
        });
    });

    useSampleButton.addEventListener('click', function() {
        const activeData = document.querySelector('.sample-data.active');
        if (activeData) {
            jsonTextInput.value = activeData.textContent.trim();
            validateInput();
        }
    });

    // File upload handling
    fileUploadArea.addEventListener('click', () => jsonFileInput.click());

    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/json') {
            handleFileSelection(files[0]);
        }
    });

    jsonFileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            jsonTextInput.value = e.target.result;
            if (!spreadsheetTitle.value) {
                spreadsheetTitle.value = file.name.replace(/\.json$/i, '') + ' - Import';
            }
            validateInput();
        };
        reader.readAsText(file);
    }

    // Input validation
    jsonTextInput.addEventListener('input', validateInput);

    function validateInput() {
        const hasInput = jsonTextInput.value.trim() !== '';
        const isAuthenticated = window.googleSheetsService && window.googleDriveService && window.googleDriveService.isReady();
        
        importButton.disabled = !hasInput || !isAuthenticated;
        
        // Try to parse JSON to show validation
        if (hasInput) {
            try {
                JSON.parse(jsonTextInput.value);
                jsonTextInput.style.borderColor = '#28a745';
            } catch (e) {
                jsonTextInput.style.borderColor = '#dc3545';
            }
        } else {
            jsonTextInput.style.borderColor = '#ccc';
        }
    }

    // Clear input
    clearButton.addEventListener('click', function() {
        jsonTextInput.value = '';
        jsonFileInput.value = '';
        spreadsheetTitle.value = '';
        validateInput();
        hideResults();
    });

    // Authentication status monitoring
    function updateAuthStatus() {
        const isReady = window.googleDriveService && window.googleDriveService.isReady();
        const hasRole = window.googleDriveService && window.googleDriveService.hasAuthorizedRole();
        
        if (isReady) {
            authIndicator.className = 'status-dot connected';
            authText.textContent = 'Connected to Google Drive & Sheets';
            authButton.style.display = 'none';
        } else if (hasRole) {
            authIndicator.className = 'status-dot connecting';
            authText.textContent = 'Connecting to Google services...';
            authButton.style.display = 'none';
        } else {
            authIndicator.className = 'status-dot disconnected';
            authText.textContent = 'Sign in to Google to import JSON data';
            authButton.style.display = 'block';
        }
        
        validateInput();
    }

    // Auth button click
    authButton.addEventListener('click', async function() {
        try {
            await window.googleDriveService.signIn();
        } catch (error) {
            console.error('Sign in failed:', error);
            alert('Sign in failed: ' + error.message);
        }
    });

    // Listen for auth changes
    window.addEventListener('driveAuthChanged', updateAuthStatus);

    // Import functionality
    importButton.addEventListener('click', async function() {
        try {
            const jsonText = jsonTextInput.value.trim();
            if (!jsonText) {
                alert('Please enter some JSON data');
                return;
            }

            let jsonData;
            try {
                jsonData = JSON.parse(jsonText);
            } catch (parseError) {
                alert('Invalid JSON format. Please check your data.');
                return;
            }

            showProgress();
            
            const options = {
                spreadsheetTitle: spreadsheetTitle.value || undefined,
                applyFormatting: applyFormatting.checked
            };

            if (createFolder.checked) {
                updateProgress(20, 'Creating import folder...');
                const folder = await window.googleSheetsService.createJsonImportFolder();
                options.folderId = folder.id;
            }

            updateProgress(40, 'Creating spreadsheet...');
            const result = await window.googleSheetsService.importJsonToSheets(jsonData, options);

            updateProgress(80, 'Applying formatting...');
            
            // Save to recent imports
            const importRecord = {
                id: Date.now(),
                title: result.title,
                url: result.spreadsheetUrl,
                spreadsheetId: result.spreadsheetId,
                timestamp: new Date().toISOString(),
                rowsImported: result.rowsImported,
                columnsImported: result.columnsImported
            };
            
            recentImportsData.unshift(importRecord);
            recentImportsData = recentImportsData.slice(0, 10); // Keep only last 10
            localStorage.setItem('jsonSheetsImports', JSON.stringify(recentImportsData));

            updateProgress(100, 'Import completed!');
            
            setTimeout(() => {
                hideProgress();
                showResults(result);
                updateRecentImports();
            }, 1000);

        } catch (error) {
            console.error('Import failed:', error);
            hideProgress();
            showError('Import failed: ' + error.message);
        }
    });

    function showProgress() {
        progressSection.style.display = 'block';
        resultsSection.style.display = 'none';
        updateProgress(0, 'Starting import...');
    }

    function updateProgress(percent, text) {
        progressFill.style.width = percent + '%';
        progressText.textContent = text;
    }

    function hideProgress() {
        progressSection.style.display = 'none';
    }

    function showResults(result) {
        resultsSection.style.display = 'block';
        resultsContent.innerHTML = `
            <div class="success-result">
                <h3>✅ Import Successful!</h3>
                <p><strong>Spreadsheet:</strong> ${result.title}</p>
                <p><strong>Rows imported:</strong> ${result.rowsImported}</p>
                <p><strong>Columns:</strong> ${result.columnsImported}</p>
                <div style="margin-top: 1rem;">
                    <a href="${result.spreadsheetUrl}" target="_blank" class="link-button">Open Spreadsheet</a>
                </div>
            </div>
        `;
    }

    function showError(message) {
        resultsSection.style.display = 'block';
        resultsContent.innerHTML = `
            <div class="error-result">
                <h3>❌ Import Failed</h3>
                <p>${message}</p>
            </div>
        `;
    }

    function hideResults() {
        resultsSection.style.display = 'none';
    }

    function updateRecentImports() {
        if (recentImportsData.length === 0) {
            recentImports.style.display = 'none';
            return;
        }

        recentImports.style.display = 'block';
        recentImportsList.innerHTML = recentImportsData.map(item => `
            <div class="import-item">
                <div class="import-details">
                    <h4>${item.title}</h4>
                    <div class="import-meta">
                        ${new Date(item.timestamp).toLocaleDateString()} • 
                        ${item.rowsImported} rows • ${item.columnsImported} columns
                    </div>
                </div>
                <div class="import-actions">
                    <a href="${item.url}" target="_blank" class="link-button">Open</a>
                </div>
            </div>
        `).join('');
    }

    // Initialize
    updateAuthStatus();
    updateRecentImports();
    validateInput();

    // Auto-update auth status periodically
    setInterval(updateAuthStatus, 2000);
});
</script>