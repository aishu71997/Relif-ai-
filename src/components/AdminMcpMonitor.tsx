import React from "react";
import { Layers, Activity, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AdminMcpMonitor() {
  const tools = [
    { name: "Search Tool", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 189, latency: "145ms", rate: "99.4%" },
    { name: "Maps Tool", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 312, latency: "220ms", rate: "99.1%" },
    { name: "Weather Tool", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 84, latency: "110ms", rate: "100%" },
    { name: "Translation Tool", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 245, latency: "95ms", rate: "99.6%" },
    { name: "Database Tool", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 1432, latency: "42ms", rate: "100%" },
    { name: "PDF Generator", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 48, latency: "380ms", rate: "98.5%" },
    { name: "Email Tool", status: "STANDBY", color: "text-zinc-500 bg-zinc-900/40 border-zinc-800", reqs: 22, latency: "210ms", rate: "100%" },
    { name: "SMS Tool", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 156, latency: "185ms", rate: "98.7%" },
    { name: "News Verification Tool", status: "AVAILABLE", color: "text-emerald-400 bg-emerald-950/20 border-emerald-900", reqs: 94, latency: "310ms", rate: "99.0%" }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-900 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Layers className="text-orange-500 w-5 h-5" />
          MODEL CONTEXT PROTOCOL (MCP) TOOL REGISTRY
        </h3>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase">
          Dynamic visual telemetry for models accessing native client/host capability services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tl, i) => (
          <div key={i} className="border border-zinc-800 bg-[#090909] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-sm font-black text-white uppercase tracking-tight">{tl.name}</span>
              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${tl.color}`}>
                {tl.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-500">
              <div>REQS TODAY: <span className="text-white font-bold">{tl.reqs}</span></div>
              <div>AVG LATENCY: <span className="text-white font-bold">{tl.latency}</span></div>
              <div className="col-span-2">SUCCESS RATE: <span className="text-emerald-400 font-bold">{tl.rate}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
