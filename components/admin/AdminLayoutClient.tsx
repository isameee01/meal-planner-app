"use client";

import React, { useState } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AdminLayoutClient
 * - Handles client-side state for the sidebar (collapsed/expanded)
 * - Manages Framer Motion animations for page transitions
 * - Consolidates Sidebar and Header logic for the administration panel
 */
export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            {/* Navigational Sidebar */}
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main Application Container */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                
                <main className="flex-1 p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="admin-content-wrapper" // Unique key to ensure transitions trigger
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Branded Admin Footer */}
                <footer className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-950">
                    <div className="text-slate-400 italic">© 2026 CustomDailyDiet Admin Control System</div>
                    <div className="flex items-center gap-6">
                        <a href="https://customdailydict.com/support" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">Support Center</a>
                        <a href="https://customdailydict.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors">Dev Docs</a>
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-slate-500 dark:text-slate-500 lowercase">v2.1.0-stable</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
