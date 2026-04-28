"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";

export default function StartPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className="flex items-center justify-center min-h-[400px]">
             <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
    );
        <div className="flex flex-col items-center text-center space-y-8">
            <motion.div 
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-[32px] flex items-center justify-center text-5xl"
            >
                🥗
            </motion.div>

            <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">CustomDailyDiet</span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    We'll personalize your meals based on your lifestyle, metrics, and goals. Ready to transform your diet?
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full pt-4">
                <button 
                    onClick={() => router.push("/onboarding/meals")}
                    className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-center group"
                >
                    Let's Get Started
                    <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                    onClick={() => router.push("/dashboard")}
                    className="w-full h-16 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-800"
                >
                    View Samples
                </button>
            </div>

            <div className="flex items-center space-x-2 pt-4">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-none">Powered by Intelligence</span>
            </div>
        </div>
    );
}
