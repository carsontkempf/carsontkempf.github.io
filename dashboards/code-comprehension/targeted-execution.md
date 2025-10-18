---
layout: dashboard-project
title: "Targeted Execution Agent"
permalink: /code-comprehension/targeted-execution/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header-section { background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
.info-card { background: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #27ae60; }
.api-section { background: #2c3e50; color: white; border-radius: 8px; padding: 25px; margin: 30px 0; }
.api-buttons { display: flex; gap: 10px; flex-wrap: wrap; margin: 15px 0; }
.btn { padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s; text-decoration: none; display: inline-block; text-align: center; }
.btn-create { background: #27ae60; color: white; }
.btn-read { background: #3498db; color: white; }
.btn-update { background: #f39c12; color: white; }
.btn-delete { background: #e74c3c; color: white; }
.btn-nav { background: #9b59b6; color: white; }
.btn:hover { transform: translateY(-2px); opacity: 0.9; }
.response-area { background: #34495e; color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 15px 0; min-height: 120px; white-space: pre-wrap; font-family: 'Monaco', 'Menlo', monospace; display: none; }
.input-area { margin: 20px 0; }
.input-area textarea { width: 100%; height: 200px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; font-family: 'Monaco', 'Menlo', monospace; font-size: 14px; }
.json-example { background: #2c3e50; color: #e8e8e8; padding: 20px; border-radius: 8px; margin: 20px 0; font-family: 'Monaco', 'Menlo', monospace; font-size: 14px; overflow-x: auto; }
.flow-diagram { text-align: center; margin: 30px 0; padding: 20px; background: #ecf0f1; border-radius: 8px; }
.flow-step { display: inline-block; background: #27ae60; color: white; padding: 10px 20px; margin: 5px; border-radius: 20px; font-weight: bold; }
.flow-arrow { font-size: 24px; color: #7f8c8d; margin: 0 10px; }
.execution-examples { background: #eafaf1; border: 2px solid #27ae60; border-radius: 8px; padding: 20px; margin: 20px 0; }
.code-before { background: #fadbd8; padding: 15px; border-radius: 5px; margin: 10px 0; }
.code-after { background: #d5f4e6; padding: 15px; border-radius: 5px; margin: 10px 0; }
.prompt-template { background: #d6eaf8; border-left: 4px solid #27ae60; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
</style>

<div class="node-container">
  <div class="header-section">
    <h1>Targeted Execution Agent</h1>
    <p><strong>Node 4 of 5-Step Circular Processing System</strong></p>
    <p>The "hands" of the operation - executes refactoring with surgical precision</p>
  </div>

  <div class="content-grid">
    <div class="info-card">
      <h3>Primary Function</h3>
      <ul>
        <li>Takes predicted refactoring action from Node 3</li>
        <li>Builds targeted prompt around strategy</li>
        <li>Sends precise instructions to LLM</li>
        <li>Generates <code>refactored_code</code></li>
        <li>Maintains semantic equivalence</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>Execution Parameters</h3>
      <ul>
        <li><strong>LLM Model:</strong> GPT-4, Claude, or local models</li>
        <li><strong>Temperature:</strong> 0.3 (low for consistency)</li>
        <li><strong>Max Tokens:</strong> 2000-4000 range</li>
        <li><strong>Prompt Template:</strong> Strategy-specific templates</li>
        <li><strong>Validation:</strong> Syntax and semantic checks</li>
      </ul>
    </div>
  </div>

  <div class="execution-examples">
    <h3>Refactoring Example: Extract Method</h3>
    
    <h4>Before (Original Code):</h4>
    <div class="code-before">
      <code>def calculate_stats(numbers):
    # Calculate sum of squares for numbers > 5
    sum_sq = 0
    for n in numbers:
        if n > 5:
            sum_sq += n * n
    # Calculate count of numbers > 5
    count = 0
    for n in numbers:
        if n > 5:
            count += 1
    if count == 0:
        return 0
    return sum_sq / count</code>
    </div>
    
    <h4>After (Refactored Code):</h4>
    <div class="code-after">
      <code>def _get_filtered_numbers(numbers):
    return [n for n in numbers if n > 5]

def calculate_stats(numbers):
    filtered_nums = _get_filtered_numbers(numbers)
    if not filtered_nums:
        return 0
    sum_sq = sum(n * n for n in filtered_nums)
    return sum_sq / len(filtered_nums)</code>
    </div>
  </div>

  <div class="prompt-template">
    <h3>Prompt Template Structure</h3>
    <p><strong>Strategy-Specific Prompts:</strong> Each refactoring strategy has a custom prompt template</p>
    <p><strong>Context Injection:</strong> Original code and specific instructions are injected</p>
    <p><strong>Constraint Specification:</strong> Semantic preservation requirements</p>
    <p><strong>Format Requirements:</strong> Output format and validation criteria</p>
  </div>

  <div class="flow-diagram">
    <h3>Processing Flow</h3>
    <div class="flow-step">Strategy Input</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Load Template</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Build Prompt</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Call LLM</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Validate Output</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Node 5</div>
  </div>

  <h3>Input/Output Schema</h3>
  
  <h4>Input Format:</h4>
  <div class="json-example">{
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
}</div>

  <h4>Output Format:</h4>
  <div class="json-example">{
  "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
  "original_code": "def calculate_stats(numbers): ...",
  "refactored_code": "def _get_filtered_numbers(numbers):\n    return [n for n in numbers if n > 5]\n\ndef calculate_stats(numbers):\n    filtered_nums = _get_filtered_numbers(numbers)\n    if not filtered_nums:\n        return 0\n    sum_sq = sum(n * n for n in filtered_nums)\n    return sum_sq / len(filtered_nums)",
  "strategy": {
    "chosen_refactoring": "Extract Method",
    "hypothesis": "...",
    "execution_success": true,
    "applied_strategies": ["Extract Method"],
    "execution_metrics": {
      "time_taken": 2.5,
      "lines_changed": 15,
      "functions_created": 1
    }
  },
  "analysis": { "...": "..." },
  "final_verdict": null
}</div>

  <div class="api-section">
    <h3>API Testing Interface</h3>
    
    <div class="api-buttons">
      <button class="btn btn-create" onclick="createNodeInput()">Create Input (POST)</button>
      <button class="btn btn-read" onclick="readNodeOutput()">Read Output (GET)</button>
      <button class="btn btn-update" onclick="updateNodeInput()">Update Input (PUT)</button>
      <button class="btn btn-delete" onclick="deleteNodeOutput()">Delete Output (DELETE)</button>
    </div>

    <div class="input-area">
      <label for="inputData"><strong>JSON Input Data:</strong></label>
      <textarea id="inputData" placeholder="Enter JSON data for targeted execution...">{
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

  <div class="content-grid">
    <a href="/code-comprehension/strategy-prediction/" class="btn btn-nav">← Strategy Prediction</a>
    <a href="/code-comprehension/results/" class="btn btn-nav">Next: Results →</a>
  </div>
</div>

<script>
const API_BASE = 'http://127.0.0.1:5000/api/v1';

function showResponse(data, isError = false) {
  const responseArea = document.getElementById('responseArea');
  responseArea.style.display = 'block';
  responseArea.style.background = isError ? '#c0392b' : '#34495e';
  responseArea.textContent = JSON.stringify(data, null, 2);
}

async function createNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const response = await fetch(`${API_BASE}/node/4/input`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputData)
    });
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

async function readNodeOutput() {
  try {
    const response = await fetch(`${API_BASE}/node/4/output`);
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

async function updateNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const response = await fetch(`${API_BASE}/node/4/input`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputData)
    });
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

async function deleteNodeOutput() {
  try {
    const response = await fetch(`${API_BASE}/node/4/output`, {
      method: 'DELETE'
    });
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}
</script>