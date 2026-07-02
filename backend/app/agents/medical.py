# medical.py - Emergency field medical triage advisory agent
# Runs classification scoring to generate field triage priority color-coding on trauma cases.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import create_triage_record

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class MedicalInput(BaseModel):
    incident_id: str = Field(..., description="Active incident UUID associated with the triage site.")
    patient_name: str = Field(default="Unknown / John Doe", description="Patient name or description if unidentified.")
    respirations: int = Field(..., description="Respiratory rate (breaths per minute).")
    pulse: int = Field(..., description="Radial pulse rate (beats per minute) or capillary refill index.")
    mental_status: str = Field(..., description="Mental orientation details (e.g. 'obeys commands', 'unresponsive', 'confused').")
    visible_injuries: Optional[str] = Field(default="None visible", description="Anatomical description of bleeding, fractures, or burns.")

class MedicalOutput(BaseModel):
    triage_tag: str = Field(..., description="Standard clinical START tag color-code: 'green' (Minor), 'yellow' (Delayed), 'red' (Immediate), 'black' (Expectant).")
    classification_reasoning: str = Field(..., description="Concise explanation justifying the START classification based on respiratory, circulatory, and neurological vitals.")
    stabilization_steps: List[str] = Field(..., description="Immediate, bite-sized field medical stabilizing tasks (e.g. 'Apply direct pressure to femoral bleed', 'Tilt head back to open airway').")
    transport_urgency: str = Field(..., description="Urgency scale for evacuation: 'immediate', 'delayed', 'routine', 'none'.")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class MedicalAgent:
    """
    Responsibilities:
    - Analyzes basic physiological parameters reported by field responders.
    - Resolves START (Simple Triage and Rapid Treatment) algorithm pathways.
    - Saves formal clinical records into Supabase for hospital integration.
    - Instructs responders on immediate field trauma management.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Medical Triage Advisor Agent of ReliefAI.\n\n"
            "Your main role is to execute START triage logic based on user inputs:\n"
            "1. If Respirations > 30, tag is RED.\n"
            "2. If Radial Pulse is absent or Capillary Refill > 2s, tag is RED.\n"
            "3. If patient cannot follow simple commands (Mental Status is confused/unresponsive), tag is RED.\n"
            "4. If patient follows commands, has normal respirations and pulse, but has major injuries, tag is YELLOW.\n"
            "5. If injuries are minor (walking wounded), tag is GREEN.\n"
            "6. If no signs of life, tag is BLACK.\n\n"
            "You must save triage logs via 'create_triage_record' and return clean medical guidelines."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: MedicalInput) -> MedicalOutput:
        """
        Conducts START clinical scoring, logs record, and yields field trauma procedures.
        """
        client = self._get_client()
        prompt_content = (
            f"Incident ID: {data.incident_id}\n"
            f"Patient: {data.patient_name}\n"
            f"Vitals: {data.respirations} resp/min, {data.pulse} pulse/min\n"
            f"Neurological: {data.mental_status}\n"
            f"Trauma: {data.visible_injuries}"
        )

        # Call Gemini to get the START tag and stabilization steps
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=MedicalOutput,
                temperature=0.1,
            )
        )

        if response.text:
            result = MedicalOutput.model_validate_json(response.text)
            
            # Log the triage tag to the DB using the output category
            create_triage_record(
                incident_id=data.incident_id,
                patient_name=data.patient_name,
                triage_tag=result.triage_tag,
                respirations=data.respirations,
                pulse=data.pulse,
                mental_status=data.mental_status,
                critical_injuries=data.visible_injuries
            )
            return result
        else:
            raise RuntimeError("Medical Agent failed to produce structured outputs.")
