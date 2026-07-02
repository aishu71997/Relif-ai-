import React, { useState, useEffect } from "react";
import { Play, RotateCcw, ShieldCheck, Cpu, ArrowDown } from "lucide-react";

export default function AdminWorkflow() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);

  const steps = [
    {
      id: 0,
      title: "User Distress Message Ingested",
      agent: "Direct Communication Channel",
      desc: "User submits coordinates or natural dialect message reporting a flood blocking emergency paths near high schools."
    },
    {
      id: 1,
      title: "Orchestrator Coordinator Parsing",
      agent: "Coordinator Agent",
      desc: "Coordinator inspects payload, classifies intent with high confidence, triggers geographical indexing tools."
    },
    {
      id: 2,
      title: "Tactical Hazard Mapping",
      agent: "Emergency Information Agent",
      desc: "Queries Maps Platform to confirm structural gym collapses and checks water level indicators."
    },
    {
      id: 3,
      title: "Shelter Occupancy Check",
      agent: "Shelter Agent",
      desc: "Identifies Shelter Omega is at 94% capacity, alerts nearest logistical drops for cot allocations."
    },
    {
      id: 4,
      title: "Trauma Level Assessment",
      agent: "Medical Agent",
      desc: "Interspliced clinical triage data categorized using the standard START protocol for responder dispatch."
    },
    {
      id: 5,
      title: "SITREP Generation & Cache",
      agent: "Report Generator Agent",
      desc: "Compiles action points into formatted markdown reports, logging key findings to cache."
    },
    {
      id: 6,
      title: "Cooperative Response Dispatched",
      agent: "User Response Gateway",
      desc: "Provides clean evacuation directions, shelter occupancy warnings, and compassionate guidance to the victim."
    }
  ];

  useEffect(() => {
    let interval: any;
    if (isAnimating) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-900 pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-orange-500 w-5 h-5" />
            SWARM OPERATIONS WORKFLOW PIPELINE
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-mono uppercase">
            Trace the exact execution graph of decentralized agent swarms in sequence.
          </p>
        </div>

        <div className="flex gap-2 font-mono text-[11px]">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-3 py-1.5 border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            {isAnimating ? "Pause Simulation" : "Resume Simulation"}
          </button>
          <button
            onClick={() => {
              setActiveStep(0);
              setIsAnimating(false);
            }}
            className="px-3 py-1.5 border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Animated Workflow Graph */}
        <div className="col-span-12 lg:col-span-6 border border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#f97316,transparent)] opacity-5 pointer-events-none"></div>

          {steps.map((st, idx) => {
            const isActive = activeStep === idx;
            return (
              <React.Fragment key={st.id}>
                <button
                  onClick={() => {
                    setActiveStep(idx);
                    setIsAnimating(false);
                  }}
                  className={`w-full max-w-sm border p-4 text-left font-mono relative transition-all duration-500 ${
                    isActive 
                      ? "border-orange-500 bg-orange-950/20 shadow-lg shadow-orange-500/10 scale-102" 
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">STEP 0{idx + 1}</span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    )}
                  </div>
                  <h4 className={`text-xs font-bold uppercase mt-1 ${isActive ? "text-white" : "text-zinc-400"}`}>
                    {st.agent}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{st.title}</p>
                </button>

                {idx < steps.length - 1 && (
                  <ArrowDown className={`w-4 h-4 transition-colors duration-500 ${
                    activeStep === idx ? "text-orange-500 animate-bounce" : "text-zinc-800"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Selected Step Inspector briefing */}
        <div className="col-span-12 lg:col-span-6 border border-zinc-800 bg-[#090909] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <span className="text-[10px] font-mono text-orange-500 uppercase font-black tracking-widest">
                ACTIVE PIPELINE NODE INSPECTOR
              </span>
              <h4 className="text-xl font-black text-white uppercase mt-1">
                {steps[activeStep].agent}
              </h4>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                Current Operation:
              </span>
              <h5 className="text-sm font-bold text-zinc-300 uppercase leading-snug">
                {steps[activeStep].title}
              </h5>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium pt-2 border-t border-zinc-900">
                {steps[activeStep].desc}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 mt-6">
            <div className="bg-zinc-950 p-3 border border-zinc-800 font-mono text-[10px] text-zinc-500 leading-relaxed uppercase">
              // SWARM TELEMETRY METRIC // <br />
              EXECUTION CONFIDENCE: <span className="text-emerald-400 font-bold">0.994</span> // <br />
              SUCCESS RATE: <span className="text-white font-bold">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
