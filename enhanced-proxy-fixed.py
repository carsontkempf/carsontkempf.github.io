#!/usr/bin/env python3
"""
Enhanced Proxy Server for Terminal WebSocket Support - FIXED VERSION

Fixes:
1. Changed bash startup from '-l' to '--norc --noprofile' to prevent echo re-enabling
2. Added INPUTRC=/dev/null to prevent readline interference
3. Runs on ports 8888 (HTTP) and 8889 (WebSocket) to match frontend
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import json
import logging
import asyncio
import websockets
import subprocess
import pty
import os
import threading
import signal
import time
import termios
import tty
from datetime import datetime
from typing import Dict, Any
from websockets.server import serve

class SimpleHTTPProxyHandler(http.server.SimpleHTTPRequestHandler):
    """Simple HTTP proxy handler with CORS support"""

    def do_GET(self):
        """Handle GET requests"""
        self._handle_request('GET')

    def do_POST(self):
        """Handle POST requests"""
        self._handle_request('POST')

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _handle_request(self, method: str):
        """Handle proxy requests with CORS support"""
        try:
            # Add CORS headers
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')

            url = self.path
            if not url.startswith('http'):
                parsed_query = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
                if 'url' in parsed_query:
                    url = parsed_query['url'][0]
                else:
                    self.send_header('Content-Type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(b"Bad Request: No target URL specified")
                    return

            # Forward the request
            req = urllib.request.Request(url, method=method)

            with urllib.request.urlopen(req, timeout=30) as response:
                for header, value in response.headers.items():
                    if header.lower() not in ['transfer-encoding', 'connection', 'access-control-allow-origin']:
                        self.send_header(header, value)

                self.end_headers()
                self.wfile.write(response.read())

        except Exception as e:
            logging.error(f"Proxy error: {e}")
            self.send_response(502)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(f"Bad Gateway: {str(e)}".encode())

class TerminalWebSocketHandler:
    """WebSocket handler for terminal connections - NO ECHO"""

    def __init__(self):
        self.terminals = {}

    async def handle_connection(self, websocket, path):
        """Handle new WebSocket connection"""
        terminal_id = id(websocket)

        try:
            logging.info(f"New terminal connection: {terminal_id}")

            # Create PTY
            master_fd, slave_fd = pty.openpty()

            # CRITICAL: Configure PTY to disable echo
            try:
                # Get current terminal settings
                attrs = termios.tcgetattr(slave_fd)

                # Disable echo, canonical mode, and other problematic flags
                attrs[termios.LFLAG] &= ~(
                    termios.ECHO |      # Disable echo
                    termios.ECHOE |     # Disable echo erase
                    termios.ECHOK |     # Disable echo kill
                    termios.ECHONL |    # Disable echo newline
                    termios.ICANON      # Disable canonical mode
                )

                # Set input flags for raw mode
                attrs[termios.IFLAG] &= ~(
                    termios.BRKINT |
                    termios.ICRNL |
                    termios.INPCK |
                    termios.ISTRIP |
                    termios.IXON
                )

                # Set output flags
                attrs[termios.OFLAG] &= ~termios.OPOST

                # Set control flags
                attrs[termios.CFLAG] &= ~(termios.CSIZE | termios.PARENB)
                attrs[termios.CFLAG] |= termios.CS8

                # Apply settings immediately
                termios.tcsetattr(slave_fd, termios.TCSANOW, attrs)
                logging.info(f"Terminal {terminal_id}: Echo disabled successfully")

            except Exception as e:
                logging.error(f"Terminal {terminal_id}: Failed to disable echo: {e}")

            # Start shell process - FIXED: Use --norc --noprofile instead of -l
            process = subprocess.Popen(
                ['/bin/bash', '--norc', '--noprofile'],  # FIX: Prevents .bashrc from re-enabling echo
                stdin=slave_fd,
                stdout=slave_fd,
                stderr=slave_fd,
                preexec_fn=os.setsid,
                env=dict(os.environ,
                    TERM='xterm-256color',
                    COLUMNS='120',
                    LINES='30',
                    PS1='$ ',
                    SHELL='/bin/bash',
                    INPUTRC='/dev/null',  # FIX: Prevents readline from interfering
                    BASH_SILENCE_DEPRECATION_WARNING='1'
                )
            )

            self.terminals[terminal_id] = {
                'process': process,
                'master_fd': master_fd,
                'slave_fd': slave_fd,
                'websocket': websocket
            }

            # Send welcome message
            await websocket.send(json.dumps({
                'type': 'output',
                'data': f'🖥️ Terminal connected (PID: {process.pid}) - Echo disabled\r\n'
            }))

            # Start reading from PTY
            await self._handle_terminal_io(terminal_id)

        except websockets.exceptions.ConnectionClosed:
            logging.info(f"Terminal {terminal_id}: Connection closed")
        except Exception as e:
            logging.error(f"Terminal {terminal_id}: Error - {e}")
        finally:
            self._cleanup_terminal(terminal_id)

    async def _handle_terminal_io(self, terminal_id):
        """Handle terminal I/O"""
        term_info = self.terminals[terminal_id]
        master_fd = term_info['master_fd']
        websocket = term_info['websocket']

        # Create tasks for reading and writing
        read_task = asyncio.create_task(self._read_from_pty(terminal_id))
        write_task = asyncio.create_task(self._handle_websocket_messages(terminal_id))

        try:
            # Wait for either task to complete
            done, pending = await asyncio.wait(
                [read_task, write_task],
                return_when=asyncio.FIRST_COMPLETED
            )

            # Cancel pending tasks
            for task in pending:
                task.cancel()

        except Exception as e:
            logging.error(f"Terminal {terminal_id}: I/O error - {e}")

    async def _read_from_pty(self, terminal_id):
        """Read from PTY and send to WebSocket"""
        term_info = self.terminals[terminal_id]
        master_fd = term_info['master_fd']
        websocket = term_info['websocket']

        while True:
            try:
                # Use select to check for data
                import select
                ready, _, _ = select.select([master_fd], [], [], 0.01)

                if ready:
                    data = os.read(master_fd, 1024)
                    if data:
                        output = data.decode('utf-8', errors='ignore')
                        await websocket.send(json.dumps({
                            'type': 'output',
                            'data': output
                        }))
                    else:
                        break  # EOF
                else:
                    await asyncio.sleep(0.001)  # Small delay for responsiveness

            except Exception as e:
                logging.error(f"Terminal {terminal_id}: Read error - {e}")
                break

    async def _handle_websocket_messages(self, terminal_id):
        """Handle WebSocket messages from client"""
        term_info = self.terminals[terminal_id]
        master_fd = term_info['master_fd']
        websocket = term_info['websocket']

        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    msg_type = data.get('type')

                    if msg_type == 'input':
                        # Terminal input - write directly to master PTY
                        input_data = data.get('data', '')
                        os.write(master_fd, input_data.encode('utf-8'))

                    elif msg_type == 'init':
                        # Initial setup
                        logging.info(f"Terminal {terminal_id}: Initialized")

                except json.JSONDecodeError:
                    logging.error(f"Terminal {terminal_id}: Invalid JSON message")
                except Exception as e:
                    logging.error(f"Terminal {terminal_id}: Message handling error - {e}")

        except Exception as e:
            logging.error(f"Terminal {terminal_id}: WebSocket message loop error - {e}")

    def _cleanup_terminal(self, terminal_id):
        """Clean up terminal session"""
        if terminal_id in self.terminals:
            term_info = self.terminals[terminal_id]

            try:
                # Terminate process
                if term_info['process']:
                    try:
                        os.killpg(os.getpgid(term_info['process'].pid), signal.SIGTERM)
                        term_info['process'].wait(timeout=2)
                    except:
                        try:
                            os.killpg(os.getpgid(term_info['process'].pid), signal.SIGKILL)
                        except:
                            pass

                # Close file descriptors
                if term_info['master_fd']:
                    os.close(term_info['master_fd'])
                if term_info['slave_fd']:
                    os.close(term_info['slave_fd'])

            except Exception as e:
                logging.error(f"Terminal {terminal_id}: Cleanup error - {e}")

            del self.terminals[terminal_id]
            logging.info(f"Terminal {terminal_id}: Cleaned up")

class EnhancedProxy:
    """Enhanced proxy server with HTTP and WebSocket support"""

    def __init__(self, host='0.0.0.0', http_port=8888, ws_port=8889):  # FIX: Changed default ports
        self.host = host
        self.http_port = http_port
        self.ws_port = ws_port
        self.http_server = None
        self.ws_server = None
        self.terminal_handler = TerminalWebSocketHandler()

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def start(self):
        """Start both servers"""
        try:
            # Start HTTP server in thread
            def start_http_server():
                self.http_server = socketserver.TCPServer((self.host, self.http_port), SimpleHTTPProxyHandler)
                logging.info(f"HTTP Proxy started on {self.host}:{self.http_port}")
                self.http_server.serve_forever()

            http_thread = threading.Thread(target=start_http_server, daemon=True)
            http_thread.start()

            # Start WebSocket server
            async def start_ws_server():
                self.ws_server = await serve(
                    self.terminal_handler.handle_connection,
                    self.host,
                    self.ws_port
                )
                logging.info(f"WebSocket Terminal started on {self.host}:{self.ws_port}")
                await self.ws_server.wait_closed()

            logging.info("="*60)
            logging.info("Enhanced Proxy Server Started - FIXED VERSION")
            logging.info("="*60)
            logging.info(f"HTTP Proxy: http://{self.host}:{self.http_port}")
            logging.info(f"WebSocket Terminal: ws://{self.host}:{self.ws_port}")
            logging.info("="*60)
            logging.info("Fixes applied:")
            logging.info("  - Bash startup: --norc --noprofile (no echo)")
            logging.info("  - INPUTRC=/dev/null (no readline interference)")
            logging.info("  - Ports: 8888 (HTTP), 8889 (WebSocket)")
            logging.info("="*60)

            # Run WebSocket server
            asyncio.run(start_ws_server())

        except KeyboardInterrupt:
            logging.info("Server shutdown requested")
        except Exception as e:
            logging.error(f"Server error: {e}")
        finally:
            self.shutdown()

    def shutdown(self):
        """Shutdown servers"""
        try:
            if self.http_server:
                self.http_server.shutdown()
                self.http_server.server_close()

            if self.ws_server:
                self.ws_server.close()

            logging.info("Servers shut down successfully")
        except Exception as e:
            logging.error(f"Shutdown error: {e}")

if __name__ == "__main__":
    proxy = EnhancedProxy()
    proxy.start()
