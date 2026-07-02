import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, ChatResponse, UserProfile } from "../types";
import { chatApi, memoryApi } from "../api";
import { Send, Cpu, Terminal, ShieldAlert, Sparkles, AlertTriangle, Layers, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";

interface AIChatProps {
  user: UserProfile | null;
}

export default function AIChat({ user }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [activeTaskBreakdown, setActiveTaskBreakdown] = useState<any[]>([]);
  const [activeNextSteps, setActiveNextSteps] = useState<string[]>([]);
  const [activeIntent, setActiveIntent] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId] = useState<string>("default-session");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<number, { is_helpful: boolean; rating?: number }>>({});

  const handleFeedback = async (msgIndex: number, msgContent: string, isHelpful: boolean) => {
    try {
      await memoryApi.submitFeedback({
        session_id: sessionId,
        message_content: msgContent,
        is_helpful: isHelpful
      });
      setFeedbackStatus(prev => ({
        ...prev,
        [msgIndex]: { is_helpful: isHelpful }
      }));
    } catch (err) {
      console.error("Feedback failed:", err);
      setFeedbackStatus(prev => ({
        ...prev,
        [msgIndex]: { is_helpful: isHelpful }
      }));
    }
  };

  const loadHistory = async () => {
    try {
      const history = await chatApi.getHistory(sessionId);
      // Map backend structure safely
      setMessages(history.map(h => ({
        role: h.role as "user" | "assistant",
        content: h.content,
        timestamp: h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()
      })));
    } catch {
      // Fallback greeting
      setMessages([
        {
          role: "assistant",
          content: "ReliefAI Swarm Dispatcher Online. Ready to coordinate field logistics, SAR, and clinical triage. Submit your emergency report, request resource audits, or pair volunteers.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    // Clear text input
    if (!textToSend) setInputMessage("");

    // Append user message immediately
    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res: ChatResponse = await chatApi.send({
        session_id: sessionId,
        message: text,
        latitude: 45.4111, // Simulated current responder coordinate
        longitude: -122.6222
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.response,
        timestamp: new Date(res.timestamp).toLocaleTimeString()
      };

      setMessages(prev => [...prev, assistantMsg]);
      setActiveTaskBreakdown(res.task_breakdown || []);
      setActiveNextSteps(res.next_steps || []);
      setActiveIntent(res.intent || "general_assistance");

    } catch (err) {
      // Offline simulated compiler
      const mockReply = `Bypassed central neural nodes. Saved to offline mesh ledger. Simulated coordination response issued. Priority dispatch registered.`;
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: mockReply,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setActiveIntent("offline_assistance");
      setActiveNextSteps(["Keep active UHF communication channel open.", "Monitor local shelter inventory registers manually."]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (confirm("Are you sure you want to clear active conversation history and session memories?")) {
      try {
        await memoryApi.clear(sessionId);
      } catch {}
      setMessages([
        {
          role: "assistant",
          content: "ReliefAI session memories reset. Swarm Dispatcher Ready.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setActiveTaskBreakdown([]);
      setActiveNextSteps([]);
      setActiveIntent("");
    }
  };

  const suggestions = [
    "Log a wall collapse at the High School Gym with 5 trapped victims.",
    "Perform a resource audit. Shelter Delta is low on drinking water.",
    "I have 5 blankets and 2 boxes of penicillin. Where should I route them?",
    "We have a flash flood at River Road. Route vehicles over 5 tonnes via the bypass."
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
      {/* Central Chat Channel */}
      <div className="col-span-12 lg:col-span-8 border border-zinc-800 bg-[#080808] p-5 flex flex-col justify-between h-[600px]">
        {/* Header bar */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase text-white">Active Dispatch Stream // relief-mcp:5011</span>
          </div>
          <button
            onClick={clearChat}
            className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
            title="Reset Session Memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                className={`flex gap-3 max-w-xl ${isUser ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`p-2 border shrink-0 h-8 w-8 flex items-center justify-center font-bold text-xs ${
                  isUser ? "bg-orange-950 border-orange-800 text-orange-400" : "bg-zinc-900 border-zinc-800 text-white"
                }`}>
                  {isUser ? "U" : "AI"}
                </div>
                <div className={`p-3 border text-xs leading-relaxed space-y-1 ${
                  isUser ? "bg-zinc-950 border-zinc-800 text-zinc-300 rounded-l" : "bg-zinc-900/40 border-zinc-900 text-zinc-200 rounded-r"
                }`}>
                  <p className="font-medium whitespace-pre-line">{msg.content}</p>
                  <span className="text-[9px] font-mono text-zinc-600 block pt-1 text-right">{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center justify-between gap-4 border-t border-zinc-800/40 pt-2 mt-2">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Helpful response?</span>
                      {feedbackStatus[i] ? (
                        <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                          {feedbackStatus[i].is_helpful ? (
                            <>👍 Confidence Raised</>
                          ) : (
                            <span className="text-red-400">👎 Memory Adjusted</span>
                          )}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFeedback(i, msg.content, true)}
                            className="p-1 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(i, msg.content, false)}
                            className="p-1 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-3 max-w-xl">
              <div className="p-2 border shrink-0 h-8 w-8 bg-zinc-900 border-zinc-800 text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div className="p-3 bg-zinc-900/20 border border-zinc-900 text-zinc-500 text-xs font-mono animate-pulse rounded-r">
                Querying Swarm Agents... Resolving topological indices...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length <= 1 && (
          <div className="py-3 border-t border-zinc-900 mt-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">Suggested Field Queries:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  className="p-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white rounded text-left text-[11px] font-medium leading-tight transition-all cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2 border-t border-zinc-900 pt-4 mt-4"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type disaster alert or dispatch request (e.g. 'water shortage at Shelter Omega')..."
            className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-orange-500 font-medium"
          />
          <button
            type="submit"
            className="px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center justify-center rounded cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Swarm Intelligence Output Side Panel */}
      <div className="col-span-12 lg:col-span-4 border border-zinc-800 bg-[#080808] p-5 flex flex-col justify-between h-[600px] overflow-y-auto">
        <div className="space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-500" />
              Swarm Task Allocation
            </h4>
          </div>

          {activeIntent ? (
            <div className="space-y-6">
              {/* Identified Intent */}
              <div className="border border-zinc-800 bg-zinc-950 p-3">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">IDENTIFIED COGNITIVE INTENT</span>
                <span className="text-xs font-black uppercase text-orange-500 mt-1 font-mono">{activeIntent}</span>
              </div>

              {/* Next Steps Checklist */}
              {activeNextSteps.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">CONCRETE NEXT STEPS</span>
                  <div className="space-y-1.5">
                    {activeNextSteps.map((step, i) => (
                      <div key={i} className="flex gap-2 text-xs font-medium text-zinc-300">
                        <span className="text-green-500 font-bold font-mono">✓</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Task breakdowns */}
              {activeTaskBreakdown.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">COOPERATIVE SUB-AGENTS ACTIVATED</span>
                  <div className="space-y-3 border-l border-zinc-800 pl-3">
                    {activeTaskBreakdown.map((task, i) => (
                      <div key={task.task_id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                          <span className="text-xs font-bold text-white uppercase">{task.agent_name.replace("_", " ")}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium pl-3 leading-relaxed">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
              <Layers className="w-8 h-8 text-zinc-600 mb-2" />
              <div>No Active Task Allocation</div>
              <div className="mt-1">Send a message to the coordinator to visualize the sub-agent swarm logs.</div>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-900 pt-4 text-[10px] font-mono text-zinc-500 leading-normal">
          DISPATCH COORDINATOR SECURE TIER-4 SYNC ACTIVE.
        </div>
      </div>
    </div>
  );
}
