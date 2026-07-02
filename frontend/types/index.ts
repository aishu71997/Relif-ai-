// index.ts - Shared static TypeScript compilation type interfaces
// Defines structured models representing Incidents, Supply Resources, and Swarm Agent statuses.
// (Actual implementation code to be added in future development phases)
export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  latitude: number;
  longitude: number;
  status: "open" | "assigned" | "resolved";
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  category: "medical" | "food" | "water" | "shelter" | "fuel";
  quantity: number;
  unit: string;
  location_id: string;
  updated_at: string;
}
