"use client";

import { useState, useEffect } from "react";

export interface ToolSlugs {
  mealGeneratorSlug: string;
  recipeGeneratorSlug: string;
  discoverSlug: string;
}

const DEFAULT_CONFIG: ToolSlugs = {
  mealGeneratorSlug: "meal-generator",
  recipeGeneratorSlug: "recipe-generator",
  discoverSlug: "discover",
};

const STORAGE_KEY = "custom_daily_diet_tool_slugs";

export function useToolSlugs() {
  const [config, setConfig] = useState<ToolSlugs>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse Tool Slugs", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateToolSlugs = (updates: Partial<ToolSlugs>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { config, updateToolSlugs, isLoaded };
}
