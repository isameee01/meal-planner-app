"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import Header from "../../../../components/dashboard/Header";
import ClientOnly from "../../../../components/common/ClientOnly";
import { useNutritionTargets } from "../../../../lib/hooks/useNutritionTargets";
import { NutritionTarget, CreateNutritionTargetInput } from "../../../../types/nutrition";
import { Target, Plus, X, Activity, Droplets, Beef, Wheat, Save, Sparkles, Trash2, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DualSlider } from "../../../../components/common/DualSlider";
import { generateTargetFromProfile } from "../../../../lib/hooks/useNutritionTargets";

function MacroCard({ target, onEdit, onDelete }: { target: NutritionTarget, onEdit: () => void, onDelete: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{target.name}</h3>
                    <div className="flex items-center text-emerald-500 font-semibold mt-1 space-x-1">
                        <Activity size={16} />
                        <span>{target.calories} kcal/day</span>
                    </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this target?')) onDelete(); }} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-600 dark:text-amber-500 flex items-center"><Wheat size={12} className="mr-1"/> Carbs</span>
                        <span className="text-slate-500">{target.carbsMin}% - {target.carbsMax}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                        <div className="absolute h-full bg-amber-400 rounded-full" style={{ left: `${target.carbsMin}%`, width: `${target.carbsMax - target.carbsMin}%` }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-teal-600 dark:text-teal-500 flex items-center"><Droplets size={12} className="mr-1"/> Fats</span>
                        <span className="text-slate-500">{target.fatsMin}% - {target.fatsMax}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                        <div className="absolute h-full bg-teal-400 rounded-full" style={{ left: `${target.fatsMin}%`, width: `${target.fatsMax - target.fatsMin}%` }} />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-purple-600 dark:text-purple-500 flex items-center"><Beef size={12} className="mr-1"/> Protein</span>
                        <span className="text-slate-500">{target.proteinMin}% - {target.proteinMax}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                        <div className="absolute h-full bg-purple-400 rounded-full" style={{ left: `${target.proteinMin}%`, width: `${target.proteinMax - target.proteinMin}%` }} />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fiber</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{target.fiber}g</p>
                </div>
                <div className="text-center border-l items-center border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sodium</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{target.sodium}mg</p>
                </div>
                <div className="text-center border-l items-center border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cholest.</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{target.cholesterol}mg</p>
                </div>
            </div>
        </motion.div>
    );
}

const DEFAULT_TARGET: CreateNutritionTargetInput = {
    name: "Maintenance Day",
    calories: 2000,
    carbsMin: 40,
    carbsMax: 60,
    fatsMin: 20,
    fatsMax: 35,
    proteinMin: 15,
    proteinMax: 30,
    fiber: 30,
    sodium: 2300,
    cholesterol: 300
};

export default function MacronutrientsPage() {
    const { theme, setTheme } = useTheme();
    const { targets, isLoaded, addTarget, updateTarget, deleteTarget } = useNutritionTargets();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateNutritionTargetInput>(DEFAULT_TARGET);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [suggestionData, setSuggestionData] = useState<NutritionTarget | null>(null);

    const openCreateModal = () => {
        setFormData(DEFAULT_TARGET);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (target: NutritionTarget) => {
        const { id, createdAt, ...data } = target;
        setFormData(data);
        setEditingId(target.id);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name) return alert("Please provide a name.");
        if (editingId) {
            updateTarget(editingId, formData);
        } else {
            addTarget(formData);
        }
        setIsModalOpen(false);
    };

    const openSuggestions = () => {
        const generated = generateTargetFromProfile();
        setSuggestionData(generated);
        setIsSuggestionModalOpen(true);
    };

    const acceptSuggestions = () => {
        if (suggestionData) {
            setFormData({
                name: "AI Suggested Protocol",
                calories: suggestionData.calories,
                carbsMin: suggestionData.carbsMin,
                carbsMax: suggestionData.carbsMax,
                fatsMin: suggestionData.fatsMin,
                fatsMax: suggestionData.fatsMax,
                proteinMin: suggestionData.proteinMin,
                proteinMax: suggestionData.proteinMax,
                fiber: suggestionData.fiber,
                sodium: suggestionData.sodium,
                cholesterol: suggestionData.cholesterol
            });
            setIsSuggestionModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col min-w-0 h-full bg-slate-50 dark:bg-slate-900/50">
            <Header theme={theme} onThemeChange={setTheme} />
            
            <ClientOnly 
                fallback={
                    <div className="max-w-6xl mx-auto p-4 sm:p-8 flex justify-center mt-20">
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-800 w-32 h-32 rounded-3xl" />
                    </div>
                }
            >
                <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 w-full pb-24">
                    <div className="flex justify-between items-end mb-8">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                <Target size={14} className="text-emerald-500" />
                                <span>Diet & Nutrition</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nutrition Targets</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Manage your daily caloric targets and macronutrient distributions. Set specific guidelines to fine-tune your meal generator automatically.
                            </p>
                        </div>
                        <button 
                            onClick={openCreateModal}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                            <Plus size={20} className="mr-2" />
                            New Target
                        </button>
                    </div>

                    {!isLoaded ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {targets.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center"
                                >
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Activity size={32} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No targets found</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                        Create your first nutrition target to steer the meal planner towards your fitness goals.
                                    </p>
                                    <button 
                                        onClick={openCreateModal}
                                        className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-6 py-3 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                    >
                                        Create First Target
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {targets.map(target => (
                                        <MacroCard 
                                            key={target.id} 
                                            target={target} 
                                            onEdit={() => openEditModal(target)}
                                            onDelete={() => deleteTarget(target.id)}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </ClientOnly>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
                        >
                            <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center z-20">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {editingId ? "Edit Target" : "New Target"}
                                    </h2>
                                    <p className="text-sm text-slate-500">Configure your daily nutrient allocations</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Name</label>
                                        <button 
                                            onClick={openSuggestions}
                                            className="text-xs font-bold flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                        >
                                            <Sparkles size={14} className="mr-1.5" />
                                            View Suggestions
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-900 dark:text-white"
                                        placeholder="e.g., Training Day, Rest Day..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Daily Calories (kcal)</label>
                                    <input 
                                        type="number" 
                                        value={formData.calories}
                                        onChange={(e) => setFormData(prev => ({ ...prev, calories: Number(e.target.value) }))}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-xl font-bold text-emerald-600 dark:text-emerald-400"
                                    />
                                </div>

                                <div className="space-y-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                                        Macronutrient Ranges (%)
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                                            <div className="flex justify-between items-center mb-4 text-amber-700 dark:text-amber-500">
                                                <span className="font-bold flex items-center"><Wheat size={18} className="mr-2"/> Carbohydrates</span>
                                                <span className="font-mono font-semibold">{formData.carbsMin}% - {formData.carbsMax}%</span>
                                            </div>
                                            <DualSlider 
                                                min={0} max={100} 
                                                value={[formData.carbsMin, formData.carbsMax]}
                                                onChange={(val) => setFormData(prev => ({ ...prev, carbsMin: val[0], carbsMax: val[1] }))}
                                                colorClass="bg-amber-400 text-amber-500"
                                            />
                                        </div>

                                        <div className="bg-teal-50 dark:bg-teal-900/10 p-5 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                                            <div className="flex justify-between items-center mb-4 text-teal-700 dark:text-teal-500">
                                                <span className="font-bold flex items-center"><Droplets size={18} className="mr-2"/> Fats</span>
                                                <span className="font-mono font-semibold">{formData.fatsMin}% - {formData.fatsMax}%</span>
                                            </div>
                                            <DualSlider 
                                                min={0} max={100} 
                                                value={[formData.fatsMin, formData.fatsMax]}
                                                onChange={(val) => setFormData(prev => ({ ...prev, fatsMin: val[0], fatsMax: val[1] }))}
                                                colorClass="bg-teal-400 text-teal-500"
                                            />
                                        </div>

                                        <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                                            <div className="flex justify-between items-center mb-4 text-purple-700 dark:text-purple-500">
                                                <span className="font-bold flex items-center"><Beef size={18} className="mr-2"/> Protein</span>
                                                <span className="font-mono font-semibold">{formData.proteinMin}% - {formData.proteinMax}%</span>
                                            </div>
                                            <DualSlider 
                                                min={0} max={100} 
                                                value={[formData.proteinMin, formData.proteinMax]}
                                                onChange={(val) => setFormData(prev => ({ ...prev, proteinMin: val[0], proteinMax: val[1] }))}
                                                colorClass="bg-purple-400 text-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Additional Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">Fiber (g)</label>
                                            <input 
                                                type="number" 
                                                value={formData.fiber}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fiber: Number(e.target.value) }))}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">Track Sodium</label>
                                            <button 
                                                onClick={() => setFormData(prev => ({ ...prev, sodium: prev.sodium > 0 ? 0 : 2300 }))}
                                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${formData.sodium > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                                            >
                                                {formData.sodium > 0 ? 'Enabled (2300mg)' : 'Disabled'}
                                            </button>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-2 block">Track Cholesterol</label>
                                            <button 
                                                onClick={() => setFormData(prev => ({ ...prev, cholesterol: prev.cholesterol > 0 ? 0 : 300 }))}
                                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${formData.cholesterol > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                                            >
                                                {formData.cholesterol > 0 ? 'Enabled (300mg)' : 'Disabled'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-900 rounded-b-3xl">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    <Save size={18} className="mr-2" />
                                    Save Target
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSuggestionModalOpen && suggestionData && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSuggestionModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl relative z-20 w-full max-w-md border border-slate-200 dark:border-slate-800 p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                <Sparkles size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Smart Suggestion</h2>
                            <p className="text-slate-500 mb-6 font-medium">We calculated this optimal nutrition profile based on your current physical stats.</p>
                            
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-left space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                                    <span className="font-bold text-slate-600 dark:text-slate-400">Calories</span>
                                    <span className="text-lg font-black text-emerald-500">{suggestionData.calories} kcal</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-amber-500 flex items-center"><Wheat size={14} className="mr-1"/> Carbs</span>
                                    <span className="font-mono text-slate-600 dark:text-slate-400">{suggestionData.carbsMin}% - {suggestionData.carbsMax}%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-teal-500 flex items-center"><Droplets size={14} className="mr-1"/> Fats</span>
                                    <span className="font-mono text-slate-600 dark:text-slate-400">{suggestionData.fatsMin}% - {suggestionData.fatsMax}%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-purple-500 flex items-center"><Beef size={14} className="mr-1"/> Protein</span>
                                    <span className="font-mono text-slate-600 dark:text-slate-400">{suggestionData.proteinMin}% - {suggestionData.proteinMax}%</span>
                                </div>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button 
                                    onClick={() => setIsSuggestionModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button 
                                    onClick={acceptSuggestions}
                                    className="flex-1 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                >
                                    Accept
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
