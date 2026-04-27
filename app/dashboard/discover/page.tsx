"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Plus, Loader2, Sparkles, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDiscover, INITIAL_FILTERS } from "../../../lib/hooks/useDiscover";
import { useDebounce } from "../../../lib/hooks/useDebounce";
import { useMounted } from "../../../lib/hooks/useMounted";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useRouter } from "next/navigation";
import Header from "../../../components/dashboard/Header";
import ClientOnly from "../../../components/common/ClientOnly";
import DataReady from "../../../components/common/DataReady";
import { GridSkeleton, PageHeaderSkeleton } from "../../../components/common/Skeleton";
import TopControlBar from "../../../components/discover/TopControlBar";
import FilterDrawer from "../../../components/discover/FilterDrawer";
import FoodGrid from "../../../components/discover/FoodGrid";
import NutritionDetailsModal from "../../../components/discover/NutritionDetailsModal";
import AddToPlannerModal from "../../../components/discover/AddToPlannerModal";
import AIRecommendations from "../../../components/discover/AIRecommendations";
import { FoodItem } from "../../../lib/discover-db";
import ErrorBoundary from "../../../components/common/ErrorBoundary";

export default function DiscoverPage() {
    const mounted = useMounted();
    const { 
        filters, 
        setFilters, 
        resetFilters,
        isFiltered,
        displayFoods, 
        loading, 
        hasMore, 
        loadMore, 
        savedFoods,
        collections
    } = useDiscover();

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [selectedFoodForNutrition, setSelectedFoodForNutrition] = useState<FoodItem | null>(null);
    const [selectedFoodForPlanner, setSelectedFoodForPlanner] = useState<FoodItem | null>(null);

    // Sync debounced search to filters
    useEffect(() => {
        setFilters({ query: debouncedSearch });
    }, [debouncedSearch]);


    // Infinite Scroll Intersection Observer
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.observe(node);
    }, [loading, hasMore, loadMore]);

    const handleResetAll = () => {
        resetFilters();
        setSearchTerm("");
    };

    return (
        <div className="flex flex-col min-w-0 h-full">
            <Header 
                theme={theme} 
                onThemeChange={setTheme} 
            />

            <ClientOnly fallback={
                <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
                    <PageHeaderSkeleton />
                    <GridSkeleton count={8} type="card" />
                </div>
            }>
                <DataReady loading={loading && displayFoods.length === 0} fallback={
                    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
                        <PageHeaderSkeleton />
                        <GridSkeleton count={8} type="card" />
                    </div>
                }>
                    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 min-h-screen">
                        {/* Header Section */}
                        <div className="space-y-6 mb-12">
                            <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                <Sparkles size={14} className="text-emerald-500" />
                                <span>Discover Intelligence</span>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                                            <Search size={24} />
                                        </div>
                                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-emerald-500 decoration-4 underline-offset-8">Explore Foods</h1>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl leading-relaxed">
                                        Browse our massive database of items. Use high-performance filters to find exactly what fits your macros.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendations */}
                        <ErrorBoundary>
                            <AIRecommendations 
                                onAddToPlanner={setSelectedFoodForPlanner}
                                onOpenNutrition={setSelectedFoodForNutrition}
                            />
                        </ErrorBoundary>

                        {/* Control Bar */}
                        <TopControlBar 
                            search={searchTerm}
                            onSearchChange={setSearchTerm}
                            onFilterToggle={() => setIsFilterOpen(true)}
                            onMyFoodToggle={() => setFilters({ onlyMyFoods: !filters.onlyMyFoods })}
                            onCollectionsToggle={() => setFilters({ selectedCollectionId: filters.selectedCollectionId ? null : collections[0]?.id || null })}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            savedCount={savedFoods.length}
                            isFiltered={isFiltered}
                            onReset={handleResetAll}
                        />

                        {/* Food Grid */}
                        <div className="relative">
                            {displayFoods.length === 0 && !loading ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center p-20 text-center"
                                >
                                    <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center text-slate-400 mb-8 border-4 border-white dark:border-slate-800 shadow-xl">
                                        <FilterX size={64} className="opacity-20" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">No Results Found</h3>
                                    <button 
                                        onClick={handleResetAll}
                                        className="px-10 py-4 bg-emerald-500 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-200"
                                    >
                                        Reset Filters
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    <FoodGrid 
                                        foods={displayFoods}
                                        onAddToPlanner={setSelectedFoodForPlanner}
                                        onOpenNutrition={setSelectedFoodForNutrition}
                                        viewMode={viewMode}
                                    />
                                    {hasMore && (
                                        <div ref={lastElementRef} className="h-32 flex items-center justify-center">
                                            <Loader2 size={32} className="text-emerald-500 animate-spin" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </DataReady>
            </ClientOnly>

            <FilterDrawer 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetAll}
                collections={collections}
            />

            <NutritionDetailsModal 
                isOpen={!!selectedFoodForNutrition}
                onClose={() => setSelectedFoodForNutrition(null)}
                food={selectedFoodForNutrition}
            />

            <AddToPlannerModal 
                isOpen={!!selectedFoodForPlanner}
                onClose={() => setSelectedFoodForPlanner(null)}
                food={selectedFoodForPlanner}
            />
        </div>
    );
}
