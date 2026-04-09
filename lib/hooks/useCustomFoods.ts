"use client";

import { useState, useEffect } from "react";
import { CustomFood } from "../../types/custom-recipes";
import { getCustomFoods, storage } from "../storage-utils";

export function useCustomFoods() {
    const [foods, setFoods] = useState<CustomFood[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = getCustomFoods();
        setFoods(data);
        setLoading(false);
    }, []);

    const addFood = (food: CustomFood) => {
        setFoods(prev => {
            const updated = [...prev, food];
            storage.set("customFoods", updated);
            return updated;
        });
    };

    const deleteFood = (id: string) => {
        if (!confirm("Delete this custom food?")) return;
        
        setFoods(prev => {
            const updated = prev.filter(f => f.id !== id);
            storage.set("customFoods", updated);
            return updated;
        });
    };

    const updateFood = (id: string, updates: Partial<CustomFood>) => {
        setFoods(prev => {
            const updated = prev.map(f => f.id === id ? { ...f, ...updates } : f);
            storage.set("customFoods", updated);
            return updated;
        });
    };

    return { foods, loading, addFood, deleteFood, updateFood };
}
