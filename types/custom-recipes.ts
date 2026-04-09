export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";

export interface CustomFood {
    id: string;
    name: string;
    description?: string;
    image?: string;
    servingSize: number;
    servingUnit: 'grams' | 'servings';
    servingsPerPackage?: number;
    price?: number;
    calories: number;
    carbs: number;
    fats: number;
    protein: number;
    createdAt: string;
}

export interface CustomRecipe {
    id: string;
    name: string;
    description?: string;
    image?: string;
    mealCategory: 'main' | 'side';
    targetMeals: MealType[];
    makesGoodLeftovers: boolean;
    prepTime: number; // minutes
    cookTime: number; // minutes
    yields: number; // servings
    servingDescription?: string;
    canBeMadeForOne: boolean;
    ingredients: string[];
    steps: string[];
    createdAt: string;
}
