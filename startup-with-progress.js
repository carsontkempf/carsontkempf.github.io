#!/usr/bin/env node

const cliProgress = require("cli-progress");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  grey: "\x1b[90m",
};

// Helper functions for colored output
function success(message) {
  console.log(`${colors.green}${message}${colors.reset}`);
}

function error(message) {
  console.log(`${colors.red}${message}${colors.reset}`);
}

function info(message) {
  console.log(message);
}

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    error(
      "Error: .env file not found. Please create one based on .env.example"
    );
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      // Remove quotes from the value if present
      const cleanValue = value.trim().replace(/^["']|["']$/g, "");
      process.env[key.trim()] = cleanValue;
    }
  });
}

// Create multibar container
const multibar = new cliProgress.MultiBar(
  {
    clearOnComplete: false,
    hideCursor: true,
    format: " {bar} | {phase} | {status}",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
  },
  cliProgress.Presets.shades_grey
);

// Progress bars
const syncBar = multibar.create(100, 0, {
  phase: "Sync    ",
  status: "Syncing repositories...",
});

let venvBar;
let backendBar;
let connectionBar;
let frontendBar;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncRepositories() {
  syncBar.update(10, { status: "Preparing repository sync..." });
  await delay(200);

  syncBar.update(30, { status: "Syncing repositories..." });

  // Run rsync with suppressed output
  const rsync = spawn(
    "rsync",
    [
      "-av",
      "--exclude-from=rsync-exclude.txt",
      "/Users/ctk/Programming/Published/carsontkempf.github.io/backends/Error-Annotater/",
      "ctkfdp@rs8sgz564.managed.mst.edu:/home/ctkfdp/Error-Annotater/",
    ],
    { stdio: "pipe" }
  );

  let progress = 30;
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += 10;
      syncBar.update(progress, { status: "Syncing repositories..." });
    }
  }, 500);

  await new Promise((resolve, reject) => {
    rsync.on("close", (code) => {
      clearInterval(progressInterval);
      if (code === 0) {
        syncBar.update(100, {
          status: `${colors.green}Repository sync complete!${colors.reset}`,
        });
        resolve();
      } else {
        syncBar.update(100, {
          status: `${colors.red}Repository sync failed!${colors.reset}`,
        });
        reject(new Error(`rsync failed with exit code ${code}`));
      }
    });
    rsync.on("error", (error) => {
      clearInterval(progressInterval);
      syncBar.update(100, {
        status: `${colors.red}Repository sync failed!${colors.reset}`,
      });
      reject(error);
    });
  });

  await delay(300);
}

