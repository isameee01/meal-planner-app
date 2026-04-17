"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GeneratedMeal } from "../meal-planner";

interface MealStateContextType {
    mealsMap: Record<string, GeneratedMeal[]>;
    updateItemServing: (dateKey: string, slot: string, foodId: string, newAmount: number) => void;
    replaceFood: (dateKey: string, slot: string, oldFoodId: string, newFood: any) => void;
    regenerateDay: (dateKey: string, newMeals: GeneratedMeal[]) => void;
    batchRegenerateDays: (updates: Record<string, GeneratedMeal[]>) => void;
    rebalanceDay: (dateKey: string, addedItem: any, slot: string, userData: any, targetCal: number) => Promise<void>;
    removeItem: (dateKey: string, slot: string, foodId: string) => void;
    refreshMeals: () => void;
    loading: boolean;
}

const MealStateContext = createContext<MealStateContextType | undefined>(undefined);

export function MealStateProvider({ children }: { children: React.ReactNode }) {
    const [mealsMap, setMealsMap] = useState<Record<string, GeneratedMeal[]>>({});
    const [loading, setLoading] = useState(true);

    const loadMeals = useCallback(() => {
        const cacheRaw = localStorage.getItem("meals_cache");
        if (cacheRaw) {
            try {
                setMealsMap(JSON.parse(cacheRaw));
            } catch (e) {
                console.error("Failed to parse meals_cache", e);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadMeals();
        
        // Listen for storage events for cross-tab sync
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "meals_cache") {
                loadMeals();
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [loadMeals]);

    const saveMeals = useCallback((newMap: Record<string, GeneratedMeal[]>) => {
        setMealsMap(newMap);
        localStorage.setItem("meals_cache", JSON.stringify(newMap));
        // Manually dispatch storage event for current window tab
        window.dispatchEvent(new Event("storage"));
    }, []);

    const updateItemServing = useCallback((dateKey: string, slot: string, foodId: string, newAmount: number) => {
        setMealsMap(prev => {
            const dayMeals = prev[dateKey];
            if (!dayMeals) return prev;

            const nextDayMeals = dayMeals.map(meal => {
                if (meal.slot !== slot) return meal;

                const nextItems = meal.items.map(item => {
                    if (item.food.id !== foodId) return item;
                    return { ...item, amount: Math.max(0.1, newAmount) };
                });

                // Recalculate meal totals
                const totalCalories = Math.round(nextItems.reduce((acc, i) => acc + i.food.calories * i.amount, 0));
                const totalProtein = Math.round(nextItems.reduce((acc, i) => acc + i.food.protein * i.amount, 0));
                const totalCarbs = Math.round(nextItems.reduce((acc, i) => acc + i.food.carbs * i.amount, 0));
                const totalFat = Math.round(nextItems.reduce((acc, i) => acc + i.food.fat * i.amount, 0));

                return { ...meal, items: nextItems, totalCalories, totalProtein, totalCarbs, totalFat };
            });

            const nextMap = { ...prev, [dateKey]: nextDayMeals };
            localStorage.setItem("meals_cache", JSON.stringify(nextMap));
            return nextMap;
        });
    }, []);

    const replaceFood = useCallback((dateKey: string, slot: string, oldFoodId: string, newFood: any) => {
        setMealsMap(prev => {
            const dayMeals = prev[dateKey];
            if (!dayMeals) return prev;

            const nextDayMeals = dayMeals.map(meal => {
                if (meal.slot !== slot) return meal;

                const nextItems = meal.items.map(item => {
                    if (item.food.id !== oldFoodId) return item;
                    // Keep the same multiplier or reset to 1?
                    // Usually better to reset to 1 or attempt to match calories.
                    // For now, reset to 1 for simplicity and clear feedback.
                    return { ...item, food: newFood, amount: 1 };
                });

                const totalCalories = Math.round(nextItems.reduce((acc, i) => acc + i.food.calories * i.amount, 0));
                const totalProtein = Math.round(nextItems.reduce((acc, i) => acc + i.food.protein * i.amount, 0));
                const totalCarbs = Math.round(nextItems.reduce((acc, i) => acc + i.food.carbs * i.amount, 0));
                const totalFat = Math.round(nextItems.reduce((acc, i) => acc + i.food.fat * i.amount, 0));

                return { ...meal, items: nextItems, totalCalories, totalProtein, totalCarbs, totalFat };
            });

            const nextMap = { ...prev, [dateKey]: nextDayMeals };
            localStorage.setItem("meals_cache", JSON.stringify(nextMap));
            return nextMap;
        });
    }, []);

    const regenerateDay = useCallback((dateKey: string, newMeals: GeneratedMeal[]) => {
        setMealsMap(prev => {
            const nextMap = { ...prev, [dateKey]: newMeals };
            localStorage.setItem("meals_cache", JSON.stringify(nextMap));
            return nextMap;
        });
    }, []);

    const batchRegenerateDays = useCallback((records: Record<string, GeneratedMeal[]>) => {
        setMealsMap(prev => {
            const nextMap = { ...prev, ...records };
            localStorage.setItem("meals_cache", JSON.stringify(nextMap));
            return nextMap;
        });
    }, []);

    const removeItem = useCallback((dateKey: string, slot: string, foodId: string) => {
        setMealsMap(prev => {
            const dayMeals = prev[dateKey];
            if (!dayMeals) return prev;

            const nextDayMeals = dayMeals.map(meal => {
                if (meal.slot !== slot) return meal;

                const nextItems = meal.items.filter(item => item.food.id !== foodId);

                const totalCalories = Math.round(nextItems.reduce((acc, i) => acc + i.food.calories * i.amount, 0));
                const totalProtein = Math.round(nextItems.reduce((acc, i) => acc + i.food.protein * i.amount, 0));
                const totalCarbs = Math.round(nextItems.reduce((acc, i) => acc + i.food.carbs * i.amount, 0));
                const totalFat = Math.round(nextItems.reduce((acc, i) => acc + i.food.fat * i.amount, 0));

                return { ...meal, items: nextItems, totalCalories, totalProtein, totalCarbs, totalFat };
            });

            const nextMap = { ...prev, [dateKey]: nextDayMeals };
            localStorage.setItem("meals_cache", JSON.stringify(nextMap));
            return nextMap;
        });
    }, []);

    const rebalanceDay = async (dateKey: string, addedItem: any, slot: string, userData: any, targetCal: number) => {
        setLoading(true);
        try {
            const { rebalanceDayAI } = await import("../ai/generateMealPlan");
            const currentDayMeals = mealsMap[dateKey] || [];
            const newPlan = await rebalanceDayAI(currentDayMeals, addedItem, slot, userData, targetCal);
            regenerateDay(dateKey, newPlan);
        } catch (error) {
            console.error("Failed to rebalance day:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <MealStateContext.Provider value={{ 
            mealsMap, 
            updateItemServing, 
            replaceFood, 
            regenerateDay, 
            batchRegenerateDays,
            rebalanceDay,
            removeItem,
            refreshMeals: loadMeals, 
            loading 
        }}>
            {children}
        </MealStateContext.Provider>
    );
}

export const useMealState = () => {
    const context = useContext(MealStateContext);
    if (!context) throw new Error("useMealState must be used within MealStateProvider");
    return context;
};
