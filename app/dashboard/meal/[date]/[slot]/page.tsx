"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChefHat,
    Flame,
    Zap,
    UtensilsCrossed,
    ListChecks,
    Activity,
    Droplets,
    Loader2,
    Clock,
    CheckCircle2,
    RefreshCw,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useMealState } from "../../../../../lib/contexts/MealStateContext";
import { useUserStats } from "../../../../../lib/hooks/useUserStats";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving?: string;
    recipe?: {
        ingredients: { name: string; amount: string; calories?: number; protein?: number; carbs?: number; fats?: number }[];
        instructions: string[];
        prepTime: number;
    };
    isGeneratingRecipe?: boolean;
    description?: string;
}

interface MealFoodEntry {
    food: FoodItem;
    amount: number;
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MealRecipePage() {
    const { date, slot } = useParams();
    const router = useRouter();
    const { mealsMap, loading: stateLoading } = useMealState();

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // activeTab: which food.id is selected in the tab bar
    const [activeTab, setActiveTab] = useState<string | null>(null);
    // completedSteps: step index set per food
    const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

    const dateKey = date as string;
    const slotLabel = (slot as string).charAt(0).toUpperCase() + (slot as string).slice(1);

    const meal = useMemo(() => {
        const dayMeals = mealsMap[dateKey];
        if (!dayMeals) return null;
        return dayMeals.find(m => m.slot.toLowerCase() === (slot as string).toLowerCase()) ?? null;
    }, [mealsMap, dateKey, slot]);

    const foods: MealFoodEntry[] = useMemo(() => meal?.items ?? [], [meal]);

    // ── Set initial active tab when foods load ─────────────────────────────────
    useEffect(() => {
        if (foods.length > 0 && activeTab === null) {
            setActiveTab(foods[0].food.id);
        }
    }, [foods, activeTab]);

    // ── Step toggle ────────────────────────────────────────────────────────────
    const toggleStep = useCallback((foodId: string, idx: number) => {
        setCompletedSteps(prev => {
            const set = new Set(prev[foodId] ?? []);
            set.has(idx) ? set.delete(idx) : set.add(idx);
            return { ...prev, [foodId]: set };
        });
    }, []);

    // ── Guards ─────────────────────────────────────────────────────────────────
    if (!mounted || stateLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center space-y-4">
                <ChefHat size={48} className="text-emerald-500 animate-bounce" />
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest animate-pulse">
                    Retrieving Recipe Intel...
                </p>
            </div>
        );
    }

