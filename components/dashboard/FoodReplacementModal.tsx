"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Search, 
    ArrowRight, 
    Check, 
    Flame, 
    Scale,
    TrendingUp,
    TrendingDown,
    Plus,
    Filter
} from "lucide-react";
import { FOOD_DATABASE, FoodItem } from "../../lib/food-db";

interface FoodReplacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFood: FoodItem;
    onReplace: (newFood: FoodItem) => void;
}

export const FoodReplacementModal = ({ isOpen, onClose, currentFood, onReplace }: FoodReplacementModalProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

    const categories = ["all", ...new Set(FOOD_DATABASE.map(f => f.category))];

    const results = useMemo(() => {
        return FOOD_DATABASE.filter(f => {
            const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "all" || f.category === selectedCategory;
            // Don't suggest the same food
            const isNotOriginal = f.id !== currentFood.id;
            return matchesSearch && matchesCategory && isNotOriginal;
        }).sort((a,b) => {
            // Sort by macro similarity or category match
            if (a.category === currentFood.category && b.category !== currentFood.category) return -1;
            if (b.category === currentFood.category && a.category !== currentFood.category) return 1;
            return 0;
        });
    }, [searchQuery, selectedCategory, currentFood]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight italic">
                                    Strategic Swap <TrendingUp size={24} className="inline ml-2 text-emerald-500" />
                                </h3>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                    Replacing: <span className="text-emerald-500">{currentFood.name}</span>
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex space-x-3">
                            <div className="relative flex-1 group">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search alternatives..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 transition-all uppercase tracking-wide"
                                />
                            </div>
                            <div className="relative group">
                                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                                >
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {results.map((food) => (
                            <motion.button 
                                key={food.id}
                                whileHover={{ scale: 1.01, x: 5 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => onReplace(food)}
                                className="w-full text-left p-5 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 hover:border-emerald-500/50 hover:shadow-xl transition-all duration-300 group flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        {food.category === "protein" ? "🍗" : food.category === "carb" ? "🍚" : "🥑"}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                                            {food.name}
                                        </h4>
                                        <div className="flex items-center space-x-3 mt-1.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{food.category}</span>
                                            <span className="w-1 h-1 bg-slate-200 dark:bg-slate-600 rounded-full" />
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{food.calories} kcal / {food.serving}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Macro Comparison */}
                                <div className="flex items-center space-x-4">
                                    <div className="hidden md:flex flex-col items-end">
                                        <MacroDiff label="P" current={currentFood.protein} next={food.protein} />
                                        <MacroDiff label="C" current={currentFood.carbs} next={food.carbs} />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <Plus size={20} />
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                            Macro-Similarity Sorting Active • Choose a replacement that fits your profile
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const MacroDiff = ({ label, current, next }: { label: string, current: number, next: number }) => {
    const diff = next - current;
    const isMore = diff > 0;
    
    return (
        <div className="flex items-center space-x-2">
            <span className="text-[8px] font-black text-slate-400 uppercase">{label}</span>
            <span className={`text-[10px] font-black ${diff === 0 ? "text-slate-400" : isMore ? "text-blue-500" : "text-amber-500"}`}>
                {diff === 0 ? "" : (isMore ? "+" : "")}
                {diff.toFixed(0)}g
            </span>
            {diff !== 0 && (
                isMore ? <TrendingUp size={10} className="text-blue-500" /> : <TrendingDown size={10} className="text-amber-500" />
            )}
        </div>
    );
};
