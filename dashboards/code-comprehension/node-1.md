---
layout: dashboard-project
title: "Step 1: Ingest & Baseline Agent"
permalink: /code-comprehension/node-1/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.api-section {
  background: var(--bg-tile);
  border-radius: var(--border-radius);
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid var(--link-bg);
}

.api-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 15px 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.btn-create { background: #27ae60; color: white; }
.btn-read { background: #3498db; color: white; }
.btn-update { background: #f39c12; color: white; }
.btn-delete { background: #e74c3c; color: white; }

.btn:hover { transform: translateY(-2px); opacity: 0.9; }

.response-area {
  background: var(--bg-code-block);
  color: var(--text-main);
  padding: 15px;
  border-radius: 5px;
  margin: 10px 0;
  min-height: 100px;
  white-space: pre-wrap;
  font-family: 'Monaco', 'Menlo', monospace;
  display: none;
}

.input-area {
  margin: 15px 0;
}

.input-area textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  border: 1px solid var(--bg-accent);
  border-radius: 5px;
  font-family: 'Monaco', 'Menlo', monospace;
  background: var(--bg-page);
  color: var(--text-main);
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-success { background: #27ae60; }
.status-error { background: #e74c3c; }
.status-pending { background: #f39c12; }

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding: 20px;
  background: var(--bg-tile);
  border-radius: var(--border-radius);
  border: 2px solid var(--bg-accent);
}

.navigation .btn {
  background: var(--link-bg) !important;
  color: var(--text-heading) !important;
  border: 2px solid var(--bg-accent);
}

.navigation .btn:hover {
  background: var(--bg-accent) !important;
  border-color: var(--link-bg);
  transform: translateY(-2px);
}

.memory-section {
  margin-top: 40px;
  border-top: 2px solid var(--bg-accent);
  padding-top: 30px;
}

.memory-container {
  margin: 20px 0;
  background: var(--bg-tile);
  border-radius: var(--border-radius);
  padding: 20px;
  border: 1px solid var(--bg-accent);
}

.memory-container h3 {
  color: var(--text-heading);
  margin-bottom: 15px;
  border-bottom: 1px solid var(--bg-accent);
  padding-bottom: 10px;
}

.memory-editor-minimal {
  border: 1px solid var(--bg-accent);
  border-radius: 5px;
  background: var(--bg-page);
}

.memory-editor-minimal .EasyMDEContainer {
  border: none;
}

.memory-editor-minimal .editor-toolbar {
  background: var(--bg-tile);
  border-bottom: 1px solid var(--bg-accent);
}

.memory-editor-minimal .CodeMirror {
  background: var(--bg-page);
  color: var(--text-main);
  min-height: 200px;
}
</style>

<div class="node-container">
  <h1>Step 1: Ingest & Baseline Agent</h1>
  
  <div class="description">
    <p>This initial step serves as the objective entry point for any piece of code entering the system.</p>
    
    <h3>Function:</h3>
    <ul>
      <li>Selects a code snippet and immediately runs the full suite of baseline measurements</li>
      <li>Performs linting, type checks, and unit tests</li>
      <li>Establishes a clean, data-driven "before" state</li>
    </ul>

    <h3>Purpose:</h3>
    <p>To establish a clean, data-driven "before" state against which the final result can be compared.</p>
  </div>

  <div class="api-section">
    <h3>API Testing Interface</h3>
    <p><span class="status-indicator status-pending"></span>Node 1 API Endpoints</p>
    
    <div class="api-buttons">
      <button class="btn btn-create" onclick="createNodeInput()">Create Input (POST)</button>
      <button class="btn btn-read" onclick="readNodeOutput()">Read Output (GET)</button>
      <button class="btn btn-update" onclick="updateNodeInput()">Update Input (PUT)</button>
      <button class="btn btn-delete" onclick="deleteNodeOutput()">Delete Output (DELETE)</button>
    </div>
    
    <div class="api-buttons" style="margin-top: 10px;">
      <button class="btn btn-create" onclick="chainToNextNode()">Chain to Node 2 →</button>
    </div>

    <div class="input-area">
      <label for="inputData"><strong>Input JSON Data:</strong></label>
      <textarea id="inputData" placeholder="Enter JSON data for Node 1...">{
  "source_code": "def calculate_stats(numbers):\n    # Calculate sum of squares for numbers > 5\n    sum_sq = 0\n    for n in numbers:\n        if n > 5:\n            sum_sq += n * n\n    # Calculate count of numbers > 5\n    count = 0\n    for n in numbers:\n        if n > 5:\n            count += 1\n    if count == 0:\n        return 0\n    return sum_sq / count",
  "test_cases": [
    {"input": [1, 6, 7, 8], "expected": 149},
    {"input": [1, 2, 3], "expected": 0},
    {"input": [10, 20], "expected": 250}
  ],
  "metadata": {
    "language": "python",
    "complexity": "medium",
    "author": "test_user"
  }
}</textarea>
    </div>

    <div id="responseArea" class="response-area"></div>
  </div>

  <div class="navigation">
    <a href="/code-comprehension/node-2/" class="btn btn-read">Next: Step 2 →</a>
  </div>

  <!-- Memory Editors Section -->
  <div class="memory-section">
    <h2>AI Agent Memory</h2>
    
    <!-- Short-term Memory Editor -->
    <div class="memory-container">
      <h3>Short-term Memory</h3>
      <div id="short-term-memory-editor"></div>
    </div>
    
    <!-- Long-term Memory Editor -->
    <div class="memory-container">
      <h3>Long-term Memory</h3>
      <div id="long-term-memory-editor"></div>
    </div>
  </div>
</div>

<link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
<link rel="stylesheet" href="/assets/css/memory-editor.css">
<script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
<script src="/assets/js/env-config.js"></script>
<script src="/assets/js/code-comprehension/node-api.js"></script>
<script src="/assets/js/memory-editor.js"></script>
<script>
const NODE_ID = 1;

function showResponse(result) {
  const responseArea = document.getElementById('responseArea');
  responseArea.style.display = 'block';
  responseArea.style.background = result.success ? '#2c3e50' : '#c0392b';
  
  const displayData = result.success ? result.data : { error: result.error };
  responseArea.textContent = JSON.stringify(displayData, null, 2);
  
  // Update status indicator
  updateStatusIndicator(result.success ? 'success' : 'error');
}

function updateStatusIndicator(status) {
  const indicator = document.querySelector('.status-indicator');
  indicator.className = `status-indicator status-${status}`;
}

async function createNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const result = await window.NodeAPI.createInput(NODE_ID, inputData);
    showResponse(result);
  } catch (error) {
    showResponse({ success: false, error: error.message });
  }
}

async function readNodeOutput() {
  try {
    const result = await window.NodeAPI.readOutput(NODE_ID);
    showResponse(result);
  } catch (error) {
    showResponse({ success: false, error: error.message });
  }
}

async function updateNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const result = await window.NodeAPI.updateInput(NODE_ID, inputData);
    showResponse(result);
  } catch (error) {
    showResponse({ success: false, error: error.message });
  }
}

async function deleteNodeOutput() {
  try {
    const result = await window.NodeAPI.deleteOutput(NODE_ID);
    showResponse(result);
  } catch (error) {
    showResponse({ success: false, error: error.message });
  }
}

// Additional function to chain to next node
async function chainToNextNode() {
  try {
    const result = await window.NodeAPI.chainNodes(NODE_ID, NODE_ID + 1);
    showResponse(result);
  } catch (error) {
    showResponse({ success: false, error: error.message });
  }
}

// Initialize memory editors for Node 1
let shortTermEditor, longTermEditor;

document.addEventListener('DOMContentLoaded', function() {
  // Get API base URL from env config
  const apiBaseUrl = window.ENV_CONFIG?.API_BASE_URL || 'http://localhost:5000/api/v1';
  
  // Initialize short-term memory editor
  const shortTermTextarea = document.createElement('textarea');
  shortTermTextarea.id = 'short-term-textarea';
  document.getElementById('short-term-memory-editor').appendChild(shortTermTextarea);
  
  shortTermEditor = new EasyMDE({
    element: shortTermTextarea,
    placeholder: 'Enter short-term memory for Node 1...',
    spellChecker: false,
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', '|', 'preview'],
    status: false,
    autofocus: false,
    minHeight: '200px'
  });
  
  // Initialize long-term memory editor
  const longTermTextarea = document.createElement('textarea');
  longTermTextarea.id = 'long-term-textarea';
  document.getElementById('long-term-memory-editor').appendChild(longTermTextarea);
  
  longTermEditor = new EasyMDE({
    element: longTermTextarea,
    placeholder: 'Enter long-term memory for Node 1...',
    spellChecker: false,
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'link', '|', 'preview'],
    status: ['lines', 'words'],
    autofocus: false,
    minHeight: '300px'
  });
  
  // Load memory content
  loadNodeMemory();
  
  // Auto-save functionality
  let saveTimeout;
  function autoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNodeMemory, 5000);
  }
  
  shortTermEditor.codemirror.on('change', autoSave);
  longTermEditor.codemirror.on('change', autoSave);
});

