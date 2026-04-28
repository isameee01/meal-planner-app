"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Users, 
    Wrench, 
    Settings, 
    Cpu, 
    ShieldCheck, 
    Globe, 
    Mail, 
    CreditCard, 
    Megaphone, 
    ChevronLeft, 
    ChevronRight,
    LogOut,
    ExternalLink,
    Code,
    UtensilsCrossed
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

const MENU_ITEMS = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "AI Config", icon: Cpu, href: "/admin/ai-config" },
    { name: "Tools & Features", icon: Wrench, href: "/admin/tools-features" },
    { name: "SaaS & Billing", icon: CreditCard, href: "/admin/billing" },
    { name: "API Management", icon: ShieldCheck, href: "/admin/api-management" },
    { name: "Ads Management", icon: Megaphone, href: "/admin/ads" },
    { name: "General Settings", icon: Settings, href: "/admin/settings" },
    { name: "Email Config", icon: Mail, href: "/admin/email" },
    { name: "Language & RTL", icon: Globe, href: "/admin/language" },
    { name: "Tool Slugs", icon: Code, href: "/admin/tool-slugs" },
];

export default function AdminSidebar({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (val: boolean) => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    
    const handleLogout = async () => {
        try {
            await logout();
            router.push("/auth/login");
        } catch (error) {
            console.error("Admin logout failed", error);
            router.push("/auth/login");
        }
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            className="h-screen bg-slate-900 text-slate-300 flex flex-col sticky top-0 z-50 border-r border-slate-800 shadow-2xl overflow-hidden"
        >
            {/* Logo Area */}
            <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                                <UtensilsCrossed size={20} />
                            </div>
                            <span className="font-black text-xl text-white tracking-tight leading-none">
                                CustomDailyDiet
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Scroll Area */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative ${
                                isActive 
                                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                    : "hover:bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                        >
                            <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-brand-primary transition-colors"} />
                            {!collapsed && (
                                <span className="font-bold text-sm tracking-wide">{item.name}</span>
                            )}
                            {isActive && !collapsed && (
                                <motion.div 
                                    layoutId="sidebar-active"
                                    className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                                />
                            )}
                            {collapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-3 group-hover:translate-x-0 z-[60] shadow-xl border border-slate-700">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Area */}
            <div className="p-4 border-t border-slate-800/50 space-y-2">
                <Link 
                    href="/" 
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all group"
                >
                    <ExternalLink size={20} className="group-hover:text-emerald-400" />
                    {!collapsed && <span className="font-bold text-sm tracking-wide">View Website</span>}
                </Link>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all group"
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="font-bold text-sm tracking-wide">Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
}
