"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Collection {
    id: string;
    name: string;
    foodIds: string[];
}

interface FoodState {
    savedFoods: string[];
    blockedFoods: string[];
    favoriteFoods: string[];
    collections: Collection[];
    loading: boolean;
}

interface FoodStateContextType extends FoodState {
    toggleSaveFood: (id: string) => void;
    toggleFavoriteFood: (id: string) => void;
    blockFood: (id: string) => void;
    unblockFood: (id: string) => void;
    createCollection: (name: string) => void;
    addToCollection: (collectionId: string, foodId: string) => void;
    removeFromCollection: (collectionId: string, foodId: string) => void;
    deleteCollection: (id: string) => void;
}

const FoodStateContext = createContext<FoodStateContextType | undefined>(undefined);

export function FoodStateProvider({ children }: { children: React.ReactNode }) {
    const [savedFoods, setSavedFoods] = useState<string[]>([]);
    const [blockedFoods, setBlockedFoods] = useState<string[]>([]);
    const [favoriteFoods, setFavoriteFoods] = useState<string[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        const storedSaved = localStorage.getItem("discover_savedFoods");
        if (storedSaved) setSavedFoods(JSON.parse(storedSaved));

        const storedBlocked = localStorage.getItem("discover_blockedFoods");
        if (storedBlocked) setBlockedFoods(JSON.parse(storedBlocked));

        const storedFavorites = localStorage.getItem("discover_favoriteFoods");
        if (storedFavorites) setFavoriteFoods(JSON.parse(storedFavorites));

        const storedCollections = localStorage.getItem("discover_collections");
        if (storedCollections) setCollections(JSON.parse(storedCollections));

        setIsLoaded(true);
    }, []);

    // Global Sync to LocalStorage
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("discover_savedFoods", JSON.stringify(savedFoods));
        localStorage.setItem("discover_blockedFoods", JSON.stringify(blockedFoods));
        localStorage.setItem("discover_favoriteFoods", JSON.stringify(favoriteFoods));
        localStorage.setItem("discover_collections", JSON.stringify(collections));
    }, [savedFoods, blockedFoods, favoriteFoods, collections, isLoaded]);

    // Cross-tab Sync
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "discover_savedFoods" && e.newValue) setSavedFoods(JSON.parse(e.newValue));
            if (e.key === "discover_blockedFoods" && e.newValue) setBlockedFoods(JSON.parse(e.newValue));
            if (e.key === "discover_favoriteFoods" && e.newValue) setFavoriteFoods(JSON.parse(e.newValue));
            if (e.key === "discover_collections" && e.newValue) setCollections(JSON.parse(e.newValue));
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // Actions
    const toggleSaveFood = useCallback((id: string) => {
        setSavedFoods(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
    }, []);

    const toggleFavoriteFood = useCallback((id: string) => {
        setFavoriteFoods(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
    }, []);

    const blockFood = useCallback((id: string) => {
        setBlockedFoods(prev => prev.includes(id) ? prev : [...prev, id]);
    }, []);

    const unblockFood = useCallback((id: string) => {
        setBlockedFoods(prev => prev.filter(fId => fId !== id));
    }, []);

    const createCollection = useCallback((name: string) => {
        setCollections(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name, foodIds: [] }]);
    }, []);

    const addToCollection = useCallback((collectionId: string, foodId: string) => {
        setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, foodIds: [...new Set([...c.foodIds, foodId])] } : c));
    }, []);

    const removeFromCollection = useCallback((collectionId: string, foodId: string) => {
        setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, foodIds: c.foodIds.filter(id => id !== foodId) } : c));
    }, []);

    const deleteCollection = useCallback((id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
    }, []);

    return (
        <FoodStateContext.Provider value={{ 
            savedFoods, 
            blockedFoods, 
            favoriteFoods,
            collections,
            loading: !isLoaded,
            toggleSaveFood,
            toggleFavoriteFood,
            blockFood,
            unblockFood,
            createCollection,
            addToCollection,
            removeFromCollection,
            deleteCollection
        }}>
            {children}
        </FoodStateContext.Provider>
    );
}

export const useGlobalFoodState = () => {
    const context = useContext(FoodStateContext);
    if (!context) throw new Error("useGlobalFoodState must be used within FoodStateProvider");
    return context;
};

