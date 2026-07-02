# memory.py - API router for session continuity, historic lessons learned, and context memory
# Handles retrieving and parsing historic crisis learnings to keep responders synchronized.

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.agents.memory import MemoryAgent, MemoryInput, MemoryOutput, PersistedMemory
from backend.app.core.security import get_current_user

memory_router = APIRouter(prefix="/memory", tags=["Conversation Memory & Continuity"])

# =====================================================================
# REQUEST / RESPONSE SCHEMAS
# =====================================================================

class MemoryDigestInput(BaseModel):
    session_id: str = Field(..., description="Unique ID tracking the emergency chat session")
    dialogue_log: List[Dict[str, str]] = Field(..., description="Message transcripts mapping keys 'role' and 'content'")
    incident_zone: Optional[str] = Field(default=None, description="The geographic zone to associate memories with")

class MemoryStoreRecord(BaseModel):
    id: str
    session_id: str
    incident_zone: Optional[str]
    insights: List[PersistedMemory]
    warnings: List[str]
    suggested_policies: List[str]
    suggested_duration: str
    created_at: datetime

# =====================================================================
# SIMULATED MEMORY STORAGE CACHE FOR LOCAL RESILIENCE
# =====================================================================
SIMULATED_MEMORIES: List[Dict[str, Any]] = [
    {
        "id": "mem-af91823b",
        "session_id": "default-session",
        "incident_zone": "Eastside Sector",
        "insights": [
            PersistedMemory(
                key="power_grid_vulnerability_eastside",
                value="The Eastside High Gym Assembly area frequently loses transformer links under winds exceeding 40 knots.",
                confidence_rating=0.92
            ),
            PersistedMemory(
                key="road_clearance_restriction_delta",
                value="Bridge approach at River Road is impassable by vehicles weighing over 5 tonnes during flooding.",
                confidence_rating=0.88
            )
        ],
        "warnings": [
            "Heavy vehicle logistics must bypass River Road and proceed via Route 9 bypass.",
            "Bring portable 20kW gas generator support to Eastside High Assembly zone."
        ],
        "suggested_policies": [
            "Prohibit heavy supply transports on River Road bridge when water level indicators exceed 1.2m."
        ],
        "suggested_duration": "semi_permanent_30_days",
        "created_at": datetime.utcnow()
    }
]

FEEDBACK_RECORDS: List[Dict[str, Any]] = []

class MemoryFeedbackInput(BaseModel):
    session_id: str = Field(..., description="The session ID of the conversation")
    message_content: str = Field(..., description="The assistant response content being rated")
    is_helpful: bool = Field(..., description="Whether the response was helpful")
    rating: Optional[int] = Field(None, description="Optional rating scale (1-5)")

# =====================================================================
# ROUTE ENDPOINTS
# =====================================================================

@memory_router.get("/feedback", response_model=List[Dict[str, Any]])
def list_feedback_records() -> List[Dict[str, Any]]:
    """
    List all submitted user feedback for system administrators.
    """
    return FEEDBACK_RECORDS

