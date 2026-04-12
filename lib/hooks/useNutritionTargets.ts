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
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
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

    return {
        targets,
        isLoaded,
        addTarget,
        updateTarget,
        deleteTarget
    };
}

export function generateTargetFromProfile(): NutritionTarget {
    let weight = 70; // default 70kg
    let goal = 'maintain';
    
    try {
        const profileStr = localStorage.getItem("user_profile");
        if (profileStr) {
            const profile = JSON.parse(profileStr);
            if (profile.weight) weight = Number(profile.weight);
            if (profile.goal) goal = profile.goal;
        }
    } catch(e) {
        // ignore
    }

    let calories = weight * 26;
    if (goal === 'lose') calories = weight * 22;
    if (goal === 'gain') calories = weight * 30;

    const proteinGrams = weight * 1.8;
    const proteinPct = (proteinGrams * 4) / calories * 100;
    
    const fatsPct = 25;
    const carbsPct = Math.max(0, 100 - proteinPct - fatsPct);

    // Ranges as specified
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
        fiber: 30, // defaults
        sodium: 2300,
        cholesterol: 300,
        createdAt: new Date().toISOString()
    };
}
