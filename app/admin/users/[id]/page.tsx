"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { mockApi } from "@/lib/admin/mock-api";
import { AdminUser } from "@/lib/admin/mock-data";
import { ConfigCard, AdminToggle } from "@/components/admin/FormControls";
import { 
    ChevronLeft, 
    Save, 
    User as UserIcon, 
    Mail, 
    Calendar, 
    Activity
} from "lucide-react";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        mockApi.getUserById(id).then(u => {
            if (u) setUser(u);
            setLoading(false);
        });
    }, [id]);

    const handleToggleFeature = (feature: string) => {
        if (!user) return;
        const current = user.featuresEnabled;
        const next = current.includes(feature) 
            ? current.filter(f => f !== feature)
            : [...current, feature];
        setUser({ ...user, featuresEnabled: next });
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        await mockApi.updateUser(id, user);
        setSaving(false);
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => router.back()}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{user.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                {user.status}
                            </span>
                        </div>
                        <p className="text-slate-500 font-bold mt-1">User ID: <span className="font-mono">{user.id}</span></p>
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="lg:col-span-1 space-y-8">
                    <ConfigCard title="User Profile" description="Basic account information">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white"><UserIcon size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Full Name</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{user.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="w-12 h-12 bg-brand-secondary rounded-xl flex items-center justify-center text-white"><Mail size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Email Address</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Member Since</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{user.createdAt}</p>
                                </div>
                            </div>
                        </div>
                    </ConfigCard>

                    <ConfigCard title="Account Level" description="Manage role and subscription">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">User Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Admin', 'Manager', 'User'].map(role => (
                                        <button 
                                            key={role}
                                            onClick={() => setUser({ ...user, role: role as any })}
                                            className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                                                user.role === role 
                                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg" 
                                                    : "bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-brand-primary"
                                            }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ConfigCard>
                </div>

                {/* Permissions & Features */}
                <div className="lg:col-span-2 space-y-8">
                    <ConfigCard title="Feature Permissions" description="Toggle specific AI modules for this user">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <AdminToggle 
                                label="Recipe AI Generation"
                                description="Allow user to generate detailed recipes using AI."
                                enabled={user.featuresEnabled.includes('recipe-gen')}
                                onChange={() => handleToggleFeature('recipe-gen')}
                            />
                            <AdminToggle 
                                label="AI Meal Rebalancing"
                                description="Enable the intelligent auto-planning engine."
                                enabled={user.featuresEnabled.includes('ai-rebalance')}
                                onChange={() => handleToggleFeature('ai-rebalance')}
                            />
                        </div>
                    </ConfigCard>

                    <ConfigCard title="System Activity" description="Monitor user interaction logs">
                        <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700">
                                <Activity size={32} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">Activity Logs Ready</h4>
                                <p className="text-xs font-bold text-slate-400 mt-1 max-w-[280px]">Real-time audit logging for this user will appear here once the system is live.</p>
                            </div>
                        </div>
                    </ConfigCard>
                </div>
            </div>
        </div>
    );
}
