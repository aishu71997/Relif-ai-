// api.ts - Frontend client calling FastAPI endpoints with automated header injections and mesh fallback.

import { 
  UserProfile, Incident, TriageRecord, Volunteer, VolunteerMatchOutput,
  Resource, ResourceAllocation, ShelterAuditOutput, ChatMessage, ChatResponse,
  SavedReport, MemoryRecord, UserRole, IncidentStatus, IncidentPriority, ResourceCategory, AllocationStatus
} from "./types";

const API_BASE = "/api";

export function getAuthToken(): string | null {
  return localStorage.getItem("relief_auth_token");
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("relief_auth_token", token);
  } else {
    localStorage.removeItem("relief_auth_token");
  }
}

export function getStoredProfile(): UserProfile | null {
  const data = localStorage.getItem("relief_user_profile");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredProfile(profile: UserProfile | null) {
  if (profile) {
    localStorage.setItem("relief_user_profile", JSON.stringify(profile));
  } else {
    localStorage.removeItem("relief_user_profile");
  }
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = "Server error occurred.";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      // Use standard status text
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) return null;
  return response.json();
}

// =====================================================================
// AUTHENTICATION ENDPOINTS
// =====================================================================
export const authApi = {
  async register(payload: any): Promise<UserProfile> {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async login(payload: any): Promise<{ access_token: string; token_type: string; profile: UserProfile }> {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setAuthToken(res.access_token);
    setStoredProfile(res.profile);
    return res;
  },

  async getMe(): Promise<UserProfile> {
    return request("/auth/me");
  },

  logout() {
    setAuthToken(null);
    setStoredProfile(null);
  }
};

// =====================================================================
// EMERGENCY REQUESTS / INCIDENTS ENDPOINTS
// =====================================================================
export const incidentsApi = {
  async list(status?: IncidentStatus): Promise<Incident[]> {
    const query = status ? `?status=${status}` : "";
    return request(`/incidents${query}`);
  },

  async report(payload: any): Promise<Incident> {
    return request("/incidents", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async getById(id: string): Promise<Incident> {
    return request(`/incidents/${id}`);
  },

  async update(id: string, payload: any): Promise<Incident> {
    return request(`/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async addTriage(incidentId: string, payload: any): Promise<TriageRecord> {
    return request(`/incidents/${incidentId}/triage`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async listTriage(incidentId: string): Promise<TriageRecord[]> {
    return request(`/incidents/${incidentId}/triage`);
  }
};

// =====================================================================
// VOLUNTEER COORDINATION ENDPOINTS
// =====================================================================
export const volunteersApi = {
  async list(): Promise<Volunteer[]> {
    return request("/volunteers");
  },

  async register(payload: any): Promise<Volunteer> {
    return request("/volunteers/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async match(volunteerId: string): Promise<VolunteerMatchOutput> {
    return request(`/volunteers/match/${volunteerId}`, {
      method: "POST"
    });
  }
};

// =====================================================================
// RESOURCE LOGISTICS ENDPOINTS
// =====================================================================
export const resourcesApi = {
  async list(category?: ResourceCategory, shelterId?: string): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (shelterId) params.set("shelter_id", shelterId);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request(`/resources${query}`);
  },

  async register(payload: any): Promise<Resource> {
    return request("/resources", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async adjust(resourceId: string, payload: any): Promise<Resource> {
    return request(`/resources/${resourceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  async audit(payload: any): Promise<ShelterAuditOutput> {
    return request("/resources/audit", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async listAllocations(): Promise<ResourceAllocation[]> {
    return request("/resources/allocations");
  }
};

// =====================================================================
// REPORTING & SITREPS ENDPOINTS
// =====================================================================
export const reportsApi = {
  async list(): Promise<SavedReport[]> {
    return request("/reports");
  },

  async generate(payload: any): Promise<SavedReport> {
    return request("/reports/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};

// =====================================================================
// AI CHAT COMMAND DISPATCHER ENDPOINTS
// =====================================================================
export const chatApi = {
  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    return request(`/chat/${sessionId}`);
  },

  async send(payload: { session_id: string; message: string; latitude?: number; longitude?: number }): Promise<ChatResponse> {
    return request("/chat", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};

// =====================================================================
// CONVERSATION MEMORY CONTINUITY ENDPOINTS
// =====================================================================
export const memoryApi = {
  async listAll(zone?: string): Promise<MemoryRecord[]> {
    const query = zone ? `?zone=${encodeURIComponent(zone)}` : "";
    return request(`/memory${query}`);
  },

  async getBySession(sessionId: string): Promise<MemoryRecord[]> {
    return request(`/memory/${sessionId}`);
  },

  async digest(payload: any): Promise<MemoryRecord> {
    return request("/memory/digest", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async clear(sessionId: string): Promise<void> {
    return request(`/memory/${sessionId}`, {
      method: "DELETE"
    });
  },

  async submitFeedback(payload: { session_id: string; message_content: string; is_helpful: boolean; rating?: number }): Promise<any> {
    return request("/memory/feedback", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  async listFeedback(): Promise<any[]> {
    return request("/memory/feedback");
  }
};
