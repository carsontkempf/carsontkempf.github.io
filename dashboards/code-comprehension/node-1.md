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
</div>

<script src="/assets/js/env-config.js"></script>
<script src="/assets/js/code-comprehension/node-api.js"></script>
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
</script>