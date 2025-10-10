---
layout: page
title: Flask API Endpoints
permalink: /code-comprehension/api-endpoints/
description: Interactive documentation for all Flask backend API endpoints
---

<style>
.api-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

.api-section {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 12px;
    padding: 25px;
    margin: 20px 0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border: 1px solid #e9ecef;
}

.endpoint-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin: 15px 0;
    border-left: 4px solid #007bff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.method-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    margin-right: 10px;
}

.method-post { background: #28a745; color: white; }
.method-get { background: #007bff; color: white; }
.method-put { background: #ffc107; color: black; }
.method-delete { background: #dc3545; color: white; }

.endpoint-url {
    font-family: 'Monaco', 'Menlo', monospace;
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 4px;
    margin: 10px 0;
    border: 1px solid #dee2e6;
}

.test-button {
    background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    margin: 10px 5px 10px 0;
}

.test-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.copy-button {
    background: #6c757d;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    margin-left: 10px;
}

.copy-button:hover {
    background: #5a6268;
}

.response-area {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 15px;
    margin: 15px 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    white-space: pre-wrap;
    min-height: 100px;
    display: none;
}

.server-config {
    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    color: white;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
}

.config-input {
    width: 100%;
    padding: 8px 12px;
    margin: 5px 0;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
}
</style>

<div class="api-container">
    <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">🔌 Flask API Endpoints</h1>
    
    <div class="server-config">
        <h3 style="margin-top: 0;">⚙️ Server Configuration</h3>
        <label for="server-url" style="display: block; margin-bottom: 5px; font-weight: 600;">Flask Server URL:</label>
        <input type="text" id="server-url" class="config-input" value="https://your-remote-backend-server.com" placeholder="https://your-remote-backend-server.com">
        <button onclick="testConnection()" class="test-button" style="margin-top: 10px;">Test Connection</button>
        <div id="connection-status" style="margin-top: 10px; font-weight: 600;"></div>
    </div>

    <!-- Prompt Processing APIs -->
    <div class="api-section">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📝 Prompt Processing</h2>
        
        <div class="endpoint-card">
            <h3>Submit JSON for Prompt Generation</h3>
            <span class="method-badge method-post">POST</span>
            <div class="endpoint-url">/api/prompts/generate</div>
            <p><strong>Description:</strong> Submit a JSON file to generate a new prompt and refactored code</p>
            <p><strong>Request Body:</strong> JSON object with code analysis data</p>
            <p><strong>Response:</strong> Prompt ID, test results, and execution status</p>
            
            <textarea id="prompt-json" class="config-input" rows="8">{"code": "def calculate_factorial(n):\n    if n <= 1:\n        return 1\n    else:\n        return n * calculate_factorial(n-1)", "analysis_type": "refactor", "complexity_level": "medium", "focus_areas": ["readability", "performance", "error_handling"]}</textarea>
            <button onclick="generatePrompt()" class="test-button">Generate Prompt</button>
            <div id="prompt-response" class="response-area"></div>
        </div>

        <div class="endpoint-card">
            <h3>Get Prompt by ID</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/prompts/{prompt_id}</div>
            <p><strong>Description:</strong> Retrieve a specific prompt by its unique identifier</p>
            <p><strong>Response:</strong> Full prompt content and metadata</p>
            
            <input type="text" id="prompt-id" class="config-input" value="2024-01-15_14-30-45" placeholder="Enter prompt ID (e.g., 2024-01-15_14-30-45)">
            <button onclick="getPrompt()" class="test-button">Get Prompt</button>
            <div id="get-prompt-response" class="response-area"></div>
        </div>

        <div class="endpoint-card">
            <h3>List All Prompts</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/prompts/list</div>
            <p><strong>Description:</strong> Get list of all prompts with their error counts</p>
            <p><strong>Response:</strong> JSON array with prompt metadata and error statistics</p>
            
            <button onclick="listPrompts()" class="test-button">List Prompts</button>
            <div id="list-prompts-response" class="response-area"></div>
        </div>
    </div>

    <!-- Data Analysis APIs -->
    <div class="api-section">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #28a745; padding-bottom: 10px;">📊 Data Analysis</h2>
        
        <div class="endpoint-card">
            <h3>Get Error Statistics</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/analysis/errors</div>
            <p><strong>Description:</strong> Get current error statistics and trends</p>
            <p><strong>Response:</strong> Error counts, trends, and analysis data</p>
            
            <button onclick="getErrorStats()" class="test-button">Get Error Stats</button>
            <div id="error-stats-response" class="response-area"></div>
        </div>

        <div class="endpoint-card">
            <h3>Get Error Graph (PDF)</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/analysis/graph</div>
            <p><strong>Description:</strong> Download PDF graph of error trends over time</p>
            <p><strong>Response:</strong> PDF file with error visualization</p>
            
            <button onclick="getErrorGraph()" class="test-button">Download Graph</button>
            <div id="graph-response" class="response-area"></div>
        </div>

        <div class="endpoint-card">
            <h3>Get Prompt-Error Associations</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/analysis/prompt-errors</div>
            <p><strong>Description:</strong> Get JSON file with all prompts and their associated error counts</p>
            <p><strong>Response:</strong> JSON with prompt IDs mapped to error statistics</p>
            
            <button onclick="getPromptErrors()" class="test-button">Get Associations</button>
            <div id="prompt-errors-response" class="response-area"></div>
        </div>
    </div>

    <!-- Annotation APIs -->
    <div class="api-section">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #ffc107; padding-bottom: 10px;">📝 Annotation Management</h2>
        
        <div class="endpoint-card">
            <h3>Save Annotated Prompt</h3>
            <span class="method-badge method-post">POST</span>
            <div class="endpoint-url">/api/annotations/save</div>
            <p><strong>Description:</strong> Save a completed prompt with user annotations</p>
            <p><strong>Request Body:</strong> JSON with prompt content and annotations</p>
            <p><strong>Response:</strong> Save confirmation and file location</p>
            
            <textarea id="annotation-json" class="config-input" rows="10">{"prompt_id": "2024-01-15_14-30-45", "sections": {"introduction": "This prompt focuses on refactoring recursive functions", "code_analysis": "The factorial function can be optimized for better performance", "recommendations": "Consider iterative approach for large numbers"}, "annotations": [{"error_type": "performance", "category": "recursion", "comment": "Stack overflow risk for large inputs", "line_number": 4, "severity": "medium"}, {"error_type": "edge_case", "category": "validation", "comment": "No input validation for negative numbers", "line_number": 1, "severity": "low"}]}</textarea>
            <button onclick="saveAnnotation()" class="test-button">Save Annotation</button>
            <div id="annotation-response" class="response-area"></div>
        </div>

        <div class="endpoint-card">
            <h3>Get Annotation by Prompt ID</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/annotations/{prompt_id}</div>
            <p><strong>Description:</strong> Retrieve saved annotations for a specific prompt</p>
            <p><strong>Response:</strong> JSON with prompt sections and annotations</p>
            
            <input type="text" id="annotation-prompt-id" class="config-input" value="2024-01-15_14-30-45" placeholder="Enter prompt ID for annotation lookup">
            <button onclick="getAnnotation()" class="test-button">Get Annotation</button>
            <div id="get-annotation-response" class="response-area"></div>
        </div>
    </div>

    <!-- System APIs -->
    <div class="api-section">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">⚙️ System Operations</h2>
        
        <div class="endpoint-card">
            <h3>Health Check</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/health</div>
            <p><strong>Description:</strong> Check if the Flask server is running and responsive</p>
            <p><strong>Response:</strong> Server status and system information</p>
            
            <button onclick="healthCheck()" class="test-button">Health Check</button>
            <div id="health-response" class="response-area"></div>
        </div>

        <div class="endpoint-card">
            <h3>System Status</h3>
            <span class="method-badge method-get">GET</span>
            <div class="endpoint-url">/api/status</div>
            <p><strong>Description:</strong> Get detailed system status and statistics</p>
            <p><strong>Response:</strong> System metrics, file counts, and performance data</p>
            
            <button onclick="getStatus()" class="test-button">Get Status</button>
            <div id="status-response" class="response-area"></div>
        </div>
    </div>
</div>

<script>
function getServerUrl() {
    return document.getElementById('server-url').value.trim();
}

function showResponse(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    const responseText = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    
    element.style.display = 'block';
    element.style.color = isError ? '#dc3545' : '#495057';
    element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong>${isError ? '❌ Error' : '✅ Response'}:</strong>
            <button class="copy-button" onclick="copyToClipboard('${elementId}')">Copy JSON</button>
        </div>
        <div id="${elementId}-content">${responseText}</div>
    `;
}

function copyToClipboard(elementId) {
    const content = document.getElementById(elementId + '-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
        // Show temporary success message
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = '#28a745';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#6c757d';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

async function makeRequest(url, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${data.message || 'Request failed'}`);
        }
        
        return data;
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}

async function testConnection() {
    const statusElement = document.getElementById('connection-status');
    const serverUrl = getServerUrl();
    
    try {
        statusElement.textContent = 'Testing connection...';
        statusElement.style.color = '#ffc107';
        
        const response = await fetch(`${serverUrl}/api/health`);
        
        if (response.ok) {
            statusElement.textContent = '✅ Connection successful';
            statusElement.style.color = '#28a745';
        } else {
            statusElement.textContent = '❌ Server responded with error';
            statusElement.style.color = '#dc3545';
        }
    } catch (error) {
        statusElement.textContent = `❌ Connection failed: ${error.message}`;
        statusElement.style.color = '#dc3545';
    }
}

async function generatePrompt() {
    const jsonInput = document.getElementById('prompt-json').value;
    
    try {
        const data = JSON.parse(jsonInput);
        const result = await makeRequest(`${getServerUrl()}/api/prompts/generate`, 'POST', data);
        showResponse('prompt-response', result);
    } catch (error) {
        showResponse('prompt-response', error.message, true);
    }
}

async function getPrompt() {
    const promptId = document.getElementById('prompt-id').value.trim();
    
    if (!promptId) {
        showResponse('get-prompt-response', 'Please enter a prompt ID', true);
        return;
    }
    
    try {
        const result = await makeRequest(`${getServerUrl()}/api/prompts/${promptId}`);
        showResponse('get-prompt-response', result);
    } catch (error) {
        showResponse('get-prompt-response', error.message, true);
    }
}

async function listPrompts() {
    try {
        const result = await makeRequest(`${getServerUrl()}/api/prompts/list`);
        showResponse('list-prompts-response', result);
    } catch (error) {
        showResponse('list-prompts-response', error.message, true);
    }
}

async function getErrorStats() {
    try {
        const result = await makeRequest(`${getServerUrl()}/api/analysis/errors`);
        showResponse('error-stats-response', result);
    } catch (error) {
        showResponse('error-stats-response', error.message, true);
    }
}

async function getErrorGraph() {
    try {
        const serverUrl = getServerUrl();
        const url = `${serverUrl}/api/analysis/graph`;
        
        // For PDF downloads, we need to handle it differently
        const link = document.createElement('a');
        link.href = url;
        link.download = 'error-trends.pdf';
        link.click();
        
        showResponse('graph-response', 'PDF download initiated. Check your downloads folder.');
    } catch (error) {
        showResponse('graph-response', error.message, true);
    }
}

async function getPromptErrors() {
    try {
        const result = await makeRequest(`${getServerUrl()}/api/analysis/prompt-errors`);
        showResponse('prompt-errors-response', result);
    } catch (error) {
        showResponse('prompt-errors-response', error.message, true);
    }
}

async function saveAnnotation() {
    const jsonInput = document.getElementById('annotation-json').value;
    
    try {
        const data = JSON.parse(jsonInput);
        const result = await makeRequest(`${getServerUrl()}/api/annotations/save`, 'POST', data);
        showResponse('annotation-response', result);
    } catch (error) {
        showResponse('annotation-response', error.message, true);
    }
}

async function getAnnotation() {
    const promptId = document.getElementById('annotation-prompt-id').value.trim();
    
    if (!promptId) {
        showResponse('get-annotation-response', 'Please enter a prompt ID', true);
        return;
    }
    
    try {
        const result = await makeRequest(`${getServerUrl()}/api/annotations/${promptId}`);
        showResponse('get-annotation-response', result);
    } catch (error) {
        showResponse('get-annotation-response', error.message, true);
    }
}

async function healthCheck() {
    try {
        const result = await makeRequest(`${getServerUrl()}/api/health`);
        showResponse('health-response', result);
    } catch (error) {
        showResponse('health-response', error.message, true);
    }
}

async function getStatus() {
    try {
        const result = await makeRequest(`${getServerUrl()}/api/status`);
        showResponse('status-response', result);
    } catch (error) {
        showResponse('status-response', error.message, true);
    }
}

// Initialize connection test on page load
document.addEventListener('DOMContentLoaded', function() {
    testConnection();
});
</script>