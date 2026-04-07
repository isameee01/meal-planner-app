"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { useTheme } from "../../../components/ThemeProvider";
import { FoodStateProvider } from "../../../lib/contexts/FoodStateContext";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <FoodStateProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors overflow-hidden">
                <style jsx global>{`
                    @media print {
                        .no-print, 
                        nav, 
                        header, 
                        aside, 
                        button:not(.print-visible) {
                            display: none !important;
                        }
                        main {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                        }
                        .print-content {
                            width: 100% !important;
                            display: block !important;
                        }
                    }
                `}</style>

                <div className="no-print">
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                </div>
                
                <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen ${collapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"}`}>
                    <div className="no-print">
                        <Header 
                            toggleMobileMenu={() => setMobileMenuOpen(true)}
                            viewMode="day"
                            setViewMode={() => {}} 
                            selectedDate={new Date()}
                            onDateChange={() => {}}
                            theme={theme}
                            onThemeChange={setTheme}
                            isProcessing={false}
                        />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto relative scrollbar-hide">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="h-full"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </FoodStateProvider>
    );
}
