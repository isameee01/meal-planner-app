"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/";
        } catch (e) {
            console.error("Logout error", e);
        }
    };

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${
            isScrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-white/50 backdrop-blur-sm py-4"
        } border-b border-slate-200`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 transition-all tracking-tight">
                            CustomDailyDiet
                        </Link>
                    </div>

                    <div className="hidden md:flex space-x-8 items-center">
                        <a href="#diets" className="text-slate-600 hover:text-emerald-500 transition-colors font-bold text-sm tracking-wide">
                            Supported Diets
                        </a>
                        <a href="#calculators" className="text-slate-600 hover:text-emerald-500 transition-colors font-bold text-sm tracking-wide">
                            Pricing
                        </a>
                    </div>

                    <div className="flex items-center space-x-6">
                        <AnimatePresence mode="wait">
                            {(!user && !loading && mounted) ? (
                                <motion.div 
                                    key="logged-out"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center space-x-4"
                                >
                                    <Link href="/auth/login" className="text-slate-600 hover:text-emerald-500 transition-colors font-bold text-sm">
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:translate-y-[-1px] active:translate-y-0"
                                    >
                                        Sign Up
                                    </Link>
                                </motion.div>
                            ) : (user && mounted) ? (
                                <motion.div 
                                    key="logged-in"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center space-x-4"
                                >
                                    <div className="hidden sm:flex flex-col items-end mr-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome back</span>
                                        <span className="text-sm font-black text-slate-800 leading-none truncate max-w-[150px]">{userName}</span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                                        <Link 
                                            href="/dashboard"
                                            className="p-2 bg-white dark:bg-slate-700 text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-600 transition-colors"
                                            title="Go to Dashboard"
                                        >
                                            <Layout size={18} />
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
}
