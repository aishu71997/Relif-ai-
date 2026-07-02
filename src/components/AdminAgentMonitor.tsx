import React from "react";
import { Cpu, CheckCircle2, Shield, RefreshCw, Layers, ThumbsUp, ThumbsDown } from "lucide-react";
import { memoryApi } from "../api";

export default function AdminAgentMonitor() {
  const [feedbackRecords, setFeedbackRecords] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFeedback = async () => {
    try {
      const records = await memoryApi.listFeedback();
      setFeedbackRecords(records);
    } catch (err) {
      console.error("Failed to fetch memory feedback logs:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFeedback();
  }, []);

  const agents = [
    {
      name: "Coordinator Agent",
      status: "ONLINE",
      color: "bg-emerald-500",
      tasks: 342,
      time: "85ms",
      job: "Deconstructing incoming conversational query streams",
      rate: "99.8%",
      desc: "Google ADK orchestrator. Evaluates inputs, extracts intent classes, manages multi-step execution graphs."
    },
    {
      name: "Emergency Information Agent",
      status: "ONLINE",
      color: "bg-emerald-500",
      tasks: 198,
      time: "120ms",
      job: "Monitoring active shelter telemetry feeds",
      rate: "99.5%",
      desc: "Aggregates localized safety updates and maps dangerous flood lines."
    },
    {
      name: "Shelter Agent",
      status: "ONLINE",
      color: "bg-emerald-500",
      tasks: 145,
      time: "155ms",
      job: "Auditing cot bed reserves at Shelter Omega",
      rate: "98.9%",
      desc: "Manages capacity rates and balances shelter supplies continuously."
    },
    {
      name: "Medical Agent",
      status: "IDLE",
      color: "bg-zinc-500",
      tasks: 89,
      time: "110ms",
      job: "Standing by for traumatological START data",
      rate: "100%",
      desc: "Processes casualty reports and parses clinical triage logs."
    },
    {
      name: "Translation Agent",
      status: "ONLINE",
      color: "bg-emerald-500",
      tasks: 231,
      time: "92ms",
      job: "Translating Spanish distress alert to local dispatcher",
      rate: "99.2%",
      desc: "Bridges conversational gaps using multilingual cross-translation."
    },
    {
      name: "Volunteer Agent",
      status: "ONLINE",
      color: "bg-emerald-500",
      tasks: 112,
      time: "140ms",
      job: "Pairing new spontaneous signups against Shelter Delta",
      rate: "98.6%",
      desc: "Audits volunteer specialty matrices and generates customized briefings."
    },
    {
      name: "Fake News Verification Agent",
      status: "ONLINE",
      color: "bg-emerald-500",
      tasks: 167,
      time: "185ms",
      job: "Checking SMS broadcast authenticity against water sensors",
      rate: "99.1%",
      desc: "Filters out unfounded rumors and verifies local news validity."
    },
    {
      name: "Report Generator Agent",
      status: "IDLE",
      color: "bg-zinc-500",
      tasks: 76,
      time: "245ms",
      job: "Awaiting next Scheduled SITREP request",
      rate: "100%",
      desc: "Compiles Markdown reports, action points, and strategic overviews."
    },
    {
      name: "Memory Agent",
      status: "ONLINE",
      color: "bg-emerald-500",
      tasks: 432,
      time: "65ms",
      job: "Fusing operational insights from previous sessions",
      rate: "99.9%",
      desc: "Durable semantic state manager. Logs key takeaways for emergency planners."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-4">
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Cpu className="text-orange-500 w-5 h-5" />
          GOOGLE ADK SWARM AGENT MONITOR
        </h3>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase">
          Autonomous multi-agent system status registry & telemetry.
        </p>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((ag, i) => (
          <div key={i} className="border border-zinc-800 bg-[#090909] p-5 space-y-4 relative">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">{ag.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-1 font-medium leading-relaxed">{ag.desc}</p>
              </div>
              
              <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
                <span className={`w-2 h-2 rounded-full ${ag.color} shrink-0`}></span>
                <span className={ag.status === "ONLINE" ? "text-emerald-400" : "text-zinc-500"}>
                  {ag.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono border-t border-zinc-900 pt-3 text-zinc-500">
              <div>TASKS DONE: <span className="text-white font-bold">{ag.tasks}</span></div>
              <div>AVG LATENCY: <span className="text-white font-bold">{ag.time}</span></div>
              <div>SUCCESS RATE: <span className="text-emerald-400 font-bold">{ag.rate}</span></div>
              <div className="col-span-2 mt-1 leading-normal">
                CURRENT JOB: <span className="text-orange-400 block font-medium mt-0.5">{ag.job}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Logs section */}
      <div className="border border-zinc-800 bg-[#090909] p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Memory Agent Reinforcement Learning Streams (RLHF)
          </h4>
          <button
            onClick={fetchFeedback}
            className="text-[10px] font-mono uppercase bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-2 py-1 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Refresh logs
          </button>
        </div>

        {loading ? (
          <p className="text-xs font-mono text-zinc-500 animate-pulse">Loading feedback logs...</p>
        ) : feedbackRecords.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-zinc-900">
            <p className="text-xs font-mono text-zinc-500">No user feedback logs recorded yet.</p>
            <p className="text-[10px] font-mono text-zinc-600 mt-1 uppercase">Submit thumbs up/down feedback in AI Assistant to populate streams.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbackRecords.slice().reverse().map((fb, idx) => (
              <div key={fb.id || idx} className="border border-zinc-900 bg-zinc-950 p-4 rounded text-xs font-mono space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{fb.timestamp ? new Date(fb.timestamp).toLocaleTimeString() : "Live"}</span>
                    <span className="text-zinc-600">// Session: {fb.session_id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    fb.is_helpful ? "bg-emerald-950/40 border border-emerald-900/60 text-emerald-400" : "bg-red-950/40 border border-red-900/60 text-red-400"
                  }`}>
                    {fb.is_helpful ? "✓ HELPFUL" : "✗ UNHELPFUL"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500">ASSISTANT RESPONSE UNDER RATING:</span>
                  <p className="text-zinc-300 bg-[#060606] p-2.5 border border-zinc-900/80 rounded leading-relaxed text-[11px] whitespace-pre-wrap font-sans">
                    {fb.message_content}
                  </p>
                </div>
                <p className="text-[9px] text-emerald-500 font-bold uppercase">
                  ⚡ Impact: Memory Agent confidence rating dynamically adjusted by {fb.is_helpful ? "+0.05" : "-0.15"} for this session state.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
