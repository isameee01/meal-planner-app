"use client";

import { useState, useMemo, useCallback } from "react";
import { FULL_DISCOVER_DATABASE, FoodItem, FoodCategory, MealType } from "../discover-db";
import { useGlobalFoodState } from "../contexts/FoodStateContext";

export interface FilterState {
    query: string;
    categories: FoodCategory[];
    mealTypes: MealType[];
    nutritionFocus: string[];
    excludedFoods: string[];
    minCalories: number;
    maxCalories: number;
    minProtein: number;
    maxProtein: number;
    minCarbs: number;
    maxCarbs: number;
    minFat: number;
    maxFat: number;
    onlyMyFoods: boolean;
    selectedCollectionId: string | null;
    onlyCollections: boolean;
    aiEnabled: boolean;
}

export const INITIAL_FILTERS: FilterState = {
    query: "",
    categories: [],
    mealTypes: [],
    nutritionFocus: [],
    excludedFoods: [],
    minCalories: 0,
    maxCalories: 2000,
    minProtein: 0,
    maxProtein: 200,
    minCarbs: 0,
    maxCarbs: 500,
    minFat: 0,
    maxFat: 200,
    onlyMyFoods: false,
    selectedCollectionId: null,
    onlyCollections: false,
    aiEnabled: false
};

const ITEMS_PER_PAGE = 12;

/**
 * AI Recommendation Hook Placeholder
 * In a real SaaS, this would call an API with user preferences.
 */
function useAIRecommendations(enabled: boolean) {
    return useMemo(() => {
        if (!enabled) return null;
        // Mock AI weights/scores
        return new Map<string, number>();
    }, [enabled]);
}

export function useDiscover() {
    const { 
        savedFoods, 
        blockedFoods, 
        collections, 
        toggleSaveFood, 
        blockFood,
        loading: contextLoading
    } = useGlobalFoodState();
    
    const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
    const [page, setPage] = useState(1);
    const aiScores = useAIRecommendations(filters.aiEnabled);

    // Reset logic
    const isFiltered = useMemo(() => {
        return JSON.stringify(filters) !== JSON.stringify(INITIAL_FILTERS);
    }, [filters]);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setPage(1);
    }, []);

    // Filter Logic
    const filteredFoods = useMemo(() => {
        let result = FULL_DISCOVER_DATABASE.filter(food => {
            // Global Exclusion (Blocked)
            if (blockedFoods.includes(food.id)) return false;

            // 1. Search filter
            if (filters.query) {
                const q = filters.query.toLowerCase();
                const nameMatch = food.name.toLowerCase().includes(q);
                const descMatch = food.description.toLowerCase().includes(q);
                if (!nameMatch && !descMatch) return false;
            }

            // 2. Category filter
            if (filters.categories.length > 0 && !filters.categories.includes(food.category)) {
                return false;
            }

            // 3. Collection filter
            if (filters.selectedCollectionId) {
                const collection = collections.find(c => c.id === filters.selectedCollectionId);
                if (collection && !collection.foodIds.includes(food.id)) return false;
            }

            if (filters.onlyCollections) {
                const isInAnyCollection = collections.some(c => c.foodIds.includes(food.id));
                if (!isInAnyCollection) return false;
            }

            // 4. Excluded foods filter
            if (filters.excludedFoods.length > 0) {
                const nameMatch = filters.excludedFoods.some(ex => food.name.toLowerCase().includes(ex.toLowerCase()));
                if (nameMatch) return false;
            }

            // 5. Nutrition Focus filter (STRICT AND LOGIC)
            if (filters.nutritionFocus.length > 0) {
                // Safe Data Access
                const p = food.nutrition?.protein ?? 0;
                const c = food.nutrition?.carbs ?? 0;
                const f = food.nutrition?.fat ?? 0;
                const fiber = food.nutrition?.fiber ?? 0;
                const sodium = food.nutrition?.sodium ?? 0;

                const matchesAllFocus = filters.nutritionFocus.every(focus => {
                    switch (focus) {
                        case "High Protein": return p >= 20;
                        case "Low Carb": return c <= 20;
                        case "Low Fat": return f <= 10;
                        case "High Fiber": return fiber >= 5;
                        case "Low Sodium": return sodium <= 140;
                        case "Keto": return c <= 20 && f > p;
                        case "Vegan": return food.isVegan === true;
                        case "Paleo": return food.isPaleo === true;
                        default: return true;
                    }
                });

                if (!matchesAllFocus) return false;
            }

            // Additional range filters
            if (food.nutrition.calories < filters.minCalories || food.nutrition.calories > filters.maxCalories) return false;
            if (food.nutrition.protein < filters.minProtein || food.nutrition.protein > filters.maxProtein) return false;
            if (food.nutrition.carbs < filters.minCarbs || food.nutrition.carbs > filters.maxCarbs) return false;
            if (food.nutrition.fat < filters.minFat || food.nutrition.fat > filters.maxFat) return false;

            // Meal Types (Specialized filter)
            if (filters.mealTypes.length > 0 && !food.mealTypes.some(mt => filters.mealTypes.includes(mt))) {
                return false;
            }

            // My Foods Toggle
            if (filters.onlyMyFoods && !savedFoods.includes(food.id)) {
                return false;
            }

            return true;
        });

        // AI Sorting if enabled
        if (filters.aiEnabled && aiScores) {
            result = [...result].sort((a, b) => (aiScores.get(b.id) || 0) - (aiScores.get(a.id) || 0));
        }

        return result;
    }, [filters, savedFoods, blockedFoods, collections, aiScores]);

    // Paginated Foods
    const displayFoods = useMemo(() => {
        return filteredFoods.slice(0, page * ITEMS_PER_PAGE);
    }, [filteredFoods, page]);

    const hasMore = displayFoods.length < filteredFoods.length;

    const loadMore = useCallback(() => {
        if (hasMore) setPage(p => p + 1);
    }, [hasMore]);

    return {
        filters,
        setFilters: (f: Partial<FilterState>) => {
            setFilters(prev => ({ ...prev, ...f }));
            setPage(1);
        },
        resetFilters,
        isFiltered,
        displayFoods,
        loading: contextLoading,
        hasMore,
        loadMore,
        savedFoods,
        toggleSaveFood,
        blockFood,
        collections
    };
}
