"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/dashboard/Header";
import MealSection from "../../components/dashboard/MealSection";
import NutritionChart from "../../components/dashboard/NutritionChart";
import SavedFoodsPanel from "../../components/dashboard/SavedFoodsPanel";
import OnboardingModal from "./OnboardingModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useMounted } from "../../lib/hooks/useMounted";
import { useAuth } from "../../hooks/useAuth";
import ClientOnly from "../../components/common/ClientOnly";
import DataReady from "../../components/common/DataReady";
import { SectionSkeleton, StatsSkeleton } from "../../components/common/Skeleton";

// Define the requested state type
type SelectedDateState = {
    day?: Date;
    week?: {
        start: Date;
        end: Date;
    };
};

export default function DashboardPage() {
    const mounted = useMounted();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);
    
    // --- Dashboard State ---
    const [viewMode, setViewMode] = useState<"day" | "week">("day");
    const [selectedDate, setSelectedDate] = useState<SelectedDateState>({ day: new Date() });
    const [isProcessing, setIsProcessing] = useState(false);
    
    const { theme, setTheme } = useTheme();
    const router = useRouter();


    useEffect(() => {
        if (!mounted || authLoading) return;

        const onboardingComplete = localStorage.getItem("onboardingComplete");
        
        // Restore Dashboard State
        const savedView = localStorage.getItem("dashboard_viewMode") as "day" | "week";
        if (savedView) setViewMode(savedView);

        const savedDate = localStorage.getItem("dashboard_selectedDate");
        if (savedDate) {
            try {
                const parsed = JSON.parse(savedDate);
                // Convert back to Date objects
                if (parsed.day) {
                    setSelectedDate({ day: new Date(parsed.day) });
                } else if (parsed.week) {
                    setSelectedDate({ 
                        week: { 
                            start: new Date(parsed.week.start), 
                            end: new Date(parsed.week.end) 
                        } 
                    });
                } else {
                    setSelectedDate({ day: new Date(parsed) });
                }
            } catch (e) {
                console.error("Failed to restore date", e);
            }
        }

        if (user) {
            if (!onboardingComplete) {
                router.push("/onboarding/start");
                return;
            }
            setShowWelcome(true);
            const timer = setTimeout(() => setShowWelcome(false), 3000);
            setLoading(false);
            return () => clearTimeout(timer);
        } else {
            setLoading(false);
        }
    }, [router, mounted, authLoading, user]);

    const handleViewModeChange = (mode: "day" | "week") => {
        setViewMode(mode);
        localStorage.setItem("dashboard_viewMode", mode);
    };

    const handleDateChange = (date: SelectedDateState) => {
        setSelectedDate(date);
        localStorage.setItem("dashboard_selectedDate", JSON.stringify(date));
    };

    // Adapt state for child components to avoid breaking them
    const legacySelectedDate = selectedDate.day || selectedDate.week?.start || new Date();
    const legacyDateRange = {
        start: selectedDate.week?.start || legacySelectedDate,
        end: selectedDate.week?.end || null
    };

    if (!mounted) return null;


    return (
        <div className="flex flex-col min-w-0 h-full">
            <Header 
                    toggleMobileMenu={() => setMobileMenuOpen(true)}
                    viewMode={viewMode}
                    setViewMode={handleViewModeChange}
                    selectedDate={selectedDate.day ? selectedDate.day : { start: selectedDate.week?.start!, end: selectedDate.week?.end || null }}
                    onDateChange={(d) => {
                        if (d instanceof Date) {
                            handleDateChange({ day: d });
                        } else {
                            handleDateChange({ week: { start: d.start, end: d.end } });
                        }
                    }}
                    theme={theme}
                    onThemeChange={setTheme}
                    isProcessing={isProcessing}
                />

                <ClientOnly fallback={
                    <div className="flex-1 p-4 lg:p-8 space-y-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-[2]"><SectionSkeleton /></div>
                                <div className="flex-1 lg:max-w-md"><StatsSkeleton /></div>
                            </div>
                        </div>
                    </div>
                }>
                    <DataReady loading={loading} fallback={
                        <div className="flex-1 p-4 lg:p-8 space-y-8">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="flex-[2]"><SectionSkeleton /></div>
                                    <div className="flex-1 lg:max-w-md"><StatsSkeleton /></div>
                                </div>
                            </div>
                        </div>
                    }>
                        {!user ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Session Invalid...</span>
                            </div>
                        ) : (
                            <div className="flex-1 p-4 lg:p-8 overflow-y-auto relative scrollbar-hide">
                                <AnimatePresence>
                                    {showWelcome && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20, x: "-50%" }}
                                            animate={{ opacity: 1, y: 10, x: "-50%" }}
                                            exit={{ opacity: 0, y: -20, x: "-50%" }}
                                            className="fixed top-20 left-1/2 z-[100] px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900 flex items-center space-x-3 pointer-events-none"
                                        >
                                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white"><span>👋</span></div>
                                            <span className="font-bold text-slate-800 dark:text-slate-100">Welcome back, {user?.user_metadata?.full_name || user?.email}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="max-w-7xl mx-auto pb-20">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-[2] space-y-8 min-w-0">
                                            <MealSection 
                                                viewMode={viewMode}
                                                selectedDate={legacySelectedDate}
                                                dateRange={legacyDateRange}
                                                setIsProcessing={setIsProcessing}
                                                isProcessing={isProcessing}
                                            />
                                        </div>

                                        <div className="flex-1 lg:max-w-md space-y-8">
                                            <NutritionChart selectedDate={legacySelectedDate} />
                                            <SavedFoodsPanel />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DataReady>
                </ClientOnly>
                <OnboardingModal />
        </div>
    );
}
