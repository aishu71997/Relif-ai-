# ReliefAI Model Context Protocol Server Package

from backend.app.mcp.server import app as mcp_app, mcp_router
from backend.app.mcp.schemas import (
    SearchRequest, SearchResponse,
    RouteRequest, RouteResponse,
    WeatherRequest, WeatherResponse,
    TranslationRequest, TranslationResponse,
    DBQueryRequest, DBQueryResponse,
    EmailRequest, EmailResponse,
    SMSRequest, SMSResponse,
    PDFGenerationRequest, PDFGenerationResponse,
    VerificationRequest, VerificationResponse
)
