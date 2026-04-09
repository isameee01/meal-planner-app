"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    Search, 
    LayoutGrid, 
    ListFilter, 
    Heart, 
    Star, 
    Users, 
    ArrowRight, 
    Library,
    Compass,
    CheckCircle2
} from "lucide-react";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { useCollections } from "../../../lib/hooks/useCollections";
import { useFavorites } from "../../../lib/hooks/useFavorites";
import { useFollowedCollections } from "../../../lib/hooks/useFollowedCollections";
import { useMounted } from "../../../lib/hooks/useMounted";
import { FEATURED_COLLECTIONS } from "../../../lib/constants/collections-data";
import ClientOnly from "../../../components/common/ClientOnly";
import DataReady from "../../../components/common/DataReady";
import { GridSkeleton } from "../../../components/common/Skeleton";
import { useTheme } from "../../../components/ThemeProvider";

export default function CollectionsDashboard() {
    const mounted = useMounted();
    const [collapsed, setCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "newest">("newest");

    const { collections, loading: collectionsLoading } = useCollections();
    const { favoriteIds, loading: favoritesLoading } = useFavorites();
    const { followedIds, recurringIds, loading: followedLoading, toggleFollow, toggleRecurring } = useFollowedCollections();
    const { theme, setTheme } = useTheme();


    const isLoading = collectionsLoading || favoritesLoading || followedLoading;

    const filteredCollections = collections.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const followedItems = FEATURED_COLLECTIONS.filter(fc => followedIds.includes(fc.id));

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            
            <main className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[280px]"}`}>
                <Header 
                    title="Collections" 
                    theme={theme} 
                    onThemeChange={setTheme} 
                />


                <ClientOnly fallback={
                    <div className="max-w-7xl mx-auto p-8 space-y-12">
                        <GridSkeleton count={4} type="collection" />
                        <GridSkeleton count={3} type="collection" />
                    </div>
                }>
                    <DataReady loading={isLoading} fallback={
                        <div className="max-w-7xl mx-auto p-8 space-y-12">
                            <GridSkeleton count={4} type="collection" />
                            <GridSkeleton count={3} type="collection" />
                        </div>
                    }>
                        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-12 pb-32">
                            
                            {/* Top Bar Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            type="text" 
                                            placeholder="Search collections..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-sm text-slate-600 dark:text-slate-400"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="name">Sort by Name</option>
                                        </select>
                                        <ListFilter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <Link 
                                    href="/dashboard/collections/create"
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                                >
                                    <Plus size={20} />
                                    <span>Create Collection</span>
                                </Link>
                            </div>

                            {/* My Collections Section */}
                            <section className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg">
                                        <Library size={18} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My Collections</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {/* FAVORITES CARD (Always First) */}
                                    <Link href="/dashboard/collections/favorites">
                                        <motion.div 
                                            whileHover={{ y: -5 }}
                                            className="bg-gradient-to-br from-red-50 to-red-50/30 dark:from-red-950/20 dark:to-red-950/10 rounded-[2.5rem] p-8 border border-red-100 dark:border-red-900/30 h-full flex flex-col group relative overflow-hidden transition-all shadow-xl shadow-red-100/20"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform" />
                                            
                                            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-red-500 shadow-lg border border-red-50 dark:border-red-900/20 mb-6">
                                                <Heart size={28} fill="currentColor" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Favorites</h3>
                                            <p className="text-sm font-bold text-red-600 dark:text-red-400/70 mb-8">Your hand-picked items</p>
                                            
                                            <div className="mt-auto flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">{favoriteIds.length} ITEMS</span>
                                                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    {/* User User Collections */}
                                    {filteredCollections.map(collection => (
                                        <CollectionCard key={collection.id} collection={collection} />
                                    ))}
                                </div>
                            </section>

                            {/* Followed Collections Section */}
                            {followedIds.length > 0 && (
                                <section className="space-y-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg">
                                            <Star size={18} strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Followed</h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {followedItems.map(item => (
                                            <CollectionCard key={item.id} collection={item} isFollowed />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Featured Collections Section */}
                            <section className="space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-purple-500 rounded-xl text-white shadow-lg">
                                            <Compass size={18} strokeWidth={2.5} />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Featured Collections</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {FEATURED_COLLECTIONS.filter(fc => !followedIds.includes(fc.id)).map((collection) => (
                                        <FeaturedCard key={collection.id} collection={collection} />
                                    ))}
                                </div>
                            </section>

                        </div>
                    </DataReady>
                </ClientOnly>
            </main>
        </div>
    );
}

function CollectionCard({ collection, isFollowed }: { collection: any, isFollowed?: boolean }) {
    return (
        <Link href={`/dashboard/collections/${collection.id}`}>
            <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 h-full flex flex-col group relative transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-emerald-500/20"
            >
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm mb-6">
                    <Library size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{collection.name || collection.title}</h3>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 line-clamp-2 mb-8 leading-relaxed">
                    {collection.description || "Personal collection of curated items."}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {collection.itemCount || collection.foodIds?.length || 0} Items
                        </span>
                        {isFollowed && (
                            <span className="text-[10px] font-black text-blue-500 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">FOLLOWED</span>
                        )}
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
            </motion.div>
        </Link>
    );
}

function FeaturedCard({ collection }: { collection: any }) {
    return (
        <Link href={`/dashboard/collections/${collection.id}`}>
            <motion.div 
                whileHover={{ y: -5 }}
                className="group bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-emerald-500/30 transition-all flex flex-col h-full"
            >
                <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img 
                        src={`https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800&sig=${collection.id}`}
                        alt={collection.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center space-x-2 text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">
                            <Users size={12} />
                            <span>{collection.creator}</span>
                        </div>
                        <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{collection.title}</h4>
                    </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                        {collection.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {collection.itemCount} Items
                            </span>
                        </div>
                        <div className="flex items-center text-emerald-500 font-black text-[10px] uppercase tracking-widest group-hover:gap-2 transition-all">
                            <span>Browse Group</span>
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
