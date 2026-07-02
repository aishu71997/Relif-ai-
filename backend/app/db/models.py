# models.py - Database relational mappings and Pydantic validation schemas
# Represents database tables as validated Pydantic models for request ingestion.

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, condecimal
from uuid import UUID

# =====================================================================
# ENUMS DEFINITIONS (Matches DB Schema Types)
# =====================================================================

class UserRole(str, Enum):
    RESPONDER = "responder"
    NGO_LEAD = "ngo_lead"
    MEDICAL_STAFF = "medical_staff"
    COMMUNITY_LEADER = "community_leader"

class IncidentStatus(str, Enum):
    OPEN = "open"
    ASSIGNED = "assigned"
    RESOLVED = "resolved"

class IncidentPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ResourceCategory(str, Enum):
    MEDICAL = "medical"
    FOOD = "food"
    WATER = "water"
    SHELTER = "shelter"
    FUEL = "fuel"

class AllocationStatus(str, Enum):
    PENDING = "pending"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class TriageTag(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"
    BLACK = "black"

# =====================================================================
# SCHEMAS: USER PROFILE
# =====================================================================

class ProfileBase(BaseModel):
    full_name: str = Field(..., max_length=255, description="Full name of the user")
    role: UserRole = Field(UserRole.COMMUNITY_LEADER, description="The designated disaster relief role")
    phone_number: Optional[str] = Field(None, max_length=50, description="Contact phone number")
    organization: Optional[str] = Field(None, max_length=150, description="Affiliated agency or NGO")

class ProfileCreate(ProfileBase):
    id: UUID = Field(..., description="Corresponds to Supabase Auth UID")

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    role: Optional[UserRole] = None
    phone_number: Optional[str] = Field(None, max_length=50)
    organization: Optional[str] = Field(None, max_length=150)

class ProfileResponse(ProfileBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =====================================================================
# SCHEMAS: SHELTERS
# =====================================================================

class ShelterBase(BaseModel):
    name: str = Field(..., max_length=255, description="Shelter name")
    description: Optional[str] = None
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    max_capacity: int = Field(..., gt=0, description="Maximum holding capacity")
    current_occupancy: int = Field(0, ge=0, description="Current occupancy count")
    status: str = Field("operational", description="Status: 'operational', 'full', 'damaged', 'closed'")
    contact_phone: Optional[str] = Field(None, max_length=50)

class ShelterCreate(ShelterBase):
    pass

class ShelterUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_capacity: Optional[int] = Field(None, gt=0)
    current_occupancy: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None
    contact_phone: Optional[str] = Field(None, max_length=50)

class ShelterResponse(ShelterBase):
    id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =====================================================================
# SCHEMAS: INCIDENTS (EMERGENCY REQUESTS)
# =====================================================================

class IncidentBase(BaseModel):
    title: str = Field(..., max_length=255, description="Incident summary or alert")
    description: str = Field(..., description="Detailed description of blockage/threat")
    status: IncidentStatus = Field(IncidentStatus.OPEN)
    priority: IncidentPriority = Field(IncidentPriority.MEDIUM)
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[IncidentStatus] = None
    priority: Optional[IncidentPriority] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    assigned_to: Optional[UUID] = None

class IncidentResponse(IncidentBase):
    id: UUID
    reported_by: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =====================================================================
# SCHEMAS: RESOURCES
# =====================================================================

class ResourceBase(BaseModel):
    name: str = Field(..., max_length=255, description="Item name")
    category: ResourceCategory = Field(..., description="Category: medical, food, water, etc.")
    quantity: int = Field(0, ge=0, description="Available stock quantity")
    unit: str = Field(..., max_length=50, description="Unit e.g. 'liters', 'boxes', 'kg'")
    shelter_id: UUID = Field(..., description="Shelter holding this inventory")

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    category: Optional[ResourceCategory] = None
    quantity: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=50)

class ResourceResponse(ResourceBase):
    id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True

# =====================================================================
# SCHEMAS: RESOURCE ALLOCATIONS
# =====================================================================

class ResourceAllocationBase(BaseModel):
    resource_id: UUID = Field(..., description="ID of resource in transit")
    source_shelter_id: UUID = Field(..., description="Supplying shelter")
    destination_shelter_id: UUID = Field(..., description="Receiving shelter")
    allocated_quantity: int = Field(..., gt=0, description="Volume to move")
    status: AllocationStatus = Field(AllocationStatus.PENDING)
    assigned_driver_id: Optional[UUID] = None

class ResourceAllocationCreate(ResourceAllocationBase):
    pass

class ResourceAllocationUpdate(BaseModel):
    status: Optional[AllocationStatus] = None
    assigned_driver_id: Optional[UUID] = None

class ResourceAllocationResponse(ResourceAllocationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =====================================================================
# SCHEMAS: TRIAGE RECORDS
# =====================================================================

class TriageRecordBase(BaseModel):
    incident_id: Optional[UUID] = None
    patient_name: str = Field("Unknown / John Doe", max_length=150)
    triage_tag: TriageTag = Field(TriageTag.GREEN)
    respirations: Optional[int] = Field(None, description="Breaths per minute")
    pulse: Optional[int] = Field(None, description="Beats per minute")
    mental_status: Optional[str] = None
    critical_injuries: Optional[str] = None

class TriageRecordCreate(TriageRecordBase):
    pass

class TriageRecordResponse(TriageRecordBase):
    id: UUID
    first_responder_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# =====================================================================
# SCHEMAS: CHAT & MEMORY
# =====================================================================

class MessageInput(BaseModel):
    text: str = Field(..., description="Incoming message from volunteer or responder")
    session_id: str = Field("default-session", description="Session ID for chat thread tracking")
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class MessageResponse(BaseModel):
    sender: str = Field("ReliefAI", description="The responding agent or system sender")
    text: str = Field(..., description="Natural language response text")
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[Dict[str, Any]] = None

class MemoryStoreInput(BaseModel):
    session_id: str
    key: str
    value: str

class MemoryStoreResponse(BaseModel):
    success: bool
    session_id: str
    key: str
