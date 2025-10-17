---
layout: dashboard-project
title: "Ingest & Baseline Agent"
permalink: /code-comprehension/ingest-baseline/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 30px;
  text-align: center;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 30px 0;
}

.info-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  border-left: 4px solid #e74c3c;
}

.api-section {
  background: #2c3e50;
  color: white;
  border-radius: 8px;
  padding: 25px;
  margin: 30px 0;
}

.api-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 15px 0;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-create { background: #27ae60; color: white; }
.btn-read { background: #3498db; color: white; }
.btn-update { background: #f39c12; color: white; }
.btn-delete { background: #e74c3c; color: white; }
.btn-nav { background: #9b59b6; color: white; }

.btn:hover { transform: translateY(-2px); opacity: 0.9; }

.response-area {
  background: #34495e;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
  min-height: 120px;
  white-space: pre-wrap;
  font-family: 'Monaco', 'Menlo', monospace;
  display: none;
}

.input-area {
  margin: 20px 0;
}

.input-area textarea {
  width: 100%;
  height: 200px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
}

.json-example {
  background: #2c3e50;
  color: #e8e8e8;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  overflow-x: auto;
}

.flow-diagram {
  text-align: center;
  margin: 30px 0;
  padding: 20px;
  background: #ecf0f1;
  border-radius: 8px;
}

.flow-step {
  display: inline-block;
  background: #e74c3c;
  color: white;
  padding: 10px 20px;
  margin: 5px;
  border-radius: 20px;
  font-weight: bold;
}

.flow-arrow {
  font-size: 24px;
  color: #7f8c8d;
  margin: 0 10px;
}
</style>

<div class="node-container">
  <div class="header-section">
    <h1>📥 Ingest & Baseline Agent</h1>
    <p><strong>Node 1 of 5-Step Circular Processing System</strong></p>
    <p>The objective entry point that establishes clean baseline measurements</p>
  </div>

  <div class="content-grid">
    <div class="info-card">
      <h3>🎯 Primary Function</h3>
      <ul>
        <li>Selects a code snippet for analysis</li>
        <li>Runs full suite of baseline measurements</li>
        <li>Performs linting and type checks</li>
        <li>Executes unit tests</li>
        <li>Generates unique experiment ID</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>📊 Output Metrics</h3>
      <ul>
        <li><strong>Static Error Count:</strong> Linting violations</li>
        <li><strong>Type Error Count:</strong> Type system violations</li>
        <li><strong>Unit Tests Pass:</strong> Boolean test result</li>
        <li><strong>Code Complexity:</strong> Cyclomatic complexity score</li>
        <li><strong>Experiment ID:</strong> UUID for tracking</li>
      </ul>
    </div>
  </div>

  <div class="flow-diagram">
    <h3>🔄 Processing Flow</h3>
    <div class="flow-step">Code Input</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">UUID Generation</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Baseline Testing</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Metrics Collection</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Node 2</div>
  </div>

  <h3>📝 Input/Output Schema</h3>
  
  <h4>Input Format:</h4>
  <div class="json-example">{
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
}</div>

  <h4>Output Format:</h4>
  <div class="json-example">{
  "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
  "original_code": "...",
  "refactored_code": null,
  "strategy": {},
  "analysis": {
    "baseline_metrics": {
      "static_error_count": 3,
      "type_error_count": 0,
      "unit_tests_pass": true
    }
  },
  "final_verdict": null
}</div>

  <div class="api-section">
    <h3>🔌 API Testing Interface</h3>
    
    <div class="api-buttons">
      <button class="btn btn-create" onclick="createNodeInput()">Create Input (POST)</button>
      <button class="btn btn-read" onclick="readNodeOutput()">Read Output (GET)</button>
      <button class="btn btn-update" onclick="updateNodeInput()">Update Input (PUT)</button>
      <button class="btn btn-delete" onclick="deleteNodeOutput()">Delete Output (DELETE)</button>
    </div>

    <div class="input-area">
      <label for="inputData"><strong>JSON Input Data:</strong></label>
      <textarea id="inputData" placeholder="Enter JSON data for baseline ingestion...">{
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

  <div class="content-grid">
    <a href="/code-comprehension/" class="btn btn-nav">← Back to Overview</a>
    <a href="/code-comprehension/perplexity-router/" class="btn btn-nav">Next: Perplexity Router →</a>
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
    const response = await fetch(`${API_BASE}/node/1/input`, {
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
    const response = await fetch(`${API_BASE}/node/1/output`);
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

async function updateNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const response = await fetch(`${API_BASE}/node/1/input`, {
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
    const response = await fetch(`${API_BASE}/node/1/output`, {
      method: 'DELETE'
    });
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}
</script>