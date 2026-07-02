import React from "react";
import { Shield, Cpu, Users, Zap, Map, Activity, AlertTriangle, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
}

export default function LandingPage({ onNavigate, isLoggedIn }: LandingPageProps) {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="relative border border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-zinc-900/60 p-8 md:p-12 overflow-hidden">
        {/* Subtle decorative grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-950/80 border border-orange-700/60 text-orange-400 rounded-full text-xs font-mono">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
            ACTIVE INCIDENT DISPATCH ENGINE
          </div>

          <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase text-white leading-none">
            Cooperative Swarms for <span className="text-orange-500">Resilient Disaster Relief</span>
          </h2>

          <p className="text-zinc-400 text-base md:text-xl leading-relaxed max-w-2xl font-medium">
            ReliefAI deploys a decentralized, multi-agent network orchestrated via Google ADK and localized MCP. 
            Keep response teams synchronized, coordinate search and rescue, audit emergency supplies, and log traumatological triage, even during severe communication blackouts.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {isLoggedIn ? (
              <button
                onClick={() => onNavigate("dashboard")}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold uppercase text-sm tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                Access Command Center
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold uppercase text-sm tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  Enter Dispatch Portal
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="px-6 py-3 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold uppercase text-sm tracking-wider transition-all cursor-pointer"
                >
                  Explore Live Demo
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Agent Swarms", val: "5 Cooperating", sub: "Orchestrator-Led", color: "text-orange-500" },
          { label: "Emergency Incidents", val: "12 Critical", sub: "Open & Tracked", color: "text-red-500" },
          { label: "Volunteers Registered", val: "84 Recruited", sub: "Auto-Match Ready", color: "text-green-500" },
          { label: "Mesh Node Strength", val: "99.8% Stable", sub: "Dual-Sync Fallback", color: "text-cyan-500" }
        ].map((stat, i) => (
          <div key={i} className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{stat.label}</div>
            <div className="mt-4">
              <div className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${stat.color}`}>{stat.val}</div>
              <div className="text-xs text-zinc-500 font-mono mt-1">{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Roles Visual Decomposition */}
      <div className="space-y-6">
        <div className="border-b border-zinc-800 pb-4">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">The Multi-Agent Swarm Registry</h3>
          <p className="text-xs text-zinc-400 mt-1">Autonomous micro-agents cooperating to handle relief bottlenecks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Cpu,
              name: "Orchestrator Agent",
              desc: "Evaluates conversational inputs, identifies emergency intents, resolves geographic indices, and splits multi-step requirements into executable sub-tasks.",
              tech: "Gemini 2.5 Flash / Google ADK"
            },
            {
              icon: Shield,
              name: "Search & Rescue (SAR)",
              desc: "Aggregates incident coordinates, resolves topological routes, charts hazardous zones, and assigns active paths to responder field units.",
              tech: "Gemini 2.0 / Maps Grounding"
            },
            {
              icon: Zap,
              name: "Logistics & Supply",
              desc: "Audits emergency shelter caches, balances supplies (blood, water, dry food), flags local deficiencies, and dispatches automated transfers.",
              tech: "Gemini 2.5 / Function Calling"
            },
            {
              icon: Activity,
              name: "Clinical Field Triage",
              desc: "Speeds up casualty categorization utilizing the START protocol. Ingests patient vital signs to output high-fidelity red, yellow, green triage tags.",
              tech: "FastAPI / Standard Triage Engine"
            },
            {
              icon: Users,
              name: "Volunteer Coordinator",
              desc: "Ingests spontaneous volunteer sign-ups, checks key specialties, pairs them against active shelters, and generates customized field briefings.",
              tech: "Gemini 2.5 / Safety Agent"
            },
            {
              icon: Map,
              name: "Continuous Session Memory",
              desc: "Fuses lessons learned across sessions. Keeps track of recurring infrastructure flaws and extracts preventative operational guidelines.",
              tech: "FastAPI Memory / Swarm Cache"
            }
          ].map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div key={i} className="border border-zinc-800 bg-[#0a0a0a] p-6 space-y-4 hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 text-orange-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">{agent.name}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">{agent.tech}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {agent.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Resiliency Panel */}
      <div className="border border-zinc-800 bg-[#090909] p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-orange-500">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest font-black">OFFLINE MESH CAPABILITY READY</span>
          </div>
          <h4 className="text-lg font-black text-white uppercase">Designed for Extreme Environmental Chaos</h4>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            This workspace includes client-side caches that store information locally during full infrastructure disconnects. 
            Once communication pathways are restored, the edge node automatically synchronizes state logs with Cloud Run databases.
          </p>
        </div>
        <button
          onClick={() => onNavigate("settings")}
          className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer"
        >
          Diagnose Mesh Link
        </button>
      </div>
    </div>
  );
}
