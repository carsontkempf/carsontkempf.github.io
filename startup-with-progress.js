#!/usr/bin/env node

const cliProgress = require("cli-progress");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    console.error(
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
const backendBar = multibar.create(100, 0, {
  phase: "Backend ",
  status: "Initializing...",
});

let frontendBar;

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startBackend() {
  const { SERVER_USER, SERVER_IP, SUBMODULE_COMMIT, SUBMODULE_BRANCH } =
    process.env;

  backendBar.update(5, { status: "Connecting to remote server..." });
  await delay(300);

  // Skip git sync - using new deployment solution

  // Stop any existing backend processes
  backendBar.update(35, { status: "Stopping existing backend processes..." });
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

  backendBar.update(60, { status: "Starting remote backend server..." });
  await delay(300);

  // Start SSH port forwarding for local development
  backendBar.update(70, { status: "Setting up port forwarding..." });
  const portForward = spawn(
    "ssh",
    [
      "-N", "-L", "5000:127.0.0.1:5000",
      `${SERVER_USER}@${SERVER_IP}`
    ],
    { stdio: "pipe", detached: true }
  );

  // Store port forwarding process for cleanup
  process.portForwardProcess = portForward;

  await delay(1000);

  // Start backend on remote server with proper backgrounding and SSH disconnect
  const startRemoteBackend = spawn(
    "ssh",
    [
      `${SERVER_USER}@${SERVER_IP}`,
      `cd Error-Annotater && chmod +x remote-run-backend.sh && nohup bash -c 'source .venv/bin/activate && ./remote-run-backend.sh' > backend.log 2>&1 < /dev/null & disown`,
    ],
    { stdio: "pipe", detached: true }
  );

  backendBar.update(85, { status: "Backend starting on server..." });

  await new Promise((resolve, reject) => {
    startRemoteBackend.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`Failed to start remote backend with exit code ${code}`)
        );
      }
    });
    startRemoteBackend.on("error", reject);
  });

  backendBar.update(95, { status: "SSH disconnected, backend running remotely..." });
  
  // Give the backend a moment to fully initialize
  await delay(3000);

  backendBar.update(100, { status: "Remote backend startup complete!" });
  await delay(500);

  // Run CORS test if requested
  if (process.env.RUN_CORS_TEST === 'true') {
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

  frontendBar.update(100, { status: "Jekyll server ready!" });
  await delay(300);

  multibar.stop();

  // Clean separator
  console.log("\n");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("");

  // Start Jekyll server with full output
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
    stdio: "inherit",
  });

  // Keep the process alive for Jekyll
  jekyll.on("close", async (code) => {
    // Only show log if not already shown by signal handler
    if (!process.logShown) {
      await showBackendLog();
    }
    process.exit(code);
  });
}

async function runCorsTest() {
  const { SERVER_USER, SERVER_IP } = process.env;

  console.log("\n");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("🔍 CORS Debug Test Results:");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("");

  try {
    const corsTest = spawn(
      "ssh",
      [
        `${SERVER_USER}@${SERVER_IP}`,
        'cd Error-Annotater && python3 test_cors_debug.py',
      ],
      { stdio: "inherit" }
    );

    await new Promise((resolve) => {
      corsTest.on("close", resolve);
    });
  } catch (error) {
    console.log("Could not run CORS test");
  }

  console.log("\n");
}

async function showBackendLog() {
  const { SERVER_USER, SERVER_IP } = process.env;

  console.log("\n\n");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("📋 Backend Log (last 20 lines):");
  console.log("─".repeat(process.stdout.columns || 80));
  console.log("\n");

  try {
    // Get the backend log from the server
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
  } catch (error) {
    console.log("Could not retrieve backend log");
  }
}

async function main() {
  try {
    console.log("\n");
    loadEnvFile();

    // Start backend deployment
    await startBackend();

    console.log("");

    // Start frontend after backend is ready
    await startFrontend();
  } catch (error) {
    multibar.stop();
    console.error("\n❌ Error during startup:", error.message);
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
  await showBackendLog();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  multibar.stop();
  
  // Kill port forwarding if it exists
  if (process.portForwardProcess) {
    process.portForwardProcess.kill();
  }
  
  process.logShown = true;
  await showBackendLog();
  process.exit(0);
});

main();
