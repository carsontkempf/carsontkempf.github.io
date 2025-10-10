---
layout: page
title: Code Comprehension Project
permalink: /code-comprehension/
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

#pdf-interface-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    padding: 20px 0;
}

.pdf-header {
    text-align: center;
    margin-bottom: 30px;
    flex-shrink: 0;
}

.pdf-header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 10px;
    color: #2c3e50;
}

.pdf-header p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 20px;
    color: #7f8c8d;
}

.memory-indicator {
    display: inline-flex;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 25px;
    padding: 10px 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(102,126,234,0.3);
    color: white;
}

.containers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 30px;
}

.pdf-container {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    overflow: hidden;
    height: 250px;
    backdrop-filter: blur(10px);
}

.container-header {
    padding: 10px 15px;
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    color: white;
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.container-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 3px;
}

.container-subtitle {
    font-size: 0.8rem;
    opacity: 0.8;
}

.memory-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 3px;
    padding: 10px;
    flex: 1;
    background: #f8f9fa;
}

.memory-slot {
    padding: 4px 2px;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    text-align: center;
    font-size: 9px;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 24px;
}

.memory-slot:hover {
    background: #e3f2fd;
    border-color: #2196f3;
    transform: translateY(-1px);
}

.memory-slot.active {
    background: #e74c3c;
    border-color: #e74c3c;
    color: white;
    box-shadow: 0 2px 8px rgba(231,76,60,0.4);
}

.memory-slot.milestone {
    background: #f39c12;
    border-color: #f39c12;
    color: white;
    box-shadow: 0 2px 8px rgba(243,156,18,0.4);
}

.memory-slot.empty {
    opacity: 0.3;
    cursor: not-allowed;
}

.container-controls {
    padding: 8px 12px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-button {
    padding: 6px 12px;
    border: 1px solid #007bff;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
    background: #0056b3;
    border-color: #0056b3;
}

.nav-button:disabled {
    background: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
}

.memory-info {
    font-size: 11px;
    color: #6c757d;
    text-align: center;
    max-width: 120px;
    line-height: 1.2;
}

.pdf-viewer-container {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    overflow: hidden;
    height: 70vh;
    backdrop-filter: blur(10px);
}

.viewer-header {
    padding: 15px 20px;
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.viewer-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 5px;
}

.viewer-subtitle {
    font-size: 1rem;
    opacity: 0.9;
}

.pdf-viewer {
    flex: 1;
    width: 100%;
    height: 100%;
    border: none;
    background: white;
}

.loading {
    text-align: center;
    padding: 50px;
    color: #7f8c8d;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.performance-history {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.error-analysis {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.error-comparison {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.error-breakdown {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

@media (max-width: 1200px) {
    .containers-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
    
    .memory-grid {
        grid-template-columns: repeat(10, 1fr);
    }
}

@media (max-width: 768px) {
    .memory-grid {
        grid-template-columns: repeat(8, 1fr);
        gap: 2px;
        padding: 10px;
    }
    
    .memory-slot {
        font-size: 8px;
        padding: 4px 2px;
        min-height: 24px;
    }
}

/* Error Annotator Styles */
#error-annotator-container {
    margin-top: 20px;
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
    border-color: #3498db;
    box-shadow: 0 6px 20px rgba(52,152,219,0.2);
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
    background: #3498db;
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
    background: #2980b9;
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
    border-bottom: 2px solid #3498db;
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
    border-color: #3498db;
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
    border: 1px solid #3498db;
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
    background: #3498db;
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
    background: #2980b9;
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
    border-left: 4px solid #3498db;
}

.import-section { border-left-color: #17a2b8; }
.generation-section { border-left-color: #3498db; }
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
    background: #3498db;
    box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.export-btn.primary:hover {
    background: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
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
    border-left: 4px solid #3498db;
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
}
</style>

<div id="pdf-interface-container">
    <div class="pdf-header">
        <h1>Code Comprehension Project</h1>
        <p>Multi-Container PDF Memory System & Error Analysis Tools</p>
        

        <!-- Performance History PDF Display -->
        <div style="margin-top: 30px; width: 100%; max-width: 1200px; margin-left: auto; margin-right: auto;">
            <div style="background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="padding: 20px; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; text-align: center;">
                    <h3 style="margin: 0; font-size: 1.4rem; font-weight: 600;">📈 Performance History Report</h3>
                    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 1rem;">Latest milestone report from the PDF memory system</p>
                </div>
                <div style="position: relative; width: 100%; height: 70vh;">
                    <embed 
                        src="/assets/pdf-memory/milestones/milestone_0010.pdf" 
                        type="application/pdf" 
                        width="100%" 
                        height="100%" 
                        style="border: none; display: block;"
                    />
                </div>
            </div>
        </div>

        <!-- Tool Buttons -->
        <div style="margin-top: 30px; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <!-- Error Annotator Tool -->
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 8px 20px rgba(231,76,60,0.3); max-width: 400px; flex: 1; min-width: 300px;">
                <h3 style="color: white; margin: 0 0 20px 0; font-size: 1.3rem;">Error Annotator</h3>
                <a href="/code-comprehension/error-annotator/" style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); transition: all 0.3s ease;">
                    Open Error Annotator →
                </a>
            </div>

            <!-- Tree Visualizer Tool -->
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 8px 20px rgba(231,76,60,0.3); max-width: 400px; flex: 1; min-width: 300px;">
                <h3 style="color: white; margin: 0 0 20px 0; font-size: 1.3rem;">Tree Visualizer</h3>
                <a href="/code-comprehension/tree-visualizer/" style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); transition: all 0.3s ease;">
                    Open Tree Visualizer →
                </a>
            </div>

            <!-- API Endpoints Tool -->
            <div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 8px 20px rgba(155,89,182,0.3); max-width: 400px; flex: 1; min-width: 300px;">
                <h3 style="color: white; margin: 0 0 20px 0; font-size: 1.3rem;">Flask API Endpoints</h3>
                <a href="/code-comprehension/api-endpoints/" style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); transition: all 0.3s ease;">
                    View API Docs →
                </a>
            </div>

        </div>

    </div>

    </div>
</div>


</div>


<script>
console.log('Code Comprehension Project - Script loaded');

document.addEventListener('authReady', () => {
    console.log('Code Comprehension Project - authReady event fired');
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
        console.log('Code Comprehension Project - User Debug Info:', {
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
        console.log('Code Comprehension Project - User not authenticated');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
});

console.log('Code Comprehension Project - Setting up timeout fallback');

// If auth service isn't ready after 5 seconds, show access denied
setTimeout(() => {
    console.log('Code Comprehension Project - Timeout check - authService available:', !!window.authService);
    console.log('Code Comprehension Project - Timeout check - isAuthenticated:', window.authService?.isAuthenticated);
    if (!window.authService || !window.authService.isAuthenticated) {
        console.log('Code Comprehension Project - Timeout triggered, showing access denied');
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
}, 5000);
</script>