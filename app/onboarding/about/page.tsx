"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Scale, 
    Ruler, 
    Calendar, 
    ArrowRight, 
    ArrowLeft, 
    Users, 
    Zap, 
    Smile,
    Activity,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACTIVITY_LEVELS = [
    { id: "sedentary", name: "Sedentary", desc: "Little to no exercise", icon: "🛋️" },
    { id: "lightly_active", name: "Lightly Active", desc: "1-3 days/week exercise", icon: "🚶" },
    { id: "moderately_active", name: "Moderately Active", desc: "3-5 days/week exercise", icon: "🏃" },
    { id: "very_active", name: "Very Active", desc: "6-7 days/week hard exercise", icon: "🏋️" },
    { id: "extra_active", name: "Extra Active", desc: "Very intense exercise & job", icon: "🏃‍♂️" }
];

export default function AboutPage() {
    const [metrics, setMetrics] = useState({
        weight: 0,
        ft: 5,
        in: 9,
        age: 0,
        gender: "male",
        activityLevel: "moderately_active"
    });
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem("onboarding_about");
        if (stored) {
            const parsed = JSON.parse(stored);
            setMetrics(parsed);
        }
    }, []);

    const handleContinue = () => {
        // Validation Rules
        if (metrics.weight <= 0 || metrics.weight > 500) return setError("Please enter a valid weight (1-500kg)");
        if (metrics.age <=0 || metrics.age > 120) return setError("Please enter a valid age (1-120)");
        if (metrics.ft <= 0 || metrics.ft > 10) return setError("Please enter a valid height");

        // Internal Conversion: Feet/Inches to CM for calculations
        // 1ft = 30.48cm, 1in = 2.54cm. Using precise conversion.
        const totalInches = (metrics.ft * 12) + metrics.in;
        const heightCm = Math.round(totalInches * 2.54);
        
        if (heightCm < 50 || heightCm > 300) {
            return setError("Calculated height seems incorrect. Please check ft/in.");
        }

        localStorage.setItem("onboarding_about", JSON.stringify({
            ...metrics,
            height: heightCm // Store cm for Mifflin-St Jeor
        }));
        router.push("/onboarding/goals");
    };

    if (!isMounted) return null;

    return (
        <div className="space-y-8 min-h-[500px] flex flex-col">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 italic tracking-tight uppercase">Technical Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Tell us about your physical metrics</p>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-2xl flex items-center mb-4 transition-all"
                    >
                        <AlertCircle className="mr-2" size={18} />
                        <span className="text-sm font-bold">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Weight */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                            <Scale size={20} />
                            <span className="text-xs font-black uppercase tracking-widest text-[10px]">Weight (kg)</span>
                        </div>
                        <div className="flex items-end space-x-2">
                            <input 
                                type="number" 
                                placeholder="0"
                                value={metrics.weight || ""}
                                onChange={(e) => {
                                    setMetrics({ ...metrics, weight: Number(e.target.value) });
                                    setError(null);
                                }}
                                className="text-3xl font-black text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                        </div>
                    </div>

                    {/* Height (Feet + Inches) */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                            <Ruler size={20} />
                            <span className="text-xs font-black uppercase tracking-widest text-[10px]">Height</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-end space-x-1">
                                <input 
                                    type="number" 
                                    value={metrics.ft || 0}
                                    onChange={(e) => setMetrics({ ...metrics, ft: Number(e.target.value) })}
                                    className="text-2xl font-black text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 w-8"
                                />
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pb-1 uppercase">ft</span>
                            </div>
                            <div className="flex items-end space-x-1">
                                <input 
                                    type="number" 
                                    value={metrics.in || 0}
                                    onChange={(e) => setMetrics({ ...metrics, in: Number(e.target.value) })}
                                    className="text-2xl font-black text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 w-8"
                                />
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pb-1 uppercase">in</span>
                            </div>
                        </div>
                    </div>

                    {/* Age */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                            <Calendar size={20} />
                            <span className="text-xs font-black uppercase tracking-widest text-[10px]">Age</span>
                        </div>
                        <div className="flex items-end space-x-2">
                            <input 
                                type="number" 
                                placeholder="0"
                                value={metrics.age || ""}
                                onChange={(e) => {
                                    setMetrics({ ...metrics, age: Number(e.target.value) });
                                    setError(null);
                                }}
                                className="text-3xl font-black text-slate-800 dark:text-white bg-transparent border-none p-0 focus:ring-0 w-full"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                            <Users size={20} />
                            <span className="text-xs font-black uppercase tracking-widest text-[10px]">Gender</span>
                        </div>
                        <div className="flex items-center space-x-1 p-1 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setMetrics({ ...metrics, gender: "male" })}
                                className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest leading-none ${metrics.gender === "male" ? "bg-emerald-500 text-white" : "text-slate-400 dark:text-slate-500"}`}
                            >
                                Male
                            </button>
                            <button 
                                onClick={() => setMetrics({ ...metrics, gender: "female" })}
                                className={`flex-1 h-8 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest leading-none ${metrics.gender === "female" ? "bg-emerald-500 text-white" : "text-slate-400 dark:text-slate-500"}`}
                            >
                                Female
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-slate-400 px-2 uppercase tracking-widest text-[10px] font-black">
                        <Activity size={14} />
                        <span>Workload Activity</span>
                    </div>
                    <div className="space-y-3">
                        {ACTIVITY_LEVELS.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setMetrics({ ...metrics, activityLevel: level.id as any })}
                                className={`w-full flex items-center p-4 rounded-[28px] border-2 transition-all group ${
                                    metrics.activityLevel === level.id 
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-xl shadow-emerald-100 dark:shadow-none translate-y-[-2px]" 
                                        : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-900"
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 shadow-sm ${metrics.activityLevel === level.id ? "bg-white dark:bg-slate-700" : "bg-slate-50 dark:bg-slate-700"}`}>
                                    {level.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <p className={`font-black uppercase tracking-widest leading-none mb-1 text-xs ${metrics.activityLevel === level.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                                        {level.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">{level.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 pt-10 mt-auto">
                <button 
                    onClick={() => router.back()}
                    className="h-16 px-8 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                </button>
                <button 
                    onClick={handleContinue}
                    className="flex-1 h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center group"
                >
                    Continue
                    <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
