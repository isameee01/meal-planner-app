import { useGlobalFoodState } from "../contexts/FoodStateContext";
import { useCallback } from "react";

export function useBlockedFoods() {
    const { blockedFoods, blockFood, unblockFood, loading } = useGlobalFoodState();

    const normalize = (str: string) => str.toLowerCase().trim();

    const isBlocked = useCallback((name: string) => {
        const normName = normalize(name);
        return blockedFoods.some(f => normalize(f) === normName);
    }, [blockedFoods]);

    const toggleBlockFood = useCallback((name: string) => {
        if (isBlocked(name)) {
            unblockFood(name);
        } else {
            blockFood(name);
        }
    }, [isBlocked, unblockFood, blockFood]);

    return {
        blockedFoods,
        isLoaded: !loading,
        isBlocked,
        toggleBlockFood,
        addBlockedFood: blockFood,
        removeBlockedFood: unblockFood
    };
}