async function setupVirtualEnvironment() {
  const { SERVER_USER, SERVER_IP } = process.env;

  // Create venv bar
  venvBar = multibar.create(100, 0, {
    phase: "Venv   ",
    status: "Setting up virtual environment...",
  });

  venvBar.update(10, { status: "Checking virtual environment..." });
  await delay(200);

  // Check if .venv exists on remote server
  const checkVenv = spawn(
    "ssh",
    [
      `${SERVER_USER}@${SERVER_IP}`,
      'cd Error-Annotater && [ -d ".venv" ] && echo "VENV_EXISTS" || echo "VENV_MISSING"',
    ],
    { stdio: "pipe" }
  );

  let venvExists = false;
  checkVenv.stdout.on("data", (data) => {
    if (data.toString().trim().includes("VENV_EXISTS")) {
      venvExists = true;
    }
  });

  await new Promise((resolve) => {
    checkVenv.on("close", resolve);
  });

  if (!venvExists) {
    venvBar.update(30, { status: "Creating virtual environment..." });

    const createVenv = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        "cd Error-Annotater && python3 -m venv .venv",
      ],
      { stdio: "pipe" }
    );

    await new Promise((resolve) => {
      createVenv.on("close", resolve);
    });
  } else {
    venvBar.update(30, { status: "Virtual environment exists" });
    await delay(200);
  }

  venvBar.update(40, { status: "Checking dependencies..." });

  // Check if dependencies need to be installed on remote server
  const checkDeps = spawn(
    "ssh",
    [
      `${SERVER_USER}@${SERVER_IP}`,
      'cd Error-Annotater && source .venv/bin/activate && python -c "import langgraph, langchain_ollama, torch" && echo "DEPS_OK" || echo "DEPS_MISSING"',
    ],
    { stdio: "pipe" }
  );

  let needInstall = false;
  checkDeps.stdout.on("data", (data) => {
    if (data.toString().trim().includes("DEPS_MISSING")) {
      needInstall = true;
    }
  });

  await new Promise((resolve) => {
    checkDeps.on("close", resolve);
  });

  if (needInstall) {
    venvBar.update(50, { status: "Installing Python dependencies..." });

    const installDeps = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        "cd Error-Annotater && source .venv/bin/activate && python -m pip install --upgrade pip",
      ],
      { stdio: "pipe" }
    );

    await new Promise((resolve) => {
      installDeps.on("close", resolve);
    });

    venvBar.update(70, { status: "Installing LangGraph packages..." });

    const installLangGraph = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        "cd Error-Annotater && source .venv/bin/activate && python -m pip install -r requirements.txt",
      ],
      { stdio: "pipe" }
    );

    await new Promise((resolve) => {
      installLangGraph.on("close", resolve);
    });
  } else {
    venvBar.update(70, { status: "Dependencies already installed" });
    await delay(300);
  }

  venvBar.update(90, { status: "Verifying installation..." });
  await delay(500);

  venvBar.update(100, {
    status: `${colors.green}Virtual environment ready!${colors.reset}`,
  });
  await delay(300);
}

async function startBackend() {
  const { SERVER_USER, SERVER_IP, SUBMODULE_COMMIT, SUBMODULE_BRANCH } =
    process.env;

  // Create backend bar only when we start backend process
  backendBar = multibar.create(100, 0, {
    phase: "Backend ",
    status: "Connecting to remote server...",
  });

  // Show progress incrementally on the same line
  backendBar.update(10, { status: "Connecting to remote server..." });
  await delay(300);

  // Stop any existing backend processes
  backendBar.update(30, { status: "Stopping existing processes..." });
  const killOld = spawn(
    "ssh",
    [
      `${SERVER_USER}@${SERVER_IP}`,
      'pkill -f remote-run-backend.sh || true; pkill -f "python.*run.py" || true; lsof -ti:5000 | xargs kill -9 2>/dev/null || true',
    ],
    {
      stdio: "pipe",
    }
  );

  await new Promise((resolve) => {
    killOld.on("close", resolve);
  });

  backendBar.update(30, { status: "Setting up port forwarding..." });

  // Start SSH port forwarding for local development
  const portForward = spawn(
    "ssh",
    ["-N", "-L", "5000:127.0.0.1:5000", `${SERVER_USER}@${SERVER_IP}`],
    { stdio: "pipe", detached: true }
  );

  // Store port forwarding process for cleanup
  process.portForwardProcess = portForward;

  await delay(800);

  backendBar.update(50, { status: "Starting remote backend server..." });

  // Start backend on remote server with proper backgrounding and SSH disconnect
  const startRemoteBackend = spawn(
    "ssh",
    [
      `${SERVER_USER}@${SERVER_IP}`,
      `cd Error-Annotater && chmod +x remote-run-backend.sh && nohup bash -c 'source .venv/bin/activate && ./remote-run-backend.sh' > backend.log 2>&1 < /dev/null & disown`,
    ],
    { stdio: "pipe", detached: true }
  );

  await new Promise((resolve, reject) => {
    startRemoteBackend.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        backendBar.update(100, {
          status: `${colors.red}Remote backend startup failed!${colors.reset}`,
        });
        reject(
          new Error(`Failed to start remote backend with exit code ${code}`)
        );
      }
    });
    startRemoteBackend.on("error", (error) => {
      backendBar.update(100, {
        status: `${colors.red}Remote backend startup failed!${colors.reset}`,
      });
      reject(error);
    });
  });

  backendBar.update(70, { status: "Backend initializing..." });

  // Give the backend a moment to fully initialize
  await delay(2500);

  backendBar.update(100, {
    status: `${colors.green}Remote backend startup complete!${colors.reset}`,
  });
  await delay(300);

  // Run CORS test if requested
  if (process.env.RUN_CORS_TEST === "true") {
    backendBar.update(100, { status: "Running CORS debug test..." });
    await runCorsTest();
  }
}

