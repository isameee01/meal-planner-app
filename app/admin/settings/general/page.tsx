"use client";

import React, { useEffect, useState } from "react";
import { mockApi } from "@/lib/admin/mock-api";
import { AdminSettings } from "@/lib/admin/mock-data";
import { ConfigCard, AdminToggle } from "@/components/admin/FormControls";
import { 
    Save, 
    Image as ImageIcon, 
    Palette, 
    Code,
    Sparkles,
    Sun,
    Moon
} from "lucide-react";

export default function GeneralSettingsPage() {
    const [settings, setSettings] = useState<AdminSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        mockApi.getSettings().then(val => {
            setSettings(val);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        await mockApi.updateSettings(settings);
        setSaving(false);
    };

    if (loading || !settings) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">General Settings</h1>
                    <p className="text-slate-500 font-bold mt-2">Manage your platform identity, branding, and global layout options.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <ConfigCard title="Identity & Branding" description="Configure site name and logo options">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Site Name</label>
                                <input 
                                    type="text" 
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
                                />
                            </div>
                        </div>
                    </ConfigCard>
                </div>
            </div>
        </div>
    );
}
