"use client";

import { useState, useEffect } from "react";

export type PlanType = "Free" | "Pro" | "Premium";

export interface PlanConfig {
  name: PlanType;
  price: number;
  discount: number;
  description: string;
  active: boolean;
  limits: {
    maxMealsPerDay: number;
    maxAIRequestsPerDay: number;
    maxSavedRecipes: number;
    maxCustomFoods: number;
  };
  features: {
    canUseMealGeneration: boolean;
    canUseRecipes: boolean;
    canUseRebalance: boolean;
    canUseDiscoverAI: boolean;
  };
}

export interface BillingConfig {
  plans: Record<PlanType, PlanConfig>;
  simulatedUserPlan: PlanType;
}

export const DEFAULT_PLANS: Record<PlanType, PlanConfig> = {
  Free: {
    name: "Free",
    price: 0,
    discount: 0,
    description: "Essential meal planning for individuals.",
    active: true,
    limits: {
      maxMealsPerDay: 4,
      maxAIRequestsPerDay: 2,
      maxSavedRecipes: 10,
      maxCustomFoods: 5,
    },
    features: {
      canUseMealGeneration: true,
      canUseRecipes: true,
      canUseRebalance: false,
      canUseDiscoverAI: false,
    },
  },
  Pro: {
    name: "Pro",
    price: 29,
    discount: 0,
    description: "Advanced nutrition control and rebalancing.",
    active: true,
    limits: {
      maxMealsPerDay: 4,
      maxAIRequestsPerDay: 10,
      maxSavedRecipes: 100,
      maxCustomFoods: 50,
    },
    features: {
      canUseMealGeneration: true,
      canUseRecipes: true,
      canUseRebalance: true,
      canUseDiscoverAI: true,
    },
  },
  Premium: {
    name: "Premium",
    price: 99,
    discount: 20,
    description: "Unlimited power for serious meal planning.",
    active: true,
    limits: {
      maxMealsPerDay: 6,
      maxAIRequestsPerDay: 100,
      maxSavedRecipes: 999,
      maxCustomFoods: 999,
    },
    features: {
      canUseMealGeneration: true,
      canUseRecipes: true,
      canUseRebalance: true,
      canUseDiscoverAI: true,
    },
  },
};

const DEFAULT_CONFIG: BillingConfig = {
  plans: DEFAULT_PLANS,
  simulatedUserPlan: "Free",
};

const STORAGE_KEY = "custom_daily_diet_billing_config";

export function useBillingConfig() {
  const [config, setConfig] = useState<BillingConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydration-safe loading
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure structure is intact
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          plans: {
            ...DEFAULT_CONFIG.plans,
            ...parsed.plans,
          },
        });
      } catch (e) {
        console.error("Failed to parse Billing Config from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updatePlan = (planName: PlanType, newPlan: Partial<PlanConfig>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        plans: {
          ...prev.plans,
          [planName]: { ...prev.plans[planName], ...newPlan },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setSimulatedPlan = (plan: PlanType) => {
    setConfig((prev) => {
      const updated = { ...prev, simulatedUserPlan: plan };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
  };

  return { config, updatePlan, setSimulatedPlan, isLoaded, resetToDefaults };
}
