import { FoodItem } from "../discover-db";
import { PrimaryDiet, FoodExclusion } from "../../types/diet";

export function filterFoods(food: FoodItem, exclusions: FoodExclusion[], diet: PrimaryDiet | null, blockedFoods: string[] = []): boolean {
    const foodNameLower = food.name.toLowerCase().trim();
    const foodTagsLower = food.tags.map(t => t.toLowerCase().trim());

    // 0. Check Global Blocked Foods (HARD RESTRICTION)
    const normalizedBlocks = blockedFoods.map(b => b.toLowerCase().trim());
    if (normalizedBlocks.includes(foodNameLower)) return false;
    // Also check if the ID is blocked (fallback)
    if (blockedFoods.includes(food.id)) return false;

    // 1. Check Primary Diet
    if (diet) {
        // Diet exclusions are strings
        for (const dietExclusion of diet.exclusions) {
            const exLow = dietExclusion.toLowerCase();
            
            // Check if exclusion matches tags
            if (foodTagsLower.includes(exLow)) return false;
            
            // Check if exclusion matches name loosely
            if (foodNameLower.includes(exLow)) return false;
            
            // Special custom rules mapped to exclusions strings
            if (exLow === "meat" && foodTagsLower.some(t => ["chicken", "beef", "pork", "steak", "meat"].includes(t))) return false;
            if (exLow === "poultry" && foodTagsLower.some(t => ["chicken", "turkey"].includes(t))) return false;
            if (exLow === "seafood" || exLow === "fish") {
                if (foodTagsLower.some(t => ["fish", "salmon", "shrimp", "seafood", "tuna", "cod"].includes(t))) return false;
            }
            if (exLow === "dairy" && foodTagsLower.some(t => ["milk", "cheese", "yogurt", "dairy", "butter", "ghee"].includes(t))) return false;
        }
    }

    // 2. Check User Custom Exclusions
    for (const ex of exclusions) {
        const exLow = ex.name.toLowerCase();
        
        // Exact Tag match
        if (foodTagsLower.includes(exLow)) return false;
        
        // Name substring match
        if (foodNameLower.includes(exLow)) return false;
        
        // Category match
        if (food.category.toLowerCase() === exLow) return false;
    }

    return true;
}
