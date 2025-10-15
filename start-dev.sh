#!/bin/bash
#
# start-dev.sh - Start Development Environment
#
# This script starts both the Jekyll frontend and Flask backend for the code comprehension project.
# It handles port cleanup, SSH connection to backend server, and parallel execution.
#
# Usage:
#   ./start-dev.sh [options]
#
# Options:
#   --frontend-only    Start only the Jekyll frontend
#   --backend-only     Start only the Flask backend (via SSH)
#   --no-ssh          Skip backend SSH connection (for local backend development)
#   --frontend-port    Frontend port (default: 4000)
#   --backend-port     Backend port (default: 5000)
#   --ssh-user         SSH username (default: ctkfdp)
#   --ssh-host         SSH hostname (default: rs8gz564.managed.mst.edu)
#   --help             Show this help message
#
# Examples:
#   ./start-dev.sh                              # Start both frontend and backend
#   ./start-dev.sh --frontend-only              # Start only frontend
#   ./start-dev.sh --backend-only               # Start only backend via SSH
#   ./start-dev.sh --no-ssh                     # Start frontend, skip backend SSH
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
FRONTEND_PORT=4000
BACKEND_PORT=5000
SSH_USER="ctkfdp"
SSH_HOST="umsystem.edu"
BACKEND_PATH="~/Error-Annotater"
START_FRONTEND=true
START_BACKEND=true
USE_SSH=true

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to show help
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --frontend-only       Start only the Jekyll frontend"
    echo "  --backend-only        Start only the Flask backend (via SSH)"
    echo "  --no-ssh             Skip backend SSH connection"
    echo "  --frontend-port PORT Frontend port (default: 4000)"
    echo "  --backend-port PORT  Backend port (default: 5000)"
    echo "  --ssh-user USER      SSH username (default: ctkfdp)"
    echo "  --ssh-host HOST      SSH hostname (default: rs8gz564.managed.mst.edu)"
    echo "  --ssh-test           Test SSH connection and diagnose issues"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                              # Start both frontend and backend"
    echo "  $0 --frontend-only              # Start only frontend"
    echo "  $0 --backend-only               # Start only backend via SSH"
    echo "  $0 --no-ssh                     # Start frontend, skip backend SSH"
    echo "  $0 --ssh-test                   # Test and diagnose SSH connection"
}

