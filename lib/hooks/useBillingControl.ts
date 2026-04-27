"use client";

import { useState, useEffect } from "react";

export type PlanId = "free" | "pro" | "premium";

export interface PlanData {
  id: PlanId;
  name: string;
  price: number;
  discount: number;
  isActive: boolean;
  isRecommended: boolean;
  limits: {
    mealsPerDay: number;
    aiRequestsPerDay: number;
    savedRecipesLimit: number;
    customFoodsLimit: number;
  };
  features: {
    mealGeneration: boolean;
    recipes: boolean;
    rebalance: boolean;
    discoverAI: boolean;
  };
}

export interface BillingControl {
  plans: Record<PlanId, PlanData>;
  globalOverrides: {
    makeAppFree: boolean;
    disableAllLimits: boolean;
    forceAllFeaturesOn: boolean;
  };
  currentSimulation: PlanId;
}

const DEFAULT_PLANS: Record<PlanId, PlanData> = {
  free: {
    id: "free",
    name: "Free Tier",
    price: 0,
    discount: 0,
    isActive: true,
    isRecommended: false,
    limits: {
      mealsPerDay: 4,
      aiRequestsPerDay: 2,
      savedRecipesLimit: 10,
      customFoodsLimit: 5,
    },
    features: {
      mealGeneration: true,
      recipes: true,
      rebalance: false,
      discoverAI: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro Professional",
    price: 29,
    discount: 0,
    isActive: true,
    isRecommended: true,
    limits: {
      mealsPerDay: 4,
      aiRequestsPerDay: 10,
      savedRecipesLimit: 100,
      customFoodsLimit: 50,
    },
    features: {
      mealGeneration: true,
      recipes: true,
      rebalance: true,
      discoverAI: true,
    },
  },
  premium: {
    id: "premium",
    name: "Ultimate Premium",
    price: 99,
    discount: 20,
    isActive: true,
    isRecommended: false,
    limits: {
      mealsPerDay: 6,
      aiRequestsPerDay: 100,
      savedRecipesLimit: 999,
      customFoodsLimit: 999,
    },
    features: {
      mealGeneration: true,
      recipes: true,
      rebalance: true,
      discoverAI: true,
    },
  },
};

const DEFAULT_CONFIG: BillingControl = {
  plans: DEFAULT_PLANS,
  globalOverrides: {
    makeAppFree: false,
    disableAllLimits: false,
    forceAllFeaturesOn: false,
  },
  currentSimulation: "free",
};

const STORAGE_KEY = "custom_daily_diet_billing_control_v2";

export function useBillingControl() {
  const [config, setConfig] = useState<BillingControl>(DEFAULT_CONFIG);
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
          plans: { ...DEFAULT_CONFIG.plans, ...parsed.plans },
          globalOverrides: { ...DEFAULT_CONFIG.globalOverrides, ...parsed.globalOverrides },
        });
      } catch (e) {
        console.error("Failed to parse Billing Control from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updatePlan = (planId: PlanId, updates: Partial<PlanData>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        plans: {
          ...prev.plans,
          [planId]: { ...prev.plans[planId], ...updates },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const updateOverrides = (updates: Partial<BillingControl["globalOverrides"]>) => {
    setConfig((prev) => {
      const updated = {
        ...prev,
        globalOverrides: { ...prev.globalOverrides, ...updates },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const setSimulation = (planId: PlanId) => {
    setConfig((prev) => {
      const updated = { ...prev, currentSimulation: planId };
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
    updatePlan, 
    updateOverrides, 
    setSimulation, 
    isLoaded, 
    resetToDefaults 
  };
}
