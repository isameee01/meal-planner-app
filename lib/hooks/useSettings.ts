"use client";

import { useState, useEffect } from "react";

export interface GeneralSettings {
  appName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: GeneralSettings = {
  appName: "CustomDailyDiet",
  logoUrl: "",
  primaryColor: "#3b82f6",
  secondaryColor: "#10b981",
  maintenanceMode: false,
};

const STORAGE_KEY = "custom_daily_diet_general_settings";

export function useSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse General Settings", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<GeneralSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { settings, updateSettings, isLoaded };
}
