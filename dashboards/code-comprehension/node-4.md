---
layout: dashboard-project
title: "Step 4: Targeted Execution Agent"
permalink: /code-comprehension/node-4/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container { max-width: 1000px; margin: 0 auto; padding: 20px; }
.api-section { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #27ae60; }
.api-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0; }
.btn { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.3s; }
.btn-create { background: #27ae60; color: white; }
.btn-read { background: #3498db; color: white; }
.btn-update { background: #f39c12; color: white; }
.btn-delete { background: #e74c3c; color: white; }
.btn:hover { transform: translateY(-2px); opacity: 0.9; }
.response-area { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; min-height: 100px; white-space: pre-wrap; font-family: 'Monaco', 'Menlo', monospace; display: none; }
.input-area { margin: 15px 0; }
.input-area textarea { width: 100%; height: 150px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-family: 'Monaco', 'Menlo', monospace; }
.status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
.status-success { background: #27ae60; }
.status-error { background: #e74c3c; }
.status-pending { background: #f39c12; }
</style>

<div class="node-container">
  <h1>⚡ Step 4: Targeted Execution Agent</h1>
  
  <div class="description">
    <p>This agent is the "hands" of the operation, executing the precise instruction provided by the prediction agent.</p>
    
    <h3>Function:</h3>
    <ul>
      <li>Takes the predicted refactoring action (e.g., <code>'Extract Method'</code>)</li>
      <li>Builds a targeted prompt around it</li>
      <li>Sends it to the target LLM to generate the <code>refactored_code</code></li>
    </ul>

    <h3>Purpose:</h3>
    <p>To carry out the refactoring strategy with surgical precision.</p>
  </div>

  <div class="api-section">
    <h3>🔌 API Testing Interface</h3>
    <p><span class="status-indicator status-pending"></span>Node 4 API Endpoints</p>
    
    <div class="api-buttons">
      <button class="btn btn-create" onclick="createNodeInput()">Create Input (POST)</button>
      <button class="btn btn-read" onclick="readNodeOutput()">Read Output (GET)</button>
      <button class="btn btn-update" onclick="updateNodeInput()">Update Input (PUT)</button>
      <button class="btn btn-delete" onclick="deleteNodeOutput()">Delete Output (DELETE)</button>
    </div>

    <div class="api-buttons" style="margin-top: 10px;">
      <button class="btn btn-create" onclick="chainToNextNode()">Chain to Node 5 →</button>
    </div>

    <div class="input-area">
      <label for="inputData"><strong>Input JSON Data:</strong></label>
      <textarea id="inputData" placeholder="Enter JSON data for Node 4...">{
  "execution_strategy": {
    "chosen_refactoring": "Extract Method",
    "hypothesis": "Model predicts 'Extract Method' is the optimal action based on features like high complexity and code duplication.",
    "confidence": 0.92
  },
  "target_code": "def calculate_stats(numbers):\n    # Calculate sum of squares for numbers > 5\n    sum_sq = 0\n    for n in numbers:\n        if n > 5:\n            sum_sq += n * n\n    # Calculate count of numbers > 5\n    count = 0\n    for n in numbers:\n        if n > 5:\n            count += 1\n    if count == 0:\n        return 0\n    return sum_sq / count",
  "execution_params": {
    "llm_model": "gpt-4",
    "temperature": 0.3,
    "max_tokens": 2000,
    "prompt_template": "refactor_extract_method.txt"
  }
}</textarea>
    </div>

    <div id="responseArea" class="response-area"></div>
  </div>

  <div class="navigation">
    <a href="/code-comprehension/node-3/" class="btn btn-read">← Step 3</a>
    <a href="/code-comprehension/node-5/" class="btn btn-read">Next: Step 5 →</a>
  </div>
</div>

<script src="/assets/js/env-config.js"></script>
<script src="/assets/js/code-comprehension/node-api.js"></script>
<script>
const NODE_ID = 4;

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