# Function to diagnose SSH issues
diagnose_ssh() {
    local user=$1
    local host=$2
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}SSH Connection Diagnostics${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Check if hostname resolves
    echo -e "${YELLOW}1. Testing DNS resolution for $host...${NC}"
    if nslookup "$host" >/dev/null 2>&1; then
        local ip=$(nslookup "$host" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
        echo -e "${GREEN}   ✓ Hostname resolves to: $ip${NC}"
    else
        echo -e "${RED}   ✗ Hostname does not resolve${NC}"
        echo -e "${YELLOW}   Trying alternative formats...${NC}"
        
        # Try different hostname formats
        local base_host=$(echo "$host" | cut -d. -f1)
        local alternatives=("$base_host.mst.edu" "$base_host.campus.mst.edu" "$base_host.cs.mst.edu" "$base_host")
        
        for alt in "${alternatives[@]}"; do
            echo -e "${CYAN}   Testing: $alt${NC}"
            if nslookup "$alt" >/dev/null 2>&1; then
                local alt_ip=$(nslookup "$alt" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
                echo -e "${GREEN}   ✓ Alternative hostname found: $alt ($alt_ip)${NC}"
                echo -e "${YELLOW}   Consider using: --ssh-host $alt${NC}"
                break
            fi
        done
        
        echo -e "${RED}   No working hostname found${NC}"
        echo -e "${YELLOW}   Possible issues:${NC}"
        echo -e "${YELLOW}   - Server is down or decommissioned${NC}"
        echo -e "${YELLOW}   - Hostname has changed${NC}"
        echo -e "${YELLOW}   - You're not on the MST network (try VPN)${NC}"
        return 1
    fi
    
    # Check if port 22 is open
    echo -e "${YELLOW}2. Testing SSH port connectivity...${NC}"
    if timeout 10 bash -c "</dev/tcp/$host/22" 2>/dev/null; then
        echo -e "${GREEN}   ✓ Port 22 is open${NC}"
    else
        echo -e "${RED}   ✗ Port 22 is not accessible${NC}"
        echo -e "${YELLOW}   This could mean:${NC}"
        echo -e "${YELLOW}   - SSH service is down${NC}"
        echo -e "${YELLOW}   - Firewall is blocking connections${NC}"
        echo -e "${YELLOW}   - Server is not responding${NC}"
        return 1
    fi
    
    # Check SSH keys
    echo -e "${YELLOW}3. Checking SSH key setup...${NC}"
    if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/id_ed25519 ] || [ -f ~/.ssh/id_ecdsa ]; then
        echo -e "${GREEN}   ✓ SSH keys found${NC}"
        ls -la ~/.ssh/id_* 2>/dev/null | while read line; do
            echo -e "${CYAN}   $line${NC}"
        done
    else
        echo -e "${RED}   ✗ No SSH keys found${NC}"
        echo -e "${YELLOW}   Generate keys with: ssh-keygen -t ed25519${NC}"
        return 1
    fi
    
    # Test authentication
    echo -e "${YELLOW}4. Testing SSH authentication...${NC}"
    ssh -o ConnectTimeout=10 -o BatchMode=yes -o PasswordAuthentication=no "$user@$host" exit 2>/dev/null
    local ssh_result=$?
    
    case $ssh_result in
        0)
            echo -e "${GREEN}   ✓ SSH authentication successful${NC}"
            return 0
            ;;
        255)
            echo -e "${RED}   ✗ SSH connection failed${NC}"
            echo -e "${YELLOW}   Try verbose mode: ssh -v $user@$host${NC}"
            ;;
        *)
            echo -e "${RED}   ✗ SSH authentication failed (exit code: $ssh_result)${NC}"
            echo -e "${YELLOW}   This usually means:${NC}"
            echo -e "${YELLOW}   - SSH key is not authorized on the server${NC}"
            echo -e "${YELLOW}   - Wrong username${NC}"
            echo -e "${YELLOW}   - Key permissions are wrong${NC}"
            ;;
    esac
    
    echo -e "${YELLOW}5. SSH troubleshooting commands:${NC}"
    echo -e "${CYAN}   # Test connection with verbose output:${NC}"
    echo -e "${CYAN}   ssh -v $user@$host${NC}"
    echo -e "${CYAN}   # Copy SSH key to server:${NC}"
    echo -e "${CYAN}   ssh-copy-id $user@$host${NC}"
    echo -e "${CYAN}   # Check key permissions:${NC}"
    echo -e "${CYAN}   chmod 600 ~/.ssh/id_*${NC}"
    echo -e "${CYAN}   chmod 644 ~/.ssh/*.pub${NC}"
    echo -e "${CYAN}   chmod 700 ~/.ssh${NC}"
    
    return 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --frontend-only)
            START_BACKEND=false
            shift
            ;;
        --backend-only)
            START_FRONTEND=false
            shift
            ;;
        --no-ssh)
            USE_SSH=false
            shift
            ;;
        --frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        --frontend-port=*)
            FRONTEND_PORT="${1#*=}"
            shift
            ;;
        --backend-port)
            BACKEND_PORT="$2"
            shift 2
            ;;
        --backend-port=*)
            BACKEND_PORT="${1#*=}"
            shift
            ;;
        --ssh-user)
            SSH_USER="$2"
            shift 2
            ;;
        --ssh-user=*)
            SSH_USER="${1#*=}"
            shift
            ;;
        --ssh-host)
            SSH_HOST="$2"
            shift 2
            ;;
        --ssh-host=*)
            SSH_HOST="${1#*=}"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        --ssh-test)
            echo -e "${BLUE}========================================${NC}"
            echo -e "${BLUE}SSH Connection Test Mode${NC}"
            echo -e "${BLUE}========================================${NC}"
            diagnose_ssh "$SSH_USER" "$SSH_HOST"
            exit $?
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to kill processes on a port
kill_port() {
    local port=$1
    local description=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}Killing processes using port $port ($description)...${NC}"
        local pids=$(lsof -ti :$port 2>/dev/null || echo "")
        if [ -n "$pids" ]; then
            for pid in $pids; do
                echo -e "${YELLOW}  Killing PID $pid${NC}"
                kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
            done
            sleep 2
            
            # Check if port is now free
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                echo -e "${RED}Warning: Failed to completely free port $port${NC}"
                # Force kill remaining processes
                local remaining_pids=$(lsof -ti :$port 2>/dev/null || echo "")
                if [ -n "$remaining_pids" ]; then
                    for pid in $remaining_pids; do
                        echo -e "${YELLOW}  Force killing PID $pid${NC}"
                        kill -9 $pid 2>/dev/null || true
                    done
                    sleep 1
                fi
            else
                echo -e "${GREEN}  Port $port is now available${NC}"
            fi
        fi
    else
        echo -e "${GREEN}Port $port is already available${NC}"
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Starting Jekyll Frontend${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Check if bundle is available
    if ! command -v bundle &> /dev/null; then
        echo -e "${RED}Error: bundle command not found${NC}"
        echo "Please install bundler: gem install bundler"
        return 1
    fi
    
    # Check if Jekyll is installed
    if ! bundle exec jekyll --version &> /dev/null; then
        echo -e "${YELLOW}Installing Jekyll dependencies...${NC}"
        bundle install
    fi
    
    # Kill any processes using the frontend port
    kill_port $FRONTEND_PORT "Jekyll frontend"
    
    echo -e "${GREEN}Starting Jekyll server on port $FRONTEND_PORT...${NC}"
    echo -e "${CYAN}Frontend will be available at: http://localhost:$FRONTEND_PORT${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    # Start Jekyll with production environment
    JEKYLL_ENV=production bundle exec jekyll serve --config _config-dev.yml --port $FRONTEND_PORT --host 0.0.0.0
}

