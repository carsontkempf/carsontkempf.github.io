import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from webdriver_manager.chrome import ChromeDriverManager # Import webdriver-manager
import time
import subprocess
import os
import signal
from pathlib import Path
import psutil
import logging
import threading
import requests # For checking server readiness
from requests.exceptions import ConnectionError
import sys

# --- Configuration ---
ENABLE_VERBOSE_DEBUG_LOGGING = False # Set to True to see detailed print statements

# Configure logging levels for urllib3 (used by requests)
logging.getLogger("urllib3.connectionpool").setLevel(logging.WARNING)

# Paths and URLs
CHROME_DRIVER_PATH = '/usr/local/bin/chromedriver' # Adjust if necessary
BASE_APP_DIRECTORY = Path(__file__).resolve().parent.parent
JEKYLL_SERVER_URL = 'http://localhost:4000'
LOGIN_PAGE_URL = f'{JEKYLL_SERVER_URL}/login/' # Used by jekyll_server readiness check
ERROR_LOGGER_PORT = 3001
JEKYLL_PORT = 4000

# --- Helper Functions ---

def kill_process_on_port(port: int):
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            for conn in proc.net_connections(kind='inet'):
                if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
                    if ENABLE_VERBOSE_DEBUG_LOGGING:
                        print(f"--- Found process {proc.info['name']} (PID: {proc.info['pid']}) listening on port {port}. Terminating. ---", flush=True)
                    try:
                        process_to_kill = psutil.Process(proc.info['pid'])
                        process_to_kill.terminate()
                        process_to_kill.wait(timeout=3)
                    except psutil.NoSuchProcess:
                        pass # Process already terminated
                    except psutil.TimeoutExpired:
                        if ENABLE_VERBOSE_DEBUG_LOGGING:
                            print(f"--- Process {proc.info['pid']} did not terminate gracefully, killing. ---", flush=True)
                        process_to_kill.kill()
                        process_to_kill.wait(timeout=3)
                    except Exception as e:
                        if ENABLE_VERBOSE_DEBUG_LOGGING:
                            print(f"--- Error terminating process {proc.info['pid']} on port {port}: {e} ---", flush=True)

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass # Process might have died or access issues, continue

def stream_output_thread_target(pipe, prefix, collection_list=None, ready_event=None, ready_message_substring=None):
    try:
        for line_str_raw in iter(pipe.readline, ''): # Read lines as text
            line_str = line_str_raw.strip()
            if collection_list is not None:
                collection_list.append(line_str)
            if ENABLE_VERBOSE_DEBUG_LOGGING:
                print(f"{prefix}{line_str}", flush=True)
            if ready_event and not ready_event.is_set() and ready_message_substring and ready_message_substring in line_str:
                ready_event.set()
                if ENABLE_VERBOSE_DEBUG_LOGGING:
                    print(f"--- {prefix}Ready message '{ready_message_substring}' detected. Event set. ---", flush=True)
    except ValueError: # Pipe closed
        pass
    except Exception as e:
        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print(f"{prefix}Error streaming output: {e}", flush=True)
    finally:
        if hasattr(pipe, 'close') and not pipe.closed:
            pipe.close()

# --- Pytest Fixtures ---

@pytest.fixture(scope="session")
def app_directory():
    return BASE_APP_DIRECTORY

