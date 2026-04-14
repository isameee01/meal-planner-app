/**
 * CustomDailyDiet Food Database
 * Structured database of food items with nutrient profiles and meal-type tagging.
 */

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number; // Added for Net Carbs logic
    priceScore: 1 | 2 | 3; // 1: Cheap, 2: Medium, 3: Expensive
    category: "protein" | "carb" | "fat" | "veggie" | "smoothie" | "snack";
    serving: string;
    tags: string[];
    mealTypes: MealType[]; // Which meal slots this food is appropriate for
}

export const FOOD_DATABASE: FoodItem[] = [
    // --- BREAKFAST FOCUSED ---
    { id: "p4", name: "Greek Yogurt (Non-fat)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, priceScore: 2, category: "protein", serving: "100g", tags: ["probiotic"], mealTypes: ["breakfast", "snack"] },
    { id: "p6", name: "Hard Boiled Egg", calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, priceScore: 1, category: "protein", serving: "1 large", tags: ["whole-food"], mealTypes: ["breakfast", "snack"] },
    { id: "c4", name: "Oatmeal", calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7, priceScore: 1, category: "carb", serving: "100g cooked", tags: ["fiber"], mealTypes: ["breakfast"] },
    { id: "c7", name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, priceScore: 1, category: "carb", serving: "100g", tags: ["potassium"], mealTypes: ["breakfast", "snack"] },
    { id: "s1", name: "Berry Protein Smoothie", calories: 280, protein: 25, carbs: 30, fat: 5, fiber: 4.5, priceScore: 2, category: "smoothie", serving: "1 serving", tags: ["quick"], mealTypes: ["breakfast", "snack"] },
    { id: "s3", name: "Vegetable Omelette", calories: 220, protein: 15, carbs: 5, fat: 16, fiber: 1.2, priceScore: 2, category: "protein", serving: "3 eggs", tags: ["savory"], mealTypes: ["breakfast"] },

    // --- PROTEINS (LUNCH/DINNER) ---
    { id: "p1", name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, priceScore: 2, category: "protein", serving: "100g", tags: ["lean"], mealTypes: ["lunch", "dinner"] },
    { id: "p2", name: "Grilled Salmon", calories: 208, protein: 22, carbs: 0, fat: 13, fiber: 0, priceScore: 3, category: "protein", serving: "100g", tags: ["omega-3"], mealTypes: ["lunch", "dinner"] },
    { id: "p3", name: "Ground Beef (90/10)", calories: 176, protein: 20, carbs: 0, fat: 10, fiber: 0, priceScore: 2, category: "protein", serving: "100g", tags: ["iron"], mealTypes: ["lunch", "dinner"] },
    { id: "p5", name: "Tofu (Firm)", calories: 83, protein: 10, carbs: 2, fat: 5, fiber: 1.2, priceScore: 1, category: "protein", serving: "100g", tags: ["vegan"], mealTypes: ["lunch", "dinner"] },
    { id: "p7", name: "Canned Tuna", calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0, priceScore: 1, category: "protein", serving: "100g", tags: ["convenient"], mealTypes: ["lunch", "dinner"] },
    { id: "p8", name: "Turkey Breast", calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0, priceScore: 2, category: "protein", serving: "100g", tags: ["lean"], mealTypes: ["lunch", "dinner", "snack"] },

    // --- CARBS (LUNCH/DINNER) ---
    { id: "c1", name: "Brown Rice", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, priceScore: 1, category: "carb", serving: "100g cooked", tags: ["fiber"], mealTypes: ["lunch", "dinner"] },
    { id: "c2", name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3.3, priceScore: 1, category: "carb", serving: "100g", tags: ["vitamin-a"], mealTypes: ["lunch", "dinner"] },
    { id: "c3", name: "Quinoa", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, fiber: 2.8, priceScore: 2, category: "carb", serving: "100g cooked", tags: ["protein-rich"], mealTypes: ["lunch", "dinner"] },
    { id: "c5", name: "Whole Wheat Pasta", calories: 124, protein: 5.3, carbs: 25, fat: 0.9, fiber: 3.2, priceScore: 1, category: "carb", serving: "100g cooked", tags: ["complex"], mealTypes: ["lunch", "dinner"] },
    { id: "c6", name: "Lentils", calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, priceScore: 1, category: "carb", serving: "100g cooked", tags: ["iron"], mealTypes: ["lunch", "dinner"] },

    // --- FATS (UNIVERSAL) ---
    { id: "f1", name: "Avocado", calories: 160, protein: 2, carbs: 8.5, fat: 15, fiber: 6.7, priceScore: 2, category: "fat", serving: "100g", tags: ["healthy-fat"], mealTypes: ["breakfast", "lunch", "dinner", "snack"] },
    { id: "f2", name: "Extra Virgin Olive Oil", calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0, priceScore: 2, category: "fat", serving: "1 tbsp", tags: ["heart-healthy"], mealTypes: ["lunch", "dinner"] },
    { id: "f3", name: "Almonds", calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, priceScore: 2, category: "fat", serving: "28g", tags: ["crunchy"], mealTypes: ["snack", "breakfast"] },
    { id: "f4", name: "Peanut Butter", calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 1.9, priceScore: 1, category: "fat", serving: "2 tbsp", tags: ["energy"], mealTypes: ["snack", "breakfast"] },
    { id: "f5", name: "Chia Seeds", calories: 138, protein: 4.7, carbs: 12, fat: 8.7, fiber: 9.8, priceScore: 2, category: "fat", serving: "28g", tags: ["fiber"], mealTypes: ["breakfast", "snack"] },

    // --- VEGGIES (LUNCH/DINNER) ---
    { id: "v1", name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, priceScore: 1, category: "veggie", serving: "100g", tags: ["fiber"], mealTypes: ["lunch", "dinner"] },
    { id: "v2", name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, priceScore: 1, category: "veggie", serving: "100g", tags: ["iron"], mealTypes: ["lunch", "dinner", "breakfast"] },
    { id: "v3", name: "Asparagus", calories: 20, protein: 2.2, carbs: 3.7, fat: 0.1, fiber: 2.1, priceScore: 2, category: "veggie", serving: "100g", tags: ["vitamin-k"], mealTypes: ["lunch", "dinner"] },
    { id: "v4", name: "Zucchini", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, priceScore: 1, category: "veggie", serving: "100g", tags: ["low-cal"], mealTypes: ["lunch", "dinner"] },
    { id: "v5", name: "Bell Pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, priceScore: 1, category: "veggie", serving: "100g", tags: ["vitamin-c"], mealTypes: ["lunch", "dinner", "snack"] },

    // --- SNACKS ---
    { id: "s2", name: "Oat and Whey Bar", calories: 250, protein: 20, carbs: 25, fat: 8, fiber: 3, priceScore: 2, category: "snack", serving: "1 bar", tags: ["portable"], mealTypes: ["snack"] },
    { id: "s4", name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0, priceScore: 1, category: "protein", serving: "100g", tags: ["casein"], mealTypes: ["snack", "breakfast"] },
    { id: "s5", name: "Hummus", calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, priceScore: 1, category: "fat", serving: "100g", tags: ["plant-based"], mealTypes: ["snack", "lunch"] }
];
