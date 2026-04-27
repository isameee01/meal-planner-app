"use client";

import React, { useState } from "react";
import { useBillingControl, PlanId, PlanData } from "@/lib/hooks/useBillingControl";
import { 
  DollarSign, 
  Settings2, 
  ShieldAlert, 
  Globe, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Unlock, 
  GanttChartSquare,
  ChevronDown,
  LayoutDashboard,
  Save,
  RotateCcw,
  Target,
  Trophy,
  Star
} from "lucide-react";

/**
 * Admin Pricing Control System
 * The core monetization engine for the CustomDailyDiet SaaS.
 * Provides the owner with absolute authority over pricing, limits, and entitlements.
 */
export default function AdminBillingPage() {
  const { 
    config, 
    updatePlan, 
    updateOverrides, 
    setSimulation, 
    isLoaded, 
    resetToDefaults 
  } = useBillingControl();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  const GlobalOverrideItem = ({ 
    label, 
    value, 
    onToggle, 
    description 
  }: { 
    label: string, 
    value: boolean, 
    onToggle: (v: boolean) => void,
    description: string 
  }) => (
    <div className={`p-6 rounded-2xl border transition-all ${
      value ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-slate-200"
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className={`font-black text-sm uppercase tracking-tight ${value ? "text-indigo-900" : "text-slate-800"}`}>
            {label}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs">{description}</p>
        </div>
        <button
          onClick={() => onToggle(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            value ? "bg-indigo-600" : "bg-slate-300"
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      
      {/* Admin Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-indigo-100">
                <DollarSign size={32} />
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">PRICING ENGINE</h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all hover:bg-slate-900">ADMIN ONLY</div>
                  <div className="w-[1px] h-3 bg-slate-200" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Monetization Control</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
             {(["free", "pro", "premium"] as PlanId[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSimulation(p)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    config.currentSimulation === p 
                      ? "bg-white text-indigo-600 shadow-lg" 
                      : "text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {p}
                </button>
             ))}
           </div>
           <button 
             onClick={resetToDefaults}
             className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-gradient-to-b from-white to-slate-50"
           >
             <RotateCcw size={14} /> Factory Reset
           </button>
        </div>
      </div>

      {/* Global Overrides - THE AUTHORITY LAYER */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-indigo-600" size={20} />
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Authority Overrides</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlobalOverrideItem 
            label="Make Entire App Free"
            value={config.globalOverrides.makeAppFree}
            onToggle={(v) => updateOverrides({ makeAppFree: v })}
            description="Force all monthly prices to $0. Perfect for beta testing or global promotions."
          />
          <GlobalOverrideItem 
            label="Disable All Limits"
            value={config.globalOverrides.disableAllLimits}
            onToggle={(v) => updateOverrides({ disableAllLimits: v })}
            description="Grant unlimited quotas to every user regardless of their current plan status."
          />
          <GlobalOverrideItem 
            label="Force All Features ON"
            value={config.globalOverrides.forceAllFeaturesOn}
            onToggle={(v) => updateOverrides({ forceAllFeaturesOn: v })}
            description="Bypass entitlement checks and enable every module for all users instantly."
          />
        </div>
      </section>

      {/* Live Plan Orchestration */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <GanttChartSquare className="text-slate-400" size={20} />
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Plan Matrix Architecture</h2>
        </div>

        <div className="grid grid-cols-1 gap-8">
           {Object.values(config.plans).map((plan) => (
              <div key={plan.id} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group">
                 <div className="flex flex-col lg:flex-row">
                    
                    {/* Left Panel: Core Identity */}
                    <div className="lg:w-1/3 p-10 bg-slate-50/50 border-r border-slate-100 space-y-8">
                       <div className="space-y-6">
                          <div className="flex items-center justify-between">
                             <div className={`p-3 rounded-2xl ${plan.id === "pro" ? "bg-indigo-600 text-white" : "bg-white text-slate-400 border border-slate-200 shadow-sm"}`}>
                                {plan.id === "free" ? <Target size={24} /> : plan.id === "pro" ? <Trophy size={24} /> : <Star size={24} />}
                             </div>
                             <div className="flex items-center gap-3">
                                <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Visible</label>
                                <button
                                  onClick={() => updatePlan(plan.id, { isActive: !plan.isActive })}
                                  className={`h-5 w-9 rounded-full transition-colors ${plan.isActive ? "bg-emerald-500" : "bg-slate-300"}`}
                                >
                                  <div className={`h-3 w-3 bg-white rounded-full transition-transform mx-1 ${plan.isActive ? "translate-x-4" : "translate-x-0"}`} />
                                </button>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block pl-1">Plan Display Name</label>
                             <input 
                               type="text" 
                               value={plan.name}
                               onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                               className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
                             />
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Price ($)</label>
                             <input 
                               type="number" 
                               disabled={config.globalOverrides.makeAppFree}
                               value={config.globalOverrides.makeAppFree ? 0 : plan.price}
                               onChange={(e) => updatePlan(plan.id, { price: parseInt(e.target.value) })}
                               className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-lg font-black text-slate-800 disabled:opacity-50"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Discount (%)</label>
                             <input 
                               type="number" 
                               value={plan.discount}
                               onChange={(e) => updatePlan(plan.id, { discount: Math.min(100, Math.max(0, parseInt(e.target.value))) })}
                               className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-lg font-black text-slate-800"
                             />
                          </div>
                       </div>

                       <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl">
                          <input 
                            type="checkbox" 
                            checked={plan.isRecommended}
                            onChange={(e) => updatePlan(plan.id, { isRecommended: e.target.checked })}
                            className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Recommended Badge</span>
                       </div>
                    </div>

                    {/* Middle Panel: Quotas & Limits */}
                    <div className="lg:w-1/3 p-10 border-r border-slate-100 flex flex-col justify-between space-y-8">
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                         <LayoutDashboard size={16} /> Quotas & Constraints
                       </h3>
                       <div className="grid grid-cols-2 gap-x-8 gap-y-6 flex-1">
                          {[
                            { label: "Meals / Day", key: "mealsPerDay" },
                            { label: "AI Requests", key: "aiRequestsPerDay" },
                            { label: "Saved Recipes", key: "savedRecipesLimit" },
                            { label: "Custom Foods", key: "customFoodsLimit" },
                          ].map((limit) => (
                            <div key={limit.key} className="space-y-2">
                               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{limit.label}</label>
                               <input 
                                 type="number" 
                                 disabled={config.globalOverrides.disableAllLimits}
                                 value={config.globalOverrides.disableAllLimits ? 999999 : (plan.limits as any)[limit.key]}
                                 onChange={(e) => updatePlan(plan.id, { limits: { ...plan.limits, [limit.key]: parseInt(e.target.value) } })}
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono font-bold text-indigo-600 disabled:opacity-50"
                               />
                            </div>
                          ))}
                       </div>
                       <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                          <p className="text-[10px] text-indigo-800 font-bold leading-relaxed">
                             Note: Setting limits too high on lower tiers may increase infrastructure costs (Tokens/Storage).
                          </p>
                       </div>
                    </div>

                    {/* Right Panel: Feature Entitlements */}
                    <div className="lg:w-1/3 p-10 space-y-8 bg-gradient-to-br from-white to-slate-50/30">
                       <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                         <Unlock size={16} /> Module Entitlements
                       </h3>
                       <div className="space-y-4">
                          {[
                            { label: "Meal Generation Engine", key: "mealGeneration" },
                            { label: "Recipe Synthesis", key: "recipes" },
                            { label: "AI Rebalance Engine", key: "rebalance" },
                            { label: "Discover AI Search", key: "discoverAI" },
                          ].map((feat) => (
                            <div 
                              key={feat.key} 
                              onClick={() => {
                                if (config.globalOverrides.forceAllFeaturesOn) return;
                                updatePlan(plan.id, { features: { ...plan.features, [feat.key]: !(plan.features as any)[feat.key] } });
                              }}
                              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                config.globalOverrides.forceAllFeaturesOn || (plan.features as any)[feat.key]
                                  ? "bg-white border-indigo-200 text-indigo-700 shadow-sm"
                                  : "bg-slate-50 border-slate-100 text-slate-400 grayscale"
                              }`}
                            >
                               <span className="text-xs font-black uppercase tracking-widest">{feat.label}</span>
                               {config.globalOverrides.forceAllFeaturesOn || (plan.features as any)[feat.key] ? (
                                 <CheckCircle2 size={18} className="text-emerald-500" />
                               ) : (
                                 <XCircle size={18} className="text-slate-300" />
                               )}
                            </div>
                          ))}
                       </div>
                    </div>

                 </div>
              </div>
           ))}
        </div>
      </section>

      {/* Footer System Integrity Info */}
      <div className="p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none" />
         <div className="relative z-10 space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-black text-white tracking-widest italic flex items-center justify-center md:justify-start gap-4">
              MONETIZATION AUTH <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
            </h2>
            <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed">
              Modifying the pricing matrix here directly affects all global cohorts. Ensure that high-tier features remain protected by paywalls unless global overrides are specifically required for maintenance.
            </p>
         </div>
         <div className="relative z-10 flex flex-col items-center md:items-end gap-3 text-white">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black text-xs tracking-[0.3em] rounded-2xl transition-all shadow-2xl active:scale-95 group"
            >
               <Save size={18} className="group-hover:animate-bounce" /> SYNC OVERRIDES
            </button>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
               <Globe size={12} /> Global Propagation Enabled
            </div>
         </div>
      </div>
    </div>
  );
}