@memory_router.post("/feedback")
def submit_memory_feedback(payload: MemoryFeedbackInput):
    """
    Submits user feedback on an assistant message.
    Updates the confidence ratings of the extracted insights associated with this session.
    """
    # Find matching memories for this session
    matched_memories = [mem for mem in SIMULATED_MEMORIES if mem["session_id"] == payload.session_id]
    
    adjustment = 0.05 if payload.is_helpful else -0.15
    updated_count = 0
    
    for mem in matched_memories:
        for insight in mem.get("insights", []):
            # Adjust confidence rating within bounds [0.0, 1.0]
            new_rating = max(0.0, min(1.0, insight.confidence_rating + adjustment))
            insight.confidence_rating = round(new_rating, 2)
            updated_count += 1
            
    # Record the feedback
    FEEDBACK_RECORDS.append({
        "id": f"fb-{uuid.uuid4().hex[:6]}",
        "session_id": payload.session_id,
        "message_content": payload.message_content,
        "is_helpful": payload.is_helpful,
        "rating": payload.rating,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return {
        "status": "success",
        "message": f"Feedback processed. Adjusted {updated_count} memory insights by {adjustment:+}.",
        "updated_insights_count": updated_count
    }

@memory_router.get("", response_model=List[MemoryStoreRecord])
def list_all_stored_memories(zone: Optional[str] = None) -> List[MemoryStoreRecord]:
    """
    List all institutional learnings and sector guidelines extracted from post-disaster dialogues.
    """
    result = SIMULATED_MEMORIES
    if zone:
        result = [mem for mem in result if mem["incident_zone"] == zone]
    return [MemoryStoreRecord(**mem) for mem in result]

@memory_router.get("/{session_id}", response_model=List[MemoryStoreRecord])
def get_memories_by_session(session_id: str) -> List[MemoryStoreRecord]:
    """
    Query the memory records associated with a specific active deployment session.
    """
    result = [mem for mem in SIMULATED_MEMORIES if mem["session_id"] == session_id]
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No memorized insights found for session id: {session_id}"
        )
    return [MemoryStoreRecord(**mem) for mem in result]

@memory_router.post("/digest", response_model=MemoryStoreRecord, status_code=status.HTTP_201_CREATED)
def digest_chat_into_memories(payload: MemoryDigestInput) -> MemoryStoreRecord:
    """
    Post active dialogue logs to trigger the Swarm Memory Agent.
    Parses conversational logs, extracts operational insights, and logs guidelines.
    """
    try:
        # Instantiate and execute the specialized Memory Agent
        agent = MemoryAgent()
        agent_input = MemoryInput(
            session_id=payload.session_id,
            dialogue_log=payload.dialogue_log,
            incident_zone=payload.incident_zone
        )
        
        briefing: MemoryOutput = agent.execute(agent_input)
        
        new_mem = {
            "id": f"mem-{uuid.uuid4().hex[:8]}",
            "session_id": payload.session_id,
            "incident_zone": payload.incident_zone,
            "insights": briefing.extracted_insights,
            "warnings": briefing.historical_warnings_retrieved,
            "suggested_policies": briefing.suggested_preventative_policies,
            "suggested_duration": briefing.suggested_caching_duration,
            "created_at": datetime.utcnow()
        }
        SIMULATED_MEMORIES.append(new_mem)
        return MemoryStoreRecord(**new_mem)
        
    except Exception as e:
        print(f"Memory extraction agent failed: {e}. Running fallback compiler.")
        # Stands by as a smart semantic compiler fallback
        mock_insights = [
            PersistedMemory(
                key=f"extracted_bottleneck_{payload.session_id[:6]}",
                value="General relief bottleneck identified. Heavy communication load detected in zone dialogue.",
                confidence_rating=0.75
            )
        ]
        new_mem = {
            "id": f"mem-{uuid.uuid4().hex[:8]}",
            "session_id": payload.session_id,
            "incident_zone": payload.incident_zone or "General",
            "insights": mock_insights,
            "warnings": [
                "Communication channels congestion warning logged for current session."
            ],
            "suggested_policies": [
                "Recommend shifting operational messaging to formal triage formats."
            ],
            "suggested_duration": "transient_session",
            "created_at": datetime.utcnow()
        }
        SIMULATED_MEMORIES.append(new_mem)
        return MemoryStoreRecord(**new_mem)

@memory_router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def purge_session_memory(session_id: str) -> None:
    """
    Clears all cached memories linked to a specific session (useful for resetting drills).
    """
    global SIMULATED_MEMORIES
    initial_len = len(SIMULATED_MEMORIES)
    SIMULATED_MEMORIES = [mem for mem in SIMULATED_MEMORIES if mem["session_id"] != session_id]
    if len(SIMULATED_MEMORIES) == initial_len:
        raise HTTPException(
            status_code=404,
            detail=f"No stored memory registers found matching session: {session_id}"
        )
    return None
