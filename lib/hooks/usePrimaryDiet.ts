import { useState, useEffect, useCallback } from "react";
import { PrimaryDiet } from "../../types/diet";
import { AVAILABLE_DIETS } from "../constants/diets";

export function usePrimaryDiet() {
    const [activeDietId, setActiveDietId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem("primary_diet");
            if (stored) {
                // Ensure the stored ID is valid
                const found = AVAILABLE_DIETS.find(d => d.id === stored);
                if (found) {
                    setActiveDietId(stored);
                } else {
                    window.localStorage.removeItem("primary_diet");
                }
            }
        } catch (e) {
            console.error("Error accessing localStorage for primary_diet", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const setDiet = useCallback((dietId: string | null) => {
        try {
            if (dietId) {
                const found = AVAILABLE_DIETS.find(d => d.id === dietId);
                if (found) {
                    window.localStorage.setItem("primary_diet", dietId);
                    setActiveDietId(dietId);
                }
            } else {
                window.localStorage.removeItem("primary_diet");
                setActiveDietId(null);
            }
        } catch (e) {
            console.error("Error saving primary_diet to localStorage", e);
        }
    }, []);

    const activeDiet = AVAILABLE_DIETS.find(d => d.id === activeDietId) || null;

    return {
        activeDiet,
        activeDietId,
        setDiet,
        isLoaded
    };
}
