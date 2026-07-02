# orchestrator.py - Primary ADK Swarm coordinator agent
# Parses complex incoming natural language, determines task trees, and delegates execution.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import query_incidents, query_shelters

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class TaskAssignment(BaseModel):
    task_id: str = Field(..., description="Unique ID for this specific task block.")
    agent_name: str = Field(..., description="Target agent to execute this task: 'emergency_agent', 'medical_agent', 'shelter_agent', 'volunteer_agent', 'translation_agent', 'fake_news_agent', 'report_agent', 'memory_agent'.")
    description: str = Field(..., description="Clear instructions for the target agent.")
    input_payload: Dict[str, Any] = Field(..., description="Required input parameters for the agent.")

class CoordinatorInput(BaseModel):
    query: str = Field(..., description="The main incoming natural language prompt or disaster alert.")
    history: List[Dict[str, str]] = Field(default=[], description="Previous conversation rounds for maintaining context.")
    current_context: Optional[Dict[str, Any]] = Field(default=None, description="Metadata such as current geographic location or active user role.")

class CoordinatorOutput(BaseModel):
    intent: str = Field(..., description="Identified disaster relief intent (e.g., 'rescue_coordination', 'medical_triage', 'inventory_allocation', 'broadcast_verification').")
    task_breakdown: List[TaskAssignment] = Field(..., description="Sequence of sub-tasks delegated to domain agents.")
    synthesized_response: str = Field(..., description="An empathetic, highly organized, and clear response summarizing the command plan.")
    next_steps: List[str] = Field(..., description="Actionable immediate checklist items for physical responders.")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class CoordinatorAgent:
    """
    Responsibilities:
    - Primary entry point of the multi-agent swarm.
    - Decodes incoming messages and establishes intent.
    - Resolves multi-step dependencies and schedules task sequences.
    - Delegates tasks to specific domain-expert agents.
    - Aggregates and synthesizes sub-agent telemetry reports.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"  # Standard text reasoning model
        self.system_instruction = (
            "You are the Swarm Coordinator Agent of ReliefAI – a multi-agent system designed for "
            "disaster response, medical field triage, and emergency supply chain logistics.\n\n"
            "Your main role is to act as the primary dispatcher. When a complex incident query arrives, "
            "you must break it down into specialized sub-tasks and assign them to your specialized "
            "domain-expert sub-agents. Keep your synthesized response professional, highly organized, "
            "humble, and clear of low-quality AI hype."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: CoordinatorInput) -> CoordinatorOutput:
        """
        Executes the main orchestration loop by invoking Gemini with Pydantic structured output.
        """
        client = self._get_client()
        prompt_content = (
            f"User Query: {data.query}\n"
            f"Context: {data.current_context or {}}\n"
            f"History: {data.history}"
        )

        # Call Gemini using the official google-genai SDK
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                tools=[query_incidents, query_shelters],
                response_mime_type="application/json",
                response_schema=CoordinatorOutput,
                temperature=0.2,
            )
        )

        # If the response needs Pydantic parsing
        if response.text:
            return CoordinatorOutput.model_validate_json(response.text)
        else:
            raise RuntimeError("Coordinator Agent failed to produce structured outputs.")
