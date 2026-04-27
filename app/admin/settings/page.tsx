"use client";

import React from "react";
import { useSettings } from "@/lib/hooks/useSettings";
import { 
  Settings, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Power, 
  ShieldCheck, 
  Rocket, 
  Activity,
  Save,
  Wrench,
  AlertTriangle
} from "lucide-react";

export default function GeneralSettings() {
  const { settings, updateSettings, isLoaded } = useSettings();

  if (!isLoaded) return <div className="p-8 text-blue-500 animate-in fade-in transition-all">Synchronizing brand assets...</div>;

  return (
    <div className="space-y-12 pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl">
                 <Settings size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Global Parameters</h1>
           </div>
           <p className="text-slate-500 mt-2 font-medium">Control primary branding, system status, and visual identity tokens.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Core Identity */}
        <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-10 group">
           <div className="flex items-center gap-4 border-l-4 border-blue-600 pl-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Core Identity</h2>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Application Public Name</label>
                 <div className="relative">
                    <Type size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      value={settings.appName}
                      onChange={(e) => updateSettings({ appName: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-800 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Brand Logo (CDN URL)</label>
                 <div className="flex gap-4">
                    <div className="relative flex-1">
                       <ImageIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input 
                         type="text" 
                         value={settings.logoUrl}
                         onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                         placeholder="https://cloud.storage.com/logo.png"
                         className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-blue-50"
                       />
                    </div>
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200">
                       {settings.logoUrl ? <img src={settings.logoUrl} alt="Preview" className="w-full h-full object-contain p-2" /> : <ImageIcon className="text-slate-300" size={24} />}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* System Overrides */}
        <div className="p-10 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-10">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 pointer-events-none" />
           
           <div className="relative z-10 flex items-center justify-between gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                       <AlertTriangle size={20} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white italic">Maintenance Mode</h2>
                 </div>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                    When active, all non-admin routes will render an "Offline for Performance" screen.
                 </p>
              </div>
              <button
                onClick={() => updateSettings({ maintenanceMode: !settings.maintenanceMode })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                  settings.maintenanceMode ? "bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-slate-800"
                }`}
              >
                <div className={`h-6 w-6 bg-white rounded-full transition-transform mx-1 ${settings.maintenanceMode ? "translate-x-8" : "translate-x-0"}`} />
              </button>
           </div>

           <div className="relative z-10 grid grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest pl-1">Primary Brand Palette</label>
                 <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <input 
                      type="color" 
                      value={settings.primaryColor}
                      onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                      className="w-10 h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none"
                    />
                    <span className="text-sm font-mono font-bold text-white uppercase">{settings.primaryColor}</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-1">Secondary Accents</label>
                 <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-2xl border border-slate-700">
                    <input 
                      type="color" 
                      value={settings.secondaryColor}
                      onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                      className="w-10 h-10 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none"
                    />
                    <span className="text-sm font-mono font-bold text-white uppercase">{settings.secondaryColor}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Global Status Mesh */}
      <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 group">
         <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-4 italic tracking-widest uppercase">
               Deployment Health <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-slate-500 text-sm font-medium max-w-2xl leading-relaxed">
              System identity parameters are globally cached. Brand color updates will propagate across all interactive components instantly via Tailwind CSS dynamic injection.
            </p>
         </div>
         <div className="flex flex-col items-center md:items-end gap-3 text-slate-900">
            <div className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs tracking-widest whitespace-nowrap active:scale-95 transition-all cursor-pointer">
               <ShieldCheck size={20} className="text-emerald-500" /> MASTER SYNC ENABLED
            </div>
         </div>
      </div>
    </div>
  );
}
