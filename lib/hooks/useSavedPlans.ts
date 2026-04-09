"use client";

import { useState, useEffect, useCallback } from "react";
import { SavedPlan } from "../../types/saved-plans";

const STORAGE_KEY = "savedPlans";

export function useSavedPlans() {
    const [plans, setPlans] = useState<SavedPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPlans = useCallback(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setPlans(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved plans", e);
                setPlans([]);
            }
        } else {
            setPlans([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadPlans();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadPlans();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [loadPlans]);

    const addPlan = (plan: SavedPlan) => {
        const updated = [plan, ...plans];
        setPlans(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const updatePlan = (id: string, updates: Partial<SavedPlan>) => {
        const updated = plans.map(p => p.id === id ? { ...p, ...updates } : p);
        setPlans(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const deletePlan = (id: string) => {
        const updated = plans.filter(p => p.id !== id);
        setPlans(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const getPlanById = (id: string) => {
        return plans.find(p => p.id === id);
    };

    return {
        plans,
        loading,
        addPlan,
        updatePlan,
        deletePlan,
        getPlanById,
        refresh: loadPlans
    };
}
