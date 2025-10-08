# Website with Browser Terminal Integration

## Overview
Personal website with Jekyll and browser-based terminal using xterm.js and WebAssembly for client-side terminal emulation.

## Browser Terminal Features

### Pure Browser Implementation
- **No Server Required**: Terminal runs entirely in the browser using JavaScript and WebAssembly
- **Full Terminal Emulation**: xterm.js provides professional terminal experience
- **Virtual File System**: In-browser file system with persistence
- **Command Support**: ls, cd, cat, pwd, echo, clear, help and more

### Technology Stack
- **xterm.js**: Professional terminal emulator
- **WebAssembly**: For future full Bash implementation via Wasmer SDK
- **JavaScript Shell**: Current fallback implementation with common Unix commands
- **Browser Storage**: File system persistence

## Features
- **Browser Terminal**: Full terminal at `/code-comprehension/browser-terminal/`
- **Role-based Access**: Secure authentication with Auth0
- **Responsive Design**: Works on desktop and mobile
- **No Dependencies**: Zero server-side requirements

## Usage
1. Navigate to `/code-comprehension/browser-terminal/`
2. Click "Start Terminal" to initialize
3. Use standard Unix commands (ls, cd, cat, pwd, etc.)
4. File system persists in browser storage

## Available Commands
```bash
ls [path]     # list directory contents
cd <path>     # change directory  
cat <file>    # display file contents
pwd           # show current directory
echo <text>   # display text
clear         # clear terminal
help          # show available commands
```

## Development
```bash
# Start Jekyll development server
bundle exec jekyll serve --host=0.0.0.0 --port=4000 --incremental
```

## Future Enhancements
- Full WebAssembly Bash via Wasmer SDK
- Extended Unix utility support
- Package manager integration
- Advanced text editors (vim, nano)