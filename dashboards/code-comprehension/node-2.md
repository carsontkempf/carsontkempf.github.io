---
layout: dashboard-project
title: "Step 2: Perplexity Router Agent"
permalink: /code-comprehension/node-2/
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
  <h1>Step 2: Perplexity Router Agent</h1>
  
  <div class="description">
    <p>This agent acts as an intelligent triage system, deciding if a piece of code is a candidate for automated refactoring or if it's too confusing and should be handled separately.</p>
    
    <h3>Function:</h3>
    <ul>
      <li>Calculates the <strong>maximum token-level perplexity</strong> of the original_code</li>
      <li>Compares it to a pre-defined <code>CONFUSION_THRESHOLD</code></li>
    </ul>

    <h3>Routing Logic:</h3>
    <ul>
      <li>If perplexity is <strong>low</strong>, the workflow proceeds to Step 3 for strategic refactoring</li>
      <li>If perplexity is <strong>high</strong> (in the top 5% of uncertainty), it branches directly to Step 5, skipping the refactoring and flagging the code for special analysis</li>
    </ul>
  </div>

  <div class="api-section">
    <h3>API Testing Interface</h3>
    <p><span class="status-indicator status-pending"></span>Node 2 API Endpoints</p>
    
    <div class="api-buttons">
      <button class="btn btn-create" onclick="createNodeInput()">Create Input (POST)</button>
      <button class="btn btn-read" onclick="readNodeOutput()">Read Output (GET)</button>
      <button class="btn btn-update" onclick="updateNodeInput()">Update Input (PUT)</button>
      <button class="btn btn-delete" onclick="deleteNodeOutput()">Delete Output (DELETE)</button>
    </div>

    <div class="api-buttons" style="margin-top: 10px;">
      <button class="btn btn-create" onclick="chainToNextNode()">Chain to Node 3 →</button>
    </div>

    <div class="input-area">
      <label for="inputData"><strong>Input JSON Data:</strong></label>
      <textarea id="inputData" placeholder="Enter JSON data for Node 2...">{
  "routing_config": {
    "confusion_threshold": 210.0,
    "model_name": "Qwen2.5-Coder",
    "perplexity_method": "token_level"
  },
  "baseline_results": {
    "static_error_count": 3,
    "type_error_count": 0,
    "unit_tests_pass": true,
    "code_complexity": 8.5
  },
  "model_selection": "default_perplexity"
}</textarea>
    </div>

    <div id="responseArea" class="response-area"></div>
  </div>

  <!-- AI Error Diagnosis Tool -->
  <div class="api-section" style="border-left-color: #f39c12;">
    <h3>AI Error Diagnosis Tool</h3>
    <p>Use AI to diagnose and analyze code errors as part of the perplexity routing process.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="/code-comprehension/error-diagnosis/" style="display: inline-block; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 12px rgba(243,156,18,0.3); transition: all 0.3s ease;">
        Open AI Error Diagnosis →
      </a>
    </div>
  </div>

  <div class="navigation">
    <a href="/code-comprehension/node-1/" class="btn btn-read">← Step 1</a>
    <a href="/code-comprehension/node-3/" class="btn btn-read">Next: Step 3 →</a>
  </div>
</div>

<script src="/assets/js/env-config.js"></script>
<script src="/assets/js/code-comprehension/node-api.js"></script>
<script>
const NODE_ID = 2;

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