---
layout: dashboard-project
title: "Results & Prompt Tree"
permalink: /code-comprehension/results/
dashboard_id: code-comprehension
auth_required: true
back_url: /code-comprehension/
back_text: Code Comprehension
---

<style>
.node-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
.header-section { background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
.info-card { background: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #9b59b6; }
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
.tree-visualizer { background: #f8f4ff; border: 2px solid #9b59b6; border-radius: 10px; padding: 30px; margin: 30px 0; }
.tree-node { background: #9b59b6; color: white; padding: 12px 20px; border-radius: 8px; margin: 10px; display: inline-block; cursor: pointer; transition: all 0.3s; position: relative; }
.tree-node:hover { background: #8e44ad; transform: scale(1.05); }
.tree-level { margin: 20px 0; text-align: center; }
.tree-connector { color: #9b59b6; font-size: 24px; margin: 0 15px; }
.verdict-badge { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; margin-left: 10px; }
.verdict-improvement { background: #27ae60; color: white; }
.verdict-regression { background: #e74c3c; color: white; }
.verdict-neutral { background: #95a5a6; color: white; }
.metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
.metric-card { background: white; border: 2px solid #9b59b6; border-radius: 8px; padding: 20px; text-align: center; }
.metric-value { font-size: 32px; font-weight: bold; color: #9b59b6; }
.metric-label { font-size: 14px; color: #7f8c8d; margin-top: 5px; }
.learning-insights { background: #e8f5e8; border-left: 4px solid #27ae60; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
.flow-diagram { text-align: center; margin: 30px 0; padding: 20px; background: #ecf0f1; border-radius: 8px; }
.flow-step { display: inline-block; background: #9b59b6; color: white; padding: 10px 20px; margin: 5px; border-radius: 20px; font-weight: bold; }
.flow-arrow { font-size: 24px; color: #7f8c8d; margin: 0 10px; }
</style>

<div class="node-container">
  <div class="header-section">
    <h1>📈 Results & Prompt Tree</h1>
    <p><strong>Node 5 of 5-Step Circular Processing System</strong></p>
    <p>Comprehensive analysis, learning insights, and prompt tree visualization</p>
  </div>

  <div class="content-grid">
    <div class="info-card">
      <h3>🎯 Measure & Learn Functions</h3>
      <ul>
        <li><strong>Comprehensive Measurement:</strong> Standard test suite</li>
        <li><strong>Custom Statistics:</strong> AST analysis and advanced metrics</li>
        <li><strong>Verdict Assignment:</strong> IMPROVEMENT, REGRESSION, or FLAGGED</li>
        <li><strong>Learning Loop:</strong> Data for model retraining</li>
        <li><strong>Cycle Completion:</strong> Feeds back to Node 1</li>
      </ul>
    </div>

    <div class="info-card">
      <h3>📊 Analysis Metrics</h3>
      <ul>
        <li><strong>Static Error Delta:</strong> Change in linting errors</li>
        <li><strong>AST Node Change:</strong> Structural complexity change</li>
        <li><strong>Test Pass Rate:</strong> Unit test success rate</li>
        <li><strong>Comment Density:</strong> Documentation improvement</li>
        <li><strong>Execution Time:</strong> Performance impact</li>
      </ul>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-value" id="errorDelta">-3</div>
      <div class="metric-label">Static Error Delta</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="astChange">-8</div>
      <div class="metric-label">AST Node Change</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="testRate">95%</div>
      <div class="metric-label">Test Pass Rate</div>
    </div>
    <div class="metric-card">
      <div class="metric-value" id="quality">+60%</div>
      <div class="metric-label">Quality Improvement</div>
    </div>
  </div>

  <div class="tree-visualizer">
    <h3>🌳 Interactive Prompt Tree</h3>
    <p>Click on any node to view detailed prompt information and results</p>
    
    <div class="tree-level">
      <div class="tree-node" onclick="showNodeDetails('root')">
        Root Experiment
        <span class="verdict-badge verdict-improvement">IMPROVEMENT</span>
      </div>
    </div>
    
    <div class="tree-level">
      <span class="tree-connector">└─</span>
      <div class="tree-node" onclick="showNodeDetails('baseline')">
        Baseline Analysis
        <span class="verdict-badge verdict-neutral">BASELINE</span>
      </div>
      <span class="tree-connector">─┬─</span>
      <div class="tree-node" onclick="showNodeDetails('router')">
        Perplexity Router
        <span class="verdict-badge verdict-improvement">LOW</span>
      </div>
    </div>
    
    <div class="tree-level">
      <span class="tree-connector">└─</span>
      <div class="tree-node" onclick="showNodeDetails('strategy')">
        Strategy: Extract Method
        <span class="verdict-badge verdict-improvement">92% CONF</span>
      </div>
      <span class="tree-connector">─┬─</span>
      <div class="tree-node" onclick="showNodeDetails('execution')">
        Execution Success
        <span class="verdict-badge verdict-improvement">SUCCESS</span>
      </div>
    </div>
    
    <div class="tree-level">
      <span class="tree-connector">└─</span>
      <div class="tree-node" onclick="showNodeDetails('final')">
        Final Result
        <span class="verdict-badge verdict-improvement">IMPROVEMENT</span>
      </div>
    </div>
  </div>

  <div class="learning-insights">
    <h3>🧠 Learning Insights</h3>
    <ul>
      <li><strong>Variable renaming highly effective</strong> - 95% success rate in reducing complexity</li>
      <li><strong>Function extraction improved modularity</strong> - Average 40% reduction in cyclomatic complexity</li>
      <li><strong>Code simplification reduced errors</strong> - 60% fewer static analysis warnings</li>
      <li><strong>Perplexity routing prevents bad outcomes</strong> - 0% regression rate on routed code</li>
    </ul>
  </div>

  <div class="flow-diagram">
    <h3>🔄 Learning Cycle</h3>
    <div class="flow-step">Execution Results</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Run Measurements</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Assign Verdict</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Update Model</div>
    <span class="flow-arrow">→</span>
    <div class="flow-step">Back to Node 1</div>
  </div>

  <h3>📝 Input/Output Schema</h3>
  
  <h4>Input Format:</h4>
  <div class="json-example">{
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
}</div>

  <h4>Final Output Format:</h4>
  <div class="json-example">{
  "code_id": "exp-8f4d5a1b-c3d5-4e6f-8a9b-2d7f0c1e3a5b",
  "original_code": "def calculate_stats(numbers): ...",
  "refactored_code": "def _get_filtered_numbers(numbers): ...",
  "strategy": {
    "chosen_refactoring": "Extract Method",
    "hypothesis": "Model predicts 'Extract Method' is optimal...",
    "confidence": 0.92
  },
  "analysis": {
    "baseline_metrics": {
      "static_error_count": 3,
      "type_error_count": 0,
      "unit_tests_pass": true
    },
    "max_perplexity": 210.7,
    "refactored_metrics": {
      "static_error_count": 0,
      "type_error_count": 0,
      "unit_tests_pass": true
    },
    "deltas": {
      "static_error_delta": -3,
      "complexity_delta": -2.5
    },
    "custom_metrics": {
      "ast_node_change": -8,
      "comment_density_change": 0.0
    }
  },
  "final_verdict": "IMPROVEMENT"
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
      <textarea id="inputData" placeholder="Enter JSON data for results analysis...">{
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
    <div id="nodeDetails" class="response-area" style="background: #8e44ad;"></div>
  </div>

  <div class="content-grid">
    <a href="/code-comprehension/targeted-execution/" class="btn btn-nav">← Targeted Execution</a>
    <a href="/code-comprehension/ingest-baseline/" class="btn btn-nav">Complete Cycle: Ingest & Baseline →</a>
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

function showNodeDetails(nodeType) {
  const detailsArea = document.getElementById('nodeDetails');
  detailsArea.style.display = 'block';
  
  const nodeInfo = {
    'root': {
      title: 'Root Experiment Node',
      description: 'Main experiment tracking the complete 5-step cycle',
      metrics: { confidence: 0.92, verdict: 'IMPROVEMENT', error_reduction: -3 }
    },
    'baseline': {
      title: 'Baseline Analysis Node', 
      description: 'Initial code analysis and metric collection',
      metrics: { static_errors: 3, type_errors: 0, tests_pass: true }
    },
    'router': {
      title: 'Perplexity Router Node',
      description: 'Code complexity analysis and routing decision',
      metrics: { perplexity: 210.7, threshold: 220.0, decision: 'proceed' }
    },
    'strategy': {
      title: 'Strategy Prediction Node',
      description: 'ML-based refactoring strategy selection',
      metrics: { strategy: 'Extract Method', confidence: 0.92, alternatives: 2 }
    },
    'execution': {
      title: 'Execution Node',
      description: 'Targeted refactoring execution results',
      metrics: { success: true, time_taken: 2.5, functions_created: 1 }
    },
    'final': {
      title: 'Final Results Node',
      description: 'Complete analysis and learning outcomes',
      metrics: { verdict: 'IMPROVEMENT', quality_gain: 0.6, model_updated: true }
    }
  };
  
  const info = nodeInfo[nodeType];
  detailsArea.textContent = `${info.title}\n\n${info.description}\n\nMetrics:\n${JSON.stringify(info.metrics, null, 2)}`;
}

async function createNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const response = await fetch(`${API_BASE}/node/5/input`, {
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
    const response = await fetch(`${API_BASE}/node/5/output`);
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

async function updateNodeInput() {
  try {
    const inputData = JSON.parse(document.getElementById('inputData').value);
    const response = await fetch(`${API_BASE}/node/5/input`, {
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
    const response = await fetch(`${API_BASE}/node/5/output`, {
      method: 'DELETE'
    });
    const data = await response.json();
    showResponse(data, !response.ok);
  } catch (error) {
    showResponse({ error: error.message }, true);
  }
}

// Animate metrics on page load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    document.getElementById('errorDelta').textContent = '-3';
    document.getElementById('astChange').textContent = '-8';
    document.getElementById('testRate').textContent = '95%';
    document.getElementById('quality').textContent = '+60%';
  }, 500);
});
</script>