async function loadNodeMemory() {
  const apiBaseUrl = window.ENV_CONFIG?.API_BASE_URL || 'http://localhost:5000/api/v1';
  
  try {
    // Load short-term memory
    const shortTermResponse = await fetch(`${apiBaseUrl}/memory/node-1/short-term`);
    if (shortTermResponse.ok) {
      const shortTermData = await shortTermResponse.json();
      shortTermEditor.value(shortTermData.content || '# Node 1 Short-term Memory\n\n');
    } else {
      shortTermEditor.value('# Node 1 Short-term Memory\n\n## Current Session\n- Session status: New\n- Recent activities: None\n');
    }
    
    // Load long-term memory
    const longTermResponse = await fetch(`${apiBaseUrl}/memory/node-1/long-term`);
    if (longTermResponse.ok) {
      const longTermData = await longTermResponse.json();
      longTermEditor.value(longTermData.content || '# Node 1 Long-term Memory\n\n');
    } else {
      longTermEditor.value('# Node 1: Ingest & Baseline Agent - Long-term Memory\n\n## Purpose\nIngests baseline code and establishes initial analysis state.\n\n## Key Responsibilities\n- Code validation and syntax checking\n- Baseline metric calculation\n- Session initialization\n- Test execution setup\n\n## Learned Patterns\n- Common code issues to watch for\n- Effective baseline metrics\n- Successful initialization strategies\n');
    }
  } catch (error) {
    console.error('Failed to load memory:', error);
    // Set default content if backend is not available
    shortTermEditor.value('# Node 1 Short-term Memory\n\n## Current Session\n- Backend not available - working offline\n');
    longTermEditor.value('# Node 1: Ingest & Baseline Agent - Long-term Memory\n\n## Purpose\nIngests baseline code and establishes initial analysis state.\n\n## Key Responsibilities\n- Code validation and syntax checking\n- Baseline metric calculation\n- Session initialization\n- Test execution setup\n');
  }
}

async function saveNodeMemory() {
  const apiBaseUrl = window.ENV_CONFIG?.API_BASE_URL || 'http://localhost:5000/api/v1';
  
  try {
    // Save short-term memory
    await fetch(`${apiBaseUrl}/memory/node-1/short-term`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: shortTermEditor.value() })
    });
    
    // Save long-term memory
    await fetch(`${apiBaseUrl}/memory/node-1/long-term`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: longTermEditor.value() })
    });
    
    console.log('Node 1 memory saved successfully');
  } catch (error) {
    console.error('Failed to save memory:', error);
    // Save to localStorage as fallback
    localStorage.setItem('node-1-short-term', shortTermEditor.value());
    localStorage.setItem('node-1-long-term', longTermEditor.value());
  }
}
</script>