"use client";

import { useState, useEffect } from "react";

export interface LanguageConfig {
  defaultLanguage: string;
  isRTL: boolean;
}

const DEFAULT_CONFIG: LanguageConfig = {
  defaultLanguage: "en",
  isRTL: false,
};

const STORAGE_KEY = "custom_daily_diet_language_config";

export function useLanguage() {
  const [config, setConfig] = useState<LanguageConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse Language Config", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateLanguageConfig = (updates: Partial<LanguageConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { config, updateLanguageConfig, isLoaded };
}
