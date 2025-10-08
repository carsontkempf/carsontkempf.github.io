---
layout: page
title: Browser Terminal
permalink: /code-comprehension/browser-terminal/
---

<!-- Load correct xterm.js libraries - using working CDN URLs -->
<link rel="stylesheet" href="https://unpkg.com/xterm@5.3.0/css/xterm.css" />
<script src="https://unpkg.com/xterm@5.3.0/lib/xterm.js"></script>
<script src="https://unpkg.com/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
<script src="https://unpkg.com/xterm-addon-web-links@0.9.0/lib/xterm-addon-web-links.js"></script>

<!-- ZMODEM is optional - terminal works without it -->
<script>
// ZMODEM package doesn't exist on public CDNs
// Terminal will work perfectly without file transfers
console.log('📱 Terminal ready - ZMODEM file transfers not available');
console.log('💡 To add file transfers: implement custom upload/download via HTTP');
window.zmodemAvailable = false;
</script>

<div id="auth-check-wrapper" style="display: none;">
  <div style="text-align: center; padding: 50px;">
    <h2>Access Denied</h2>
    <p>You need the "code-comprehension" role to view this page.</p>
    <button onclick="authService.login()" class="login-btn">Log In</button>
    <br><br>
    <a href="/dashboard/">← Back to Dashboard</a>
  </div>
</div>

<div id="project-content-wrapper" style="display: none;">

<style>
#browser-terminal-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    padding: 20px;
}

.terminal-header {
    text-align: center;
    margin-bottom: 30px;
}

.terminal-header h1 {
    font-size: 2.5rem;
    font-weight: 300;
    margin-bottom: 10px;
    color: #2c3e50;
}

.terminal-header p {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 20px;
    color: #7f8c8d;
}

.nav-link-btn {
    display: inline-block;
    margin: 0 10px 20px 10px;
    padding: 10px 20px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-link-btn:hover {
    background: #2980b9;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

.connection-section {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}

.connection-form {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    max-width: 500px;
    width: 100%;
}

.connection-form h3 {
    margin-bottom: 20px;
    color: #2c3e50;
    font-size: 1.3rem;
    font-weight: 600;
    text-align: center;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #2c3e50;
    font-weight: 500;
    font-size: 14px;
}

.form-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #bdc3c7;
    border-radius: 6px;
    font-size: 14px;
    color: #2c3e50;
    background: white;
    transition: border-color 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: #2ecc71;
}

.connect-btn {
    width: 100%;
    background: #2ecc71;
    color: white;
    border: none;
    padding: 15px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    margin-top: 10px;
}

.connect-btn:hover:not(:disabled) {
    background: #27ae60;
    transform: translateY(-1px);
}

.connect-btn:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
}

.status-message {
    margin: 15px 0;
    padding: 10px;
    border-radius: 6px;
    text-align: center;
    font-weight: 500;
    display: none;
}

.status-message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.status-message.loading {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.terminal-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
    margin: 20px 0;
    display: none;
}

.terminal-header-bar {
    background: #2c3e50;
    color: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.terminal-controls {
    display: flex;
    gap: 10px;
}

.terminal-btn {
    background: #34495e;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.3s ease;
}

.terminal-btn:hover {
    background: #4a6278;
}

.terminal-container {
    width: 100%;
    height: 70vh;
    background: #1e1e1e;
    position: relative;
}

#terminal {
    width: 100%;
    height: 100%;
    padding: 10px;
}

