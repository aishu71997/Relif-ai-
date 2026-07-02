# incidents.py - API router for local/mesh disaster incident records
# Handles reporting, status transitions, priority classifications, and spatial queries.

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.db.supabase_client import get_supabase_client
from backend.app.db.models import (
    IncidentCreate, IncidentUpdate, IncidentResponse, IncidentStatus, IncidentPriority,
    TriageRecordCreate, TriageRecordResponse, TriageTag
)
from backend.app.core.security import get_current_user, RoleChecker
from backend.app.db.models import UserRole

incidents_router = APIRouter(prefix="/incidents", tags=["Emergency Incidents"])

# =====================================================================
# SIMULATED LOCAL INCIDENT STORAGE FOR OFFLINE / OFFLINE MESH LABELS
# =====================================================================
SIMULATED_INCIDENTS: List[Dict[str, Any]] = [
    {
        "id": "e30db991-da57-4b77-80be-7e9b088fb98a",
        "title": "Severe River Road Bridge Collapse",
        "description": "Flash flooding has swept away the primary structural bridge columns. Citizens isolated.",
        "status": "open",
        "priority": "critical",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "reported_by": "e7c6530a-9d22-4df3-8f0a-6e54e4bb16fa",
        "assigned_to": None,
        "resolved_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "c19b22a0-40db-46e2-9be3-f97a514d2ba0",
        "title": "Eastside High Gym Powerlines Cut",
        "description": "High wind gusts knocked down power transformers near the primary assembly depot.",
        "status": "assigned",
        "priority": "high",
        "latitude": 37.7649,
        "longitude": -122.3994,
        "reported_by": "e7c6530a-9d22-4df3-8f0a-6e54e4bb16fa",
        "assigned_to": "00000000-0000-0000-0000-000000000000",
        "resolved_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

SIMULATED_TRIAGE_RECORDS: List[Dict[str, Any]] = [
    {
        "id": "8b2cd103-9ef2-4f3b-ba2d-20d0f19a2b53",
        "incident_id": "e30db991-da57-4b77-80be-7e9b088fb98a",
        "patient_name": "John Miller",
        "triage_tag": "red",
        "respirations": 32,
        "pulse": 110,
        "mental_status": "unresponsive",
        "critical_injuries": "Severe crushing injury to left thigh.",
        "first_responder_id": "00000000-0000-0000-0000-000000000000",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

# =====================================================================
# ROUTE ENDPOINTS
# =====================================================================

@incidents_router.get("", response_model=List[IncidentResponse])
def get_incidents(status: Optional[IncidentStatus] = None) -> List[IncidentResponse]:
    """
    Retrieves all open, assigned, or resolved incidents. Supports fast filtering.
    """
    try:
        supabase = get_supabase_client()
        query = supabase.table("incidents").select("*")
        if status:
            query = query.eq("status", status.value)
        response = query.order("created_at", desc=True).execute()
        
        output = []
        for row in response.data:
            output.append(IncidentResponse(
                id=row["id"],
                title=row["title"],
                description=row["description"],
                status=IncidentStatus(row["status"]),
                priority=IncidentPriority(row["priority"]),
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                reported_by=uuid.UUID(row["reported_by"]) if row.get("reported_by") else None,
                assigned_to=uuid.UUID(row["assigned_to"]) if row.get("assigned_to") else None,
                resolved_at=datetime.fromisoformat(row["resolved_at"].replace("Z", "+00:00")) if row.get("resolved_at") else None,
                created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00"))
            ))
        return output
    except Exception as e:
        print(f"Supabase incidents fetch fallback active: {e}")
        # Apply standard filter on simulated list
        result = SIMULATED_INCIDENTS
        if status:
            result = [inc for inc in result if inc["status"] == status.value]
        return [IncidentResponse(**inc) for inc in result]

@incidents_router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def report_incident(payload: IncidentCreate, current_user: dict = Depends(get_current_user)) -> IncidentResponse:
    """
    Submit a new crisis incident report. Automatically parses spatial coordinates into PostGIS nodes.
    """
    reported_by_id = current_user.get("id")
    geom_point = f"POINT({payload.longitude} {payload.latitude})"
    
    try:
        supabase = get_supabase_client()
        data = {
            "title": payload.title,
            "description": payload.description,
            "status": payload.status.value,
            "priority": payload.priority.value,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "location": geom_point,
            "reported_by": reported_by_id if reported_by_id != "00000000-0000-0000-0000-000000000000" else None
        }
        
        response = supabase.table("incidents").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Database write returned empty result.")
            
        row = response.data[0]
        return IncidentResponse(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            status=IncidentStatus(row["status"]),
            priority=IncidentPriority(row["priority"]),
            latitude=float(row["latitude"]),
            longitude=float(row["longitude"]),
            reported_by=uuid.UUID(row["reported_by"]) if row.get("reported_by") else None,
            assigned_to=uuid.UUID(row["assigned_to"]) if row.get("assigned_to") else None,
            resolved_at=None,
            created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00"))
        )
    except Exception as e:
        print(f"Supabase incident insert fallback active: {e}")
        # Append to simulations
        new_inc = {
            "id": str(uuid.uuid4()),
            "title": payload.title,
            "description": payload.description,
            "status": payload.status.value,
            "priority": payload.priority.value,
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "reported_by": reported_by_id,
            "assigned_to": None,
            "resolved_at": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        SIMULATED_INCIDENTS.insert(0, new_inc)
        return IncidentResponse(**new_inc)

@incidents_router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_by_id(incident_id: uuid.UUID) -> IncidentResponse:
    """
    Retrieves the exact incident details requested.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table("incidents").select("*").eq("id", str(incident_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Incident with this ID does not exist.")
            
        row = response.data[0]
        return IncidentResponse(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            status=IncidentStatus(row["status"]),
            priority=IncidentPriority(row["priority"]),
            latitude=float(row["latitude"]),
            longitude=float(row["longitude"]),
            reported_by=uuid.UUID(row["reported_by"]) if row.get("reported_by") else None,
            assigned_to=uuid.UUID(row["assigned_to"]) if row.get("assigned_to") else None,
            resolved_at=datetime.fromisoformat(row["resolved_at"].replace("Z", "+00:00")) if row.get("resolved_at") else None,
            created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00"))
        )
    except Exception as e:
        print(f"Supabase incident details fetch fallback active: {e}")
        for inc in SIMULATED_INCIDENTS:
            if str(inc["id"]) == str(incident_id):
                return IncidentResponse(**inc)
        raise HTTPException(status_code=404, detail="Incident not found in simulated or live storage.")

@incidents_router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: uuid.UUID, 
    payload: IncidentUpdate, 
    current_user: dict = Depends(RoleChecker([UserRole.RESPONDER, UserRole.NGO_LEAD]))
) -> IncidentResponse:
    """
    Updates crisis details, assigns units, or marks incidents as resolved.
    """
    try:
        supabase = get_supabase_client()
        update_data = {}
        if payload.title is not None:
            update_data["title"] = payload.title
        if payload.description is not None:
            update_data["description"] = payload.description
        if payload.status is not None:
            update_data["status"] = payload.status.value
            if payload.status == IncidentStatus.RESOLVED:
                update_data["resolved_at"] = datetime.utcnow().isoformat()
        if payload.priority is not None:
            update_data["priority"] = payload.priority.value
        if payload.latitude is not None:
            update_data["latitude"] = payload.latitude
        if payload.longitude is not None:
            update_data["longitude"] = payload.longitude
        if payload.assigned_to is not None:
            update_data["assigned_to"] = str(payload.assigned_to)

        response = supabase.table("incidents").update(update_data).eq("id", str(incident_id)).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Incident not found to update.")
            
        row = response.data[0]
        return IncidentResponse(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            status=IncidentStatus(row["status"]),
            priority=IncidentPriority(row["priority"]),
            latitude=float(row["latitude"]),
            longitude=float(row["longitude"]),
            reported_by=uuid.UUID(row["reported_by"]) if row.get("reported_by") else None,
            assigned_to=uuid.UUID(row["assigned_to"]) if row.get("assigned_to") else None,
            resolved_at=datetime.fromisoformat(row["resolved_at"].replace("Z", "+00:00")) if row.get("resolved_at") else None,
            created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00"))
        )
    except Exception as e:
        print(f"Supabase incident patching fallback active: {e}")
        for inc in SIMULATED_INCIDENTS:
            if str(inc["id"]) == str(incident_id):
                if payload.title is not None:
                    inc["title"] = payload.title
                if payload.description is not None:
                    inc["description"] = payload.description
                if payload.status is not None:
                    inc["status"] = payload.status.value
                    if payload.status == IncidentStatus.RESOLVED:
                        inc["resolved_at"] = datetime.utcnow()
                if payload.priority is not None:
                    inc["priority"] = payload.priority.value
                if payload.latitude is not None:
                    inc["latitude"] = payload.latitude
                if payload.longitude is not None:
                    inc["longitude"] = payload.longitude
                if payload.assigned_to is not None:
                    inc["assigned_to"] = payload.assigned_to
                inc["updated_at"] = datetime.utcnow()
                return IncidentResponse(**inc)
        raise HTTPException(status_code=404, detail="Incident not found in simulated or live storage.")

# =====================================================================
# FIELD MEDICAL TRIAGE LOGS
# =====================================================================

@incidents_router.post("/{incident_id}/triage", response_model=TriageRecordResponse, status_code=status.HTTP_201_CREATED)
def add_triage_record(
    incident_id: uuid.UUID,
    payload: TriageRecordCreate,
    current_user: dict = Depends(RoleChecker([UserRole.MEDICAL_STAFF, UserRole.RESPONDER]))
) -> TriageRecordResponse:
    """
    Submit a medical triage assessment log associated with an emergency scene.
    """
    responder_id = current_user.get("id")
    
    try:
        supabase = get_supabase_client()
        data = {
            "incident_id": str(incident_id),
            "patient_name": payload.patient_name,
            "triage_tag": payload.triage_tag.value,
            "respirations": payload.respirations,
            "pulse": payload.pulse,
            "mental_status": payload.mental_status,
            "critical_injuries": payload.critical_injuries,
            "first_responder_id": responder_id if responder_id != "00000000-0000-0000-0000-000000000000" else None
        }
        
        response = supabase.table("triage_records").insert(data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Triage registration failed.")
            
        row = response.data[0]
        return TriageRecordResponse(
            id=row["id"],
            incident_id=uuid.UUID(row["incident_id"]) if row.get("incident_id") else None,
            patient_name=row["patient_name"],
            triage_tag=TriageTag(row["triage_tag"]),
            respirations=row.get("respirations"),
            pulse=row.get("pulse"),
            mental_status=row.get("mental_status"),
            critical_injuries=row.get("critical_injuries"),
            first_responder_id=uuid.UUID(row["first_responder_id"]) if row.get("first_responder_id") else None,
            created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00"))
        )
    except Exception as e:
        print(f"Supabase triage insert fallback active: {e}")
        new_tr = {
            "id": str(uuid.uuid4()),
            "incident_id": incident_id,
            "patient_name": payload.patient_name,
            "triage_tag": payload.triage_tag.value,
            "respirations": payload.respirations,
            "pulse": payload.pulse,
            "mental_status": payload.mental_status,
            "critical_injuries": payload.critical_injuries,
            "first_responder_id": responder_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        SIMULATED_TRIAGE_RECORDS.insert(0, new_tr)
        return TriageRecordResponse(**new_tr)

@incidents_router.get("/{incident_id}/triage", response_model=List[TriageRecordResponse])
def get_incident_triage_records(
    incident_id: uuid.UUID,
    current_user: dict = Depends(RoleChecker([UserRole.MEDICAL_STAFF, UserRole.RESPONDER]))
) -> List[TriageRecordResponse]:
    """
    List all clinical triage assessment records logged for a specific disaster incident.
    """
    try:
        supabase = get_supabase_client()
        response = supabase.table("triage_records").select("*").eq("incident_id", str(incident_id)).execute()
        
        output = []
        for row in response.data:
            output.append(TriageRecordResponse(
                id=row["id"],
                incident_id=uuid.UUID(row["incident_id"]) if row.get("incident_id") else None,
                patient_name=row["patient_name"],
                triage_tag=TriageTag(row["triage_tag"]),
                respirations=row.get("respirations"),
                pulse=row.get("pulse"),
                mental_status=row.get("mental_status"),
                critical_injuries=row.get("critical_injuries"),
                first_responder_id=uuid.UUID(row["first_responder_id"]) if row.get("first_responder_id") else None,
                created_at=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00"))
            ))
        return output
    except Exception as e:
        print(f"Supabase triage fetch fallback active: {e}")
        return [
            TriageRecordResponse(**tr) 
            for tr in SIMULATED_TRIAGE_RECORDS 
            if str(tr["incident_id"]) == str(incident_id)
        ]
