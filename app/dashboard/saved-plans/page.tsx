"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
    Plus, 
    Search, 
    ArrowUpDown, 
    Layout, 
    FilterX,
    FolderPlus,
    CalendarCheck,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../components/dashboard/Header";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSavedPlans } from "../../../lib/hooks/useSavedPlans";
import ClientOnly from "../../../components/common/ClientOnly";
import DataReady from "../../../components/common/DataReady";
import { GridSkeleton, PageHeaderSkeleton } from "../../../components/common/Skeleton";
import SavedPlanCard from "../../../components/dashboard/SavedPlanCard";
import SavedPlanModal from "../../../components/dashboard/SavedPlanModal";
import { SavedPlan } from "../../../types/saved-plans";
import { useRouter } from "next/navigation";

type SortOption = "newest" | "oldest" | "name";

export default function SavedPlansPage() {
    const { plans, loading, deletePlan } = useSavedPlans();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    // Filtering & Sorting Logic
    const processedPlans = useMemo(() => {
        let result = [...plans];

        // Search
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.tags.some(t => t.toLowerCase().includes(query))
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "name":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return result;
    }, [plans, searchTerm, sortBy]);

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            deletePlan(id);
            if (selectedPlan?.id === id) setSelectedPlan(null);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/dashboard/saved-plans/create?edit=${id}`);
    };

    return (
        <div className="flex flex-col min-w-0 h-full">
            <Header title="Meal Library" theme={theme} onThemeChange={setTheme} />

                <ClientOnly fallback={
                    <div className="w-full p-4 sm:p-8 space-y-12">
                        <PageHeaderSkeleton />
                        <GridSkeleton count={6} type="card" />
                    </div>
                }>
                    <DataReady loading={loading} fallback={
                        <div className="w-full p-4 sm:p-8 space-y-12">
                            <PageHeaderSkeleton />
                            <GridSkeleton count={6} type="card" />
                        </div>
                    }>
                        <div className="w-full p-4 sm:p-8 space-y-12 pb-32">
                            <div className="w-full flex justify-center">
                                <div className="w-full max-w-7xl">
                                    {/* Header Layout per requirements */}
                                    <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
                                        {/* Top Row */}
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            {/* LEFT */}
                                            <div className="flex flex-col max-w-2xl">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                                                        <CalendarCheck size={24} />
                                                    </div>
                                                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Saved Plans</h1>
                                                </div>
                                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tight">
                                                    Your personal architecture of nutrition. Save days or weeks of meal plans and load them whenever you like.
                                                </p>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="flex items-center gap-3">
                                                <Link 
                                                    href="/dashboard/saved-plans/create"
                                                    className="px-6 py-4 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                                                >
                                                    <Plus size={18} />
                                                    <span>Create<span className="hidden sm:inline"> New Plan</span></span>
                                                </Link>

                                                <div className="relative">
                                                    <select 
                                                        value={sortBy}
                                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                                        className="appearance-none pl-4 pr-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer shadow-sm"
                                                    >
                                                        <option value="newest">Newest First</option>
                                                        <option value="oldest">Oldest First</option>
                                                        <option value="name">Name A-Z</option>
                                                    </select>
                                                    <ArrowUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Row */}
                                        <div className="w-full relative group mt-2">
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                            <input 
                                                type="text"
                                                placeholder="Filter by title or tag..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Main Rendering Section */}
                                    <div className="mt-6">
                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                            {/* LEFT (70%): Saved plans grid */}
                                            <div className="xl:col-span-2">
                                                {(plans || []).length === 0 ? (
                                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                                        <div className="w-32 h-32 bg-emerald-50 dark:bg-emerald-950/20 rounded-[3rem] flex items-center justify-center text-emerald-500">
                                                            <FolderPlus size={64} />
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Library Empty</h3>
                                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">
                                                                Start by saving your curated meal sequences for rapid deployment.
                                                            </p>
                                                        </div>
                                                        <Link 
                                                            href="/dashboard/saved-plans/create"
                                                            className="px-10 py-5 bg-slate-900 dark:bg-emerald-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                                        >
                                                            Create First Plan
                                                        </Link>
                                                    </div>
                                                ) : (processedPlans || []).length === 0 ? (
                                                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                                                        <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-[3rem] text-slate-300">
                                                            <FilterX size={48} />
                                                        </div>
                                                        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight italic text-stroke-sm">No matches found</h3>
                                                        <button 
                                                            onClick={() => setSearchTerm("")}
                                                            className="text-emerald-500 font-black uppercase text-xs tracking-widest hover:underline decoration-2"
                                                        >
                                                            Clear search
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <motion.div 
                                                        layout
                                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                                    >
                                                        <AnimatePresence mode="popLayout">
                                                            {processedPlans.map((plan) => (
                                                                <SavedPlanCard 
                                                                    key={plan.id}
                                                                    plan={plan}
                                                                    onView={() => setSelectedPlan(plan)}
                                                                    onEdit={() => handleEdit(plan.id)}
                                                                    onDelete={() => handleDelete(plan.id)}
                                                                />
                                                            ))}
                                                        </AnimatePresence>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* RIGHT (30%): Side Panel */}
                                            <div className="xl:col-span-1 hidden xl:block">
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 h-full min-h-[400px] border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                                                    <Layout size={48} className="text-slate-300 dark:text-slate-600 mb-6" />
                                                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-2">Analytics & Summary</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px]">
                                                        Your macro-level timeline analytics will appear here soon.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DataReady>
                </ClientOnly>

                {/* Detail Modal */}
                <AnimatePresence>
                    {selectedPlan && (
                        <SavedPlanModal 
                            plan={selectedPlan}
                            onClose={() => setSelectedPlan(null)}
                            onEdit={() => handleEdit(selectedPlan.id)}
                            onDelete={() => handleDelete(selectedPlan.id)}
                        />
                    )}
                </AnimatePresence>
        </div>
    );
}
