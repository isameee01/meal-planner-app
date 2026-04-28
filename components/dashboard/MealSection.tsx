"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { 
    Plus, 
    RefreshCcw, 
    ChevronDown, 
    Loader2, 
    Flame,
    MoreVertical,
    Send,
    FileJson,
    Mail,
    Sparkles,
    Zap,
    AlertCircle,
    CalendarDays,
    ArrowRight,
    Share2,
    Download,
    Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateMealPlan, GeneratedMeal, UserPreferences } from "../../lib/meal-planner";
import { generateMultiDayMealPlanAI } from "../../lib/ai/generateMealPlan";
import { useNutritionTargets } from "../../lib/hooks/useNutritionTargets";
import { useGlobalFoodState } from "../../lib/contexts/FoodStateContext";
import { FOOD_DATABASE } from "../../lib/food-db";
import { useGeneratorSettings } from "../../lib/hooks/useGeneratorSettings";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import DropdownMenu from "./DropdownMenu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MealCard } from "./MealCard";
import { useMealState } from "../../lib/contexts/MealStateContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { repairSystemData } from "../../lib/utils/initializeSystem";

interface MealSectionProps {
    viewMode: "day" | "week";
    selectedDate: Date;
    dateRange: { start: Date; end: Date | null };
    setIsProcessing: (val: boolean) => void;
    isProcessing: boolean;
}

interface OnboardingPref {
    generate: boolean;
    categories: string[];
    customFoods?: any[];
}

interface OnboardingMealSlot {
    name: string;
}

// Type extension for jsPDF with AutoTable
interface ExtendedJsPDF extends jsPDF {
    lastAutoTable?: {
        finalY: number;
    };
}

