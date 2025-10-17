---
layout: dashboard-project
title: "Strategy Prediction Agent"
permalink: /code-comprehension/strategy-prediction/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header-section { background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
.info-card { background: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #3498db; }
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
.flow-step { display: inline-block; background: #3498db; color: white; padding: 10px 20px; margin: 5px; border-radius: 20px; font-weight: bold; }
.flow-arrow { font-size: 24px; color: #7f8c8d; margin: 0 10px; }
.strategy-list { background: #e8f4fd; border: 2px solid #3498db; border-radius: 8px; padding: 20px; margin: 20px 0; }
.strategy-item { background: #3498db; color: white; padding: 8px 12px; border-radius: 15px; margin: 5px; display: inline-block; font-size: 14px; }
.ml-model { background: #d5e8f8; border-left: 4px solid #3498db; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
</style>

<div class="node-container">
  <div class="header-section">
    <h1>🎯 Strategy Prediction Agent</h1>
    <p><strong>Node 3 of 5-Step Circular Processing System</strong></p>
    <p>Decision tree brain that predicts optimal refactoring strategies</p>
  </div>

  <div class="content-grid">
    <div class="info-card">
      <h3>🎯 Primary Function</h3>
      <ul>
        <li><strong>Feature Engineering:</strong> Calculates code metrics</li>
        <li><strong>Model Prediction:</strong> Uses Random Forest model</li>
        <li>Predicts single optimal refactoring action</li>
        <li>Replaces guessing with data-driven decisions</li>
        <li>Only processes low-perplexity code</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>📊 Key Features</h3>
      <ul>
        <li><strong>Cyclomatic Complexity:</strong> Control flow analysis</li>
        <li><strong>Line Count:</strong> Code length metrics</li>
        <li><strong>Duplication Score:</strong> Repetition detection</li>
        <li><strong>Function Count:</strong> Modularity analysis</li>
        <li><strong>Variable Usage:</strong> Naming patterns</li>
      </ul>
    </div>
  </div>

  <div class="strategy-list">
    <h3>🧠 Available Refactoring Strategies</h3>
    <div style="text-align: center;">
      <div class="strategy-item">Extract Method</div>
      <div class="strategy-item">Rename Variable</div>
      <div class="strategy-item">Simplify Conditional</div>
      <div class="strategy-item">Reduce Duplication</div>
      <div class="strategy-item">Extract Class</div>
      <div class="strategy-item">Inline Method</div>
      <div class="strategy-item">Move Method</div>
      <div class="strategy-item">Replace Magic Number</div>
    </div>
  </div>

  <div class="ml-model">
    <h3>🤖 Machine Learning Model</h3>
    <p><strong>Model Type:</strong> Random Forest Classifier</p>
    <p><strong>Training Data:</strong> Historical refactoring outcomes</p>
    <p><strong>Features:</strong> 15+ code complexity metrics</p>
    <p><strong>Accuracy:</strong> 85%+ on validation set</p>
    <p><strong>Model File:</strong> <code>refactoring_model.pkl</code></p>
  </div>

  <div class="flow-diagram">
    <h3>🔄 Processing Flow</h3>
    <div class="flow-step">Routed Code</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Feature Engineering</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Load ML Model</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Predict Strategy</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Node 4</div>
  </div>

  <h3>📝 Input/Output Schema</h3>
  
  <h4>Input Format:</h4>
  <div class="json-example">{
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
}</div>

  <h4>Output Format:</h4>
  <div class="json-example">{
  "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
  "original_code": "...",
  "refactored_code": null,
  "strategy": {
    "chosen_refactoring": "Extract Method",
    "hypothesis": "Model predicts 'Extract Method' is the optimal action based on features like high complexity and code duplication.",
    "confidence": 0.92,
    "alternative_strategies": ["Rename Variable", "Simplify Conditional"],
    "feature_importance": {
      "cyclomatic_complexity": 0.35,
      "duplication_score": 0.28,
      "line_count": 0.21,
      "function_count": 0.16
    }
  },
  "analysis": {
    "baseline_metrics": { "...": "..." },
    "max_perplexity": 210.7
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
      <textarea id="inputData" placeholder="Enter JSON data for strategy prediction...">{
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

  <div class="content-grid">
    <a href="/code-comprehension/perplexity-router/" class="btn btn-nav">← Perplexity Router</a>
    <a href="/code-comprehension/targeted-execution/" class="btn btn-nav">Next: Targeted Execution →</a>
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
    const response = await fetch(`${API_BASE}/node/3/input`, {
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
    const response = await fetch(`${API_BASE}/node/3/output`);
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

async function updateNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const response = await fetch(`${API_BASE}/node/3/input`, {
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
    const response = await fetch(`${API_BASE}/node/3/output`, {
      method: 'DELETE'
    });
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}
</script>