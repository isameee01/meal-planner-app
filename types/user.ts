export type ActivityLevelId = "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";

export type BodyFatLevel = "low" | "medium" | "high";

export type Sex = "male" | "female" | "non-binary";

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
