import { ActivityLevelId, Sex, GoalType, GoalMode, DietType } from "../types/user";

export interface PhysicalMetrics {
    weight: number; // kg
    height: number; // cm
    age: number;
    gender: Sex;
    activityLevel: ActivityLevelId;
}

export interface NutritionProfile {
    tdee: number;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor
 */
export function calculateBMR(metrics: PhysicalMetrics): number {
    const { weight, height, age, gender } = metrics;
    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    
    if (gender === "male") {
        bmr += 5;
    } else if (gender === "female") {
        bmr -= 161;
    } else {
        // Non-binary or other: average of male and female
        bmr -= 78;
    }
    
    return Math.round(bmr);
}

/**
 * Activity Multipliers
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevelId, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevelId): number {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate Final Calories and Macros based on Goal and Diet
 */
export function calculateNutritionProfile(
    tdee: number, 
    goalType: GoalType, 
    goalMode: GoalMode = "general",
    targetWeightKg?: number,
    weeklyChangeKg?: number,
    currentWeightKg?: number,
    dietType: DietType = "anything"
): NutritionProfile {
    let calories = tdee;
    
    if (goalMode === "general") {
        if (goalType === "lose") {
            calories -= 500; // Standard 500kcal deficit for ~0.5kg/week
        } else if (goalType === "gain") {
            calories += 300; // Lean bulk
        }
    } else if (goalMode === "exact" && targetWeightKg && currentWeightKg && weeklyChangeKg) {
        const dailyAdjustment = (weeklyChangeKg * 7700) / 7;
        if (targetWeightKg < currentWeightKg) {
            calories -= dailyAdjustment;
        } else if (targetWeightKg > currentWeightKg) {
            calories += dailyAdjustment;
        }
    }

    // Safety minimums
    calories = Math.max(calories, 1200);

    // Macro Distribution Maps (P/C/F)
    const DIET_MACROS: Record<DietType, { p: number, c: number, f: number }> = {
        anything:      { p: 0.30, c: 0.40, f: 0.30 },
        keto:          { p: 0.25, c: 0.05, f: 0.70 },
        mediterranean: { p: 0.25, c: 0.45, f: 0.30 },
        paleo:         { p: 0.35, c: 0.25, f: 0.40 },
        vegan:         { p: 0.20, c: 0.50, f: 0.30 },
        vegetarian:    { p: 0.25, c: 0.45, f: 0.30 }
    };

    const dist = DIET_MACROS[dietType] || DIET_MACROS.anything;
    const pPct = dist.p;
    const cPct = dist.c;
    const fPct = dist.f;

    // Macros: Protein (4 kcal/g), Carbs (4 kcal/g), Fat (9 kcal/g)
    const protein = Math.round((calories * pPct) / 4);
    const carbs = Math.round((calories * cPct) / 4);
    const fat = Math.round((calories * fPct) / 9);

    return {
        tdee,
        calories: Math.round(calories),
        macros: { protein, carbs, fat }
    };
}
