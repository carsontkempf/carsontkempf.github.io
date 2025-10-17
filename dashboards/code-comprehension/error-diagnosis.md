---
layout: code-comprehension
title: Error Diagnosis
permalink: /code-comprehension/error-diagnosis/
auth_required: true
custom_js:
  - /assets/js/env-config.js
back_url: /code-comprehension/
back_text: Code Comprehension
---

{% include widgets/navigation/back-button.html back_url=page.back_url back_text=page.back_text %}

<!-- API Connection Status Bars -->
<div id="api-connection-status" class="api-connection-status" style="display: none;">
  <div class="connection-bars-container">
    <div class="connection-bar" id="connection-bar-1">
      <div class="bar-fill" id="bar-fill-1"></div>
    </div>
    <div class="connection-bar" id="connection-bar-2">
      <div class="bar-fill" id="bar-fill-2"></div>
    </div>
    <div class="connection-bar" id="connection-bar-3">
      <div class="bar-fill" id="bar-fill-3"></div>
    </div>
  </div>
  <div class="connection-status-text" id="connection-status-text">Connecting to Flask API...</div>
</div>

<div id="error-diagnosis-container">
  <div class="error-diagnosis-header">
    <h2>AI Error Diagnosis</h2>
    <p>Upload error data and let AI diagnose and fix refactoring issues using our 9 refactoring categories.</p>
  </div>

  <div class="upload-section">
    <div class="file-upload-area" id="file-upload-area">
      <input type="file" id="error-file-input" accept=".json" style="display: none;">
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p>Drop JSON error file here or click to browse</p>
        <button id="browse-button" class="btn btn-primary">Browse Files</button>
      </div>
    </div>
  </div>

  <div id="file-info" class="file-info" style="display: none;">
    <h3>File Information</h3>
    <div id="file-details"></div>
  </div>

  <div class="diagnosis-controls">
    <button id="diagnose-button" class="btn btn-success" disabled>
      <span id="diagnose-text">Diagnose Errors</span>
      <span id="diagnose-spinner" class="spinner" style="display: none;">🔄</span>
    </button>
  </div>

  <div id="diagnosis-results" class="diagnosis-results" style="display: none;">
    <h3>Diagnosis Results</h3>
    <div id="results-content"></div>
  </div>

  <div id="refactored-code" class="refactored-code" style="display: none;">
    <h3>Refactored Code</h3>
    <div class="code-container">
      <pre><code id="refactored-code-content"></code></pre>
    </div>
    <div class="code-actions">
      <button id="copy-code-button" class="btn btn-secondary">Copy Code</button>
      <button id="download-code-button" class="btn btn-secondary">Download</button>
    </div>
  </div>
</div>

