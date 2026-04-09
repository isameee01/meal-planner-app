"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Link as LinkIcon, Loader2, Sparkles, Globe, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../../components/dashboard/Sidebar";
import Header from "../../../../components/dashboard/Header";
import { useTheme } from "../../../../components/ThemeProvider";

export default function ImportRecipePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const [url, setUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => setMounted(true), []);

    const handleImport = () => {
        if (!url.trim()) return;

        setIsImporting(true);
        setStatus("Connecting to server...");
        
        setTimeout(() => setStatus("Extracting recipe data..."), 1000);
        setTimeout(() => setStatus("Formatting ingredients & steps..."), 2000);
        setTimeout(() => setStatus("Finalizing..."), 2800);

        setTimeout(() => {
            const mockData = {
                name: "Imported Garden Harvest Bowl",
                description: "A fresh and vibrant bowl imported from the web. Guaranteed to be delicious!",
                ingredients: [
                    "2 cups leafy greens",
                    "1/2 avocado, sliced",
                    "1/4 cup quinoa, cooked",
                    "1/4 cup cherry tomatoes",
                    "2 tbsp balsamic vinaigrette"
                ],
                steps: [
                    "Rinse all vegetables thoroughly under cold water.",
                    "Arrange the leafy greens as a base in a large bowl.",
                    "Layer the quinoa and tomatoes over the greens.",
                    "Top with avocado slices and drizzle with vinaigrette."
                ]
            };

            const dataString = encodeURIComponent(JSON.stringify(mockData));
            router.push(`/dashboard/custom-recipes/create-recipe?data=${dataString}`);
        }, 3500);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors overflow-hidden">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen ${collapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"}`}>
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

                <div className="flex-1 p-4 lg:p-10 flex items-center justify-center overflow-y-auto relative scrollbar-hide">
                    <div className="w-full max-w-2xl space-y-8">
                        {/* Back Button */}
                        <div className="flex justify-start">
                            <button 
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold text-sm"
                            >
                                <ArrowLeft size={18} />
                                <span>Back to Recipes</span>
                            </button>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[40px] p-10 lg:p-16 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-emerald-500/5 relative overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px]"></div>
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]"></div>

                            <div className="relative z-10 space-y-10 text-center">
                                {/* Icon Header */}
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto shadow-xl shadow-emerald-500/10">
                                        <Globe size={36} className="stroke-[1.5]" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                                        Import Any Recipe <br />
                                        <span className="text-emerald-500">From the Web</span>
                                    </h1>
                                    <p className="text-slate-400 dark:text-slate-500 font-medium max-w-xs mx-auto text-sm">
                                        Paste any recipe URL below and our AI will attempt to extract the magic.
                                    </p>
                                </div>

                                {/* Input Area */}
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                            <LinkIcon size={20} />
                                        </div>
                                        <input 
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            disabled={isImporting}
                                            placeholder="https://awesome-recipes.com/best-salad"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-emerald-500 transition-all pl-14 pr-6 py-5 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-700 dark:text-slate-200 shadow-inner"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleImport}
                                        disabled={isImporting || !url}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-3 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isImporting ? (
                                                <motion.div 
                                                    key="loading"
                                                    initial={{ rotate: 0 }}
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                >
                                                    <Loader2 size={24} />
                                                </motion.div>
                                            ) : (
                                                <motion.div key="ready" className="flex items-center space-x-3">
                                                    <Sparkles size={20} />
                                                    <span>Start Intelligent Import</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>

                                {/* Parsing Status */}
                                <AnimatePresence>
                                    {isImporting && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">
                                                    {status}
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 3.5 }}
                                                    className="h-full bg-emerald-500"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Features/Trust Badges */}
                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    <Badge icon={ShieldCheck} label="Secure" />
                                    <Badge icon={Zap} label="Fast" />
                                    <Badge icon={Globe} label="Universal" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Badge({ icon: Icon, label }: any) {
    return (
        <div className="flex flex-col items-center space-y-1">
            <div className="text-slate-300 dark:text-slate-600">
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}
