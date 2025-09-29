---
layout: page
title: Error Annotator
permalink: /error-annotator/
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

#error-annotator-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    padding: 20px 0;
}

.annotator-header {
    text-align: center;
    margin-bottom: 30px;
    flex-shrink: 0;
}

.annotator-header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 10px;
    color: #2c3e50;
}

.annotator-header p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 20px;
    color: #7f8c8d;
}

.navigation-links {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(231,76,60,0.1);
    border-radius: 8px;
    border-left: 4px solid #e74c3c;
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
    background: #e74c3c;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-link-btn:hover {
    background: #c0392b;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

.nav-link-btn.secondary {
    background: #3498db;
}

.nav-link-btn.secondary:hover {
    background: #2980b9;
}

/* Upload section */
.upload-section {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    margin-bottom: 20px;
}

.upload-box {
    text-align: center;
    padding: 40px 30px;
    border: 3px dashed #bdc3c7;
    border-radius: 12px;
    background: white;
    max-width: 500px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.upload-box:hover {
    border-color: #e74c3c;
    box-shadow: 0 6px 20px rgba(231,76,60,0.2);
}

.upload-box h3 {
    margin-bottom: 20px;
    color: #2c3e50;
    font-size: 1.3rem;
    font-weight: 600;
}

.file-input {
    margin-bottom: 20px;
    width: 100%;
    padding: 12px;
    font-size: 14px;
    border: 2px solid #bdc3c7;
    border-radius: 6px;
    background: white;
    color: #2c3e50;
}

.upload-instructions p {
    margin-bottom: 10px;
    color: #7f8c8d;
    font-size: 14px;
}

/* Navigation */
.navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.nav-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
    background: #c0392b;
    transform: translateY(-1px);
}

.nav-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
}

.entry-info {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
}

.load-status {
    color: #f39c12;
    font-weight: 500;
}

/* Main annotation interface */
.annotation-interface {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
}

/* Error categories at top */
.top-error-categories {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.top-error-categories h4 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-size: 16px;
    font-weight: 600;
}

.error-categories-top {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.category-section-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
}

.category-section-header {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.category-tag {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.category-tag:hover {
    background: #c0392b;
    transform: translateY(-1px);
}

.category-tag.shortcut {
    position: relative;
    padding-left: 24px;
}

.shortcut-key {
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
    padding: 2px 4px;
    font-size: 10px;
    font-weight: bold;
}

/* Main content grid */
.main-content-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 20px;
    align-items: start;
}

/* Code panel */
.code-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
}

.code-section {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    flex: 1;
}

.code-section h4 {
    padding: 15px 20px;
    background: #2c3e50;
    color: white;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
}

.code-content {
    padding: 20px;
    background: #f8f9fa;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    max-height: 300px;
    overflow-y: auto;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: #2c3e50;
}

.code-content.code-success {
    background: #d4edda;
    border-left: 4px solid #27ae60;
}

.code-content.code-error {
    background: #f8d7da;
    border-left: 4px solid #e74c3c;
}

/* Right sidebar */
.right-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 350px;
    flex-shrink: 0;
}

/* Details panel */
.details-panel {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    height: fit-content;
}

.details-panel h3 {
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #e74c3c;
    padding-bottom: 8px;
}

.detail-item {
    margin-bottom: 12px;
}

.detail-label {
    font-weight: 600;
    color: #2c3e50;
    display: inline-block;
    min-width: 120px;
}

.test-results {
    margin-top: 8px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
}

.test-results > div {
    margin-bottom: 5px;
}

.test-error {
    color: #e74c3c;
    font-weight: 500;
}

/* Tagging panel */
.tagging-panel {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    height: fit-content;
}

.tag-input-section,
.current-tags-section {
    margin-bottom: 25px;
}

.tag-input-section h4,
.current-tags-section h4 {
    margin-bottom: 12px;
    color: #2c3e50;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tag-input-controls {
    display: flex;
    gap: 8px;
}

