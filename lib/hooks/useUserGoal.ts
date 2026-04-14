"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserGoal, GoalMode, GoalType } from "../../types/user";

const STORAGE_KEY = "user_goal";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEFAULT_GOAL: UserGoal = {
    goalMode: "general",
    goalType: "maintain",
    targetWeightKg: 70,
    weeklyChangeKg: 0.5,
    needsRecalculation: false
};

export function useUserGoal() {
    const [goal, setGoal] = useState<UserGoal>(DEFAULT_GOAL);
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Load
    useEffect(() => {
        const loadGoal = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setGoal(JSON.parse(stored));
                } else {
                    // Initialize with defaults
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GOAL));
                }
            } catch (e) {
                console.error("Failed to load user goal", e);
            } finally {
                setIsLoaded(true);
            }
        };

        loadGoal();
    }, []);

    // Debounced Save
    const saveGoal = useCallback((newGoal: UserGoal) => {
        setStatus("saving");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoal));
                setStatus("saved");
                
                // Dispatch custom event for cross-app sync
                window.dispatchEvent(new CustomEvent("user_goal_updated", { detail: newGoal }));

                // Reset status to idle after a delay
                setTimeout(() => setStatus("idle"), 2000);
            } catch (e) {
                console.error("Failed to save goal", e);
                setStatus("error");
            }
        }, 500);
    }, []);

    const updateGoal = useCallback((updates: Partial<UserGoal>) => {
        setGoal(prev => {
            // If goalMode or goalType or targets change, we need recalculation
            const significantChange = 
                (updates.goalMode && updates.goalMode !== prev.goalMode) ||
                (updates.goalType && updates.goalType !== prev.goalType) ||
                (updates.targetWeightKg !== undefined && updates.targetWeightKg !== prev.targetWeightKg) ||
                (updates.weeklyChangeKg !== undefined && updates.weeklyChangeKg !== prev.weeklyChangeKg);

            const next = { 
                ...prev, 
                ...updates,
                needsRecalculation: significantChange ? true : (updates.needsRecalculation ?? prev.needsRecalculation)
            };
            saveGoal(next);
            return next;
        });
    }, [saveGoal]);

    const markRecalculated = () => {
        updateGoal({ needsRecalculation: false });
    };

    return {
        goal,
        updateGoal,
        markRecalculated,
        status,
        isLoaded
    };
}
