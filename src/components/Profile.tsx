import React from "react";
import { UserProfile, UserRole } from "../types";
import { Shield, ShieldAlert, Award, LogOut, Landmark, User, Phone, CheckCircle } from "lucide-react";

interface ProfileProps {
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Profile({ user, onLogout }: ProfileProps) {
  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 border border-dashed border-zinc-800 bg-zinc-950 p-8 space-y-4">
        <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto" />
        <h3 className="text-lg font-black text-white uppercase">Profile Not Authorized</h3>
        <p className="text-xs text-zinc-400">Please sign in to view active tactical clearances.</p>
      </div>
    );
  }

  // Determine capabilities based on user clearance role
  const getCapabilitiesByRole = (role: UserRole): string[] => {
    switch (role) {
      case UserRole.MEDICAL_STAFF:
        return [
          "Emergency Patient Intake Logging",
          "START Triage Protocol Evaluation",
          "Traumatological Triage Tag Issuance",
          "Medical Field Hub Evacuation Authorization"
        ];
      case UserRole.NGO_LEAD:
        return [
          "Regional Supply Warehouse Audits",
          "Emergency Cargo Reallocation Dispatch",
          "Shelter Occupancy Rate Audits",
          "NGO Logistics Route Prioritization"
        ];
      case UserRole.RESPONDER:
        return [
          "Hazardous Blockage Reporting",
          "Search & Rescue (SAR) Incident Logging",
          "Field Coordination Dispatch Prompts",
          "Point-to-Point LoRa Mesh Sync Authorization"
        ];
      case UserRole.COMMUNITY_LEADER:
        return [
          "Civic Extraction Request Drafting",
          "Local Casualty Status Ingestion",
          "Community Shelter Intake Auditing",
          "Auxiliary Power Generation Requests"
        ];
      default:
        return ["General Assisting Prompts"];
    }
  };

  const capabilities = getCapabilitiesByRole(user.role);

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="border border-zinc-800 bg-zinc-950 p-6 md:p-8 relative space-y-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-600 to-amber-500"></div>

        {/* Header briefing */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 text-orange-500 font-bold text-xl h-14 w-14 flex items-center justify-center">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{user.full_name}</h3>
              <span className="text-xs font-mono text-orange-500 font-black uppercase tracking-widest">{user.role.replace("_", " ")}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 border border-red-900/60 hover:bg-red-950/20 text-red-400 font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Profile details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-zinc-900 p-4 bg-[#0a0a0a] space-y-2">
            <span className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" /> organization context
            </span>
            <div className="text-sm font-bold text-white uppercase">{user.organization || "No Organization Provided"}</div>
          </div>

          <div className="border border-zinc-900 p-4 bg-[#0a0a0a] space-y-2">
            <span className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> direct emergency contact
            </span>
            <div className="text-sm font-bold text-white font-mono">{user.phone_number || "+1 (555) 019-2831"}</div>
          </div>
        </div>

        {/* Authorized swarm capabilities */}
        <div className="space-y-4">
          <div className="border-b border-zinc-900 pb-2">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-500" />
              Authorized Swarm Clearances
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {capabilities.map((cap, i) => (
              <div key={i} className="flex gap-2.5 text-xs text-zinc-300 font-medium bg-[#080808] border border-zinc-900 p-3 items-start">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security watermark */}
        <div className="text-[10px] font-mono text-zinc-600 text-center uppercase pt-4 border-t border-dashed border-zinc-900">
          AUTHORIZED CRYPTOGRAPHIC TOKEN: relief_sec_tier4_token // RELIEF SYSTEM
        </div>
      </div>
    </div>
  );
}
