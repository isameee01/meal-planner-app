"use client";

import React, { useState } from "react";
import { useAIConfig, AIProvider } from "@/lib/hooks/useAIConfig";
import { 
  Settings, 
  Key, 
  Cpu, 
  FileText, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Save, 
  ShieldCheck,
  Zap,
  RotateCcw
} from "lucide-react";

/**
 * AI Configuration Panel
 * Production-grade control system for managing AI behavior, providers, and prompts.
 */
export default function AIConfigPage() {
  const { config, updateConfig, isLoaded, resetPrompt } = useAIConfig();
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  const toggleKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProviderChange = (
    module: keyof typeof config.models,
    provider: AIProvider
  ) => {
    updateConfig({
      models: {
        ...config.models,
        [module]: { ...config.models[module], provider },
      },
    });
  };

  const handleModelNameChange = (
    module: keyof typeof config.models,
    model: string
  ) => {
    updateConfig({
      models: {
        ...config.models,
        [module]: { ...config.models[module], model },
      },
    });
  };

  const handleApiKeyChange = (key: keyof typeof config.apiKeys, value: string) => {
    updateConfig({
      apiKeys: {
        ...config.apiKeys,
        [key]: value,
      },
    });
  };

  const handlePromptChange = (key: keyof typeof config.prompts, value: string) => {
    updateConfig({
      prompts: {
        ...config.prompts,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-600" />
            AI Control Panel
          </h1>
          <p className="text-slate-500 mt-1">Configure generation behavior, model orchestration, and API keys.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-medium">
          <ShieldCheck className="w-4 h-4" />
          Production Safe & Encrypted Local Storage
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Model Configuration Section */}
        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Model Orchestration</h2>
            </div>
            <div className="p-6 space-y-6">
              {[
                { key: "mealGenerator", label: "Meal Plan Engine" },
                { key: "recipeGenerator", label: "Recipe Synthesis" },
                { key: "rebalanceEngine", label: "Dynamic Rebalance" },
              ].map((item) => (
                <div key={item.key} className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:border-blue-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">{item.label}</label>
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                      {["Groq", "OpenAI", "Gemini"].map((p) => (
                        <button
                          key={p}
                          onClick={() => handleProviderChange(item.key as any, p as AIProvider)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                            config.models[item.key as keyof typeof config.models].provider === p
                              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                              : "text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest pl-1">Target Model ID</p>
                    <input
                      type="text"
                      value={config.models[item.key as keyof typeof config.models].model}
                      onChange={(e) => handleModelNameChange(item.key as any, e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono"
                      placeholder="e.g. llama-3.3-70b-versatile"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Keys Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Provider API Keys</h2>
            </div>
            <div className="p-6 space-y-6">
              {[
                { key: "groqApiKey", label: "Groq Cloud API Key", icon: "G" },
                { key: "openaiApiKey", label: "OpenAI Platform Key", icon: "O" },
                { key: "geminiApiKey", label: "Google Gemini Cloud Key", icon: "G" },
              ].map((key) => (
                <div key={key.key} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">{key.label}</label>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.apiKeys[key.key as keyof typeof config.apiKeys] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {config.apiKeys[key.key as keyof typeof config.apiKeys] ? "Configured" : "Missing"}
                    </span>
                  </div>
                  <div className="relative group">
                    <input
                      type={showKeys[key.key] ? "text" : "password"}
                      value={config.apiKeys[key.key as keyof typeof config.apiKeys]}
                      onChange={(e) => handleApiKeyChange(key.key as any, e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12 font-mono"
                      placeholder={`Enter ${key.label}...`}
                    />
                    <button
                      onClick={() => toggleKey(key.key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showKeys[key.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hyperparameters Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Hyperparameters</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">Temperature</label>
                    <span className="text-xs font-bold text-blue-600 font-mono">{config.settings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.settings.temperature}
                    onChange={(e) => updateConfig({ settings: { ...config.settings, temperature: parseFloat(e.target.value) } })}
                    className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-1.5 pl-1">Max Tokens</label>
                  <input
                    type="number"
                    value={config.settings.maxTokens}
                    onChange={(e) => updateConfig({ settings: { ...config.settings, maxTokens: parseInt(e.target.value) } })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Force Strict JSON</span>
                  <button
                    onClick={() => updateConfig({ settings: { ...config.settings, strictJSON: !config.settings.strictJSON } })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        config.settings.strictJSON ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.settings.strictJSON ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <p className="text-[10px] text-slate-400 text-center px-4 italic">Recommended for llama3-70b and GPT-4o compatibility.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prompt Management Section */}
        <section className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">System Prompts</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase py-1 px-2 border border-slate-200 rounded">Auto-Saving Enabled</span>
            </div>
            <div className="p-6 space-y-8 flex-1">
              {[
                { key: "mealPrompt", label: "Meal Plan Generator Prompt", icon: <Zap size={14}/> },
                { key: "recipePrompt", label: "Recipe Synthesis Prompt", icon: <FileText size={14}/> },
                { key: "rebalancePrompt", label: "Rebalance Engine Prompt", icon: <RefreshCw size={14}/> },
              ].map((prompt) => (
                <div key={prompt.key} className="space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="p-1 px-2 bg-slate-100 rounded text-slate-500 uppercase text-[10px] font-black tracking-widest">{prompt.label}</span>
                    </div>
                    <button 
                      onClick={() => resetPrompt(prompt.key as any)}
                      className="text-[10px] font-bold text-slate-400 hover:text-amber-600 flex items-center gap-1 transition-colors group-hover:opacity-100 opacity-0"
                    >
                      <RotateCcw size={10} /> RESET TO DEFAULT
                    </button>
                  </div>
                  <textarea
                    value={config.prompts[prompt.key as keyof typeof config.prompts]}
                    onChange={(e) => handlePromptChange(prompt.key as any, e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-slate-900 text-slate-300 rounded-xl text-xs font-mono border-2 border-transparent focus:border-blue-500/30 outline-none transition-all scrollbar-thin scrollbar-thumb-slate-700"
                  />
                </div>
              ))}
            </div>
            
            {/* Fallback Configuration */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
               <div className="flex items-center gap-2 mb-4">
                 <RefreshCw className="w-4 h-4 text-slate-400" />
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Failover Strategy</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 pl-1 uppercase">Primary Cluster</label>
                    <select 
                      value={config.fallbacks.primaryProvider}
                      onChange={(e) => updateConfig({ fallbacks: { ...config.fallbacks, primaryProvider: e.target.value as AIProvider } })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                    >
                      <option>Groq</option>
                      <option>OpenAI</option>
                      <option>Gemini</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 pl-1 uppercase">Backup Cluster</label>
                    <select 
                      value={config.fallbacks.fallbackProvider}
                      onChange={(e) => updateConfig({ fallbacks: { ...config.fallbacks, fallbackProvider: e.target.value as AIProvider } })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                    >
                      <option>Groq</option>
                      <option>OpenAI</option>
                      <option>Gemini</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">System Status: Active</span>
           </div>
           <div className="h-4 w-[1px] bg-slate-200" />
           <span className="text-xs text-slate-400">Settings persist globally across the application.</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          FORCE APPLY CHANGES
        </button>
      </div>
    </div>
  );
}
