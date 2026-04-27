"use client";

import { useState, useEffect } from "react";

export type AIProviderId = "groq" | "openai" | "gemini";

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  apiKey: string;
  enabled: boolean;
  model: string;
}

export type AIFeatureId = "mealGenerator" | "recipeGenerator" | "rebalanceEngine";

export interface FailoverPriority {
  primary: AIProviderId;
  secondary: AIProviderId;
  tertiary: AIProviderId | null;
}

export interface APIManagementConfig {
  providers: Record<AIProviderId, AIProviderConfig>;
  mappings: Record<AIFeatureId, FailoverPriority>;
  failover: {
    enableFallback: boolean;
    retryAttempts: number;
    timeoutMs: number;
  };
}

const DEFAULT_CONFIG: APIManagementConfig = {
  providers: {
    groq: {
      id: "groq",
      name: "Groq",
      apiKey: "",
      enabled: true,
      model: "llama-3.3-70b-versatile",
    },
    openai: {
      id: "openai",
      name: "OpenAI",
      apiKey: "",
      enabled: false,
      model: "gpt-4o",
    },
    gemini: {
      id: "gemini",
      name: "Google Gemini",
      apiKey: "",
      enabled: false,
      model: "gemini-1.5-pro",
    },
  },
  mappings: {
    mealGenerator: { primary: "groq", secondary: "openai", tertiary: "gemini" },
    recipeGenerator: { primary: "groq", secondary: "openai", tertiary: null },
    rebalanceEngine: { primary: "groq", secondary: "openai", tertiary: null },
  },
  failover: {
    enableFallback: true,
    retryAttempts: 2,
    timeoutMs: 30000,
  },
};

const STORAGE_KEY = "custom_daily_diet_api_management_v1";

export function useAPIManagement() {
  const [config, setConfig] = useState<APIManagementConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydration-safe loading
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          providers: { ...DEFAULT_CONFIG.providers, ...parsed.providers },
          mappings: { ...DEFAULT_CONFIG.mappings, ...parsed.mappings },
          failover: { ...DEFAULT_CONFIG.failover, ...parsed.failover },
        });
      } catch (e) {
        console.error("Failed to parse API Management Config from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateProvider = (providerId: AIProviderId, updates: Partial<AIProviderConfig>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        providers: {
          ...prev.providers,
          [providerId]: { ...prev.providers[providerId], ...updates },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateMapping = (featureId: AIFeatureId, updates: Partial<FailoverPriority>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        mappings: {
          ...prev.mappings,
          [featureId]: { ...prev.mappings[featureId], ...updates },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateFailover = (updates: Partial<APIManagementConfig["failover"]>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        failover: { ...prev.failover, ...updates },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
  };

  return { 
    config, 
    updateProvider, 
    updateMapping, 
    updateFailover, 
    isLoaded, 
    resetToDefaults 
  };
}
