---
layout: page
title: Server Controls
permalink: /controls/
back_url: /dashboard/
back_text: Dashboard
---

{% include widgets/navigation/back-button.html back_url=page.back_url back_text=page.back_text %}

<div id="controls-access-denied" style="display: none;">
    <h2>Access Denied</h2>
    <p>You must be logged in with admin permissions to view this page.</p>
    <button onclick="authService.login()" class="login-btn">Log In</button>
    <br><br>
    <a href="/dashboard/">← Back to Dashboard</a>
</div>

<div id="controls-content-wrapper" style="display: none;">

<style>
.controls-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.controls-header {
    text-align: center;
    margin-bottom: 40px;
}

.controls-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 10px;
}

.controls-header p {
    font-size: 1.1rem;
    color: #7f8c8d;
    margin-bottom: 20px;
}

.nav-section {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: rgba(52, 152, 219, 0.1);
    border-radius: 8px;
    border-left: 4px solid #3498db;
}

.nav-btn {
    display: inline-block;
    margin: 0 10px;
    padding: 10px 20px;
    background: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.nav-btn:hover {
    background: #2980b9;
    transform: translateY(-1px);
    text-decoration: none;
    color: white;
}

.controls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.control-section {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-left: 4px solid #e74c3c;
}

.control-section h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 10px;
}

.control-section p {
    color: #7f8c8d;
    margin-bottom: 20px;
    line-height: 1.5;
}

.control-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.control-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 8px;
}

.control-btn:hover {
    background: #c0392b;
    transform: translateY(-1px);
}

.control-btn.secondary {
    background: #34495e;
}

.control-btn.secondary:hover {
    background: #2c3e50;
}

.control-btn.success {
    background: #27ae60;
}

.control-btn.success:hover {
    background: #229954;
}

.control-btn.warning {
    background: #f39c12;
}

.control-btn.warning:hover {
    background: #e67e22;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: white;
    margin: 5% auto;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #ecf0f1;
}

.modal-header h2 {
    margin: 0;
    color: #2c3e50;
}

.close {
    color: #aaa;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    line-height: 1;
}

.close:hover {
    color: #e74c3c;
}

.modal-body {
    margin-bottom: 20px;
}

.json-display {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 20px;
    border-radius: 6px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 15px;
    border: 2px solid #34495e;
    position: relative;
    user-select: text;
    -webkit-user-select: text;
    -moz-user-select: text;
}

.json-display::before {
    content: "📄 JSON Template (Read-Only)";
    position: absolute;
    top: -10px;
    left: 15px;
    background: #34495e;
    color: #ecf0f1;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid #ecf0f1;
}

.modal-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.modal-btn.primary {
    background: #e74c3c;
    color: white;
}

.modal-btn.primary:hover {
    background: #c0392b;
}

.modal-btn.secondary {
    background: #95a5a6;
    color: white;
}

.modal-btn.secondary:hover {
    background: #7f8c8d;
}

.status-section {
    background: white;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-left: 4px solid #27ae60;
}

.status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.status-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
}

.status-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2c3e50;
}

.status-label {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin-top: 5px;
}

@media (max-width: 768px) {
    .controls-grid {
        grid-template-columns: 1fr;
    }
    
    .modal-content {
        width: 95%;
        margin: 10% auto;
        padding: 20px;
    }
    
    .control-buttons {
        gap: 8px;
    }
}
</style>

