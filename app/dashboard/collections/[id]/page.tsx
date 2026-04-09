"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ChevronLeft, 
    Star, 
    RefreshCcw, 
    Users, 
    Library, 
    Heart,
    Utensils,
    Calendar,
    ArrowUpDown,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../../components/dashboard/Sidebar";
import Header from "../../../../components/dashboard/Header";
import { useCollections } from "../../../../lib/hooks/useCollections";
import { useFavorites } from "../../../../lib/hooks/useFavorites";
import { useFollowedCollections } from "../../../../lib/hooks/useFollowedCollections";
import { useMounted } from "../../../../lib/hooks/useMounted";
import { getFoodById } from "../../../../lib/storage-utils";
import { FEATURED_COLLECTIONS, STATIC_FOOD_DATA } from "../../../../lib/constants/collections-data";
import CustomItemCard from "../../../../components/dashboard/CustomItemCard";
import CustomItemModal from "../../../../components/dashboard/CustomItemModal";
import { useTheme } from "../../../../components/ThemeProvider";
import ClientOnly from "../../../../components/common/ClientOnly";
import DataReady from "../../../../components/common/DataReady";
import { GridSkeleton, PageHeaderSkeleton } from "../../../../components/common/Skeleton";

export default function CollectionDetailPage() {
    const mounted = useMounted();
    const [collapsed, setCollapsed] = useState(false);
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [sortBy, setSortBy] = useState<"newest" | "name">("newest");

    const { collections, loading: collectionsLoading } = useCollections();
    const { favoriteIds, loading: favoritesLoading } = useFavorites();
    const { followedIds, recurringIds, loading: followedLoading, toggleFollow, toggleRecurring } = useFollowedCollections();
    const { theme, setTheme } = useTheme();

    const isLoadingData = collectionsLoading || favoritesLoading || followedLoading;

    // Resolve Collection Data
    const collectionData = useMemo(() => {
        if (!mounted) return null;

        if (id === "favorites") {
            return {
                id: "favorites",
                name: "Favorites",
                description: "Your hand-picked collection of top foods and recipes.",
                creator: "You",
                itemIds: favoriteIds,
                isMyCollection: true
            };
        }

        const userCol = collections.find(c => c.id === id);
        if (userCol) {
            return {
                ...userCol,
                itemIds: userCol.foodIds,
                isMyCollection: true,
                creator: "You"
            };
        }

        const featuredCol = FEATURED_COLLECTIONS.find(fc => fc.id === id);
        if (featuredCol) {
            return {
                ...featuredCol,
                name: featuredCol.title,
                itemIds: STATIC_FOOD_DATA.slice(0, 10).map(f => f.id),
                isMyCollection: false
            };
        }

        return null;
    }, [id, collections, favoriteIds, mounted]);

    // Resolve Food Items
    const foods = useMemo(() => {
        if (!collectionData) return [];
        const items = collectionData.itemIds.map(fId => getFoodById(fId)).filter(Boolean);
        
        if (sortBy === "name") {
            return [...items].sort((a, b) => a.name.localeCompare(b.name));
        }
        return items;
    }, [collectionData, sortBy]);

    const isFollowed = collectionData ? followedIds.includes(collectionData.id) : false;
    const isRecurring = collectionData ? recurringIds.includes(collectionData.id) : false;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            
            <main className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[280px]"}`}>
                <Header 
                    title={collectionData?.name || "Collection"} 
                    theme={theme}
                    onThemeChange={setTheme}
                />

                <ClientOnly fallback={
                    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12 pb-32">
                        <PageHeaderSkeleton />
                        <GridSkeleton count={8} type="card" />
                    </div>
                }>
                    <DataReady loading={isLoadingData} fallback={
                        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12 pb-32">
                            <PageHeaderSkeleton />
                            <GridSkeleton count={8} type="card" />
                        </div>
                    }>
                        {!collectionData ? (
                            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Collection Not Found</h2>
                                    <Link href="/dashboard/collections" className="text-emerald-500 font-black uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-4">Back to Library</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12 pb-32">
                                <div className="space-y-8">
                                    <div>
                                        <Link 
                                            href="/dashboard/collections"
                                            className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest gap-2 mb-6"
                                        >
                                            <ChevronLeft size={16} />
                                            Library
                                        </Link>
                                        
                                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                                            <div className="space-y-4 max-w-2xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-3 rounded-2xl text-white shadow-xl ${collectionData.id === 'favorites' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                                        {collectionData.id === 'favorites' ? <Heart size={24} fill="currentColor" /> : <Library size={24} />}
                                                    </div>
                                                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{collectionData.name}</h1>
                                                </div>
                                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-4 border-slate-200 dark:border-slate-800 pl-4">
                                                    {collectionData.description}
                                                </p>
                                                <div className="flex items-center gap-6 pt-2">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Users size={14} />
                                                        <span>Curated by {collectionData.creator}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <Utensils size={14} />
                                                        <span>{foods.length} Items</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {collectionData.id !== 'favorites' && (
                                                    <>
                                                        <button 
                                                            onClick={() => toggleFollow(collectionData.id)}
                                                            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
                                                                isFollowed 
                                                                    ? "bg-blue-500 text-white" 
                                                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            {isFollowed ? <CheckCircle2 size={16} /> : <Star size={16} />}
                                                            <span>{isFollowed ? "Followed" : "Follow Group"}</span>
                                                        </button>

                                                        <button 
                                                            onClick={() => toggleRecurring(collectionData.id)}
                                                            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg ${
                                                                isRecurring 
                                                                    ? "bg-purple-600 text-white" 
                                                                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            <RefreshCcw size={16} className={isRecurring ? "animate-spin-slow" : ""} />
                                                            <span>{isRecurring ? "Recurring Active" : "Set as Recurring"}</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <section className="space-y-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Group Content</h2>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <select 
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value as any)}
                                                    className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-black text-[10px] uppercase tracking-widest text-slate-500"
                                                >
                                                    <option value="newest">Recent</option>
                                                    <option value="name">Alpha</option>
                                                </select>
                                                <ArrowUpDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {foods.length === 0 ? (
                                        <div className="py-20 flex flex-col items-center text-center space-y-4">
                                            <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] text-slate-300">
                                                <Utensils size={48} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-400">No items found</h3>
                                            <p className="text-sm font-bold text-slate-400 max-w-xs uppercase tracking-tighter">Your selection will appear here once added.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            <AnimatePresence mode="popLayout">
                                                {foods.map((food, i) => (
                                                    <motion.div
                                                        key={food.id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ delay: i * 0.05 }}
                                                    >
                                                        <CustomItemCard 
                                                            item={food} 
                                                            onDelete={() => {}} 
                                                            onView={() => setSelectedFood(food)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </DataReady>
                </ClientOnly>

                {selectedFood && (
                    <CustomItemModal 
                        item={selectedFood}
                        onClose={() => setSelectedFood(null)}
                    />
                )}
            </main>
        </div>
    );
}
