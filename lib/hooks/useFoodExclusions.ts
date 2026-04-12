import { useState, useEffect, useCallback } from "react";
import { FoodExclusion } from "../../types/diet";

const STORAGE_KEY = "food_exclusions";

export function useFoodExclusions() {
    const [exclusions, setExclusions] = useState<FoodExclusion[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadExclusions = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                // Safely migrate old data structures where "type" might exist
                const parsed = JSON.parse(stored).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category || item.type || "custom"
                }));
                setExclusions(parsed);
            } else {
                setExclusions([]);
            }
        } catch (e) {
            console.error("Failed to load food exclusions:", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadExclusions();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadExclusions();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [loadExclusions]);

    const addExclusion = (exclusion: Omit<FoodExclusion, "id">) => {
        const newExclusion: FoodExclusion = {
            ...exclusion,
            id: crypto.randomUUID(),
        };

        setExclusions(prev => {
            // Prevent duplicates (case insensitive)
            const exists = prev.some(e => e.name.toLowerCase() === exclusion.name.toLowerCase());
            if (exists) return prev;

            const next = [...prev, newExclusion];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const addMultipleExclusions = (newExclusions: Omit<FoodExclusion, "id">[]) => {
        setExclusions(prev => {
            let next = [...prev];
            for (const item of newExclusions) {
                const exists = next.some(e => e.name.toLowerCase() === item.name.toLowerCase());
                if (!exists) {
                    next.push({ ...item, id: crypto.randomUUID() });
                }
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const removeExclusion = (id: string) => {
        setExclusions(prev => {
            const next = prev.filter(e => e.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const removeMultipleExclusions = (idsToRemove: string[]) => {
        setExclusions(prev => {
            const next = prev.filter(e => !idsToRemove.includes(e.id));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    return {
        exclusions,
        isLoaded,
        addExclusion,
        addMultipleExclusions,
        removeExclusion,
        removeMultipleExclusions
    };
}
