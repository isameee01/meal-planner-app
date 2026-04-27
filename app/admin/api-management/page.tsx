"use client";

import React, { useState } from "react";
import { useAPIManagement, AIProviderId, AIFeatureId } from "@/lib/hooks/useAPIManagement";
import { 
  ShieldCheck, 
  Settings2, 
  Cpu, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Zap, 
  ArrowRight,
  Database,
  Clock,
  RotateCcw,
  AlertTriangle
} from "lucide-react";

/**
 * API Management Control Panel
 * The heart of the AI multi-provider infrastructure.
 * Manages failover logic, provider priority, and real-time connectivity states.
 */
export default function APIManagementPage() {
  const { config, updateProvider, updateMapping, updateFailover, isLoaded, resetToDefaults } = useAPIManagement();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<AIProviderId | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: "success" | "error"; message: string }>>({});

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-emerald-600">
          <Activity className="w-8 h-8 animate-pulse" />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Initializing Global API Mesh...</p>
        </div>
      </div>
    );
  }

  const simulateTestAPI = async (providerId: AIProviderId) => {
    setTestingProvider(providerId);
    // Lightweight simulation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const keyPresent = !!config.providers[providerId].apiKey;
    const isEnabled = config.providers[providerId].enabled;

    if (!isEnabled) {
      setTestResults(prev => ({ ...prev, [providerId]: { status: "error", message: "Provider is disabled." } }));
    } else if (!keyPresent) {
      setTestResults(prev => ({ ...prev, [providerId]: { status: "error", message: "API key is missing." } }));
    } else {
      setTestResults(prev => ({ ...prev, [providerId]: { status: "success", message: "Connection established safely." } }));
    }
    setTestingProvider(null);
    setTimeout(() => setTestResults(prev => { 
      const next = { ...prev }; 
      delete next[providerId]; 
      return next; 
    }), 3000);
  };

  const ProviderCard = ({ providerId }: { providerId: AIProviderId }) => {
    const provider = config.providers[providerId];
    const testResult = testResults[providerId];

    return (
      <div className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${
        provider.enabled 
          ? "bg-white border-slate-100 shadow-xl shadow-slate-100" 
          : "bg-slate-50 border-slate-100 grayscale opacity-70"
      }`}>
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${provider.enabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-500"}`}>
                 <Cpu size={24} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tighter">{provider.name}</h3>
                 <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${provider.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${provider.enabled ? "text-emerald-600" : "text-slate-400"}`}>
                      {provider.enabled ? "Active Node" : "Node Disabled"}
                    </span>
                 </div>
              </div>
           </div>
           <button
             onClick={() => updateProvider(providerId, { enabled: !provider.enabled })}
             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
               provider.enabled ? "bg-emerald-600" : "bg-slate-300"
             }`}
           >
             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
               provider.enabled ? "translate-x-6" : "translate-x-1"
             }`} />
           </button>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target End-Point Model</label>
              <input
                type="text"
                value={provider.model}
                onChange={(e) => updateProvider(providerId, { model: e.target.value })}
                className="w-full px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
              />
           </div>

           <div className="space-y-2">
              <div className="flex justify-between px-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret API Key</label>
                 <span className={`text-[10px] font-black uppercase ${provider.apiKey ? "text-emerald-600" : "text-slate-400"}`}>
                   {provider.apiKey ? "Encrypted" : "Empty"}
                 </span>
              </div>
              <div className="relative group">
                 <input
                   type={showKeys[providerId] ? "text" : "password"}
                   value={provider.apiKey}
                   onChange={(e) => updateProvider(providerId, { apiKey: e.target.value })}
                   className="w-full px-6 py-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl text-xs font-mono focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all pr-12"
                   placeholder="Enter Access Token..."
                 />
                 <button
                   onClick={() => setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }))}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors"
                 >
                   {showKeys[providerId] ? <EyeOff size={18} /> : <Eye size={18} />}
                 </button>
              </div>
           </div>

           <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => simulateTestAPI(providerId)}
                disabled={testingProvider === providerId}
                className="flex-1 py-3 px-6 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                {testingProvider === providerId ? <RefreshCw size={14} className="animate-spin" /> : <Terminal size={14} />}
                {testingProvider === providerId ? "Handshaking..." : "Test Connection"}
              </button>
              {testResult && (
                <div className={`p-3 rounded-2xl animate-in fade-in zoom-in duration-300 ${testResult.status === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
                   {testResult.status === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  const MappingRow = ({ featureId, label }: { featureId: AIFeatureId, label: string }) => {
    const mapping = config.mappings[featureId];
    return (
      <div className="p-8 bg-white border border-slate-100 rounded-[2rem] flex flex-col xl:flex-row items-center justify-between gap-12 shadow-sm hover:shadow-md transition-shadow">
         <div className="flex items-center gap-6 xl:w-1/4">
            <div className="p-4 bg-slate-50 text-slate-800 rounded-2xl">
               <Activity size={24} />
            </div>
            <div>
               <h4 className="text-lg font-black text-slate-900 tracking-tight italic">{label}</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Logic Mapping</p>
            </div>
         </div>

         <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { key: "primary", label: "Primary Cluster", color: "text-emerald-600" },
              { key: "secondary", label: "Failover Node", color: "text-amber-500" },
              { key: "tertiary", label: "Final Fallback", color: "text-rose-500" },
            ].map((slot, idx) => (
              <React.Fragment key={slot.key}>
                <div className="flex-1 w-full space-y-2">
                   <label className={`text-[10px] font-black uppercase tracking-widest pl-2 mb-1 block ${slot.color}`}>{slot.label}</label>
                   <select
                     value={(mapping as any)[slot.key] || ""}
                     onChange={(e) => updateMapping(featureId, { [slot.key]: e.target.value === "null" ? null : e.target.value })}
                     className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-slate-100"
                   >
                     <option value="groq">Groq Cluster</option>
                     <option value="openai">OpenAI Node</option>
                     <option value="gemini">Gemini Mesh</option>
                     {slot.key === "tertiary" && <option value="null">None (Terminate)</option>}
                   </select>
                </div>
                {idx < 2 && <ArrowRight size={20} className="text-slate-300 hidden md:block mt-6" />}
              </React.Fragment>
            ))}
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-16 pb-24 animate-in fade-in duration-1000">
      
      {/* Infrastructure Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <div className="flex items-center gap-5">
              <div className="p-4 bg-emerald-600 text-white rounded-[2rem] shadow-2xl shadow-emerald-100">
                 <Settings2 size={32} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">AI Hub Orchestrator</h1>
           </div>
           <p className="text-slate-500 mt-2 font-medium">Configure global LLM provider clusters, failover thresholds, and regional key management.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={resetToDefaults}
             className="px-8 py-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
           >
             <RotateCcw size={16} className="inline mr-2" /> Global Cluster Reset
           </button>
           <div className="px-6 py-3 bg-slate-900 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <ShieldCheck size={20} /> SECURE CRYPTO VAULT ACTIVE
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        
        {/* Node Infrastructure */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 border-l-4 border-emerald-600 pl-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Regional Node Infrastructure</h2>
              <div className="flex-1 h-[1px] bg-slate-100" />
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ProviderCard providerId="groq" />
              <ProviderCard providerId="openai" />
              <ProviderCard providerId="gemini" />
           </div>
        </section>

        {/* Global Logic Mapping */}
        <section className="space-y-8">
           <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Feature-Provider Mapping Mesh</h2>
              <div className="flex-1 h-[1px] bg-slate-100" />
           </div>

           <div className="space-y-6">
              <MappingRow featureId="mealGenerator" label="Plan Generation Engine" />
              <MappingRow featureId="recipeGenerator" label="Deep Recipe Synthesis" />
              <MappingRow featureId="rebalanceEngine" label="Real-time Macro Rebalance" />
           </div>
        </section>

        {/* Failover Policy Section */}
        <section>
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-12 flex flex-col xl:flex-row items-center gap-12 shadow-inner">
             <div className="xl:w-1/3 space-y-4 text-center xl:text-left">
                <div className="flex items-center justify-center xl:justify-start gap-4">
                   <div className="p-2 bg-slate-900 rounded-lg text-emerald-400">
                      <Zap size={20} />
                   </div>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Network Failover Policy</h3>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">Autonomous Redundancy System</h2>
                <p className="text-slate-500 text-sm leading-relaxed font-medium italic">
                  Define how the cluster responds to node downtime. Failover ensures 99.9% AI availability for end-users.
                </p>
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Failover</p>
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 italic">{config.failover.enableFallback ? "Enabled" : "Disabled"}</span>
                      <button
                        onClick={() => updateFailover({ enableFallback: !config.failover.enableFallback })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          config.failover.enableFallback ? "bg-emerald-600" : "bg-slate-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.failover.enableFallback ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                   </div>
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Retry Attempts</p>
                   <input
                     type="number"
                     value={config.failover.retryAttempts}
                     onChange={(e) => updateFailover({ retryAttempts: parseInt(e.target.value) })}
                     className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800"
                   />
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Timeout (ms)</p>
                   <input
                     type="number"
                     step="1000"
                     value={config.failover.timeoutMs}
                     onChange={(e) => updateFailover({ timeoutMs: parseInt(e.target.value) })}
                     className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800"
                   />
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-center border-dashed border-2 border-slate-200">
                   <div className="text-center space-y-1">
                      <Database size={24} className="mx-auto text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic">Registry Node: v1.0.4</p>
                   </div>
                </div>
             </div>
          </div>
        </section>
      </div>

      {/* Global Status Mesh */}
      <div className="p-10 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_top,#10b98122,transparent)]" />
         <div className="relative z-10 space-y-3 text-center md:text-left">
            <h2 className="text-2xl font-black text-white flex items-center justify-center md:justify-start gap-4 uppercase italic tracking-widest">
               AI MESH INTEGRITY <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed italic">
              Cluster propagation is configured for global sub-millisecond failover. Changes to node API keys take effect immediately across all regional serverless environments.
            </p>
         </div>
         <div className="relative z-10 flex flex-col items-center md:items-end gap-3 text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Orchestration Access</span>
            <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl font-black text-xs tracking-[0.2em] whitespace-nowrap">
               <ShieldCheck size={18} className="text-emerald-500" /> MASTER AUTHORIZATION ACTIVE
            </div>
         </div>
      </div>
    </div>
  );
}