# Function to start backend via SSH
start_backend_ssh() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Starting Flask Backend via SSH${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Test SSH connection first
    echo -e "${YELLOW}Testing SSH connection to $SSH_USER@$SSH_HOST...${NC}"
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" exit 2>/dev/null; then
        echo -e "${RED}Error: Cannot connect to $SSH_USER@$SSH_HOST${NC}"
        echo ""
        
        # Run comprehensive diagnostics
        if ! diagnose_ssh "$SSH_USER" "$SSH_HOST"; then
            echo ""
            echo -e "${RED}SSH connection failed. Cannot start backend.${NC}"
            echo -e "${YELLOW}Fix the SSH issues above and try again.${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}SSH connection successful${NC}"
    
    # Kill any processes using the backend port on remote server
    echo -e "${YELLOW}Cleaning up backend port $BACKEND_PORT on remote server...${NC}"
    ssh "$SSH_USER@$SSH_HOST" "
        if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo 'Killing processes on port $BACKEND_PORT...'
            lsof -ti :$BACKEND_PORT 2>/dev/null | xargs -r kill -9 2>/dev/null || true
            sleep 2
        fi
        echo 'Port $BACKEND_PORT is ready'
    "
    
    echo -e "${GREEN}Starting Flask backend server...${NC}"
    echo -e "${CYAN}Backend will be available at: http://$SSH_HOST:$BACKEND_PORT${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    # Start the backend server via SSH
    ssh -t "$SSH_USER@$SSH_HOST" "cd $BACKEND_PATH && ./run-backend.sh --host 0.0.0.0 --port $BACKEND_PORT"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Shutting down development environment...${NC}"
    echo -e "${YELLOW}========================================${NC}"
    
    # Kill all child processes
    if [ -n "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}Stopping frontend server (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
        wait $FRONTEND_PID 2>/dev/null || true
    fi
    
    if [ -n "$BACKEND_PID" ]; then
        echo -e "${YELLOW}Stopping backend server (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    # Clean up ports
    if $START_FRONTEND; then
        kill_port $FRONTEND_PORT "Jekyll cleanup"
    fi
    
    echo -e "${GREEN}Development environment stopped${NC}"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Main execution
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Code Comprehension Development Environment${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${CYAN}Frontend Port: $FRONTEND_PORT${NC}"
echo -e "${CYAN}Backend Port:  $BACKEND_PORT${NC}"
echo -e "${CYAN}SSH Target:    $SSH_USER@$SSH_HOST${NC}"
echo -e "${CYAN}Backend Path:  $BACKEND_PATH${NC}"
echo ""

# Check what we're starting
if $START_FRONTEND && $START_BACKEND && $USE_SSH; then
    echo -e "${YELLOW}Starting both frontend and backend (via SSH)...${NC}"
elif $START_FRONTEND && ! $START_BACKEND; then
    echo -e "${YELLOW}Starting frontend only...${NC}"
elif ! $START_FRONTEND && $START_BACKEND && $USE_SSH; then
    echo -e "${YELLOW}Starting backend only (via SSH)...${NC}"
elif $START_FRONTEND && $START_BACKEND && ! $USE_SSH; then
    echo -e "${YELLOW}Starting frontend only (backend SSH disabled)...${NC}"
    START_BACKEND=false
fi

echo ""

# Start services based on configuration
if $START_FRONTEND && $START_BACKEND && $USE_SSH; then
    # Start both frontend and backend in parallel
    echo -e "${GREEN}Starting services in parallel...${NC}"
    echo ""
    
    # Start backend in background
    start_backend_ssh &
    BACKEND_PID=$!
    
    # Give backend a moment to start
    sleep 3
    
    # Start frontend in foreground
    start_frontend
    
elif $START_FRONTEND && ! $START_BACKEND; then
    # Frontend only
    start_frontend
    
elif ! $START_FRONTEND && $START_BACKEND && $USE_SSH; then
    # Backend only
    start_backend_ssh
    
else
    echo -e "${RED}Invalid configuration${NC}"
    show_help
    exit 1
fi

# Wait for background processes
wait