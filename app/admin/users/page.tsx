"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/DataTable";
import { mockApi } from "@/lib/admin/mock-api";
import { AdminUser } from "@/lib/admin/mock-data";
import { Edit2, Ban, CheckCircle2, UserPlus } from "lucide-react";

export default function UsersListPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await mockApi.getUsers();
        setUsers(data);
        setLoading(false);
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
        await mockApi.updateUser(id, { status: nextStatus as any });
        loadUsers();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">User Management</h1>
                    <p className="text-slate-500 font-bold mt-2">Manage your platform users, roles, and feature permissions.</p>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all">
                    <UserPlus size={20} />
                    Add New User
                </button>
            </div>

            <DataTable 
                title="Platform Users"
                columns={[
                    { key: 'name', label: 'User', sortable: true, render: (u) => (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs font-black">{u.name[0]}</div>
                            <div>
                                <p className="font-black text-slate-900 dark:text-white leading-none">{u.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">{u.role}</p>
                            </div>
                        </div>
                    )},
                    { key: 'email', label: 'Email Address' },
                    { key: 'plan', label: 'Subscription', sortable: true, render: (u) => (
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.plan === 'Paid' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/10"}`}>
                            {u.plan}
                        </span>
                    )},
                    { key: 'status', label: 'Status', sortable: true, render: (u) => (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                            <span className={`text-xs font-black uppercase tracking-tight ${u.status === 'Active' ? "text-emerald-500" : "text-rose-500"}`}>{u.status}</span>
                        </div>
                    )},
                    { key: 'createdAt', label: 'Registered', sortable: true }
                ]}
                data={users}
                onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
                actions={(u) => (
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => router.push(`/admin/users/${u.id}`)}
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-brand-primary hover:text-white rounded-xl transition-all"
                            title="Edit User"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className={`p-2.5 rounded-xl transition-all ${u.status === 'Active' ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"}`}
                            title={u.status === 'Active' ? "Block User" : "Unblock User"}
                        >
                            {u.status === 'Active' ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                    </div>
                )}
            />
        </div>
    );
}
