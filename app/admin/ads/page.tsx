"use client";

import React from "react";
import { useAdsConfig } from "@/lib/hooks/useAdsConfig";
import { 
  Megaphone, 
  Settings2, 
  Layout, 
  Monitor, 
  Smartphone, 
  Code2, 
  Eye, 
  Save, 
  AlertCircle,
  Clock,
  ExternalLink,
  Activity,
  ShieldCheck
} from "lucide-react";

export default function AdsManagementPage() {
  const { config, updateAdsConfig, isLoaded } = useAdsConfig();

  if (!isLoaded) return <div className="p-8 text-slate-500 animate-pulse">Loading ad frameworks...</div>;

  return (
    <div className="space-y-12 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl">
                 <Megaphone size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Ads Revenue Console</h1>
           </div>
           <p className="text-slate-500 mt-2 font-medium">Manage global ad placements, scripts, and session-based popup triggers.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            config.enableAds ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
          }`}>
             {config.enableAds ? "Network Online" : "Networking Suspended"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Ad Matrix Settings */}
        <div className="xl:col-span-2 space-y-8">
           
           {/* Global Toggle */}
           <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between gap-6">
              <div className="space-y-1">
                 <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Master Ads Display</h3>
                 <p className="text-xs text-slate-500 font-medium italic">Globally enable or disable all ad units across the entire user journey.</p>
              </div>
              <button
                onClick={() => updateAdsConfig({ enableAds: !config.enableAds })}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all ${
                  config.enableAds ? "bg-rose-600 shadow-lg shadow-rose-100" : "bg-slate-200"
                }`}
              >
                <div className={`h-5 w-5 bg-white rounded-full transition-transform mx-1 ${config.enableAds ? "translate-x-7" : "translate-x-0"}`} />
              </button>
           </div>

           {/* Placement Sections */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: "Header Placement", key: "headerAdCode", description: "Shows at the very top of all dashboard pages." },
                { label: "Sidebar Placement", key: "sidebarAdCode", description: "Displays below the main navigation links." },
                { label: "Footer Placement", key: "footerAdCode", description: "Sticky container at the bottom of the content area." }
              ].map((slot) => (
                <div key={slot.key} className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                   <div className="flex items-center gap-3 text-slate-900">
                      <Layout size={18} />
                      <h3 className="font-black text-xs uppercase tracking-[0.2em]">{slot.label}</h3>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold italic">{slot.description}</p>
                   <textarea
                     value={(config as any)[slot.key]}
                     onChange={(e) => updateAdsConfig({ [slot.key]: e.target.value })}
                     placeholder="<script>...</script>"
                     className="w-full h-32 px-5 py-4 bg-slate-900 text-rose-400 font-mono text-xs rounded-2xl border-2 border-slate-800 focus:border-rose-500/50 outline-none transition-all scrollbar-hide"
                   />
                </div>
              ))}
              
              {/* Info Card */}
              <div className="p-8 bg-slate-900 rounded-3xl space-y-6 flex flex-col justify-center">
                 <div className="p-3 bg-rose-600 rounded-2xl text-white w-fit">
                    <AlertCircle size={20} />
                 </div>
                 <h3 className="text-xl font-black text-white italic leading-tight">External Script Integration</h3>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">
                   Ad networks like Google AdSense or Mediavine scripts should be pasted directly into these containers. Ensure tags are properly closed to avoid layout breaks.
                 </p>
                 <div className="flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                    <Activity size={14} /> Propagation Delay: ~200ms
                 </div>
              </div>
           </div>
        </div>

        {/* Popup System Control */}
        <div className="space-y-8">
           <div className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 rounded-2xl text-white">
                       <Monitor size={20} />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 italic">Interstital Popup</h3>
                 </div>
                 <button
                   onClick={() => updateAdsConfig({ enablePopupAd: !config.enablePopupAd })}
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                     config.enablePopupAd ? "bg-amber-500 shadow-lg" : "bg-slate-200"
                   }`}
                 >
                   <div className={`h-4 w-4 bg-white rounded-full transition-transform mx-1 ${config.enablePopupAd ? "translate-x-5" : "translate-x-0"}`} />
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Trigger Logic: Session Entry</label>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                       <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                         Popup will trigger ONLY once per user session (sessionStorage) at a defined delay after navigation entry.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Delay (ms)</label>
                    <div className="relative">
                       <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input
                         type="number"
                         step="500"
                         value={config.popupDelay}
                         onChange={(e) => updateAdsConfig({ popupDelay: parseInt(e.target.value) })}
                         className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-amber-50 outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Popup Content / Script</label>
                    <textarea
                      value={config.popupAdCode}
                      onChange={(e) => updateAdsConfig({ popupAdCode: e.target.value })}
                      placeholder="<!-- Modal Content -->"
                      className="w-full h-48 px-5 py-4 bg-slate-50 border-2 border-slate-200 text-slate-800 font-mono text-xs rounded-[2rem] focus:border-amber-400 outline-none transition-all scrollbar-hide"
                    />
                 </div>
              </div>
              
              <div className="pt-2">
                 <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-700">
                       <Eye size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Compliance Check</span>
                    </div>
                    <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed italic">
                       Avoid multiple popups to prevent SEO penalties and poor UX retention. The session-lock system is active.
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* Global Persistence Status */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_top,#f43f5e22,transparent)]" />
         <div className="relative z-10 space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-black text-white flex items-center justify-center md:justify-start gap-4 uppercase italic tracking-widest">
               Revenue Cluster Active <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            </h2>
            <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed italic">
              Ad changes propagate through the Global Ad Sync engine and use high-performance session clustering to ensure stable CTR without spamming users.
            </p>
         </div>
         <div className="relative z-10 flex flex-col items-center md:items-end gap-3 text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Security Access</span>
            <div className="flex items-center gap-3 px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl font-black text-xs tracking-widest whitespace-nowrap">
               <ShieldCheck size={18} className="text-rose-500" /> MASTER AD OVERRIDE ENABLED
            </div>
         </div>
      </div>

    </div>
  );
}
