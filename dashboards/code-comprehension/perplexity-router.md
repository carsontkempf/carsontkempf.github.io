---
layout: dashboard-project
title: "Perplexity Router Agent"
permalink: /code-comprehension/perplexity-router/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header-section { background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
.info-card { background: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #f39c12; }
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
.flow-step { display: inline-block; background: #f39c12; color: white; padding: 10px 20px; margin: 5px; border-radius: 20px; font-weight: bold; }
.flow-arrow { font-size: 24px; color: #7f8c8d; margin: 0 10px; }
.decision-tree { background: #fff3cd; border: 2px solid #f39c12; border-radius: 8px; padding: 20px; margin: 20px 0; }
.decision-node { background: #f39c12; color: white; padding: 10px 15px; border-radius: 5px; margin: 10px; display: inline-block; }
.decision-branch { color: #d68910; font-weight: bold; margin: 0 10px; }
</style>

<div class="node-container">
  <div class="header-section">
    <h1>Perplexity Router Agent</h1>
    <p><strong>Node 2 of 5-Step Circular Processing System</strong></p>
    <p>Intelligent triage system that routes code based on complexity analysis</p>
  </div>

  <div class="content-grid">
    <div class="info-card">
      <h3>Primary Function</h3>
      <ul>
        <li>Calculates <strong>maximum token-level perplexity</strong></li>
        <li>Compares against <code>CONFUSION_THRESHOLD</code></li>
        <li>Makes intelligent routing decisions</li>
        <li>Acts as system triage mechanism</li>
        <li>Prevents processing of overly complex code</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>Routing Logic</h3>
      <ul>
        <li><strong>Low Perplexity:</strong> → Node 3 (Strategy Prediction)</li>
        <li><strong>High Perplexity:</strong> → Node 5 (Special Analysis)</li>
        <li><strong>Threshold:</strong> Top 5% uncertainty cutoff</li>
        <li><strong>Model:</strong> Qwen2.5-Coder base model</li>
        <li><strong>Method:</strong> Token-level analysis</li>
      </ul>
    </div>
  </div>

  <div class="decision-tree">
    <h3>Decision Tree Logic</h3>
    <div style="text-align: center;">
      <div class="decision-node">Input Code</div>
      <div style="margin: 20px 0;">↓</div>
      <div class="decision-node">Calculate Perplexity</div>
      <div style="margin: 20px 0;">↓</div>
      <div class="decision-node">Compare to Threshold</div>
      <div style="margin: 20px 0;">
        <span class="decision-branch">Low ← </span>
        <span style="color: #7f8c8d;">|</span>
        <span class="decision-branch"> → High</span>
      </div>
      <div style="display: flex; justify-content: space-around;">
        <div class="decision-node" style="background: #27ae60;">Continue to Node 3</div>
        <div class="decision-node" style="background: #e74c3c;">Skip to Node 5</div>
      </div>
    </div>
  </div>

  <div class="flow-diagram">
    <h3>Processing Flow</h3>
    <div class="flow-step">Baseline Data</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Load Model</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Tokenize Code</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Calc Perplexity</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Route Decision</div>
  </div>

  <h3>Input/Output Schema</h3>
  
  <h4>Input Format:</h4>
  <div class="json-example">{
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
}</div>

  <h4>Output Format:</h4>
  <div class="json-example">{
  "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
  "original_code": "...",
  "refactored_code": null,
  "strategy": {},
  "analysis": {
    "baseline_metrics": { "...": "..." },
    "max_perplexity": 210.7,
    "routing_decision": "proceed_to_node_3",
    "confidence": 0.85
  },
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
      <textarea id="inputData" placeholder="Enter JSON data for perplexity routing...">{
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

  <div class="content-grid">
    <a href="/code-comprehension/ingest-baseline/" class="btn btn-nav">← Ingest & Baseline</a>
    <a href="/code-comprehension/strategy-prediction/" class="btn btn-nav">Next: Strategy Prediction →</a>
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
    const response = await fetch(`${API_BASE}/node/2/input`, {
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
    const response = await fetch(`${API_BASE}/node/2/output`);
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

async function updateNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const response = await fetch(`${API_BASE}/node/2/input`, {
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
    const response = await fetch(`${API_BASE}/node/2/output`, {
      method: 'DELETE'
    });
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}
</script>