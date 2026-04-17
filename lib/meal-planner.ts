import { FoodItem, FOOD_DATABASE, MealType } from "./food-db";
import { NutritionProfile } from "./nutrition";
import { GeneratorSettings } from "../types/settings";

export interface UserPreferences {
    selectedCategories: string[];
    favoriteFoodIds: string[];
    excludedFoodIds: string[];
    customFoods: FoodItem[];
    mealSlots: string[]; // e.g., ["Breakfast", "Lunch", "Dinner", "Snack"]
    intelligentGeneration: boolean;
    settings: GeneratorSettings; // Functional settings
}

export interface GeneratedMeal {
    slot: string;
    items: {
        food: FoodItem; // This will now carry recipe details if AI generated
        amount: number; // multiplier for the base serving
    }[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    // Recipe fields for the whole meal (optional for AI generation)
    recipe?: {
        directions: string[];
        prepTime?: number;
        cookTime?: number;
        description: string;
        image?: string;
    };
}

/**
 * Shuffle utility for randomness
 */
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Scoring System for Food Items
 * Now includes functional logic for Price, Focus, and Exclusions
 */
function scoreFood(
    food: FoodItem, 
    prefs: UserPreferences, 
    dayHistory: string[] = [], 
    planHistory: string[] = []
): number {
    let score = 0;
    const { settings } = prefs;
    
    // 1. Base Score
    score += 50; 

    // 2. Category Match
    if (prefs.selectedCategories.includes(food.category)) score += 100;

    // 3. Favorites & Exclusions
    if (prefs.favoriteFoodIds.includes(food.id)) score += 200;
    if (prefs.excludedFoodIds.includes(food.id)) return -1000;

    // 4. Price Limit Logic (Safeguard 2: Penalty instead of hard filter)
    const priceLimitValue = {
        'none': 3,
        'low': 1,
        'medium': 2,
        'high': 3
    }[settings.priceLimit] || 2;

    if (food.priceScore > priceLimitValue) {
        // Penalty increases with the gap
        score -= (food.priceScore - priceLimitValue) * 150;
    }

    // 5. Focus Logic (Safeguard 3)
    switch (settings.focus) {
        case "variety":
            // Heavy penalty for daily repeats
            if (dayHistory.includes(food.id)) score -= 300;
            // Moderate penalty for weekly repeats
            if (planHistory.includes(food.id)) score -= 100;
            // Add randomness
            score += Math.random() * 50;
            break;
            
        case "groceries":
            // Reward foods already in the plan (batch buy)
            if (planHistory.includes(food.id)) score += 150;
            break;
            
        case "macros":
            // Prioritize foods with higher nutrient density (proxy by protein/cal ratio for this demo)
            const nutrientDensity = (food.protein / (food.calories || 1)) * 100;
            score += nutrientDensity;
            break;
            
        case "balanced":
        default:
            // Soft variety
            if (dayHistory.includes(food.id)) score -= 100;
            break;
    }

    return score;
}

/**
 * Meal Planner Engine (Strategic Production Version)
 */
export function generateMealPlan(
    profile: NutritionProfile,
    preferences: UserPreferences
): GeneratedMeal[] {
    const { mealSlots, intelligentGeneration, settings } = preferences;
    const { calories, macros } = profile;

    console.log("[Generator] Synthesis starting. Target:", calories, "kcal");

    if (!intelligentGeneration) {
        return mealSlots.map(slot => ({
            slot,
            items: [],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0
        }));
    }

    const slotSplits: Record<string, number> = {
        "Breakfast": 0.25,
        "Lunch": 0.35,
        "Dinner": 0.30,
        "Snack": 0.10
    };

    const fullDb = [...FOOD_DATABASE, ...preferences.customFoods];
    const dayUsedIds: string[] = []; 
    const plan: GeneratedMeal[] = [];

    mealSlots.forEach(slot => {
        const split = slotSplits[slot] || (1 / mealSlots.length);
        const targetCals = calories * split;

        // 1. Candidate Selection with Strict Meal Type Alignment
        const normalizedSlot = slot.toLowerCase() as MealType;
        const candidates = fullDb.filter(f => f.mealTypes.includes(normalizedSlot));

        // 2. Intelligent Scoring
        let scored = shuffle(candidates)
            .map(f => ({ 
                food: f, 
                score: scoreFood(f, preferences, dayUsedIds, plan.flatMap(m => m.items.map(i => i.food.id))) 
            }))
            .filter(f => f.score > -500) 
            .sort((a, b) => b.score - a.score);

        // 3. SAFE FALLBACK: If candidate pool is too small due to restrictions, inject a reliable staple
        if (scored.length < 3) {
            console.warn(`[Generator] Low candidates for ${slot}. Using staple fallback.`);
            const fallback = getFallbackStaple(normalizedSlot);
            scored = [{ food: fallback, score: 1000 }];
        }

        // 4. Meal Composition Logic (Protein + Carb + Fat/Veggie)
        // For Breakfast, we also look for Smoothies/Snacks
        const proteins = scored.filter(f => f.food.category === "protein" || f.food.category === "smoothie");
        const carbs = scored.filter(f => f.food.category === "carb");
        const fats = scored.filter(f => f.food.category === "fat" || f.food.category === "snack" || f.food.category === "veggie");

        // Strategy: Pick the best available trio, or fallback to the single best item if it's a 'complete' meal (smoothie/snack)
        let selected: FoodItem[] = [];
        if (proteins.length > 0 && carbs.length > 0 && fats.length > 0) {
            selected = [proteins[0].food, carbs[0].food, fats[0].food];
        } else if (scored.length > 0) {
            selected = [scored[0].food];
        } else {
            selected = [getFallbackStaple(normalizedSlot)];
        }

        // 5. Macro-Aware Portion Scaling
        // Logic: Prioritize protein hit first, then fill remainder with carbs/fats
        dayUsedIds.push(...selected.map(f => f.id));

        const roundPortion = (val: number) => {
            let rounded = settings.allowHalfServings 
                ? Math.round(val * 2) / 2 
                : Math.round(val);
            return Math.max(0.5, rounded); // Minimum half serving
        };

        const totalSelectedCals = selected.reduce((sum, f) => sum + f.calories, 0);
        const baseMultiplier = targetCals / (totalSelectedCals || 1);

        const items = selected.map(f => {
            let multiplier = baseMultiplier;
            // Adjustment: If it's a protein-only food, we can be more aggressive to hit macro targets
            if (f.category === "protein" && f.protein > 15) {
                multiplier *= 1.1; // Slight nudge for muscle gain focus/macros
            }
            return { food: f, amount: roundPortion(multiplier) };
        });

        // 6. Plan Aggregation
        const mealCals = items.reduce((acc, i) => acc + i.food.calories * i.amount, 0);
        const mealProtein = items.reduce((acc, i) => acc + i.food.protein * i.amount, 0);
        const mealFat = items.reduce((acc, i) => acc + i.food.fat * i.amount, 0);
        const mealTotalCarbs = items.reduce((acc, i) => acc + i.food.carbs * i.amount, 0);
        const mealFiber = items.reduce((acc, i) => acc + (i.food.fiber || 0) * i.amount, 0);
        
        const displayCarbs = settings.carbsType === "net" 
            ? Math.max(0, mealTotalCarbs - mealFiber)
            : mealTotalCarbs;

        plan.push({
            slot,
            items,
            totalCalories: Math.round(mealCals),
            totalProtein: Math.round(mealProtein),
            totalCarbs: Math.round(displayCarbs),
            totalFat: Math.round(mealFat)
        });
    });

    return plan;
}

/**
 * RECOVERY SYSTEM: Returns a staple food item if generation pool is empty.
 */
function getFallbackStaple(slot: MealType): FoodItem {
    const staples: Record<MealType, string> = {
        "breakfast": "p6", // Egg
        "lunch": "p1",     // Chicken
        "dinner": "p3",    // Beef
        "snack": "c7"      // Banana
    };
    const id = staples[slot] || "p1";
    return FOOD_DATABASE.find(f => f.id === id) || FOOD_DATABASE[0];
}
