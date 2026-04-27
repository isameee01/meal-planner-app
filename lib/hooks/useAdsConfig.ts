"use client";

import { useState, useEffect } from "react";

export interface AdsConfig {
  enableAds: boolean;
  headerAdCode: string;
  sidebarAdCode: string;
  footerAdCode: string;
  enablePopupAd: boolean;
  popupAdCode: string;
  popupDelay: number;
}

const DEFAULT_CONFIG: AdsConfig = {
  enableAds: true,
  headerAdCode: "<!-- Header Ad Placeholder -->",
  sidebarAdCode: "<!-- Sidebar Ad Placeholder -->",
  footerAdCode: "<!-- Footer Ad Placeholder -->",
  enablePopupAd: true,
  popupAdCode: "<!-- Popup Ad Placeholder -->",
  popupDelay: 5000,
};

const STORAGE_KEY = "custom_daily_diet_ads_config";

export function useAdsConfig() {
  const [config, setConfig] = useState<AdsConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse Ads Config", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateAdsConfig = (updates: Partial<AdsConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { config, updateAdsConfig, isLoaded };
}
