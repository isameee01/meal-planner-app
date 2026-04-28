export type ActivityLevelId = "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";

export type BodyFatLevel = "low" | "medium" | "high";

export type Sex = "male" | "female" | "non-binary";

export type DietType = "anything" | "keto" | "mediterranean" | "paleo" | "vegan" | "vegetarian";

export interface UserPhysicalStats {
    name: string;
    profileImage?: string;
    sex: Sex;
    height: { ft: number; in: number };
    heightCm?: number;
    weight: number; // Stored as KG
    weightUnit: "kg" | "lbs";
    age: number;
    bodyFat: BodyFatLevel;
    activityLevel: ActivityLevelId;
    migrationVersion?: number;
}

export type GoalType = "lose" | "maintain" | "gain";
export type GoalMode = "general" | "exact";

export interface UserGoal {
    goalMode: GoalMode;
    // general mode
    goalType?: GoalType;
    // exact mode
    targetWeightKg?: number;
    weeklyChangeKg?: number;
    needsRecalculation: boolean;
}

export interface UserProfile {
    id: string; // auth.uid()
    fullName: string;
    weightKg: number;
    heightCm: number;
    age: number;
    sex: Sex;
    activityLevel: ActivityLevelId;
    goalType: GoalType;
    goalMode: GoalMode;
    targetWeightKg?: number;
    weeklyChangeKg?: number;
    dietType: DietType;
    calorieTarget: number;
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;
    role: "admin" | "user";
    updatedAt: string;
}
