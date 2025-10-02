#!/bin/bash

# Development Server Startup Script
# Automatically handles port conflicts and provides multiple startup options

set -e

# Default configuration
DEFAULT_PORT=4000
CONFIG_FILE="_config-dev.yml"
HOST="127.0.0.1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to find and kill Jekyll processes on a specific port
kill_jekyll_on_port() {
    local port=$1
    print_info "Checking for existing Jekyll processes on port $port..."
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        print_warning "Found processes using port $port:"
        for pid in $pids; do
            local process_info=$(ps -p $pid -o pid,comm,args --no-headers 2>/dev/null || echo "Process not found")
            echo "  PID $pid: $process_info"
            
            # Check if it's a Jekyll process
            if ps -p $pid -o comm --no-headers 2>/dev/null | grep -q "jekyll\|ruby"; then
                print_warning "Killing Jekyll process $pid..."
                kill $pid 2>/dev/null || true
                sleep 1
                
                # Force kill if still running
                if ps -p $pid >/dev/null 2>&1; then
                    print_warning "Force killing process $pid..."
                    kill -9 $pid 2>/dev/null || true
                fi
            else
                print_error "Non-Jekyll process $pid is using port $port. Please handle manually."
                return 1
            fi
        done
        
        # Wait a moment for processes to clean up
        sleep 2
        
        # Verify the port is now free
        if check_port $port; then
            print_error "Port $port is still in use after cleanup attempt."
            return 1
        else
            print_status "Port $port is now available."
        fi
    else
        print_status "Port $port is available."
    fi
    return 0
}

# Function to find an available port
find_available_port() {
    local start_port=$1
    local current_port=$start_port
    
    while [ $current_port -lt $((start_port + 100)) ]; do
        if ! check_port $current_port; then
            echo $current_port
            return 0
        fi
        current_port=$((current_port + 1))
    done
    
    print_error "Could not find an available port between $start_port and $((start_port + 100))"
    return 1
}

# Function to start Jekyll with automatic port handling
start_jekyll() {
    local port=$1
    local config=$2
    local auto_port=$3
    
    print_status "Starting Jekyll development server..."
    print_info "Port: $port"
    print_info "Config: $config"
    print_info "Host: $HOST"
    
    if [ "$auto_port" = "true" ]; then
        # Try to clean up the default port first
        if ! kill_jekyll_on_port $port; then
            # If cleanup failed, find an alternative port
            print_warning "Could not clean up port $port, finding alternative..."
            new_port=$(find_available_port $port)
            if [ $? -eq 0 ]; then
                port=$new_port
                print_status "Using alternative port: $port"
            else
                print_error "Could not find an available port."
                exit 1
            fi
        fi
    else
        # Manual mode - just try to clean up the specified port
        if ! kill_jekyll_on_port $port; then
            print_error "Could not clean up port $port. Use --auto-port to find an alternative."
            exit 1
        fi
    fi
    
    # Start Jekyll
    print_status "Launching Jekyll on http://$HOST:$port"
    echo
    echo "=========================================="
    echo "  Jekyll Development Server Starting"
    echo "  URL: http://$HOST:$port"
    echo "  Config: $config"
    echo "  Press Ctrl+C to stop"
    echo "=========================================="
    echo
    
    bundle exec jekyll serve --config "$config" --host "$HOST" --port "$port"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Start Jekyll development server with automatic port conflict resolution."
    echo
    echo "OPTIONS:"
    echo "  -p, --port PORT       Specify port (default: 4000)"
    echo "  -c, --config FILE     Specify config file (default: _config-dev.yml)"
    echo "  -H, --host HOST       Specify host (default: 127.0.0.1)"
    echo "  -a, --auto-port       Automatically find available port if default is busy"
    echo "  -k, --kill-only       Just kill existing Jekyll processes and exit"
    echo "  -s, --status          Show current port status and exit"
    echo "  -h, --help            Show this help message"
    echo
    echo "EXAMPLES:"
    echo "  $0                    # Start with defaults"
    echo "  $0 -p 4001            # Start on port 4001"
    echo "  $0 --auto-port        # Auto-find available port"
    echo "  $0 --kill-only        # Just cleanup existing processes"
    echo "  $0 --status           # Check what's running on port 4000"
}

# Function to show status
show_status() {
    local port=$1
    print_info "Checking status of port $port..."
    
    if check_port $port; then
        print_warning "Port $port is in use:"
        local pids=$(lsof -ti:$port 2>/dev/null)
        for pid in $pids; do
            local process_info=$(ps -p $pid -o pid,comm,args --no-headers 2>/dev/null || echo "Process not found")
            echo "  PID $pid: $process_info"
        done
    else
        print_status "Port $port is available."
    fi
}

# Parse command line arguments
PORT=$DEFAULT_PORT
AUTO_PORT=false
KILL_ONLY=false
STATUS_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -H|--host)
            HOST="$2"
            shift 2
            ;;
        -a|--auto-port)
            AUTO_PORT=true
            shift
            ;;
        -k|--kill-only)
            KILL_ONLY=true
            shift
            ;;
        -s|--status)
            STATUS_ONLY=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate port number
if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1024 ] || [ "$PORT" -gt 65535 ]; then
    print_error "Invalid port number: $PORT (must be between 1024-65535)"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "Config file not found: $CONFIG_FILE"
    exit 1
fi

# Execute based on mode
if [ "$STATUS_ONLY" = "true" ]; then
    show_status $PORT
elif [ "$KILL_ONLY" = "true" ]; then
    print_status "Cleaning up Jekyll processes on port $PORT..."
    kill_jekyll_on_port $PORT
    print_status "Cleanup complete."
else
    start_jekyll $PORT $CONFIG_FILE $AUTO_PORT
fi