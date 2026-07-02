# Relief AI — Decentralized Relief Agent Mesh

Welcome to **Relief AI**, a high-precision, offline-first tactical communication and relief coordination system. Built with an elegant Cosmic slate theme, this full-stack application connects crisis victims with rescue coordination teams, first responders, and spontaneous community volunteers.

---

## 🛠️ Project Core & Architecture
Relief AI operates a dual-core architectural layout supporting two distinct, robust interfaces:

1. **Public Assistance Hub** (`/dashboard` & `/chat`):
   - Designed for disaster-stricken residents, evacuees, and volunteers.
   - Provides instant links to search for active heated shelters, report direct rescue coordination alerts, access local medical clinic facilities, register spontaneous meal packers, and run emergency translation sweeps.
   - Houses the **Compassionate AI Support Assistant**, providing comforting and direct guidance.

2. **Technical Operations Center** (`/admin`):
   - Authorized restricted terminal for system auditors and Kaggle evaluation panels.
   - Displays real-time operational status timelines, telemetry grids, and system metrics.
   - Contains monitors tracking the state of **9 active autonomous ADK swarm agents**, **MCP (Model Context Protocol) tool registries**, and **Workflow Execution pipelines**.

---

## ✨ Features Recently Implemented

### 1. Memory Agent RLHF Feedback Mechanism
To continuously optimize the response intelligence of our simulated multi-agent system, we built a real-time conversational reinforcement learning stream:
- **Interactive UI**: Inside the AI Assistant chat feed, each generated response is paired with elegant **Thumbs Up (Helpful)** and **Thumbs Down (Not Helpful)** evaluation tools.
- **Backend Memory Pipeline**: Ratings are logged to the backend via `/api/memory/feedback`. Helpful votes automatically boost the confidence scores of local semantic insights (`+0.05`), while negative ratings adjust them downwards (`-0.15`).
- **Live Auditor Stream**: In the Operations Panel (`/admin/agents`), administrators can monitor a live **Reinforcement Learning Streams (RLHF)** log to view ratings and immediate session memory adjustments as they occur.

### 2. Mesh Operational Health & Stress Testing
We designed a high-fidelity system monitoring suite to guarantee performance under heavy disaster-scenario workloads:
- **Visual Warning Thresholds**: System metrics (CPU, Memory, Queue, Latency) now monitor strict danger bounds (e.g., CPU limit set to `< 80%`, Response Time `< 200ms`).
- **Dynamic Warnings**: Exceeding these thresholds instantly switches the metric cards to an animated **red warning state** with a pulsing highlight and a visual `AlertTriangle` warning icon.
- **Stress Simulator**: Administrators can toggle a **⚡ Simulate System Stress** trigger, which generates active telemetry fluctuations to demonstrate prompt alert states and system responsiveness under pressure.

### 3. Build & Type Optimization
- Tailored local configurations to align dev and build scripts with production parameters.
- Configured modular imports for seamless routing, local state caching, and high-performance SVG graphics rendering.

---

## 🚀 Running the App

### Frontend Dev Environment
To start the application locally:
```bash
npm install
npm run dev
```

The server binds directly to host `0.0.0.0` and port `3000` to stream asset changes instantly.

### Production Compiles
To run standard production bundling:
```bash
npm run build
npm run start
```
This produces optimized static outputs in `dist/` ready for Cloud Run container hosting.
