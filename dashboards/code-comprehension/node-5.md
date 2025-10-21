---
layout: dashboard-project
title: "Step 5: Measure & Learn Agent"
permalink: /code-comprehension/node-5/
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
  <h1>Step 5: Measure & Learn Agent</h1>
  
  <div class="description">
    <p>This final, consolidated agent handles all post-mortem analysis and ensures the system improves over time.</p>
    
    <h3>Function:</h3>
    <ol>
      <li><strong>Comprehensive Measurement:</strong> It runs the standard measurement suite on the final code</li>
      <li><strong>Custom Statistics Module:</strong> It executes <strong>every script</strong> within your custom statistics folder (e.g., <code>/custom_stats/</code>) to gather advanced metrics like AST comparisons</li>
      <li><strong>Verdict:</strong> It analyzes all the data to assign a <code>final_verdict</code> (e.g., <code>IMPROVEMENT</code>, <code>REGRESSION</code>, or <code>FLAGGED_AS_CONFUSING</code>)</li>
      <li><strong>Learning:</strong> It logs the complete experiment state and, if the code was refactored, adds the features and outcome as a new row of data for retraining the Decision Tree model</li>
    </ol>
  </div>

  <div class="api-section">
    <h3>API Testing Interface</h3>
    <p><span class="status-indicator status-pending"></span>Node 5 API Endpoints</p>
    
    <div class="api-buttons">
      <button class="btn btn-create" onclick="createNodeInput()">Create Input (POST)</button>
      <button class="btn btn-read" onclick="readNodeOutput()">Read Output (GET)</button>
      <button class="btn btn-update" onclick="updateNodeInput()">Update Input (PUT)</button>
      <button class="btn btn-delete" onclick="deleteNodeOutput()">Delete Output (DELETE)</button>
    </div>

    <div class="api-buttons" style="margin-top: 10px;">
      <button class="btn btn-create" onclick="chainToNextNode()">Chain to Node 1 →</button>
    </div>

    <div class="input-area">
      <label for="inputData"><strong>Input JSON Data:</strong></label>
      <textarea id="inputData" placeholder="Enter JSON data for Node 5...">{
  "execution_results": {
    "refactored_code": "def _get_filtered_numbers(numbers):\n    return [n for n in numbers if n > 5]\n\ndef calculate_stats(numbers):\n    filtered_nums = _get_filtered_numbers(numbers)\n    if not filtered_nums:\n        return 0\n    sum_sq = sum(n * n for n in filtered_nums)\n    return sum_sq / len(filtered_nums)",
    "execution_success": true,
    "applied_strategies": ["Extract Method"],
    "time_taken": 2.5
  },
  "measurement_config": {
    "run_ast_analysis": true,
    "run_custom_stats": true,
    "comparison_metrics": ["static_errors", "complexity", "test_coverage"]
  },
  "learning_params": {
    "update_model": true,
    "save_experiment": true,
    "verdict_threshold": 0.7
  }
}</textarea>
    </div>

    <div id="responseArea" class="response-area"></div>
  </div>

  <!-- Analysis & Annotation Tools -->
  <div class="api-section" style="border-left-color: #e74c3c;">
    <h3>Error Annotator Tool</h3>
    <p>Annotate and categorize errors found during the analysis process for continuous learning.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="/code-comprehension/error-annotator/" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 12px rgba(231,76,60,0.3); transition: all 0.3s ease;">
        Open Error Annotator →
      </a>
    </div>
  </div>

  <div class="api-section" style="border-left-color: #16a085;">
    <h3>Tree Visualizer Tool</h3>
    <p>Visualize the refactoring tree and analysis results to understand system learning patterns.</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="/code-comprehension/tree-visualizer/" style="display: inline-block; background: linear-gradient(135deg, #16a085 0%, #1abc9c 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; box-shadow: 0 4px 12px rgba(22,160,133,0.3); transition: all 0.3s ease;">
        Open Tree Visualizer →
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
    <a href="/code-comprehension/node-4/" class="btn btn-read">← Step 4</a>
    <a href="/code-comprehension/node-1/" class="btn btn-read">Complete Cycle: Step 1 →</a>
  </div>
</div>

<link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
<link rel="stylesheet" href="/assets/css/memory-editor.css">
<script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
<script src="/assets/js/memory-editor.js"></script>
<script src="/assets/js/env-config.js"></script>
<script src="/assets/js/code-comprehension/node-api.js"></script>
<script>
const NODE_ID = 5;

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
    agentType: 'Measure & Learn Agent',
    defaultLongTermContent: `# Measure & Learn Agent - Node ${NODE_ID}

## Agent Purpose
Measure & Learn Agent - Analyzes results and updates knowledge base

## Key Responsibilities
- Performance measurement
- Result analysis
- Knowledge extraction
- Feedback integration

## Analysis Process
- Comprehensive measurement of final code
- Custom statistics module execution
- Verdict assignment (IMPROVEMENT, REGRESSION, FLAGGED_AS_CONFUSING)
- Experiment logging and model retraining

## Learning Notes
- Handles all post-mortem analysis
- Ensures system improves over time
- Runs complete measurement suite
- Executes custom statistics scripts for advanced metrics
- Adds features and outcomes to training data`
  });
  
  // Store editors globally for potential API interactions
  window.memoryEditors = memoryEditors;
});
</script>