"use client";

import { useState, useEffect } from "react";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useRouter } from "next/navigation";
import { 
    calculateBMR, 
    calculateTDEE, 
    calculateNutritionProfile, 
    PhysicalMetrics 
} from "../../../lib/nutrition";
import { GoalType } from "../../../types/user";
import { 
    ArrowRight, 
    ArrowLeft, 
    Zap, 
    Flame, 
    BarChart3, 
    Target,
    Activity,
    Edit3,
    AlertTriangle,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MacroBar = ({ label, value, unit, color, percentage }: { label: string; value: number; unit: string; color: string; percentage: number }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
            <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 italic">{value}</span>
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{unit}</span>
            </div>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${color}`}
            />
        </div>
    </div>
);

export default function SummaryPage() {
    const [profile, setProfile] = useState<any>(null);
    const [isValid, setIsValid] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const aboutStored = localStorage.getItem("onboarding_about");
        const goalStored = localStorage.getItem("onboarding_goal");

        if (aboutStored && goalStored) {
            const metrics = JSON.parse(aboutStored);
            
            // Strict Validation
            if (metrics.weight > 0 && metrics.height > 0 && metrics.age > 0) {
                const bmr = calculateBMR(metrics);
                const tdee = calculateTDEE(bmr, metrics.activityLevel);
                const nutrition = calculateNutritionProfile(tdee, goalStored as GoalType);
                
                // Calculate actual percentages for UI bars
                const totalMacrosKcal = (nutrition.macros.protein * 4) + (nutrition.macros.carbs * 4) + (nutrition.macros.fat * 9);
                const pPct = Math.round((nutrition.macros.protein * 4 / totalMacrosKcal) * 100);
                const cPct = Math.round((nutrition.macros.carbs * 4 / totalMacrosKcal) * 100);
                const fPct = 100 - pPct - cPct;

                setProfile({
                    ...nutrition,
                    bmr,
                    goal: goalStored,
                    metrics,
                    percentages: { pPct, cPct, fPct }
                });
                setIsValid(true);
            } else {
                setIsValid(false);
            }
        } else {
            router.push("/onboarding/about");
        }
    }, [router]);

    const { updateProfile } = useUserProfile();

    const handleGenerate = async () => {
        if (!isValid) return;
        
        try {
            // Persist to Supabase via updateProfile
            await updateProfile({
                weightKg: profile.metrics.weight,
                heightCm: profile.metrics.height,
                age: profile.metrics.age,
                sex: profile.metrics.gender,
                activityLevel: profile.metrics.activityLevel,
                goalType: profile.goal,
                dietType: "anything" // Default, can be refined in preferences
            });

            localStorage.setItem("nutritionProfile", JSON.stringify(profile));
            localStorage.setItem("onboardingComplete", "true");
            router.push("/onboarding/complete");
        } catch (err) {
            console.error("Failed to save profile during onboarding:", err);
            // Fallback to local only if DB fails, but try to continue
            localStorage.setItem("onboardingComplete", "true");
            router.push("/onboarding/complete");
        }
    };

    if (!isMounted) return null;

    return (
        <div className="space-y-8 min-h-[500px] flex flex-col">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight uppercase leading-none mb-2">System Calculation</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Your calculated performance blueprint</p>
            </div>

            <AnimatePresence mode="wait">
                {!isValid ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-10 bg-red-50/50 dark:bg-red-900/10 rounded-[40px] border border-red-100 dark:border-red-900/20"
                    >
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-red-500 shadow-sm animate-pulse">
                            <AlertTriangle size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">Incomplete Profile</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Some of your metrics are missing or set to zero. We cannot calculate your plan without accurate data.</p>
                        </div>
                        <button 
                            onClick={() => router.push("/onboarding/about")}
                            className="bg-slate-800 dark:bg-slate-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center text-xs"
                        >
                            <Edit3 size={14} className="mr-2" /> Fix Metrics
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 space-y-8"
                    >
                        {/* Validation Success Badge */}
                        <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 py-2 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                            <ShieldCheck size={14} />
                            <span>Integrity Check Passed</span>
                        </div>

                        {/* Main Calorie Card */}
                        <div className="relative p-10 bg-white dark:bg-slate-800/80 rounded-[40px] border border-slate-100 dark:border-slate-800 text-center space-y-4 shadow-xl">
                            <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-900/40 rounded-[24px] flex items-center justify-center text-emerald-500 mb-2">
                                <Flame size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Requirement</p>
                                <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                    {profile.calories.toLocaleString()}
                                </h2>
                                <p className="text-xs font-black text-emerald-500 dark:text-emerald-400 tracking-widest uppercase">KCAL / Day</p>
                            </div>
                        </div>

                        {/* Macro Split */}
                        <div className="p-8 bg-slate-50/50 dark:bg-slate-800/80 rounded-[32px] border border-slate-100 dark:border-slate-700 space-y-6">
                            <MacroBar label="Protein" value={profile.macros.protein} unit="g" color="bg-purple-500" percentage={profile.percentages.pPct} />
                            <MacroBar label="Carbs" value={profile.macros.carbs} unit="g" color="bg-orange-500" percentage={profile.percentages.cPct} />
                            <MacroBar label="Fats" value={profile.macros.fat} unit="g" color="bg-teal-500" percentage={profile.percentages.fPct} />
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl">
                                    <Activity size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">BMR</span>
                                    <span className="font-black text-slate-800 dark:text-slate-100 italic text-sm">{profile.bmr}</span>
                                </div>
                            </div>
                            <div className="p-5 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-xl">
                                    <Target size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Goal</span>
                                    <span className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight text-[10px]">{profile.goal}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center space-x-4 pt-10 mt-auto">
                <button 
                    onClick={() => router.back()}
                    className="h-16 px-8 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                </button>
                <button 
                    onClick={handleGenerate}
                    disabled={!isValid}
                    className="flex-1 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center group disabled:opacity-50 disabled:grayscale transition-all"
                >
                    Confirm & Proceed
                    <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
