#!/usr/bin/env python3
import subprocess
import signal
import os
import sys
import time

def kill_processes_on_ports():
    """Kill any processes running on ports 4000 and 35729-35735"""
    print("Checking for existing processes...")
    
    ports = [4000] + list(range(35729, 35736))
    killed_any = False
    
    for port in ports:
        try:
            # Find processes using the port
            result = subprocess.run(['lsof', '-ti', f':{port}'], 
                                  capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    try:
                        os.kill(int(pid), signal.SIGTERM)
                        print(f"Killed process {pid} on port {port}")
                        killed_any = True
                    except (ProcessLookupError, ValueError):
                        pass
        except Exception:
            pass
    
    if killed_any:
        print("Waiting for processes to terminate...")
        time.sleep(2)
    else:
        print("No conflicting processes found")

def start_jekyll():
    """Start the Jekyll server"""
    print("\nStarting Jekyll server...")
    
    # Set environment variables
    env = os.environ.copy()
    env['JEKYLL_ENV'] = 'production'
    
    # Jekyll command
    cmd = [
        'bundle', 'exec', 'jekyll', 'serve',
        '--config', '_config-dev.yml',
        '--host', '0.0.0.0',
        '--port', '4000',
        '--livereload-port', '35730',
        '--quiet'  # Suppress Jekyll's verbose output
    ]
    
    try:
        # Start Jekyll process and capture output initially
        process = subprocess.Popen(cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Show simple loading
        print("Initializing...")
        time.sleep(2)
        
        # Check if process started successfully
        if process.poll() is None:
            print("\nJekyll server started successfully!")
            print("Server running at: http://localhost:4000")
            print(f"PID: {process.pid}")
            print("\nPress Ctrl+C to stop the server\n")
            
            # Now let Jekyll output stream normally
            process.stdout.close()
            process.stderr.close()
            
            # Wait for the process to complete
            process.wait()
        else:
            # Process failed to start
            stdout, stderr = process.communicate()
            print(f"Error starting Jekyll:")
            if stderr:
                print(stderr)
            if stdout:
                print(stdout)
            sys.exit(1)
        
    except KeyboardInterrupt:
        print("\n\nShutting down Jekyll server...")
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        print("Server stopped successfully")
    except Exception as e:
        print(f"Error starting Jekyll: {e}")
        sys.exit(1)

def main():
    """Main function to orchestrate Jekyll startup"""
    print("Jekyll Server Launcher")
    print("=" * 40)
    
    # Step 1: Clean up existing processes
    kill_processes_on_ports()
    
    # Step 2: Start Jekyll
    start_jekyll()

if __name__ == "__main__":
    main()