# volunteers.py - Spontaneous Volunteer Registration & Task-Matching Router
# Couples incoming responder profiles directly to active disaster incidents via multi-agent matching.

import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.agents.volunteer import VolunteerAgent, VolunteerInput, VolunteerOutput
from backend.app.core.security import get_current_user

volunteers_router = APIRouter(prefix="/volunteers", tags=["Volunteer Coordination"])

# =====================================================================
# REQUEST / RESPONSE SCHEMAS
# =====================================================================

class VolunteerRegInput(BaseModel):
    name: str = Field(..., description="Volunteer's full name")
    skills: List[str] = Field(..., description="Technical skills: 'medical', 'driving', 'cooking', 'labor', 'first aid'")
    availability_hours: int = Field(..., gt=0, description="Consecutive hours of availability today")
    latitude: float = Field(..., description="Approximate current latitude")
    longitude: float = Field(..., description="Approximate current longitude")
    prefers_outdoor_sar: bool = Field(False, description="Willingness to join outdoor search and rescue crews")

class VolunteerRegistration(BaseModel):
    id: str
    name: str
    skills: List[str]
    availability_hours: int
    latitude: float
    longitude: float
    prefers_outdoor_sar: bool
    status: str = "registered"

# =====================================================================
# IN-MEMORY VOLUNTEER INDEX FOR MESH/LOCAL RESILIENCE
# =====================================================================
SIMULATED_VOLUNTEERS: List[Dict[str, Any]] = [
    {
        "id": "vol-91823a",
        "name": "Sarah Jenkins",
        "skills": ["medical", "first aid"],
        "availability_hours": 8,
        "latitude": 37.7712,
        "longitude": -122.4150,
        "prefers_outdoor_sar": False,
        "status": "matched"
    }
]

# =====================================================================
# ROUTE ENDPOINTS
# =====================================================================

@volunteers_router.get("", response_model=List[VolunteerRegistration])
def list_registered_volunteers() -> List[VolunteerRegistration]:
    """
    List all spontaneous community volunteers currently in the system database.
    """
    return [VolunteerRegistration(**vol) for vol in SIMULATED_VOLUNTEERS]

@volunteers_router.post("/register", response_model=VolunteerRegistration, status_code=status.HTTP_201_CREATED)
def register_volunteer(payload: VolunteerRegInput) -> VolunteerRegistration:
    """
    Register a spontaneous community member willing to provide physical labor, driving, or medical aid.
    """
    new_vol = {
        "id": f"vol-{uuid.uuid4().hex[:8]}",
        "name": payload.name,
        "skills": payload.skills,
        "availability_hours": payload.availability_hours,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "prefers_outdoor_sar": payload.prefers_outdoor_sar,
        "status": "registered"
    }
    SIMULATED_VOLUNTEERS.append(new_vol)
    return VolunteerRegistration(**new_vol)

@volunteers_router.post("/match/{volunteer_id}", response_model=VolunteerOutput)
def match_volunteer_to_task(volunteer_id: str) -> VolunteerOutput:
    """
    Invokes the Swarm Volunteer Agent to analyze an active volunteer, cross-reference
    them against available database incident logs, and dispatch a tailored safety and task instruction.
    """
    target_vol = None
    for vol in SIMULATED_VOLUNTEERS:
        if vol["id"] == volunteer_id:
            target_vol = vol
            break
            
    if not target_vol:
        raise HTTPException(
            status_code=404, 
            detail="Volunteer record not found. Please register first."
        )
        
    try:
        # Instantiate and execute the specialized Swarm Agent
        agent = VolunteerAgent()
        agent_input = VolunteerInput(
            volunteer_name=target_vol["name"],
            skills=target_vol["skills"],
            availability_hours=target_vol["availability_hours"],
            latitude=target_vol["latitude"],
            longitude=target_vol["longitude"],
            prefers_outdoor_sar=target_vol["prefers_outdoor_sar"]
        )
        
        assignment: VolunteerOutput = agent.execute(agent_input)
        
        # Mark volunteer status as matched
        target_vol["status"] = "matched"
        
        return assignment
    except Exception as e:
        print(f"Volunteer matching agent failed: {e}. Executing fast mathematical algorithm.")
        # Elegant heuristic-based standby matching plan
        matched_role = "General Relief Volunteer"
        facility = "Central Sports Arena Shelter"
        instructions = "Report to Deputy Coordinator Jane at the Main Arena Gate."
        
        if "medical" in target_vol["skills"] or "first aid" in target_vol["skills"]:
            matched_role = "Field Medical Assistant"
            instructions = "Report to Chief Medical Director on-site at the main triage tent."
        elif "driving" in target_vol["skills"]:
            matched_role = "Relief Supply Truck Driver"
            facility = "Eastside Logistics Warehouse Depot"
            instructions = "Proceed to the loading dock. Bring driver validation license."
            
        target_vol["status"] = "matched"
        
        return VolunteerOutput(
            assigned_role=matched_role,
            target_facility_or_site=facility,
            reporting_instructions=instructions,
            safety_checklist=[
                "Wear thick-soled leather boots and work gloves.",
                "Stay clear of active swift currents and overhead high-powerlines.",
                "Keep a personal radio link active and monitor zone channel 3."
            ],
            estimated_shift_summary=(
                f"Thank you, {target_vol['name']}. Your assignment as a {matched_role} at {facility} "
                f"will directly protect vulnerable people over the next {target_vol['availability_hours']} hours."
            )
        )
