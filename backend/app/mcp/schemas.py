# schemas.py - Structured Data schemas for MCP Server payloads
# Enforces validation across Pydantic layers for tool requests and responses.

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# =====================================================================
# SEARCH TOOL SCHEMAS
# =====================================================================
class SearchRequest(BaseModel):
    query: str = Field(..., description="The query string to search for active alerts or news.")
    category: Optional[str] = Field(default="disaster", description="Filter search by category, e.g. 'disaster', 'weather', 'general'.")

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    published_at: str

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]

# =====================================================================
# MAPS TOOL SCHEMAS
# =====================================================================
class Coordinate(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate.")
    longitude: float = Field(..., description="Longitude coordinate.")

class RouteRequest(BaseModel):
    origin: Coordinate = Field(..., description="Starting coordinate.")
    destination: Coordinate = Field(..., description="Ending coordinate.")
    avoid_hazards: bool = Field(default=True, description="Whether to route around known active disaster points.")

class RouteResponse(BaseModel):
    distance_km: float
    estimated_time_mins: int
    waypoints: List[Coordinate]
    road_status: str
    safe_path: bool

# =====================================================================
# WEATHER TOOL SCHEMAS
# =====================================================================
class WeatherRequest(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate.")
    longitude: float = Field(..., description="Longitude coordinate.")

class WeatherResponse(BaseModel):
    temperature_c: float
    humidity_percent: int
    wind_speed_kmh: float
    precipitation_mm: float
    description: str
    is_unsafe: bool
    warnings: List[str]

# =====================================================================
# TRANSLATION TOOL SCHEMAS
# =====================================================================
class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text content to translate.")
    target_language: str = Field(..., description="Language to translate into (e.g., 'Spanish', 'Hindi', 'Tagalog').")

class TranslationResponse(BaseModel):
    detected_source: str
    translated_text: str
    confidence: float

# =====================================================================
# DATABASE TOOL SCHEMAS
# =====================================================================
class DBQueryRequest(BaseModel):
    table_name: str = Field(..., description="Name of the table to query: 'incidents', 'shelters', 'resources', 'profiles'.")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Key-value filters, e.g. {'status': 'open'}.")
    limit: int = Field(default=10, description="Maximum number of rows to retrieve.")

class DBQueryResponse(BaseModel):
    table_name: str
    rows: List[Dict[str, Any]]
    count: int

# =====================================================================
# EMAIL TOOL SCHEMAS
# =====================================================================
class EmailRequest(BaseModel):
    recipient_email: str = Field(..., description="Destination email address.")
    subject: str = Field(..., description="Subject heading of the alert.")
    body_markdown: str = Field(..., description="Markdown or plaintext body of the notification.")

class EmailResponse(BaseModel):
    success: bool
    message_id: str
    status: str

# =====================================================================
# SMS TOOL SCHEMAS
# =====================================================================
class SMSRequest(BaseModel):
    phone_number: str = Field(..., description="Recipient phone number with country code.")
    message: str = Field(..., description="Low-bandwidth message body (max 160 chars recommended).")

class SMSResponse(BaseModel):
    success: bool
    message_id: str
    status: str

# =====================================================================
# PDF TOOL SCHEMAS
# =====================================================================
class PDFGenerationRequest(BaseModel):
    title: str = Field(..., description="Title of the PDF Document.")
    author: str = Field(..., description="Commanding unit or officer generating the report.")
    content_markdown: str = Field(..., description="Markdown content to render inside the PDF document pages.")

class PDFGenerationResponse(BaseModel):
    success: bool
    filename: str
    download_url: str
    file_size_bytes: int

# =====================================================================
# NEWS VERIFICATION SCHEMAS
# =====================================================================
class VerificationRequest(BaseModel):
    claim_text: str = Field(..., description="The unverified claim or news story to evaluate.")

class VerificationResponse(BaseModel):
    is_verified: bool
    verdict: str
    confidence_score: float
    supporting_incidents: List[str]
    disproven_elements: List[str]
