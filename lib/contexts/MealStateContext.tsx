"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GeneratedMeal } from "../meal-planner";
import { scaleMealServings } from "../ai/generateMealPlan";

interface MealStateContextType {
    mealsMap: Record<string, GeneratedMeal[]>;
    updateItemServing: (dateKey: string, slot: string, foodId: string, newAmount: number) => void;
    replaceFood: (dateKey: string, slot: string, oldFoodId: string, newFood: any) => void;
    regenerateDay: (dateKey: string, newMeals: GeneratedMeal[]) => void;
    batchRegenerateDays: (updates: Record<string, GeneratedMeal[]>) => void;
    rebalanceDay: (dateKey: string, addedItem: any, slot: string, userData: any, targetCal: number) => Promise<void>;
    addItemToMeal: (dateKey: string, slot: string, food: any) => void;
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

                // Check if this is a single-item AI meal (the typical case)
                // If so, scale the entire meal proportionally using scaleMealServings
                const targetItem = meal.items.find(i => i.food.id === foodId);
                if (!targetItem) return meal;

                const clampedAmount = Math.max(0.1, newAmount);
                
                // Use full scaling for AI-generated single-item meals
                if (meal.items.length === 1) {
                    console.log(`[Servings] Scaling ${meal.slot} from ${targetItem.amount} to ${clampedAmount} servings`);
                    return scaleMealServings(meal, clampedAmount);
                }

                // For multi-item meals, scale only the changed item's nutritional contribution
                const nextItems = meal.items.map(item => {
                    if (item.food.id !== foodId) return item;
                    return { ...item, amount: clampedAmount };
                });

                // Recalculate meal totals from scaled items
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

    // ── Pure helper: append a food item to a slot within a day's meals ──
    const buildMealsWithAddedItem = useCallback((
        dayMeals: GeneratedMeal[],
        slot: string,
        food: any
    ): GeneratedMeal[] =>
        dayMeals.map(meal => {
            if (meal.slot !== slot) return meal;
            const newItems = [...meal.items, { food, amount: 1 }];
            return {
                ...meal,
                items: newItems,
                totalCalories: Math.round(newItems.reduce((s, i) => s + (i.food.calories ?? 0) * i.amount, 0)),
                totalProtein:  Math.round(newItems.reduce((s, i) => s + (i.food.protein  ?? 0) * i.amount, 0)),
                totalCarbs:    Math.round(newItems.reduce((s, i) => s + (i.food.carbs    ?? 0) * i.amount, 0)),
                totalFat:      Math.round(newItems.reduce((s, i) => s + (i.food.fat      ?? 0) * i.amount, 0)),
            };
        }), []);

    // ── Internal helper: update a specific food item's recipe data across the entire map ──
    const updateFoodRecipe = useCallback((foodId: string, recipeData: any) => {
        setMealsMap(prev => {
            const nextMap = { ...prev };
            Object.keys(nextMap).forEach(date => {
                nextMap[date] = nextMap[date].map(meal => ({
                    ...meal,
                    items: meal.items.map(item => {
                        if (item.food.id !== foodId) return item;
                        return {
                            ...item,
                            food: {
                                ...item.food,
                                recipe: recipeData,
                                isGeneratingRecipe: false
                            }
                        };
                    })
                }));
            });
            localStorage.setItem("meals_cache", JSON.stringify(nextMap));
            return nextMap;
        });
    }, []);

    // ── Internal helper: set generating status for a list of food IDs ──
    const setFoodsGenerating = useCallback((foodIds: string[], status: boolean) => {
        setMealsMap(prev => {
            const nextMap = { ...prev };
            Object.keys(nextMap).forEach(date => {
                nextMap[date] = nextMap[date].map(meal => ({
                    ...meal,
                    items: meal.items.map(item => {
                        if (!foodIds.includes(item.food.id)) return item;
                        return { 
                            ...item, 
                            food: { ...item.food, isGeneratingRecipe: status } 
                        };
                    })
                }));
            });
            return nextMap;
        });
    }, []);