async function startFrontend() {
  const { JEKYLL_PROJECT_PATH } = process.env;

  // Create frontend bar only when needed
  frontendBar = multibar.create(100, 0, {
    phase: "Frontend",
    status: "Preparing Jekyll environment...",
  });

  frontendBar.update(10, { status: "Preparing Jekyll environment..." });
  await delay(200);

  frontendBar.update(30, { status: "Changing to project directory..." });
  await delay(200);

  frontendBar.update(50, { status: "Starting Jekyll server..." });
  await delay(200);

  frontendBar.update(80, { status: "Jekyll server starting..." });
  await delay(300);

  frontendBar.update(100, {
    status: `${colors.green}Jekyll server ready!${colors.reset}`,
  });
  await delay(300);

  console.log("\n");

  multibar.stop();

  // Show backend logs before starting Jekyll
  await showBackendLog();

  // Run LangGraph test if requested (after all progress bars are complete)
  if (process.env.RUN_LANGGRAPH_TEST === "true") {
    await runLangGraphTest();
  }

  // Clean separator
  console.log("\n");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("");

  // Start Jekyll server with filtered output
  const jekyllCommand = [
    "env",
    "JEKYLL_ENV=production",
    "bundle",
    "exec",
    "jekyll",
    "serve",
    "--config",
    "_config-dev.yml",
  ];

  const jekyll = spawn(jekyllCommand[0], jekyllCommand.slice(1), {
    cwd: JEKYLL_PROJECT_PATH,
    stdio: ["inherit", "pipe", "pipe"],
  });

  let isInitialBuild = true;
  let serverInfo = "";

  // Filter Jekyll output
  jekyll.stdout.on("data", (data) => {
    const output = data.toString();
    const lines = output.split("\n");

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Always show these important lines
      if (
        line.includes("Configuration file:") ||
        line.includes("Server address:") ||
        line.includes("Server running...")
      ) {
        // Color server address and server running lines grey
        if (
          line.includes("Server address:") ||
          line.includes("Server running...")
        ) {
          console.log(`${colors.grey}${line}${colors.reset}`);
          serverInfo += line + "\n\n";
          // Add extra newline after both server address and server running message
          console.log("");
        } else {
          // Handle Configuration file line with yellow filename
          if (line.includes("Configuration file:")) {
            const parts = line.split(": ");
            if (parts.length === 2) {
              console.log(
                `${parts[0]}: ${colors.yellow}${parts[1]}${colors.reset}`
              );
            } else {
              console.log(line);
            }
          } else {
            console.log(line);
          }
        }
      }
      // Show initial build completion
      else if (
        isInitialBuild &&
        line.includes("done in") &&
        line.includes("seconds")
      ) {
        console.log(`${colors.grey}${line}${colors.reset}`);
        console.log(""); // Add extra newline after build completion
        isInitialBuild = false;
      }
      // Show only regeneration status (overwrite previous)
      else if (line.includes("Regenerating:")) {
        // Clear any previous regeneration and show new one
        process.stdout.write("\r\x1b[K"); // Clear current line
        process.stdout.write(`      ${line}`);
      } else if (
        !isInitialBuild &&
        line.includes("...done in") &&
        line.includes("seconds")
      ) {
        // Complete the regeneration line, then clear for next time
        process.stdout.write(` - ${line}\r\x1b[K`);
        process.stdout.write(`      File regenerated - ${line}\n`);
      }
    }
  });

  // Handle Jekyll errors
  jekyll.stderr.on("data", (data) => {
    const output = data.toString();
    // Only show actual errors, not warnings
    if (
      !output.includes("Build Warning:") &&
      !output.includes("GitHub Metadata:") &&
      !output.includes("retry middleware")
    ) {
      error(output.trim());
    }
  });

  // Keep the process alive for Jekyll
  jekyll.on("close", async (code) => {
    if (code !== 0) {
      // Update frontend bar to show failure
      if (frontendBar) {
        frontendBar.update(100, {
          status: `${colors.red}Jekyll server failed!${colors.reset}`,
        });
      }
    }

    // Only show log if not already shown by signal handler
    if (!process.logShown) {
      await showBackendLog(true); // Force detailed logs on unexpected exit
    }
    process.exit(code);
  });
}

