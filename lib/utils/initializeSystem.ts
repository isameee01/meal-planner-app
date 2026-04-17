import { UserPhysicalStats, Sex, ActivityLevelId } from "../../types/user";
import { 
    calculateBMR, 
    calculateTDEE, 
    calculateNutritionProfile, 
    NutritionProfile 
} from "../nutrition";

const CORE_USER_STATS_KEY = "user_stats";
const NUTRITION_PROFILE_KEY = "nutritionProfile";
const ONBOARD_ABOUT_KEY = "onboarding_about";
const ONBOARD_GOAL_KEY = "onboarding_goal";
const ONBOARD_PREFS_KEY = "onboarding_preferences";
const ONBOARD_MEALS_KEY = "onboarding_meals";

// Validation Schema Helper
function isValidStats(stats: any): stats is UserPhysicalStats {
    return (
        stats &&
        typeof stats.weight === "number" && stats.weight > 0 &&
        typeof stats.age === "number" && stats.age > 0 &&
        stats.height && typeof stats.height.ft === "number" &&
        stats.activityLevel
    );
}

/**
 * REPAIR SYSTEM DATA
 * Self-healing logic that ensures the app always has valid data.
 * Migrates from legacy keys to production keys if needed.
 */
export function repairSystemData(): { 
    stats: UserPhysicalStats; 
    profile: NutritionProfile; 
    needsSetup: boolean 
} {
    console.log("[SystemInit] Starting Integrity Audit...");

    // 1. Load Everything
    const statsRaw = localStorage.getItem(CORE_USER_STATS_KEY);
    const profileRaw = localStorage.getItem(NUTRITION_PROFILE_KEY);
    const aboutRaw = localStorage.getItem(ONBOARD_ABOUT_KEY);
    const goalRaw = localStorage.getItem(ONBOARD_GOAL_KEY);

    let stats: UserPhysicalStats | null = null;
    let profile: NutritionProfile | null = null;
    let needsSetup = false;

    // 2. Parse Core Stats
    if (statsRaw) {
        try {
            const parsed = JSON.parse(statsRaw);
            if (isValidStats(parsed)) {
                stats = parsed;
                console.log("[SystemInit] Production Stats: OK");
            }
        } catch (e) {
            console.error("[SystemInit] Stats Corrupted:", e);
        }
    }

    // 3. Parse Onboarding Fallback
    if (!stats && aboutRaw) {
        try {
            const about = JSON.parse(aboutRaw);
            const goal = localStorage.getItem(ONBOARD_GOAL_KEY) || "maintain";
            
            console.log("[SystemInit] Migrating from Onboarding...");
            
            stats = {
                name: about.name || "",
                sex: (about.gender === "female" ? "female" : (about.gender === "male" ? "male" : "non-binary")) as Sex,
                height: { ft: about.ft || 5, in: about.in || 10 },
                heightCm: about.height || 177,
                weight: about.weight || 70,
                weightUnit: "kg",
                age: about.age || 30,
                bodyFat: "medium",
                activityLevel: (about.activityLevel || "moderately_active") as ActivityLevelId,
                migrationVersion: 1
            };
            
            localStorage.setItem(CORE_USER_STATS_KEY, JSON.stringify(stats));
        } catch (e) {
            console.error("[SystemInit] Migration Failed:", e);
        }
    }

    // 4. Handle Empty State
    if (!stats) {
        console.warn("[SystemInit] NO VALID DATA FOUND.");
        needsSetup = true;
        // Return defaults to prevent crashes
        stats = {
            name: "",
            sex: "male",
            height: { ft: 5, in: 10 },
            weight: 70,
            weightUnit: "kg",
            age: 30,
            bodyFat: "medium",
            activityLevel: "moderately_active",
            migrationVersion: 1
        };
    }

    // 5. Build / Validate Nutrition Profile
    if (profileRaw) {
        try {
            profile = JSON.parse(profileRaw);
        } catch (e) {}
    }

    if (!profile || !profile.calories || isNaN(profile.calories)) {
        console.log("[SystemInit] Rebuilding Nutrition Profile...");
        const metrics = {
            weight: stats.weight,
            height: stats.heightCm || Math.round((stats.height.ft * 30.48) + (stats.height.in * 2.54)),
            age: stats.age,
            gender: stats.sex === "female" ? "female" as const : "male" as const,
            activityLevel: stats.activityLevel
        };

        try {
            const bmr = calculateBMR(metrics);
            const tdee = calculateTDEE(bmr, stats.activityLevel);
            const goal = (localStorage.getItem(ONBOARD_GOAL_KEY) || "maintain") as any;
            profile = calculateNutritionProfile(tdee, goal);
            
            localStorage.setItem(NUTRITION_PROFILE_KEY, JSON.stringify(profile));
            console.log("[SystemInit] Profile Restored:", profile.calories, "kcal");
        } catch (e) {
            console.error("[SystemInit] Profile Reconstruction Failed:", e);
        }
    }

    // 6. Ensure Preferences Exist (Safeguard)
    if (!localStorage.getItem(ONBOARD_PREFS_KEY)) {
        console.log("[SystemInit] Initializing default preferences...");
        localStorage.setItem(ONBOARD_PREFS_KEY, JSON.stringify({}));
    }

    if (!localStorage.getItem(ONBOARD_MEALS_KEY)) {
        console.log("[SystemInit] Initializing default meal slots...");
        localStorage.setItem(ONBOARD_MEALS_KEY, JSON.stringify([
            { id: "1", name: "Breakfast" },
            { id: "2", name: "Lunch" },
            { id: "3", name: "Dinner" }
        ]));
    }

    return { stats, profile: profile!, needsSetup };
}
