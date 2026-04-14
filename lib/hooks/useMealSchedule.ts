import { useState, useEffect, useCallback, useMemo } from "react";
import { Meal, MealSchedule, MealSize, DayOfWeek } from "../../types/meals";
import { useNutritionTargets } from "./useNutritionTargets";
import { useGeneratorSettings } from "./useGeneratorSettings";

const STORAGE_KEY = "meal_schedule_v2"; // Versioned to avoid conflicts with previous schema

const WEIGHTS: Record<MealSize, number> = {
    tiny: 1,
    normal: 2.5,
    big: 4
};

const DEFAULT_PREFERENCES = {
    foodTypes: 'all' as const,
    cooking: 'can-cook' as const,
    time: '< 30 min' as const,
    complexity: 'moderate' as const,
    categories: []
};

const DEFAULT_RECURRING = {
    onlyRecurring: false,
    applyFilters: true,
    foods: [],
    collections: []
};

const DEFAULT_ADVANCED = {
    skip: false,
    macroFocus: 'no-preference' as const,
    includeSideDish: 'auto' as const
};

export function useMealSchedule() {
    const { activeTarget } = useNutritionTargets();
    const [schedule, setSchedule] = useState<MealSchedule>({
        sameScheduleEachDay: true,
        firstDayOfWeek: 'Sunday',
        meals: []
    });
    const [isLoaded, setIsLoaded] = useState(false);
    const { settings } = useGeneratorSettings();

    // Initial Load
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setSchedule(JSON.parse(stored));
            } else {
                // Initialize with legacy if any or defaults
                const legacy = localStorage.getItem("meal_schedule");
                if (legacy) {
                    const parsedLegacy = JSON.parse(legacy);
                    const migratedMeals = parsedLegacy.meals.map((m: any) => ({
                        ...m,
                        familyMembers: 0,
                        preferences: DEFAULT_PREFERENCES,
                        recurring: DEFAULT_RECURRING,
                        advanced: DEFAULT_ADVANCED,
                        weight: WEIGHTS[m.size as MealSize] || 2.5
                    }));
                    const migrated = { ...parsedLegacy, meals: migratedMeals };
                    setSchedule(migrated);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
                } else {
                    const initialSchedule: MealSchedule = {
                        sameScheduleEachDay: true,
                        firstDayOfWeek: 'Sunday',
                        meals: []
                    };
                    setSchedule(initialSchedule);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSchedule));
                }
            }
        } catch (e) {
            console.error("Failed to load meal schedule:", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Safeguard 7: Localization Sync
    useEffect(() => {
        const globalFirstDay = settings.firstDayOfWeek;
        const mapped = (globalFirstDay.charAt(0).toUpperCase() + globalFirstDay.slice(1)) as DayOfWeek;
        
        if (isLoaded && schedule.firstDayOfWeek !== mapped) {
            saveSchedule({ ...schedule, firstDayOfWeek: mapped });
        }
    }, [settings.firstDayOfWeek, schedule.firstDayOfWeek, isLoaded, schedule, saveSchedule]);

    // Save on changes
    const saveSchedule = useCallback((newSchedule: MealSchedule) => {
        setSchedule(newSchedule);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSchedule));
    }, []);

    // CALCULATION ENGINE (Safety + Scaling)
    const calculatedMeals = useMemo(() => {
        if (!activeTarget || schedule.meals.length === 0) return schedule.meals;

        const totalWeight = schedule.meals.reduce((sum, meal) => sum + (WEIGHTS[meal.size] || 2.5), 0);
        
        // Safety check for division by zero
        const actualTotalWeight = totalWeight === 0 ? 1 : totalWeight;

        return schedule.meals.map(meal => {
            const weight = WEIGHTS[meal.size] || 2.5;
            const percentage = weight / actualTotalWeight;
            
            // Per Person Base Values
            const baseCals = Math.round(activeTarget.calories * percentage);
            
            // Multiplier for family scaling
            const multiplier = 1 + (meal.familyMembers || 0);

            // Re-calculate percentages for absolute macros based on targets
            const pAvg = ((activeTarget.proteinMin + activeTarget.proteinMax) / 2) / 100;
            const cAvg = ((activeTarget.carbsMin + activeTarget.carbsMax) / 2) / 100;
            const fAvg = ((activeTarget.fatsMin + activeTarget.fatsMax) / 2) / 100;

            return {
                ...meal,
                weight,
                percentage: percentage * 100,
                // Targets are stored as PER PERSON in the core object, 
                // but scaling will be applied in the UI or generation logic.
                // Request said: "meal targets should scale finalCalories = baseMealCalories * (1 + familyMembers)"
                // I will store the FINAL (scaled) values in the state as targets for that meal card.
                caloriesTarget: Math.round(baseCals * multiplier),
                proteinTarget: Math.round((baseCals * pAvg / 4) * multiplier),
                carbsTarget: Math.round((baseCals * cAvg / 4) * multiplier),
                fatsTarget: Math.round((baseCals * fAvg / 9) * multiplier),
            };
        });
    }, [schedule.meals, activeTarget]);

    const addMeal = useCallback((mealData: Omit<Meal, 'id' | 'weight' | 'percentage' | 'caloriesTarget' | 'proteinTarget' | 'carbsTarget' | 'fatsTarget'>) => {
        const newMeal: Meal = {
            ...mealData,
            id: crypto.randomUUID(),
            weight: WEIGHTS[mealData.size] || 2.5,
            percentage: 0,
            caloriesTarget: 0,
            proteinTarget: 0,
            carbsTarget: 0,
            fatsTarget: 0
        };

        const newMeals = [...schedule.meals, newMeal];
        saveSchedule({ ...schedule, meals: newMeals });
    }, [schedule, saveSchedule]);

    const updateMeal = useCallback((id: string, updates: Partial<Meal>) => {
        const newMeals = schedule.meals.map(m => 
            m.id === id ? { ...m, ...updates } : m
        );
        saveSchedule({ ...schedule, meals: newMeals });
    }, [schedule, saveSchedule]);

    const deleteMeal = useCallback((id: string) => {
        const newMeals = schedule.meals.filter(m => m.id !== id);
        saveSchedule({ ...schedule, meals: newMeals });
    }, [schedule, saveSchedule]);

    const toggleSameSchedule = useCallback((val: boolean) => {
        saveSchedule({ ...schedule, sameScheduleEachDay: val });
    }, [schedule, saveSchedule]);

    const setFirstDayOfWeek = useCallback((val: DayOfWeek) => {
        saveSchedule({ ...schedule, firstDayOfWeek: val });
    }, [schedule, saveSchedule]);

    const findDuplicateName = useCallback((name: string, excludeId?: string) => {
        return schedule.meals.some(m => m.name.toLowerCase() === name.toLowerCase() && m.id !== excludeId);
    }, [schedule.meals]);

    return {
        schedule: { ...schedule, meals: calculatedMeals },
        isLoaded,
        addMeal,
        updateMeal,
        deleteMeal,
        toggleSameSchedule,
        setFirstDayOfWeek,
        findDuplicateName
    };
}
