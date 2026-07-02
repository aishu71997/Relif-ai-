# main.py - FastAPI application entrypoint
# Configures routers, MCP server mounts, middleware, and health endpoints.

import os
from datetime import datetime
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.api.endpoints.auth import auth_router
from backend.app.api.endpoints.incidents import incidents_router
from backend.app.api.endpoints.volunteers import volunteers_router
from backend.app.api.endpoints.resources import resources_router
from backend.app.api.endpoints.reports import reports_router
from backend.app.api.endpoints.chat import chat_router
from backend.app.api.endpoints.memory import memory_router

# Attempt importing MCP router safely to maintain full system completeness
try:
    from backend.app.mcp import mcp_router
except Exception as e:
    print(f"MCP Server Router import bypassed or unavailable: {e}")
    mcp_router = None

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Full-stack disaster dispatch, clinical field triage, and logistics multi-agent workspace gateway.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# =====================================================================
# CORS MIDDLEWARE
# =====================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits direct communication from Next.js clients
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# ROUTER REGISTRATION
# =====================================================================
api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(incidents_router)
api_router.include_router(volunteers_router)
api_router.include_router(resources_router)
api_router.include_router(reports_router)
api_router.include_router(chat_router)
api_router.include_router(memory_router)

app.include_router(api_router)

# Include MCP if present
if mcp_router:
    app.include_router(mcp_router, prefix="/api/mcp", tags=["Model Context Protocol"])

# =====================================================================
# GLOBAL HEALTH / SYSTEM STATUS ENDPOINTS
# =====================================================================

@app.get("/", tags=["System Overview"])
def get_system_root() -> dict:
    """
    Root status endpoint providing active service metadata.
    """
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "api_docs_url": "/docs",
        "message": "ReliefAI Dispatcher API Gateway running on Cloud Run."
    }

@app.get("/api/health", tags=["System Overview"])
def get_health_check() -> dict:
    """
    Standard load-balancer health endpoint.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() if "datetime" in globals() else "current",
        "database_connected": bool(settings.SUPABASE_KEY and settings.SUPABASE_URL),
        "ai_engine_configured": bool(os.environ.get("GEMINI_API_KEY"))
    }

if __name__ == "__main__":
    import uvicorn
    # Permits starting server locally with Python directly
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)
