#!/usr/bin/env python3

"""
Main Python script to orchestrate Jekyll development.
Handles:
- Argument parsing (dev/prod/sync-env, --verbose)
- Displaying Git and Environment status
- Clearing conflicting ports with a progress bar
- Running the correct Jekyll command
- Syncing local .env to Netlify
"""

import subprocess
import signal
import os
import sys
import time
import argparse
from tqdm import tqdm
from colorama import init, Fore, Style

# Initialize colorama for cross-platform colors
init()

def get_git_branch():
    """Fetches the current git branch name."""
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            capture_output=True, text=True, check=True, encoding='utf-8'
        )
        return result.stdout.strip()
    except Exception:
        return "unknown"

def kill_processes_on_ports(verbose=False):
    """
    Kill any processes running on ports 4000 and 35729-35736.
    Shows a TQDM progress bar.
    """
    ports_to_kill = [4000] + list(range(35729, 35736))
    killed_any = False

    # Use tqdm for a clean progress bar, inspired by tqdm/tqdm
    # We only show the bar, no text output unless --verbose
    with tqdm(total=len(ports_to_kill),
              desc=f"{Style.BRIGHT}Clear Ports",
              unit="port",
              bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt}",
              ncols=80) as pbar:

        for port in ports_to_kill:
            pbar.update(1)
            try:
                # Use lsof to find the process ID (PID) on the port
                result = subprocess.run(
                    ['lsof', '-ti', f':{port}'], 
                    capture_output=True, text=True, encoding='utf-8'
                )

                if result.returncode == 0 and result.stdout.strip():
                    pids = result.stdout.strip().split('\n')
                    for pid in pids:
                        try:
                            os.kill(int(pid), signal.SIGTERM)
                            if verbose:
                                # This output only shows in verbose mode
                                print(f"\nKilled process {pid} on port {port}")
                            killed_any = True
                        except (ProcessLookupError, ValueError, PermissionError):
                            # Process might have already died
                            pass
            except Exception as e:
                if verbose:
                    print(f"\nError checking port {port}: {e}")

    if killed_any and verbose:
        print("Waited 1s for processes to terminate...")
        time.sleep(1)

def load_env_file():
    """Load environment variables from .env file"""
    env_vars = {}
    env_file = '.env'
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    # Remove quotes if present
                    value = value.strip().strip('"').strip("'")
                    env_vars[key.strip()] = value
    return env_vars

def run_jekyll(env_mode, verbose=False):
    """
    Starts the Jekyll server for 'dev' or runs a build for 'prod'.
    Manages console output based on 'verbose' flag.
    """
    env = os.environ.copy()
    
    # Load environment variables from .env file for development
    if env_mode == 'dev':
        env_vars = load_env_file()
        for key, value in env_vars.items():
            env[key] = value
            if verbose:
                print(f"[ENV] Set {key} = {value}")
    
    cmd = []

    # --- Configure DEV vs PROD ---
    if env_mode == 'dev':
        print(f"\n{Style.BRIGHT}Starting Jekyll server...{Style.RESET_ALL}")
        # As you noted, _config-dev.yml means development
        env['JEKYLL_ENV'] = 'development'
        cmd = [
            'bundle', 'exec', 'jekyll', 'serve',
            '--config', '_config-dev.yml',
            '--host', '0.0.0.0',
            '--port', '4000',
            '--livereload-port', '35730'
        ]
        if not verbose:
            cmd.append('--quiet') # Suppress Jekyll's own output

    elif env_mode == 'prod':
        print(f"\n{Style.BRIGHT}Starting Jekyll production build...{Style.RESET_ALL}")
        env['JEKYLL_ENV'] = 'production'
        # For GitHub Pages, you just 'build', not 'serve'
        cmd = [
            'bundle', 'exec', 'jekyll', 'build',
            '--config', '_config.yml,_config-dev.yml' # Example: use both, prod overrides dev
            # Or just: '--config', '_config.yml'
        ]

    # --- Run the Process ---
    try:
        # We use Popen so we can gracefully catch Ctrl+C
        process = subprocess.Popen(
            cmd, 
            env=env,
            # In verbose mode, let Jekyll print directly to our console
            # Otherwise, hide all its output
            stdout=None if verbose else subprocess.DEVNULL,
            stderr=None if verbose else subprocess.DEVNULL
        )

        if env_mode == 'prod':
            # Production build: Show a simple indeterminate progress bar
            with tqdm(total=0, desc=f"{Style.BRIGHT}Jekyll Prod", bar_format="{l_bar}{bar}") as pbar:
                while process.poll() is None:
                    pbar.update(1)
                    time.sleep(0.1)

            # Check if the build Succeeded or Failed
            if process.returncode == 0:
                print(f"\n{Fore.GREEN}{Style.BRIGHT}Success:{Style.RESET_ALL} Production site built.")
            else:
                print(f"\n{Fore.RED}{Style.BRIGHT}Failed:{Style.RESET_ALL} Production build failed. Run with --verbose for details.")

        else:
            # Development server: Print the URL and wait
            print(f"{Fore.GREEN}Server running at: {Style.BRIGHT}http://localhost:4000{Style.RESET_ALL}")
            print(f"{Style.DIM}(Press Ctrl+C to stop the server){Style.RESET_ALL}")
            process.wait()

    except KeyboardInterrupt:
        # This triggers when you press Ctrl+C
        print(f"\n\n{Fore.YELLOW}{Style.BRIGHT}Shutting down Jekyll server...{Style.RESET_ALL}")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        sys.exit(0)

