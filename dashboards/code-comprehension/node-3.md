---
layout: dashboard-project
title: "Step 3: Strategy Prediction Agent"
permalink: /code-comprehension/node-3/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container { max-width: 1000px; margin: 0 auto; padding: 20px; }
.api-section { background: var(--bg-tile); border-radius: var(--border-radius); padding: 20px; margin: 20px 0; border-left: 4px solid var(--link-bg); }
.api-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0; }
.btn { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.3s; }
.btn-create { background: #27ae60; color: white; }
.btn-read { background: #3498db; color: white; }
.btn-update { background: #f39c12; color: white; }
.btn-delete { background: #e74c3c; color: white; }
.btn:hover { transform: translateY(-2px); opacity: 0.9; }
.response-area { background: var(--bg-code-block); color: var(--text-main); padding: 15px; border-radius: 5px; margin: 10px 0; min-height: 100px; white-space: pre-wrap; font-family: 'Monaco', 'Menlo', monospace; display: none; }
.input-area { margin: 15px 0; }
.input-area textarea { width: 100%; height: 150px; padding: 10px; border: 1px solid var(--bg-accent); border-radius: 5px; font-family: 'Monaco', 'Menlo', monospace; background: var(--bg-page); color: var(--text-main); }
.status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
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
  <h1>Step 3: Strategy Prediction Agent (Decision Tree Brain)</h1>
  
  <div class="description">
    <p>This agent consolidates the feature engineering and prediction steps into a single "thinking" module. It only runs on code that passed the perplexity check.</p>
    
    <h3>Function:</h3>
    <ol>
      <li><strong>Feature Engineering:</strong> It first calculates the necessary features from the code (e.g., <code>cyclomatic_complexity</code>, <code>line_count</code>)</li>
      <li><strong>Prediction:</strong> It then loads your trained <strong>Random Forest model</strong> (<code>refactoring_model.pkl</code>) and uses these features to predict the single, statistically optimal refactoring action</li>
    </ol>

    <h3>Purpose:</h3>
    <p>To replace guessing with a data-driven decision on <em>how</em> to refactor the code.</p>
  </div>

  <div class="api-section">
    <h3>API Testing Interface</h3>
    <p><span class="status-indicator status-pending"></span>Node 3 API Endpoints</p>
    
    <div class="api-buttons">
      <button class="btn btn-create" onclick="createNodeInput()">Create Input (POST)</button>
      <button class="btn btn-read" onclick="readNodeOutput()">Read Output (GET)</button>
      <button class="btn btn-update" onclick="updateNodeInput()">Update Input (PUT)</button>
      <button class="btn btn-delete" onclick="deleteNodeOutput()">Delete Output (DELETE)</button>
    </div>

    <div class="api-buttons" style="margin-top: 10px;">
      <button class="btn btn-create" onclick="chainToNextNode()">Chain to Node 4 →</button>
    </div>

    <div class="input-area">
      <label for="inputData"><strong>Input JSON Data:</strong></label>
      <textarea id="inputData" placeholder="Enter JSON data for Node 3...">{
  "strategy_params": {
    "max_complexity": 10,
    "min_confidence": 0.7,
    "feature_weights": {
      "cyclomatic_complexity": 0.3,
      "line_count": 0.2,
      "duplication_score": 0.5
    }
  },
  "model_output": {
    "max_perplexity": 210.7,
    "routing_decision": "proceed_to_refactoring",
    "confidence": 0.85
  },
  "prediction_config": {
    "model_path": "refactoring_model.pkl",
    "feature_engineering_enabled": true,
    "strategies": ["Extract Method", "Rename Variable", "Simplify Conditional"]
  }
}</textarea>
    </div>

    <div id="responseArea" class="response-area"></div>
  </div>

  <div class="navigation">
    <a href="/code-comprehension/node-2/" class="btn btn-read">← Step 2</a>
    <a href="/code-comprehension/node-4/" class="btn btn-read">Next: Step 4 →</a>
  </div>
</div>

<script src="/assets/js/env-config.js"></script>
<script src="/assets/js/code-comprehension/node-api.js"></script>
<script>
const NODE_ID = 3;

function showResponse(result) {
  const responseArea = document.getElementById('responseArea');
  responseArea.style.display = 'block';
  responseArea.style.background = result.success ? '#2c3e50' : '#c0392b';
  
  const displayData = result.success ? result.data : { error: result.error };
  responseArea.textContent = JSON.stringify(displayData, null, 2);
  
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

async function chainToNextNode() {
  try {
    const nextNodeId = NODE_ID === 5 ? 1 : NODE_ID + 1;
    const result = await window.NodeAPI.chainNodes(NODE_ID, nextNodeId);
    showResponse(result);
  } catch (error) {
    showResponse({ success: false, error: error.message });
  }
}
</script>