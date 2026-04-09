"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, 
    Copy, 
    PlusSquare, 
    Trash2,
    PieChart as PieChartIcon
} from "lucide-react";
import DropdownMenu from "./DropdownMenu";

const StatsItem = ({ emoji, label, value, unit }: { emoji: string; label: string; value: string | number; unit: string }) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group cursor-default text-slate-800 dark:text-slate-200 font-medium">
        <div className="flex items-center space-x-3">
            <div className="text-xl w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                {emoji}
            </div>
            <span className="text-sm font-bold">{label}</span>
        </div>
        <div className="flex items-center space-x-1">
            <span className="text-sm font-extrabold">{value}</span>
            <span className="text-[10px] font-bold text-slate-400 lowercase">{unit}</span>
        </div>
    </div>
);

interface NutritionPanelProps {
    isProcessing: boolean;
    selectedDate: Date | { start: Date; end: Date | null };
    viewMode: "day" | "week";
}

export default function NutritionPanel({ isProcessing, selectedDate, viewMode }: NutritionPanelProps) {
    const [mounted, setMounted] = useState(false);
    const [hasPlan, setHasPlan] = useState(false);
    const [stats, setStats] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        proteinPct: 30,
        carbPct: 40,
        fatPct: 30
    });

    const getDateKey = (date: Date) => date.toISOString().split("T")[0];

    useEffect(() => {
        if (!mounted) return;
        const checkPlan = () => {
            const cacheRaw = localStorage.getItem("meals_cache");
            if (!cacheRaw) {
                setHasPlan(false);
                return;
            }

            try {
                const cache = JSON.parse(cacheRaw);
                const targetDate = selectedDate instanceof Date ? selectedDate : selectedDate.start;
                const dateKey = getDateKey(targetDate);
                const meals = cache[dateKey];

                if (meals && meals.length > 0) {
                    setHasPlan(true);
                    const totalCals = meals.reduce((acc: number, m: any) => acc + (Number(m.totalCalories) || 0), 0);
                    const totalProtein = meals.reduce((acc: number, m: any) => acc + (Number(m.totalProtein) || 0), 0);
                    const totalCarbs = meals.reduce((acc: number, m: any) => acc + (Number(m.totalCarbs) || 0), 0);
                    const totalFat = meals.reduce((acc: number, m: any) => acc + (Number(m.totalFat) || 0), 0);
                    
                    setStats({
                        calories: totalCals || 0,
                        protein: totalProtein || 0,
                        carbs: totalCarbs || 0,
                        fat: totalFat || 0,
                        fiber: Math.round((totalCals || 0) / 100 * 1.4),
                        proteinPct: 30,
                        carbPct: 40,
                        fatPct: 30
                    });
                } else {
                    setHasPlan(false);
                }
            } catch (e) {
                console.error("Failed to parse meals cache", e);
                setHasPlan(false);
            }
        };

        checkPlan();
        window.addEventListener("storage", checkPlan);
        return () => window.removeEventListener("storage", checkPlan);
    }, [selectedDate, isProcessing, mounted]); 

    const data = [
        { name: "Protein", value: stats.proteinPct, color: "#a855f7" },
        { name: "Carbs", value: stats.carbPct, color: "#f97316" },
        { name: "Fat", value: stats.fatPct, color: "#0d9488" },
    ];

    const menuItems = [
        { label: "Create Note", onClick: () => console.log("Create Note"), icon: <FileText size={16} /> },
        { label: "Copy Meals", onClick: () => console.log("Copy Meals"), icon: <Copy size={16} /> },
        { label: "Clear Day", onClick: () => console.log("Clear Day"), icon: <Trash2 size={16} />, variant: "danger" as const },
    ];

    if (!mounted) return null;

    if (isProcessing) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 sticky top-20 animate-pulse transition-all">
                <div className="h-6 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg mb-8" />
                <div className="h-48 w-48 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 sticky top-20 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-8">
                <div className="text-left">
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 italic uppercase">Nutrition Hub</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Daily Performance Sync</p>
                </div>
                <DropdownMenu items={menuItems} />
            </div>

            <AnimatePresence mode="wait">
                {hasPlan ? (
                    <motion.div 
                        key="stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="h-64 mb-8 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={1500}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: "16px", 
                                            border: "none", 
                                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                                            fontSize: "10px",
                                            fontWeight: "900",
                                            textTransform: "uppercase"
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.calories.toLocaleString()}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">KCAL</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-8">
                            <div className="text-center p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-900/20">
                                <p className="text-[10px] font-black text-purple-400 uppercase leading-none mb-1">PRO</p>
                                <p className="text-xs font-black text-purple-600 dark:text-purple-400">30%</p>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-900/20">
                                <p className="text-[10px] font-black text-orange-400 uppercase leading-none mb-1">CHO</p>
                                <p className="text-xs font-black text-orange-600 dark:text-orange-400">40%</p>
                            </div>
                            <div className="text-center p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100/50 dark:border-teal-900/20">
                                <p className="text-[10px] font-black text-teal-400 uppercase leading-none mb-1">FAT</p>
                                <p className="text-xs font-black text-teal-600 dark:text-teal-400">30%</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <StatsItem emoji="🔥" label="Calories" value={stats.calories.toLocaleString()} unit="kcal" />
                            <StatsItem emoji="🍞" label="Carbs" value={stats.carbs} unit="g" />
                            <StatsItem emoji="🥑" label="Fat" value={stats.fat} unit="g" />
                            <StatsItem emoji="🍗" label="Protein" value={stats.protein} unit="g" />
                            <hr className="my-2 border-slate-100 dark:border-slate-800" />
                            <StatsItem emoji="🌾" label="Fiber" value={stats.fiber} unit="g" />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                    >
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-inner">
                            <PieChartIcon size={32} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Plan Unsync</p>
                            <p className="text-[10px] text-slate-400 font-bold max-w-[140px] mx-auto mt-1">Generate your daily blueprint to see stats.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