def sync_netlify_env(verbose=False):
    """
    Syncs the local .env file with Netlify's production environment.
    """
    print(f"\n{Style.BRIGHT}Syncing Environment to Netlify...{Style.RESET_ALL}")

    # 1. Check for .env file
    if not os.path.exists('.env'):
        print(f"{Fore.RED}{Style.BRIGHT}Error:{Style.RESET_ALL} No .env file found.")
        print("Please create a .env file with your secrets.")
        sys.exit(1)

    # 2. Check login status
    try:
        status_result = subprocess.run(
            ['netlify', 'status'],
            capture_output=True, text=True, encoding='utf-8'
        )
        if "Not logged in" in status_result.stdout:
            print(f"{Fore.YELLOW}{Style.BRIGHT}You are not logged in.{Style.RESET_ALL}")
            print("Please run 'netlify login' in your terminal to authenticate.")
            sys.exit(1)

        if "No site linked" in status_result.stdout:
            print(f"{Fore.YELLOW}{Style.BRIGHT}This project is not linked to a Netlify site.{Style.RESET_ALL}")
            print("Please run 'netlify link' in your terminal to link this project.")
            sys.exit(1)

    except FileNotFoundError:
        print(f"{Fore.RED}{Style.BRIGHT}Error:{Style.RESET_ALL} 'netlify' command not found.")
        print("Please run 'npm install netlify-cli -g'")
        sys.exit(1)
    except Exception as e:
        print(f"{Fore.RED}{Style.BRIGHT}Error checking status:{Style.RESET_ALL} {e}")
        sys.exit(1)

    # 3. If logged in and linked, import env vars
    print("Logged in and site linked. Importing variables from .env...")
    try:
        # This is the core command:
        # netlify env:import .env
        import_cmd = ['netlify', 'env:import', '.env']

        # Run the command and stream output if verbose
        process = subprocess.Popen(
            import_cmd,
            stdout=subprocess.PIPE if not verbose else None,
            stderr=subprocess.PIPE if not verbose else None,
            text=True,
            encoding='utf-8'
        )

        stdout, stderr = process.communicate()

        if process.returncode == 0:
            print(f"{Fore.GREEN}{Style.BRIGHT}Success:{Style.RESET_ALL} Environment variables synced with Netlify.")
            if verbose and stdout:
                print(stdout)
        else:
            print(f"{Fore.RED}{Style.BRIGHT}Error:{Style.RESET_ALL} Failed to sync environment variables.")
            if not verbose:
                print("Run with --verbose for details.")
            if stderr:
                print(stderr)

    except Exception as e:
        print(f"{Fore.RED}{Style.BRIGHT}Error during import:{Style.RESET_ALL} {e}")
        sys.exit(1)

def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Jekyll development and build runner.")
    parser.add_argument(
        'environment',
        choices=['dev', 'prod', 'sync-env'],
        help="Environment to run: 'dev' (serve), 'prod' (build), or 'sync-env' (push .env to Netlify)"
    )
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help="Show all output from subprocesses for debugging"
    )
    args = parser.parse_args()

    # --- 1. Show Status ---
    branch = get_git_branch()
    # Handle 'sync-env' as its own environment
    if args.environment == 'sync-env':
        env_str = "SYNC"
        env_color = Fore.BLUE
    else:
        env_str = "DEV" if args.environment == 'dev' else "PROD"
        env_color = Fore.CYAN if args.environment == 'dev' else Fore.MAGENTA

    print(f"{Style.BRIGHT}Git Branch:{Style.RESET_ALL} {Fore.YELLOW}{branch}{Style.RESET_ALL}")
    print(f"{Style.BRIGHT}Environment:{Style.RESET_ALL} {env_color}{env_str}{Style.RESET_ALL}")

    # --- 2. Route to the correct function ---
    if args.environment == 'sync-env':
        sync_netlify_env(args.verbose)

    elif args.environment in ['dev', 'prod']:
        # --- 2a. Clear Ports (only for dev/prod) ---
        kill_processes_on_ports(args.verbose)
        print(f"{Fore.GREEN}{Style.BRIGHT}Success:{Style.RESET_ALL} Ports are clear.")

        # --- 2b. Run Jekyll (only for dev/prod) ---
        run_jekyll(args.environment, args.verbose)

if __name__ == "__main__":
    main()