<div class="controls-container">
    <div class="controls-header">
        <h1>🔧 Server Controls</h1>
        <p>Manage server operations, SSH commands, and infrastructure controls</p>
    </div>
    
    <div class="nav-section">
        <a href="/dashboard/" class="nav-btn">← Back to Dashboard</a>
        <a href="/auth0-users/" class="nav-btn">User Management</a>
    </div>

    <div class="status-section">
        <h3>📊 Server Status</h3>
        <div class="status-grid">
            <div class="status-item">
                <div class="status-value" id="server-uptime">--</div>
                <div class="status-label">Server Uptime</div>
            </div>
            <div class="status-item">
                <div class="status-value" id="cpu-usage">--</div>
                <div class="status-label">CPU Usage</div>
            </div>
            <div class="status-item">
                <div class="status-value" id="memory-usage">--</div>
                <div class="status-label">Memory Usage</div>
            </div>
            <div class="status-item">
                <div class="status-value" id="disk-usage">--</div>
                <div class="status-label">Disk Usage</div>
            </div>
        </div>
    </div>

    <div class="controls-grid">
        <!-- System Controls -->
        <div class="control-section">
            <h3>🖥️ System Controls</h3>
            <p>Basic system operations and server management commands</p>
            <div class="control-buttons">
                <button class="control-btn success" onclick="showCommandModal('system-status')">
                    📊 System Status
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('disk-usage')">
                    💽 Disk Usage
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('memory-info')">
                    🧠 Memory Info
                </button>
                <button class="control-btn warning" onclick="showCommandModal('process-list')">
                    📋 Running Processes
                </button>
                <button class="control-btn" onclick="showCommandModal('system-reboot')">
                    🔄 Restart Server
                </button>
            </div>
        </div>

        <!-- Service Management -->
        <div class="control-section">
            <h3>⚙️ Service Management</h3>
            <p>Start, stop, and restart system services</p>
            <div class="control-buttons">
                <button class="control-btn success" onclick="showCommandModal('service-status')">
                    ✅ Service Status
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('nginx-restart')">
                    🔄 Restart Nginx
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('apache-restart')">
                    🔄 Restart Apache
                </button>
                <button class="control-btn warning" onclick="showCommandModal('ssh-restart')">
                    🔄 Restart SSH
                </button>
                <button class="control-btn" onclick="showCommandModal('service-logs')">
                    📜 View Service Logs
                </button>
            </div>
        </div>

        <!-- File Operations -->
        <div class="control-section">
            <h3>📁 File Operations</h3>
            <p>File system operations and management</p>
            <div class="control-buttons">
                <button class="control-btn success" onclick="showCommandModal('list-directory')">
                    📂 List Directory
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('backup-files')">
                    💾 Backup Files
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('find-files')">
                    🔍 Find Files
                </button>
                <button class="control-btn warning" onclick="showCommandModal('cleanup-temp')">
                    🧹 Cleanup Temp Files
                </button>
                <button class="control-btn" onclick="showCommandModal('file-permissions')">
                    🔐 Fix Permissions
                </button>
            </div>
        </div>

        <!-- Network Controls -->
        <div class="control-section">
            <h3>🌐 Network Controls</h3>
            <p>Network diagnostics and firewall management</p>
            <div class="control-buttons">
                <button class="control-btn success" onclick="showCommandModal('network-status')">
                    📡 Network Status
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('ping-test')">
                    🏓 Ping Test
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('port-scan')">
                    🔍 Port Scan
                </button>
                <button class="control-btn warning" onclick="showCommandModal('firewall-status')">
                    🛡️ Firewall Status
                </button>
                <button class="control-btn" onclick="showCommandModal('flush-dns')">
                    🔄 Flush DNS
                </button>
            </div>
        </div>

        <!-- Database Operations -->
        <div class="control-section">
            <h3>🗃️ Database Operations</h3>
            <p>Database management and backup operations</p>
            <div class="control-buttons">
                <button class="control-btn success" onclick="showCommandModal('db-status')">
                    📊 Database Status
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('db-backup')">
                    💾 Create Backup
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('db-restore')">
                    📤 Restore Backup
                </button>
                <button class="control-btn warning" onclick="showCommandModal('db-optimize')">
                    ⚡ Optimize Tables
                </button>
                <button class="control-btn" onclick="showCommandModal('db-repair')">
                    🔧 Repair Database
                </button>
            </div>
        </div>

        <!-- Application Controls -->
        <div class="control-section">
            <h3>🚀 Application Controls</h3>
            <p>Application deployment and management</p>
            <div class="control-buttons">
                <button class="control-btn success" onclick="showCommandModal('app-status')">
                    📊 App Status
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('deploy-app')">
                    🚀 Deploy Application
                </button>
                <button class="control-btn secondary" onclick="showCommandModal('update-app')">
                    🔄 Update Application
                </button>
                <button class="control-btn warning" onclick="showCommandModal('clear-cache')">
                    🧹 Clear Cache
                </button>
                <button class="control-btn" onclick="showCommandModal('rollback-app')">
                    ↩️ Rollback Version
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Command Modal -->
<div id="commandModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="modalTitle">Command Details</h2>
            <span class="close" onclick="closeModal()">&times;</span>
        </div>
        <div class="modal-body">
            <div id="modalDescription"></div>
            <div class="json-display" id="jsonTemplate"></div>
        </div>
        <div class="modal-actions">
            <button class="modal-btn primary" onclick="executeCommand()">🚀 Execute Command</button>
            <button class="modal-btn secondary" onclick="copyToClipboard()">📋 Copy JSON</button>
            <button class="modal-btn secondary" onclick="closeModal()">❌ Close</button>
        </div>
    </div>