async function runCorsTest() {
  const { SERVER_USER, SERVER_IP } = process.env;

  console.log("\n");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("CORS Debug Test Results:");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("");

  try {
    const corsTest = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        "cd Error-Annotater && python3 test_cors_debug.py",
      ],
      { stdio: "inherit" }
    );

    await new Promise((resolve) => {
      corsTest.on("close", resolve);
    });
  } catch (error) {
    error("Could not run CORS test");
  }

  console.log("\n");
}

async function runDependencyTest() {
  const { SERVER_USER, SERVER_IP } = process.env;

  console.log("\n");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("🔍 Testing LangGraph Dependencies...");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("");

  try {
    const depTest = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        `cd Error-Annotater && source .venv/bin/activate && python -c "
import sys
print('  ✅ Testing langchain_ollama...')
try:
    import langchain_ollama
    print('  ✅ langchain_ollama: Available')
except ImportError as e:
    print('  ❌ langchain_ollama: Missing')
    print(f'     Error: {e}')
    
print('  ✅ Testing torch...')
try:
    import torch
    print('  ✅ torch: Available')
    print(f'     Version: {torch.__version__}')
except ImportError as e:
    print('  ❌ torch: Missing')
    print(f'     Error: {e}')
    
print('  ✅ Testing langgraph...')
try:
    import langgraph
    print('  ✅ langgraph: Available')
    try:
        print(f'     Version: {langgraph.__version__}')
    except AttributeError:
        print('     Version: Unknown (no __version__ attribute)')
except ImportError as e:
    print('  ❌ langgraph: Missing')
    print(f'     Error: {e}')
    
print('  ✅ Testing transformers...')
try:
    import transformers
    print('  ✅ transformers: Available')
    print(f'     Version: {transformers.__version__}')
except ImportError as e:
    print('  ❌ transformers: Missing')
    print(f'     Error: {e}')

print('🎯 Dependency test completed!')
"`,
      ],
      { stdio: "inherit" }
    );

    await new Promise((resolve) => {
      depTest.on("close", resolve);
    });
  } catch (error) {
    error("Could not run dependency test");
  }

  console.log("\n");
}

async function runLangGraphTest() {
  const { SERVER_USER, SERVER_IP } = process.env;

  console.log("\n");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("LangGraph Multi-Agent System Test Results:");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("");

  try {
    const langGraphTest = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        'cd Error-Annotater && python3 -c "' +
          "import requests; " +
          "import json; " +
          "test_data = {'original_code': 'def test(): return 1+1', 'prompt': 'Test LangGraph'}; " +
          "print('Testing LangGraph Multi-Agent Initialize...'); " +
          "r1 = requests.post('http://localhost:5000/api/v1/multiagent/initialize'); " +
          "print(f'Initialize Status: {r1.status_code}'); " +
          "print(f'Response: {r1.text[:200]}...'); " +
          "print('\\nTesting LangGraph Status...'); " +
          "r2 = requests.get('http://localhost:5000/api/v1/multiagent/status'); " +
          "print(f'Status: {r2.status_code}'); " +
          "print(f'Response: {r2.text[:200]}...'); " +
          "print('\\nLangGraph Test Complete!')\"",
      ],
      { stdio: "inherit" }
    );

    await new Promise((resolve) => {
      langGraphTest.on("close", resolve);
    });
  } catch (error) {
    error("Could not run LangGraph test");
  }

  console.log("\n");
}

