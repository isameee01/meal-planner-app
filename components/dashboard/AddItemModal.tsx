"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Flame, Activity, Zap, Droplets, AlertCircle } from "lucide-react";
import { FOOD_DATABASE } from "../../lib/food-db";

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (food: any, rebalance: boolean) => void;
    slot: string;
    targetCalories: number;
    currentCalories: number;
    userData: any;
    enableRebalance?: boolean;
}

export const AddItemModal = ({ isOpen, onClose, onAdd, slot, targetCalories, currentCalories, enableRebalance = true }: AddItemModalProps) => {
    const [search, setSearch] = useState("");
    const [selectedFood, setSelectedFood] = useState<any>(null);

    const filteredFoods = useMemo(() => {
        if (!search) return FOOD_DATABASE.slice(0, 5);
        return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10);
    }, [search]);

    const budgetRemaining = targetCalories - currentCalories;
    const isOverBudget = selectedFood ? (selectedFood.calories > budgetRemaining) : false;
    const isMajorImpact = selectedFood ? (selectedFood.calories > targetCalories * 0.15) : false;
    const isMacroImbalance = selectedFood ? (selectedFood.fat > selectedFood.protein + 10) : false;
    const isUnderTarget = selectedFood ? (currentCalories + selectedFood.calories < targetCalories * 0.8) : false;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic">Inject Nutrition</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Adding to {slot}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="Search ingredients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        />
                    </div>

                    {!selectedFood ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredFoods.map(food => (
                                <button 
                                    key={food.id}
                                    onClick={() => setSelectedFood(food)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-2xl group transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900"
                                >
                                    <div className="flex items-center space-x-4 text-left">
                                        <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-lg">{food.category === "protein" ? "🍗" : "🍚"}</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 dark:text-white uppercase">{food.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{food.calories} kcal • {food.serving}</p>
                                        </div>
                                    </div>
                                    <Plus size={18} className="text-slate-300 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            {/* Selected Card */}
                            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-[2rem] space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedFood.name}</h4>
                                    <button onClick={() => setSelectedFood(null)} className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase hover:underline">Change</button>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <Stat mini label="kCal" value={selectedFood.calories} color="text-amber-500" />
                                    <Stat mini label="Prot" value={selectedFood.protein} color="text-blue-500" />
                                    <Stat mini label="Carb" value={selectedFood.carbs} color="text-emerald-500" />
                                    <Stat mini label="Fat" value={selectedFood.fat} color="text-rose-500" />
                                </div>
                            </div>

                            {/* Logic Section */}
                            {(isOverBudget || isMajorImpact || isMacroImbalance || isUnderTarget) ? (
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="text-amber-500 mt-1" size={20} />
                                        <div>
                                            <h5 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">
                                                {isOverBudget ? "Daily Budget Alert" : isUnderTarget ? "Nutritional Deficit" : "Composition Warning"}
                                            </h5>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1 leading-relaxed">
                                                {isOverBudget 
                                                    ? `This pushes you ${Math.abs(budgetRemaining - selectedFood.calories)} kcal over your target.` 
                                                    : isUnderTarget 
                                                    ? "Adding this item still leaves you significantly below your target intake."
                                                    : "This item has a high fat-to-protein ratio. Rebalancing is recommended."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <button 
                                            onClick={() => onAdd(selectedFood, false)}
                                            className="py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            Add Anyway
                                        </button>
                                        <button 
                                            onClick={() => onAdd(selectedFood, true)}
                                            disabled={!enableRebalance}
                                            className="py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                        >
                                            <Zap size={14} className="fill-white" />
                                            {enableRebalance ? "Add & Rebalance" : "Rebalance Disabled"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => onAdd(selectedFood, false)}
                                    className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                >
                                    Confirm Addition
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const Stat = ({ label, value, color, mini }: { label: string, value: any, color: string, mini?: boolean }) => (
    <div className="text-center">
        <p className={`${mini ? 'text-[8px]' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-widest leading-none mb-1`}>{label}</p>
        <p className={`${mini ? 'text-sm' : 'text-xl'} font-black ${color} tracking-tight`}>{value}</p>
    </div>
);
