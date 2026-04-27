"use client";

import { useState, useEffect } from "react";

export interface AppFeatures {
  enableMealGeneration: boolean;
  enableRecipes: boolean;
  enableRebalance: boolean;
  enableDiscoverAI: boolean;
  enableCustomFoods: boolean;
  enableCollections: boolean;
  enableFavorites: boolean;
  enableBlockedFoods: boolean;
  enableLeftovers: boolean;
  enableNutritionTargets: boolean;
}

const DEFAULT_FEATURES: AppFeatures = {
  enableMealGeneration: true,
  enableRecipes: true,
  enableRebalance: true,
  enableDiscoverAI: true,
  enableCustomFoods: true,
  enableCollections: true,
  enableFavorites: true,
  enableBlockedFoods: true,
  enableLeftovers: true,
  enableNutritionTargets: true,
};

const STORAGE_KEY = "custom_daily_diet_feature_control";

export function useFeatureControl() {
  const [features, setFeatures] = useState<AppFeatures>(DEFAULT_FEATURES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydration-safe loading
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure any new keys are present
        setFeatures((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (e) {
        console.error("Failed to parse Feature Control from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateFeature = (key: keyof AppFeatures, value: boolean) => {
    setFeatures((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetToDefaults = () => {
    setFeatures(DEFAULT_FEATURES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FEATURES));
  };

  return { features, updateFeature, isLoaded, resetToDefaults };
}
