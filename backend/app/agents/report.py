# report.py - Situational report (SITREP) and public bulletin generation agent
# Consolidates database records and swarm inputs into structured, publication-grade summaries.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import query_incidents, query_shelters, query_resources

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class ReportInput(BaseModel):
    target_audience: str = Field(..., description="Target reader class: 'government_officials', 'ngo_directors', 'public_safety_bulletin', 'media'.")
    include_raw_telemetry: bool = Field(default=True, description="Whether to fetch and parse live database state variables.")
    time_window_hours: int = Field(default=24, description="Historical filter duration in hours.")
    supplementary_notes: Optional[str] = Field(default=None, description="Manual edits or override remarks provided by the field commander.")

class ReportOutput(BaseModel):
    report_title: str = Field(..., description="Official designated header (e.g. 'SITREP-24H: Coastal Flood Response').")
    situation_level: str = Field(..., description="Calculated national/regional response level: 'stable', 'minor_incident', 'regional_emergency', 'national_disaster'.")
    executive_summary: str = Field(..., description="A clear, structured, 2-paragraph overview of the status quo and major actions taken.")
    statistics_breakdown: Dict[str, Any] = Field(..., description="Consolidated metrics including open incidents count, shelters occupied percentage, and supply shortages.")
    critical_bottlenecks: List[str] = Field(..., description="Top obstacles requiring high-level intervention (e.g. 'Eastside shelter reaching 98% occupancy', 'Bridge block on route A remains unresolved').")
    complete_report_markdown: str = Field(..., description="Complete, formatted Markdown report featuring bold headings, bullet lists, and a professional layout.")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class ReportAgent:
    """
    Responsibilities:
    - Queries operational database states to obtain exact, verified statistics.
    - Filters metrics according to specified target audience restrictions.
    - Compiles multi-agent outputs and field diaries into official SITREP standards.
    - Generates markdown files for distribution, command boards, or media broadcast.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Situational Report (SITREP) Generation Agent of ReliefAI.\n\n"
            "Your main role is to formulate high-fidelity, structured briefings and public safety bulletins. "
            "You have tools to query the active database states. You must synthesize this raw data into "
            "a highly clear, formatted Markdown report. Adjust tone based on the target audience (e.g., highly "
            "formal for officials, easy-to-read for the public)."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: ReportInput) -> ReportOutput:
        """
        Gathers live field statistics, structures the narrative, and crafts publication-ready Markdown.
        """
        # Fetch actual state indicators to prevent report hallucination
        incidents = query_incidents()
        shelters = query_shelters()
        resources = query_resources()

        client = self._get_client()
        prompt_content = (
            f"Target Audience: {data.target_audience}\n"
            f"Time Window: Last {data.time_window_hours} hours\n"
            f"Manual Notes: {data.supplementary_notes}\n"
            f"Incident States: {incidents}\n"
            f"Shelter Capacities: {shelters}\n"
            f"Supply Inventories: {resources}"
        )

        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=ReportOutput,
                temperature=0.1,
            )
        )

        if response.text:
            return ReportOutput.model_validate_json(response.text)
        else:
            raise RuntimeError("Report Agent failed to produce structured outputs.")