</div>

</div>

<script>
// Command templates with JSON configurations
const commandTemplates = {
    'system-status': {
        title: 'System Status Check',
        description: 'Get comprehensive system information including uptime, load, and resource usage.',
        command: 'uptime && free -h && df -h && lscpu | head -20',
        json: {
            "action": "system_status",
            "command": "uptime && free -h && df -h && lscpu | head -20",
            "description": "Display system uptime, memory usage, disk usage, and CPU information",
            "category": "system",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "2-5 seconds"
        }
    },
    'disk-usage': {
        title: 'Disk Usage Analysis',
        description: 'Analyze disk space usage across all mounted filesystems.',
        command: 'df -h && du -sh /var/log/* 2>/dev/null | sort -hr | head -10',
        json: {
            "action": "disk_usage",
            "command": "df -h && du -sh /var/log/* 2>/dev/null | sort -hr | head -10",
            "description": "Show disk usage and largest log files",
            "category": "system",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "3-10 seconds"
        }
    },
    'memory-info': {
        title: 'Memory Information',
        description: 'Display detailed memory usage including swap and buffers.',
        command: 'free -h && cat /proc/meminfo | head -20',
        json: {
            "action": "memory_info",
            "command": "free -h && cat /proc/meminfo | head -20",
            "description": "Display memory usage statistics and detailed memory information",
            "category": "system",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "1-3 seconds"
        }
    },
    'process-list': {
        title: 'Running Processes',
        description: 'List currently running processes sorted by resource usage.',
        command: 'ps aux --sort=-%cpu | head -20',
        json: {
            "action": "process_list",
            "command": "ps aux --sort=-%cpu | head -20",
            "description": "List top 20 processes sorted by CPU usage",
            "category": "system",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "2-5 seconds"
        }
    },
    'system-reboot': {
        title: 'System Reboot',
        description: 'Restart the server (WARNING: This will disconnect all users).',
        command: 'sudo reboot',
        json: {
            "action": "system_reboot",
            "command": "sudo reboot",
            "description": "Restart the server immediately",
            "category": "system",
            "risk_level": "high",
            "requires_sudo": true,
            "estimated_duration": "2-5 minutes",
            "warning": "This will disconnect all users and restart all services"
        }
    },
    'service-status': {
        title: 'Service Status',
        description: 'Check the status of critical system services.',
        command: 'systemctl status nginx apache2 ssh mysql --no-pager',
        json: {
            "action": "service_status",
            "command": "systemctl status nginx apache2 ssh mysql --no-pager",
            "description": "Check status of web server, SSH, and database services",
            "category": "services",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "2-5 seconds"
        }
    },
    'nginx-restart': {
        title: 'Restart Nginx',
        description: 'Restart the Nginx web server.',
        command: 'sudo systemctl restart nginx && systemctl status nginx --no-pager',
        json: {
            "action": "nginx_restart",
            "command": "sudo systemctl restart nginx && systemctl status nginx --no-pager",
            "description": "Restart Nginx web server and check its status",
            "category": "services",
            "risk_level": "medium",
            "requires_sudo": true,
            "estimated_duration": "5-10 seconds"
        }
    },
    'apache-restart': {
        title: 'Restart Apache',
        description: 'Restart the Apache web server.',
        command: 'sudo systemctl restart apache2 && systemctl status apache2 --no-pager',
        json: {
            "action": "apache_restart",
            "command": "sudo systemctl restart apache2 && systemctl status apache2 --no-pager",
            "description": "Restart Apache web server and check its status",
            "category": "services",
            "risk_level": "medium",
            "requires_sudo": true,
            "estimated_duration": "5-10 seconds"
        }
    },
    'ssh-restart': {
        title: 'Restart SSH Service',
        description: 'Restart the SSH daemon (WARNING: May disconnect current session).',
        command: 'sudo systemctl restart ssh && systemctl status ssh --no-pager',
        json: {
            "action": "ssh_restart",
            "command": "sudo systemctl restart ssh && systemctl status ssh --no-pager",
            "description": "Restart SSH daemon and check its status",
            "category": "services",
            "risk_level": "high",
            "requires_sudo": true,
            "estimated_duration": "5-10 seconds",
            "warning": "This may disconnect your current SSH session"
        }
    },
    'service-logs': {
        title: 'Service Logs',
        description: 'View recent logs from system services.',
        command: 'journalctl -u nginx -u apache2 -u ssh --since "1 hour ago" --no-pager | tail -50',
        json: {
            "action": "service_logs",
            "command": "journalctl -u nginx -u apache2 -u ssh --since '1 hour ago' --no-pager | tail -50",
            "description": "View last 50 log entries from web and SSH services in the past hour",
            "category": "services",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "3-10 seconds"
        }
    },
    'list-directory': {
        title: 'List Directory Contents',
        description: 'List files and directories with detailed information.',
        command: 'ls -la /home && ls -la /var/www',
        json: {
            "action": "list_directory",
            "command": "ls -la /home && ls -la /var/www",
            "description": "List contents of home and web directories with permissions",
            "category": "files",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "1-3 seconds"
        }
    },
    'backup-files': {
        title: 'Backup Important Files',
        description: 'Create backups of critical configuration files.',
        command: 'tar -czf /tmp/config-backup-$(date +%Y%m%d).tar.gz /etc/nginx /etc/apache2 /etc/ssh 2>/dev/null && ls -la /tmp/*backup*',
        json: {
            "action": "backup_files",
            "command": "tar -czf /tmp/config-backup-$(date +%Y%m%d).tar.gz /etc/nginx /etc/apache2 /etc/ssh 2>/dev/null && ls -la /tmp/*backup*",
            "description": "Create compressed backup of web server and SSH configuration files",
            "category": "files",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "5-15 seconds"
        }
    },
    'find-files': {
        title: 'Find Large Files',
        description: 'Find large files that may be consuming disk space.',
        command: 'find /var/log -type f -size +10M 2>/dev/null | head -10',
        json: {
            "action": "find_files",
            "command": "find /var/log -type f -size +10M 2>/dev/null | head -10",
            "description": "Find files larger than 10MB in log directories",
            "category": "files",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "5-15 seconds"
        }
    },
    'cleanup-temp': {
        title: 'Cleanup Temporary Files',
        description: 'Remove temporary files and clear caches.',
        command: 'sudo rm -rf /tmp/* && sudo apt-get clean && df -h /tmp',
        json: {
            "action": "cleanup_temp",
            "command": "sudo rm -rf /tmp/* && sudo apt-get clean && df -h /tmp",
            "description": "Remove temporary files and clean package cache",
            "category": "files",
            "risk_level": "medium",
            "requires_sudo": true,
            "estimated_duration": "10-30 seconds"
        }
    },
    'file-permissions': {
        title: 'Fix File Permissions',
        description: 'Reset file permissions for web directories.',
        command: 'sudo chown -R www-data:www-data /var/www && sudo chmod -R 755 /var/www',
        json: {
            "action": "file_permissions",
            "command": "sudo chown -R www-data:www-data /var/www && sudo chmod -R 755 /var/www",
            "description": "Set correct ownership and permissions for web directory",
            "category": "files",
            "risk_level": "medium",
            "requires_sudo": true,
            "estimated_duration": "5-15 seconds"
        }
    },
    'network-status': {
        title: 'Network Status',
        description: 'Check network interfaces and connectivity.',
        command: 'ip addr show && netstat -tuln | head -20',
        json: {
            "action": "network_status",
            "command": "ip addr show && netstat -tuln | head -20",
            "description": "Display network interfaces and listening ports",
            "category": "network",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "2-5 seconds"
        }
    },
    'ping-test': {
        title: 'Network Connectivity Test',
        description: 'Test connectivity to external servers.',
        command: 'ping -c 4 google.com && ping -c 4 8.8.8.8',
        json: {
            "action": "ping_test",
            "command": "ping -c 4 google.com && ping -c 4 8.8.8.8",
            "description": "Test connectivity to Google DNS and domain resolution",
            "category": "network",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "8-12 seconds"
        }
    },
    'port-scan': {
        title: 'Port Scan',
        description: 'Scan for open ports on the local system.',
        command: 'nmap -sT localhost 2>/dev/null || netstat -tuln | grep LISTEN',
        json: {
            "action": "port_scan",
            "command": "nmap -sT localhost 2>/dev/null || netstat -tuln | grep LISTEN",
            "description": "Scan for open ports on localhost",
            "category": "network",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "10-30 seconds"
        }
    },
    'firewall-status': {
        title: 'Firewall Status',
        description: 'Check firewall configuration and rules.',
        command: 'sudo ufw status verbose || sudo iptables -L -n | head -20',
        json: {
            "action": "firewall_status",
            "command": "sudo ufw status verbose || sudo iptables -L -n | head -20",
            "description": "Display firewall status and rules",
            "category": "network",
            "risk_level": "low",
            "requires_sudo": true,
            "estimated_duration": "2-5 seconds"
        }
    },
    'flush-dns': {
        title: 'Flush DNS Cache',
        description: 'Clear DNS resolver cache.',
        command: 'sudo systemctl restart systemd-resolved && systemctl status systemd-resolved --no-pager',
        json: {
            "action": "flush_dns",
            "command": "sudo systemctl restart systemd-resolved && systemctl status systemd-resolved --no-pager",
            "description": "Restart DNS resolver service to flush cache",
            "category": "network",
            "risk_level": "medium",
            "requires_sudo": true,
            "estimated_duration": "5-10 seconds"
        }
    },
    'db-status': {
        title: 'Database Status',
        description: 'Check database server status and connections.',
        command: 'systemctl status mysql --no-pager && mysql -e "SHOW PROCESSLIST;" 2>/dev/null || echo "MySQL not accessible"',
        json: {
            "action": "db_status",
            "command": "systemctl status mysql --no-pager && mysql -e 'SHOW PROCESSLIST;' 2>/dev/null || echo 'MySQL not accessible'",
            "description": "Check MySQL service status and active connections",
            "category": "database",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "2-5 seconds"
        }
    },
    'db-backup': {
        title: 'Create Database Backup',
        description: 'Create a backup of all databases.',
        command: 'mysqldump --all-databases --single-transaction > /tmp/db-backup-$(date +%Y%m%d).sql && ls -la /tmp/db-backup*',
        json: {
            "action": "db_backup",
            "command": "mysqldump --all-databases --single-transaction > /tmp/db-backup-$(date +%Y%m%d).sql && ls -la /tmp/db-backup*",
            "description": "Create complete database backup with timestamp",
            "category": "database",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "30-120 seconds"
        }
    },
    'db-restore': {
        title: 'Restore Database',
        description: 'Restore database from the most recent backup.',
        command: 'ls -la /tmp/db-backup* | tail -1',
        json: {
            "action": "db_restore",
            "command": "mysql < $(ls -t /tmp/db-backup*.sql | head -1) && echo 'Database restored from latest backup'",
            "description": "Restore database from most recent backup file",
            "category": "database",
            "risk_level": "high",
            "requires_sudo": false,
            "estimated_duration": "60-300 seconds",
            "warning": "This will overwrite current database data"
        }
    },
    'db-optimize': {
        title: 'Optimize Database',
        description: 'Optimize and analyze database tables.',
        command: 'mysqlcheck --optimize --all-databases 2>/dev/null || echo "MySQL optimization requires credentials"',
        json: {
            "action": "db_optimize",
            "command": "mysqlcheck --optimize --all-databases 2>/dev/null || echo 'MySQL optimization requires credentials'",
            "description": "Optimize all database tables for better performance",
            "category": "database",
            "risk_level": "medium",
            "requires_sudo": false,
            "estimated_duration": "60-300 seconds"
        }
    },
    'db-repair': {
        title: 'Repair Database',
        description: 'Check and repair database tables.',
        command: 'mysqlcheck --repair --all-databases 2>/dev/null || echo "MySQL repair requires credentials"',
        json: {
            "action": "db_repair",
            "command": "mysqlcheck --repair --all-databases 2>/dev/null || echo 'MySQL repair requires credentials'",
            "description": "Check and repair corrupted database tables",
            "category": "database",
            "risk_level": "medium",
            "requires_sudo": false,
            "estimated_duration": "30-180 seconds"
        }
    },
    'app-status': {
        title: 'Application Status',
        description: 'Check the status of deployed applications.',
        command: 'ps aux | grep -E "(node|python|php|ruby)" | grep -v grep | head -10',
        json: {
            "action": "app_status",
            "command": "ps aux | grep -E '(node|python|php|ruby)' | grep -v grep | head -10",
            "description": "List running application processes",
            "category": "application",
            "risk_level": "low",
            "requires_sudo": false,
            "estimated_duration": "2-5 seconds"
        }
    },
    'deploy-app': {
        title: 'Deploy Application',
        description: 'Deploy the latest version of the application.',
        command: 'git pull origin main && sudo systemctl restart nginx',
        json: {
            "action": "deploy_app",
            "command": "cd /var/www/html && git pull origin main && sudo systemctl restart nginx",
            "description": "Pull latest code and restart web server",
            "category": "application",
            "risk_level": "medium",
            "requires_sudo": true,
            "estimated_duration": "15-60 seconds"
        }
    },
    'update-app': {
        title: 'Update Application Dependencies',
        description: 'Update application dependencies and packages.',
        command: 'npm update && composer update 2>/dev/null || echo "Package managers not found"',
        json: {
            "action": "update_app",
            "command": "npm update && composer update 2>/dev/null || echo 'Package managers not found'",
            "description": "Update Node.js and PHP dependencies",
            "category": "application",
            "risk_level": "medium",
            "requires_sudo": false,
            "estimated_duration": "60-300 seconds"
        }
    },
    'clear-cache': {
        title: 'Clear Application Cache',
        description: 'Clear application and system caches.',
        command: 'sudo rm -rf /var/cache/* && echo "Cache cleared"',
        json: {
            "action": "clear_cache",
            "command": "sudo rm -rf /var/cache/* && echo 'Cache cleared'",
            "description": "Remove cached files to free up space",
            "category": "application",
            "risk_level": "medium",
            "requires_sudo": true,
            "estimated_duration": "10-30 seconds"
        }
    },
    'rollback-app': {
        title: 'Rollback Application',
        description: 'Rollback to the previous version of the application.',
        command: 'git log --oneline -5',
        json: {
            "action": "rollback_app",
            "command": "cd /var/www/html && git reset --hard HEAD~1 && sudo systemctl restart nginx",
            "description": "Rollback to previous commit and restart web server",
            "category": "application",
            "risk_level": "high",
            "requires_sudo": true,
            "estimated_duration": "10-30 seconds",
            "warning": "This will revert the application to the previous version"
        }
    }
};

