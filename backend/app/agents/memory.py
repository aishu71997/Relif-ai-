# memory.py - Session continuity, historic lessons learned, and context memory agent
# Extracts long-term operational insights and caches high-impact incident details.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import query_incidents, query_shelters

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class MemoryInput(BaseModel):
    session_id: str = Field(..., description="Unique ID of the current deployment session.")
    dialogue_log: List[Dict[str, str]] = Field(..., description="Active messaging history or log records to digest.")
    incident_zone: Optional[str] = Field(default=None, description="The geographic district or area name to index memories against.")

class PersistedMemory(BaseModel):
    key: str = Field(..., description="The memory key or identifier (e.g., 'shelter_flooding_vulnerability', 'truck_clearance_restriction').")
    value: str = Field(..., description="The detailed insight, lesson, or fact extracted.")
    confidence_rating: float = Field(..., description="Assessed importance score of this fact (0.0 to 1.0).")

class MemoryOutput(BaseModel):
    extracted_insights: List[PersistedMemory] = Field(..., description="Key facts, historical constraints, or operational guidelines distilled from this dialogue.")
    suggested_caching_duration: str = Field(..., description="Recommended persistence level: 'transient_session', 'semi_permanent_30_days', 'indefinite_archive'.")
    historical_warnings_retrieved: List[str] = Field(..., description="Known risks previously logged in this specific incident zone.")
    suggested_preventative_policies: List[str] = Field(..., description="Policy suggestions derived from repeating bottlenecks (e.g. 'Prohibit heavy supply trucks on Route B when rainfall exceeds 50mm').")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class MemoryAgent:
    """
    Responsibilities:
    - Analyzes dialogue logs or post-incident reviews to extract insights.
    - Tracks and mitigates recurring bottlenecks.
    - Acts as a knowledge-base retriever for historical hazard behaviors in local sectors.
    - Persists relevant cache blocks across sessions.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Memory and Continuity Agent of ReliefAI.\n\n"
            "Your main role is to maintain long-term institutional intelligence. "
            "Scan raw dialogue strings or logs, extract critical learnings (operational mistakes, "
            "supply limitations, topographical blockages), match them to active zone parameters, "
            "and suggest preventative measures for upcoming shifts."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: MemoryInput) -> MemoryOutput:
        """
        Processes dialogue transcripts or reports to distill clean, structured memories.
        """
        # Cross-reference with current real-time database statuses
        incidents = query_incidents()
        shelters = query_shelters()

        client = self._get_client()
        prompt_content = (
            f"Session ID: {data.session_id}\n"
            f"Incident Zone Context: {data.incident_zone}\n"
            f"Raw Logs/Dialogue: {data.dialogue_log}\n"
            f"Active Database Incidents: {incidents}\n"
            f"Active Database Shelters: {shelters}"
        )

        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=MemoryOutput,
                temperature=0.1,
            )
        )

        if response.text:
            return MemoryOutput.model_validate_json(response.text)
        else:
            raise RuntimeError("Memory Agent failed to produce structured outputs.")
