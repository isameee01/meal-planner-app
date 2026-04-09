"use client";

import { useState, useEffect } from "react";
import { CustomRecipe } from "../../types/custom-recipes";
import { getCustomRecipes, storage } from "../storage-utils";

export function useCustomRecipes() {
    const [recipes, setRecipes] = useState<CustomRecipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = getCustomRecipes();
        setRecipes(data);
        setLoading(false);
    }, []);

    const addRecipe = (recipe: CustomRecipe) => {
        setRecipes(prev => {
            const updated = [...prev, recipe];
            storage.set("customRecipes", updated);
            return updated;
        });
    };

    const deleteRecipe = (id: string) => {
        if (!confirm("Delete this recipe?")) return;
        
        setRecipes(prev => {
            const updated = prev.filter(r => r.id !== id);
            storage.set("customRecipes", updated);
            return updated;
        });
    };

    const updateRecipe = (id: string, updates: Partial<CustomRecipe>) => {
        setRecipes(prev => {
            const updated = prev.map(r => r.id === id ? { ...r, ...updates } : r);
            storage.set("customRecipes", updated);
            return updated;
        });
    };

    return { recipes, loading, addRecipe, deleteRecipe, updateRecipe };
}
