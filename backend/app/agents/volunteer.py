# volunteer.py - Spontaneous community volunteer coordination agent
# Evaluates skills, registers availability, and matches volunteers to open operational tasks.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import query_incidents, query_shelters

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class VolunteerInput(BaseModel):
    volunteer_name: str = Field(..., description="First and last name of the registering volunteer.")
    skills: List[str] = Field(..., description="List of capabilities (e.g. 'medical', 'driving', 'cooking', 'translation', 'physical labor', 'first aid').")
    availability_hours: int = Field(..., description="Consecutive hours available for work today.")
    latitude: float = Field(..., description="Approximate current latitude location of the volunteer.")
    longitude: float = Field(..., description="Approximate current longitude location of the volunteer.")
    prefers_outdoor_sar: bool = Field(default=False, description="Whether the user is willing to work outdoors with search & rescue units.")

class VolunteerOutput(BaseModel):
    assigned_role: str = Field(..., description="Assigned role (e.g. 'Field Medical Assistant', 'Shelter Kitchen Coordinator', 'Relief Supply Truck Driver', 'Debris Clearance Crew').")
    target_facility_or_site: str = Field(..., description="The name and description of the specific shelter or incident site to report to.")
    reporting_instructions: str = Field(..., description="Practical reporting instructions including the on-site supervisor's name and location guidance.")
    safety_checklist: List[str] = Field(..., description="Mandatory safety guidelines (e.g. 'Wear heavy boots', 'Do not enter swift waters alone', 'Stay hydrated').")
    estimated_shift_summary: str = Field(..., description="An empathetic, encouraging summary outlining the volunteer's contribution for the day.")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class VolunteerAgent:
    """
    Responsibilities:
    - Catalogs spontaneous local volunteer resources.
    - Decodes skill profiles to prevent unsafe assignments.
    - Queries active incident registers and shelter occupancy profiles.
    - Pairs volunteers with local proximity-based, skill-matched tasks.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Volunteer Coordination Agent of ReliefAI.\n\n"
            "Your main role is to coordinate human resources in disaster-affected areas. "
            "You must cross-reference volunteer profiles against the current active shelters and open incident registers "
            "to make safe, proximity-aware, and highly impactful assignments. Always include rigorous safety guidelines "
            "appropriate for the tasks."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: VolunteerInput) -> VolunteerOutput:
        """
        Coordinates spontaneous registrations against open tickets, issuing safe, structured role dispatches.
        """
        # Gather active contexts to locate open opportunities
        incidents = query_incidents()
        shelters = query_shelters()

        client = self._get_client()
        prompt_content = (
            f"Volunteer Name: {data.volunteer_name}\n"
            f"Capabilities: {data.skills}\n"
            f"Availability: {data.availability_hours} hours\n"
            f"Location: [{data.latitude}, {data.longitude}]\n"
            f"Prefers SAR: {data.prefers_outdoor_sar}\n"
            f"Active Incidents: {incidents}\n"
            f"Active Shelters: {shelters}"
        )

        # Call Gemini to get the structured volunteer assignment
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=VolunteerOutput,
                temperature=0.2,
            )
        )

        if response.text:
            return VolunteerOutput.model_validate_json(response.text)
        else:
            raise RuntimeError("Volunteer Agent failed to produce structured outputs.")
