import React from "react";
import { ShieldCheck, Lock, ShieldAlert, Activity, Key } from "lucide-react";

export default function AdminSecurity() {
  const auditLogs = [
    { time: "02:55:12", event: "Role authorized for admin access", ip: "10.244.1.4", user: "mrssalunkhe11@gmail.com", status: "ALLOWED" },
    { time: "02:41:09", event: "Standard prompt classification run", ip: "127.0.0.1", user: "First Responder Hub", status: "VERIFIED" },
    { time: "02:10:44", event: "Prompt injection scanner triggered on public verify tool", ip: "192.168.1.104", user: "Anonymous Client", status: "CLEAN" },
    { time: "01:15:32", event: "Rate limit audit pass complete", ip: "System-Daemon", user: "Network Core", status: "NOMINAL" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Lock className="text-orange-500 w-5 h-5" />
          SYSTEM SECURITY & GUARDRAILS AUDITOR
        </h3>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase">
          Continuous evaluation of role permissions, prompt safety filters, and api security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Telemetry Status */}
        <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-white uppercase border-b border-zinc-900 pb-2">
            ACTIVE COOPERATIVE SECURITY SHIELD
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">AUTHENTICATION STATUS:</span>
              <span className="text-emerald-400 font-bold">✓ ACTIVE SESSION (SECURE JWT)</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">ROLE-BASED ACCESS CONTROL (RBAC):</span>
              <span className="text-emerald-400 font-bold">✓ STRICT ROUTING ISOLATION</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">PROMPT INJECTION PROTECTION:</span>
              <span className="text-emerald-400 font-bold">✓ ACTIVE SCANNING ON INGESTION</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">API GATEWAY SECURITY:</span>
              <span className="text-emerald-400 font-bold">✓ HTTPS / TLS 1.3 FORCE-ENFORCED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">RATE LIMIT GUARDRAIL:</span>
              <span className="text-white font-bold">60 REQS/MIN (BURST 100)</span>
            </div>
          </div>
        </div>

        {/* Prompt Injection Detection Simulation */}
        <div className="border border-zinc-800 bg-[#090909] p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-white uppercase border-b border-zinc-900 pb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            PROMPT INJECTION SCANS
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="bg-zinc-950 p-3 border border-zinc-900">
              <div className="flex justify-between items-center text-[10px] text-zinc-500">
                <span>LAST INPUT SCAN:</span>
                <span className="text-emerald-400 font-bold">CLEAN</span>
              </div>
              <p className="text-zinc-400 mt-1 leading-relaxed font-medium">
                &quot;Where is the nearest medical aid canopy near high school gym?&quot;
              </p>
            </div>

            <div className="bg-zinc-950 p-3 border border-zinc-900">
              <div className="flex justify-between items-center text-[10px] text-zinc-500">
                <span>INGESTION SANITIZER:</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <p className="text-zinc-500 mt-1 text-[10px] uppercase">
                XSS Stripping: 100% // Markdown Safety Check: 100% Passed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="border border-zinc-800 bg-[#090909] p-5 space-y-4">
        <h4 className="text-xs font-mono font-bold text-white uppercase">
          SYSTEM AUDIT TRAIL LOGS
        </h4>

        <div className="space-y-2">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-zinc-900 pb-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-zinc-600">{log.time}</span>
                <span className="text-zinc-300 font-bold">{log.event}</span>
                <span className="text-zinc-500 font-medium text-[10px]">({log.user} // IP: {log.ip})</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">{log.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
