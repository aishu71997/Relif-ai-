# ReliefAI Frontend Application

This directory contains the Next.js 15 frontend application for **ReliefAI – AI Disaster Relief & Community Support Agent**, optimized for the Kaggle AI Agents Intensive Capstone.

## Stack
- **Next.js 15** (App Router Architecture)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Shadcn UI** (Radix-backed accessible UI component patterns)
- **Framer Motion** (Fluid micro-interactions and route transitions)

## Directory Structure
```text
frontend/
├── package.json                # Project dependencies and workspace scripts
├── tsconfig.json               # TypeScript path mapping and compilation options
├── tailwind.config.ts          # Tailwind CSS layout, colors, and font-family config
├── README.md                   # Frontend documentation
├── app/                        # Next.js 15 App Router routing & layout pages
│   ├── layout.tsx              # Root Layout, HTML headers, metadata, and fonts
│   ├── page.tsx                # Main active disaster command dashboard
│   ├── incidents/
│   │   └── page.tsx            # Emergency incidents logging and GIS reporting portal
│   └── logistics/
│   │   └── page.tsx            # Relief supply warehousing & transport planner
├── components/                 # Reusable UI component modules
│   ├── agent-terminal.tsx      # Terminal UI to interact with the Google ADK Swarm
│   ├── incident-map.tsx        # Vector GIS canvas overlay representing coordinates
│   └── ui/                     # Shadcn UI primitives
│       ├── button.tsx          # Accessible interactive button component
│       ├── card.tsx            # Stylized display panels with bold typography borders
│       └── dialog.tsx          # Modal overlays for clinical assessments & audits
├── hooks/                      # Custom React hooks
│   ├── use-swarm.ts            # Coordinates streaming states from the ADK orchestrator
│   └── use-local-storage.ts    # Fallback client caching for network-loss resilience
├── services/                   # Network data interaction layers
│   ├── api.ts                  # Axios/Fetch wrapper connecting to the FastAPI gateways
│   └── websocket.ts            # Client-side real-time Supabase replication subscription channel
├── lib/                        # Shared libraries and third-party setups
│   └── utils.ts                # Tailwind merge and clsx class-name consolidator (Shadcn cn)
├── types/                      # Shared static TypeScript compilation interfaces
│   └── index.ts                # Schema declarations for Incidents, Resources, and Agents
├── styles/                     # Global styles and presets
│   └── globals.css             # CSS variables, typography imports, and custom animations
└── utils/                      # Low-level pure helper functions
    └── helpers.ts              # Geospatial distance and triage priority math scoring
```
