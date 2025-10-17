// Initialize simulation functionality
function initializeSimulationPage() {
    console.log('Initializing simulation page...');
    
    // API Configuration
    const API_BASE_URL = 'http://127.0.0.1:5000';
    let selectedPrompt = null;
    let uploadedJson = null;
    
    // File upload handling
    const fileInput = document.getElementById('jsonFileInput');
    const fileUploadArea = document.querySelector('.file-upload-area');
    const fileInfo = document.getElementById('fileInfo');
    const runButton = document.getElementById('runSimulationBtn');
    
    // Drag and drop handlers
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });
    
    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });
    
    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
    
    // File handling function
    function handleFileSelect(file) {
        if (file.type !== 'application/json') {
            alert('Please select a JSON file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                uploadedJson = JSON.parse(e.target.result);
                displayFileInfo(file, uploadedJson);
                updateRunButtonState();
            } catch (error) {
                alert('Invalid JSON file. Please check the format.');
                console.error('JSON parsing error:', error);
            }
        };
        reader.readAsText(file);
    }
    
    function displayFileInfo(file, jsonContent) {
        const fileName = document.querySelector('.file-name');
        const filePreview = document.querySelector('.file-preview');
        
        fileName.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        filePreview.textContent = JSON.stringify(jsonContent, null, 2);
        fileInfo.style.display = 'block';
    }
    
    // Prompt dropdown handling
    const promptDropdown = document.getElementById('promptDropdown');
    const selectedPromptInfo = document.getElementById('selectedPromptInfo');
    
    // Load prompts from API
    loadPrompts();
    
    async function loadPrompts() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/data/prompts/all`);
            const prompts = await response.json();
            
            promptDropdown.innerHTML = '<option value="">Select a prompt...</option>';
            
            Object.entries(prompts).forEach(([id, prompt]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `${id} - ${prompt.type || 'Unknown'}`;
                promptDropdown.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading prompts:', error);
            promptDropdown.innerHTML = '<option value="">Error loading prompts</option>';
        }
    }
    
    promptDropdown.addEventListener('change', (e) => {
        if (e.target.value) {
            loadPromptDetails(e.target.value);
        } else {
            selectedPromptInfo.style.display = 'none';
            selectedPrompt = null;
            updateRunButtonState();
        }
    });
    
    async function loadPromptDetails(promptId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/data/prompts/${promptId}`);
            const prompt = await response.json();
            
            selectedPrompt = prompt;
            displayPromptInfo(promptId, prompt);
            updateRunButtonState();
            
        } catch (error) {
            console.error('Error loading prompt details:', error);
            alert('Error loading prompt details.');
        }
    }
    
    function displayPromptInfo(id, prompt) {
        document.getElementById('promptId').textContent = id;
        document.getElementById('promptCreated').textContent = prompt.created || 'Unknown';
        document.getElementById('promptType').textContent = prompt.type || 'Unknown';
        document.getElementById('promptErrors').textContent = prompt.errors || '0';
        document.getElementById('promptPreview').textContent = 
            JSON.stringify(prompt, null, 2).substring(0, 500) + '...';
        
        selectedPromptInfo.style.display = 'block';
    }
    
    function updateRunButtonState() {
        const hasInput = uploadedJson || selectedPrompt;
        runButton.disabled = !hasInput;
        
        if (hasInput) {
            runButton.textContent = '🚀 Run Simulation';
        } else {
            runButton.textContent = '🚀 Select input to run simulation';
        }
    }
    
    // Simulation execution
    runButton.addEventListener('click', runSimulation);
    
    async function runSimulation() {
        const threadId = document.getElementById('threadId').value || generateThreadId();
        const simulationType = document.getElementById('simulationType').value;
        const maxIterations = parseInt(document.getElementById('maxIterations').value);
        
        const payload = uploadedJson || selectedPrompt;
        
        if (!payload) {
            alert('Please select an input method first.');
            return;
        }
        
        // Update UI to show running state
        const statusIndicator = document.getElementById('statusIndicator');
        const resultsContent = document.getElementById('resultsContent');
        const resultsSection = document.getElementById('resultsSection');
        
        statusIndicator.className = 'status-indicator status-running';
        statusIndicator.innerHTML = '<div class="loading-spinner"></div><span>Running simulation...</span>';
        resultsContent.innerHTML = '';
        resultsSection.style.display = 'block';
        runButton.disabled = true;
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/simulation/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    thread_id: threadId,
                    prompt: payload,
                    simulation_type: simulationType,
                    max_iterations: maxIterations
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                displayResults(result, threadId);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Simulation error:', error);
            statusIndicator.className = 'status-indicator status-error';
            statusIndicator.innerHTML = `<span>❌ Error: ${error.message}</span>`;
        } finally {
            runButton.disabled = false;
        }
    }
    
    function displayResults(result, threadId) {
        const statusIndicator = document.getElementById('statusIndicator');
        const resultsContent = document.getElementById('resultsContent');
        
        statusIndicator.className = 'status-indicator status-complete';
        statusIndicator.innerHTML = '<span>✅ Simulation completed successfully</span>';
        
        resultsContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <strong>Thread ID:</strong> ${threadId}<br>
                <strong>Status:</strong> ${result.status || 'Completed'}<br>
                <strong>Timestamp:</strong> ${new Date().toLocaleString()}
            </div>
            <div style="background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; max-height: 400px; overflow-y: auto;">
${JSON.stringify(result, null, 2)}
            </div>
        `;
    }
    
    function generateThreadId() {
        return 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}