    if (!meal || foods.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <UtensilsCrossed size={48} className="text-slate-200" />
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic">
                        Recipe Not Found
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-2">
                        No meal data found for this slot.
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const activeFood = foods.find(e => e.food.id === activeTab)?.food ?? foods[0].food;
    const activeRecipe = activeFood.recipe;
    const isActiveLoading = activeFood.isGeneratingRecipe;
    const activeSteps = completedSteps[activeFood.id] ?? new Set<number>();
    const allGeneratingCount = foods.filter(f => f.food.isGeneratingRecipe).length;

    return (
        <div className="min-h-screen pb-24 bg-white dark:bg-slate-900 transition-colors">

            {/* ── Sticky Header ── */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-50">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold uppercase text-xs tracking-widest"
                >
                    <ChevronLeft size={20} />
                    Back to Planner
                </button>
                <div className="flex items-center gap-3">
                    {activeRecipe?.prepTime && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {activeRecipe.prepTime} min
                            </span>
                        </div>
                    )}
                    {allGeneratingCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-full border border-amber-100 dark:border-amber-900/40">
                            <Loader2 size={10} className="text-amber-500 animate-spin" />
                            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest">
                                Processing AI Intel…
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">
                            AI Engine Native
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-5 lg:px-6 py-10 space-y-10">

                {/* ── Meal Hero ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 text-center"
                >
                    <div className="flex items-center justify-center space-x-3 mb-1">
                        <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                            {slotLabel}
                        </span>
                        <span className="text-slate-200 dark:text-slate-700">/</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dateKey}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.9]">
                        {slotLabel} Setup
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {foods.length} food component{foods.length !== 1 ? "s" : ""} · {meal.totalCalories} kcal total
                    </p>
                </motion.div>

                {/* ── Meal-Level Macros ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MacroCard label="Calories" value={meal.totalCalories} unit="kcal" icon={Flame}    color="text-amber-500"   bg="bg-amber-50/70 dark:bg-amber-950/10" />
                    <MacroCard label="Protein"  value={meal.totalProtein}  unit="g"    icon={Zap}      color="text-blue-500"    bg="bg-blue-50/70 dark:bg-blue-950/10" />
                    <MacroCard label="Carbs"    value={meal.totalCarbs}    unit="g"    icon={Activity}  color="text-emerald-500" bg="bg-emerald-50/70 dark:bg-emerald-950/10" />
                    <MacroCard label="Fats"     value={meal.totalFat}      unit="g"    icon={Droplets}  color="text-rose-500"    bg="bg-rose-50/70 dark:bg-rose-950/10" />
                </div>

                {/* ── Tabs (if >1 food) ── */}
                {foods.length > 1 && (
                    <div className="flex gap-2 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
                        {foods.map(({ food }, idx) => {
                            const isActive = food.id === activeTab;
                            const isGenerating = food.isGeneratingRecipe;
                            const hasRecipe = !!food.recipe;
                            return (
                                <button
                                    key={`tab-${food.id}-${idx}`}
                                    onClick={() => setActiveTab(food.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        isActive
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg"
                                            : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-200 hover:text-emerald-600"
                                    }`}
                                >
                                    {isGenerating ? (
                                        <Loader2 size={10} className="animate-spin text-amber-500" />
                                    ) : hasRecipe ? (
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                                    ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    )}
                                    {food.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Panel Content ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFood.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Summary Header */}
                        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                    {activeFood.name}
                                </h2>
                                {activeFood.description && (
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {activeFood.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nutrition per serving</p>
                                    <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">
                                        {activeFood.calories} kcal · P{activeFood.protein} · C{activeFood.carbs} · F{activeFood.fat}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Implementation: Read-only check */}
                        {isActiveLoading ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-4 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={`sk-ing-${i}`} className="h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                                <div className="lg:col-span-8 space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={`sk-step-${i}`} className="h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        ) : activeRecipe ? (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                                {/* Ingredients List */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                                            <ListChecks className="text-emerald-500" size={22} />
                                            Ingredients
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {activeRecipe.ingredients.length} items verified
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {activeRecipe.ingredients.map((ing, i) => (
                                            <motion.div
                                                key={`ing-${activeFood.id}-${i}`}
                                                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-transparent hover:border-emerald-100 transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase group-hover:text-emerald-600 transition-colors">
                                                        {ing.name}
                                                    </span>
                                                    <span className="text-xs font-black text-emerald-600 italic">
                                                        {ing.amount}
                                                    </span>
                                                </div>
                                                {(ing.calories != null) && (
                                                    <div className="flex items-center gap-2 mt-1.5 opacity-50">
                                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                                            {ing.calories} kcal · P{ing.protein} · C{ing.carbs} · F{ing.fats}
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Step Instructions */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                                            <ChefHat className="text-emerald-500" size={22} />
                                            Execution
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {activeRecipe.instructions.length} steps · total control
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {activeRecipe.instructions.map((step, i) => {
                                            const done = activeSteps.has(i);
                                            return (
                                                <div
                                                    key={`step-${activeFood.id}-${i}`}
                                                    onClick={() => toggleStep(activeFood.id, i)}
                                                    className={`flex gap-5 group cursor-pointer p-4 rounded-2xl transition-all duration-300 ${
                                                        done ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                                    }`}
                                                >
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm transition-all ${
                                                        done ? "bg-emerald-500 text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                                    }`}>
                                                        {done ? <CheckCircle2 size={18} /> : i + 1}
                                                    </div>
                                                    <div className="pt-1.5 flex-grow">
                                                        <p className={`text-sm font-bold uppercase tracking-tight leading-relaxed transition-all ${
                                                            done ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-100"
                                                        }`}>
                                                            {step}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Progress */}
                                    {activeSteps.size > 0 && (
                                        <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Completion</span>
                                                <span className="text-[10px] font-black text-emerald-500">{Math.round((activeSteps.size / activeRecipe.instructions.length) * 100)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    className="h-full bg-emerald-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(activeSteps.size / activeRecipe.instructions.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-16 text-center space-y-6 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-700">
                                <ChefHat size={40} className="mx-auto text-slate-200" />
                                <div>
                                    <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase italic">Recipe Intel Pending</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-1">Check back in a moment or add food again.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ── MacroCard ──────────────────────────────────────────────────────────────────

const MacroCard = ({ label, value, unit, icon: Icon, color, bg }: any) => (
    <div className={`p-5 rounded-[2.5rem] ${bg} border border-white/10 flex flex-col items-center text-center space-y-2.5 shadow-sm`}>
        <Icon size={18} className={color} />
        <div>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-1.5">{label}</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 italic">
                {value}<span className="text-[10px] not-italic ml-0.5 opacity-40">{unit}</span>
            </p>
        </div>
    </div>
);
