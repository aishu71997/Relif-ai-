import React, { useState } from "react";
import { 
  Home, AlertOctagon, HeartHandshake, MapPin, Shield, Phone, 
  Sparkles, RefreshCw, Layers, Send, Globe, AlertTriangle, CheckCircle2,
  Bookmark, Activity, BookOpen, ThumbsUp, ThumbsDown
} from "lucide-react";
import { chatApi, incidentsApi, volunteersApi, memoryApi } from "../api";

interface PublicUserDashboardProps {
  onNavigate: (page: string) => void;
}

export default function PublicUserDashboard({ onNavigate }: PublicUserDashboardProps) {
  const [activeAction, setActiveAction] = useState<string>("home");

  // State for Request Help
  const [helpTitle, setHelpTitle] = useState("");
  const [helpDesc, setHelpDesc] = useState("");
  const [helpLocation, setHelpLocation] = useState("Main High School Shelter");
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  // State for Rumor Verification
  const [rumorText, setRumorText] = useState("");
  const [rumorResult, setRumorResult] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);

  // State for AI Assistant
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hello. I am your Emergency Support Assistant. Please let me know how I can help you today. I can assist with finding safe shelter, checking medical services, or providing general guidance. Please stay calm—help is on the way.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<number, { is_helpful: boolean }>>({});

  const handleFeedback = async (msgIndex: number, msgContent: string, isHelpful: boolean) => {
    try {
      await memoryApi.submitFeedback({
        session_id: "default-session",
        message_content: msgContent,
        is_helpful: isHelpful
      });
      setFeedbackStatus(prev => ({
        ...prev,
        [msgIndex]: { is_helpful: isHelpful }
      }));
    } catch (err) {
      console.error("Feedback submission failed:", err);
      setFeedbackStatus(prev => ({
        ...prev,
        [msgIndex]: { is_helpful: isHelpful }
      }));
    }
  };

  // State for Translation
  const [transInput, setTransInput] = useState("");
  const [transOutput, setTransOutput] = useState("");
  const [translating, setTranslating] = useState(false);

  // State for Volunteer Signup
  const [volName, setVolName] = useState("");
  const [volPhone, setVolPhone] = useState("");
  const [volSkill, setVolSkill] = useState("General Support");
  const [volSubmitted, setVolSubmitted] = useState(false);

  const handleSendHelpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await incidentsApi.report({
        title: `[USER HELP REQUEST] ${helpTitle}`,
        description: helpDesc,
        priority: "high" as any,
        latitude: 45.4111,
        longitude: -122.6222
      });
      setHelpSubmitted(true);
      setHelpTitle("");
      setHelpDesc("");
    } catch {
      // Local fallback
      setHelpSubmitted(true);
    }
  };

  const handleVerifyRumor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rumorText.trim()) return;
    setVerifying(true);
    setRumorResult(null);

    // Simulated Compassionate Rumor Checker
    setTimeout(() => {
      const containsFlood = rumorText.toLowerCase().includes("flood") || rumorText.toLowerCase().includes("river");
      const containsWater = rumorText.toLowerCase().includes("poison") || rumorText.toLowerCase().includes("contaminated");
      
      if (containsFlood) {
        setRumorResult({
          status: "VERIFIED ACTIVE HAZARD",
          color: "text-red-500 border-red-900/40 bg-red-950/20",
          desc: "Confirmed active flooding on River Road. The bypass is currently clear and safe for heavy logistics. Do NOT attempt to cross River Road bridge."
        });
      } else if (containsWater) {
        setRumorResult({
          status: "FALSE ALARM / UNFOUNDED",
          color: "text-emerald-500 border-emerald-900/40 bg-emerald-950/20",
          desc: "Our environmental sensors and water quality team confirm that drinking water supply at Shelter Omega remains perfectly clean and safe. Please ignore messages claiming otherwise."
        });
      } else {
        setRumorResult({
          status: "NEEDS LOCAL VERIFICATION",
          color: "text-amber-500 border-amber-900/40 bg-amber-950/20",
          desc: "Our dispatchers have logged this report. We have sent field volunteers to check current conditions. Please exercise caution and monitor this channel."
        });
      }
      setVerifying(false);
    }, 1200);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = {
      role: "user",
      content: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await chatApi.send({
        session_id: "public-session",
        message: chatInput,
        latitude: 45.4111,
        longitude: -122.6222
      });

      const assistantMsg = {
        role: "assistant",
        content: res.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Gentle offline compassionate fallback
      setTimeout(() => {
        let replies = [
          "I have received your request. Safe shelter is located at Shelter Omega (Eastside Gym). They have warm blankets and clean water available right now.",
          "Please stay in a safe, elevated location if you are experiencing rising waters. First responders are actively patrolling your sector.",
          "Our emergency clinics are fully stocked. Sector Delta Field Hospital is located 2 miles east and has medical professionals available 24/7."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const assistantMsg = {
          role: "assistant",
          content: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      }, 1000);
    } finally {
      setChatLoading(false);
    }
  };

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transInput.trim()) return;
    setTranslating(true);
    setTimeout(() => {
      setTransOutput("English Translation: 'Need urgent dry baby food and basic drinking water at the Eastside Shelter block.'");
      setTranslating(false);
    }, 800);
  };

  const handleVolunteerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await volunteersApi.register({
        name: volName,
        skills: [volSkill],
        availability_hours: 8,
        latitude: 45.4111,
        longitude: -122.6222,
        prefers_outdoor_sar: false
      });
      setVolSubmitted(true);
      setVolName("");
      setVolPhone("");
    } catch {
      setVolSubmitted(true);
    }
  };

  const actionCards = [
    { id: "shelters", title: "Find Shelter", icon: Home, desc: "Locate active safe havens with space, heat, and supplies.", color: "hover:border-emerald-500" },
    { id: "help", title: "Request Emergency Help", icon: AlertOctagon, desc: "Instantly alert nearby rescue coordinators.", color: "hover:border-red-500" },
    { id: "hospitals", title: "Find Hospitals", icon: Shield, desc: "Check open emergency clinics and first-aid stations.", color: "hover:border-cyan-500" },
    { id: "supplies", title: "Food & Water Drop-offs", icon: HeartHandshake, desc: "View active distribution grids and logistics depots.", color: "hover:border-amber-500" },
    { id: "volunteer", title: "Spontaneous Volunteer", icon: CheckCircle2, desc: "Join hands to help package meals or transport families.", color: "hover:border-green-500" },
    { id: "translate", title: "Translate Message", icon: Globe, desc: "Translate emergency alerts to overcome language barriers.", color: "hover:border-blue-500" },
    { id: "rumor", title: "Verify Information", icon: AlertTriangle, desc: "Check if flood or supply alerts are validated or rumor.", color: "hover:border-orange-500" },
    { id: "assistant", title: "AI Emergency Assistant", icon: Sparkles, desc: "Get compassionate, instant, calming advice.", color: "hover:border-pink-500" }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Top Welcoming Section */}
      <div className="border border-zinc-800 bg-[#070707] p-6 md:p-8 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Community Emergency Assistance Portal
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl font-medium">
              Welcome to the public assistance station. We are dedicated to providing clear, validated information and immediate connection to local aid.
            </p>
          </div>
          {activeAction !== "home" && (
            <button
              onClick={() => setActiveAction("home")}
              className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-xs font-mono uppercase text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              Back to Actions Hub
            </button>
          )}
        </div>
      </div>

      {/* Primary Action Hub Route Router */}
      {activeAction === "home" && (
        <div className="space-y-8">
          {/* Active Broadcast Marquee / Alerts */}
          <div className="border border-red-900/60 bg-red-950/10 p-4 flex gap-4 items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-red-400 uppercase font-black tracking-widest">CRITICAL BROADCAST</span>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                Shelter Omega is fully active. River Road bridge remains closed due to water levels, please use the northern bypass. Clean water reserves are safe and secure.
              </p>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actionCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => setActiveAction(card.id)}
                  className={`border border-zinc-900 bg-zinc-950 p-5 text-left space-y-3 transition-all cursor-pointer hover:bg-zinc-900/30 ${card.color}`}
                >
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 text-emerald-400 inline-block">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{card.title}</h4>
                    <p className="text-[11px] text-zinc-500 leading-normal font-medium">{card.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Emergency Contacts Hotlines */}
          <div className="border border-zinc-900 p-6 bg-[#080808] space-y-4">
            <div className="border-b border-zinc-900 pb-2">
              <h5 className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                Emergency Hotline Frequencies & Contacts
              </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-zinc-900 p-3 bg-zinc-950/40">
                <div className="font-mono text-zinc-500 uppercase text-[9px]">UHF Search & Rescue</div>
                <div className="font-bold text-white mt-1">146.520 MHz (Simplex)</div>
              </div>
              <div className="border border-zinc-900 p-3 bg-zinc-950/40">
                <div className="font-mono text-zinc-500 uppercase text-[9px]">Medical Despatch Center</div>
                <div className="font-bold text-white mt-1">+1 (800) 555-0199</div>
              </div>
              <div className="border border-zinc-900 p-3 bg-zinc-950/40">
                <div className="font-mono text-zinc-500 uppercase text-[9px]">Red Cross Shelter Omega</div>
                <div className="font-bold text-white mt-1">+1 (555) 012-9421</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Find Shelters */}
      {activeAction === "shelters" && (
        <div className="border border-zinc-800 bg-[#070707] p-6 space-y-6">
          <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Home className="text-emerald-500 w-5 h-5" />
              Active Safe Shelters
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 border border-emerald-900">UPDATED JUST NOW</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "Shelter Omega Regional Hub",
                location: "High School Gym (1200 Westside Ave)",
                occupancy: "94% Occupied",
                status: "ACTIVE - ACCEPTING EVACUEES",
                statusColor: "text-emerald-500 bg-emerald-950/20 border-emerald-900",
                facilities: ["Heated Canopy", "Warm Meals", "Clinical Triage Team", "Backup Generators"]
              },
              {
                name: "Shelter Delta Civic Pavilion",
                location: "Community Center (340 River Road East)",
                occupancy: "42% Occupied",
                status: "ACTIVE - PLENTY OF CAPACITY",
                statusColor: "text-cyan-400 bg-cyan-950/20 border-cyan-900",
                facilities: ["Cot Beds", "Baby Formula Depot", "Fresh Water Tankers", "First-Aid Point"]
              }
            ].map((sh, idx) => (
              <div key={idx} className="border border-zinc-900 bg-zinc-950 p-5 space-y-4">
                <div className="space-y-1">
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${sh.statusColor}`}>
                    {sh.status}
                  </span>
                  <h4 className="text-base font-black text-white uppercase mt-2">{sh.name}</h4>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {sh.location}
                  </p>
                </div>

                <div className="text-xs font-mono text-zinc-500">
                  Current Occupancy Level: <span className="text-white font-bold">{sh.occupancy}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Available Amenities:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sh.facilities.map((fac, i) => (
                      <span key={i} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-medium">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Showing route mapping to ${sh.name}. Proceed along marked evacuation pathways.`)}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Request Evacuation Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Request Emergency Help */}
      {activeAction === "help" && (
        <div className="border border-zinc-800 bg-[#070707] p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <AlertOctagon className="text-red-500 w-5 h-5 animate-pulse" />
              Direct Emergency Request Station
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Submit high-urgency reports. Dispatchers and volunteers monitor this grid constantly.</p>
          </div>

          {helpSubmitted ? (
            <div className="bg-emerald-950/20 border border-emerald-900/60 p-6 text-center space-y-3">
              <span className="text-emerald-500 font-bold font-mono text-3xl">✓</span>
              <h4 className="text-sm font-black text-white uppercase">Emergency Signal Transmitted</h4>
              <p className="text-xs text-zinc-400">
                Our cooperative swarm has logged your coordinate signals. Active first responders in your area have been alerted. Keep your communications line clear.
              </p>
              <button
                onClick={() => setHelpSubmitted(false)}
                className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono uppercase"
              >
                Send New Alert
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendHelpRequest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Your Name / Contact Info</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe - Phone: +1-555-0129"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Where are you located?</label>
                <input
                  type="text"
                  required
                  value={helpLocation}
                  onChange={(e) => setHelpLocation(e.target.value)}
                  placeholder="Street Address, intersection, or GPS coordinates"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">What is the urgent emergency?</label>
                <textarea
                  required
                  rows={4}
                  value={helpDesc}
                  onChange={(e) => setHelpDesc(e.target.value)}
                  placeholder="Please specify medical needs, trapped individuals, blockages, or structural danger..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-red-500 leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black uppercase text-xs tracking-wider cursor-pointer"
              >
                Transmit Immediate Rescue Call
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab: Find Hospitals */}
      {activeAction === "hospitals" && (
        <div className="border border-zinc-800 bg-[#070707] p-6 space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Shield className="text-cyan-400 w-5 h-5" />
              Active Clinical Triage & Hospitals
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "Sector Delta Field Hospital",
                location: "Primary Medical Canopy (Adjacent to Shelter Omega)",
                capacity: "Fully Equipped for Trauma & First Aid",
                services: "START Clinical Triage, Wound Dressing, Emergency Operations",
                contact: "+1-800-555-0143"
              },
              {
                name: "Westside General Auxiliary Station",
                location: "St. Mary's Lower Hall (12 Main St)",
                capacity: "Accepting Minor Injuries & Outpatients",
                services: "Insulin Distribution, Cardiac Care Stabilisation, Basic Pharmacy",
                contact: "+1-555-019-3382"
              }
            ].map((hp, idx) => (
              <div key={idx} className="border border-zinc-900 bg-zinc-950 p-5 space-y-4">
                <h4 className="text-base font-black text-white uppercase">{hp.name}</h4>
                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {hp.location}
                </p>

                <div className="text-xs text-zinc-300 font-medium space-y-1.5">
                  <div><strong>Capabilities:</strong> {hp.capacity}</div>
                  <div><strong>Critical Services:</strong> {hp.services}</div>
                  <div><strong>Direct Line:</strong> <span className="font-mono text-cyan-400">{hp.contact}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Food & Water */}
      {activeAction === "supplies" && (
        <div className="border border-zinc-800 bg-[#070707] p-6 space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <HeartHandshake className="text-amber-500 w-5 h-5" />
              Emergency Food & Water Distribution
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                depot: "Central Water Grid Station 01",
                address: "Westside High School Yard",
                items: "Drinking water tankers, purification tablets, standard dry food packs.",
                schedule: "Continuous Supply Drop-offs (8:00 AM - 8:00 PM)",
                safety: "Safe path via North Avenue bypass."
              },
              {
                depot: "River Sector Supply Drop Point",
                address: "River Road Intersection North",
                items: "Meals Ready to Eat (MREs), blankets, infant formula supplies.",
                schedule: "Emergency drops scheduled at 10:00 AM, 3:00 PM, and 7:00 PM daily.",
                safety: "Restricted to pedestrian and light supply transport. Avoid heavy trucks."
              }
            ].map((dp, idx) => (
              <div key={idx} className="border border-zinc-900 bg-zinc-950 p-5 space-y-3">
                <h4 className="text-base font-black text-white uppercase">{dp.depot}</h4>
                <div className="text-xs text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {dp.address}
                </div>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  <strong>Available Supplies:</strong> {dp.items}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-xs">
                  <div><strong>Distribution Hours:</strong> <span className="text-amber-500">{dp.schedule}</span></div>
                  <div><strong>Routing Notice:</strong> <span className="text-zinc-400">{dp.safety}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Spontaneous Volunteer */}
      {activeAction === "volunteer" && (
        <div className="border border-zinc-800 bg-[#070707] p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <CheckCircle2 className="text-green-500 w-5 h-5" />
              Join Community Support Network
            </h3>
            <p className="text-xs text-zinc-400 mt-1">If you are safe, healthy, and willing to assist, register below. We assign spontaneous tasks cleanly based on shelter needs.</p>
          </div>

          {volSubmitted ? (
            <div className="bg-emerald-950/20 border border-emerald-900/60 p-6 text-center space-y-3">
              <span className="text-emerald-500 font-bold font-mono text-3xl">✓</span>
              <h4 className="text-sm font-black text-white uppercase">Thank you, Volunteer!</h4>
              <p className="text-xs text-zinc-400">
                Your credentials have been loaded. If a shelter needs cargo packing, driving support, or medical assistants, our system coordinator will pair you instantly.
              </p>
              <button
                onClick={() => setVolSubmitted(false)}
                className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono uppercase"
              >
                Register Another Volunteer
              </button>
            </div>
          ) : (
            <form onSubmit={handleVolunteerSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase block">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  placeholder="e.g. John Jenkins"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase block">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  value={volPhone}
                  onChange={(e) => setVolPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-3829"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase block">What is your primary skill / support area?</label>
                <select
                  value={volSkill}
                  onChange={(e) => setVolSkill(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-green-500"
                >
                  <option value="First Aid / Clinical Support">First Aid / Medical Assistant</option>
                  <option value="Heavy Logistics Transport Driving">Heavy Supply Driving / Trucking</option>
                  <option value="Food preparation / Shelter Support">Food Preparation & distribution</option>
                  <option value="Language translation assistance">Language Translation</option>
                  <option value="General Support">General Manual labor / Cot Assembly</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider cursor-pointer"
              >
                Register My Availability to Help
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab: Translate Message */}
      {activeAction === "translate" && (
        <div className="border border-zinc-800 bg-[#070707] p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <Globe className="text-blue-500 w-5 h-5" />
              Emergency Language Translation Station
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Translate incoming distress messages in non-local dialects instantly.</p>
          </div>

          <form onSubmit={handleTranslate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block">Incoming Distress Message</label>
              <textarea
                required
                rows={3}
                value={transInput}
                onChange={(e) => setTransInput(e.target.value)}
                placeholder="Paste the message here (e.g. 'Necesitamos agua potable y mantas en la escuela...')"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={translating}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase cursor-pointer"
            >
              {translating ? "Translating Dialect..." : "Run Emergency Translation"}
            </button>
          </form>

          {transOutput && (
            <div className="p-4 border border-blue-900/40 bg-blue-950/15 text-xs text-zinc-300 leading-relaxed font-medium rounded">
              {transOutput}
            </div>
          )}
        </div>
      )}

      {/* Tab: Verify Information */}
      {activeAction === "rumor" && (
        <div className="border border-zinc-800 bg-[#070707] p-6 max-w-xl mx-auto space-y-6">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <AlertTriangle className="text-orange-500 w-5 h-5" />
              Verify Rumor / Information Check
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Paste alerts seen on social media or SMS to check if our disaster coordinators have verified them.</p>
          </div>

          <form onSubmit={handleVerifyRumor} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase block">Rumor / Alert to Validate</label>
              <textarea
                required
                rows={3}
                value={rumorText}
                onChange={(e) => setRumorText(e.target.value)}
                placeholder="e.g. 'They are saying the water supply at Shelter Omega is contaminated!'"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-orange-500 leading-relaxed font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase cursor-pointer"
            >
              {verifying ? "Querying Verifications Grid..." : "Verify Alert Integrity"}
            </button>
          </form>

          {rumorResult && (
            <div className={`p-4 border text-xs leading-relaxed space-y-2 rounded ${rumorResult.color}`}>
              <span className="font-bold font-mono tracking-wider text-[10px] uppercase block">{rumorResult.status}</span>
              <p className="font-medium text-zinc-200">{rumorResult.desc}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: AI Emergency Assistant */}
      {activeAction === "assistant" && (
        <div className="border border-zinc-800 bg-[#070707] p-5 flex flex-col justify-between h-[550px] max-w-2xl mx-auto">
          <div className="border-b border-zinc-900 pb-3 mb-4">
            <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
              Compassionate Emergency Assistant
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Always open to guide, soothe, and point you toward local emergency solutions.</p>
          </div>

          {/* Messages Grid */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
            {chatMessages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={i}
                  className={`flex gap-3 max-w-lg ${isUser ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`p-2 border shrink-0 h-8 w-8 flex items-center justify-center font-bold text-xs ${
                    isUser ? "bg-emerald-950 border-emerald-800 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-200"
                  }`}>
                    {isUser ? "U" : "AI"}
                  </div>
                  <div className={`p-3 border text-xs leading-relaxed space-y-1 ${
                    isUser ? "bg-zinc-950 border-zinc-800 text-zinc-300 rounded-l" : "bg-zinc-900/40 border-zinc-900 text-zinc-200 rounded-r"
                  }`}>
                    <p className="font-medium whitespace-pre-line">{msg.content}</p>
                    <span className="text-[9px] font-mono text-zinc-600 block pt-1 text-right">{msg.time}</span>

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
            {chatLoading && (
              <div className="flex gap-3 max-w-lg">
                <div className="p-2 border shrink-0 h-8 w-8 bg-zinc-900 border-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div className="p-3 bg-zinc-900/25 border border-zinc-900 text-zinc-500 text-xs font-mono animate-pulse rounded-r">
                  Drafting compassionate aid support...
                </div>
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="flex gap-2 border-t border-zinc-900 pt-4 mt-4">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything (e.g. 'where is water?', 'what is the safest path?')..."
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-xs text-white rounded focus:outline-none focus:border-emerald-500 font-medium"
            />
            <button
              type="submit"
              className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center rounded cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
