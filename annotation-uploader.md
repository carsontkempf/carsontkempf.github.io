---
layout: page
title: Annotation Uploader
permalink: /annotation-uploader/
---

<div id="annotation-uploader-dashboard">
  <header class="section-header">
    <h1>{{ page.title }}</h1>
    <p class="section-description">Upload JSON annotation files to Google Sheets and PDF files to Google Drive with automatic folder organization.</p>
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

    <!-- Folder Structure Status -->
    <div id="folder-status" class="folder-status-card" style="display: none;">
      <h3>📁 Folder Structure</h3>
      <div class="folder-tree">
        <div class="folder-item">
          <span class="folder-icon">📁</span>
          <span class="folder-name">Annotations Project</span>
          <a id="project-folder-link" href="#" target="_blank" class="folder-link" style="display: none;">Open</a>
        </div>
        <div class="folder-item sub-folder">
          <span class="folder-icon">📊</span>
          <span class="folder-name">JSON Sheets</span>
          <a id="json-folder-link" href="#" target="_blank" class="folder-link" style="display: none;">Open</a>
        </div>
        <div class="folder-item sub-folder">
          <span class="folder-icon">📄</span>
          <span class="folder-name">PDF Files</span>
          <a id="pdf-folder-link" href="#" target="_blank" class="folder-link" style="display: none;">Open</a>
        </div>
      </div>
    </div>

    <!-- Upload Methods -->
    <section class="upload-section">
      <h2>Upload Methods</h2>
      
      <!-- Method Selection -->
      <div class="method-tabs">
        <button class="method-tab active" data-method="complete-set">Complete Set</button>
        <button class="method-tab" data-method="json-only">JSON Only</button>
        <button class="method-tab" data-method="pdf-only">PDF Only</button>
      </div>

      <!-- Complete Set Upload -->
      <div id="complete-set-method" class="upload-method active">
        <h3>📋 Complete Annotation Set</h3>
        <p>Upload both JSON annotation file and corresponding PDF file together.</p>
        
        <div class="file-upload-section">
          <div class="file-upload-group">
            <label for="json-file-complete">JSON Annotation File:</label>
            <div class="file-upload-area" id="json-upload-complete">
              <input type="file" id="json-file-complete" accept=".json" style="display: none;">
              <div class="upload-placeholder">
                <div class="upload-icon">📋</div>
                <p>Click to select JSON file or drag and drop</p>
                <small>Supported format: .json</small>
              </div>
            </div>
            <div id="json-file-info-complete" class="file-info" style="display: none;"></div>
          </div>

          <div class="file-upload-group">
            <label for="pdf-file-complete">PDF Document:</label>
            <div class="file-upload-area" id="pdf-upload-complete">
              <input type="file" id="pdf-file-complete" accept=".pdf" style="display: none;">
              <div class="upload-placeholder">
                <div class="upload-icon">📄</div>
                <p>Click to select PDF file or drag and drop</p>
                <small>Supported format: .pdf (max 100MB)</small>
              </div>
            </div>
            <div id="pdf-file-info-complete" class="file-info" style="display: none;"></div>
          </div>
        </div>

        <div class="upload-options">
          <div class="option-group">
            <label for="set-name-complete">Set Name:</label>
            <input type="text" id="set-name-complete" placeholder="Auto-generated name">
          </div>
          <div class="option-group">
            <label for="set-description-complete">Description (optional):</label>
            <textarea id="set-description-complete" rows="2" placeholder="Describe this annotation set..."></textarea>
          </div>
        </div>

        <div class="action-buttons">
          <button id="upload-complete-button" class="primary-button" disabled>Upload Complete Set</button>
          <button id="clear-complete-button" class="secondary-button">Clear Files</button>
        </div>
      </div>

      <!-- JSON Only Upload -->
      <div id="json-only-method" class="upload-method">
        <h3>📊 JSON to Google Sheets</h3>
        <p>Upload JSON annotation data to Google Sheets only.</p>
        
        <div class="json-input-options">
          <!-- File Upload -->
          <div class="input-option">
            <h4>Upload JSON File</h4>
            <div class="file-upload-area" id="json-upload-only">
              <input type="file" id="json-file-only" accept=".json" style="display: none;">
              <div class="upload-placeholder">
                <div class="upload-icon">📋</div>
                <p>Click to select JSON file or drag and drop</p>
                <small>Supported format: .json</small>
              </div>
            </div>
            <div id="json-file-info-only" class="file-info" style="display: none;"></div>
          </div>

          <!-- Text Input -->
          <div class="input-option">
            <h4>Paste JSON Text</h4>
            <textarea id="json-text-only" placeholder='Paste your JSON annotation data here...
