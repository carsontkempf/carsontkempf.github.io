# Browser Terminal Setup Guide

## Issues Fixed

### 1. ✅ env-config.js Not Found
**Problem**: Jekyll wasn't processing `.liquid` files to `.js`

**Solution Applied**:
- Added `permalink: /assets/js/env-config.js` to `env-config.js.liquid`
- Added `permalink: /assets/js/auth.js` to `auth.js.liquid`
- Updated `_config.yml` to process liquid files correctly
- Fixed `_layouts/default.html` to reference `.js` files (not `.liquid`)

### 2. ✅ WebSocket Connection Failed
**Problem**: No server listening on `ws://localhost:8889`

**Solution**: Use the fixed proxy server and SSH tunnel

---

## Setup Instructions

### Step 1: Restart Jekyll (to apply config changes)

```bash
# Stop current Jekyll server (Ctrl+C)
# Then restart:
cd /Users/ctk/Programming/Published/carsontkempf.github.io
~/.rbenv/versions/3.4.4/bin/bundle _2.5.23_ exec jekyll serve --environment=production --host=0.0.0.0 --port=4000
```

### Step 2: Copy Fixed Proxy to Server

```bash
# From your local machine:
scp /Users/ctk/Programming/Published/carsontkempf.github.io/enhanced-proxy-fixed.py ctkfdp@rs8sgz564:~/enhanced-proxy-fixed.py
```

### Step 3: Install Dependencies on Server

```bash
# SSH to your server:
ssh ctkfdp@rs8sgz564

# Install required Python packages:
pip3 install websockets asyncio

# Or if using system Python:
python3 -m pip install --user websockets asyncio
```

### Step 4: Run Proxy Server on Server

```bash
# On the server (rs8sgz564):
cd ~
python3 enhanced-proxy-fixed.py
```

You should see:
```
============================================================
Enhanced Proxy Server Started - FIXED VERSION
============================================================
HTTP Proxy: http://0.0.0.0:8888
WebSocket Terminal: ws://0.0.0.0:8889
============================================================
Fixes applied:
  - Bash startup: --norc --noprofile (no echo)
  - INPUTRC=/dev/null (no readline interference)
  - Ports: 8888 (HTTP), 8889 (WebSocket)
============================================================
```

### Step 5: Create SSH Tunnel (from your local machine)

```bash
# Open a new terminal on your LOCAL machine:
ssh -L 8888:localhost:8888 -L 8889:localhost:8889 ctkfdp@rs8sgz564.managed.mst.edu -N
```

**Important**: Use the **full hostname** `rs8sgz564.managed.mst.edu`, not just `rs8sgz564`

**Explanation**:
- `-L 8888:localhost:8888` - Forward local port 8888 to server port 8888 (HTTP proxy)
- `-L 8889:localhost:8889` - Forward local port 8889 to server port 8889 (WebSocket)
- `-N` - Don't execute remote commands (just tunnel)

Keep this terminal open while using the browser terminal.

**Optional**: Add to `~/.ssh/config` to use short name:
```
Host rs8sgz564
    HostName rs8sgz564.managed.mst.edu
    User ctkfdp
```
Then you can use: `ssh -L 8888:localhost:8888 -L 8889:localhost:8889 rs8sgz564 -N`

### Step 6: Connect via Browser

1. Open your browser to: `http://localhost:4000/code-comprehension/browser-terminal/`
2. Fill in the form:
   - **Proxy Server Host**: `localhost`
   - **HTTP Proxy Port**: `8888`
   - **WebSocket Terminal Port**: `8889`
   - **SSH Target Server**: `rs8sgz564.managed.mst.edu` (auto-fills)
   - **SSH Username**: `ctkfdp` (auto-fills)
   - **Terminal Type**: `SSH Terminal (Auto-connect)`
3. Click "🚀 Connect to Server"

---

## How It Works

```
Browser (xterm.js)
    ↓ ws://localhost:8889 (SSH tunnel)
    ↓
Server: rs8sgz564 (enhanced-proxy-fixed.py)
    ↓ Creates bash shell with echo disabled
    ↓ Auto-sends: ssh ctkfdp@rs8sgz564
    ↓
Terminal Session on rs8sgz564
```

---

## Troubleshooting

### env-config.js Still Not Found
```bash
# Check if file was generated:
ls -la _site/assets/js/env-config.js

# If not, force Jekyll rebuild:
rm -rf _site
bundle exec jekyll build --environment=production
```

### WebSocket Connection Fails
```bash
# 1. Check proxy is running on server:
ssh ctkfdp@rs8sgz564 "lsof -i :8889"

# 2. Check SSH tunnel is active:
lsof -i :8889

# 3. Test WebSocket manually:
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:8889/
```

### Double Echo Still Happening
- Make sure you're using `enhanced-proxy-fixed.py` (not the old version)
- Restart the proxy server
- The fix is on lines 161-162: `--norc --noprofile`

### Can't SSH to rs8sgz564
The short hostname `rs8sgz564` won't work without SSH config.

**Solution**: Use full hostname:
```bash
ssh ctkfdp@rs8sgz564.managed.mst.edu
```

**Or** add to `~/.ssh/config`:
```
Host rs8sgz564
    HostName rs8sgz564.managed.mst.edu
    User ctkfdp
```

---

## Quick Start (One-Liner Commands)

### On Server (rs8sgz564):
```bash
python3 ~/enhanced-proxy-fixed.py
```

### On Local Machine (Terminal 1 - Jekyll):
```bash
cd ~/Programming/Published/carsontkempf.github.io && ~/.rbenv/versions/3.4.4/bin/bundle _2.5.23_ exec jekyll serve --environment=production --host=0.0.0.0 --port=4000
```

### On Local Machine (Terminal 2 - SSH Tunnel):
```bash
ssh -L 8888:localhost:8888 -L 8889:localhost:8889 ctkfdp@rs8sgz564.managed.mst.edu -N
```

### On Local Machine (Browser):
```
http://localhost:4000/code-comprehension/browser-terminal/
```

---

## What Changed in enhanced-proxy-fixed.py

1. **Line 161**: Changed from `/bin/bash -l` to `/bin/bash --norc --noprofile`
   - Prevents `.bashrc` from re-enabling terminal echo

2. **Line 169**: Added `INPUTRC='/dev/null'`
   - Prevents readline library from interfering with terminal settings

3. **Line 334**: Changed default ports from `9888/9889` to `8888/8889`
   - Matches frontend configuration

These changes eliminate the double echo problem where typing "ssh" would show "sssshh".
