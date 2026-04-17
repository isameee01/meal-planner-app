"use client";

import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useGeneratorSettings } from "../../lib/hooks/useGeneratorSettings";
import { useMealState } from "../../lib/contexts/MealStateContext";
import { Activity, Zap, TrendingUp, Scale } from "lucide-react";

export default function NutritionChart({ selectedDate }: { selectedDate: Date | { start: Date, end: Date | null } }) {
    const { settings, getEnergyValue, getCarbsValue } = useGeneratorSettings();
    const { mealsMap } = useMealState();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const totals = useMemo(() => {
        const targetDate = selectedDate instanceof Date ? selectedDate : selectedDate.start;
        const dateKey = targetDate.toISOString().split("T")[0];
        const dayMeals = mealsMap[dateKey] || [];
        
        return dayMeals.reduce((acc, meal) => ({
            calories: acc.calories + meal.totalCalories,
            protein: acc.protein + meal.totalProtein,
            carbs: acc.carbs + meal.totalCarbs,
            fat: acc.fat + meal.totalFat,
            fiber: acc.fiber + (meal.items.reduce((f, item) => f + ((item.food.fiber || 0) * item.amount), 0))
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    }, [mealsMap, selectedDate]);

    const data = [
        { name: "Protein", value: totals.protein || 1, color: "#3b82f6" },
        { name: "Carbs", value: totals.carbs || 1, color: "#10b981" },
        { name: "Fats", value: totals.fat || 1, color: "#f59e0b" },
    ];

    if (!mounted) return null;

    return (
        <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
        >
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest italic">Macro Allocation</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Real-time Fuel Analytics</p>
                </div>
                <Activity size={16} className="text-emerald-500 opacity-20" />
            </div>

            <div className="p-6">
                <div className="h-56 w-full relative mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                                isAnimationActive={true}
                                cornerRadius={10}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <motion.span 
                            key={totals.calories}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-4xl font-black text-slate-900 dark:text-slate-100 italic tracking-tighter"
                        >
                            {getEnergyValue(totals.calories).toLocaleString()}
                        </motion.span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">
                            {settings.energyUnit} Target
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <StatRow 
                        label="Protein" 
                        value={`${totals.protein}g`} 
                        color="bg-blue-500" 
                        icon={<Zap size={10} />}
                        percentage={totals.calories > 0 ? Math.round((totals.protein * 4 / totals.calories) * 100) : 0}
                    />
                    <StatRow 
                        label={settings.carbsType === "net" ? "Net Carbs" : "Total Carbs"} 
                        value={`${getCarbsValue(totals.carbs, totals.fiber)}g`} 
                        color="bg-emerald-500" 
                        icon={<TrendingUp size={10} />}
                        percentage={totals.calories > 0 ? Math.round((totals.carbs * 4 / totals.calories) * 100) : 0}
                    />
                    <StatRow 
                        label="Fats" 
                        value={`${totals.fat}g`} 
                        color="bg-amber-500" 
                        icon={<Scale size={10} />}
                        percentage={totals.calories > 0 ? Math.round((totals.fat * 9 / totals.calories) * 100) : 0}
                    />
                </div>
            </div>
        </motion.div>
    );
}

const StatRow = ({ label, value, color, icon, percentage }: { label: string, value: string, color: string, icon: React.ReactNode, percentage: number }) => (
    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-lg ${color} text-white flex items-center justify-center shadow-lg shadow-current/20`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <div className="flex items-baseline space-x-2">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase">{value}</p>
                    <span className="text-[8px] font-bold text-slate-400 opacity-50">{percentage}%</span>
                </div>
            </div>
        </div>
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={`h-full ${color}`}
            />
        </div>
    </div>
);
