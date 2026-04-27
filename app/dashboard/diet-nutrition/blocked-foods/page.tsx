"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import Header from "../../../../components/dashboard/Header";
import ClientOnly from "../../../../components/common/ClientOnly";
import { useGlobalFoodState } from "../../../../lib/contexts/FoodStateContext";
import { FULL_DISCOVER_DATABASE } from "../../../../lib/discover-db";
import { Target, Ban, Unlock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BlockedFoodsModal from "../../../../components/dashboard/BlockedFoodsModal";

export default function BlockedFoodsPage() {
    const { theme, setTheme } = useTheme();
    const { blockedFoods, unblockFood, loading } = useGlobalFoodState();
    const [open, setOpen] = useState(false);

    const normalize = (s: string) => s.toLowerCase().trim();

    const blockedItems = useMemo(() => {
        const normalizedBlocked = blockedFoods.map(normalize);
        return FULL_DISCOVER_DATABASE.filter(f => 
            normalizedBlocked.includes(normalize(f.name)) || 
            blockedFoods.includes(f.id)
        );
    }, [blockedFoods]);

    return (
        <div className="flex flex-col min-w-0 h-full bg-slate-50 dark:bg-slate-900/50 relative overflow-x-hidden">
            <Header theme={theme} onThemeChange={setTheme} />
            
            <ClientOnly 
                fallback={
                    <div className="max-w-4xl mx-auto p-4 sm:p-8 flex justify-center mt-20">
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-800 w-32 h-32 rounded-3xl" />
                    </div>
                }
            >
                <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 w-full pb-24">
                    
                    {/* Updated Header Structure with CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                                <Target size={14} className="text-emerald-500" />
                                <span>Diet & Nutrition</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Blocked Foods
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Foods you block will never appear in your meal plans or suggestions.
                            </p>
                        </div>

                        <button
                            onClick={() => setOpen(true)}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-red-200/50 dark:shadow-red-900/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                        >
                            <Ban size={18} />
                            <span>Block Food</span>
                        </button>
                    </div>

                    {loading ? (
                        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <Ban size={18} className="mr-2 text-rose-500" />
                                Your Blocked Foods ({blockedItems.length})
                            </h3>
                            
                            {blockedItems.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                        <Ban size={24} />
                                    </div>
                                    <p className="text-slate-500 font-bold mb-2">No foods currently blocked.</p>
                                    <p className="text-sm text-slate-400 max-w-sm mx-auto">Click 'Block Food' to start blocking items.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/50 border-t border-slate-100 dark:border-slate-800/50">
                                    <AnimatePresence>
                                        {blockedItems.map(food => (
                                            <motion.div 
                                                key={food.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center justify-between py-4"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <img 
                                                        src={food.image} 
                                                        alt={food.name} 
                                                        className="w-12 h-12 rounded-lg object-cover" 
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white capitalize">{food.name}</h4>
                                                        <p className="text-xs text-slate-500 capitalize">{food.category}</p>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => unblockFood(food.name)}
                                                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                >
                                                    <Unlock size={14} />
                                                    <span>Unblock</span>
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <BlockedFoodsModal 
                    isOpen={open} 
                    onClose={() => setOpen(false)} 
                />
            </ClientOnly>
        </div>
    );
}