export default function MealSection({ 
    viewMode, 
    selectedDate, 
    dateRange, 
    setIsProcessing,
    isProcessing 
}: MealSectionProps) {
    const { mealsMap, regenerateDay, batchRegenerateDays, refreshMeals, loading: isStateLoading } = useMealState();
    const { profile: userProfile, loading: isProfileLoading } = useUserProfile();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isAILoading, setIsAILoading] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const { settings } = useGeneratorSettings();
    const adminSettings = useAdminSettings();
    const { activeTarget } = useNutritionTargets();
    const { blockedFoods } = useGlobalFoodState();

    const getDateKey = useCallback((date: Date) => date.toISOString().split('T')[0], []);

    const targetDates = useMemo(() => {
        const dates: Date[] = [];
        if (viewMode === "day") {
            dates.push(selectedDate);
        } else {
            const start = new Date(dateRange.start);
            const end = dateRange.end ? new Date(dateRange.end) : new Date(start);
            if (!dateRange.end) end.setDate(end.getDate() + 6);

            const curr = new Date(start);
            while (curr <= end) {
                dates.push(new Date(curr));
                curr.setDate(curr.getDate() + 1);
            }
        }
        return dates;
    }, [viewMode, selectedDate, dateRange]);

    const loadMeals = useCallback(async () => {
        if (isAILoading || isSynthesizing) return;
        
        setIsProcessing(true);
        setIsSynthesizing(true);
        setErrorMessage(null); // Clear previous errors

        try {
            // Check Profile
            if (!userProfile) return;

            // Check if AI is disabled by admin
            if (adminSettings && adminSettings.enable_meal_generation === false) {
                setErrorMessage("Meal generation is currently disabled by administrator.");
                setIsProcessing(false);
                setIsSynthesizing(false);
                return;
            }

            // Determine which dates still need meals generated
            const missingDates = targetDates
                .map(d => getDateKey(d))
                .filter(dateStr => !mealsMap[dateStr]);

            if (missingDates.length === 0) {
                setIsProcessing(false);
                setIsSynthesizing(false);
                return;
            }

            setIsAILoading(true);
            const userData = {
                age: userProfile.age,
                weight: userProfile.weightKg,
                height: userProfile.heightCm,
                goalType: userProfile.goalType,
                activityLevel: userProfile.activityLevel,
                dietType: userProfile.dietType,
                calorieTarget: userProfile.calorieTarget,
                proteinTarget: userProfile.proteinTarget,
                carbsTarget: userProfile.carbsTarget,
                fatsTarget: userProfile.fatsTarget
            };

            try {
                // Single AI call for ALL missing dates
                const combinedSettings = adminSettings || settings;
                const aiPlansMap = await generateMultiDayMealPlanAI(
                    userData,
                    combinedSettings,
                    missingDates,
                    blockedFoods
                );
                // Batch update all days at once
                batchRegenerateDays(aiPlansMap);
                console.log("[MealSection] AI successfully generated meals for:", Object.keys(aiPlansMap));
            } catch (aiError) {
                console.warn("[MealSection] AI failed. Falling back to local engine.", aiError);
                
                // Fallback: generate each missing date with local engine
                const prefsRaw = localStorage.getItem("onboarding_preferences");
                const mealsRaw = localStorage.getItem("onboarding_meals");
                const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
                const slots = mealsRaw ? JSON.parse(mealsRaw) : [{ name: "Breakfast" }, { name: "Lunch" }, { name: "Dinner" }, { name: "Snack" }];

                const preferences: UserPreferences = {
                    selectedCategories: Object.values(prefs as Record<string, OnboardingPref>).flatMap(p => p.categories),
                    favoriteFoodIds: [],
                    excludedFoodIds: [],
                    customFoods: Object.values(prefs as Record<string, OnboardingPref>).flatMap(p => p.customFoods || []),
                    mealSlots: (slots as OnboardingMealSlot[]).map(m => m.name),
                    intelligentGeneration: true,
                    settings: settings 
                };

                const fallbackMap: Record<string, GeneratedMeal[]> = {};
                for (const dateStr of missingDates) {
                    fallbackMap[dateStr] = generateMealPlan(userProfile, preferences);
                }
                batchRegenerateDays(fallbackMap);
                setErrorMessage("AI is currently busy. High-quality local plans have been prepared.");
            }

        } catch (e) {
            console.error("[MealSection] Load failure:", e);
            setErrorMessage("System failed to initialize. Please try reloading.");
        } finally {
            setIsAILoading(false);
            setIsSynthesizing(false);
            setIsProcessing(false);
        }
    }, [targetDates, settings, getDateKey, userProfile, batchRegenerateDays, mealsMap, blockedFoods, adminSettings, setIsProcessing, isAILoading, isSynthesizing]);

    useEffect(() => {
        if (!isStateLoading && !isProfileLoading && userProfile && !isAILoading) {
            // Check if any of the target dates are missing meals
            const anyMissing = targetDates.some(d => !mealsMap[getDateKey(d)]);
            if (anyMissing) {
                loadMeals();
            }
        }
    }, [loadMeals, isStateLoading, isProfileLoading, userProfile, targetDates, getDateKey, mealsMap, isAILoading]);

    const handleRegenerate = () => {
        if (adminSettings?.enable_meal_generation === false) return;
        
        if (window.confirm("Regenerate all meals for this period?")) {
            targetDates.forEach(date => {
                const dateKey = getDateKey(date);
                localStorage.removeItem(`meals_cache_${dateKey}`);
            });
            localStorage.removeItem("meals_cache");
            refreshMeals();
        }
    };

    const dailyTotals = useMemo(() => {
        const dateKey = getDateKey(selectedDate);
        const dayMeals = mealsMap[dateKey];
        if (!dayMeals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

        return dayMeals.reduce((acc, meal) => ({
            calories: acc.calories + meal.totalCalories,
            protein: acc.protein + meal.totalProtein,
            carbs: acc.carbs + meal.totalCarbs,
            fat: acc.fat + meal.totalFat
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [selectedDate, mealsMap, getDateKey]);

    const handleGeneratePDF = useCallback(() => {
        const doc = new jsPDF() as ExtendedJsPDF;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129);
        doc.text("CustomDailyDiet", 14, 25);
        // ... (PDF logic)
        doc.save(`meal-plan-${getDateKey(selectedDate)}.pdf`);
    }, [selectedDate, getDateKey]);

    const shareItems = [
        { label: "Download PDF Plan", onClick: handleGeneratePDF, icon: <Download size={16} /> },
        { label: "Share via WhatsApp", onClick: () => alert("WhatsApp share initiated..."), icon: <Phone size={16} /> },
        { label: "Send via Email", onClick: () => alert("Email share initiated..."), icon: <Mail size={16} /> },
        { label: "Regenerate Plan", onClick: handleRegenerate, icon: <RefreshCcw size={16} />, variant: "danger" as const, disabled: adminSettings?.enable_meal_generation === false },
    ];

    return (
        <div className="space-y-12">
            {!isAILoading && !isSynthesizing && mealsMap[getDateKey(selectedDate)] && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                    <div className="flex items-center space-x-6">
                        <div className="flex -space-x-3">
                            <SummaryMacro label="Cals" value={dailyTotals.calories} color="bg-emerald-500" />
                            <SummaryMacro label="Prot" value={dailyTotals.protein} color="bg-blue-500" />
                            <SummaryMacro label="Carb" value={dailyTotals.carbs} color="bg-amber-500" />
                            <SummaryMacro label="Fat" value={dailyTotals.fat} color="bg-rose-500" />
                        </div>

                        <button 
                            onClick={handleRegenerate}
                            disabled={adminSettings?.enable_meal_generation === false}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                                adminSettings?.enable_meal_generation === false 
                                    ? "bg-slate-50 dark:bg-slate-800 text-slate-200 cursor-not-allowed opacity-50" 
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
                            }`}
                            title={adminSettings?.enable_meal_generation === false ? "Generation Disabled by Admin" : "Regenerate Plan"}
                        >
                            <RefreshCcw size={18} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <DropdownMenu items={shareItems}>
                            <button className="h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <Share2 size={16} />
                                Share Plan
                            </button>
                        </DropdownMenu>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {errorMessage && (
                    <motion.div 
                        key="error-banner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/40 rounded-[32px] flex flex-col items-center text-center space-y-4"
                    >
                        <AlertCircle size={32} className="text-red-500" />
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 italic uppercase tracking-tighter">System Alert</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold max-w-xs">{errorMessage}</p>
                        {adminSettings?.enable_meal_generation !== false && (
                            <button onClick={loadMeals} className="bg-slate-800 dark:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Retry Sync</button>
                        )}
                    </motion.div>
                )}

                {targetDates.map((date, idx) => {
                    const dateKey = getDateKey(date);
                    const dayMeals = mealsMap[dateKey];

                    return (
                        <div key={dateKey} className="space-y-6">
                            <div className="flex items-center space-x-4 px-2">
                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-emerald-500">
                                    <CalendarDays size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                                        {idx === 0 && viewMode === "day" ? "Today's Performance" : `Stage ${idx + 1}`}
                                    </p>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                        {date.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {dayMeals && dayMeals.length > 0 ? (
                                    dayMeals.map((meal) => (
                                        <MealCard key={`${dateKey}-${meal.slot}`} meal={meal} dateKey={dateKey} />
                                    ))
                                ) : (
                                    <div className="h-48 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-center">
                                       {!isAILoading && !isSynthesizing && <p className="text-xs font-black uppercase text-slate-300 tracking-widest">Awaiting Plan Intel...</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </AnimatePresence>

            <AnimatePresence>
                {isAILoading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl flex items-center justify-center mb-8 relative">
                             <div className="absolute inset-0 rounded-[40px] bg-emerald-500 animate-ping opacity-20" />
                             <Sparkles className="text-emerald-500 relative z-10" size={40} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic mb-2">Synthesizing</h2>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Llama 3.3 70B Engine · Personalizing Targets</p>
                        <div className="w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                             <motion.div 
                                className="h-full bg-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 15, repeat: Infinity }}
                             />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const SummaryMacro = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className={`px-4 py-2 ${color} rounded-2xl flex flex-col items-center justify-center min-w-[70px] shadow-lg shadow-current/20 border-2 border-white/20`}>
        <span className="text-[7px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-xs font-black text-white">{Math.round(value)}</span>
    </div>
);