@pytest.fixture(scope="session")
def jekyll_server(app_directory):
    kill_process_on_port(JEKYLL_PORT)
    command = ["rbenv", "exec", "bundle", "exec", "jekyll", "serve", "--port", str(JEKYLL_PORT), "--host", "localhost"]
    process = None
    stdout_thread = None
    stderr_thread = None
    jekyll_env = os.environ.copy()
    jekyll_env["JEKYLL_ENV"] = "production"

    if ENABLE_VERBOSE_DEBUG_LOGGING:
        print(f"\n--- [Jekyll Fixture] Attempting to start Jekyll server with command: {' '.join(command)} in {app_directory} ---", flush=True)

    try:
        process = subprocess.Popen(
            command,
            cwd=app_directory,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid, # Create a new process group
            env=jekyll_env,
            text=True, # Open streams in text mode
            bufsize=1, # Enable line buffering for text mode
            errors='replace' # How to handle decoding errors
        )

        jekyll_stdout_lines = []
        jekyll_stderr_lines = []
        
        stdout_thread = threading.Thread(target=stream_output_thread_target, args=(process.stdout, "JEKYLL_STDOUT: ", jekyll_stdout_lines), daemon=True)
        stderr_thread = threading.Thread(target=stream_output_thread_target, args=(process.stderr, "JEKYLL_STDERR: ", jekyll_stderr_lines), daemon=True)
        stdout_thread.start()
        stderr_thread.start()

        # Wait for Jekyll server to be ready
        max_retries = 15
        retry_delay = 2
        server_ready = False
        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print(f"--- [Jekyll Fixture] Waiting for Jekyll server to be ready at {LOGIN_PAGE_URL} ---", flush=True)
        for i in range(max_retries):
            try:
                response = requests.get(LOGIN_PAGE_URL, timeout=2) # LOGIN_PAGE_URL is used here
                if response.status_code == 200:
                    server_ready = True
                    if ENABLE_VERBOSE_DEBUG_LOGGING:
                        print(f"--- [Jekyll Fixture] Jekyll server is ready (attempt {i+1}). ---", flush=True)
                    break
            except ConnectionError:
                if ENABLE_VERBOSE_DEBUG_LOGGING:
                    print(f"--- [Jekyll Fixture] Jekyll server not ready yet (attempt {i+1}), retrying in {retry_delay}s... ---", flush=True)
                time.sleep(retry_delay)
            if process.poll() is not None: # Check if server died
                break
        
        if not server_ready or process.poll() is not None:
            error_message = f"Jekyll server failed to start or become ready. Return code: {process.poll()}\n"
            error_message += "STDOUT:\n" + "\n".join(jekyll_stdout_lines) # Full STDOUT
            error_message += "\nSTDERR:\n" + "\n".join(jekyll_stderr_lines) # Full STDERR
            print(f"--- [Jekyll Fixture] {error_message} ---", flush=True) # Always print critical failure
            raise RuntimeError(error_message)

        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print("--- [Jekyll Fixture] Jekyll server presumed started. Yielding process. ---", flush=True)
        yield process

    finally:
        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print("--- [Jekyll Fixture] Test session finished. Cleaning up Jekyll server. ---", flush=True)
        if process and process.poll() is None:
            try:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                process.wait(timeout=5)
            except (ProcessLookupError, subprocess.TimeoutExpired, OSError): # OSError for when process group is already gone
                if process.poll() is None: # If still running, force kill
                    try:
                        os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                        process.wait(timeout=2)
                    except Exception as e_kill:
                        if ENABLE_VERBOSE_DEBUG_LOGGING:
                            print(f"--- [Jekyll Fixture] Error during SIGKILL: {e_kill} ---", flush=True)
            except Exception as e_term:
                if ENABLE_VERBOSE_DEBUG_LOGGING:
                    print(f"--- [Jekyll Fixture] Error during SIGTERM: {e_term} ---", flush=True)


        if stdout_thread and stdout_thread.is_alive(): stdout_thread.join(timeout=2)
        if stderr_thread and stderr_thread.is_alive(): stderr_thread.join(timeout=2)
        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print("--- [Jekyll Fixture] Cleanup complete. ---", flush=True)