    // ── addItemToMeal: persists add and triggers recipe AI ──
    const addItemToMeal = useCallback(async (dateKey: string, slot: string, food: any) => {
        // 1. Add food to local state with loading flag
        const foodWithLoading = { ...food, isGeneratingRecipe: true };
        
        setMealsMap(prev => {
            const dayMeals = prev[dateKey] ?? [];
            const nextMeals = buildMealsWithAddedItem(dayMeals, slot, foodWithLoading);
            const nextMap = { ...prev, [dateKey]: nextMeals };
            localStorage.setItem("meals_cache", JSON.stringify(nextMap));
            return nextMap;
        });

        // 2. Trigger AI recipe generation if not already cached
        if (!food.recipe) {
            try {
                const { generateRecipeForFood } = await import("../ai/generateRecipe");
                // Get userData from context/stats (we'll need to fetch it or pass it)
                // For simplicity, we assume userData is available or passed. 
                // Currently userStats hook is separate, we'll try to get it inside the caller if needed
                // but here we can just use a default or fetch from localStorage
                const recipe = await generateRecipeForFood(food);
                updateFoodRecipe(food.id, recipe);
            } catch (e) {
                console.error("[MealState] Recipe generation failed for add:", e);
                setFoodsGenerating([food.id], false);
            }
        } else {
            setFoodsGenerating([food.id], false);
        }
    }, [buildMealsWithAddedItem, updateFoodRecipe, setFoodsGenerating]);

    // ── rebalanceDay: add food FIRST then call AI on updated state, then batch generate recipes ──
    const rebalanceDay = useCallback(async (
        dateKey: string,
        addedItem: any,
        slot: string,
        userData: any,
        targetCal: number
    ) => {
        setLoading(true);
        try {
            const { rebalanceDayAI } = await import("../ai/generateMealPlan");

            // Step 1: build the meals state WITH the new food already added (set loading flag)
            const addedItemWithLoading = { ...addedItem, isGeneratingRecipe: true };
            const mealsWithFood = await new Promise<GeneratedMeal[]>((resolve) => {
                setMealsMap(prev => {
                    const dayMeals = prev[dateKey] ?? [];
                    const updated = buildMealsWithAddedItem(dayMeals, slot, addedItemWithLoading);
                    const nextMap = { ...prev, [dateKey]: updated };
                    localStorage.setItem("meals_cache", JSON.stringify(nextMap));
                    resolve(updated);
                    return nextMap;
                });
            });

            // Step 2: call AI rebalance
            const rebalancedMeals = await rebalanceDayAI(
                mealsWithFood,
                addedItem,
                slot,
                userData,
                targetCal
            );

            // Step 3: Identify all NEW foods that need recipes and mark them as generating
            const slotsOrder = ["Breakfast", "Lunch", "Dinner", "Snack"];
            const addedIdx = slotsOrder.findIndex(s => s.toLowerCase() === slot.toLowerCase());
            const futureSlots = addedIdx >= 0 ? slotsOrder.slice(addedIdx + 1) : [];
            const futureSlotKeys = futureSlots.map(s => s.toLowerCase());

            // Mark all items in rebalanced slots as generating
            const updatedRebalanced = rebalancedMeals.map(meal => {
                if (!futureSlotKeys.includes(meal.slot.toLowerCase())) return meal;
                return {
                    ...meal,
                    items: meal.items.map(item => ({
                        ...item,
                        food: { ...item.food, isGeneratingRecipe: !item.food.recipe }
                    }))
                };
            });

            // Persist the rebalanced structure (with loading flags)
            setMealsMap(prev => {
                const nextMap = { ...prev, [dateKey]: updatedRebalanced };
                localStorage.setItem("meals_cache", JSON.stringify(nextMap));
                return nextMap;
            });

            // Step 4: Batch trigger recipe generation for all foods without recipes
            const foodsToGen = updatedRebalanced
                .flatMap(m => m.items)
                .filter(i => i.food.isGeneratingRecipe)
                .map(i => i.food);

            if (foodsToGen.length > 0) {
                const { generateRecipesForFoods } = await import("../ai/generateRecipe");
                const recipes = await generateRecipesForFoods(foodsToGen, userData?.goalType);
                
                // Final update: plug in all recipes at once
                setMealsMap(prev => {
                    const dayMeals = prev[dateKey];
                    const finalizedMeals = dayMeals.map(meal => ({
                        ...meal,
                        items: meal.items.map(item => {
                            const recipe = recipes[item.food.id];
                            if (!recipe) return item;
                            return {
                                ...item,
                                food: {
                                    ...item.food,
                                    recipe,
                                    isGeneratingRecipe: false
                                }
                            };
                        })
                    }));
                    const nextMap = { ...prev, [dateKey]: finalizedMeals };
                    localStorage.setItem("meals_cache", JSON.stringify(nextMap));
                    return nextMap;
                });
            }

        } catch (error) {
            console.error("[Rebalance] Failed:", error);
        } finally {
            setLoading(false);
        }
    }, [buildMealsWithAddedItem]);

    return (
        <MealStateContext.Provider value={{
            mealsMap,
            updateItemServing,
            replaceFood,
            regenerateDay,
            batchRegenerateDays,
            rebalanceDay,
            addItemToMeal,
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
