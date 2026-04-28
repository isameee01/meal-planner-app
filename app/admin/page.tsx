"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Save, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AIAdminPage() {
    const settings = useAdminSettings();
    const [aiModel, setAiModel] = useState("");
    const [mealPrompt, setMealPrompt] = useState("");
    const [recipePrompt, setRecipePrompt] = useState("");
    
    // Feature Toggles
    const [enableMealGen, setEnableMealGen] = useState(true);
    const [enableRecipeGen, setEnableRecipeGen] = useState(true);
    const [enableRebalance, setEnableRebalance] = useState(true);
    
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

    // Sync from hook to local state
    useEffect(() => {
        if (settings) {
            setAiModel(settings.ai_model || "");
            setMealPrompt(settings.meal_prompt || "");
            setRecipePrompt(settings.recipe_prompt || "");
            
            // It's possible the boolean is false, so we specifically check for boolean type or default to true
            setEnableMealGen(settings.enable_meal_generation !== false);
            setEnableRecipeGen(settings.enable_recipe_generation !== false);
            setEnableRebalance(settings.enable_rebalance !== false);
        }
    }, [settings]);

    const handleSave = async () => {
        if (!settings?.id) return;
        
        setIsSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('admin_settings')
                .update({
                    ai_model: aiModel,
                    meal_prompt: mealPrompt,
                    recipe_prompt: recipePrompt,
                    enable_meal_generation: enableMealGen,
                    enable_recipe_generation: enableRecipeGen,
                    enable_rebalance: enableRebalance
                })
                .eq('id', settings.id);

            if (error) throw error;
            setMessage({ type: "success", text: "AI Settings saved successfully." });
            
            // Auto hide success message
            setTimeout(() => {
                setMessage(null);
            }, 3000);
        } catch (error: any) {
            console.error("Save error:", error);
            setMessage({ type: "error", text: error.message || "Failed to save settings. Check your connection or permissions." });
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings && !isSaving && !message) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Connecting to DB...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                    <Sparkles className="mr-3 text-emerald-500" />
                    AI Engine Configuration
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Control global prompts, inference models, and LLM behavior for the entire platform dynamically.
                </p>
            </div>

            {message && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-8 rounded-xl flex items-center shadow-lg ${
                        message.type === 'success' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    )}
                    <span className="font-bold text-sm tracking-wide">{message.text}</span>
                </motion.div>
            )}

            <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6">
                    <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">Core Connection</h2>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Primary LLM Model</label>
                        <input 
                            type="text" 
                            value={aiModel} 
                            onChange={(e) => setAiModel(e.target.value)}
                            placeholder="e.g. gpt-4o, llama-3.3-70b-versatile, claude-3-opus-20240229..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all px-4 py-3 rounded-xl focus:outline-none text-sm font-bold shadow-inner text-slate-900 dark:text-slate-100"
                        />
                        <p className="text-[10px] uppercase font-bold text-slate-400 pl-1">Must be compatible with deployed integration provider</p>
                    </div>
                </div>

                {/* Feature Controls */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-6">
                    <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">Feature Control</h2>
                    
                    <div className="space-y-4">
                        <ToggleRow 
                            label="Meal Generator Engine" 
                            description="Allow AI generation of daily and weekly meal plans." 
                            active={enableMealGen} 
                            onToggle={() => setEnableMealGen(!enableMealGen)} 
                        />
                        <div className="border-t border-slate-100 dark:border-slate-800" />
                        <ToggleRow 
                            label="Recipe Synthesis" 
                            description="Allow AI to generate custom cooking recipes and ingredient lists." 
                            active={enableRecipeGen} 
                            onToggle={() => setEnableRecipeGen(!enableRecipeGen)} 
                        />
                        <div className="border-t border-slate-100 dark:border-slate-800" />
                        <ToggleRow 
                            label="Dynamic Rebalancing" 
                            description="Allow AI to adjust existing meals dynamically." 
                            active={enableRebalance} 
                            onToggle={() => setEnableRebalance(!enableRebalance)} 
                        />
                    </div>
                </div>

                {/* Prompt Controls */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none space-y-8">
                    <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Master Directives</h2>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                            <span>Meal Generator System Prompt</span>
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 hidden sm:inline-block">System Level Baseline</span>
                        </label>
                        <textarea 
                            value={mealPrompt} 
                            onChange={(e) => setMealPrompt(e.target.value)}
                            rows={6}
                            placeholder="You are an expert AI Nutritionist..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all px-4 py-3 rounded-xl focus:outline-none text-sm font-medium resize-y shadow-inner text-slate-900 dark:text-slate-100 font-mono leading-relaxed"
                        />
                    </div>

                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-8">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                            <span>Recipe Synthesizer System Prompt</span>
                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 hidden sm:inline-block">System Level Baseline</span>
                        </label>
                        <textarea 
                            value={recipePrompt} 
                            onChange={(e) => setRecipePrompt(e.target.value)}
                            rows={6}
                            placeholder="You are a master chef. Generate a professional recipe..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all px-4 py-3 rounded-xl focus:outline-none text-sm font-medium resize-y shadow-inner text-slate-900 dark:text-slate-100 font-mono leading-relaxed"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-12">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !settings}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:grayscale w-full sm:w-auto"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                <span>Applying...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-3" />
                                <span>Force Update Engine</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ToggleRow({ label, description, active, onToggle }: { label: string, description: string, active: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">{description}</p>
            </div>
            <button 
                onClick={onToggle}
                className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
                <motion.div 
                    initial={false}
                    animate={{ x: active ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
            </button>
        </div>
    );
}
