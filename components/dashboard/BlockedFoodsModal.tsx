"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Ban, ShieldCheck, Plus, Filter, FilterX, ChevronRight, Hash, Flame, Leaf, Zap, AlertCircle } from "lucide-react";
import { FULL_DISCOVER_DATABASE, FoodItem, FoodCategory, MealType } from "../../lib/discover-db";
import { useBlockedFoods } from "../../lib/hooks/useBlockedFoods";
import { useDebounce } from "../../lib/hooks/useDebounce";

interface BlockedFoodsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ActiveFilters {
    nutrition: string[];
    mealType: string[];
    categories: string[];
}

export default function BlockedFoodsModal({ isOpen, onClose }: BlockedFoodsModalProps) {
    const { blockedFoods, isBlocked, toggleBlockFood } = useBlockedFoods();
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);

    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        nutrition: [],
        mealType: [],
        categories: []
    });

    const normalize = (str: string) => str?.toLowerCase().trim() || "";

    const nutritionMap: Record<string, string> = {
        "High Protein": "protein",
        "Low Carb": "low carb",
        "Low Fat": "fat",
        "High Fiber": "fiber",
        "Low Sodium": "sodium"
    };

    const toggleFilter = (type: keyof ActiveFilters, value: string) => {
        setActiveFilters(prev => {
            const exists = prev[type].includes(value);
            return {
                ...prev,
                [type]: exists
                    ? prev[type].filter(v => v !== value)
                    : [...prev[type], value]
            };
        });
    };

    const clearFilters = () => {
        setActiveFilters({
            nutrition: [],
            mealType: [],
            categories: []
        });
        setSearchQuery("");
    };

    const isFiltered = activeFilters.nutrition.length > 0 || 
                       activeFilters.mealType.length > 0 || 
                       activeFilters.categories.length > 0 || 
                       searchQuery !== "";

    const filteredFoods = useMemo(() => {
        const results = FULL_DISCOVER_DATABASE
            // 🔍 SEARCH FILTER
            .filter(food =>
                normalize(food.name).includes(normalize(searchQuery))
            )

            // 🧠 NUTRITION FILTER (Mapped to database tags)
            .filter(food => {
                if (activeFilters.nutrition.length === 0) return true;

                return activeFilters.nutrition.some(filter => {
                    const mapped = normalize(nutritionMap[filter] || filter);
                    return food.tags?.some(tag =>
                        normalize(tag).includes(mapped)
                    );
                });
            })

            // 🍽 MEAL TYPE FILTER (Array-aware inclusion)
            .filter(food => {
                if (activeFilters.mealType.length === 0) return true;

                return activeFilters.mealType.some(type =>
                    food.mealTypes.some(mt => normalize(mt) === normalize(type))
                );
            })

            // 📦 CATEGORY FILTER (Mapped to database schema)
            .filter(food => {
                if (activeFilters.categories.length === 0) return true;

                return activeFilters.categories.some(selected => {
                    const catMap: Record<string, FoodCategory[]> = {
                        "Foods": ["protein", "carb", "fat", "veggie", "smoothie", "snack"],
                        "Recipes": ["recipe"],
                        "Branded Foods": ["branded", "restaurant"],
                        "Custom Foods": ["custom"]
                    };
                    const mappedCats = catMap[selected] || [selected as FoodCategory];
                    return mappedCats.includes(food.category);
                });
            });

        console.log("Filtered Results:", results.length);
        return results;
    }, [searchQuery, activeFilters]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                    />

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative bg-white dark:bg-slate-950 w-full max-w-6xl h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-red-500 rounded-2xl text-white shadow-xl shadow-red-500/20">
                                    <Ban size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Block Foods</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Global Restriction Engine</p>
                                </div>
                            </div>

                            <button 
                                onClick={onClose}
                                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                            >
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Main Body */}
                        <div className="flex-1 flex flex-row overflow-hidden min-h-0">
                            {/* Left Side: Results (Filtered) */}
                            <div className="flex-[1.5] min-w-0 flex flex-col border-r border-slate-100 dark:border-slate-800">
                                <div className="p-6 border-b border-slate-50 dark:border-slate-900">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            autoFocus
                                            placeholder="Search food..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                                    <div className="grid grid-cols-1 gap-3">
                                        <AnimatePresence mode="popLayout">
                                            {filteredFoods.length === 0 ? (
                                                <motion.div 
                                                    initial={{ opacity: 0 }} 
                                                    animate={{ opacity: 1 }}
                                                    className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4"
                                                >
                                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800">
                                                        <Search size={40} className="opacity-20" />
                                                    </div>
                                                    <p className="font-bold text-slate-900 dark:text-white">No results found</p>
                                                </motion.div>
                                            ) : (
                                                filteredFoods.map(food => {
                                                    const blocked = isBlocked(food.name);
                                                    return (
                                                        <motion.div 
                                                            layout
                                                            key={food.id}
                                                            initial={{ opacity: 0, scale: 0.98 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <img src={food.image} className="w-10 h-10 rounded-lg object-cover" alt={food.name} />
                                                                <div>
                                                                    <p className="font-bold text-slate-900 dark:text-white capitalize">{food.name}</p>
                                                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{food.category}</p>
                                                                </div>
                                                            </div>

                                                            <button 
                                                                onClick={() => toggleBlockFood(food.name)}
                                                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 ${
                                                                    blocked 
                                                                        ? "bg-red-500 text-white" 
                                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
                                                                }`}
                                                            >
                                                                {blocked ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <ShieldCheck size={14} />
                                                                        <span>Blocked</span>
                                                                    </div>
                                                                ) : "+"}
                                                            </button>
                                                        </motion.div>
                                                    );
                                                })
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Filters (debug enabled) */}
                            <div className="flex flex-1 min-w-[300px] flex-col bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto p-8 border-l border-slate-100 dark:border-slate-800">
                                <div className="bg-red-100 p-4 mb-6 rounded-xl border-2 border-red-200">
                                    <h2 className="text-red-800 font-black flex items-center gap-2">
                                        <ShieldCheck size={18} />
                                        FILTER PANEL ACTIVE
                                    </h2>
                                </div>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic underline decoration-red-500 decoration-4 underline-offset-8">Filters</h3>
                                    <button 
                                        onClick={clearFilters}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Nutrition Focus Section */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Zap size={14} className="text-blue-500" />
                                            Nutrition Focus
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {["High Protein","Low Carb","Low Fat","High Fiber","Low Sodium"].map(item => (
                                                <button 
                                                    key={item}
                                                    onClick={() => toggleFilter("nutrition", item)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                        activeFilters.nutrition.includes(item)
                                                            ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-blue-500"
                                                    }`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Meal Type Section */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Leaf size={14} className="text-emerald-500" />
                                            Meal Type
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {["Breakfast","Lunch","Dinner","Snack","Dessert"].map(item => (
                                                <button 
                                                    key={item}
                                                    onClick={() => toggleFilter("mealType", item)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                        activeFilters.mealType.includes(item)
                                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                                                    }`}
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Categories Section */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Hash size={14} className="text-orange-500" />
                                            Categories
                                        </p>
                                        <div className="space-y-3">
                                            {["Foods","Recipes","Branded Foods","Custom Foods"].map(item => (
                                                <label 
                                                    key={item} 
                                                    className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                                >
                                                    <div className="relative flex items-center">
                                                        <input 
                                                            type="checkbox"
                                                            checked={activeFilters.categories.includes(item)}
                                                            onChange={() => toggleFilter("categories", item)}
                                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 dark:border-slate-700 checked:bg-slate-900 dark:checked:bg-white checked:border-slate-900 dark:checked:border-white transition-all"
                                                        />
                                                        <X className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 text-white dark:text-slate-900 transition-opacity" size={12} strokeWidth={4} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Banner */}
                                    <div className="mt-8 p-6 bg-slate-900 dark:bg-white rounded-[2rem] text-white dark:text-slate-900 space-y-3 shadow-2xl">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle size={16} className="text-emerald-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Architecture Note</span>
                                        </div>
                                        <p className="text-[11px] font-bold leading-relaxed opacity-80">
                                            Blocking is a permanent hard restriction. These items will be stripped from all database queries globally.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