Example:
{
  "annotations": [
    {"type": "error", "line": 10, "message": "Syntax error"},
    {"type": "warning", "line": 25, "message": "Potential issue"}
  ]
}' rows="8"></textarea>
          </div>
        </div>

        <div class="upload-options">
          <div class="option-group">
            <label for="sheet-name-only">Sheet Name:</label>
            <input type="text" id="sheet-name-only" placeholder="Auto-generated name">
          </div>
        </div>

        <div class="action-buttons">
          <button id="upload-json-button" class="primary-button" disabled>Upload to Google Sheets</button>
          <button id="clear-json-button" class="secondary-button">Clear Input</button>
        </div>
      </div>

      <!-- PDF Only Upload -->
      <div id="pdf-only-method" class="upload-method">
        <h3>📄 PDF to Google Drive</h3>
        <p>Upload PDF file to Google Drive folder only.</p>
        
        <div class="file-upload-section">
          <div class="file-upload-area" id="pdf-upload-only">
            <input type="file" id="pdf-file-only" accept=".pdf" style="display: none;">
            <div class="upload-placeholder">
              <div class="upload-icon">📄</div>
              <p>Click to select PDF file or drag and drop</p>
              <small>Supported format: .pdf (max 100MB)</small>
            </div>
          </div>
          <div id="pdf-file-info-only" class="file-info" style="display: none;"></div>
        </div>

        <div class="upload-options">
          <div class="option-group">
            <label for="pdf-name-only">File Name:</label>
            <input type="text" id="pdf-name-only" placeholder="Auto-generated name">
          </div>
          <div class="option-group">
            <label for="pdf-description-only">Description (optional):</label>
            <textarea id="pdf-description-only" rows="2" placeholder="Describe this PDF file..."></textarea>
          </div>
        </div>

        <div class="action-buttons">
          <button id="upload-pdf-button" class="primary-button" disabled>Upload to Google Drive</button>
          <button id="clear-pdf-button" class="secondary-button">Clear File</button>
        </div>
      </div>
    </section>

    <!-- Progress Section -->
    <section id="progress-section" class="progress-section" style="display: none;">
      <h2>Upload Progress</h2>
      <div class="progress-container">
        <div class="progress-item">
          <span class="progress-label">JSON Upload:</span>
          <div class="progress-bar">
            <div id="json-progress-fill" class="progress-fill"></div>
          </div>
          <span id="json-progress-text" class="progress-text">Ready</span>
        </div>
        <div class="progress-item">
          <span class="progress-label">PDF Upload:</span>
          <div class="progress-bar">
            <div id="pdf-progress-fill" class="progress-fill"></div>
          </div>
          <span id="pdf-progress-text" class="progress-text">Ready</span>
        </div>
      </div>
      <div id="overall-progress-text" class="overall-progress">Preparing upload...</div>
    </section>

    <!-- Results Section -->
    <section id="results-section" class="results-section" style="display: none;">
      <h2>Upload Results</h2>
      <div id="results-content" class="results-content"></div>
    </section>

    <!-- Recent Uploads -->
    <section id="recent-uploads" class="recent-section" style="display: none;">
      <h2>Recent Annotation Sets</h2>
      <div id="recent-uploads-list" class="uploads-list"></div>
      <div class="recent-actions">
        <button id="clear-history-button" class="secondary-button">Clear History</button>
      </div>
    </section>

    <!-- Help Section -->
    <section class="help-section">
      <h2>📖 How to Use</h2>
      <div class="help-content">
        <div class="help-item">
          <h3>📋 Complete Set Upload</h3>
          <p>Upload both your JSON annotation file and the corresponding PDF document together. They will be organized in separate folders automatically.</p>
        </div>
        <div class="help-item">
          <h3>📊 JSON to Sheets</h3>
          <p>Convert JSON annotation data to a formatted Google Sheets spreadsheet with automatic column detection and styling.</p>
        </div>
        <div class="help-item">
          <h3>📄 PDF to Drive</h3>
          <p>Upload PDF documents directly to your Google Drive annotation folder for easy access and sharing.</p>
        </div>
        <div class="help-item">
          <h3>📁 Folder Organization</h3>
          <p>Files are automatically organized in your Google Drive:</p>
          <ul>
            <li><strong>Annotations Project/JSON Sheets/</strong> - Google Sheets with annotation data</li>
            <li><strong>Annotations Project/PDF Files/</strong> - PDF documents</li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</div>

