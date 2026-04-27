"use client";

import { useState, useEffect } from "react";

export type AIProvider = "Groq" | "OpenAI" | "Gemini";

export interface ModelConfig {
  provider: AIProvider;
  model: string;
}

export interface AIConfig {
  models: {
    mealGenerator: ModelConfig;
    recipeGenerator: ModelConfig;
    rebalanceEngine: ModelConfig;
  };
  apiKeys: {
    groqApiKey: string;
    openaiApiKey: string;
    geminiApiKey: string;
  };
  prompts: {
    mealPrompt: string;
    recipePrompt: string;
    rebalancePrompt: string;
  };
  settings: {
    temperature: number;
    maxTokens: number;
    strictJSON: boolean;
  };
  fallbacks: {
    primaryProvider: AIProvider;
    fallbackProvider: AIProvider;
  };
}

const DEFAULT_CONFIG: AIConfig = {
  models: {
    mealGenerator: { provider: "Groq", model: "llama-3.3-70b-versatile" },
    recipeGenerator: { provider: "Groq", model: "llama-3.3-70b-versatile" },
    rebalanceEngine: { provider: "Groq", model: "llama-3.3-70b-versatile" },
  },
  apiKeys: {
    groqApiKey: "",
    openaiApiKey: "",
    geminiApiKey: "",
  },
  prompts: {
    mealPrompt: `You are a world-class AI Nutritionist. Generate a complete {dates_length}-day personalized meal plan.

USER PROFILE:
- Age: {age}
- Weight: {weight}kg
- Height: {height}cm
- Goal: {goal}
- Activity Level: {activity}
{servings_note}

STRICT REQUIREMENTS:
1. Generate ALL days.
2. 4 meals per day: breakfast, lunch, dinner, snack.
3. Realistic recipe names and ingredients.
4. Vary meals across days.
5. Balance macros for the goal.`,
    recipePrompt: `You are a master chef. Generate a professional recipe for: "{food_name}".
User goal: {user_goal}.
Macros: {calories} kcal | P {protein}g | C {carbs}g | F {fat}g.

REQUIREMENTS:
1. 4-8 real ingredients with exact quantities.
2. Per-ingredient macros.
3. 4-6 cooking instructions.
4. prepTime in minutes.`,
    rebalancePrompt: `You are an expert AI Nutritionist. Rebalance a user's remaining meal slots for the day.

DAILY TARGET: {target_calories} kcal
USER GOAL: {goal}

JUST ADDED: "{added_item}" ({added_calories} kcal) to {added_slot}
REMAINING BUDGET: {remaining_budget} kcal for {future_slots}

GENERATE meals for ONLY these slots.`,
  },
  settings: {
    temperature: 0.3,
    maxTokens: 8192,
    strictJSON: true,
  },
  fallbacks: {
    primaryProvider: "Groq",
    fallbackProvider: "OpenAI",
  },
};

const STORAGE_KEY = "custom_daily_diet_ai_config";

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydration-safe loading
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure any new keys are present
        setConfig((prev) => ({
          ...prev,
          ...parsed,
          models: { ...prev.models, ...parsed.models },
          apiKeys: { ...prev.apiKeys, ...parsed.apiKeys },
          prompts: { ...prev.prompts, ...parsed.prompts },
          settings: { ...prev.settings, ...parsed.settings },
          fallbacks: { ...prev.fallbacks, ...parsed.fallbacks },
        }));
      } catch (e) {
        console.error("Failed to parse AI config from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetPrompt = (key: keyof AIConfig["prompts"]) => {
    updateConfig({
      prompts: {
        ...config.prompts,
        [key]: DEFAULT_CONFIG.prompts[key],
      },
    });
  };

  return { config, updateConfig, isLoaded, resetPrompt };
}
