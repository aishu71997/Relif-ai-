import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

console.log("====================================================");
console.log("   RELIEFAI UNIFIED DEVELOPMENT SERVER BOOTLOADER   ");
console.log("====================================================");

// 1. Ensure Python dependencies are installed on startup
console.log("Step 1: Installing / verifying python dependencies...");
const pip = spawn('python3', ['-m', 'pip', 'install', '-r', 'backend/requirements.txt'], {
  stdio: 'inherit'
});

pip.on('close', (code) => {
  if (code !== 0) {
    console.warn(`[Warning] pip install exited with code ${code}. Attempting to start servers anyway...`);
  } else {
    console.log("[Success] Python dependencies verified successfully.");
  }

  // 2. Start FastAPI server on port 8000
  console.log("\nStep 2: Launching FastAPI Backend on 127.0.0.1:8000...");
  const fastapi = spawn('python3', ['-m', 'uvicorn', 'backend.app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONPATH: process.cwd() }
  });

  // 3. Start Vite dev server on port 3000
  console.log("\nStep 3: Launching Vite Dev Server on port 3000 (ingress)...");
  const vite = spawn('npx', ['vite', '--port=3000', '--host=0.0.0.0'], {
    stdio: 'inherit'
  });

  // Keep track of processes for clean shutdown
  const cleanUp = () => {
    console.log("\n[System] Stopping developer servers...");
    try {
      fastapi.kill('SIGTERM');
    } catch (e) {}
    try {
      vite.kill('SIGTERM');
    } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanUp);
  process.on('SIGTERM', cleanUp);
  process.on('SIGHUP', cleanUp);
});
