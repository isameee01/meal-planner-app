"use client";

import React from "react";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { 
  Globe, 
  Languages, 
  ArrowRightLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Layout,
  AlignRight,
  AlignLeft,
  RotateCcw,
  Zap,
  Star
} from "lucide-react";

export default function LanguageRTLPage() {
  const { config, updateLanguageConfig, isLoaded } = useLanguage();

  if (!isLoaded) return <div className="p-8 text-indigo-600 animate-pulse font-black uppercase tracking-[0.2em] italic">Synthesizing Language Matrix...</div>;

  const languages = [
    { code: "en", name: "English (Universal)", flag: "🇺🇸" },
    { code: "es", name: "Español (Global)", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية (RTL Preferred)", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  ];

  return (
    <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl">
                 <Languages size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Globalization Core</h1>
           </div>
           <p className="text-slate-500 mt-2 font-medium">Define default application locale and activate Right-to-Left (RTL) layout protocols.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Language Selection */}
        <div className="p-12 bg-white border border-slate-100 rounded-[3rem] shadow-sm space-y-10 group">
           <div className="flex items-center justify-between border-b border-slate-100 pb-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Globe size={24} />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight text-slate-900">System Locale</h2>
              </div>
              <div className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 shadow-lg italic">
                 Active Root: {config.defaultLanguage.toUpperCase()}
              </div>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateLanguageConfig({ defaultLanguage: lang.code })}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all group ${
                    config.defaultLanguage === lang.code 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105" 
                      : "bg-white border-slate-100 hover:border-indigo-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="text-left">
                       <p className={`font-black text-sm uppercase tracking-tight ${config.defaultLanguage === lang.code ? "text-white" : "text-slate-900"}`}>{lang.name}</p>
                       <p className={`text-[10px] font-bold mt-0.5 ${config.defaultLanguage === lang.code ? "text-indigo-200" : "text-slate-400"}`}>RFC-5646 Identifier: {lang.code}</p>
                    </div>
                  </div>
                  {config.defaultLanguage === lang.code && <CheckCircle2 size={24} />}
                </button>
              ))}
           </div>
        </div>

        {/* Layout Orientation */}
        <div className="space-y-12">
           <div className="p-12 bg-slate-900 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col justify-between min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-500 rounded-2xl text-white">
                          <ArrowRightLeft size={24} />
                       </div>
                       <h2 className="text-3xl font-black tracking-tight text-white italic">RTL Protocol</h2>
                    </div>
                    <button
                      onClick={() => updateLanguageConfig({ isRTL: !config.isRTL })}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                        config.isRTL ? "bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.5)] border-2 border-indigo-400" : "bg-slate-800 border-2 border-slate-700"
                      }`}
                    >
                      <div className={`h-5 w-5 bg-white rounded-full transition-transform mx-1.5 ${config.isRTL ? "translate-x-8" : "translate-x-0"}`} />
                    </button>
                 </div>
                 <p className="text-indigo-200/60 text-sm font-medium leading-relaxed italic max-w-sm">
                   When RTL is enabled, the entire application layout, typography, and interactive components will invert their flow horizontally.
                 </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-8">
                 <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${!config.isRTL ? "bg-white text-slate-900 border-white shadow-xl scale-110" : "bg-slate-800/50 border-slate-700 text-slate-500 opacity-50"}`}>
                    <AlignLeft size={32} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Standard LTR</span>
                    {!config.isRTL && <Star size={14} className="text-amber-500 fill-amber-500" />}
                 </div>
                 <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 ${config.isRTL ? "bg-white text-slate-900 border-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.4)] scale-110" : "bg-slate-800/50 border-slate-700 text-slate-500 opacity-50"}`}>
                    <AlignRight size={32} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Advanced RTL</span>
                    {config.isRTL && <Star size={14} className="text-indigo-600 fill-indigo-600" />}
                 </div>
              </div>
           </div>

           {/* Propagation Info */}
           <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex items-center gap-8 group">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                 <Layout size={32} />
              </div>
              <div className="space-y-1">
                 <h3 className="font-black text-slate-900 uppercase tracking-tight italic">Global Layout Engine</h3>
                 <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Language and directionality changes are injected into the root HTML attributes, affecting all styled components and dynamic rendering layers instantly.
                 </p>
              </div>
           </div>
        </div>

      </div>

      <div className="p-10 bg-slate-900 rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,#6366f122,transparent)]" />
         <div className="relative z-10 space-y-3 text-center md:text-left">
            <h2 className="text-2xl font-black text-white italic tracking-widest uppercase flex items-center justify-center md:justify-start gap-4">
               Localization Active <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
            </h2>
            <p className="text-slate-400 text-sm font-medium italic opacity-70">
               System locale: v1.0.2-internationalization-ready. Changes affect the global translation context provider.
            </p>
         </div>
         <div className="relative z-10 flex flex-col items-center md:items-end gap-3 text-white">
            <div className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest border border-indigo-500 shadow-xl active:scale-95 transition-all cursor-pointer">
               <ShieldCheck size={20} /> AUTHORIZE LOCALIZATION SYNC
            </div>
         </div>
      </div>

    </div>
  );
}