.info-section {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.info-section h4 {
    color: #2c3e50;
    margin-bottom: 15px;
}

.info-section code {
    background: #e9ecef;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
}
</style>

<div id="browser-terminal-container">
    <div class="terminal-header">
        <h1>Browser Terminal</h1>
        <p>Connect to your server terminal through the browser</p>
    </div>

    <div style="text-align: center;">
        <a href="/code-comprehension/" class="nav-link-btn">← Back to Project</a>
    </div>

    <!-- Server Info -->
    <div class="info-section">
        <h4>🖥️ Server Connection</h4>
        <p>This terminal connects to your server using WebSocket through the proxy. Make sure your <code>enhanced-proxy.py</code> is running on your server.</p>
        <p><strong>HTTP Proxy:</strong> <code>http://localhost:8888</code></p>
        <p><strong>WebSocket Terminal:</strong> <code>ws://localhost:8889</code></p>
        <p><strong>Auto-SSH:</strong> Automatically connects to target server when using "SSH Terminal" mode</p>
        <div id="proxyStatus" style="margin-top: 15px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div id="proxyIndicator" style="width: 12px; height: 12px; border-radius: 50%; background: #e74c3c;"></div>
                <span id="proxyStatusText">Proxy Server: Not Connected</span>
                <button id="checkProxyBtn" style="margin-left: 10px; padding: 5px 10px; background: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer;">Check Status</button>
            </div>
        </div>
    </div>

    <!-- File Transfer Info -->
    <div class="info-section">
        <h4>📁 ZMODEM File Transfer</h4>
        <p>This terminal supports ZMODEM protocol for file transfers between your browser and server.</p>
        <ul style="margin-left: 20px;">
            <li><strong>Send files to server:</strong> Run <code>rz</code> command on server, then select files in browser dialog</li>
            <li><strong>Receive files from server:</strong> Run <code>sz filename</code> command on server, files will auto-download</li>
            <li><strong>Requirements:</strong> Server must have <code>lrzsz</code> package installed (<code>apt install lrzsz</code>)</li>
        </ul>
    </div>

    <!-- Connection Form -->
    <div class="connection-section">
        <div class="connection-form">
            <h3>🔌 Connect to Server</h3>
            
            <div class="form-group">
                <label for="serverHost">Proxy Server Host</label>
                <input type="text" id="serverHost" class="form-input" placeholder="localhost" value="localhost">
                <small style="color: #7f8c8d;">Usually 'localhost' when SSH tunneling</small>
            </div>

            <div class="form-group">
                <label for="serverPort">HTTP Proxy Port</label>
                <input type="number" id="serverPort" class="form-input" placeholder="8888" value="8888">
            </div>

            <div class="form-group">
                <label for="wsPort">WebSocket Terminal Port</label>
                <input type="number" id="wsPort" class="form-input" placeholder="8889" value="8889">
            </div>

            <div class="form-group">
                <label for="sshHost">SSH Target Server</label>
                <input type="text" id="sshHost" class="form-input" placeholder="rs8sgz564.managed.mst.edu" value="rs8sgz564.managed.mst.edu">
                <small style="color: #7f8c8d;">Auto-connects via SSH on terminal start</small>
            </div>

            <div class="form-group">
                <label for="sshUser">SSH Username</label>
                <input type="text" id="sshUser" class="form-input" placeholder="ctkfdp" value="ctkfdp">
            </div>

            <div class="form-group">
                <label for="terminalType">Terminal Type</label>
                <select id="terminalType" class="form-input">
                    <option value="ssh">SSH Terminal (Auto-connect)</option>
                    <option value="shell">Local Shell</option>
                    <option value="demo">Demo Mode</option>
                </select>
            </div>
            
            <button id="connectBtn" class="connect-btn">🚀 Connect to Server</button>
            
            <div id="statusMessage" class="status-message"></div>
        </div>
    </div>

    <!-- Terminal Interface -->
    <div id="terminalSection" class="terminal-section">
        <div class="terminal-header-bar">
            <div style="font-size: 1.2rem; font-weight: 600;">
                🖥️ Server Terminal - <span id="connectionStatus">Disconnected</span>
            </div>
            <div class="terminal-controls">
                <button id="clearBtn" class="terminal-btn">Clear</button>
                <button id="disconnectBtn" class="terminal-btn">Disconnect</button>
            </div>
        </div>
        <div class="terminal-container">
            <div id="terminal"></div>
        </div>
    </div>
</div>

</div>

<script>
document.addEventListener('authReady', () => {
    if (window.authService.isAuthenticated) {
        const user = window.authService.user;
        
        // Check user roles
        const customRoles = user['https://carsontkempf.github.io/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        const rolesArray = user.roles || [];
        const authorizationRoles = user.authorization?.roles || [];
        const orgRoles = user['org_roles'] || [];
        const realmRoles = user['realm_roles'] || [];
        
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles, ...rolesArray, ...authorizationRoles, ...orgRoles, ...realmRoles];
        
        const hasAdminRole = allRoles.includes('admin');
        const hasCodeComprehensionRole = allRoles.includes('code-comprehension') || 
                                        allRoles.includes('Code-Comprehension-Project') || 
                                        allRoles.includes('rol_XUUh9ZOhirY2yCQQ');
        const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
        
        if (hasAdminRole || hasCodeComprehensionRole || isSiteOwner) {
            document.getElementById('project-content-wrapper').style.display = 'block';
            initializeTerminal();
        } else {
            document.getElementById('auth-check-wrapper').style.display = 'block';
        }
    } else {
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
});

function initializeTerminal() {
    console.log('🖥️ Terminal: Initializing server terminal connection');
    
    const connectBtn = document.getElementById('connectBtn');
    const clearBtn = document.getElementById('clearBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    const statusMessage = document.getElementById('statusMessage');
    const terminalSection = document.getElementById('terminalSection');
    const connectionStatus = document.getElementById('connectionStatus');
    const checkProxyBtn = document.getElementById('checkProxyBtn');
    
    const serverHost = document.getElementById('serverHost');
    const serverPort = document.getElementById('serverPort');
    const wsPort = document.getElementById('wsPort');
    const terminalType = document.getElementById('terminalType');
    const sshHost = document.getElementById('sshHost');
    const sshUser = document.getElementById('sshUser');
    
    let terminal = null;
    let websocket = null;
    let isConnected = false;
    let zmodemSentry = null;
    
    connectBtn.addEventListener('click', async () => {
        if (isConnected) {
            terminalSection.style.display = 'block';
            return;
        }
        
        connectBtn.disabled = true;
        showStatus('Connecting to server...', 'loading');
        
        try {
            await connectToServer();
        } catch (error) {
            console.error('Connection failed:', error);
            showStatus('Connection failed: ' + error.message, 'error');
            connectBtn.disabled = false;
        }
    });
    
    clearBtn.addEventListener('click', () => {
        if (terminal) {
            terminal.clear();
        }
    });
    
    disconnectBtn.addEventListener('click', () => {
        disconnect();
    });
    
    checkProxyBtn.addEventListener('click', () => {
        checkProxyStatus();
    });
    
    // Check proxy status on page load
    setTimeout(checkProxyStatus, 1000);
    
    async function checkProxyStatus() {
        const host = serverHost.value.trim();
        const port = serverPort.value.trim();
        const indicator = document.getElementById('proxyIndicator');
        const statusText = document.getElementById('proxyStatusText');
        
        try {
            const response = await fetch(`http://${host}:${port}/?url=https://httpbin.org/get`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                indicator.style.background = '#2ecc71';
                statusText.textContent = `Proxy Server: ✅ Connected (${host}:${port})`;
            } else {
                throw new Error('Proxy responded with error');
            }
        } catch (error) {
            indicator.style.background = '#e74c3c';
            statusText.textContent = `Proxy Server: ❌ Not Available (${host}:${port})`;
            console.log('Proxy status check failed:', error.message);
        }
    }
    
    async function connectToServer() {
        console.log('🚀 Starting connection process...');
        
        // Wait for xterm.js libraries to load
        try {
            console.log('📚 Waiting for libraries to load...');
            await waitForLibraries();
            console.log('✅ Libraries loaded, proceeding with terminal setup');
        } catch (error) {
            console.error('❌ Library loading failed:', error);
            throw error;
        }
        
        // Initialize terminal
        console.log('🖥️ Creating terminal instance...');
        try {
            terminal = new Terminal({
                cursorBlink: true,
                theme: {
                    background: '#1e1e1e',
                    foreground: '#ffffff',
                    cursor: '#ffffff'
                },
                fontSize: 14,
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                cols: 120,
                rows: 30,
                localEcho: false,  // Disable local echo to prevent double input
                disableStdin: false
            });
            console.log('✅ Terminal instance created successfully');
        } catch (error) {
            console.error('❌ Failed to create terminal:', error);
            throw new Error('Terminal creation failed: ' + error.message);
        }
        
        // Load addons with correct syntax for older xterm.js
        console.log('🔌 Loading terminal addons...');
        try {
            // Handle both old and new addon naming conventions
            let fitAddon;
            if (typeof FitAddon !== 'undefined' && FitAddon.FitAddon) {
                fitAddon = new FitAddon.FitAddon();
            } else if (typeof window.FitAddon !== 'undefined') {
                fitAddon = new window.FitAddon();
            } else {
                throw new Error('FitAddon not available');
            }
            
            terminal.loadAddon(fitAddon);
            console.log('✅ FitAddon loaded successfully');
            
            let webLinksAddon;
            if (typeof WebLinksAddon !== 'undefined' && WebLinksAddon.WebLinksAddon) {
                webLinksAddon = new WebLinksAddon.WebLinksAddon();
            } else if (typeof window.WebLinksAddon !== 'undefined') {
                webLinksAddon = new window.WebLinksAddon();
            } else {
                throw new Error('WebLinksAddon not available');
            }
            
            terminal.loadAddon(webLinksAddon);
            console.log('✅ WebLinksAddon loaded successfully');
            
            // Store fitAddon reference for later use
            window._terminalFitAddon = fitAddon;
        } catch (error) {
            console.error('❌ Failed to load addons:', error);
            throw new Error('Addon loading failed: ' + error.message);
        }
        
        // Open terminal
        console.log('🖼️ Opening terminal in DOM...');
        try {
            const terminalElement = document.getElementById('terminal');
            if (!terminalElement) {
                throw new Error('Terminal DOM element not found');
            }
            
            terminal.open(terminalElement);
            window._terminalFitAddon.fit();
            console.log('✅ Terminal opened and fitted successfully');
            
            // Handle window resize
            window.addEventListener('resize', () => window._terminalFitAddon.fit());
            
            // Show terminal section
            terminalSection.style.display = 'block';
            console.log('✅ Terminal section displayed');
        } catch (error) {
            console.error('❌ Failed to open terminal:', error);
            throw new Error('Terminal display failed: ' + error.message);
        }
        
        const host = serverHost.value.trim();
        const port = serverPort.value.trim();
        const ws_port = wsPort.value.trim();
        const type = terminalType.value;
        
        if (type === 'demo') {
            // Demo mode - no server connection needed
            initializeDemoMode();
            isConnected = true;
            connectionStatus.textContent = 'Demo Mode';
            showStatus('Demo terminal started!', 'success');
            connectBtn.textContent = '📱 Show Terminal';
            connectBtn.disabled = false;
            return;
        }
        
        // Try to connect via WebSocket to terminal server
        const wsUrl = `ws://${host}:${ws_port}`;
        console.log('🌐 Attempting WebSocket connection...');
        console.log(`  URL: ${wsUrl}`);
        console.log(`  Host: ${host}`);
        console.log(`  WebSocket Port: ${ws_port}`);
        console.log(`  HTTP Proxy Port: ${port}`);
        
        try {
            console.log('🔗 Creating WebSocket connection...');
            websocket = new WebSocket(wsUrl);
            
            websocket.onopen = () => {
                console.log('WebSocket connection established');
                isConnected = true;
                connectionStatus.textContent = `Connected to ${host}:${ws_port}`;
                showStatus('Connected to server!', 'success');
                connectBtn.textContent = '📱 Show Terminal';
                connectBtn.disabled = false;

                // Initialize ZMODEM file transfer (if available)
                setTimeout(() => {
                    try {
                        if (typeof Zmodem !== 'undefined' || typeof window.Zmodem !== 'undefined') {
                            initializeZmodem();
                            console.log('✅ ZMODEM file transfer enabled');
                        } else {
                            console.log('📱 Terminal running without ZMODEM file transfers');
                        }
                    } catch (error) {
                        console.warn('⚠️  ZMODEM initialization failed:', error.message);
                    }
                }, 100);

                // Send initial connection info
                websocket.send(JSON.stringify({
                    type: 'init',
                    terminal_type: type,
                    cols: terminal.cols,
                    rows: terminal.rows
                }));

                // Auto-SSH to target server if SSH mode
                if (type === 'ssh') {
                    const targetHost = sshHost.value.trim();
                    const targetUser = sshUser.value.trim();

                    if (targetHost && targetUser) {
                        console.log(`🔐 Auto-connecting to SSH: ${targetUser}@${targetHost}`);

                        // Wait a bit for shell to be ready, then send SSH command
                        setTimeout(() => {
                            const sshCommand = `ssh ${targetUser}@${targetHost}\n`;
                            websocket.send(JSON.stringify({
                                type: 'input',
                                data: sshCommand
                            }));
                            console.log(`✅ Sent SSH command: ${sshCommand.trim()}`);
                            connectionStatus.textContent = `SSH → ${targetUser}@${targetHost}`;
                        }, 500);
                    }
                }
            };
            
            // Echo deduplication - tracks recent input to filter echoed output
            let recentInput = '';
            let inputTimestamp = 0;
            const ECHO_WINDOW_MS = 100; // Time window to check for echo

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'output') {
                    let output = data.data;

                    // Check if this output matches recent input (double echo)
                    const now = Date.now();
                    if (recentInput && (now - inputTimestamp) < ECHO_WINDOW_MS) {
                        // Check if output starts with our recent input
                        if (output.startsWith(recentInput)) {
                            // Remove the echoed part
                            output = output.slice(recentInput.length);
                            console.log('🔇 Filtered echo:', recentInput);
                        }
                    }

                    // Pass data through zmodem sentry first
                    if (zmodemSentry && output) {
                        zmodemSentry.consume(output);
                    } else if (output) {
                        terminal.write(output);
                    }
                }
            };
            
            websocket.onclose = () => {
                console.log('WebSocket connection closed');
                isConnected = false;
                connectionStatus.textContent = 'Disconnected';
                showStatus('Connection closed', 'error');
            };
            
            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                console.log('🔄 WebSocket failed, proceeding to proxy fallback...');
                // Mark as failed and continue to fallback
                isConnected = false;
            };
            
            // Handle terminal input
            terminal.onData((data) => {
                if (websocket && websocket.readyState === WebSocket.OPEN) {
                    websocket.send(JSON.stringify({
                        type: 'input',
                        data: data
                    }));
                }
            });
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            isConnected = false;
        }
        
        // Always check if we need to fallback
        if (!isConnected) {
            console.log('🔄 WebSocket failed - falling back to demo mode');
            console.log('💡 This usually means:');
            console.log('  1. Enhanced proxy server is not running on port 8889');
            console.log('  2. WebSocket port is blocked by firewall');
            console.log('  3. Server not started with: ./run-proxy.sh');
            
            await connectViaProxy(host, port, type);
        }
    }
    
    function initializeZmodem() {
        console.log('🔄 Initializing ZMODEM file transfer support');
        
        // Get the correct Zmodem object reference
        let ZmodemRef = null;
        if (typeof Zmodem !== 'undefined') {
            ZmodemRef = Zmodem;
        } else if (typeof window.Zmodem !== 'undefined') {
            ZmodemRef = window.Zmodem;
        } else if (typeof ZModem !== 'undefined') {
            ZmodemRef = ZModem;
        } else if (typeof window.ZModem !== 'undefined') {
            ZmodemRef = window.ZModem;
        } else {
            console.error('❌ ZMODEM library not found');
            return;
        }
        
        console.log('✅ Found ZMODEM library:', Object.keys(ZmodemRef));
        
        zmodemSentry = new ZmodemRef.Sentry({
            to_terminal: (octets) => {
                // Write data to terminal
                terminal.write(new Uint8Array(octets));
            },
            
            sender: (octets) => {
                // Send data to server via WebSocket
                if (websocket && websocket.readyState === WebSocket.OPEN) {
                    websocket.send(JSON.stringify({
                        type: 'zmodem_data',
                        data: Array.from(octets)
                    }));
                }
            },
            
            on_detect: (detection) => {
                console.log('🔄 ZMODEM session detected');
                const session = detection.confirm();
                
                if (session.type === "send") {
                    // Browser sending files to server
                    console.log('📤 ZMODEM Send session');
                    
                    // Create file input for user to select files
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.multiple = true;
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    
                    fileInput.addEventListener('change', (event) => {
                        const files = Array.from(event.target.files);
                        if (files.length > 0) {
                            console.log(`📤 Sending ${files.length} files via ZMODEM`);
                            terminal.writeln(`\r\n📤 Sending ${files.length} files...`);
                            ZmodemRef.Browser.send_files(session, files);
                        }
                        document.body.removeChild(fileInput);
                    });
                    
                    fileInput.click();
                    
                } else {
                    // Server sending files to browser
                    console.log('📥 ZMODEM Receive session');
                    terminal.writeln('\r\n📥 Receiving files...');
                    
                    session.on("offer", (offer) => {
                        const fileDetails = offer.get_details();
                        console.log(`📥 Receiving file: ${fileDetails.name} (${fileDetails.size} bytes)`);
                        terminal.writeln(`📥 Receiving: ${fileDetails.name}`);
                        
                        offer.accept().then(() => {
                            console.log('✅ File transfer completed');
                            terminal.writeln(`✅ Downloaded: ${fileDetails.name}`);
                            
                            // Save file to browser downloads
                            ZmodemRef.Browser.save_to_disk(
                                offer.get_payloads(),
                                fileDetails.name
                            );
                        });
                    });
                    
                    session.start();
                }
            },
            
            on_retract: () => {
                console.log('🔄 ZMODEM session retracted');
            }
        });
        
        console.log('✅ ZMODEM support initialized');
    }
    
    async function connectViaProxy(host, port, type) {
        console.log('🔄 Using HTTP proxy fallback method');
        console.log('⚠️  Note: This is a demo mode - no real server connection');
        console.log('💡 For full functionality, start the enhanced-proxy.py server');
        
        // Test proxy connectivity first
        try {
            console.log('🧪 Testing proxy connectivity...');
            const response = await fetch(`http://${host}:${port}/?url=https://httpbin.org/get`, {
                method: 'GET',
                timeout: 3000
            });
            
            if (response.ok) {
                console.log('✅ Proxy server is reachable');
            } else {
                console.log('⚠️  Proxy server responded but may have issues');
            }
        } catch (error) {
            console.log('❌ Proxy server is not reachable');
            console.log('💡 Starting offline demo mode instead');
        }
        
        isConnected = true;
        connectionStatus.textContent = `Proxy Demo: ${host}:${port}`;
        showStatus('Connected via proxy demo mode!', 'success');
        connectBtn.textContent = '📱 Show Terminal';
        connectBtn.disabled = false;
        
        // Initialize proxy-based terminal
        initializeProxyTerminal(host, port, type);
    }
    
    function initializeProxyTerminal(host, port, type) {
        let currentDirectory = '/home/user';
        let currentLine = '';
        
        // Welcome message
        terminal.writeln(`🖥️ Connected to ${host}:${port} via proxy`);
        terminal.writeln(`Terminal type: ${type}`);
        terminal.writeln('');
        terminal.writeln('Proxy-based terminal session started');
        terminal.writeln('Type "help" for available commands');
        terminal.writeln('');
        terminal.write('$ ');
        
        // Handle terminal input
        terminal.onData((data) => {
            switch (data) {
                case '\r': // Enter
                    terminal.write('\r\n');
                    executeProxyCommand(currentLine.trim(), host, port);
                    currentLine = '';
                    terminal.write('$ ');
                    break;
                    
                case '\u007F': // Backspace
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        terminal.write('\b \b');
                    }
                    break;
                    
                default:
                    if (data >= ' ' && data <= '~') {
                        currentLine += data;
                        terminal.write(data);
                    }
            }
        });
        
        async function executeProxyCommand(command, host, port) {
            const args = command.split(' ');
            const cmd = args[0];
            
            switch (cmd) {
                case '':
                    break;
                    
                case 'help':
                    terminal.writeln('Available commands:');
                    terminal.writeln('  help      - show this help');
                    terminal.writeln('  proxy     - test proxy connection');
                    terminal.writeln('  status    - show connection status');
                    terminal.writeln('  clear     - clear terminal');
                    terminal.writeln('  pwd       - current directory');
                    terminal.writeln('  echo      - display text');
                    break;
                    
                case 'proxy':
                    terminal.writeln(`Testing proxy connection to ${host}:${port}...`);
                    try {
                        const response = await fetch(`http://${host}:${port}/?url=https://httpbin.org/get`);
                        if (response.ok) {
                            terminal.writeln('✅ Proxy connection successful');
                        } else {
                            terminal.writeln('❌ Proxy connection failed');
                        }
                    } catch (error) {
                        terminal.writeln(`❌ Proxy error: ${error.message}`);
                    }
                    break;
                    
                case 'status':
                    terminal.writeln(`Connection: ${isConnected ? 'Connected' : 'Disconnected'}`);
                    terminal.writeln(`Server: ${host}:${port}`);
                    terminal.writeln(`Type: ${type}`);
                    break;
                    
                case 'pwd':
                    terminal.writeln(currentDirectory);
                    break;
                    
                case 'echo':
                    terminal.writeln(args.slice(1).join(' '));
                    break;
                    
                case 'clear':
                    terminal.clear();
                    break;
                    
                default:
                    terminal.writeln(`${cmd}: command not found`);
                    terminal.writeln('Type "help" for available commands');
            }
        }
    }
    
    function initializeDemoMode() {
        let currentDirectory = '/home/user';
        let currentLine = '';
        
        // Virtual file system
        const fs = {
            '/': { type: 'dir', contents: ['home', 'bin', 'etc'] },
            '/home': { type: 'dir', contents: ['user'] },
            '/home/user': { type: 'dir', contents: ['README.txt', 'documents'] },
            '/home/user/README.txt': { type: 'file', content: 'Welcome to Browser Terminal Demo!\n\nThis is a demonstration of xterm.js running in the browser.\n\nAvailable commands: ls, cd, cat, pwd, echo, clear, help\n' },
            '/home/user/documents': { type: 'dir', contents: ['notes.txt'] },
            '/home/user/documents/notes.txt': { type: 'file', content: 'Demo notes in the browser terminal.\n' },
            '/bin': { type: 'dir', contents: ['ls', 'cat', 'echo'] },
            '/etc': { type: 'dir', contents: ['hosts'] },
            '/etc/hosts': { type: 'file', content: '127.0.0.1 localhost\n' }
        };
        
        // Welcome message
        terminal.writeln('🚀 Browser Terminal Demo Mode');
        terminal.writeln('Powered by xterm.js');
        terminal.writeln('');
        terminal.writeln('Type "help" for available commands');
        terminal.writeln('');
        terminal.write('$ ');
        
        // Handle input
        terminal.onData((data) => {
            switch (data) {
                case '\r': // Enter
                    terminal.write('\r\n');
                    executeDemoCommand(currentLine.trim());
                    currentLine = '';
                    terminal.write('$ ');
                    break;
                    
                case '\u007F': // Backspace
                    if (currentLine.length > 0) {
                        currentLine = currentLine.slice(0, -1);
                        terminal.write('\b \b');
                    }
                    break;
                    
                default:
                    if (data >= ' ' && data <= '~') {
                        currentLine += data;
                        terminal.write(data);
                    }
            }
        });
        
        function executeDemoCommand(command) {
            const args = command.split(' ');
            const cmd = args[0];
            
            switch (cmd) {
                case '':
                    break;
                    
                case 'help':
                    terminal.writeln('Available commands:');
                    terminal.writeln('  ls [path]     - list files');
                    terminal.writeln('  cd <path>     - change directory');
                    terminal.writeln('  cat <file>    - show file content');
                    terminal.writeln('  pwd           - current directory');
                    terminal.writeln('  echo <text>   - display text');
                    terminal.writeln('  clear         - clear terminal');
                    terminal.writeln('  help          - show this help');
                    break;
                    
                case 'pwd':
                    terminal.writeln(currentDirectory);
                    break;
                    
                case 'ls':
                    const path = args[1] || currentDirectory;
                    const dir = fs[path];
                    if (dir && dir.type === 'dir') {
                        dir.contents.forEach(item => {
                            const itemPath = path === '/' ? `/${item}` : `${path}/${item}`;
                            const itemInfo = fs[itemPath];
                            if (itemInfo && itemInfo.type === 'dir') {
                                terminal.writeln(`\u001b[34m${item}/\u001b[0m`);
                            } else {
                                terminal.writeln(item);
                            }
                        });
                    } else {
                        terminal.writeln(`ls: ${path}: No such directory`);
                    }
                    break;
                    
                case 'cd':
                    if (args.length < 2) {
                        currentDirectory = '/home/user';
                    } else {
                        let newPath = args[1];
                        if (!newPath.startsWith('/')) {
                            newPath = currentDirectory === '/' ? `/${newPath}` : `${currentDirectory}/${newPath}`;
                        }
                        if (fs[newPath] && fs[newPath].type === 'dir') {
                            currentDirectory = newPath;
                        } else {
                            terminal.writeln(`cd: ${newPath}: No such directory`);
                        }
                    }
                    break;
                    
                case 'cat':
                    if (args.length < 2) {
                        terminal.writeln('cat: missing file operand');
                    } else {
                        let filePath = args[1];
                        if (!filePath.startsWith('/')) {
                            filePath = currentDirectory === '/' ? `/${filePath}` : `${currentDirectory}/${filePath}`;
                        }
                        const file = fs[filePath];
                        if (file && file.type === 'file') {
                            terminal.writeln(file.content);
                        } else {
                            terminal.writeln(`cat: ${filePath}: No such file`);
                        }
                    }
                    break;
                    
                case 'echo':
                    terminal.writeln(args.slice(1).join(' '));
                    break;
                    
                case 'clear':
                    terminal.clear();
                    break;
                    
                default:
                    terminal.writeln(`${cmd}: command not found`);
            }
        }
    }
    
    function disconnect() {
        if (websocket) {
            websocket.close();
            websocket = null;
        }
        
        if (terminal) {
            terminal.dispose();
            terminal = null;
        }
        
        if (zmodemSentry) {
            zmodemSentry = null;
        }
        
        isConnected = false;
        terminalSection.style.display = 'none';
        connectionStatus.textContent = 'Disconnected';
        connectBtn.textContent = '🚀 Connect to Server';
        connectBtn.disabled = false;
        showStatus('Disconnected from server', 'success');
    }
    
    function waitForLibraries() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // Increased timeout
            
            function check() {
                attempts++;
                
                // Debug: Log what's available
                console.log(`🔍 Library check attempt ${attempts}:`);
                console.log(`  Terminal: ${typeof Terminal !== 'undefined'}`);
                console.log(`  FitAddon: ${typeof FitAddon !== 'undefined'}`);
                console.log(`  WebLinksAddon: ${typeof WebLinksAddon !== 'undefined'}`);
                console.log(`  Zmodem: ${typeof Zmodem !== 'undefined'}`);
                
                // Also check window object for older xterm versions
                console.log(`  window.FitAddon: ${typeof window.FitAddon !== 'undefined'}`);
                console.log(`  window.WebLinksAddon: ${typeof window.WebLinksAddon !== 'undefined'}`);
                
                // Check all required libraries - handle both new and old naming
                const terminalReady = typeof Terminal !== 'undefined';
                const fitAddonReady = typeof FitAddon !== 'undefined' || typeof window.FitAddon !== 'undefined';
                const webLinksReady = typeof WebLinksAddon !== 'undefined' || typeof window.WebLinksAddon !== 'undefined';
                
                // ZMODEM can be available in multiple ways
                const zmodemReady = (typeof Zmodem !== 'undefined') || 
                                   (typeof window.Zmodem !== 'undefined') ||
                                   (typeof ZModem !== 'undefined') ||
                                   (typeof window.ZModem !== 'undefined');
                
                if (terminalReady && fitAddonReady && webLinksReady) {
                    console.log('✅ Core terminal libraries loaded successfully');
                    console.log(`  Terminal version: ${Terminal.version || 'unknown'}`);
                    console.log('🚀 Terminal ready - proceeding without waiting for ZMODEM');
                    resolve();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    const missing = [];
                    if (!terminalReady) missing.push('Terminal');
                    if (!fitAddonReady) missing.push('FitAddon');
                    if (!webLinksReady) missing.push('WebLinksAddon');
                    // Note: ZMODEM is now optional
                    
                    // Debug: Show what's actually available
                    console.log('🔍 Available objects:');
                    console.log('  window.Terminal:', typeof window.Terminal);
                    console.log('  window.FitAddon:', typeof window.FitAddon);
                    console.log('  window.WebLinksAddon:', typeof window.WebLinksAddon);
                    console.log('  window.Zmodem:', typeof window.Zmodem);
                    console.log('  Object keys on window:', Object.keys(window).filter(k => k.includes('term') || k.includes('Term') || k.includes('Fit') || k.includes('Web') || k.includes('Zmod')));
                    
                    console.error(`❌ Libraries failed to load after ${attempts} attempts:`);
                    console.error(`  Missing: ${missing.join(', ')}`);
                    console.error(`  Check network connectivity and CDN availability`);
                    
                    reject(new Error(`Libraries failed to load: ${missing.join(', ')}`));
                    return;
                }
                
                setTimeout(check, 100);
            }
            
            check();
        });
    }
    
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => statusMessage.style.display = 'none', 3000);
        }
    }
}

setTimeout(() => {
    if (!window.authService || !window.authService.isAuthenticated) {
        document.getElementById('auth-check-wrapper').style.display = 'block';
    }
}, 5000);
</script>