"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { useMounted } from "../../lib/hooks/useMounted";
import { FoodStateProvider } from "../../lib/contexts/FoodStateContext";
import { MealStateProvider } from "../../lib/contexts/MealStateContext";
import AdPopup from "../../components/ads/AdPopup";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mounted = useMounted();
  const [collapsed, setCollapsed] = useState(false);

  // Sync collapsed state with localStorage for persistence
  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("dashboard_sidebar_collapsed");
    if (saved) setCollapsed(saved === "true");
  }, [mounted]);

  const handleSetCollapsed = (val: boolean) => {
    setCollapsed(val);
    localStorage.setItem("dashboard_sidebar_collapsed", String(val));
  };

  if (!mounted) {
    return (
      <ProtectedRoute>
        <FoodStateProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors overflow-hidden">
            <div className="w-[280px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800" />
            <main className="flex-1 w-full bg-slate-50 dark:bg-slate-950" />
          </div>
        </FoodStateProvider>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <FoodStateProvider>
        <MealStateProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors overflow-hidden">
            <Sidebar collapsed={collapsed} setCollapsed={handleSetCollapsed} />
            
            <main className="flex-1 min-w-0 h-screen overflow-y-auto relative scrollbar-hide">
              {children}
              <AdPopup />
            </main>
          </div>
        </MealStateProvider>
      </FoodStateProvider>
    </ProtectedRoute>
  );
}