@pytest.fixture(scope="session")
def error_logger_node_server(app_directory):
    kill_process_on_port(ERROR_LOGGER_PORT)
    # Path to the error logger script relative to app_directory
    command = ["node", "Testing/error-logger-server.js"]
    process = None
    stdout_thread = None
    stderr_thread = None
    
    node_stderr_lines = [] # To collect stderr for assertions
    node_stdout_lines = []
    ready_event = threading.Event()

    if ENABLE_VERBOSE_DEBUG_LOGGING:
        print(f"\n--- [Node Logger Fixture] Attempting to start Node error logger with command: {' '.join(command)} in {app_directory} ---", flush=True)
    
    try:
        process = subprocess.Popen(
            command,
            cwd=app_directory,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid,
            text=True, # Open streams in text mode
            bufsize=1, # Enable line buffering for text mode
            errors='replace' # How to handle decoding errors
        )

        # The error logger prints its "listening" message to console.log (STDOUT)
        stdout_thread = threading.Thread(target=stream_output_thread_target, args=(process.stdout, "NODE_LOGGER_STDOUT: ", node_stdout_lines, ready_event, f"Error logging server listening on http://localhost:{ERROR_LOGGER_PORT}"), daemon=True)
        stderr_thread = threading.Thread(target=stream_output_thread_target, args=(process.stderr, "NODE_LOGGER_STDERR: ", node_stderr_lines), daemon=True)
        stdout_thread.start()
        stderr_thread.start()

        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print(f"--- [Node Logger Fixture] Waiting for Node error logger to signal readiness (max 10s)... ---", flush=True)

        if not ready_event.wait(timeout=10): # Wait up to 10s
            error_message = f"Node error logger server failed to signal readiness. Return code: {process.poll()}\n"
            error_message += "STDOUT:\n" + "\n".join(node_stdout_lines[-20:])
            error_message += "\nSTDERR:\n" + "\n".join(node_stderr_lines[-20:])
            print(f"--- [Node Logger Fixture] {error_message} ---", flush=True) # Always print critical failure
            # Ensure threads are joined before raising
            if stdout_thread.is_alive(): stdout_thread.join(timeout=1)
            if stderr_thread.is_alive(): stderr_thread.join(timeout=1)
            raise RuntimeError(error_message)
        
        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print("--- [Node Logger Fixture] Node error logger presumed started. Yielding process and stderr lines. ---", flush=True)
        yield process, node_stderr_lines # Yielding stderr_lines in case it's useful, though not used by this stripped test

    finally:
        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print("--- [Node Logger Fixture] Test session finished. Cleaning up Node error logger. ---", flush=True)
        if process and process.poll() is None:
            try:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                process.wait(timeout=5)
            except (ProcessLookupError, subprocess.TimeoutExpired, OSError):
                if process.poll() is None:
                    try:
                        os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                        process.wait(timeout=2)
                    except Exception as e_kill:
                        if ENABLE_VERBOSE_DEBUG_LOGGING:
                            print(f"--- [Node Logger Fixture] Error during SIGKILL: {e_kill} ---", flush=True)
            except Exception as e_term:
                if ENABLE_VERBOSE_DEBUG_LOGGING:
                    print(f"--- [Node Logger Fixture] Error during SIGTERM: {e_term} ---", flush=True)

        if stdout_thread and stdout_thread.is_alive(): stdout_thread.join(timeout=2)
        if stderr_thread and stderr_thread.is_alive(): stderr_thread.join(timeout=2)
        if ENABLE_VERBOSE_DEBUG_LOGGING:
            print("--- [Node Logger Fixture] Cleanup complete. ---", flush=True)

@pytest.fixture
def driver():
    # Ensure CHROME_DRIVER_PATH is correct or use webdriver_manager
    service = ChromeService(ChromeDriverManager().install()) # Use webdriver-manager
    
    # Enable browser logging
    capabilities = DesiredCapabilities.CHROME.copy()
    capabilities['goog:loggingPrefs'] = {'browser': 'ALL'}
    
# service = ChromeService(executable_path=CHROME_DRIVER_PATH) # Comment out or remove manual path
    options = ChromeOptions()
    # options.add_argument("--headless") # Optional: run headless
    # options.add_argument("--no-sandbox") # Optional: for CI environments
    # options.add_argument("--disable-dev-shm-usage") # Optional: for CI environments
    
    # Merge capabilities with options if using Selenium 4. Options object is preferred.
    for key, value in capabilities.items():
        options.set_capability(key, value)

    selenium_driver = webdriver.Chrome(service=service, options=options)
    selenium_driver.implicitly_wait(3) # Implicit wait for elements
    yield selenium_driver
    selenium_driver.quit()

# --- Test Case ---

