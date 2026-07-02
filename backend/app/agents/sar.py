# sar.py - Search and Rescue tactical coordinator agent
# Computes traversal priority, updates casualty coordinate logs, and guides first responder sweeps.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import create_incident, query_incidents

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class EmergencyInput(BaseModel):
    title: str = Field(..., description="Short identifier of the crisis or blockage.")
    hazard_description: str = Field(..., description="Details regarding physical entrapments, structural collapses, floods, or wildfires.")
    latitude: float = Field(..., description="Latitude of the emergency location.")
    longitude: float = Field(..., description="Longitude of the emergency location.")
    reported_casualties_count: int = Field(default=0, description="Estimated number of victims requiring active rescue.")
    weather_status: Optional[str] = Field(default="Clear", description="Current weather conditions (e.g. heavy rain, wind, night, smoke).")

class EmergencyOutput(BaseModel):
    hazard_severity: str = Field(..., description="Severity level: 'low', 'moderate', 'severe', 'extreme'.")
    priority_tier: str = Field(..., description="Priority mapping for dispatchers: 'low', 'medium', 'high', 'critical'.")
    immediate_safety_instructions: List[str] = Field(..., description="Immediate survival instructions for citizens/responders on site.")
    recommended_equipment: List[str] = Field(..., description="Required items (e.g., heavy machinery, rubber boats, water pumps, life vests).")
    extraction_route_advice: str = Field(..., description="Strategic recommendations on safe approaches avoiding noted barriers.")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class EmergencyAgent:
    """
    Responsibilities:
    - Analyzes local hazard physical parameters (structural, aquatic, chemical, thermal).
    - Translates terrain vulnerabilities and weather constraints into safety briefs.
    - Log incidents directly into the central disaster mapping database for GIS representation.
    - Dispatches recommended equipment lists for Search and Rescue teams.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Search and Rescue (SAR) / Emergency Agent of ReliefAI.\n\n"
            "Your main role is to assess tactical field emergencies and prioritize sweeps. "
            "Using the provided geographical parameters and casualty metrics, you must compute severity levels "
            "and yield localized safety instructions. Keep instructions concrete, clear, actionable, "
            "and strictly relevant to the crisis environment."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: EmergencyInput) -> EmergencyOutput:
        """
        Processes emergency details, submits database records, and generates structured tactical reports.
        """
        # 1. Invoke database logging tool to create record
        create_incident(
            title=data.title,
            description=data.hazard_description,
            latitude=data.latitude,
            longitude=data.longitude,
            priority="critical" if data.reported_casualties_count > 5 else "high"
        )

        client = self._get_client()
        prompt_content = (
            f"Location: [{data.latitude}, {data.longitude}]\n"
            f"Alert: {data.title} - {data.hazard_description}\n"
            f"Vulnerability count: {data.reported_casualties_count}\n"
            f"Weather factor: {data.weather_status}"
        )

        # 2. Call Gemini for strategic search and rescue guidance
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=EmergencyOutput,
                temperature=0.1,
            )
        )

        if response.text:
            return EmergencyOutput.model_validate_json(response.text)
        else:
            raise RuntimeError("Emergency Agent failed to produce structured outputs.")
