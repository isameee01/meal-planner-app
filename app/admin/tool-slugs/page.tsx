"use client";

import React from "react";
import { useToolSlugs } from "@/lib/hooks/useToolSlugs";
import { 
  Code, 
  Settings2, 
  Link as LinkIcon, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  RefreshCw, 
  LayoutTemplate,
  Globe,
  Monitor,
  Zap,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function ToolSlugsPage() {
  const { config, updateToolSlugs, isLoaded } = useToolSlugs();

  if (!isLoaded) return <div className="p-8 text-slate-500 animate-pulse font-black uppercase tracking-[0.3em]">Querying System Slugs...</div>;

  const SlugInput = ({ label, value, onChange, icon: Icon }: any) => (
    <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6 hover:shadow-xl transition-all duration-700 group">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-50 group-hover:bg-slate-900 text-slate-800 group-hover:text-white rounded-2xl transition-all duration-500">
                <Icon size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight italic">{label}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SEO Identifier Token</p>
             </div>
          </div>
       </div>

       <div className="space-y-4">
          <div className="relative">
             <LinkIcon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
             <input
               type="text"
               value={value}
               onChange={(e) => onChange(e.target.value)}
               className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-mono font-bold text-slate-600 focus:bg-white focus:border-slate-900 transition-all outline-none"
               placeholder="identifier-slug"
             />
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
             <Globe size={14} className="text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
               Full Endpoint: /dashboard/{value}
             </span>
             <ArrowRight size={12} className="text-slate-300 ml-auto" />
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-16 pb-24 animate-in fade-in duration-1000">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
                 <Code size={28} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Tool Architecture</h1>
           </div>
           <p className="text-slate-500 mt-2 font-medium">Manage system-level URI identifiers and SEO-optimized tool slugs.</p>
        </div>
        
        <div className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg shadow-slate-100">
           <Activity size={18} className="text-emerald-500" /> Registry v1.0.4 - Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <SlugInput 
          label="Meal Generation" 
          value={config.mealGeneratorSlug}
          onChange={(v: string) => updateToolSlugs({ mealGeneratorSlug: v })}
          icon={Zap}
        />
        <SlugInput 
          label="Recipe Synthesis" 
          value={config.recipeGeneratorSlug}
          onChange={(v: string) => updateToolSlugs({ recipeGeneratorSlug: v })}
          icon={LayoutTemplate}
        />
        <SlugInput 
          label="Food Discovery" 
          value={config.discoverSlug}
          onChange={(v: string) => updateToolSlugs({ discoverSlug: v })}
          icon={Globe}
        />
      </div>

      {/* Warning/Logic Info */}
      <div className="p-12 bg-slate-900 border border-slate-800 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col xl:flex-row items-center gap-16">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 pointer-events-none" />
         
         <div className="xl:w-2/3 space-y-6 relative z-10 text-center xl:text-left">
            <h2 className="text-3xl font-black text-white italic tracking-widest uppercase flex items-center justify-center xl:justify-start gap-4">
               System Slug Consistency <ShieldCheck className="text-emerald-500" />
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed italic max-w-3xl">
              Slugs defined here are used for core app routing and SEO ranking. Altering slugs after production launch may invalidate existing social shares and search engine indexes. 
              <span className="text-emerald-500 font-black ml-1 uppercase">Use with extreme caution.</span>
            </p>
         </div>

         <div className="xl:w-1/3 w-full relative z-10 flex flex-col items-center xl:items-end gap-3">
            <div className="flex items-center gap-4 px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase shadow-2xl active:scale-95 transition-all cursor-pointer border border-white">
               <Terminal size={20} /> Authorize Registry Update
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <RefreshCw size={12} className="animate-spin" /> Cluster Sync propagation active
            </div>
         </div>
      </div>

    </div>
  );
}
