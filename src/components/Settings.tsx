import React, { useState } from "react";
import { Shield, Radio, MapPin, Trash2, Server, Key, AlertTriangle } from "lucide-react";

export default function Settings() {
  const [meshStatus, setMeshStatus] = useState<string>("online");
  const [encryption, setEncryption] = useState<boolean>(true);
  const [mockLat, setMockLat] = useState<number>(45.4111);
  const [mockLng, setMockLng] = useState<number>(-122.6222);

  const handleResetCache = () => {
    if (confirm("Reset local offline database cache and purge session logs?")) {
      localStorage.removeItem("relief_auth_token");
      localStorage.removeItem("relief_user_profile");
      alert("Local data cleared successfully.");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4">
      <div className="border border-zinc-800 bg-zinc-950 p-6 md:p-8 relative space-y-8">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-700"></div>

        <div className="border-b border-zinc-900 pb-4">
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-orange-500 animate-pulse" />
            Tactical Settings & Mesh Diagnostics
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Configure local fallback states, encrypt handshakes, and check radio diagnostics.
          </p>
        </div>

        {/* Mesh Status selector */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Simulated Network Mesh Link</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "online", name: "FULL CLOUD SYNC", desc: "Online REST API via Cloud Run" },
              { id: "mesh", name: "LOCAL MESH MAPPING", desc: "LoRa P2P Packet Sync" },
              { id: "offline", name: "COMPLETELY OFFLINE", desc: "Local SQLite Storage Mode" }
            ].map((mesh) => (
              <button
                key={mesh.id}
                type="button"
                onClick={() => setMeshStatus(mesh.id)}
                className={`p-3 border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                  meshStatus === mesh.id 
                    ? "border-orange-500 bg-zinc-900 text-white" 
                    : "border-zinc-900 bg-[#080808] text-zinc-400 hover:border-zinc-800"
                }`}
              >
                <div className="text-[11px] font-black uppercase tracking-tight">{mesh.name}</div>
                <div className="text-[9px] font-mono text-zinc-500">{mesh.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mock GPS coordinate adjustments */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" /> Mock GPS Latitude/Longitude Reference
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.0001"
              value={mockLat}
              onChange={(e) => setMockLat(parseFloat(e.target.value))}
              placeholder="Latitude"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded font-mono focus:outline-none focus:border-orange-500"
            />
            <input
              type="number"
              step="0.0001"
              value={mockLng}
              onChange={(e) => setMockLng(parseFloat(e.target.value))}
              placeholder="Longitude"
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-white rounded font-mono focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Security / Encryption option */}
        <div className="border border-zinc-900 p-4 bg-[#0a0a0a] flex justify-between items-center">
          <div className="space-y-1 pr-4">
            <h5 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Key className="w-4 h-4 text-orange-500" /> AES-256 Packet Signatures
            </h5>
            <p className="text-[11px] text-zinc-400 leading-normal">
              When toggled, signs and verifies each mesh database packet using SHA-256 to avoid spoofing alerts.
            </p>
          </div>
          <button
            onClick={() => setEncryption(!encryption)}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase border cursor-pointer ${
              encryption ? "border-emerald-500 text-emerald-400 bg-emerald-950/20" : "border-zinc-800 text-zinc-500 bg-transparent"
            }`}
          >
            {encryption ? "ENCRYPTED" : "PLAINTEXT"}
          </button>
        </div>

        {/* Clear/Reset storage options */}
        <div className="space-y-3 pt-4 border-t border-dashed border-zinc-900">
          <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Destructive System Actions</label>
          <div className="flex gap-4">
            <button
              onClick={handleResetCache}
              className="px-4 py-2 border border-red-900/60 hover:bg-red-950/20 text-red-400 hover:text-red-300 font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Reset Local Cache
            </button>
            <div className="text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
              Resetting local cache will de-authorize active tokens and clear local mock database profiles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
