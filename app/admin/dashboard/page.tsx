"use client";

import React, { useEffect, useState } from "react";
import { mockApi } from "@/lib/admin/mock-api";
import { AdminStats } from "@/lib/admin/mock-data";
import StatCard from "@/components/admin/StatCard";
import { 
    Users, 
    Zap, 
    Activity, 
    TrendingUp, 
    ShieldCheck, 
    Clock 
} from "lucide-react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mockApi.getStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    if (loading || !stats) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;

    const chartData = [
        { name: 'Mon', users: 400, revenue: 2400 },
        { name: 'Tue', users: 300, revenue: 1398 },
        { name: 'Wed', users: 200, revenue: 9800 },
        { name: 'Thu', users: 278, revenue: 3908 },
        { name: 'Fri', users: 189, revenue: 4800 },
        { name: 'Sat', users: 239, revenue: 3800 },
        { name: 'Sun', users: 349, revenue: 4300 },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Overview</h1>
                <p className="text-slate-500 font-bold mt-2">Welcome back to the CustomDailyDiet Master Control.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={stats.totalUsers.toLocaleString()} 
                    trend={{ value: "+12%", positive: true }} 
                    icon={Users} 
                    color="brand-primary"
                />
                <StatCard 
                    title="Active Subscriptions" 
                    value={stats.activeSubscriptions.toLocaleString()} 
                    trend={{ value: "+5.3%", positive: true }} 
                    icon={ShieldCheck} 
                    color="brand-secondary"
                />
                <StatCard 
                    title="AI Generations" 
                    value={stats.totalAiGenerations.toLocaleString()} 
                    trend={{ value: "+254", positive: true }} 
                    icon={Zap} 
                    color="emerald"
                />
                <StatCard 
                    title="System Uptime" 
                    value="99.99%" 
                    trend={{ value: "Stable", positive: true }} 
                    icon={Activity} 
                    color="emerald"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Platform Growth</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">New users per week</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4AB034" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4AB034" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="users" stroke="#4AB034" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Revenue Metrics</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Global platform performance</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#F05A28" radius={[8, 8, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
