# shelter.py - Shelter registry and inventory optimization agent
# Tracks shelter occupancies, monitors supply balances, and plans resource reallocations.

import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

from backend.app.agents.tools import query_shelters, query_resources, allocate_resources

# =====================================================================
# AGENT SCHEMAS (Input / Output)
# =====================================================================

class ShelterNeed(BaseModel):
    category: str = Field(..., description="The type of supply short or needed: 'food', 'water', 'medical', 'shelter', 'fuel'.")
    quantity_required: int = Field(..., description="Estimated unit deficiency quantity.")
    priority: str = Field(..., description="Triage priority of the supply need: 'routine', 'urgent', 'critical'.")

class ResourceAllocationPlan(BaseModel):
    resource_id: str = Field(..., description="The unique ID of the source resource inventory.")
    source_shelter_id: str = Field(..., description="Shelter ID where resource is abundant.")
    destination_shelter_id: str = Field(..., description="Shelter ID with deficit.")
    quantity_to_transfer: int = Field(..., description="Unit volume of supply to reallocate.")
    justification: str = Field(..., description="Reasoning for this specific balancing transit.")

class ShelterInput(BaseModel):
    shelter_id: str = Field(..., description="Target shelter UUID to inspect or manage.")
    reported_needs: List[ShelterNeed] = Field(default=[], description="Active incoming resource requests reported by shelter leads.")
    allow_reallocation: bool = Field(default=True, description="Whether to compute balancing transit orders from neighboring depots.")

class ShelterOutput(BaseModel):
    shelter_name: str = Field(..., description="Registered name of the shelter.")
    occupancy_rate: float = Field(..., description="Percentage representing current occupancy relative to maximum capacity (0.0 to 100.0).")
    alert_status: str = Field(..., description="Calculated threat state: 'nominal', 'congested', 'hazardous_overcapacity'.")
    resource_deficits: List[str] = Field(..., description="Summarized shortfalls found across food, water, or medical parameters.")
    allocations_dispatched: List[ResourceAllocationPlan] = Field(..., description="Drafted supply transfers scheduled to correct imbalances.")

# =====================================================================
# AGENT DEFINITION & IMPLEMENTATION
# =====================================================================

class ShelterAgent:
    """
    Responsibilities:
    - Analyzes local shelter load profiles and capacity thresholds.
    - Audits real-time supply indexes (food, water, medical) across depots.
    - Resolves network balancing calculations to coordinate inter-shelter transit orders.
    - Automates dispatch schedules for logistics trucks.
    """

    def __init__(self):
        self.model_name = "gemini-3.5-flash"
        self.system_instruction = (
            "You are the Shelter and Inventory Allocation Agent of ReliefAI.\n\n"
            "Your main role is to track the physical populations and supplies of our emergency shelters. "
            "You have access to tools that query shelters, verify stocks, and authorize resource transfers. "
            "When deficits occur, you must draft balancing transit orders from neighboring shelters "
            "with surpluses, and log those orders using 'allocate_resources'."
        )

    def _get_client(self) -> genai.Client:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")
        return genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )

    def execute(self, data: ShelterInput) -> ShelterOutput:
        """
        Retrieves real-time shelter registries, audits current stock levels, and schedules supply shipments.
        """
        # 1. Gather baseline context via tools
        shelter_data = query_shelters()
        inventory_data = query_resources(shelter_id=data.shelter_id)

        client = self._get_client()
        prompt_content = (
            f"Target Shelter ID: {data.shelter_id}\n"
            f"Active Shelter Registries: {shelter_data}\n"
            f"Target Shelter Stock: {inventory_data}\n"
            f"Reported Incoming Needs: {data.reported_needs}\n"
            f"Allow Reallocation Check: {data.allow_reallocation}"
        )

        # 2. Call Gemini to calculate optimal reallocations
        response = client.models.generate_content(
            model=self.model_name,
            contents=prompt_content,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=ShelterOutput,
                temperature=0.1,
            )
        )

        if response.text:
            result = ShelterOutput.model_validate_json(response.text)
            
            # Execute allocation database inserts for each recommended transfer in the plan
            if data.allow_reallocation:
                for plan in result.allocations_dispatched:
                    allocate_resources(
                        resource_id=plan.resource_id,
                        source_shelter_id=plan.source_shelter_id,
                        destination_shelter_id=plan.destination_shelter_id,
                        quantity=plan.quantity_to_transfer
                    )
            return result
        else:
            raise RuntimeError("Shelter Agent failed to produce structured outputs.")