.tag-input {
    flex: 1;
    padding: 8px 12px;
    border: 2px solid #bdc3c7;
    border-radius: 4px;
    font-size: 14px;
    color: #2c3e50;
}

.tag-input:focus {
    outline: none;
    border-color: #e74c3c;
}

.add-tag-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
    transition: background-color 0.3s;
}

.add-tag-btn:hover {
    background: #219a52;
}

/* Current tags */
.current-tags {
    min-height: 40px;
    max-height: 150px;
    overflow-y: auto;
}

.tag-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #e8f4fd;
    border: 1px solid #e74c3c;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 5px;
    font-size: 13px;
}

.tag-name {
    font-weight: 500;
}

.remove-tag {
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 11px;
    transition: background-color 0.3s;
}

.remove-tag:hover {
    background: #c0392b;
}

/* Action bar */
.action-bar {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 20px;
    padding: 20px;
}

.action-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.action-btn:hover {
    background: #c0392b;
    transform: translateY(-1px);
}

.action-btn.danger {
    background: #e74c3c;
}

.action-btn.danger:hover {
    background: #c0392b;
}

/* Modal styles */
.modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
}

.modal-content {
    background-color: white;
    margin: 5% auto;
    padding: 0;
    border-radius: 12px;
    width: 80%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.export-modal-large {
    max-width: 900px;
    width: 90%;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid #bdc3c7;
}

.modal-header h3 {
    margin: 0;
    color: #2c3e50;
}

.close {
    color: #aaa;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
}

.close:hover {
    color: #2c3e50;
}

.modal-body {
    padding: 25px;
}

/* Export sections */
.export-section {
    background: #ecf0f1;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    border-left: 4px solid #e74c3c;
}

.import-section { border-left-color: #17a2b8; }
.generation-section { border-left-color: #e74c3c; }
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
    background: #e74c3c;
    box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
}

.export-btn.primary:hover {
    background: #c0392b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
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
    border-left: 4px solid #e74c3c;
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
    color: #e74c3c;
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

/* Responsive design for error annotator */
@media (max-width: 1200px) {
    .main-content-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .right-sidebar {
        width: 100%;
        order: -1;
    }
    
    .code-panel {
        flex-direction: row;
    }
}

@media (max-width: 768px) {
    .code-panel {
        flex-direction: column;
    }
    
    .right-sidebar {
        width: 100%;
    }
    
    .action-bar {
        flex-wrap: wrap;
    }
    
    .modal-content {
        width: 95%;
        margin: 10% auto;
    }
    
    .navigation {
        flex-direction: column;
        gap: 10px;
    }
    
    .upload-box {
        padding: 30px 20px;
    }
    
    .category-section-container {
        justify-content: center;
    }
}
</style>

<div id="error-annotator-container">
    <div class="annotator-header">
        <h1>🏷️ Error Annotation Tool</h1>
        <p>Upload CSV files containing error data and annotate them with categories for analysis and model improvement.</p>
        
        <div class="navigation-links">
            <h3>🔗 Quick Navigation</h3>
            <a href="/code-comprehension-project/" class="nav-link-btn secondary">← Back to Main Project</a>
            <a href="/pdf-history-viewer/" class="nav-link-btn secondary">PDF History Viewer</a>
        </div>
    </div>

    <!-- File upload section -->
    <div id="uploadSection" class="upload-section">
        <div class="upload-box">
            <h3>Upload CSV File</h3>
            <input type="file" id="csvFileInput" accept=".csv" class="file-input">
            <div class="upload-instructions">
                <p>Select your CSV file containing error data to begin annotation.</p>
                <p>Expected format: task_id, original code, refactored_code, test results...</p>
            </div>
        </div>
    </div>

    <!-- Navigation bar -->
    <nav class="navigation" style="display: none;" id="annotationNavigation">
        <div class="nav-controls">
            <button id="prevBtn" class="nav-btn" title="Previous entry (← key)">← Previous</button>
            <span id="entryInfo" class="entry-info">Entry 1 of 0</span>
            <button id="nextBtn" class="nav-btn" title="Next entry (→ key)">Next →</button>
            <div style="font-size: 11px; color: #666; margin-left: 20px;">
                Use ← → arrow keys to navigate
            </div>
        </div>
        <div class="nav-status">
            <span id="loadStatus" class="load-status">Load CSV to start</span>
        </div>
    </nav>

    <!-- Main annotation interface (hidden initially) -->
    <div id="annotationInterface" class="annotation-interface" style="display: none;">
        <!-- Error Categories - moved to top -->
        <div class="top-error-categories">
            <h4>Error Categories</h4>
            <div class="instructions" style="font-size: 12px; color: #666; margin-bottom: 10px; font-style: italic;">
                Use keyboard numbers 1-7 to quickly assign categories, or click the buttons below.
            </div>
            <div id="errorCategories" class="error-categories-top"></div>
        </div>

        <div class="main-content-grid">
            <!-- Code comparison panel - left side, takes remaining space -->
            <div class="code-panel">
                <div class="code-section">
                    <h4>Original Code</h4>
                    <pre id="originalCode" class="code-content">Loading...</pre>
                </div>
                <div class="code-section">
                    <h4>Refactored Code</h4>
                    <pre id="refactoredCode" class="code-content">Loading...</pre>
                </div>
            </div>

            <!-- Right sidebar - entry details and tagging -->
            <div class="right-sidebar">
                <!-- Entry details panel -->
                <div class="details-panel">
                    <h3>Entry Details</h3>
                    <div id="entryDetails" class="details-content">
                        <div class="detail-item">
                            <span class="detail-label">Task ID:</span>
                            <span id="taskId">-</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Task Description:</span>
                            <span id="taskDescription">-</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Primary Method:</span>
                            <span id="primaryMethod">-</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Test Results:</span>
                            <div id="testResults" class="test-results">
                                <div id="originalResult">Original: -</div>
                                <div id="refactoredResult">Refactored: -</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tagging panel -->
                <div class="tagging-panel">
                    <div class="tag-input-section">
                        <h4>Add Custom Tag</h4>
                        <div class="tag-input-controls">
                            <input type="text" id="customTagInput" placeholder="Enter custom tag..." class="tag-input">
                            <button id="addCustomTagBtn" class="add-tag-btn">Add Tag</button>
                        </div>
                    </div>

                    <div class="current-tags-section">
                        <h4>Current Entry Tags</h4>
                        <div id="currentTags" class="current-tags">
                            No tags assigned
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Action buttons -->
    <div class="action-bar" style="display: none;" id="annotationActions">
        <button id="statsBtn" class="action-btn">View Statistics</button>
        <button id="exportBtn" class="action-btn">Export Data</button>
        <button id="clearBtn" class="action-btn danger">Clear All Tags</button>
    </div>
</div>

<!-- Statistics modal -->
<div id="statsModal" class="modal" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Annotation Statistics</h3>
            <span class="close" id="closeStatsModal">&times;</span>
        </div>
        <div class="modal-body">
            <div id="statsContent" class="stats-content"></div>
        </div>
    </div>
</div>

<!-- Export modal -->
<div id="exportModal" class="modal" style="display: none;">
    <div class="modal-content export-modal-large">
        <div class="modal-header">
            <h3>📊 Advanced Export & Import</h3>
            <span class="close" id="closeExportModal">&times;</span>
        </div>
        <div class="modal-body">
            
            <!-- Import Section -->
            <div class="export-section import-section">
                <h4>📥 Import Existing Prompt</h4>
                <div class="import-controls">
                    <div class="import-method">
                        <label for="promptFileInput">Import from File:</label>
                        <input type="file" id="promptFileInput" accept=".txt,.md" class="file-input-small">
                    </div>
                    <div class="import-method">
                        <label for="promptTextInput">Or paste prompt text:</label>
                        <textarea id="promptTextInput" placeholder="Paste your existing prompt here..." rows="4" class="prompt-textarea"></textarea>
                        <button id="importPromptBtn" class="import-btn">📥 Import Prompt</button>
                    </div>
                </div>
                <div id="importedPromptInfo" class="imported-info" style="display: none;">
                    <div class="info-badge">✅ Prompt imported successfully</div>
                    <div class="prompt-preview" id="promptPreviewText"></div>
                </div>
            </div>

            <!-- Enhanced Prompt Generation -->
            <div class="export-section generation-section">
                <h4>🚀 Generate Enhanced Prompt</h4>
                <p class="section-description">Generate an improved prompt based on your annotation patterns and error analysis.</p>
                <div class="export-controls">
                    <button id="generatePromptBtn" class="export-btn primary">🚀 Generate Enhanced Prompt</button>
                    <button id="copyPromptBtn" class="export-btn secondary" disabled>📋 Copy Prompt</button>
                    <button id="downloadPromptBtn" class="export-btn secondary" disabled>💾 Download Prompt</button>
                </div>
                <div id="promptOutput" class="output-section" style="display: none;">
                    <h5>Generated Enhanced Prompt:</h5>
                    <div class="output-text" id="generatedPromptText"></div>
                </div>
            </div>

            <!-- Data Export Section -->
            <div class="export-section data-section">
                <h4>📊 Export Analysis Data</h4>
                <div class="export-controls">
                    <button id="generateJsonBtn" class="export-btn tertiary">📈 Generate JSON Analysis</button>
                    <button id="copyJsonBtn" class="export-btn secondary" disabled>📋 Copy JSON</button>
                    <button id="downloadJsonBtn" class="export-btn secondary" disabled>💾 Download JSON</button>
                </div>
                <div id="jsonOutput" class="output-section" style="display: none;">
                    <h5>Generated Analysis Data (JSON):</h5>
                    <div class="output-text" id="generatedJsonText"></div>
                </div>
            </div>

            <!-- CSV Association Section -->
            <div class="export-section association-section">
                <h4>🔗 Associate Current CSV with Prompt</h4>
                <div class="csv-association-controls">
                    <button id="associateCurrentBtn" class="export-btn secondary" disabled>🔗 Associate with Current Prompt</button>
                    <button id="viewAssociationsBtn" class="export-btn secondary">👁️ View All Associations</button>
                </div>
                <div id="associationsDisplay" class="associations-display" style="display: none;"></div>
            </div>

            <!-- Traditional Export -->
            <div class="export-section traditional-section">
                <h4>📄 Traditional Export</h4>
                <div class="export-controls">
                    <button id="exportJsonBtn" class="export-btn">📄 Download Annotations JSON</button>
                    <button id="exportCsvBtn" class="export-btn">📊 Download CSV Report</button>
                </div>
            </div>

            <!-- Statistics Summary -->
            <div class="export-section stats-section" id="exportStatsSection" style="display: none;">
                <h4>📊 Analysis Summary</h4>
                <div class="stats-grid" id="exportStatsGrid"></div>
            </div>

            <div id="exportPreview" class="export-preview"></div>
        </div>
    </div>
</div>

<script src="{{ '/assets/js/error-annotator.js' | relative_url }}"></script>

</div>

<script>
console.log('Error Annotator - Script loaded');

document.addEventListener('authReady', () => {
    console.log('Error Annotator - authReady event fired');
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
        console.log('Error Annotator - User Debug Info:', {
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
        console.log('Error Annotator - User not authenticated');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
});

console.log('Error Annotator - Setting up timeout fallback');

// If auth service isn't ready after 5 seconds, show access denied
setTimeout(() => {
    console.log('Error Annotator - Timeout check - authService available:', !!window.authService);
    console.log('Error Annotator - Timeout check - isAuthenticated:', window.authService?.isAuthenticated);
    if (!window.authService || !window.authService.isAuthenticated) {
        console.log('Error Annotator - Timeout triggered, showing access denied');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
}, 5000);
</script>