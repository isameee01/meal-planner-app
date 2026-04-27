"use client";

import { useState, useEffect } from "react";

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    email: string;
    password: string;
  };
  templates: {
    welcome: string;
    resetPassword: string;
  };
}

const DEFAULT_CONFIG: EmailConfig = {
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    email: "",
    password: "",
  },
  templates: {
    welcome: "Welcome to CustomDailyDiet! We're glad to have you.",
    resetPassword: "Click the link below to reset your password.",
  },
};

const STORAGE_KEY = "custom_daily_diet_email_config";

export function useEmailConfig() {
  const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse Email Config", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateEmailConfig = (updates: Partial<EmailConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { config, updateEmailConfig, isLoaded };
}