<style>
/* API Connection Status Bars */
.api-connection-status {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.connection-bars-container {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.connection-bar {
  width: 80px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  width: 0%;
  border-radius: 3px;
  transition: all 0.3s ease;
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
}

.bar-fill.warning {
  background: linear-gradient(90deg, #ffc107 0%, #fd7e14 100%);
}

.bar-fill.error {
  background: linear-gradient(90deg, #dc3545 0%, #e74c3c 100%);
}

.connection-status-text {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  margin: 0;
}

.error-diagnosis-header {
  text-align: center;
  margin-bottom: 2rem;
}

.upload-section {
  margin-bottom: 2rem;
}

.file-upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.3s ease;
  cursor: pointer;
}

.file-upload-area:hover,
.file-upload-area.dragover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.file-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.diagnosis-controls {
  text-align: center;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.diagnosis-results {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.refactored-code {
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
}

.code-container {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.code-container pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
}

.code-container code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
}

.code-actions {
  display: flex;
  gap: 1rem;
}

.error-category {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.error-category h4 {
  margin: 0 0 0.5rem 0;
  color: #856404;
}

.error-category p {
  margin: 0;
  font-size: 0.875rem;
}

.fix-preview {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 0.5rem;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const fileUploadArea = document.getElementById('file-upload-area');
  const fileInput = document.getElementById('error-file-input');
  const browseButton = document.getElementById('browse-button');
  const fileInfo = document.getElementById('file-info');
  const fileDetails = document.getElementById('file-details');
  const diagnoseButton = document.getElementById('diagnose-button');
  const diagnoseText = document.getElementById('diagnose-text');
  const diagnoseSpinner = document.getElementById('diagnose-spinner');
  const diagnosisResults = document.getElementById('diagnosis-results');
  const resultsContent = document.getElementById('results-content');
  const refactoredCode = document.getElementById('refactored-code');
  const refactoredCodeContent = document.getElementById('refactored-code-content');
  const copyCodeButton = document.getElementById('copy-code-button');
  const downloadCodeButton = document.getElementById('download-code-button');

  let currentFileData = null;
  let connectionStatusManager = null;

  // API Connection Status Manager
  class APIConnectionStatusManager {
    constructor() {
      this.statusElement = document.getElementById('api-connection-status');
      this.statusText = document.getElementById('connection-status-text');
      this.bars = [
        document.getElementById('bar-fill-1'),
        document.getElementById('bar-fill-2'),
        document.getElementById('bar-fill-3')
      ];
      this.currentStep = 0;
      this.isVisible = false;
    }

    show() {
      this.statusElement.style.display = 'block';
      this.isVisible = true;
      this.reset();
    }

    hide() {
      setTimeout(() => {
        this.statusElement.style.display = 'none';
        this.isVisible = false;
      }, 1000);
    }

    reset() {
      this.currentStep = 0;
      this.bars.forEach((bar, index) => {
        bar.style.width = '0%';
        bar.className = 'bar-fill';
      });
      this.statusText.textContent = 'Connecting to Flask API...';
    }

    updateProgress(step, progress, status = 'success') {
      if (step >= 0 && step < this.bars.length) {
        const bar = this.bars[step];
        bar.style.width = progress + '%';
        
        // Update bar color based on status
        bar.className = 'bar-fill';
        if (status === 'warning') {
          bar.classList.add('warning');
        } else if (status === 'error') {
          bar.classList.add('error');
        }
      }

      // Update status text based on current step and status
      this.updateStatusText(step, progress, status);
    }

    updateStatusText(step, progress, status) {
      const stepTexts = [
        'Establishing connection...',
        'Authenticating request...',
        'Processing data...'
      ];

      if (status === 'error') {
        this.statusText.textContent = 'Connection failed - Please check backend server';
      } else if (progress === 100) {
        if (step === this.bars.length - 1) {
          this.statusText.textContent = 'Connected successfully!';
        } else {
          this.statusText.textContent = stepTexts[step + 1] || 'Processing...';
        }
      } else if (status === 'warning') {
        this.statusText.textContent = 'Connection slow - Retrying...';
      } else {
        this.statusText.textContent = stepTexts[step] || 'Connecting...';
      }
    }

    simulateConnection(onComplete) {
      this.show();
      let step = 0;
      let progress = 0;

      const updateProgress = () => {
        if (step >= this.bars.length) {
          setTimeout(() => {
            this.hide();
            if (onComplete) onComplete(true);
          }, 800);
          return;
        }

        // Simulate realistic connection progress
        const increment = Math.random() * 25 + 10; // 10-35% increments
        progress += increment;

        if (progress >= 100) {
          progress = 100;
          this.updateProgress(step, progress, 'success');
          setTimeout(() => {
            step++;
            progress = 0;
            updateProgress();
          }, 300);
        } else {
          this.updateProgress(step, progress, 'success');
          setTimeout(updateProgress, Math.random() * 200 + 100); // 100-300ms delay
        }
      };

      updateProgress();
    }

    simulateError() {
      this.show();
      // Fill first bar partially then show error
      this.updateProgress(0, 30, 'success');
      setTimeout(() => {
        this.updateProgress(0, 60, 'warning');
        setTimeout(() => {
          this.updateProgress(0, 100, 'error');
          this.updateProgress(1, 0, 'error');
          this.updateProgress(2, 0, 'error');
        }, 1000);
      }, 500);
    }
  }

  // Initialize connection status manager
  connectionStatusManager = new APIConnectionStatusManager();

  // File upload handlers
  browseButton.addEventListener('click', () => fileInput.click());
  fileUploadArea.addEventListener('click', () => fileInput.click());

  fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('dragover');
  });

  fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('dragover');
  });

  fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.json')) {
      alert('Please select a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        currentFileData = JSON.parse(e.target.result);
        displayFileInfo(file, currentFileData);
        diagnoseButton.disabled = false;
      } catch (error) {
        alert('Invalid JSON file. Please check the format.');
        console.error('JSON parse error:', error);
      }
    };
    reader.readAsText(file);
  }

  function displayFileInfo(file, data) {
    const errorCount = Array.isArray(data.errors) ? data.errors.length : 
                      (data.annotations ? data.annotations.length : 'Unknown');
    
    fileDetails.innerHTML = `
      <p><strong>File:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
      <p><strong>Errors Found:</strong> ${errorCount}</p>
      <p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>
    `;
    fileInfo.style.display = 'block';
  }

  // Diagnosis functionality
  diagnoseButton.addEventListener('click', async () => {
    if (!currentFileData) return;

    setLoadingState(true);

    // Start connection status simulation
    connectionStatusManager.simulateConnection(async (success) => {
      if (!success) {
        setLoadingState(false);
        return;
      }

      try {
        // Get the backend API URL from environment or use default
        const backendUrl = window.ENV?.BACKEND_API_URL || 'http://127.0.0.1:5000';
        
        const response = await fetch(`${backendUrl}/api/v1/diagnosis/analyze-errors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error_data: currentFileData,
            use_refactoring_categories: true
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        displayResults(result);
      } catch (error) {
        console.error('Diagnosis error:', error);
        connectionStatusManager.simulateError();
        setTimeout(() => {
          alert('Error occurred during diagnosis. Please check that your Flask backend is running.');
        }, 2000);
      } finally {
        setLoadingState(false);
      }
    });
  });

  function setLoadingState(loading) {
    diagnoseButton.disabled = loading;
    diagnoseText.style.display = loading ? 'none' : 'inline';
    diagnoseSpinner.style.display = loading ? 'inline' : 'none';
  }

  function displayResults(result) {
    if (result.success) {
      // Display categorized errors
      const categoriesHtml = result.categorized_errors.map(category => `
        <div class="error-category">
          <h4>${category.name} (${category.category})</h4>
          <p><strong>Complexity:</strong> ${category.complexity}</p>
          <p><strong>Description:</strong> ${category.description}</p>
          <p><strong>Errors Found:</strong> ${category.errors.length}</p>
          ${category.errors.map(error => `
            <div class="fix-preview">
              <strong>Error:</strong> ${error.description || error.error_type}<br>
              <strong>Suggested Fix:</strong> ${error.suggested_fix || 'Fix automatically applied'}
            </div>
          `).join('')}
        </div>
      `).join('');

      resultsContent.innerHTML = `
        <div class="diagnosis-summary">
          <h4>Diagnosis Summary</h4>
          <p><strong>Total Errors:</strong> ${result.total_errors}</p>
          <p><strong>Categories Affected:</strong> ${result.categories_affected}</p>
          <p><strong>Confidence:</strong> ${result.confidence}%</p>
        </div>
        <div class="error-categories">
          <h4>Error Categories</h4>
          ${categoriesHtml}
        </div>
      `;

      diagnosisResults.style.display = 'block';

      // Display refactored code if available
      if (result.refactored_code) {
        refactoredCodeContent.textContent = result.refactored_code;
        refactoredCode.style.display = 'block';
      }
    } else {
      resultsContent.innerHTML = `
        <div class="alert alert-danger">
          <strong>Diagnosis Failed:</strong> ${result.error || 'Unknown error occurred'}
        </div>
      `;
      diagnosisResults.style.display = 'block';
    }
  }

  // Code actions
  copyCodeButton.addEventListener('click', () => {
    navigator.clipboard.writeText(refactoredCodeContent.textContent)
      .then(() => {
        const originalText = copyCodeButton.textContent;
        copyCodeButton.textContent = 'Copied!';
        setTimeout(() => {
          copyCodeButton.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
        alert('Failed to copy code to clipboard');
      });
  });

  downloadCodeButton.addEventListener('click', () => {
    const blob = new Blob([refactoredCodeContent.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refactored-code.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
</script>