<style>
.folder-status-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.folder-tree {
  margin-top: 1rem;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.sub-folder {
  margin-left: 1.5rem;
}

.folder-icon {
  font-size: 1.2rem;
}

.folder-name {
  flex: 1;
  font-weight: 500;
}

.folder-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #007bff;
  border-radius: 4px;
}

.folder-link:hover {
  background: #007bff;
  color: white;
  text-decoration: none;
}

.method-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #dee2e6;
}

.method-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: 500;
}

.method-tab.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.upload-method {
  display: none;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 2rem;
}

.upload-method.active {
  display: block;
}

.file-upload-section {
  display: grid;
  gap: 2rem;
  margin: 2rem 0;
}

.file-upload-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-upload-group label {
  font-weight: 600;
  color: #333;
}

.file-upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.file-upload-area:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.file-upload-area.dragover {
  border-color: #007bff;
  background: #e3f2fd;
}

.file-upload-area.has-file {
  border-color: #28a745;
  background: #f8fff9;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.file-info {
  background: #e8f5e8;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 1rem;
  font-size: 0.9rem;
}

.json-input-options {
  display: grid;
  gap: 2rem;
  margin: 2rem 0;
}

.input-option h4 {
  margin: 0 0 1rem 0;
  color: #555;
}

#json-text-only {
  width: 100%;
  min-height: 150px;
  font-family: 'Courier New', monospace;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.75rem;
  resize: vertical;
}

