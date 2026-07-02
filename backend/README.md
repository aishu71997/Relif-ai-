# ReliefAI Backend Service

This directory contains the Python FastAPI backend service for **ReliefAI – AI Disaster Relief & Community Support Agent**, optimized for the Kaggle AI Agents Intensive Capstone.

## Stack
- **Python 3.11+**
- **FastAPI** (High-performance web API framework)
- **Google ADK** (Multi-agent orchestration framework)
- **Google GenAI / Gemini** (LLM Intelligence)
- **MCP Server** (Model Context Protocol bridge for edge/local connectivity)
- **Supabase** (PostgreSQL, Real-time sub/pub, and PostGIS Geospatial extensions)

## Directory Structure
```text
backend/
├── .env.example                # Example environment variable template
├── Dockerfile                  # Container build configuration
├── requirements.txt            # Python dependencies package manifest
├── README.md                   # Backend documentation
└── app/
    ├── __init__.py
    ├── main.py                 # FastAPI application entry point
    ├── config.py               # Settings and configuration management (Pydantic-settings)
    ├── api/                    # API router and endpoints
    │   ├── __init__.py
    │   └── endpoints/
    │       ├── __init__.py
    │       ├── agents.py       # Interacts with the ADK Swarm Orchestrator
    │       ├── incidents.py    # Incident logging and status updates
    │       └── resources.py    # Disaster supply logistics management
    ├── agents/                 # Google ADK agent configurations and prompts
    │   ├── __init__.py
    │   ├── orchestrator.py     # Main routing orchestrator agent
    │   ├── logistics.py        # Supply chain optimization agent
    │   ├── sar.py              # Search and Rescue routing agent
    │   ├── medical.py          # Clinical Triage advisory agent
    │   └── tools.py            # Shared utility schemas and functions for agents
    ├── mcp/                    # Model Context Protocol Server integration
    │   ├── __init__.py
    │   ├── server.py           # FastMCP server registration and setup
    │   └── schemas.py          # Input/Output schemas for MCP tools
    ├── db/                     # Supabase database interfaces
    │   ├── __init__.py
    │   ├── supabase_client.py  # Supabase client instantiation and wrappers
    │   └── models.py           # Pydantic or SQLModel representations
    └── core/                   # Core security and middleware components
        ├── __init__.py
        └── security.py         # OAuth2 password flow, JWT tokens, and RBAC policies
```
