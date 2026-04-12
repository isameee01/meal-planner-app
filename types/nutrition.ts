export interface NutritionTarget {
    id: string;
    name: string;
    calories: number;
    carbsMin: number;
    carbsMax: number;
    fatsMin: number;
    fatsMax: number;
    proteinMin: number;
    proteinMax: number;
    fiber: number;
    sodium: number;
    cholesterol: number;
    createdAt: string;
}

export type CreateNutritionTargetInput = Omit<NutritionTarget, "id" | "createdAt">;
