/**
 * Food Mapping Utility
 * Connects AI-suggested food names to the local database.
 */

import { FOOD_DATABASE, FoodItem } from "../food-db";

/**
 * Normalizes a string for comparison by lowercasing and removing special characters.
 */
function normalize(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

/**
 * Fuzzy matches a food name against the local database.
 */
export function matchFood(aiName: string): FoodItem | null {
    const normalizedAI = normalize(aiName);
    
    // 1. Exact match (normalized)
    const exactMatch = FOOD_DATABASE.find(f => normalize(f.name) === normalizedAI);
    if (exactMatch) return exactMatch;
    
    // 2. Partial match (AI name contains DB name or vice-versa)
    const partialMatch = FOOD_DATABASE.find(f => {
        const normalizedDB = normalize(f.name);
        return normalizedAI.includes(normalizedDB) || normalizedDB.includes(normalizedAI);
    });
    if (partialMatch) return partialMatch;
    
    return null;
}

/**
 * Creates a "Virtual" FoodItem for AI suggestions that don't match the database.
 * This ensures the UI doesn't break and macros are still tracked.
 */
export function createAIMeal(name: string, macros: { calories: number; protein: number; carbs: number; fat: number; fiber?: number }): FoodItem {
    return {
        id: `ai-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        calories: macros.calories || 0,
        protein: macros.protein || 0,
        carbs: macros.carbs || 0,
        fat: macros.fat || 0,
        fiber: macros.fiber || 0,
        priceScore: 2, // Default to medium
        category: "protein", // Default to protein if unknown
        serving: "1 serving",
        tags: ["ai-generated"],
        mealTypes: ["breakfast", "lunch", "dinner", "snack"]
    };
}
