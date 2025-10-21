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
  <h1>Step 4: Targeted Execution Agent</h1>
  
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
    <h3>API Testing Interface</h3>
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

  <!-- Refactoring Simulation Tool -->
  <div class="api-section" style="border-left-color: #3498db;">
    <h3>Refactoring Simulation Tool</h3>
    <p>Run interactive refactoring simulations to test and execute code transformations.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="/code-comprehension/simulation/" style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 12px rgba(52,152,219,0.3); transition: all 0.3s ease;">
        Run Refactoring Simulation →
      </a>
    </div>
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

  <div class="navigation">
    <a href="/code-comprehension/node-3/" class="btn btn-read">← Step 3</a>
    <a href="/code-comprehension/node-5/" class="btn btn-read">Next: Step 5 →</a>
  </div>
</div>

<link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
<link rel="stylesheet" href="/assets/css/memory-editor.css">
<script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
<script src="/assets/js/memory-editor.js"></script>
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

// Initialize Memory Editors
document.addEventListener('DOMContentLoaded', function() {
  const memoryEditors = window.initializeMemoryEditors({
    nodeId: NODE_ID,
    agentType: 'Targeted Execution Agent',
    defaultLongTermContent: `# Targeted Execution Agent - Node ${NODE_ID}

## Agent Purpose
Targeted Execution Agent - Executes selected refactoring strategies

## Key Responsibilities
- Code transformation
- Execution monitoring
- Quality validation
- Rollback handling

## Execution Process
- Takes predicted refactoring action from Strategy Prediction Agent
- Builds targeted prompt around the action
- Sends to target LLM for refactored_code generation
- Surgical precision in refactoring execution

## Learning Notes
- Acts as the "hands" of the operation
- Executes precise instructions from prediction agent
- Maintains code quality during transformation
- Provides rollback capabilities for failed executions`
  });
  
  // Store editors globally for potential API interactions
  window.memoryEditors = memoryEditors;
});
</script>