.upload-options {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.option-group {
  margin-bottom: 1rem;
}

.option-group:last-child {
  margin-bottom: 0;
}

.option-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.option-group input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.option-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.progress-container {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-item {
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  gap: 1rem;
  align-items: center;
}

.progress-label {
  font-weight: 500;
  color: #555;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #28a745);
  width: 0%;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
  text-align: right;
}

.overall-progress {
  text-align: center;
  font-weight: 500;
  color: #333;
  margin-top: 1rem;
}

.success-result {
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.error-result {
  color: #721c24;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.result-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.result-item h4 {
  margin: 0 0 0.5rem 0;
  color: #007bff;
}

.result-links {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
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

.uploads-list {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.upload-item {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
}

.upload-item h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.upload-meta {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.upload-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.recent-actions {
  text-align: center;
  margin-top: 1rem;
}

.help-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
}

.help-content {
  display: grid;
  gap: 1.5rem;
}

.help-item h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.help-item p {
  margin: 0 0 1rem 0;
  color: #666;
}

.help-item ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.help-item ul li {
  margin-bottom: 0.25rem;
}

@media (min-width: 768px) {
  .file-upload-section {
    grid-template-columns: 1fr 1fr;
  }
  
  .json-input-options {
    grid-template-columns: 1fr 1fr;
  }
  
  .help-content {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const authIndicator = document.getElementById('auth-indicator');
    const authText = document.getElementById('auth-text');
    const authButton = document.getElementById('auth-button');
    const folderStatus = document.getElementById('folder-status');
    const progressSection = document.getElementById('progress-section');
    const resultsSection = document.getElementById('results-section');
    const resultsContent = document.getElementById('results-content');
    const recentUploads = document.getElementById('recent-uploads');
    const recentUploadsList = document.getElementById('recent-uploads-list');

    // Method tabs
    const methodTabs = document.querySelectorAll('.method-tab');
    const uploadMethods = document.querySelectorAll('.upload-method');

    // File inputs
    const jsonFileComplete = document.getElementById('json-file-complete');
    const pdfFileComplete = document.getElementById('pdf-file-complete');
    const jsonFileOnly = document.getElementById('json-file-only');
    const pdfFileOnly = document.getElementById('pdf-file-only');
    const jsonTextOnly = document.getElementById('json-text-only');

    // Upload areas
    const jsonUploadComplete = document.getElementById('json-upload-complete');
    const pdfUploadComplete = document.getElementById('pdf-upload-complete');
    const jsonUploadOnly = document.getElementById('json-upload-only');
    const pdfUploadOnly = document.getElementById('pdf-upload-only');

    // Buttons
    const uploadCompleteButton = document.getElementById('upload-complete-button');
    const uploadJsonButton = document.getElementById('upload-json-button');
    const uploadPdfButton = document.getElementById('upload-pdf-button');

    let currentJsonFile = null;
    let currentPdfFile = null;
    let currentMethod = 'complete-set';

    // Initialize
    updateAuthStatus();
    updateRecentUploads();
    setupEventListeners();

    // Method tab switching
    methodTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const method = this.dataset.method;
            switchMethod(method);
        });
    });

    function switchMethod(method) {
        currentMethod = method;
        
        methodTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.method === method);
        });
        
        uploadMethods.forEach(methodEl => {
            methodEl.classList.toggle('active', methodEl.id === method + '-method');
        });

        // Reset files when switching methods
        resetFiles();
        validateInputs();
    }

    // File upload handling
    function setupEventListeners() {
        // Complete set file uploads
        setupFileUpload(jsonUploadComplete, jsonFileComplete, 'json', (file) => {
            currentJsonFile = file;
            updateFileInfo('json-file-info-complete', file);
            validateInputs();
        });

        setupFileUpload(pdfUploadComplete, pdfFileComplete, 'pdf', (file) => {
            currentPdfFile = file;
            updateFileInfo('pdf-file-info-complete', file);
            validateInputs();
        });

        // JSON only upload
        setupFileUpload(jsonUploadOnly, jsonFileOnly, 'json', (file) => {
            currentJsonFile = file;
            updateFileInfo('json-file-info-only', file);
            validateInputs();
        });

        // PDF only upload
        setupFileUpload(pdfUploadOnly, pdfFileOnly, 'pdf', (file) => {
            currentPdfFile = file;
            updateFileInfo('pdf-file-info-only', file);
            validateInputs();
        });

        // Text input
        jsonTextOnly.addEventListener('input', validateInputs);

        // Upload buttons
        uploadCompleteButton.addEventListener('click', uploadCompleteSet);
        uploadJsonButton.addEventListener('click', uploadJsonOnly);
        uploadPdfButton.addEventListener('click', uploadPdfOnly);

        // Clear buttons
        document.getElementById('clear-complete-button').addEventListener('click', () => clearCompleteSet());
        document.getElementById('clear-json-button').addEventListener('click', () => clearJsonOnly());
        document.getElementById('clear-pdf-button').addEventListener('click', () => clearPdfOnly());

        // Auth button
        authButton.addEventListener('click', signInToGoogle);

        // Clear history
        document.getElementById('clear-history-button').addEventListener('click', clearHistory);
    }

    function setupFileUpload(uploadArea, fileInput, fileType, onFileSelected) {
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (validateFileType(file, fileType)) {
                    onFileSelected(file);
                    this.classList.add('has-file');
                }
            }
        });

        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (validateFileType(file, fileType)) {
                    onFileSelected(file);
                    uploadArea.classList.add('has-file');
                }
            }
        });
    }

    function validateFileType(file, expectedType) {
        if (expectedType === 'json') {
            if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
                alert('Please select a JSON file');
                return false;
            }
        } else if (expectedType === 'pdf') {
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                alert('Please select a PDF file');
                return false;
            }
        }
        return true;
    }

    function updateFileInfo(infoElementId, file) {
        const infoElement = document.getElementById(infoElementId);
        if (file) {
            const sizeText = formatFileSize(file.size);
            infoElement.innerHTML = `
                <strong>Selected:</strong> ${file.name}<br>
                <strong>Size:</strong> ${sizeText}<br>
                <strong>Type:</strong> ${file.type}
            `;
            infoElement.style.display = 'block';
        } else {
            infoElement.style.display = 'none';
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function validateInputs() {
        const isAuthenticated = window.annotationDriveService && window.annotationDriveService.isReady();
        
        if (currentMethod === 'complete-set') {
            uploadCompleteButton.disabled = !isAuthenticated || !currentJsonFile || !currentPdfFile;
        } else if (currentMethod === 'json-only') {
            const hasJsonInput = currentJsonFile || jsonTextOnly.value.trim();
            uploadJsonButton.disabled = !isAuthenticated || !hasJsonInput;
        } else if (currentMethod === 'pdf-only') {
            uploadPdfButton.disabled = !isAuthenticated || !currentPdfFile;
        }
    }

    function resetFiles() {
        currentJsonFile = null;
        currentPdfFile = null;
        
        // Clear file inputs
        [jsonFileComplete, pdfFileComplete, jsonFileOnly, pdfFileOnly].forEach(input => {
            input.value = '';
        });
        
        // Clear text input
        jsonTextOnly.value = '';
        
        // Remove has-file class
        document.querySelectorAll('.file-upload-area').forEach(area => {
            area.classList.remove('has-file');
        });
        
        // Hide file info
        document.querySelectorAll('.file-info').forEach(info => {
            info.style.display = 'none';
        });
    }

    function clearCompleteSet() {
        resetFiles();
        document.getElementById('set-name-complete').value = '';
        document.getElementById('set-description-complete').value = '';
        validateInputs();
    }

    function clearJsonOnly() {
        currentJsonFile = null;
        jsonFileOnly.value = '';
        jsonTextOnly.value = '';
        document.getElementById('json-file-info-only').style.display = 'none';
        document.getElementById('json-upload-only').classList.remove('has-file');
        document.getElementById('sheet-name-only').value = '';
        validateInputs();
    }

    function clearPdfOnly() {
        currentPdfFile = null;
        pdfFileOnly.value = '';
        document.getElementById('pdf-file-info-only').style.display = 'none';
        document.getElementById('pdf-upload-only').classList.remove('has-file');
        document.getElementById('pdf-name-only').value = '';
        document.getElementById('pdf-description-only').value = '';
        validateInputs();
    }

    // Upload functions
    async function uploadCompleteSet() {
        try {
            const setName = document.getElementById('set-name-complete').value || null;
            const description = document.getElementById('set-description-complete').value || null;

            showProgress();
            updateOverallProgress('Preparing upload...');

            // Read JSON file
            updateJsonProgress(10, 'Reading JSON file...');
            const jsonData = await readJsonFile(currentJsonFile);
            updateJsonProgress(50, 'Processing JSON data...');

            // Upload complete set
            updatePdfProgress(10, 'Preparing PDF upload...');
            updateOverallProgress('Uploading files...');

            const result = await window.annotationDriveService.uploadAnnotationSet(
                jsonData,
                currentPdfFile,
                setName,
                { description }
            );

            updateJsonProgress(100, 'JSON uploaded ✓');
            updatePdfProgress(100, 'PDF uploaded ✓');
            updateOverallProgress('Upload completed!');

            setTimeout(() => {
                hideProgress();
                showResults(result);
                updateRecentUploads();
                clearCompleteSet();
            }, 1000);

        } catch (error) {
            console.error('Complete set upload failed:', error);
            hideProgress();
            showError('Upload failed: ' + error.message);
        }
    }

    async function uploadJsonOnly() {
        try {
            showProgress();
            updateJsonProgress(10, 'Processing JSON data...');

            let jsonData;
            if (currentJsonFile) {
                jsonData = await readJsonFile(currentJsonFile);
            } else {
                jsonData = JSON.parse(jsonTextOnly.value);
            }

            const sheetName = document.getElementById('sheet-name-only').value || null;

            updateJsonProgress(50, 'Creating Google Sheet...');

            const result = await window.annotationDriveService.saveJsonAnnotationToSheets(
                jsonData,
                sheetName
            );

            updateJsonProgress(100, 'JSON uploaded ✓');

            setTimeout(() => {
                hideProgress();
                showResults({ jsonSheet: result, success: true });
                updateRecentUploads();
                clearJsonOnly();
            }, 1000);

        } catch (error) {
            console.error('JSON upload failed:', error);
            hideProgress();
            showError('JSON upload failed: ' + error.message);
        }
    }

    async function uploadPdfOnly() {
        try {
            const fileName = document.getElementById('pdf-name-only').value || null;
            const description = document.getElementById('pdf-description-only').value || null;

            showProgress();
            updatePdfProgress(10, 'Preparing PDF upload...');

            const result = await window.annotationDriveService.uploadPdfFile(
                currentPdfFile,
                fileName,
                { description }
            );

            updatePdfProgress(100, 'PDF uploaded ✓');

            setTimeout(() => {
                hideProgress();
                showResults({ pdfFile: result, success: true });
                updateRecentUploads();
                clearPdfOnly();
            }, 1000);

        } catch (error) {
            console.error('PDF upload failed:', error);
            hideProgress();
            showError('PDF upload failed: ' + error.message);
        }
    }

    function readJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Invalid JSON file: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // Progress functions
    function showProgress() {
        progressSection.style.display = 'block';
        resultsSection.style.display = 'none';
        updateJsonProgress(0, 'Ready');
        updatePdfProgress(0, 'Ready');
    }

    function hideProgress() {
        progressSection.style.display = 'none';
    }

    function updateJsonProgress(percent, text) {
        document.getElementById('json-progress-fill').style.width = percent + '%';
        document.getElementById('json-progress-text').textContent = text;
    }

    function updatePdfProgress(percent, text) {
        document.getElementById('pdf-progress-fill').style.width = percent + '%';
        document.getElementById('pdf-progress-text').textContent = text;
    }

    function updateOverallProgress(text) {
        document.getElementById('overall-progress-text').textContent = text;
    }

    // Results functions
    function showResults(result) {
        resultsSection.style.display = 'block';
        
        let html = '';
        
        if (result.success) {
            html += '<div class="success-result"><h3>✅ Upload Successful!</h3>';
            
            if (result.setName) {
                html += `<p><strong>Set Name:</strong> ${result.setName}</p>`;
            }
            
            html += '</div>';

            if (result.jsonSheet) {
                html += `
                    <div class="result-item">
                        <h4>📊 Google Sheets</h4>
                        <p><strong>Title:</strong> ${result.jsonSheet.title}</p>
                        <p><strong>Rows:</strong> ${result.jsonSheet.rowsImported}</p>
                        <div class="result-links">
                            <a href="${result.jsonSheet.spreadsheetUrl}" target="_blank" class="link-button">Open Sheet</a>
                        </div>
                    </div>
                `;
            }

            if (result.pdfFile) {
                html += `
                    <div class="result-item">
                        <h4>📄 PDF File</h4>
                        <p><strong>Name:</strong> ${result.pdfFile.name}</p>
                        <p><strong>Size:</strong> ${formatFileSize(result.pdfFile.size)}</p>
                        <div class="result-links">
                            <a href="${result.pdfFile.webViewLink}" target="_blank" class="link-button">View PDF</a>
                            <a href="${result.pdfFile.driveViewLink}" target="_blank" class="link-button">Drive Link</a>
                        </div>
                    </div>
                `;
            }
        } else {
            html += `
                <div class="error-result">
                    <h3>❌ Upload Failed</h3>
                    <ul>
                        ${result.errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        resultsContent.innerHTML = html;
    }

    function showError(message) {
        resultsSection.style.display = 'block';
        resultsContent.innerHTML = `
            <div class="error-result">
                <h3>❌ Upload Failed</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Authentication functions
    function updateAuthStatus() {
        const isReady = window.annotationDriveService && window.annotationDriveService.isReady();
        const hasRole = window.googleDriveService && window.googleDriveService.hasAuthorizedRole();
        
        if (isReady) {
            authIndicator.className = 'status-dot connected';
            authText.textContent = 'Connected and ready';
            authButton.style.display = 'none';
            updateFolderStatus();
        } else if (hasRole) {
            authIndicator.className = 'status-dot connecting';
            authText.textContent = 'Connecting to services...';
            authButton.style.display = 'none';
        } else {
            authIndicator.className = 'status-dot disconnected';
            authText.textContent = 'Sign in to Google to upload annotations';
            authButton.style.display = 'block';
            folderStatus.style.display = 'none';
        }
        
        validateInputs();
    }

    function updateFolderStatus() {
        if (window.annotationDriveService && window.annotationDriveService.isReady()) {
            const folderStructure = window.annotationDriveService.getFolderStructure();
            
            if (folderStructure.initialized) {
                folderStatus.style.display = 'block';
                
                if (folderStructure.projectFolderUrl) {
                    document.getElementById('project-folder-link').href = folderStructure.projectFolderUrl;
                    document.getElementById('project-folder-link').style.display = 'inline';
                }
                
                if (folderStructure.jsonFolderUrl) {
                    document.getElementById('json-folder-link').href = folderStructure.jsonFolderUrl;
                    document.getElementById('json-folder-link').style.display = 'inline';
                }
                
                if (folderStructure.pdfFolderUrl) {
                    document.getElementById('pdf-folder-link').href = folderStructure.pdfFolderUrl;
                    document.getElementById('pdf-folder-link').style.display = 'inline';
                }
            }
        }
    }

    async function signInToGoogle() {
        try {
            await window.googleDriveService.signIn();
        } catch (error) {
            console.error('Sign in failed:', error);
            alert('Sign in failed: ' + error.message);
        }
    }

    // Recent uploads
    function updateRecentUploads() {
        if (!window.annotationDriveService) return;
        
        const history = window.annotationDriveService.getAnnotationSetHistory();
        
        if (history.length === 0) {
            recentUploads.style.display = 'none';
            return;
        }

        recentUploads.style.display = 'block';
        recentUploadsList.innerHTML = history.map(item => `
            <div class="upload-item">
                <h4>${item.setName}</h4>
                <div class="upload-meta">
                    ${new Date(item.timestamp).toLocaleString()} • 
                    ${item.success ? '✅ Success' : '❌ Failed'}
                </div>
                <div class="upload-links">
                    ${item.jsonSheetUrl ? `<a href="${item.jsonSheetUrl}" target="_blank" class="link-button">Sheet</a>` : ''}
                    ${item.pdfFileUrl ? `<a href="${item.pdfFileUrl}" target="_blank" class="link-button">PDF</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    function clearHistory() {
        if (confirm('Clear upload history? This cannot be undone.')) {
            window.annotationDriveService.clearAnnotationSetHistory();
            updateRecentUploads();
        }
    }

    // Listen for auth changes
    window.addEventListener('driveAuthChanged', updateAuthStatus);

    // Auto-update status periodically
    setInterval(updateAuthStatus, 3000);
});
</script>