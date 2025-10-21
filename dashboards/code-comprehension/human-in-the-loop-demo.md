---
layout: code-comprehension
title: "Human-in-the-Loop Demo"
description: "Interactive demo of the human-in-the-loop AI workflow"
---

# Human-in-the-Loop AI Workflow Demo

This page demonstrates the human-in-the-loop capabilities of our code comprehension system. The AI workflow will pause at critical decision points and wait for human approval or input.

## Interactive Demo

<div class="hil-demo-container">
    <div class="demo-section">
        <h3>1. Code Input</h3>
        <textarea id="hil-code-input" rows="10" cols="80" placeholder="Enter Python code to analyze...">
def calculate_stats(numbers):
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
    return sum_sq / count
        </textarea>
        <br>
        <button id="hil-start-workflow" class="btn btn-primary">Start HIL Workflow</button>
    </div>

    <div class="demo-section">
        <h3>2. Workflow Status</h3>
        <div id="hil-status" class="status-display">
            Ready to start workflow
        </div>
    </div>

    <div class="demo-section">
        <h3>3. Human Intervention</h3>
        <div class="approval-buttons">
            <button id="hil-approve" class="btn btn-success" style="display: none;">
                ✓ Approve
            </button>
            <button id="hil-reject" class="btn btn-danger" style="display: none;">
                ✗ Reject
            </button>
            <button id="hil-reset" class="btn btn-secondary">
                🔄 Reset
            </button>
        </div>
    </div>

    <div class="demo-section">
        <h3>4. Workflow Details</h3>
        <div id="hil-details" class="details-display">
            <p>No active workflow</p>
        </div>
    </div>
</div>

## How It Works

The human-in-the-loop workflow implements several intervention patterns:

### 1. **Approve/Reject Pattern**
- Pauses before critical operations
- Requires explicit human approval
- Can terminate workflow if rejected

### 2. **State Editing Pattern**
- Allows modification of workflow state
- Human can correct AI decisions
- Continues with edited parameters

### 3. **Tool Call Review Pattern**
- Reviews AI tool calls before execution
- Prevents potentially harmful operations
- Allows editing of tool parameters

### 4. **Input Validation Pattern**
- Validates uncertain routing decisions
- Confirms high-perplexity code analysis
- Ensures quality control

## API Endpoints

The human-in-the-loop system provides these REST API endpoints:

- `POST /api/v1/hil/workflow/start` - Start new workflow
- `GET /api/v1/hil/workflow/{id}/state` - Get workflow state
- `POST /api/v1/hil/workflow/{id}/continue` - Provide human input
- `POST /api/v1/hil/workflow/{id}/approve` - Approve current step
- `POST /api/v1/hil/workflow/{id}/reject` - Reject current step
- `POST /api/v1/hil/workflow/{id}/edit` - Edit workflow state
- `GET /api/v1/hil/workflow/{id}/history` - Get approval history

## Features

### ✅ Persistent State Management
- Workflows can be paused indefinitely
- State persists across sessions
- Resumable from any interrupt point

### ✅ Flexible Intervention Points
- Dynamic interrupts based on analysis
- Static interrupts at critical nodes
- Configurable approval thresholds

### ✅ Comprehensive Logging
- Full approval history tracking
- Intervention statistics
- Audit trail for decisions

### ✅ Multiple Decision Types
- Binary approve/reject
- State editing with validation
- Tool call modification
- Routing decision override

## Example Workflow

1. **Submit Code** → AI analyzes baseline metrics
2. **Human Review** → Approve if error count is acceptable
3. **Perplexity Check** → AI determines code complexity
4. **Validation** → Human confirms routing decision
5. **Strategy Selection** → AI predicts refactoring approach
6. **Human Approval** → Review and approve strategy
7. **Tool Execution** → Human reviews before code modification
8. **Final Review** → Approve learning outcomes

<style>
.hil-demo-container {
    max-width: 1000px;
    margin: 20px auto;
    padding: 20px;
}

.demo-section {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: #f9f9f9;
}

.demo-section h3 {
    margin-top: 0;
    color: #333;
}

#hil-code-input {
    width: 100%;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 3px;
}

.btn {
    padding: 10px 20px;
    margin: 5px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn:hover {
    opacity: 0.8;
}

.status-display {
    padding: 10px;
    background: #e9ecef;
    border-radius: 3px;
    font-family: monospace;
    min-height: 20px;
}

.details-display {
    padding: 10px;
    background: #f8f9fa;
    border-radius: 3px;
    min-height: 100px;
}

.approval-buttons {
    text-align: center;
}
</style>

<script src="{{ '/assets/js/code-comprehension/human-in-the-loop-demo.js' | relative_url }}"></script>

<script>
// Additional demo functionality
document.addEventListener('DOMContentLoaded', function() {
    // Enhanced status updates
    window.addEventListener('hilStateUpdate', function(event) {
        const details = document.getElementById('hil-details');
        if (details && event.detail) {
            const state = event.detail;
            details.innerHTML = `
                <h4>Current State</h4>
                <p><strong>Thread ID:</strong> ${state.thread_id || 'None'}</p>
                <p><strong>Pending Approval:</strong> ${state.pending_approval ? 'Yes' : 'No'}</p>
                <p><strong>Interrupt Type:</strong> ${state.interrupt_type || 'None'}</p>
                <p><strong>Message:</strong> ${state.interrupt_message || 'None'}</p>
                <p><strong>Interventions:</strong> ${state.intervention_count || 0}</p>
                <p><strong>History Length:</strong> ${state.approval_history ? state.approval_history.length : 0}</p>
            `;
        }
    });
    
    console.log('Human-in-the-Loop demo initialized');
});
</script>