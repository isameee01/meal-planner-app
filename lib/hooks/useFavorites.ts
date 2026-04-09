"use client";

import { useState, useEffect } from "react";
import { getFavorites, storage } from "../storage-utils";

export function useFavorites() {
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = getFavorites();
        setFavoriteIds(data);
        setLoading(false);
    }, []);

    const toggleFavorite = (id: string) => {
        setFavoriteIds(prev => {
            const isFavorite = prev.includes(id);
            const updated = isFavorite 
                ? prev.filter(fid => fid !== id) 
                : [...prev, id];
            
            storage.set("favoriteFoods", updated);
            return updated;
        });
    };

    const isFavorite = (id: string) => favoriteIds.includes(id);

    return { favoriteIds, loading, toggleFavorite, isFavorite };
}
