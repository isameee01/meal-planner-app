"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
    ChevronLeft, 
    Leaf, 
    Droplets, 
    Zap, 
    Calendar,
    ArrowRight,
    Search,
    ShoppingCart,
    Info,
    Activity
} from "lucide-react";
import { useMealState } from "../../../../lib/contexts/MealStateContext";

export default function IngredientDetailPage() {
    const { name } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromId = searchParams.get("from");
    const { mealsMap } = useMealState();

    const decodedName = decodeURIComponent(name as string);

    // Scan mealsMap for upcoming usage
    const usage = useMemo(() => {
        const occurrences: { date: string, slot: string, mealName: string }[] = [];
        Object.entries(mealsMap).forEach(([date, meals]) => {
            meals.forEach(meal => {
                if (meal.items.some(item => item.food.name.toLowerCase().includes(decodedName.toLowerCase()) || 
                    (item.food.ingredients && item.food.ingredients.some(ing => ing.name.toLowerCase().includes(decodedName.toLowerCase()))))) {
                    occurrences.push({ date, slot: meal.slot, mealName: meal.items[0].food.name });
                }
            });
        });
        return occurrences;
    }, [mealsMap, decodedName]);

    // Mock nutritional data for the ingredient (Real version would hit an API)
    const nutrition = useMemo(() => ({
        calories: 120,
        protein: 8,
        carbs: 12,
        fat: 4,
        fiber: 2,
        density: "High",
        score: 95
    }), []);

    return (
        <div className="min-h-full pb-20 bg-white dark:bg-slate-900 transition-colors">
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold uppercase text-xs tracking-widest"
                >
                    <ChevronLeft size={20} />
                    Back
                </button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <Leaf size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Verified Ingredient</span>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-block p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2rem] text-emerald-500 mb-4">
                            <Droplets size={40} />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{decodedName}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">Pure Nutritional Intel</p>
                    </div>

                    {/* Macro Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Protein", value: `${nutrition.protein}g`, icon: Zap, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
                            { label: "Carbs", value: `${nutrition.carbs}g`, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                            { label: "Fat", value: `${nutrition.fat}g`, icon: Droplets, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
                            { label: "Fiber", value: `${nutrition.fiber}g`, icon: Leaf, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20" }
                        ].map((item, i) => (
                            <motion.div 
                                key={item.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-6 rounded-[2.5rem] ${item.bg} border border-white/10 flex flex-col items-center text-center space-y-3`}
                            >
                                <item.icon size={24} className={item.color} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{item.label}</p>
                                    <p className="text-xl font-black text-slate-800 dark:text-slate-100">{item.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Usage & Sourcing Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Usage Tracker */}
                        <div className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                                    <Calendar size={20} className="text-emerald-500" />
                                    Upcoming Usage
                                </h3>
                                <div className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {usage.length} Instances
                                </div>
                            </div>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {usage.length > 0 ? usage.map((u, i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{u.slot}</p>
                                            <p className="font-bold text-sm tracking-tight">{u.mealName}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{u.date}</p>
                                    </div>
                                )) : (
                                    <div className="py-8 text-center space-y-3 opacity-40">
                                        <Search size={32} className="mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No scheduled usage found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Smart Info */}
                        <div className="space-y-6">
                            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-slate-800 dark:text-white">
                                    <Info size={20} className="text-emerald-500" />
                                    Nutritional Insight
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {decodedName} is considered a <strong>{nutrition.density} Density</strong> ingredient with a health score of <strong>{nutrition.score}/100</strong>. It provides essential micronutrients and is highly versatile for your {usage.length > 0 ? "current" : "future"} meal plans.
                                </p>
                                
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <ShoppingCart size={18} className="text-slate-400 group-hover:text-emerald-500" />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Add to Grocery List</span>
                                        </div>
                                        <PlusIcon size={16} className="text-slate-300" />
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 p-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                        Find Similar Alternatives
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function PlusIcon({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
