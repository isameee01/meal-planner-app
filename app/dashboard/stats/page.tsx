"use client";

import { useState, useRef } from "react";
import { 
    UserCircle, 
    Scale, 
    Ruler, 
    Calendar, 
    Activity, 
    Upload, 
    X, 
    CheckCircle2, 
    AlertCircle,
    ChevronDown,
    Loader2,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { useUserStats } from "../../../lib/hooks/useUserStats";
import { ActivityLevelId, Sex, BodyFatLevel, DietType } from "../../../types/user";
import { WeightDisplay } from "../../../components/dashboard/WeightDisplay";
import { formatWeight, convertToKg } from "../../../lib/utils/weight";
import { useGeneratorSettings } from "../../../lib/hooks/useGeneratorSettings";
import { AVAILABLE_DIETS } from "../../../lib/constants/diets";

const ACTIVITY_LEVELS = [
    { id: "sedentary", name: "Sedentary", desc: "Little to no exercise, office job", icon: "🛋️" },
    { id: "lightly_active", name: "Lightly Active", desc: "1–2 days/week of light exercise", icon: "🚶" },
    { id: "moderately_active", name: "Moderately Active", desc: "3–5 days/week of moderate exercise", icon: "🏃" },
    { id: "very_active", name: "Very Active", desc: "6–7 days/week of intense exercise", icon: "🏋️" },
    { id: "extra_active", name: "Extra Active", desc: "Daily intense training or physical job", icon: "🏃‍♂️" }
];

const BODY_FAT_LEVELS = [
    { id: "low", label: "Low", range: "< 15% (M) / < 22% (F)" },
    { id: "medium", label: "Medium", range: "15-25% (M) / 22-32% (F)" },
    { id: "high", label: "High", range: "> 25% (M) / > 32% (F)" }
];

export default function PhysicalStatsPage() {
    const { 
        profile,
        updateProfile,
        loading: profileLoading,
        error: profileError
    } = useUserProfile();

    const { 
        uploadImage, 
        removeImage, 
        status: imageStatus, 
        isUploading,
        setError: setImageError 
    } = useUserStats();

    // Mapping profile to stats for compatibility with existing UI logic
    const stats = profile ? {
        name: profile.fullName,
        sex: profile.sex,
        weight: profile.weightKg,
        heightCm: profile.heightCm,
        age: profile.age,
        activityLevel: profile.activityLevel,
        bodyFat: "medium" as BodyFatLevel, // Profile doesn't store this yet, default to medium
        height: { ft: Math.floor(profile.heightCm / 30.48), in: Math.round((profile.heightCm % 30.48) / 2.54) },
        weightUnit: "kg" as const
    } : null;

    const isLoaded = !profileLoading;
    const error = profileError;
    const updateStats = (updates: any) => {
        // Map stats updates back to profile updates
        const profileUpdates: any = {};
        if (updates.name !== undefined) profileUpdates.fullName = updates.name;
        if (updates.weight !== undefined) profileUpdates.weightKg = updates.weight;
        if (updates.heightCm !== undefined) profileUpdates.heightCm = updates.heightCm;
        if (updates.age !== undefined) profileUpdates.age = updates.age;
        if (updates.sex !== undefined) profileUpdates.sex = updates.sex;
        if (updates.activityLevel !== undefined) profileUpdates.activityLevel = updates.activityLevel;
        if (updates.height !== undefined) {
             profileUpdates.heightCm = (updates.height.ft * 30.48) + (updates.height.in * 2.54);
        }
        updateProfile(profileUpdates);
    };

    const setError = (err: string | null) => setImageError(err);

    const { settings } = useGeneratorSettings();
    const currentUnit = settings.units;

    const [isActivityOpen, setIsActivityOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    const handleHeightChange = (field: "ft" | "in" | "cm", value: string) => {
        const val = parseInt(value) || 0;
        
        if (field === "cm") {
            if ((val < 50 || val > 250) && value !== "") {
                setError("Height must be between 50 and 250 cm");
            } else {
                setError(null);
            }
            updateStats({ heightCm: val });
            return;
        }

        if (field === "ft" && (val < 1 || val > 8) && value !== "") {
            setError("Height feet must be between 1 and 8");
            return;
        }
        if (field === "in" && (val < 0 || val > 11) && value !== "") {
            setError("Height inches must be between 0 and 11");
            return;
        }
        setError(null);
        updateStats({ height: { ...(stats.height || { ft: 5, in: 10 }), [field]: val } });
    };

    const handleWeightChange = (value: string) => {
        const val = parseFloat(value) || 0;
        const unit = currentUnit;
        
        if (unit === "metric") {
            if ((val < 20 || val > 250) && value !== "") {
                setError("Weight must be between 20 and 250 kg");
            } else {
                setError(null);
            }
            updateStats({ weight: val });
        } else {
            if ((val < 45 || val > 550) && value !== "") {
                setError("Weight must be between 45 and 550 lbs");
            } else {
                setError(null);
            }
            // Store as KG internally
            const valInKg = convertToKg(val);
            updateStats({ weight: valInKg });
        }
    };

    const displayWeightData = formatWeight(stats.weight, currentUnit === "metric" ? "kg" : "lbs");

    const handleAgeChange = (value: string) => {
        const val = parseInt(value) || 0;
        if ((val < 5 || val > 120) && value !== "") {
            setError("Age must be between 5 and 120");
        } else {
            setError(null);
        }
        updateStats({ age: val });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await uploadImage(file);
            } catch (err) {
                setError(err as string);
            }
        }
    };

    const getInitials = () => {
        if (!stats.name) return "U";
        return stats.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Physical Stats</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Update your metrics for accurate calorie and macro tracking.</p>
                </div>

                <div className="flex items-center">
                    <AnimatePresence mode="wait">
                        {status === "saving" && (
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
                        {status === "saved" && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center space-x-2 text-emerald-500"
                            >
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Changes Saved</span>
                            </motion.div>
                        )}
                        {status === "error" && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center space-x-2 text-red-500"
                            >
                                <AlertCircle size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Error Saving</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center space-x-3 overflow-hidden"
                    >
                        <AlertCircle size={20} />
                        <p className="text-sm font-bold">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-lg group-hover:shadow-emerald-100 dark:group-hover:shadow-none transition-all duration-300">
                                {isUploading ? (
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 size={32} className="animate-spin text-emerald-500 mb-2" />
                                        <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Uploading...</span>
                                    </div>
                                ) : stats.profileImage ? (
                                    <img src={stats.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-3xl font-black">
                                        {getInitials()}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:group-hover:opacity-0"
                            >
                                <Upload className="text-white" size={24} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </div>

                        <div className="text-center space-y-4 w-full">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                                <input 
                                    type="text"
                                    value={stats.name}
                                    onChange={(e) => updateStats({ name: e.target.value })}
                                    className="w-full text-center text-xl font-bold text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 placeholder:text-slate-300"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex-1 py-3 bg-emerald-50 content-center dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Change Photo
                                </button>
                                {stats.profileImage && (
                                    <button 
                                        onClick={removeImage}
                                        disabled={isUploading}
                                        className="p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-500 rounded-[40px] p-8 text-white space-y-4 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold">Why this matters?</h3>
                            <p className="text-emerald-50 text-sm leading-relaxed mt-2">
                                Your biometrics are used to calculate your BMR (Basal Metabolic Rate). Tiny changes in weight or activity level significantly impact your daily calorie budget.
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Activity size={120} />
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-10">
                        {/* Sex Selector */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-slate-400 uppercase tracking-widest text-[10px] font-black">
                                <UserCircle size={14} />
                                <span>Biological Sex</span>
                            </div>
                            <div className="flex p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                {["male", "female", "non-binary"].map((sex) => (
                                    <button
                                        key={sex}
                                        onClick={() => updateStats({ sex: sex as Sex })}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all duration-300 ${
                                            stats.sex === sex 
                                                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        {sex}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Height */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 space-y-4 group">
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <Ruler size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Height</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {currentUnit === "metric" ? (
                                        <div className="flex items-end space-x-1 flex-1">
                                            <input 
                                                type="number"
                                                value={stats.heightCm || 177}
                                                onChange={(e) => handleHeightChange("cm", e.target.value)}
                                                className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                            />
                                            <span className="text-[10px] font-bold text-slate-400 pb-1.5 uppercase">cm</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-end space-x-1 flex-1">
                                                <input 
                                                    type="number"
                                                    value={stats.height?.ft || 5}
                                                    onChange={(e) => handleHeightChange("ft", e.target.value)}
                                                    className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 pb-1.5 uppercase">ft</span>
                                            </div>
                                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                                            <div className="flex items-end space-x-1 flex-1">
                                                <input 
                                                    type="number"
                                                    value={stats.height?.in || 10}
                                                    onChange={(e) => handleHeightChange("in", e.target.value)}
                                                    className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 pb-1.5 uppercase">in</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                 {/* Weight */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 space-y-4 group overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-slate-400">
                                        <Scale size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Weight</span>
                                    </div>
                                    <div className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest cursor-default">
                                        {currentUnit === "metric" ? "kg" : "lbs"}
                                    </div>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <input 
                                        type="number"
                                        step={stats.weightUnit === "kg" ? "0.1" : "1"}
                                        value={displayWeightData.primaryValue || ""}
                                        onChange={(e) => handleWeightChange(e.target.value)}
                                        className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 pb-1.5 uppercase tracking-widest shrink-0">
                                        {currentUnit === "metric" ? "kg" : "lbs"}
                                    </span>
                                </div>
                                <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic">
                                        Equivalent: {displayWeightData.secondary}
                                    </span>
                                </div>
                            </div>
                        </div>

                            {/* Age */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 space-y-4 group">
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <Calendar size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Age</span>
                                </div>
                                <div className="flex items-end space-x-2">
                                    <input 
                                        type="number"
                                        value={stats.age}
                                        onChange={(e) => handleAgeChange(e.target.value)}
                                        className="w-full text-2xl font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                    />
                                    <span className="text-[10px] font-bold text-slate-400 pb-1.5 uppercase tracking-widest">Years</span>
                                </div>
                        {/* Diet Type Selector */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-slate-400 uppercase tracking-widest text-[10px] font-black px-2">
                                <Activity size={14} />
                                <span>Dietary Preference</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {AVAILABLE_DIETS.map((diet) => (
                                    <button
                                        key={diet.id}
                                        onClick={() => updateProfile({ dietType: diet.type as DietType })}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                                            profile?.dietType === diet.type 
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" 
                                                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200"
                                        }`}
                                    >
                                        <p className={`font-black uppercase tracking-tight text-[10px] ${profile?.dietType === diet.type ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                                            {diet.label}
                                        </p>
                                        {profile?.dietType === diet.type && (
                                            <div className="absolute top-2 right-2 text-emerald-500">
                                                <CheckCircle2 size={12} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Body Fat Selector */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-slate-400 uppercase tracking-widest text-[10px] font-black px-2">
                                <Activity size={14} />
                                <span>Estimated Body Fat</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {BODY_FAT_LEVELS.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => updateStats({ bodyFat: level.id as BodyFatLevel })}
                                        className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                                            stats.bodyFat === level.id 
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" 
                                                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-200"
                                        }`}
                                    >
                                        <p className={`font-black uppercase tracking-tight text-xs ${stats.bodyFat === level.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}>
                                            {level.label}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">{level.range}</p>
                                        {stats.bodyFat === level.id && (
                                            <motion.div 
                                                layoutId="body-fat-check"
                                                className="absolute top-2 right-2 text-emerald-500"
                                            >
                                                <CheckCircle2 size={14} />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activity Level Dropdown */}
                        <div className="space-y-4 relative">
                            <div className="flex items-center space-x-2 text-slate-400 uppercase tracking-widest text-[10px] font-black px-2">
                                <Activity size={14} />
                                <span>Workout Activity Level</span>
                            </div>
                            
                            <button 
                                onClick={() => setIsActivityOpen(!isActivityOpen)}
                                className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-left hover:border-emerald-500 transition-all group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-2xl shadow-sm">
                                        {ACTIVITY_LEVELS.find(l => l.id === stats.activityLevel)?.icon}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {ACTIVITY_LEVELS.find(l => l.id === stats.activityLevel)?.name}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium leading-none mt-1">
                                            {ACTIVITY_LEVELS.find(l => l.id === stats.activityLevel)?.desc}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown 
                                    className={`text-slate-400 group-hover:text-emerald-500 transition-transform duration-300 ${isActivityOpen ? "rotate-180" : ""}`} 
                                    size={20} 
                                />
                            </button>

                            <AnimatePresence>
                                {isActivityOpen && (
                                    <>
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsActivityOpen(false)}
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                                        >
                                            <div className="p-2 space-y-1">
                                                {ACTIVITY_LEVELS.map((level) => (
                                                    <button
                                                        key={level.id}
                                                        onClick={() => {
                                                            updateStats({ activityLevel: level.id as ActivityLevelId });
                                                            setIsActivityOpen(false);
                                                        }}
                                                        className={`w-full flex items-center p-4 rounded-2xl transition-all ${
                                                            stats.activityLevel === level.id 
                                                                ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800" 
                                                                : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                                        }`}
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-xl mr-4">
                                                            {level.icon}
                                                        </div>
                                                        <div className="text-left flex-1">
                                                            <p className={`font-bold uppercase tracking-tight text-xs ${stats.activityLevel === level.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                                                                {level.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{level.desc}</p>
                                                        </div>
                                                        {stats.activityLevel === level.id && (
                                                            <CheckCircle2 size={16} className="text-emerald-500 ml-2" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Legend */}
            <div className="text-center pb-12">
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Your data is stored locally and never shared with third parties.
                </p>
            </div>
        </div>
    );
}
