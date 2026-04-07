"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Plus, Loader2, Sparkles, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDiscover, INITIAL_FILTERS } from "../../../lib/hooks/useDiscover";
import { useDebounce } from "../../../lib/hooks/useDebounce";
import TopControlBar from "../../../components/discover/TopControlBar";
import FilterDrawer from "../../../components/discover/FilterDrawer";
import FoodGrid from "../../../components/discover/FoodGrid";
import SkeletonGrid from "../../../components/discover/SkeletonGrid";
import NutritionDetailsModal from "../../../components/discover/NutritionDetailsModal";
import AddToPlannerModal from "../../../components/discover/AddToPlannerModal";
import { FoodItem } from "../../../lib/discover-db";
import ErrorBoundary from "../../../components/common/ErrorBoundary";

export default function DiscoverPage() {
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
        <div className="min-h-full pb-20 bg-slate-50 dark:bg-slate-950 transition-colors">
            
            <ErrorBoundary>
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
            </ErrorBoundary>

            <ErrorBoundary>
                <FilterDrawer 
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    filters={filters}
                    setFilters={setFilters}
                    onReset={handleResetAll}
                    collections={collections}
                />
            </ErrorBoundary>

            <div className="relative">
                <ErrorBoundary>
                    {loading && displayFoods.length === 0 ? (
                        <SkeletonGrid />
                    ) : displayFoods.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center p-20 text-center"
                        >
                            <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center text-slate-400 mb-8 border-4 border-white dark:border-slate-800 shadow-xl">
                                <FilterX size={64} className="opacity-20" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">No Results Found</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 font-medium">
                                We couldn't find any foods matching your current criteria. Try widening your search or clearing filters.
                            </p>
                            <button 
                                onClick={handleResetAll}
                                className="px-10 py-4 bg-emerald-500 text-white rounded-[2rem] font-black shadow-2xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <Sparkles size={20} />
                                Reset All Filters
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
                            
                            {/* Pagination Trigger */}
                            {hasMore && (
                                <div ref={lastElementRef} className="h-32 flex items-center justify-center no-print">
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700"
                                    >
                                        <Loader2 size={32} className="text-emerald-500" />
                                    </motion.div>
                                </div>
                            )}
                        </>
                    )}
                </ErrorBoundary>
            </div>

            {/* Modals */}
            <ErrorBoundary>
                <NutritionDetailsModal 
                    isOpen={!!selectedFoodForNutrition}
                    onClose={() => setSelectedFoodForNutrition(null)}
                    food={selectedFoodForNutrition}
                />
            </ErrorBoundary>

            <ErrorBoundary>
                <AddToPlannerModal 
                    isOpen={!!selectedFoodForPlanner}
                    onClose={() => setSelectedFoodForPlanner(null)}
                    food={selectedFoodForPlanner}
                />
            </ErrorBoundary>

            {/* Float Action Button for Mobile */}
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden z-50 no-print border-4 border-white/20"
                onClick={() => window.location.href = "/dashboard/discover/create"}
            >
                <Plus size={32} />
            </motion.button>
        </div>
    );
}
