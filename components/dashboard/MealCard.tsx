"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronDown, 
    Flame, 
    Link as LinkIcon, 
    Settings2, 
    Trash2, 
    Plus, 
    ArrowRight,
    Sparkles,
    Scale,
    UtensilsCrossed,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { AddItemModal } from "./AddItemModal";
import { FoodItem } from "../../lib/food-db";
import { useNutritionTargets } from "../../lib/hooks/useNutritionTargets";
import { useUserStats } from "../../lib/hooks/useUserStats";
import { useMealState } from "../../lib/contexts/MealStateContext";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import { GeneratedMeal } from "../../lib/meal-planner";
import { FoodReplacementModal } from "./FoodReplacementModal";

interface MealCardProps {
    meal: GeneratedMeal;
    dateKey: string;
}

export const MealCard = ({ meal, dateKey }: MealCardProps) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [replacingFood, setReplacingFood] = useState<FoodItem | null>(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [isRebalancing, setIsRebalancing] = useState(false);
    const { updateItemServing, replaceFood, rebalanceDay, addItemToMeal, regenerateDay, removeItem, mealsMap } = useMealState();
    const { activeTarget } = useNutritionTargets();
    const { stats: userData } = useUserStats();
    const adminSettings = useAdminSettings();
    const router = useRouter();

    const handleReplace = (newFood: FoodItem) => {
        if (replacingFood) {
            replaceFood(dateKey, meal.slot, replacingFood.id, newFood);
            setReplacingFood(null);
        }
    };

    const handleAddItem = async (food: any, rebalance: boolean) => {
        setIsAddingItem(false); // close modal immediately
        if (rebalance) {
            // rebalanceDay adds the food AND calls AI to rebalance future slots
            setIsRebalancing(true);
            try {
                await rebalanceDay(dateKey, food, meal.slot, userData, activeTarget?.calories ?? 2000);
            } finally {
                setIsRebalancing(false);
            }
        } else {
            // Simple append — immutable, instant UI update
            addItemToMeal(dateKey, meal.slot, food);
        }
    };

    const handleRowClick = (foodId: string) => {
        router.push(`/dashboard/discover/${foodId}?from=${dateKey}&slot=${meal.slot}`);
    };

    const handleViewRecipe = () => {
        router.push(`/dashboard/meal/${dateKey}/${meal.slot.toLowerCase()}`);
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white dark:bg-slate-900 rounded-[32px] border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-6 group/card ${
                isRebalancing
                    ? "border-emerald-300 dark:border-emerald-700 shadow-emerald-100 dark:shadow-emerald-900/20"
                    : "border-slate-200 dark:border-slate-800"
            }`}
        >
            {/* Rebalancing Banner */}
            {isRebalancing && (
                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/40">
                    <Loader2 size={14} className="text-emerald-500 animate-spin shrink-0" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        AI rebalancing remaining meals…
                    </span>
                </div>
            )}

            {/* Meal Header */}
            <div className="p-6 flex items-center justify-between bg-white dark:bg-slate-900">
                <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-[20px] flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover/card:scale-110 transition-transform duration-500">
                        <Flame size={28} className="fill-emerald-500/10" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-3 mb-1.5">
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {meal.slot}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {meal.totalCalories} kcal
                            </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">
                            {meal.items.length > 0 ? meal.items.map(i => i.food.name).join(" • ") : "No Selection"}
                        </h4>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className={`w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    >
                        <ChevronDown size={20} />
                    </button>
                </div>
            </div>

            {/* Meal Details (Food Items) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-800"
                    >
                        <div className="p-6 bg-slate-50/40 dark:bg-slate-900/40 space-y-4">
                            {meal.items.map((item, idx) => (
                                <motion.div 
                                    key={`${item.food.id}-${idx}`}
                                    onClick={() => handleRowClick(item.food.id)}
                                    whileHover={{ x: 4, scale: 1.005 }}
                                    whileTap={{ scale: 0.995 }}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 group/row cursor-pointer"
                                >
                                    <div className="flex items-center flex-1 min-w-0">
                                        {/* Image/Icon Placeholder */}
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-2xl mr-4 border border-slate-100 dark:border-slate-600 transition-transform group-hover/row:scale-110">
                                            {item.food.category === "protein" ? "🍗" : item.food.category === "carb" ? "🍚" : "🥑"}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase hover:text-emerald-500 transition-colors truncate block">
                                                    {item.food.name}
                                                </span>
                                                <LinkIcon size={12} className="text-slate-300 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5 flex items-center">
                                                <span className="w-1 h-1 bg-emerald-500 rounded-full mr-2" />
                                                {item.food.category}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Inline Serving Controls */}
                                    <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl p-1 border border-slate-100 dark:border-slate-800">
                                            <input 
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={item.amount}
                                                onChange={(e) => updateItemServing(dateKey, meal.slot, item.food.id, parseFloat(e.target.value) || 1)}
                                                className="w-14 bg-transparent text-center text-xs font-black text-slate-800 dark:text-slate-100 border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-[10px] font-black text-slate-400 uppercase pr-3 pl-1 border-l border-slate-200 dark:border-slate-700 ml-1">
                                                {item.food.serving}
                                            </span>
                                        </div>

                                        <div className="text-right min-w-[60px]">
                                            <p className="text-xs font-black text-slate-900 dark:text-slate-100">
                                                {Math.round((item.food?.nutrition?.calories ?? item.food?.calories ?? 0) * (item.amount || 1))}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">kcal</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setReplacingFood(item.food); }}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
                                                title="Replace Food"
                                            >
                                                <Settings2 size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeItem(dateKey, meal.slot, item.food.id); }}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {/* Empty Add Button */}
                             <button 
                                onClick={() => setIsAddingItem(true)}
                                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all group"
                            >
                                <Plus size={20} className="mr-2 group-hover:scale-125 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Add Item to {meal.slot}</span>
                            </button>
                        </div>
                        
                        <div className="px-6 py-4 bg-white dark:bg-slate-900 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                           <div className="flex space-x-6">
                                <MacroItem label="P" value={Math.round(meal.totalProtein)} unit="g" />
                                <MacroItem label="C" value={Math.round(meal.totalCarbs)} unit="g" />
                                <MacroItem label="F" value={Math.round(meal.totalFat)} unit="g" />
                           </div>
                            <motion.button 
                                whileHover={{ x: 5 }}
                                onClick={handleViewRecipe}
                                className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                            >
                                View Recipes <ArrowRight size={14} className="ml-1.5" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Item Modal */}
            {isAddingItem && (
                <AddItemModal 
                    isOpen={isAddingItem}
                    onClose={() => setIsAddingItem(false)}
                    onAdd={handleAddItem}
                    slot={meal.slot}
                    targetCalories={activeTarget?.calories || 2000}
                    currentCalories={meal.totalCalories} 
                    userData={userData}
                    enableRebalance={adminSettings?.enable_rebalance !== false}
                />
            )}

            {/* Replacement Modal */}
            {replacingFood && (
                <FoodReplacementModal 
                    isOpen={!!replacingFood}
                    currentFood={replacingFood}
                    onClose={() => setReplacingFood(null)}
                    onReplace={handleReplace}
                />
            )}
        </motion.div>
    );
};

const MacroItem = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
    <div className="flex items-baseline space-x-1.5">
        <span className="text-[9px] font-black text-slate-400 uppercase">{label}</span>
        <span className="text-xs font-black text-slate-800 dark:text-slate-100">{value}{unit}</span>
    </div>
);