let currentCommand = null;

document.addEventListener('authReady', () => {
    if (window.authService.isAuthenticated) {
        const user = window.authService.user;
        
        // Check user roles for admin access
        const customRoles = user['https://carsontkempf.github.io/roles'] || [];
        const auth0Roles = user['https://auth0.com/roles'] || [];
        const appMetadataRoles = user.app_metadata?.roles || [];
        const userMetadataRoles = user.user_metadata?.roles || [];
        
        const allRoles = [...customRoles, ...auth0Roles, ...appMetadataRoles, ...userMetadataRoles];
        
        const hasAdminRole = allRoles.includes('admin');
        const isSiteOwner = user.email === 'ctkfdp@umsystem.edu';
        
        if (hasAdminRole || isSiteOwner) {
            document.getElementById('controls-content-wrapper').style.display = 'block';
            loadServerStatus();
        } else {
            document.getElementById('controls-access-denied').style.display = 'block';
        }
    } else {
        document.getElementById('controls-access-denied').style.display = 'block';
    }
});

function showCommandModal(commandId) {
    const template = commandTemplates[commandId];
    if (!template) return;
    
    currentCommand = commandId;
    
    document.getElementById('modalTitle').textContent = template.title;
    
    // Enhanced description with better formatting
    const riskColor = {
        'low': '#27ae60',
        'medium': '#f39c12', 
        'high': '#e74c3c'
    }[template.json.risk_level] || '#95a5a6';
    
    document.getElementById('modalDescription').innerHTML = `
        <div style="margin-bottom: 20px;">
            <p style="margin-bottom: 10px;"><strong>📝 Description:</strong> ${template.description}</p>
            <p style="margin-bottom: 10px;"><strong>💻 Command:</strong> <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${template.command}</code></p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 15px 0;">
                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; border-left: 3px solid ${riskColor};">
                    <strong>🚨 Risk Level:</strong><br>
                    <span style="color: ${riskColor}; font-weight: bold;">${template.json.risk_level.toUpperCase()}</span>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; border-left: 3px solid #3498db;">
                    <strong>🔐 Sudo Required:</strong><br>
                    <span style="color: ${template.json.requires_sudo ? '#e74c3c' : '#27ae60'}; font-weight: bold;">${template.json.requires_sudo ? 'Yes' : 'No'}</span>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; border-left: 3px solid #9b59b6;">
                    <strong>⏱️ Duration:</strong><br>
                    <span style="color: #2c3e50; font-weight: bold;">${template.json.estimated_duration}</span>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 6px; border-left: 3px solid #34495e;">
                    <strong>📂 Category:</strong><br>
                    <span style="color: #2c3e50; font-weight: bold;">${template.json.category}</span>
                </div>
            </div>
            ${template.json.warning ? `<div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 6px; border: 1px solid #f5c6cb; margin-top: 15px;"><strong>⚠️ Warning:</strong> ${template.json.warning}</div>` : ''}
        </div>
    `;
    
    // Format JSON with syntax highlighting
    document.getElementById('jsonTemplate').textContent = JSON.stringify(template.json, null, 2);
    document.getElementById('commandModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('commandModal').style.display = 'none';
    currentCommand = null;
}

function executeCommand() {
    if (!currentCommand) return;
    
    const template = commandTemplates[currentCommand];
    if (template.json.warning) {
        if (!confirm(`⚠️ ${template.json.warning}\n\nAre you sure you want to proceed?`)) {
            return;
        }
    }
    
    // Show execution confirmation with JSON payload
    const confirmMessage = `🚀 Execute "${template.title}"?\n\nThis will run the following command:\n${template.command}\n\nRisk Level: ${template.json.risk_level.toUpperCase()}\nSudo Required: ${template.json.requires_sudo ? 'Yes' : 'No'}\nEstimated Duration: ${template.json.estimated_duration}`;
    
    if (confirm(confirmMessage)) {
        // In a real implementation, this would send the JSON payload to your server endpoint
        showExecutionResult(template);
    }
}

function showExecutionResult(template) {
    // Simulate command execution with realistic feedback
    const executionModal = document.createElement('div');
    executionModal.className = 'modal';
    executionModal.style.display = 'block';
    
    executionModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🚀 Executing: ${template.title}</h2>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div style="background: #2c3e50; color: #ecf0f1; padding: 20px; border-radius: 6px; font-family: monospace; margin-bottom: 15px;">
                    <div id="execution-log">
                        $ ${template.command}<br>
                        <span style="color: #f39c12;">Connecting to server...</span>
                    </div>
                </div>
                <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 6px; border: 1px solid #c3e6cb;">
                    <strong>📋 Command Payload Sent:</strong><br>
                    <pre style="margin: 10px 0; font-size: 12px;">${JSON.stringify(template.json, null, 2)}</pre>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(executionModal);
    
    // Simulate execution progress
    const log = executionModal.querySelector('#execution-log');
    setTimeout(() => {
        log.innerHTML += '<br><span style="color: #27ae60;">✅ Command executed successfully</span>';
        log.innerHTML += '<br><span style="color: #95a5a6;">Output would appear here in real implementation</span>';
        log.innerHTML += `<br><span style="color: #3498db;">Completed in ${template.json.estimated_duration}</span>`;
    }, 1500);
    
    closeModal();
}

function copyToClipboard() {
    if (!currentCommand) return;
    
    const template = commandTemplates[currentCommand];
    const jsonText = JSON.stringify(template.json, null, 2);
    
    navigator.clipboard.writeText(jsonText).then(() => {
        alert('JSON template copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = jsonText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('JSON template copied to clipboard!');
    });
}

function loadServerStatus() {
    // Simulate loading server status
    setTimeout(() => {
        document.getElementById('server-uptime').textContent = '15d 4h';
        document.getElementById('cpu-usage').textContent = '23%';
        document.getElementById('memory-usage').textContent = '64%';
        document.getElementById('disk-usage').textContent = '41%';
    }, 1000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('commandModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Handle escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
</script>