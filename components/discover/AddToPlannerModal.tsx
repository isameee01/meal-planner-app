"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FoodItem } from "../../lib/discover-db";
import { useFoodExclusions } from "../../lib/hooks/useFoodExclusions";
import { usePrimaryDiet } from "../../lib/hooks/usePrimaryDiet";
import { filterFoods } from "../../lib/utils/filterEngine";
import { useGlobalFoodState } from "../../lib/contexts/FoodStateContext";

interface AddToPlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    food: FoodItem | null;
}

export default function AddToPlannerModal({ isOpen, onClose, food }: AddToPlannerModalProps) {
    const { blockedFoods } = useGlobalFoodState();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState("Lunch");
    const [isSuccess, setIsSuccess] = useState(false);
    
    const { exclusions } = useFoodExclusions();
    const { activeDiet } = usePrimaryDiet();
    const [isExcludedWarning, setIsExcludedWarning] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [hasOverridden, setHasOverridden] = useState(false);

    const slots = ["Breakfast", "Lunch", "Dinner", "Snack"];

    useEffect(() => {
        if (isOpen && food) {
            const isAllowed = filterFoods(food, exclusions, activeDiet, blockedFoods);
            if (!isAllowed) {
                // Determine if it's a hard block or just an exclusion/diet mismatch
                const normalize = (s: string) => s.toLowerCase().trim();
                const isHardBlocked = blockedFoods.some(b => normalize(b) === normalize(food.name)) || blockedFoods.includes(food.id);
                
                setIsBlocked(isHardBlocked);
                setIsExcludedWarning(true);
            } else {
                setIsExcludedWarning(false);
                setIsBlocked(false);
            }
            setHasOverridden(false);
        }
    }, [isOpen, food, exclusions, activeDiet, blockedFoods]);

    const handleAdd = () => {
        if (!food) return;

        if (isExcludedWarning && !hasOverridden) {
            // Already showing warning, do not proceed if not overridden
            return;
        }

        const cacheRaw = localStorage.getItem("meals_cache");
        let cache = cacheRaw ? JSON.parse(cacheRaw) : {};

        const dateKey = selectedDate;
        if (!cache[dateKey]) cache[dateKey] = [];

        // Find or create the slot in the date
        let slotIndex = cache[dateKey].findIndex((m: any) => m.slot === selectedSlot);
        
        // Map my new FoodItem format to the one expected by the dashboard
        const mappedFood = {
            id: food.id,
            name: food.name,
            calories: food.nutrition.calories,
            protein: food.nutrition.protein,
            carbs: food.nutrition.carbs,
            fat: food.nutrition.fat,
            category: food.category,
            serving: food.serving,
            tags: food.tags,
            mealTypes: food.mealTypes
        };

        if (slotIndex === -1) {
            cache[dateKey].push({
                slot: selectedSlot,
                items: [{ food: mappedFood, amount: 1 }],
                totalCalories: food.nutrition.calories,
                totalProtein: food.nutrition.protein,
                totalCarbs: food.nutrition.carbs,
                totalFat: food.nutrition.fat
            });
        } else {
            cache[dateKey][slotIndex].items.push({ food: mappedFood, amount: 1 });
            cache[dateKey][slotIndex].totalCalories += food.nutrition.calories;
            cache[dateKey][slotIndex].totalProtein += food.nutrition.protein;
            cache[dateKey][slotIndex].totalCarbs += food.nutrition.carbs;
            cache[dateKey][slotIndex].totalFat += food.nutrition.fat;
        }

        localStorage.setItem("meals_cache", JSON.stringify(cache));
        
        // Trigger a custom event to notify other components (like Discovery page count if needed)
        window.dispatchEvent(new Event("storage"));
        
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            onClose();
        }, 1500);
    };

    if (!food) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120]"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl z-[121] overflow-hidden p-8"
                    >
                        {isSuccess ? (
                            <div className="py-12 flex flex-col items-center text-center space-y-4">
                                <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white"
                                >
                                    <CheckCircle2 size={40} />
                                </motion.div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Added to Plan!</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Successfully added {food.name} to your {selectedSlot}.</p>
                            </div>
                        ) : isExcludedWarning && !hasOverridden ? (
                            <div className="py-6 flex flex-col space-y-6 text-center">
                                <div className={`w-20 h-20 ${isBlocked ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-500'} rounded-full flex items-center justify-center mx-auto`}>
                                    <AlertTriangle size={36} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">{isBlocked ? 'Food Blocked' : 'Food Excluded'}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    {isBlocked 
                                        ? "This food is permanently blocked in your settings. You can still add it, but we recommend checking your Blocked Foods list."
                                        : "This food is excluded based on your Primary Diet or Custom Exclusions preferences. "
                                    }
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl text-sm font-bold border border-slate-200 dark:border-slate-800">
                                    {food.name}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={onClose}
                                        className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[2rem] font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => setHasOverridden(true)}
                                        className={`flex-1 px-6 py-4 ${isBlocked ? 'bg-rose-600' : 'bg-rose-500'} hover:opacity-90 text-white rounded-[2rem] font-bold shadow-lg transition-all`}
                                    >
                                        {isBlocked ? 'Override Block' : 'Allow Anyway'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Add to Planner</h2>
                                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                        <X size={24} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center gap-4 border border-slate-100 dark:border-slate-800">
                                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                                        {food.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{food.name}</h4>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{food.nutrition.calories} kcal per serving</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Date Selection */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Choose Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="date" 
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Slot Selection */}
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meal Slot</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {slots.map(slot => (
                                                <button 
                                                    key={slot}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                                        selectedSlot === slot 
                                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg" 
                                                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                                                    }`}
                                                >
                                                    {slot}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAdd}
                                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 mt-4 ${
                                        hasOverridden ? "bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-200/50 dark:shadow-rose-900/20" : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/20"
                                    }`}
                                >
                                    <span>{hasOverridden ? "Override & Add" : "Confirm Selection"}</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
