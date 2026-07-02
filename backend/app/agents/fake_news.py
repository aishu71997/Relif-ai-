# fake_news.py - Rumor verification and misinformation mitigation agent
# Assesses incoming crowd-sourced alerts to verify veracity and prevent resource diversion.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import query_incidents, query_shelters

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class FakeNewsInput(BaseModel):
    claim_text: str = Field(..., description="The citizen report, social media post, or messaging thread reporting a crisis.")
    reported_location: Optional[str] = Field(default=None, description="Geographical location claimed in the text.")
    source_username_or_id: str = Field(default="anonymous", description="The source ID of the reporter for tracking reputation.")

class FakeNewsOutput(BaseModel):
    verification_status: str = Field(..., description="Factcheck result: 'verified', 'unverified_pending', 'suspicious_discrepancy', 'confirmed_hoax'.")
    credibility_score: float = Field(..., description="Calculated probability that the report is factual (0.0 to 1.0).")
    scam_or_panic_risk: str = Field(..., description="Assessed social panic or scam classification: 'low', 'moderate', 'high_panic_potential', 'financial_scam'.")
    discrepancy_details: Optional[str] = Field(default=None, description="Explanation of any mismatches with official shelter statuses or geographic coordinates.")
    suggested_verification_action: str = Field(..., description="Recommended actions to resolve ambiguity (e.g. 'Cross-reference with drone feed', 'Deploy nearby community leader to check').")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class FakeNewsAgent:
    """
    Responsibilities:
    - Filters crowdsourced feeds to identify hoaxes, duplicates, and scams.
    - Matches claims against verified active shelter capacities and reported incidents.
    - Prevents scarce physical responder units from being misdirected to non-existent emergencies.
    - Conducts linguistic triage to flag clickbait or fear-mongering patterns.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Fake News and Rumor Verification Agent of ReliefAI.\n\n"
            "Your main role is to act as a misinformation firewall. "
            "Examine the user claim text carefully and compare it to existing known logs of incidents and shelters. "
            "Analyze language patterns, look for coordinates that don't make geographical sense, and "
            "assign credibility ratings and verification actions. Be objective, clinical, and conservative in your ratings."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: FakeNewsInput) -> FakeNewsOutput:
        """
        Validates the truthfulness of crowd alerts against actual field telemetry registries.
        """
        # Load truth sources
        active_incidents = query_incidents()
        active_shelters = query_shelters()

        client = self._get_client()
        prompt_content = (
            f"Claim: {data.claim_text}\n"
            f"Reported Location Context: {data.reported_location}\n"
            f"Reporter: {data.source_username_or_id}\n"
            f"Verified Incident Base: {active_incidents}\n"
            f"Verified Shelter Base: {active_shelters}"
        )

        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=FakeNewsOutput,
                temperature=0.1,
            )
        )

        if response.text:
            return FakeNewsOutput.model_validate_json(response.text)
        else:
            raise RuntimeError("Fake News Agent failed to produce structured outputs.")
