import React, { useState, useEffect } from "react";
import { 
  Shield, Cpu, Database, FileText, GitPullRequest, Layers, Map, Users, Zap, 
  AlertTriangle, Server, Code, CheckCircle, TrendingUp, Terminal, Grid,
  Home, LogIn, ClipboardList, Settings as SettingsIcon, ShieldAlert,
  Sparkles, Globe, HeartHandshake, Phone, Activity, LogOut, Lock, LayoutDashboard
} from "lucide-react";

// API Helpers & Types
import { UserProfile, UserRole } from "./types";
import { getStoredProfile, authApi } from "./api";

// Interactive Views
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard"; // Original tactical command
import AIChat from "./components/AIChat";
import EmergencyRequest from "./components/EmergencyRequest";
import VolunteerDashboard from "./components/VolunteerDashboard";
import Resources from "./components/Resources";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

// New Dual-Dashboard Components
import PublicUserDashboard from "./components/PublicUserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminAgentMonitor from "./components/AdminAgentMonitor";
import AdminMcpMonitor from "./components/AdminMcpMonitor";
import AdminWorkflow from "./components/AdminWorkflow";
import AdminSecurity from "./components/AdminSecurity";

export default function App() {
  const [activeRoute, setActiveRoute] = useState<string>(() => {
    return window.location.pathname || "/";
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Sync state with URL pathname to support direct links cleanly
  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    
    const profile = getStoredProfile();
    if (profile) {
      setUserProfile(profile);
    }
    setCheckingAuth(false);
    
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setActiveRoute(path);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    if (profile.role === UserRole.ADMIN) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setUserProfile(null);
    navigate("/");
  };

  const isAdmin = userProfile?.role === UserRole.ADMIN;

  // Render Access Denied for unauthorized access to /admin/*
  const renderAccessDenied = () => (
    <div className="max-w-md mx-auto my-12 border border-red-900/60 bg-red-950/15 p-6 text-center space-y-4">
      <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
      <h3 className="text-lg font-black text-white uppercase">Access Unauthorized</h3>
      <p className="text-xs text-zinc-400 leading-relaxed">
        This route is restricted to system administrators and Kaggle evaluators. 
        Please sign in with an Administrator profile to inspect ADK agents, tool registries, and security telemetry.
      </p>
      <button
        onClick={() => navigate("/profile")}
        className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs uppercase cursor-pointer"
      >
        View My Clearance / Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* Dynamic Top Accent Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r transition-all duration-500 ${
        activeRoute.startsWith("/admin") 
          ? "from-orange-600 via-amber-500 to-yellow-500" 
          : "from-emerald-500 via-teal-500 to-cyan-500"
      }`}></div>

      {/* Main Unified Header */}
      <header className="border-b border-zinc-900 bg-[#070707] px-6 py-5 md:px-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded ${
              activeRoute.startsWith("/admin") 
                ? "bg-orange-950 border border-orange-800 text-orange-400" 
                : "bg-emerald-950 border border-emerald-800 text-emerald-400"
            }`}>
              {activeRoute.startsWith("/admin") ? "KAG-SWARM-AUDIT" : "COMMUNITY PORTAL"}
            </span>
            <span className="text-xs font-mono text-zinc-500">Decentralized Relief Agent Mesh</span>
          </div>
          <h1 
            onClick={() => navigate("/")} 
            className="text-3xl font-black tracking-tighter text-white uppercase cursor-pointer hover:opacity-90"
          >
            RELIEF AI
          </h1>
        </div>

        {/* Center Navigation Selector (Dual-Core Toggle) */}
        <div className="flex gap-1.5 p-1 bg-zinc-950 border border-zinc-900 font-mono text-[10px] font-black">
          <button
            onClick={() => navigate("/dashboard")}
            className={`px-3 py-1.5 uppercase transition-all cursor-pointer ${
              !activeRoute.startsWith("/admin") 
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Public Assistance Hub
          </button>
          <button
            onClick={() => {
              if (isAdmin) {
                navigate("/admin");
              } else {
                navigate("/admin");
              }
            }}
            className={`px-3 py-1.5 uppercase transition-all cursor-pointer ${
              activeRoute.startsWith("/admin") 
                ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Technical Operations Center
          </button>
        </div>

        {/* User Credential Bar */}
        <div className="text-xs font-mono text-zinc-500 flex items-center gap-3">
          {userProfile ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-white font-bold">{userProfile.full_name}</div>
                <div className="text-[10px] text-zinc-500 uppercase">{userProfile.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 border border-zinc-800 bg-zinc-900 hover:text-white transition-all cursor-pointer"
                title="Log Out Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white uppercase font-bold text-[10px] tracking-wider cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-visible">
        {/* Navigation Sidebar */}
        <nav className="col-span-12 lg:col-span-3 border-b lg:border-b-0 lg:border-r border-zinc-900 bg-[#070707] p-6 space-y-4">
          
          {/* Section 1: Public / Responder Nav Links */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block">
              PUBLIC ASSISTANCE PORTAL
            </span>
            <div className="space-y-1">
              {[
                { path: "/", name: "Landing Hub", icon: Home, desc: "Overview & registry" },
                { path: "/dashboard", name: "Find Shelter", icon: LayoutDashboard, desc: "Safe havens & help actions" },
                { path: "/chat", name: "AI Assistant", icon: Sparkles, desc: "Compassionate relief advice" },
                { path: "/resources", name: "Logistics Hub", icon: Database, desc: "Track emergency supplies" },
                { path: "/volunteer", name: "Volunteer Portal", icon: Users, desc: "Spontaneous signups" },
                { path: "/profile", name: "My Credentials", icon: Shield, desc: "Clearance level profile" },
                { path: "/settings", name: "Mesh Diagnostics", icon: SettingsIcon, desc: "Offline syncing status" }
              ].map((link) => {
                const Icon = link.icon;
                const isSelected = activeRoute === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`w-full text-left p-2.5 border transition-all flex items-start gap-3 ${
                      isSelected 
                        ? "bg-zinc-900 border-emerald-500/40 text-emerald-400" 
                        : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-emerald-400" : "text-zinc-500"}`} />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-tight text-zinc-200">
                        {link.name}
                      </div>
                      <div className="text-[9px] text-zinc-500">{link.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Technical / Admin Links */}
          <div className="space-y-2 pt-4 border-t border-zinc-900/60">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest block flex items-center gap-1">
              <Lock className="w-3 h-3 text-orange-500" />
              ADMIN OPERATIONS PANEL
            </span>
            <div className="space-y-1">
              {[
                { path: "/admin", name: "Operations Terminal", icon: Grid, desc: "SITREPs & analytics charts" },
                { path: "/admin/agents", name: "AI Agent Monitor", icon: Cpu, desc: "Status of 9 ADK swarms" },
                { path: "/admin/mcp", name: "MCP Tool Registry", icon: Layers, desc: "Live service tool telemetry" },
                { path: "/admin/analytics", name: "Workflow Pipelines", icon: GitPullRequest, desc: "Interactive animated flows" },
                { path: "/admin/security", name: "Security Console", icon: ShieldAlert, desc: "Guardrails & audit logs" }
              ].map((link) => {
                const Icon = link.icon;
                const isSelected = activeRoute === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`w-full text-left p-2.5 border transition-all flex items-start gap-3 ${
                      isSelected 
                        ? "bg-zinc-900 border-orange-500/40 text-orange-400" 
                        : "bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-orange-400" : "text-zinc-500"}`} />
                    <div>
                      <div className="font-bold text-xs uppercase tracking-tight text-zinc-200 flex items-center gap-1">
                        {link.name}
                        {!isAdmin && <span className="text-[8px] px-1 bg-zinc-900 text-zinc-600 border border-zinc-800">LOCKED</span>}
                      </div>
                      <div className="text-[9px] text-zinc-500">{link.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </nav>

        {/* Content Workspace Area */}
        <section className="col-span-12 lg:col-span-9 p-6 md:p-8 bg-[#050505] overflow-y-auto">
          
          {/* ========================================================= */}
          {/* USER FACING / PUBLIC ROUTES */}
          {/* ========================================================= */}
          
          {activeRoute === "/" && (
            <LandingPage onNavigate={navigate} isLoggedIn={!!userProfile} />
          )}

          {activeRoute === "/dashboard" && (
            <PublicUserDashboard onNavigate={navigate} />
          )}

          {activeRoute === "/chat" && (
            <div className="max-w-2xl mx-auto border border-zinc-800 bg-[#070707] p-5 h-[550px] flex flex-col justify-between">
              <div className="border-b border-zinc-900 pb-3 mb-4">
                <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                  Compassionate Emergency Assistant
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono uppercase">ALWAYS PREPARED TO ADVISE, SUPPORT AND DE-ESCALATE CRISES.</p>
              </div>
              <AIChat user={userProfile || { id: "guest", full_name: "Guest", role: UserRole.USER }} />
            </div>
          )}

          {activeRoute === "/resources" && (
            <Resources />
          )}

          {activeRoute === "/volunteer" && (
            <VolunteerDashboard />
          )}

          {activeRoute === "/profile" && (
            userProfile ? (
              <Profile user={userProfile} onLogout={handleLogout} />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          )}

          {activeRoute === "/settings" && (
            <Settings />
          )}

          {/* ========================================================= */}
          {/* ADMINISTRATOR / TECHNICAL ROUTE SHIELD */}
          {/* ========================================================= */}
          
          {activeRoute === "/admin" && (
            isAdmin ? (
              <div className="space-y-8">
                {/* Visual System Health Metrics at Top of Admin Operations Panel */}
                <div className="border border-zinc-800 bg-[#090909] p-5 space-y-4">
                  <h3 className="text-xs font-mono font-bold text-white uppercase border-b border-zinc-900 pb-2">
                    ACTIVE MESH OPERATIONAL SYSTEM HEALTH
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                    {[
                      { label: "CPU Usage", val: "14.2%", status: "OPTIMAL", color: "text-emerald-400" },
                      { label: "Memory Usage", val: "1.8 GB", status: "NOMINAL", color: "text-emerald-400" },
                      { label: "Database Status", val: "CONNECTED", status: "STABLE", color: "text-emerald-400" },
                      { label: "Gemini API", val: "ONLINE", status: "ACTIVE", color: "text-emerald-400" },
                      { label: "MCP Server", val: "LOCAL_LINK", status: "CONNECTED", color: "text-emerald-400" },
                      { label: "Queue Length", val: "0 Tasks", status: "CLEAR", color: "text-zinc-400" },
                      { label: "Response Time", val: "125ms", status: "EXCELLENT", color: "text-emerald-400" }
                    ].map((health, idx) => (
                      <div key={idx} className="border border-zinc-900 p-3 bg-zinc-950/40">
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">{health.label}</div>
                        <div className="text-xs font-black text-white uppercase mt-1">{health.val}</div>
                        <div className={`text-[8px] font-mono font-bold mt-0.5 ${health.color}`}>{health.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <AdminDashboard onNavigate={navigate} />
              </div>
            ) : renderAccessDenied()
          )}

          {activeRoute === "/admin/agents" && (
            isAdmin ? <AdminAgentMonitor /> : renderAccessDenied()
          )}

          {activeRoute === "/admin/mcp" && (
            isAdmin ? <AdminMcpMonitor /> : renderAccessDenied()
          )}

          {activeRoute === "/admin/analytics" && (
            isAdmin ? <AdminWorkflow /> : renderAccessDenied()
          )}

          {activeRoute === "/admin/security" && (
            isAdmin ? <AdminSecurity /> : renderAccessDenied()
          )}

        </section>
      </main>
    </div>
  );
}