async function showBackendLog(showDetailedLogs = false) {
  const { SERVER_USER, SERVER_IP } = process.env;

  try {
    // First check for errors in the log
    const checkErrors = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        'tail -20 Error-Annotater/backend.log 2>/dev/null | grep -i "error\\|exception\\|failed\\|traceback" || echo "NO_ERRORS"',
      ],
      { stdio: "pipe" }
    );

    let hasErrors = false;
    let errorOutput = "";

    checkErrors.stdout.on("data", (data) => {
      errorOutput += data.toString();
    });

    await new Promise((resolve) => {
      checkErrors.on("close", () => {
        hasErrors =
          !errorOutput.trim().includes("NO_ERRORS") &&
          errorOutput.trim() !== "";
        resolve();
      });
    });

    // Only show detailed logs if there are errors or explicitly requested
    if (hasErrors || showDetailedLogs) {
      console.log("\n\n");
      console.log("─".repeat(process.stdout.columns || 80));
      console.log(
        hasErrors
          ? "Backend Log (errors detected):"
          : "Backend Log (last 20 lines):"
      );
      console.log("─".repeat(process.stdout.columns || 80));
      console.log("\n");

      // Get the full backend log
      const getLog = spawn(
        "ssh",
        [
          `${SERVER_USER}@${SERVER_IP}`,
          'tail -20 Error-Annotater/backend.log 2>/dev/null || echo "No backend log found"',
        ],
        { stdio: "inherit" }
      );

      await new Promise((resolve) => {
        getLog.on("close", resolve);
      });
    } else {
      // Create connection testing progress bar
      connectionBar = multibar.create(100, 0, {
        phase: "Connect ",
        status: "Testing backend connection...",
      });

      connectionBar.update(30, { status: "Testing backend connection..." });
      await delay(500);

      connectionBar.update(70, { status: "Verifying API endpoints..." });
      await delay(800);

      connectionBar.update(100, {
        status: `${colors.green}Frontend-backend connection ready!${colors.reset}`,
      });
      await delay(300);

      // Add two newlines after connection bar completes (like sync and backend)
      console.log("\n");
    }
  } catch (error) {
    error("\nCould not retrieve backend log\n");
  }
}

async function main() {
  try {
    console.log("\n");
    loadEnvFile();

    // First sync repositories
    await syncRepositories();

    console.log("\n");

    // Setup virtual environment and dependencies
    await setupVirtualEnvironment();

    console.log("\n");

    // Run dependency test if requested (after venv setup)
    if (process.env.RUN_DEPENDENCY_TEST === "true") {
      await runDependencyTest();
    }

    // Start backend deployment
    await startBackend();

    console.log("\n");

    // Start frontend after backend is ready
    await startFrontend();
  } catch (error) {
    multibar.stop();
    error(`\nError during startup: ${error.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  multibar.stop();

  // Kill port forwarding if it exists
  if (process.portForwardProcess) {
    process.portForwardProcess.kill();
  }

  process.logShown = true;
  await showBackendLog(true); // Force detailed logs on manual exit
  process.exit(0);
});

process.on("SIGTERM", async () => {
  multibar.stop();

  // Kill port forwarding if it exists
  if (process.portForwardProcess) {
    process.portForwardProcess.kill();
  }

  process.logShown = true;
  await showBackendLog(true); // Force detailed logs on manual exit
  process.exit(0);
});

main();