def test_start_servers_and_open_site(jekyll_server, error_logger_node_server, driver):
    """
    This test ensures that the Jekyll and Node.js error logger servers
    can be started, then opens the Jekyll site in Chrome for a specified duration.
    """
    node_server_process, node_stderr_lines = error_logger_node_server

    if ENABLE_VERBOSE_DEBUG_LOGGING:
        print("--- [Test Case] Jekyll and Node.js error logger servers are presumed running. ---", flush=True)
    
    print(f"--- [Test Case] Opening {JEKYLL_SERVER_URL} in Chrome... ---", flush=True)
    driver.get(JEKYLL_SERVER_URL)
    print("--- [Test Case] Page load initiated. Checking for initial console logs... ---", flush=True)
    try:
        initial_logs = driver.get_log('browser')
        if initial_logs:
            print(f"  --- Initial Browser Console Logs ({len(initial_logs)} entries) ---", flush=True)
            for entry in initial_logs:
                print(f"    {entry['message']}", flush=True) # More verbatim
        else:
            print("  No initial logs found in browser console immediately after get().", flush=True)
    except Exception as e:
        print(f"  Could not retrieve initial browser console logs: {e}", flush=True)
    print("--- [Test Case] Finished checking initial logs. ---", flush=True)

    
    print("--- [Test Case] Site opened. Browser will remain open for 90 seconds. Monitoring for errors... ---", flush=True)
    
    # --- Simulated Real-time Log Streaming ---
    print("\n--- [Test Case] Starting simulated real-time browser console log streaming ---", flush=True)
    # Keep track of the timestamp of the last log entry processed to avoid duplicates
    # This is a simple way; more robust would be to use unique log IDs if available or hash of message.
    last_log_timestamp = 0 
    end_time = time.time() + 90
    while time.time() < end_time:
        try:
            current_logs = driver.get_log('browser')
            new_logs_found_this_iteration = False
            for entry in current_logs:
                if entry['timestamp'] > last_log_timestamp:
                    # Simple verbatim output, adjust formatting as needed
                    print(f"  BROWSER_CONSOLE_STREAM: {entry['message']}", flush=True)
                    last_log_timestamp = entry['timestamp']
                    new_logs_found_this_iteration = True
            # If you want to clear logs after fetching to only get new ones next time (driver dependent behavior)
            # driver.get_log('browser') # Call it again to potentially clear the buffer for some drivers
        except Exception as e:
            print(f"  Error during log polling: {e}", flush=True)
        time.sleep(1) # Poll every 1 second
    print("--- [Test Case] Finished simulated real-time log streaming (90 seconds elapsed). ---\n", flush=True)
    # --- End Simulated Real-time Log Streaming ---


    # Retrieve and print browser console logs
    print("\n--- [Test Case] Final batch of Browser Console Logs (after 90s wait) ---", flush=True)
    logs_retrieved = False
    try:
        logs = driver.get_log('browser')
        if logs:
            logs_retrieved = True
            for entry in logs:
                # Example of more "verbatim" output, though you lose context
                print(f"  {entry['message']}", flush=True)
        if not logs_retrieved:
            print("  No logs found in browser console.", flush=True)
    except Exception as e:
        print(f"  Could not retrieve browser console logs: {e}", flush=True)
    print("--- [Test Case] Finished Checking Browser Console Logs ---\n", flush=True)

    # Check if any client-side errors were reported to our Node.js error-logger-server
    print("--- [Test Case] Checking Node.js Error Logger for Reported Client-Side Errors ---", flush=True)
    client_error_indicator = "--- Client-Side Error Received ---"
    reported_errors = [line for line in node_stderr_lines if client_error_indicator in line]
    
    if reported_errors:
        print(f"  {len(reported_errors)} client-side error(s) were reported to the Node.js logger:", flush=True)
        # The actual error details would have been printed by the stream_output_thread_target
        # if ENABLE_VERBOSE_DEBUG_LOGGING was true, or they are in node_stderr_lines.
    else:
        print("  No client-side errors were explicitly reported to the Node.js logger.", flush=True)
    print("--- [Test Case] Finished Checking Node.js Error Logger ---\n", flush=True)
