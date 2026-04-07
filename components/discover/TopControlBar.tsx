"use client";

import { Search, Filter, Bookmark, Layers, LayoutGrid, List, X } from "lucide-react";

interface TopControlBarProps {
    search: string;
    onSearchChange: (val: string) => void;
    onFilterToggle: () => void;
    onMyFoodToggle: () => void;
    onCollectionsToggle: () => void;
    viewMode: "grid" | "list";
    onViewModeChange: (mode: "grid" | "list") => void;
    savedCount: number;
    isFiltered: boolean;
    onReset: () => void;
}

export default function TopControlBar({ 
    search, 
    onSearchChange, 
    onFilterToggle, 
    onMyFoodToggle, 
    onCollectionsToggle, 
    viewMode, 
    onViewModeChange,
    savedCount,
    isFiltered,
    onReset
}: TopControlBarProps) {
    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 lg:p-6 transition-all no-print">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Left Side: Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <button 
                        onClick={onFilterToggle}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold whitespace-nowrap shadow-lg ${isFiltered ? "bg-emerald-500 text-white shadow-emerald-200/50" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm"}`}
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                        {isFiltered && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    </button>
                    
                    <button 
                        onClick={onMyFoodToggle}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-all font-bold whitespace-nowrap relative min-w-[130px] justify-center"
                    >
                        <Bookmark size={18} />
                        <span>My Foods</span>
                        {savedCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950 font-black shadow-lg">
                                {savedCount}
                            </span>
                        )}
                    </button>
                    
                    <button 
                        onClick={onCollectionsToggle}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-all font-bold whitespace-nowrap"
                    >
                        <Layers size={18} />
                        <span>Collections</span>
                    </button>

                    {isFiltered && (
                        <button 
                            onClick={onReset}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-xl transition-all font-bold whitespace-nowrap"
                        >
                            <X size={18} />
                            <span className="hidden sm:inline">Clear All</span>
                        </button>
                    )}
                </div>

                {/* Center: Search */}
                <div className="relative w-full md:max-w-md lg:max-w-lg">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={20} />
                    </div>
                    <input 
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search Foods, Recipes..."
                        className="w-full pl-12 pr-12 py-3 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 shadow-inner"
                    />
                    {search && (
                        <button 
                            onClick={() => onSearchChange("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Right Side: View Toggles */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shrink-0 border border-slate-200/50 dark:border-slate-800/50">
                    <button 
                        onClick={() => onViewModeChange("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button 
                        onClick={() => onViewModeChange("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
