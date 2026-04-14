"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GeneratorSettings, DEFAULT_GENERATOR_SETTINGS } from "../../types/settings";
import { UserPhysicalStats } from "../../types/user";

const STORAGE_KEY = "generator_settings";

export function useGeneratorSettings() {
    const [settings, setSettings] = useState<GeneratorSettings>(DEFAULT_GENERATOR_SETTINGS);
    const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [isLoaded, setIsLoaded] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Load
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_GENERATOR_SETTINGS, ...parsed });
            } catch (e) {
                console.error("Failed to parse generator settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Listen for external updates
    useEffect(() => {
        const handleUpdate = (e: any) => {
            if (e.detail) {
                setSettings(prev => ({ ...prev, ...e.detail }));
            }
        };
        window.addEventListener("generator_settings_updated", handleUpdate);
        return () => window.removeEventListener("generator_settings_updated", handleUpdate);
    }, []);

    // Master Sync Logic: Update user_stats when units change
    const syncUnitsWithStats = useCallback((newUnits: "us" | "metric", prevUnits: "us" | "metric") => {
        if (newUnits === prevUnits) return;

        const statsStr = localStorage.getItem("user_stats");
        if (!statsStr) return;

        try {
            const stats: UserPhysicalStats = JSON.parse(statsStr);
            const updatedStats: UserPhysicalStats = { ...stats };

            if (newUnits === "metric") {
                // Switch to Metric: Store as KG (already is) but change label
                updatedStats.weightUnit = "kg";
                
                // Convert Height: FT+IN -> CM
                const ft = stats.height?.ft ?? 5;
                const inch = stats.height?.in ?? 10;
                updatedStats.heightCm = Math.round((ft * 30.48) + (inch * 2.54));
            } else {
                // Switch to US: Store as LBS label
                updatedStats.weightUnit = "lbs";
                
                // Convert Height: CM -> FT+IN
                const cm = stats.heightCm ?? 177;
                const totalInches = cm / 2.54;
                updatedStats.height = {
                    ft: Math.floor(totalInches / 12),
                    in: Math.round(totalInches % 12)
                };
            }

            localStorage.setItem("user_stats", JSON.stringify(updatedStats));
            window.dispatchEvent(new CustomEvent("user_stats_updated", { detail: updatedStats }));
        } catch (e) {
            console.error("Failed to sync units with stats", e);
        }
    }, []);

    const updateSettings = useCallback((updates: Partial<GeneratorSettings>) => {
        let actualUpdates = updates;

        setSettings(prev => {
            // Check if units actually changed before triggering sync
            if (updates.units && updates.units !== prev.units) {
                syncUnitsWithStats(updates.units, prev.units);
            }

            const next = { ...prev, ...updates };

            // Debounced Save
            setStatus("saving");
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

            saveTimeoutRef.current = setTimeout(() => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                setStatus("saved");
                
                // Dispatch global setting update event
                window.dispatchEvent(new CustomEvent("generator_settings_updated", { detail: next }));
                
                setTimeout(() => setStatus("idle"), 2000);
            }, 500);

            return next;
        });
    }, [syncUnitsWithStats]);

    // Helper functions for derived values
    const getEnergyValue = useCallback((kcal: number) => {
        if (settings.energyUnit === "kJ") {
            return Math.round(kcal * 4.184);
        }
        return Math.round(kcal);
    }, [settings.energyUnit]);

    const getCarbsValue = useCallback((totalCarbs: number, fiber: number) => {
        if (settings.carbsType === "net") {
            return Math.max(0, totalCarbs - fiber);
        }
        return totalCarbs;
    }, [settings.carbsType]);

    return {
        settings,
        updateSettings,
        getEnergyValue,
        getCarbsValue,
        status,
        isLoaded
    };
}
