"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import { useUsers } from "@/lib/hooks/useUsers";
import { AdminUser } from "@/lib/admin/mock-data";
import { 
  Edit2, 
  Ban, 
  CheckCircle2, 
  UserPlus, 
  X, 
  Mail, 
  User, 
  Lock, 
  Shield, 
  CreditCard, 
  AlertCircle,
  RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersListPage() {
    const router = useRouter();
    const { users, isLoaded, addUser, updateUser, deleteUser } = useUsers();
    
    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [successToast, setSuccessToast] = useState("");
    const [error, setError] = useState("");
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "User" as AdminUser["role"],
        plan: "Free" as AdminUser["plan"],
        status: "Active" as AdminUser["status"]
    });

    const handleResetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "User",
            plan: "Free",
            status: "Active"
        });
        setError("");
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name || !formData.email || !formData.password) {
            setError("All required fields must be satisfied.");
            return;
        }

        try {
            addUser({
                name: formData.name,
                email: formData.email,
                password: formData.password, // In real app, hash on server
                role: formData.role as any,
                plan: formData.plan as any,
                status: formData.status as any,
            });

            setSuccessToast(`User ${formData.name} synthesized successfully.`);
            setShowAddModal(false);
            handleResetForm();
            
            setTimeout(() => setSuccessToast(""), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to initialize user node.");
        }
    };

    const handleToggleStatus = (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
        updateUser(id, { status: nextStatus as any });
    };

    if (!isLoaded) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <RefreshCw className="w-10 h-10 text-brand-primary animate-spin" />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing User Core...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Identity Matrix</h1>
                    <p className="text-slate-500 font-bold mt-2">Manage global user nodes, security roles, and entitlement tiers.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all group"
                >
                    <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                    New Identity
                </button>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {successToast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100"
                    >
                        <CheckCircle2 size={16} /> {successToast}
                    </motion.div>
                )}
            </AnimatePresence>

            <DataTable 
                title="Active Identities"
                columns={[
                    { key: 'name', label: 'User Node', sortable: true, render: (u) => (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xs font-black shadow-lg shadow-slate-200">
                                {u.name[0]}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white leading-none tracking-tight">{u.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{u.role}</p>
                            </div>
                        </div>
                    )},
                    { key: 'email', label: 'Communication URL', render: (u) => (
                        <span className="text-xs font-bold text-slate-500 font-mono italic">{u.email}</span>
                    )},
                    { key: 'plan', label: 'Tier', sortable: true, render: (u) => (
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                            u.plan === 'Premium' ? "bg-indigo-50 text-indigo-600 border-indigo-200" :
                            u.plan === 'Pro' ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                            {u.plan}
                        </span>
                    )},
                    { key: 'status', label: 'Access Status', sortable: true, render: (u) => (
                        <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${u.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? "text-emerald-500" : "text-rose-500"}`}>{u.status}</span>
                        </div>
                    )},
                    { key: 'createdAt', label: 'Registered', sortable: true, render: (u) => (
                        <span className="text-xs font-bold text-slate-400">{u.createdAt}</span>
                    )}
                ]}
                data={users}
                onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
                actions={(u) => (
                    <div className="flex items-center justify-end gap-3">
                        <button 
                            onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${u.id}`); }}
                            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm border border-slate-200"
                            title="Edit Node"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(u.id, u.status); }}
                            className={`p-3 rounded-2xl transition-all shadow-sm border ${u.status === 'Active' ? "bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white" : "bg-emerald-50 border-emerald-100 text-emerald-500 hover:bg-emerald-600 hover:text-white"}`}
                            title={u.status === 'Active' ? "Block Node" : "Unblock Node"}
                        >
                            {u.status === 'Active' ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                    </div>
                )}
            />

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-white border border-slate-100 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            {/* Modal Close */}
                            <button 
                              onClick={() => setShowAddModal(false)}
                              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>

                            <form onSubmit={handleCreateUser} className="p-10 md:p-12 space-y-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Synthesize Node</h2>
                                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest italic">Provisioning new system credentials</p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                        <AlertCircle size={16} /> {error}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {/* Name & Email Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Identity Name</label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input 
                                                    type="text" 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                                                    placeholder="e.g. Satoshi Nakamoto"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Communication URL</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input 
                                                    type="email" 
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-mono"
                                                    placeholder="user@system.mesh"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Security Token (Password)</label>
                                        <div className="relative">
                                            <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input 
                                                type="password" 
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    {/* Role & Plan Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Authority Role</label>
                                            <div className="relative">
                                                <Shield size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <select
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                                                >
                                                    <option value="User">Standard User</option>
                                                    <option value="Admin">Master Admin</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Entitlement Tier</label>
                                            <div className="relative">
                                                <CreditCard size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <select
                                                    value={formData.plan}
                                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                                                >
                                                    <option value="Free">Free Tier</option>
                                                    <option value="Pro">Pro Access</option>
                                                    <option value="Premium">Premium Authority</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Switch */}
                                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Node Status</h4>
                                            <p className="text-[10px] text-slate-400 font-bold italic">Toggle node availability immediately.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: formData.status === 'Active' ? 'Disabled' : 'Active' })}
                                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                                                formData.status === 'Active' ? "bg-emerald-500 shadow-lg shadow-emerald-100" : "bg-slate-300"
                                            }`}
                                        >
                                            <div className={`h-6 w-6 bg-white rounded-full transition-transform mx-1 ${formData.status === 'Active' ? "translate-x-8" : "translate-x-0"}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        type="submit"
                                        className="flex-1 py-5 bg-brand-primary text-white rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/40 hover:translate-y-[-2px] transition-all italic active:scale-95"
                                    >
                                        Authorize & Synth
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:border-slate-300 transition-all italic"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ChevronDown({ className, size }: { className?: string, size: number }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>;
}
