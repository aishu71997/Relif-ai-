// types.ts - Shared interface structures matching backend Pydantic models

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  RESPONDER = "responder",
  NGO_LEAD = "ngo_lead",
  MEDICAL_STAFF = "medical_staff",
  COMMUNITY_LEADER = "community_leader",
}

export enum IncidentStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  RESOLVED = "resolved",
}

export enum IncidentPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ResourceCategory {
  MEDICAL = "medical",
  FOOD = "food",
  WATER = "water",
  SHELTER = "shelter",
  FUEL = "fuel",
}

export enum AllocationStatus {
  PENDING = "pending",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum TriageTag {
  GREEN = "green",
  YELLOW = "yellow",
  RED = "red",
  BLACK = "black",
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  organization?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  latitude: number;
  longitude: number;
  reported_by?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TriageRecord {
  id: string;
  incident_id?: string;
  patient_name: string;
  triage_tag: TriageTag;
  respirations?: number;
  pulse?: number;
  mental_status?: string;
  critical_injuries?: string;
  first_responder_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  availability_hours: number;
  latitude: number;
  longitude: number;
  prefers_outdoor_sar: boolean;
  status: "registered" | "matched";
}

export interface VolunteerMatchOutput {
  assigned_role: string;
  target_facility_or_site: string;
  reporting_instructions: string;
  safety_checklist: string[];
  estimated_shift_summary: string;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  unit: string;
  shelter_id: string;
  updated_at: string;
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  source_shelter_id: string;
  destination_shelter_id: string;
  allocated_quantity: number;
  status: AllocationStatus;
  assigned_driver_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ShelterAuditOutput {
  shelter_name: string;
  occupancy_rate: number;
  alert_status: string;
  resource_deficits: string[];
  allocations_dispatched: Array<{
    resource_id: string;
    source_shelter_id: string;
    destination_shelter_id: string;
    quantity_to_transfer: number;
    justification: string;
  }>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  intent: string;
  task_breakdown: Array<{
    task_id: string;
    agent_name: string;
    description: string;
    input_payload: Record<string, any>;
  }>;
  next_steps: string[];
  timestamp: string;
}

export interface SavedReport {
  id: string;
  title: string;
  scope: string;
  markdown_content: string;
  summary_points: string[];
  action_items: string[];
  generated_at: string;
  generated_by: string;
}

export interface MemoryRecord {
  id: string;
  session_id: string;
  incident_zone?: string;
  insights: Array<{
    key: string;
    value: string;
    confidence_rating: number;
  }>;
  warnings: string[];
  suggested_policies: string[];
  suggested_duration: string;
  created_at: string;
}
