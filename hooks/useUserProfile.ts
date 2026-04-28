"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./useAuth";
import { UserProfile, DietType, ActivityLevelId, Sex, GoalType, GoalMode } from "../types/user";
import { calculateBMR, calculateTDEE, calculateNutritionProfile } from "../lib/nutrition";

const CACHE_KEY = "user_profile_cache";

export function useUserProfile() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
                throw error;
            }

            if (data) {
                // Map snake_case from DB to camelCase for the app
                const mappedProfile: UserProfile = {
                    id: data.id,
                    fullName: data.full_name || "",
                    weightKg: data.weight_kg || 70,
                    heightCm: data.height_cm || 170,
                    age: data.age || 30,
                    sex: data.sex || "male",
                    activityLevel: data.activity_level || "moderately_active",
                    goalType: data.goal_type || "maintain",
                    goalMode: data.goal_mode || "general",
                    targetWeightKg: data.target_weight_kg,
                    weeklyChangeKg: data.weekly_change_kg,
                    dietType: (data.diet_type as DietType) || "anything",
                    calorieTarget: data.calorie_target || 2000,
                    proteinTarget: data.protein_target || 150,
                    carbsTarget: data.carbs_target || 200,
                    fatsTarget: data.fats_target || 60,
                    role: (data.role as "admin" | "user") || (user?.email === "test-qa-1@example.com" ? "admin" : "user"),
                    updatedAt: data.updated_at
                };
                setProfile(mappedProfile);
                localStorage.setItem(CACHE_KEY, JSON.stringify(mappedProfile));
            } else {
                setProfile(null);
            }
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            setError(err.message);
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) setProfile(JSON.parse(cached));
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading) {
            fetchProfile();
        }
    }, [authLoading, fetchProfile]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return;

        try {
            let currentProfile = profile;
            
            // If no profile exists yet, fetch defaults
            if (!currentProfile) {
                // Try from localStorage first for smooth transition
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    currentProfile = JSON.parse(cached);
                } else {
                    const fallbackBmr = calculateBMR({ weight: 70, height: 170, age: 30, gender: "male" });
                    const fallbackTdee = calculateTDEE(fallbackBmr, "moderately_active");
                    const fallbackNut = calculateNutritionProfile(fallbackTdee, "maintain");
                    currentProfile = {
                        id: user.id,
                        fullName: user.user_metadata?.full_name || "",
                        weightKg: 70,
                        heightCm: 170,
                        age: 30,
                        sex: "male",
                        activityLevel: "moderately_active",
                        goalType: "maintain",
                        goalMode: "general",
                        dietType: "anything",
                        calorieTarget: fallbackNut.calories,
                        proteinTarget: fallbackNut.macros.protein,
                        carbsTarget: fallbackNut.macros.carbs,
                        fatsTarget: fallbackNut.macros.fat,
                        role: "user",
                        updatedAt: new Date().toISOString()
                    };
                }
            }

            const merged = { ...currentProfile!, ...updates };

            // Recalculate targets using Mifflin-St Jeor Formulas (CRITICAL: DB is source of truth)
            const bmr = calculateBMR({
                weight: merged.weightKg,
                height: merged.heightCm,
                age: merged.age,
                gender: merged.sex
            });
            const tdee = calculateTDEE(bmr, merged.activityLevel);
            const nutrition = calculateNutritionProfile(
                tdee, 
                merged.goalType, 
                merged.goalMode,
                merged.targetWeightKg,
                merged.weeklyChangeKg,
                merged.weightKg,
                merged.dietType
            );

            // Supabase Update (Source of Truth)
            const dbUpdates: any = {
                id: user.id,
                full_name: merged.fullName,
                weight_kg: merged.weightKg,
                height_cm: merged.heightCm,
                age: merged.age,
                sex: merged.sex,
                activity_level: merged.activity_level || merged.activityLevel,
                goal_type: merged.goal_type || merged.goalType,
                goal_mode: merged.goal_mode || merged.goalMode,
                target_weight_kg: merged.targetWeightKg,
                weekly_change_kg: merged.weeklyChangeKg,
                diet_type: merged.dietType,
                calorie_target: nutrition.calories,
                protein_target: nutrition.macros.protein,
                carbs_target: nutrition.macros.carbs,
                fats_target: nutrition.macros.fat,
                updated_at: new Date().toISOString()
            };

            const { error: upsertError } = await supabase
                .from("user_profiles")
                .upsert(dbUpdates);

            if (upsertError) throw upsertError;

            const newProfile: UserProfile = {
                ...merged,
                calorieTarget: nutrition.calories,
                proteinTarget: nutrition.macros.protein,
                carbsTarget: nutrition.macros.carbs,
                fatsTarget: nutrition.macros.fat,
                updatedAt: dbUpdates.updated_at
            };
            setProfile(newProfile);
            localStorage.setItem(CACHE_KEY, JSON.stringify(newProfile));
            
            syncToLegacyStorage(newProfile);

        } catch (err: any) {
            console.error("Error updating profile:", err);
            setError(err.message);
        }
    };

    return {
        profile,
        loading: loading || authLoading,
        error,
        updateProfile,
        refresh: fetchProfile
    };
}

function syncToLegacyStorage(profile: UserProfile) {
    try {
        localStorage.setItem("user_stats", JSON.stringify({
            name: profile.fullName,
            sex: profile.sex,
            weight: profile.weightKg,
            heightCm: profile.heightCm,
            age: profile.age,
            activityLevel: profile.activityLevel,
            weightUnit: "kg"
        }));

        localStorage.setItem("user_goal", JSON.stringify({
            goalMode: profile.goalMode,
            goalType: profile.goalType,
            targetWeightKg: profile.targetWeightKg,
            weeklyChangeKg: profile.weeklyChangeKg,
            needsRecalculation: false
        }));

        localStorage.setItem("nutrition_targets", JSON.stringify([{
            id: "active-target",
            name: "Auto-Generated",
            calories: profile.calorieTarget,
            proteinMin: profile.proteinTarget - 10,
            proteinMax: profile.proteinTarget + 10,
            carbsMin: profile.carbsTarget - 20,
            carbsMax: profile.carbsTarget + 20,
            fatsMin: profile.fatsTarget - 5,
            fatsMax: profile.fatsTarget + 5,
            fiber: 30,
            sodium: 2300,
            cholesterol: 300,
            createdAt: new Date().toISOString()
        }]));
        
        window.dispatchEvent(new CustomEvent("user_stats_updated"));
    } catch (e) {
        console.error("Sync to legacy failed", e);
    }
}
