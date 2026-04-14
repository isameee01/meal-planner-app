import { useState, useEffect, useCallback } from "react";
import { NutritionTarget, CreateNutritionTargetInput } from "../../types/nutrition";

const STORAGE_KEY = "nutrition_targets";

export function useNutritionTargets() {
    const [targets, setTargets] = useState<NutritionTarget[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadTargets = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.length > 0) {
                    setTargets(parsed);
                } else {
                    const autoTarget = generateTargetFromProfile();
                    setTargets([autoTarget]);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify([autoTarget]));
                }
            } else {
                const autoTarget = generateTargetFromProfile();
                setTargets([autoTarget]);
                localStorage.setItem(STORAGE_KEY, JSON.stringify([autoTarget]));
            }
        } catch (e) {
            console.error("Failed to load nutrition targets:", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadTargets();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadTargets();
            }
            if (e.key === "user_stats") {
                // When stats change, we might want to refresh targets
                loadTargets();
            }
        };

        const handleCustomEvent = () => {
            loadTargets();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("user_stats_updated", handleCustomEvent);
        
        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("user_stats_updated", handleCustomEvent);
        };
    }, [loadTargets]);

    const addTarget = (input: CreateNutritionTargetInput) => {
        const newTarget: NutritionTarget = {
            ...input,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        };

        setTargets(prev => {
            const next = [newTarget, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const updateTarget = (id: string, input: CreateNutritionTargetInput) => {
        setTargets(prev => {
            const next = prev.map(t => t.id === id ? { ...t, ...input } : t);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const deleteTarget = (id: string) => {
        setTargets(prev => {
            const next = prev.filter(t => t.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const getActiveTarget = useCallback(() => {
        return targets[0] || null;
    }, [targets]);

    return {
        targets,
        activeTarget: targets[0] || null,
        isLoaded,
        addTarget,
        updateTarget,
        deleteTarget,
        getActiveTarget
    };
}

export function generateTargetFromProfile(): NutritionTarget {
    let weight = 70; 
    let heightCm = 175;
    let age = 30;
    let sex: "male" | "female" = "male";
    let activityMultiplier = 1.2;
    
    // Default goal state
    let goalMode: "general" | "exact" = "general";
    let goalType: "lose" | "maintain" | "gain" = "maintain";
    let targetWeightKg = 70;
    let weeklyChangeKg = 0.5;

    try {
        const statsStr = localStorage.getItem("user_stats");
        if (statsStr) {
            const stats = JSON.parse(statsStr);
            if (stats.weight) weight = Number(stats.weight);
            if (stats.age) age = Number(stats.age);
            if (stats.sex) sex = (stats.sex === "female" ? "female" : "male");
            
            if (stats.height) {
                heightCm = (stats.height.ft * 30.48) + (stats.height.in * 2.54);
            }

            const multipliers: Record<string, number> = {
                "sedentary": 1.2,
                "lightly_active": 1.375,
                "moderately_active": 1.55,
                "very_active": 1.725,
                "extra_active": 1.725
            };
            activityMultiplier = multipliers[stats.activityLevel] || 1.2;
        }

        const goalStr = localStorage.getItem("user_goal");
        if (goalStr) {
            const userGoal = JSON.parse(goalStr);
            goalMode = userGoal.goalMode || "general";
            goalType = userGoal.goalType || "maintain";
            targetWeightKg = userGoal.targetWeightKg || weight;
            weeklyChangeKg = userGoal.weeklyChangeKg || 0.5;
        } else {
            // Fallback to old user_profile if exists
            const profileStr = localStorage.getItem("user_profile");
            if (profileStr) {
                const profile = JSON.parse(profileStr);
                if (profile.goal === "lose") goalType = "lose";
                if (profile.goal === "gain") goalType = "gain";
            }
        }
    } catch(e) {
        console.error("Error parsing profile for nutrition target:", e);
    }

    // 1. Calculate BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
    if (sex === "male") bmr += 5;
    else bmr -= 161;

    // 2. Calculate TDEE
    let tdee = bmr * activityMultiplier;

    // 3. Apply Goal Adjustment
    let calories = tdee;
    if (goalMode === "general") {
        if (goalType === "lose") calories -= 400;
        if (goalType === "gain") calories += 300;
    } else {
        const dailyAdjustment = (weeklyChangeKg * 7700) / 7;
        if (targetWeightKg < weight) {
            calories -= dailyAdjustment;
        } else if (targetWeightKg > weight) {
            calories += dailyAdjustment;
        }
    }

    // Ensure calories don't drop to dangerous levels
    calories = Math.max(1200, Math.round(calories));

    // 4. Macro Distribution (Standard balanced: 30% Protein, 25% Fat, 45% Carbs)
    // Protein: 1.8g per kg is a better rule of thumb for active people
    const proteinGrams = weight * 1.8;
    const proteinCalories = proteinGrams * 4;
    const proteinPct = (proteinCalories / calories) * 100;
    
    const fatsPct = 25;
    const carbsPct = Math.max(0, 100 - proteinPct - fatsPct);

    // Ranges
    const pMin = Math.round(proteinPct * 0.9);
    const pMax = Math.round(proteinPct * 1.2);
    
    const fMin = Math.round(fatsPct * 0.8);
    const fMax = Math.round(fatsPct * 1.2);
    
    const cMin = Math.round(carbsPct * 0.8);
    const cMax = Math.round(carbsPct * 1.2);

    return {
        id: crypto.randomUUID(),
        name: "Auto-Generated Target",
        calories: Math.round(calories),
        carbsMin: cMin,
        carbsMax: cMax,
        fatsMin: fMin,
        fatsMax: fMax,
        proteinMin: pMin,
        proteinMax: pMax,
        fiber: 30,
        sodium: 2300,
        cholesterol: 300,
        createdAt: new Date().toISOString()
    };
}
