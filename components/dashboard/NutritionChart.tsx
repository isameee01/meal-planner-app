"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useGeneratorSettings } from "../../lib/hooks/useGeneratorSettings";

export default function NutritionChart({ selectedDate }: { selectedDate: Date | { start: Date, end: Date | null } }) {
    const { settings, getEnergyValue, getCarbsValue } = useGeneratorSettings();
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const checkPlan = () => {
            const cacheRaw = localStorage.getItem("meals_cache");
            if (!cacheRaw) return;
            try {
                const cache = JSON.parse(cacheRaw);
                const targetDate = selectedDate instanceof Date ? selectedDate : selectedDate.start;
                const dateKey = targetDate.toISOString().split("T")[0];
                const dayMeals = cache[dateKey] || [];
                
                let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
                
                dayMeals.forEach((meal: any) => {
                    meal.items.forEach((item: any) => {
                        calories += (item.food.calories || 0) * item.amount;
                        protein += (item.food.protein || 0) * item.amount;
                        carbs += (item.food.carbs || 0) * item.amount;
                        fat += (item.food.fat || 0) * item.amount;
                        fiber += (item.food.fiber || 0) * item.amount;
                    });
                });
                
                setStats({ 
                    calories: Math.round(calories), 
                    protein: Math.round(protein), 
                    carbs: Math.round(carbs), 
                    fat: Math.round(fat),
                    fiber: Math.round(fiber)
                });
            } catch (e) {
                console.error("Error parsing stats", e);
            }
        };
        checkPlan();
        window.addEventListener("storage", checkPlan);
        return () => window.removeEventListener("storage", checkPlan);
    }, [selectedDate]);

    const data = [
        { name: "Protein", value: stats.protein || 1, color: "#10b981" },
        { name: "Carbs", value: stats.carbs || 1, color: "#3b82f6" },
        { name: "Fats", value: stats.fat || 1, color: "#f59e0b" },
    ];

    if (!mounted) return null;

    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-xl shadow-sm p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
        >
            <div className="h-48 w-full relative mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100 italic">
                        {getEnergyValue(stats.calories).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                        {settings.energyUnit}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                    <p className="text-[10px] font-black text-emerald-500 uppercase leading-none mb-1">Protein</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">{stats.protein}g</p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                    <p className="text-[10px] font-black text-blue-500 uppercase leading-none mb-1">
                        {settings.carbsType === "net" ? "Net Carbs" : "Total Carbs"}
                    </p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">
                        {getCarbsValue(stats.carbs, stats.fiber)}g
                    </p>
                </div>
                <div className="text-center p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-900/20">
                    <p className="text-[10px] font-black text-orange-500 uppercase leading-none mb-1">Fats</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">{stats.fat}g</p>
                </div>
            </div>
        </motion.div>
    );
}
