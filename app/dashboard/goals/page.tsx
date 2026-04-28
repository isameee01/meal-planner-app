"use client";

import { useState, useEffect } from "react";
import { 
    Target, 
    TrendingDown, 
    TrendingUp, 
    Minus, 
    Scale, 
    Calendar,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    ArrowRight,
    Sparkles,
    Info,
    ChevronRight,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { GoalType, GoalMode } from "../../../types/user";
import { calculateBMR, calculateTDEE } from "../../../lib/nutrition";
import { WeightDisplay } from "../../../components/dashboard/WeightDisplay";
import { formatWeight, convertToKg, mapUnitSystemToWeightUnit } from "../../../lib/utils/weight";
import { useGeneratorSettings } from "../../../lib/hooks/useGeneratorSettings";

export default function WeightGoalPage() {
    const { 
        profile,
        updateProfile,
        loading,
        error: profileError
    } = useUserProfile();

    // Map profile to legacy structures for UI compatibility
    const stats = profile ? {
        weight: profile.weightKg,
        heightCm: profile.heightCm,
        age: profile.age,
        sex: profile.sex,
        activityLevel: profile.activityLevel,
        height: { ft: Math.floor(profile.heightCm / 30.48), in: Math.round((profile.heightCm % 30.48) / 2.54) }
    } : null;

    const goal = profile ? {
        goalMode: profile.goalMode,
        goalType: profile.goalType,
        targetWeightKg: profile.targetWeightKg,
        weeklyChangeKg: profile.weeklyChangeKg,
        needsRecalculation: false // Always false because we sync immediately
    } : null;

    const statsLoaded = !loading && !!profile;
    const goalLoaded = !loading && !!profile;

    const updateStats = (updates: any) => updateProfile({ weightKg: updates.weight });
    const updateGoal = (updates: any) => updateProfile(updates);
    const markRecalculated = () => {};
    const addTarget = () => {};
    const statsStatus = loading ? "saving" : "idle"; // Rough mapping
    const goalStatus = loading ? "saving" : "idle";

    const [weightInput, setWeightInput] = useState("");
    const [targetWeightInput, setTargetWeightInput] = useState("");
    const [weeklyChangeInput, setWeeklyChangeInput] = useState("");
    const [weightError, setWeightError] = useState<string | null>(null);
    const [bmr, setBmr] = useState<number | null>(null);
    const [tdee, setTdee] = useState<number | null>(null);

    const { settings } = useGeneratorSettings();
    const currentUnit = settings.units;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (statsLoaded) {
            const display = formatWeight(stats.weight, mapUnitSystemToWeightUnit(currentUnit));
            setWeightInput(display.primaryValue.toString());
        }
    }, [statsLoaded, stats.weight, currentUnit]);

    useEffect(() => {
        if (goalLoaded) {
            const displayTarget = formatWeight(goal.targetWeightKg || 70, mapUnitSystemToWeightUnit(currentUnit));
            setTargetWeightInput(displayTarget.primaryValue.toString());
            
            // Weekly change speed is also in the selected unit
            const displayChange = formatWeight(goal.weeklyChangeKg || 0.5, mapUnitSystemToWeightUnit(currentUnit));
            setWeeklyChangeInput(displayChange.primaryValue.toString());
        }
    }, [goalLoaded, goal.targetWeightKg, goal.weeklyChangeKg, currentUnit]);

    useEffect(() => {
        if (!statsLoaded) return;

        // Convert height to cm
        const heightCm = currentUnit === "metric" 
            ? (stats.heightCm || 177)
            : (((stats.height?.ft || 5) * 30.48) + ((stats.height?.in || 10) * 2.54));
        
        // Map sex to gender (binary for formula)
        const gender = (stats.sex === "female" ? "female" : "male");

        const calculatedBmr = calculateBMR({
            weight: stats.weight || 70,
            height: heightCm,
            age: stats.age || 30,
            gender,
            activityLevel: stats.activityLevel || "moderately_active"
        });

        const calculatedTdee = calculateTDEE(calculatedBmr, stats.activityLevel || "moderately_active");

        setBmr(calculatedBmr);
        setTdee(calculatedTdee);

        console.log("Recalculated BMR/TDEE:", { weight: stats.weight, heightCm, age: stats.age, gender, bmr: calculatedBmr, tdee: calculatedTdee });
    }, [statsLoaded, stats.weight, stats.height, stats.heightCm, stats.age, stats.sex, stats.activityLevel, currentUnit]);

    if (!mounted || !statsLoaded || !goalLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    const handleWeightUpdate = () => {
        const val = parseFloat(weightInput);
        if (isNaN(val) || val < 20 || val > 550) {
            setWeightError("Please enter a valid weight");
            return;
        }
        setWeightError(null);
        
        const valInKg = mapUnitSystemToWeightUnit(currentUnit) === "kg" ? val : convertToKg(val);
        updateStats({ weight: valInKg });
    };

    const handleExactWeightChange = (field: "target" | "change", value: string) => {
        const val = parseFloat(value);
        if (isNaN(val)) return;

        if (field === "target") {
            setTargetWeightInput(value);
            const valInKg = mapUnitSystemToWeightUnit(currentUnit) === "kg" ? val : convertToKg(val);
            if (valInKg >= 20 && valInKg <= 250) {
                updateGoal({ targetWeightKg: valInKg });
            }
        } else {
            setWeeklyChangeInput(value);
            const valInKg = mapUnitSystemToWeightUnit(currentUnit) === "kg" ? val : convertToKg(val);
            if (valInKg >= 0.1 && valInKg <= 2) {
                updateGoal({ weeklyChangeKg: valInKg });
            }
        }
    };

    const handleUpdateNutrition = () => {
        const newTarget = generateTargetFromProfile();
        addTarget(newTarget as any);
        markRecalculated();
    };

    const isSaving = statsStatus === "saving" || goalStatus === "saving";
    const isSaved = statsStatus === "saved" || goalStatus === "saved";

    return (
        <div className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Target className="text-emerald-500" size={36} />
                        Weight & Goal
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Define your target and track your progress scientifically.</p>
                </div>

                <div className="flex items-center">
                    <AnimatePresence mode="wait">
                        {isSaving && (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center space-x-2 text-slate-400"
                            >
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-xs font-bold uppercase tracking-widest">Saving...</span>
                            </motion.div>
                        )}
                        {isSaved && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center space-x-2 text-emerald-500"
                            >
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Saved ✅</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Warning Banner */}
            <AnimatePresence>
                {goal.needsRecalculation && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0, y: -20 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -20 }}
                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden"
                    >
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Action Required</h3>
                            <p className="text-amber-700 dark:text-amber-300 text-sm">Your dietary requirements have changed based on your new goal. Update your nutrition targets to keep your planner accurate.</p>
                        </div>
                        <button 
                            onClick={handleUpdateNutrition}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-200 dark:shadow-none whitespace-nowrap"
                        >
                            Update Nutrition Targets
                            <Zap size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weight Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
                    <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 px-2 uppercase tracking-widest text-[10px] font-black">
                        <Scale size={16} />
                        <span>Today's Weight</span>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 transition-all hover:border-emerald-200">
                            <div className="flex items-end space-x-4">
                                <input 
                                    type="number"
                                    step={mapUnitSystemToWeightUnit(currentUnit) === "kg" ? "0.1" : "1"}
                                    value={weightInput}
                                    onChange={(e) => setWeightInput(e.target.value)}
                                    className="w-full text-5xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-200"
                                    placeholder="0"
                                />
                                <div className="flex flex-col items-center gap-1 mb-2">
                                    <div className="text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest cursor-default">
                                        {currentUnit}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                <WeightDisplay 
                                    weightKg={stats.weight} 
                                    unit={stats.weightUnit} 
                                    size="md"
                                />
                            </div>
                        </div>

                        {weightError && (
                            <p className="text-red-500 text-xs font-bold px-4">{weightError}</p>
                        )}

                        <button 
                            onClick={handleWeightUpdate}
                            className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            Update Current Weight
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-start gap-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
                            <Info size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Calibration</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">We recommend updating your weight at the same time every day (preferably morning) for the most accurate AI tracking.</p>
                        </div>
                    </div>
                </div>

                {/* Goal Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8 flex flex-col">
                    <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500 px-2 uppercase tracking-widest text-[10px] font-black">
                        <Sparkles size={16} />
                        <span>Weight Transformation</span>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700">
                        {["general", "exact"].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => updateGoal({ goalMode: mode as GoalMode })}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                                    goal.goalMode === mode 
                                        ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                {mode} Goal
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-4">
                        <AnimatePresence mode="wait">
                            {goal.goalMode === "general" ? (
                                <motion.div 
                                    key="general"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {[
                                        { id: "lose", label: "Lose fat", icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/10", border: "border-red-100 dark:border-red-900/30" },
                                        { id: "maintain", label: "Maintain weight", icon: Minus, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-100 dark:border-blue-900/30" },
                                        { id: "gain", label: "Build muscle", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10", border: "border-emerald-100 dark:border-emerald-900/30" }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => updateGoal({ goalType: type.id as GoalType })}
                                            className={`w-full flex items-center p-5 rounded-[28px] border-2 transition-all ${
                                                goal.goalType === type.id 
                                                    ? "bg-white dark:bg-slate-800 border-emerald-500 shadow-xl shadow-emerald-50 dark:shadow-none -translate-y-1" 
                                                    : "bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                            }`}
                                        >
                                            <div className={`w-12 h-12 ${type.bg} rounded-2xl flex items-center justify-center ${type.color} mr-4`}>
                                                <type.icon size={24} />
                                            </div>
                                            <span className={`text-sm font-bold ${goal.goalType === type.id ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                                                {type.label}
                                            </span>
                                            {goal.goalType === type.id && (
                                                <CheckCircle2 className="ml-auto text-emerald-500" size={20} />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="exact"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Weight</label>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{currentUnit}</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <input 
                                                type="number"
                                                step={stats.weightUnit === "kg" ? "0.1" : "1"}
                                                value={targetWeightInput}
                                                onChange={(e) => handleExactWeightChange("target", e.target.value)}
                                                className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                            />
                                        </div>
                                        <div className="px-2">
                                             <WeightDisplay 
                                                weightKg={goal.targetWeightKg || 70} 
                                                unit={mapUnitSystemToWeightUnit(currentUnit)} 
                                                size="sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weekly Change Speed</label>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{currentUnit}/week</span>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <input 
                                                type="number"
                                                step={mapUnitSystemToWeightUnit(currentUnit) === "kg" ? "0.01" : "0.1"}
                                                value={weeklyChangeInput}
                                                onChange={(e) => handleExactWeightChange("change", e.target.value)}
                                                className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                            />
                                        </div>
                                        <div className="px-2">
                                             <p className="text-[10px] font-bold text-slate-400 tracking-tight italic">
                                                Equivalent: {formatWeight(goal.weeklyChangeKg || 0.5, mapUnitSystemToWeightUnit(currentUnit)).secondary}/week
                                             </p>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium px-2 italic">Recommended: 0.25 - 0.75 {currentUnit}</p>
                                    </div>

                                    {/* Real-time Calculation Display */}
                                    {(() => {
                                        const rawVal = parseFloat(weeklyChangeInput);
                                        const weightUnit = mapUnitSystemToWeightUnit(currentUnit);
                                        const valInKg = isNaN(rawVal) ? 0 : (weightUnit === "kg" ? rawVal : convertToKg(rawVal));
                                        const deficit = Math.round(valInKg * 7700 / 7);

                                        return (
                                            <>
                                                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl space-y-1">
                                                    <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Calculated Deficit</h4>
                                                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                                        ~{deficit > 0 ? deficit : 0} calories / day
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Scientific Explanation Info */}
            <div className="bg-slate-900 text-white rounded-[40px] p-10 overflow-hidden relative">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-xl font-bold">Mifflin-St Jeor Engine</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            We use the gold-standard Mifflin-St Jeor equation to calculate your Basal Metabolic Rate (BMR), factoring in your weight, height, age, and sex for surgical precision.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Current BMR</span>
                            <span className="font-black">
                                {bmr !== null ? `${bmr} kcal` : "Calculating..."}
                            </span>
                        </div>
                        <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Active TDEE</span>
                            <span className="font-black text-emerald-400">
                                {tdee !== null ? `~${tdee} kcal` : "-- kcal"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
            </div>
        </div>
    );
}
