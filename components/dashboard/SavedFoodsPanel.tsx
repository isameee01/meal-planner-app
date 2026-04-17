"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, ArrowRight, Star, Sparkles, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SavedFoodsPanel() {
    const [savedFoods, setSavedFoods] = useState<any[]>([]);

    useEffect(() => {
        const loadFoods = () => {
            const customFoods = JSON.parse(localStorage.getItem("customFoods") || "[]");
            const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
            const merged = [...customFoods, ...favorites].filter((item, index, self) => 
                index === self.findIndex((t) => (t.id || t.name) === (item.id || item.name))
            );
            setSavedFoods(merged);
        };
        loadFoods();
        window.addEventListener("storage", loadFoods);
        return () => window.removeEventListener("storage", loadFoods);
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-500">
                        <Heart size={20} className="fill-rose-500/20" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest italic">Strategic Reserve</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Your Curated Fuel List</p>
                    </div>
                </div>
                <Sparkles size={16} className="text-emerald-500 opacity-20" />
            </div>
            
            <div className="p-4">
                {savedFoods.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border border-dashed border-slate-200 dark:border-slate-700"
                    >
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                            <Star size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No strategic high-performance items saved yet</p>
                    </motion.div>
                ) : (
                    <div className="max-h-96 overflow-y-auto scrollbar-hide space-y-3">
                        {savedFoods.map((food, i) => (
                            <motion.div
                                key={food.id || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link 
                                    href={`/dashboard/discover/${food.id || food.name}`}
                                    className="flex items-center gap-4 p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-[24px] cursor-pointer transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40 group bg-slate-50/50 dark:bg-slate-800/30 shadow-sm"
                                >
                                    <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                                        {food.image ? (
                                            <Image src={food.image} alt={food.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-emerald-500/40">
                                                <Utensils size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate uppercase mt-0.5 group-hover:text-emerald-500 transition-colors tracking-tight">
                                            {food.name}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center">
                                            <span className="w-1 h-1 bg-emerald-500 rounded-full mr-2" />
                                            {food.calories || 0} kcal{(food.servingSize || food.serving) && ` • ${food.servingSize || food.serving}`}
                                        </p>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800">
                <button 
                    onClick={() => window.location.href = '/dashboard/discover'}
                    className="w-full py-3 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                    Expand Strategic Reserve
                </button>
            </div>
        </div>
    );
}
