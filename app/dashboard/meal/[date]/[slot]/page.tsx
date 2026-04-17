"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChefHat, Flame, Timer, Zap, UtensilsCrossed, ListChecks, ChevronRight, Scale, Activity, Droplets, Sparkles, Loader2 } from "lucide-react";
import { useMealState } from "../../../../../lib/contexts/MealStateContext";
import { useUserStats } from "../../../../../lib/hooks/useUserStats";

export default function MealRecipePage() {
    const { date, slot } = useParams();
    const router = useRouter();
    const { mealsMap, loading: stateLoading, regenerateDay } = useMealState();
    const { stats: userData } = useUserStats();
    
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [isGenerating, setIsGenerating] = useState(false);
    const [localIngredients, setLocalIngredients] = useState<any[]>([]);
    const [localDirections, setLocalDirections] = useState<string[]>([]);

    const dateKey = date as string;
    const slotLabel = (slot as string).charAt(0).toUpperCase() + (slot as string).slice(1);

    const meal = useMemo(() => {
        const dayMeals = mealsMap[dateKey];
        if (!dayMeals) return null;
        return dayMeals.find(m => m.slot.toLowerCase() === (slot as string).toLowerCase());
    }, [mealsMap, dateKey, slot]);

    useEffect(() => {
        if (!meal || !meal.items[0]?.food || isGenerating) return;

        const food = meal.items[0].food;
        
        // If we have directions in the global state, sync to local
        if (food.directions && food.directions.length > 0) {
            setLocalDirections(food.directions);
            setLocalIngredients(food.ingredients || []);
        } 
        // Only auto-synthesize if we have absolutely no directions and haven't tried yet
        else if (localDirections.length === 0) {
            handleSynthesize();
        }
    }, [meal, isGenerating, localDirections.length]);

    const handleSynthesize = async () => {
        if (!meal || !meal.items[0]?.food) return;
        setIsGenerating(true);
        try {
            const { generateRecipeAI } = await import("../../../../../lib/ai/generateMealPlan");
            const result = await generateRecipeAI(meal.items[0].food.name, userData);
            setLocalDirections(result.directions);
            setLocalIngredients(result.ingredients);
            
            // Optionally update the global state so it's cached
            const updatedMeals = mealsMap[dateKey].map(m => {
                if (m.slot.toLowerCase() === (slot as string).toLowerCase()) {
                    return {
                        ...m,
                        items: m.items.map((item, idx) => idx === 0 ? { ...item, food: { ...item.food, ...result } } : item)
                    };
                }
                return m;
            });
            regenerateDay(dateKey, updatedMeals);
        } catch (e) {
            console.error("Recipe synthesis failed:", e);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!mounted || stateLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center space-y-4">
                <ChefHat size={48} className="text-emerald-500 animate-bounce" />
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest animate-pulse">Retrieving Recipe Intel...</p>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <UtensilsCrossed size={48} className="text-slate-200" />
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic">Recipe Not Found</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-2">The AI has not yet synthesized this specific meal plan.</p>
                </div>
                <button onClick={() => router.back()} className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Go Back</button>
            </div>
        );
    }

    // AI recipes usually attach directions to the FIRST food item in our virtual structure
    const mainFood = meal.items[0]?.food;
    const directions = localDirections;
    const ingredients = localIngredients;

    return (
        <div className="min-h-screen pb-24 bg-white dark:bg-slate-900 transition-colors">
            {/* Minimal Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-50">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold uppercase text-xs tracking-widest">
                    <ChevronLeft size={20} />
                    Back to Planner
                </button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">AI Synthesis V2.1</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
                {/* Hero Title Area */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                         <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">{slotLabel} Performance</span>
                         <span className="text-slate-200 dark:text-slate-700">/</span>
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{dateKey}</span>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.9]">{mainFood?.name || "The Protocol"}</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] max-w-xl mx-auto line-clamp-2">
                        {mainFood?.description || "Precisely engineered nutrition designed to hit your biological benchmarks."}
                    </p>
                </motion.div>

                {/* Macro Highlighting */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MacroCard label="Calories" value={meal.totalCalories} unit="kcal" icon={Flame} color="text-amber-500" bg="bg-amber-50/50 dark:bg-amber-950/10" />
                    <MacroCard label="Protein" value={meal.totalProtein} unit="g" icon={Zap} color="text-blue-500" bg="bg-blue-50/50 dark:bg-blue-950/10" />
                    <MacroCard label="Carbs" value={meal.totalCarbs} unit="g" icon={Activity} color="text-emerald-500" bg="bg-emerald-50/50 dark:bg-emerald-950/10" />
                    <MacroCard label="Fats" value={meal.totalFat} unit="g" icon={Droplets} color="text-rose-500" bg="bg-rose-50/50 dark:bg-rose-950/10" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Ingredients */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                                <ListChecks className="text-emerald-500" size={24} />
                                The Reagents
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {mainFood?.prepTime ? `Estimated Prep: ${mainFood.prepTime}` : "Precise Sourcing Required"}
                            </p>
                        </div>
                        <div className="space-y-3">
                            {ingredients.length > 0 ? ingredients.map((ing, i) => (
                                <motion.div key={i} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40 transition-all group">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{ing.name}</span>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 italic">{ing.amount}</span>
                                </motion.div>
                            )) : (
                                <p className="text-xs text-slate-400 font-bold italic">Nutritional components derived from holistic data.</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Directions */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                                <ChefHat className="text-emerald-500" size={24} />
                                Execution Protocol
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sequential Production Steps</p>
                        </div>
                        <div className="space-y-6">
                            {(directions.length > 0) ? directions.map((step, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black italic text-sm shadow-xl shadow-slate-900/10 transition-transform group-hover:scale-110">
                                        {i + 1}
                                    </div>
                                    <div className="flex-grow pt-1 space-y-2">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed uppercase tracking-tight">{step}</p>
                                        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 group-last:hidden" />
                                    </div>
                                </div>
                            )) : isGenerating ? (
                                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="text-emerald-500 animate-spin" size={40} />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest animate-pulse">AI is writing your cooking instructions...</p>
                                </div>
                            ) : (
                                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
                                    <Scale size={32} className="mx-auto text-slate-300" />
                                    <p className="text-xs font-bold text-slate-400 uppercase">Standard preparation methods apply to this item.</p>
                                    <button onClick={handleSynthesize} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase">Force AI Synthesis</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const MacroCard = ({ label, value, unit, icon: Icon, color, bg }: any) => (
    <div className={`p-6 rounded-[2.5rem] ${bg} border border-white/10 flex flex-col items-center text-center space-y-3 shadow-sm`}>
        <Icon size={20} className={color} />
        <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-1.5">{label}</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 italic">{value}<span className="text-[10px] not-italic ml-1 opacity-40">{unit}</span></p>
        </div>
    </div>
);
