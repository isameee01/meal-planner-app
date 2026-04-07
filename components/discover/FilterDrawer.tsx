"use client";

import { useState } from "react";
import { X, Search, RotateCcw, ChevronRight, Ban, Activity, Utensils, Tag, Layers, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterState, INITIAL_FILTERS } from "../../lib/hooks/useDiscover";
import { FoodCategory, MealType } from "../../lib/discover-db";

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    setFilters: (filters: Partial<FilterState>) => void;
    onReset: () => void;
    collections: { id: string; name: string }[];
}

export default function FilterDrawer({ isOpen, onClose, filters, setFilters, onReset, collections }: FilterDrawerProps) {
    const categories: FoodCategory[] = ["protein", "carb", "fat", "veggie", "smoothie", "snack", "recipe", "branded", "restaurant"];
    const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack", "dessert"];
    const focusChips = ["High Protein", "Low Carb", "Low Fat", "High Fiber", "Low Sodium", "Keto", "Vegan", "Paleo"];

    const toggleArrayFilter = (key: keyof FilterState, value: any) => {
        const current = filters[key] as any[];
        const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
        setFilters({ [key]: next });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-950 shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
                                    <Filter size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Filters</h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <X size={24} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-hide">
                            
                            {/* Excluded Foods */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                                    <Ban size={18} className="text-red-500" />
                                    <h3 className="font-bold">Excluded Foods</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <div className="w-full relative mb-3">
                                        <input 
                                            type="text" 
                                            placeholder="Add food to exclude..."
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    if (val) toggleArrayFilter("excludedFoods", val);
                                                    (e.target as HTMLInputElement).value = "";
                                                }
                                            }}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {filters.excludedFoods.map(food => (
                                            <motion.span 
                                                key={food}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                                className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/30"
                                            >
                                                {food}
                                                <button onClick={() => toggleArrayFilter("excludedFoods", food)}>
                                                    <X size={14} />
                                                </button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>

                            {/* Nutrition Focus */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                                    <Activity size={18} className="text-emerald-500" />
                                    <h3 className="font-bold">Nutrition Focus</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {focusChips.map(chip => (
                                        <button 
                                            key={chip}
                                            onClick={() => toggleArrayFilter("nutritionFocus", chip)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                filters.nutritionFocus.includes(chip) 
                                                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200" 
                                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                                            }`}
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Meal Type */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                                    <Utensils size={18} className="text-amber-500" />
                                    <h3 className="font-bold">Meal Type</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {mealTypes.map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => toggleArrayFilter("mealTypes", type)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border capitalize ${
                                                filters.mealTypes.includes(type) 
                                                    ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200" 
                                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-500"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Categories */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                                    <Tag size={18} className="text-blue-500" />
                                    <h3 className="font-bold">Categories</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={filters.categories.includes(cat)}
                                                onChange={() => toggleArrayFilter("categories", cat)}
                                                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                                            />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </section>

                            {/* Collections */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                                    <Layers size={18} className="text-purple-500" />
                                    <h3 className="font-bold">Collections</h3>
                                </div>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setFilters({ onlyCollections: !filters.onlyCollections })}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                            filters.onlyCollections ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 text-purple-700" : "bg-white dark:bg-slate-900 border-slate-200 text-slate-600 hover:border-purple-500"
                                        }`}
                                    >
                                        <span className="text-sm font-medium italic">Show all collections</span>
                                        <ChevronRight size={16} />
                                    </button>
                                    {collections.length > 0 ? (
                                        collections.map(col => (
                                            <button 
                                                key={col.id} 
                                                onClick={() => setFilters({ selectedCollectionId: filters.selectedCollectionId === col.id ? null : col.id, onlyCollections: false })}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                                                    filters.selectedCollectionId === col.id 
                                                        ? "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-200" 
                                                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                                                }`}
                                            >
                                                <span className="text-sm font-bold">{col.name}</span>
                                                <Tag size={14} className={filters.selectedCollectionId === col.id ? "text-white" : "opacity-50"} />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center">
                                            <Layers size={32} className="text-slate-300 mb-3 opacity-20" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No collections created</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Nutrition Sliders */}
                            <section>
                                <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                                    <BarChart3 size={18} className="text-emerald-500" />
                                    <h3 className="font-bold">Nutrition per Serving</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-slate-500">Calories</span>
                                            <span className="text-emerald-600">{filters.minCalories}-{filters.maxCalories} kcal</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="2000" 
                                            step="50"
                                            value={filters.maxCalories}
                                            onChange={(e) => setFilters({ maxCalories: parseInt(e.target.value) })}
                                            className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full outline-none"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-slate-500">Protein</span>
                                            <span className="text-blue-600">Max {filters.maxProtein}g</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="200" 
                                            step="5"
                                            value={filters.maxProtein}
                                            onChange={(e) => setFilters({ maxProtein: parseInt(e.target.value) })}
                                            className="w-full accent-blue-500 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-4">
                            <button 
                                onClick={onReset}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            >
                                <RotateCcw size={18} />
                                <span>Reset</span>
                            </button>
                            <button 
                                onClick={onClose}
                                className="flex-[2] px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/20 transition-all"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function Filter(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    )
}
