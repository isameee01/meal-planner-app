"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserPhysicalStats, ActivityLevelId, Sex, BodyFatLevel } from "../../types/user";

const STORAGE_KEY = "user_stats";
const MIGRATION_VERSION = 1;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const DEFAULT_STATS: UserPhysicalStats = {
    name: "",
    sex: "male",
    height: { ft: 5, in: 10 },
    weight: 70, // Default in KG
    weightUnit: "kg",
    age: 30,
    bodyFat: "medium",
    activityLevel: "moderately_active",
    migrationVersion: MIGRATION_VERSION
};

export function useUserStats() {
    const [stats, setStats] = useState<UserPhysicalStats>(DEFAULT_STATS);
    const [status, setStatus] = useState<SaveStatus>("idle");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Load & Migration
    useEffect(() => {
        const loadStats = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                let currentStats: UserPhysicalStats | null = null;

                if (stored) {
                    currentStats = JSON.parse(stored);
                }

                // Check for migration if version is missing or old
                if (!currentStats || (currentStats.migrationVersion || 0) < MIGRATION_VERSION) {
                    const onboardingAbout = localStorage.getItem("onboarding_about");
                    const userProfile = localStorage.getItem("user_profile");
                    const userAccount = localStorage.getItem("user");

                    let migratedStats: Partial<UserPhysicalStats> = {};

                    if (onboardingAbout) {
                        try {
                            const about = JSON.parse(onboardingAbout);
                            // Onboarding about used KG
                            migratedStats = {
                                ...migratedStats,
                                weight: about.weight || 70,
                                height: { ft: about.ft || 5, in: about.in || 10 },
                                age: about.age || 30,
                                sex: (about.gender === "female" ? "female" : (about.gender === "male" ? "male" : "non-binary")) as Sex,
                                activityLevel: (about.activityLevel || "moderately_active") as ActivityLevelId,
                                weightUnit: "kg"
                            };
                        } catch (e) {}
                    }

                    if (userProfile) {
                        try {
                            const profile = JSON.parse(userProfile);
                            migratedStats = {
                                ...migratedStats,
                                weight: profile.weight ? Number(profile.weight) : (migratedStats.weight || 70)
                            };
                        } catch (e) {}
                    }

                    if (userAccount) {
                        try {
                            const user = JSON.parse(userAccount);
                            migratedStats.name = user.fullName || "";
                        } catch (e) {}
                    }

                    const finalStats = {
                        ...DEFAULT_STATS,
                        ...migratedStats,
                        migrationVersion: MIGRATION_VERSION
                    };

                    setStats(finalStats);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalStats));
                } else {
                    setStats(currentStats);
                }
            } catch (e) {
                console.error("Failed to load user stats", e);
                setStats(DEFAULT_STATS);
            } finally {
                setIsLoaded(true);
            }
        };

        loadStats();
    }, []);

    // Listen for external updates
    useEffect(() => {
        const handleUpdate = (e: any) => {
            if (e.detail) {
                setStats(prev => ({ ...prev, ...e.detail }));
            }
        };
        window.addEventListener("user_stats_updated", handleUpdate);
        return () => window.removeEventListener("user_stats_updated", handleUpdate);
    }, []);

    // Debounced Save
    const saveStats = useCallback((newStats: UserPhysicalStats) => {
        setStatus("saving");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
                setStatus("saved");
                
                // Dispatch custom event for cross-app sync
                window.dispatchEvent(new CustomEvent("user_stats_updated", { detail: newStats }));

                // Reset status to idle after a delay
                setTimeout(() => setStatus("idle"), 2000);
            } catch (e) {
                console.error("Failed to save stats", e);
                setStatus("error");
                setError("Storage full or corrupted. Changes not saved.");
            }
        }, 500);
    }, []);

    const updateStats = useCallback((updates: Partial<UserPhysicalStats>) => {
        setStats(prev => {
            const next = { ...prev, ...updates };
            saveStats(next);
            return next;
        });
    }, [saveStats]);

    // Image Compression Helper
    const uploadImage = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError("Image too large (max 5MB)");
            return;
        }

        setIsUploading(true);
        setError(null);

        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    // Resize if too large but maintain aspect ratio
                    const MAX_SIZE = 800; // Increased resolution for better quality
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Progressive quality reduction until it fits in ~1MB
                    let quality = 0.8;
                    let base64 = canvas.toDataURL("image/jpeg", quality);
                    
                    // If still too large, reduce quality further
                    while (base64.length > 1.3 * 1024 * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        base64 = canvas.toDataURL("image/jpeg", quality);
                    }

                    updateStats({ profileImage: base64 });
                    setIsUploading(false);
                    resolve();
                };
                img.onerror = () => {
                    setIsUploading(false);
                    reject("Invalid image file");
                };
                img.src = e.target?.result as string;
            };
            reader.onerror = () => {
                setIsUploading(false);
                reject("Failed to read file");
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = () => {
        updateStats({ profileImage: undefined });
    };

    return {
        stats,
        updateStats,
        uploadImage,
        removeImage,
        status,
        isUploading,
        isLoaded,
        error,
        setError
    };
}
