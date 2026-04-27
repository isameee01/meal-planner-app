"use client";

import React from "react";
import { useEmailConfig } from "@/lib/hooks/useEmailConfig";
import { 
  Mail, 
  Send, 
  Server, 
  Lock, 
  User, 
  Settings2, 
  FileEdit, 
  Eye, 
  RefreshCw,
  Layout,
  ClipboardList,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function EmailConfigPage() {
  const { config, updateEmailConfig, isLoaded } = useEmailConfig();

  if (!isLoaded) return <div className="p-8 text-amber-500 animate-pulse font-black uppercase tracking-widest italic">Authenticating SMTP Relays...</div>;

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-xl">
                 <Mail size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Communication Hub</h1>
           </div>
           <p className="text-slate-500 mt-2 font-medium">Configure SMTP clusters and manage transactional user notification templates.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-6 py-3 bg-slate-900 rounded-2xl text-amber-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-slate-700 shadow-2xl shadow-indigo-100">
              <ShieldCheck size={20} /> SMTP VAULT ENCRYPTED
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* SMTP Configuration */}
        <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm space-y-10">
           <div className="flex items-center gap-4 border-l-4 border-amber-500 pl-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 italic">SMTP Settings</h2>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Outbound Relay Host</label>
                 <div className="relative">
                    <Server size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="text" 
                      value={config.smtp.host}
                      onChange={(e) => updateEmailConfig({ smtp: { ...config.smtp, host: e.target.value } })}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-amber-50 transition-all font-mono"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Port</label>
                    <input 
                      type="number" 
                      value={config.smtp.port}
                      onChange={(e) => updateEmailConfig({ smtp: { ...config.smtp, port: parseInt(e.target.value) } })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-amber-50 font-mono"
                    />
                 </div>
                 <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Account User</label>
                    <div className="relative">
                       <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input 
                         type="email" 
                         value={config.smtp.email}
                         onChange={(e) => updateEmailConfig({ smtp: { ...config.smtp, email: e.target.value } })}
                         className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Relay Password</label>
                 <div className="relative">
                    <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                      type="password" 
                      value={config.smtp.password}
                      onChange={(e) => updateEmailConfig({ smtp: { ...config.smtp, password: e.target.value } })}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none"
                    />
                 </div>
              </div>
           </div>

           <button className="w-full py-4 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-100 italic">
              <Send size={16} /> Send Diagnostic Email
           </button>
        </div>

        {/* Template Manager */}
        <div className="xl:col-span-2 space-y-8">
           {[
             { label: "Welcome Notification", key: "welcome", icon: <Layout size={20} />, sub: "Triggered on first-time authentication success." },
             { label: "Recovery Protocol", key: "resetPassword", icon: <RefreshCw size={20} />, sub: "Activated during secure password reset flows." }
           ].map((tpl) => (
             <div key={tpl.key} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm space-y-6 hover:shadow-lg transition-all duration-500 group">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white rounded-2xl transition-all">
                         {tpl.icon}
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 italic tracking-tight">{tpl.label}</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{tpl.sub}</p>
                      </div>
                   </div>
                   <button className="px-6 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all">
                      <Eye size={12} className="inline mr-2" /> Live Preview
                   </button>
                </div>
                
                <div className="relative">
                   <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg text-amber-400 text-[10px] font-black uppercase italic tracking-widest border border-slate-700">
                      <FileEdit size={12} /> HTML Template
                   </div>
                   <textarea
                     value={(config.templates as any)[tpl.key]}
                     onChange={(e) => updateEmailConfig({ templates: { ...config.templates, [tpl.key]: e.target.value } })}
                     className="w-full h-48 px-8 py-10 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-sm font-medium text-slate-700 leading-relaxed outline-none focus:border-amber-400 focus:bg-white transition-all scrollbar-hide"
                   />
                </div>
             </div>
           ))}

           {/* Variable Help */}
           <div className="p-8 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,#f59e0b22,transparent)]" />
              <div className="space-y-3 relative z-10">
                 <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em]">Available Variables</h4>
                 <div className="flex flex-wrap gap-3">
                    {["{{username}}", "{{app_name}}", "{{reset_link}}", "{{login_url}}"].map(v => (
                       <code key={v} className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-mono">{v}</code>
                    ))}
                 </div>
              </div>
              <div className="relative z-10 flex flex-col items-center md:items-end gap-2 text-white">
                 <div className="p-2 bg-amber-500 rounded-lg">
                    <AlertCircle size={18} />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Handlebars Parser: active</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
