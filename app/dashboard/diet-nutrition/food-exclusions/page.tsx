"use client";

import { useState, useMemo } from "react";
import { useTheme } from "../../../../components/ThemeProvider";
import Header from "../../../../components/dashboard/Header";
import ClientOnly from "../../../../components/common/ClientOnly";
import { useFoodExclusions } from "../../../../lib/hooks/useFoodExclusions";
import { usePrimaryDiet } from "../../../../lib/hooks/usePrimaryDiet";
import { FULL_DISCOVER_DATABASE } from "../../../../lib/discover-db";
import { filterFoods } from "../../../../lib/utils/filterEngine";
import { Target, Search, Plus, X, AlertTriangle, ShieldBan, PieChart, Info, Filter, Check, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COMMON_ALLERGENS = [
    { label: "Dairy", items: ["Milk", "Cheese", "Yogurt", "Butter", "Dairy"] },
    { label: "Eggs", items: ["Egg", "Eggs"] },
    { label: "Fish", items: ["Fish", "Salmon", "Tuna", "Cod"] },
    { label: "Gluten", items: ["Wheat", "Bread", "Pasta", "Gluten", "Barley", "Rye"] },
    { label: "Peanuts", items: ["Peanuts", "Peanut Butter"] },
    { label: "Soy", items: ["Soy", "Tofu", "Edamame", "Soy Sauce"] },
    { label: "Tree Nuts", items: ["Almonds", "Walnuts", "Cashews", "Pecans", "Macadamias"] },
    { label: "Shellfish", items: ["Shrimp", "Crab", "Lobster", "Shellfish"] }
];

const FREQUENTLY_EXCLUDED = [
    "Chocolate", "Mushrooms", "Onions", "Mayonnaise", "Olives", 
    "Pickles", "Protein Powder", "Sugar", "Refined Starches"
];

const CATEGORY_SECTIONS = [
    { title: "Dairy", icon: "🥛", items: ["Milk", "Cheese", "Butter", "Yogurt", "Cream Cheese"] },
    { title: "Red Meat", icon: "🥩", items: ["Beef", "Lamb", "Pork", "Steak", "Beef Jerky"] },
    { title: "Poultry", icon: "🍗", items: ["Chicken", "Turkey", "Duck"] },
    { title: "Fish", icon: "🐟", items: ["Salmon", "Tuna", "Cod", "Sashimi"] },
    { title: "Shellfish", icon: "🦞", items: ["Shrimp", "Crab", "Lobster"] },
    { title: "Vegetables", icon: "🥦", items: ["Broccoli", "Onion", "Garlic", "Spinach", "Kale", "Mushroom", "Zucchini", "Carrots", "Bell Pepper", "Eggplant", "Cauliflower", "Green Beans", "Brussels Sprouts"] },
    { title: "Fruits", icon: "🍎", items: ["Apple", "Banana", "Mango", "Orange", "Strawberries", "Blueberries", "Raspberries", "Watermelon", "Pineapple", "Kiwi", "Peach"] },
    { title: "Grains", icon: "🌾", items: ["Rice", "Bread", "Oats", "Pasta", "Quinoa"] },
    { title: "Legumes", icon: "🫘", items: ["Beans", "Lentils", "Chickpeas", "Black Beans"] },
    { title: "Nuts", icon: "🥜", items: ["Almonds", "Cashews", "Walnuts", "Pecans", "Pistachios"] },
    { title: "Condiments", icon: "🍯", items: ["Ketchup", "Mustard", "Mayo", "Soy Sauce"] }
];

export default function FoodExclusionsPage() {
    const { theme, setTheme } = useTheme();
    const { exclusions, addExclusion, addMultipleExclusions, removeExclusion, removeMultipleExclusions, isLoaded: exLoaded } = useFoodExclusions();
    const { activeDiet, isLoaded: dietLoaded } = usePrimaryDiet();
    const [query, setQuery] = useState("");

    const isLoaded = exLoaded && dietLoaded;

    const suggestions = query.trim().length > 1 
        ? FULL_DISCOVER_DATABASE
            .filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
            .slice(0, 5)
        : [];

    const handleAdd = (name: string, category: string = "custom") => {
        if (!name.trim()) return;
        addExclusion({ name: name.trim(), category });
        setQuery("");
    };

    const toggleExclusion = (name: string, category: string = "category") => {
        const existing = exclusions.find(e => e.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            removeExclusion(existing.id);
        } else {
            addExclusion({ name, category });
        }
    };

    const toggleCategory = (title: string, items: string[], isFull: boolean) => {
        if (isFull) {
            // Remove all
            const idsToRemove = exclusions.filter(e => items.some(item => item.toLowerCase() === e.name.toLowerCase())).map(e => e.id);
            if (idsToRemove.length > 0) removeMultipleExclusions(idsToRemove);
        } else {
            // Add all
            const newItems = items
                .filter(item => !isExcludedExact(item))
                .map(name => ({ name, category: title }));
            if (newItems.length > 0) addMultipleExclusions(newItems);
        }
    };

    const isExcludedExact = (name: string) => {
        return exclusions.some(e => e.name.toLowerCase() === name.toLowerCase());
    };

    const normalize = (str: string) => str.toLowerCase().trim();

    const { totalFoods, excludedCount, excludedPercentage } = useMemo(() => {
        const totalCount = FULL_DISCOVER_DATABASE.length;
        if (totalCount === 0) return { totalFoods: 0, excludedCount: 0, excludedPercentage: 100 };
        
        const excludedSet = new Set(exclusions.map(e => normalize(e.name)));
        
        if (activeDiet?.exclusions) {
            activeDiet.exclusions.forEach(ex => excludedSet.add(normalize(ex)));
        }

        const excluded = FULL_DISCOVER_DATABASE.filter(food => {
            const name = normalize(food.name);
            return excludedSet.has(name) || food.tags.some(tag => excludedSet.has(normalize(tag)));
        }).length;

        const percentage = Math.round((excluded / totalCount) * 100);
        
        console.log(`[DEBUG] totalCount: ${totalCount}, excludedCount: ${excluded}, percentage: ${percentage}%, Unmatched Items: ${totalCount - excluded}`);
        
        return { totalFoods: totalCount, excludedCount: excluded, excludedPercentage: percentage };
    }, [exclusions, activeDiet]);

    return (
        <div className="flex flex-col min-w-0 h-full bg-slate-50 dark:bg-slate-950 relative overflow-y-auto">
            <Header theme={theme} onThemeChange={setTheme} />
            
            <ClientOnly 
                fallback={
                    <div className="max-w-5xl mx-auto p-4 sm:p-8 flex justify-center mt-20">
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-800 w-32 h-32 rounded-3xl" />
                    </div>
                }
            >
                <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8 w-full pb-32">
                    {/* Top Section */}
                    <div className="space-y-2 max-w-2xl mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Food Exclusions</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Exclude foods you dislike or are allergic to. Excluded foods will not appear in discover feeds, meal planner suggestions, or grocery lists.
                        </p>
                    </div>

                    {!isLoaded ? (
                        <div className="h-64 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse" />
                    ) : (
                        <div className="space-y-8">
                            {/* Main Grid (2-column layout) */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* LEFT (main content) */}
                                <div className="lg:col-span-2 space-y-8">
                                    
                                    {/* Recipe Variety Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                                    <PieChart size={20} className="mr-2 text-emerald-500" />
                                                    Recipe Variety Metric
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    You have excluded <strong>{excludedCount} of {totalFoods} items</strong>.
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-slate-900 dark:text-white relative bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                                    {excludedPercentage}%
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden relative shadow-inner">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, excludedPercentage)}%` }}
                                                transition={{ duration: 1, type: "spring", stiffness: 50 }}
                                                className="h-full absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                                            />
                                        </div>

                                        {excludedPercentage > 90 && (
                                            <div className="mt-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-lg p-3 flex items-center text-orange-700 dark:text-orange-400 font-medium text-sm">
                                                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                                                ⚠️ Too many exclusions may limit meal variety
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Custom Exclusion Card */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 relative">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add Custom Exclusion</h3>
                                        <div className="flex flex-col sm:flex-row gap-3 relative">
                                            <div className="relative flex-1 group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Search size={18} className="text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={query}
                                                    onChange={e => setQuery(e.target.value)}
                                                    placeholder="Search for an ingredient or food..."
                                                    className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-white shadow-sm"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleAdd(query, "custom")}
                                                disabled={!query.trim()}
                                                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-emerald-500/30 whitespace-nowrap text-sm flex items-center justify-center gap-2"
                                            >
                                                <span>Add Custom</span>
                                            </button>

                                            {/* Suggestions Dropdown */}
                                            <AnimatePresence>
                                                {suggestions.length > 0 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.98 }}
                                                        className="absolute left-0 right-0 sm:right-40 top-[105%] mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden"
                                                    >
                                                        {suggestions.map(food => (
                                                            <button 
                                                                key={food.id}
                                                                onClick={() => handleAdd(food.name.toLowerCase(), "ingredient")}
                                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between border-b border-gray-50 dark:border-slate-700/50 last:border-0 transition-colors"
                                                            >
                                                                <div className="flex items-center">
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize text-sm">{food.name}</span>
                                                                </div>
                                                                <Plus size={16} className="text-emerald-500" />
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Your Exclusions */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                                            <ShieldBan size={20} className="mr-2 text-rose-500" />
                                            Your Exclusions
                                            {exclusions.length > 0 && (
                                                <span className="ml-2 text-sm bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 rounded-full font-bold">
                                                    {exclusions.length}
                                                </span>
                                            )}
                                        </h3>
                                        
                                        {exclusions.length === 0 ? (
                                            <div className="py-10 text-center space-y-3">
                                                <div className="text-4xl">🎉</div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">You're all set! No exclusions yet.</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                <AnimatePresence>
                                                    {exclusions.map(ex => (
                                                        <motion.div 
                                                            key={ex.id}
                                                            layout
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="flex items-center justify-between bg-red-500 text-white shadow-sm border border-red-600 dark:border-red-500 px-3 py-1 rounded-full text-sm font-medium transition-all group"
                                                        >
                                                            <span className="capitalize">{ex.name}</span>
                                                            <button 
                                                                onClick={() => removeExclusion(ex.id)}
                                                                className="ml-2 p-0.5 rounded-full bg-red-400/30 hover:bg-red-600 active:scale-95 transition-all text-white"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT (side cards) */}
                                <div className="space-y-8">
                                    
                                    {/* Excluded By Diet (Auto) */}
                                    {activeDiet && activeDiet.exclusions.length > 0 && (
                                        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-900/30 p-6">
                                            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-2 flex items-center">
                                                <Info size={18} className="mr-2" />
                                                Primary Diet Rules
                                            </h3>
                                            <p className="text-xs text-orange-600 dark:text-orange-500/80 mb-4 leading-relaxed font-medium">
                                                Based on your <strong>{activeDiet.label}</strong> diet, these are automatically locked.
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {activeDiet.exclusions.map(ex => (
                                                    <div 
                                                        key={ex}
                                                        className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-semibold capitalize opacity-90 border border-orange-200 dark:border-orange-800/30 shadow-sm"
                                                    >
                                                        {ex.replace("-", " ")}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Common Allergens */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 flex items-center">
                                            <AlertTriangle size={18} className="mr-2 text-rose-500" />
                                            Common Allergens
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-4">Quickly block major allergens.</p>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {COMMON_ALLERGENS.map(preset => {
                                                const totalItems = preset.items.length;
                                                const excludedCount = preset.items.reduce((count, item) => count + (isExcludedExact(item) ? 1 : 0), 0);
                                                const isFull = excludedCount === totalItems;
                                                const isPartial = excludedCount > 0 && excludedCount < totalItems;

                                                const baseCSS = "w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex justify-between items-center group text-sm border active:scale-[0.98]";

                                                const stateCSS = isFull 
                                                    ? "bg-red-500 text-white border-red-600 shadow-sm"
                                                    : isPartial 
                                                        ? "bg-orange-100 text-orange-600 border-orange-300 dark:bg-orange-900/40 dark:border-orange-800"
                                                        : "bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700";

                                                const icon = isFull 
                                                    ? <Check size={14} strokeWidth={3} className="text-white" />
                                                    : isPartial
                                                        ? <Minus size={14} strokeWidth={3} className="text-orange-600 dark:text-orange-400" />
                                                        : <Plus size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />

                                                return (
                                                    <button 
                                                        key={preset.label}
                                                        onClick={() => toggleCategory(preset.label, preset.items, isFull)} 
                                                        className={`${baseCSS} ${stateCSS}`}
                                                    >
                                                        <span className="font-medium">{preset.label}</span>
                                                        {icon}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Frequently Excluded */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Frequently Excluded</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {FREQUENTLY_EXCLUDED.map(item => {
                                                const excluded = isExcludedExact(item);
                                                return (
                                                    <button 
                                                        key={item}
                                                        onClick={() => toggleExclusion(item, "frequent")}
                                                        className={`
                                                            px-3 py-1 rounded-full text-sm transition-all duration-200 font-medium
                                                            ${excluded 
                                                                ? "bg-red-500 text-white shadow-sm active:scale-95" 
                                                                : "bg-gray-100 text-gray-700 border border-transparent dark:bg-slate-800/50 dark:text-gray-300 hover:scale-105 hover:bg-gray-200 active:scale-95"
                                                            }
                                                        `}
                                                    >
                                                        {item}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Bottom Section: Category-based food groups */}
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Browse Categories</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {CATEGORY_SECTIONS.map(section => {
                                        
                                        const totalItems = section.items.length;
                                        const excludedCountInGroup = section.items.reduce((count, item) => count + (isExcludedExact(item) ? 1 : 0), 0);
                                        const isFull = excludedCountInGroup === totalItems;
                                        const isPartial = excludedCountInGroup > 0 && excludedCountInGroup < totalItems;
                                        const isHighlighted = isFull || isPartial;

                                        let cardWrapperCSS = "bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm";
                                        if (isFull) {
                                            cardWrapperCSS = "bg-red-50/50 dark:bg-red-900/10 border-2 border-red-300 dark:border-red-800 shadow-sm";
                                        } else if (isPartial) {
                                            cardWrapperCSS = "bg-orange-50/50 dark:bg-orange-900/10 border-2 border-orange-300 dark:border-orange-800 shadow-sm";
                                        }

                                        return (
                                            <div 
                                                key={section.title} 
                                                className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${cardWrapperCSS}`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                                                        <span className="mr-2 text-xl">{section.icon}</span>
                                                        {section.title}
                                                    </h4>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        {isHighlighted && (
                                                            <span className={`${isFull ? 'bg-red-100 text-red-600 dark:bg-red-900/40' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40'} px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm`}>
                                                                {excludedCountInGroup} excluded
                                                            </span>
                                                        )}
                                                        <button 
                                                            onClick={() => toggleCategory(section.title, section.items, isFull)} 
                                                            title={isFull ? "Remove All Exclusions" : "Exclude All"}
                                                            className={`
                                                                w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200
                                                                ${isFull 
                                                                    ? "bg-red-500 text-white border border-red-600 shadow-sm active:scale-95" 
                                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                                                                }
                                                            `}
                                                        >
                                                            {isFull ? <Check size={16} strokeWidth={3} /> : isPartial ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {section.items.map(item => {
                                                        const excluded = isExcludedExact(item);
                                                        return (
                                                            <button
                                                                key={item}
                                                                onClick={() => toggleExclusion(item, section.title)}
                                                                className={`
                                                                    px-3 py-1 rounded-full text-sm transition-all duration-200 font-medium
                                                                    ${excluded 
                                                                        ? "bg-red-500 text-white shadow-sm active:scale-95" 
                                                                        : "bg-gray-100 text-gray-700 border border-transparent dark:bg-slate-800/50 dark:text-gray-300 hover:bg-gray-200 hover:scale-105 active:scale-95"
                                                                    }
                                                                `}
                                                            >
                                                                {item}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </ClientOnly>
        </div>
    );
}
