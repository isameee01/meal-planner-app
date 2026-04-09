"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Link as LinkIcon, ChefHat, Salad, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import { useTheme } from "../../../components/ThemeProvider";
import { useMounted } from "../../../lib/hooks/useMounted";
import { useCustomFoods } from "../../../lib/hooks/useCustomFoods";
import { useCustomRecipes } from "../../../lib/hooks/useCustomRecipes";
import CustomItemCard from "../../../components/dashboard/CustomItemCard";
import CustomItemModal from "../../../components/dashboard/CustomItemModal";
import { CustomFood, CustomRecipe } from "../../../types/custom-recipes";
import ClientOnly from "../../../components/common/ClientOnly";
import DataReady from "../../../components/common/DataReady";
import { GridSkeleton } from "../../../components/common/Skeleton";

type Tab = "all" | "foods" | "recipes";


export default function CustomRecipesPage() {
    const mounted = useMounted();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [selectedItem, setSelectedItem] = useState<(CustomFood | CustomRecipe) | null>(null);
    const { theme, setTheme } = useTheme();

    const { foods, loading: foodsLoading, deleteFood } = useCustomFoods();
    const { recipes, loading: recipesLoading, deleteRecipe } = useCustomRecipes();

    const isLoading = foodsLoading || recipesLoading;
    const hasItems = foods.length > 0 || recipes.length > 0;

    const filteredItems = [
        ...foods.map(f => ({ ...f, type: "food" as const })),
        ...recipes.map(r => ({ ...r, type: "recipe" as const }))
    ].filter(item => {
        if (activeTab === "all") return true;
        if (activeTab === "foods") return item.type === "food";
        if (activeTab === "recipes") return item.type === "recipe";
        return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors overflow-hidden">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen ${collapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"}`}>
                <Header 
                    toggleMobileMenu={() => setMobileMenuOpen(true)}
                    theme={theme}
                    onThemeChange={setTheme}
                    title="Custom Library"
                />

                <ClientOnly fallback={
                    <div className="flex-1 p-4 lg:p-10">
                        <div className="max-w-6xl mx-auto space-y-12">
                            <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                            <GridSkeleton count={6} type="card" />
                        </div>
                    </div>
                }>
                    <DataReady loading={isLoading} fallback={
                        <div className="flex-1 p-4 lg:p-10">
                            <div className="max-w-6xl mx-auto space-y-12">
                                <div className="h-12 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                                <GridSkeleton count={6} type="card" />
                            </div>
                        </div>
                    }>
                        <div className="flex-1 p-4 lg:p-10 overflow-y-auto relative scrollbar-hide">
                            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                                {/* Title Section */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <motion.h1 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight"
                                        >
                                            Custom <span className="text-emerald-500 text-stroke-sm">Library</span>
                                        </motion.h1>
                                        <p className="text-slate-400 dark:text-slate-500 font-medium">
                                            Manage your personalized food database and home-made recipes.
                                        </p>
                                    </div>
                                    
                                    {/* Tabs */}
                                    <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        {(["all", "foods", "recipes"] as Tab[]).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`relative px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                                    activeTab === tab ? "text-emerald-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                }`}
                                            >
                                                {activeTab === tab && (
                                                    <motion.div 
                                                        layoutId="activeTab"
                                                        className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{tab}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ActionCard icon={Salad} label="New Food" href="/dashboard/custom-recipes/create-food" color="emerald" />
                                    <ActionCard icon={ChefHat} label="New Recipe" href="/dashboard/custom-recipes/create-recipe" color="blue" />
                                    <ActionCard icon={LinkIcon} label="Import URL" href="/dashboard/custom-recipes/import" color="slate" />
                                </div>

                                {/* Content Area */}
                                {!hasItems ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-slate-900 rounded-[40px] p-20 flex flex-col items-center text-center space-y-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-emerald-500/5"
                                    >
                                        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center text-emerald-500">
                                            <UtensilsCrossed size={40} className="stroke-[1.5]" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">No custom items yet.</h3>
                                            <p className="text-slate-400 dark:text-slate-500 font-medium max-w-sm mx-auto">
                                                Start building your personal library by creating your first food or recipe.
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="py-20 text-center space-y-4">
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No {activeTab} found</p>
                                        <button onClick={() => setActiveTab("all")} className="text-emerald-500 font-bold hover:underline">Show all items</button>
                                    </div>
                                ) : (
                                    <motion.div 
                                        layout
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {filteredItems.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <CustomItemCard 
                                                        item={item as any} 
                                                        onDelete={() => item.type === "food" ? deleteFood(item.id) : deleteRecipe(item.id)} 
                                                        onView={() => setSelectedItem(item)}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </DataReady>
                </ClientOnly>



                {/* Detail Modal */}
                {selectedItem && (
                    <CustomItemModal 
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                    />
                )}
            </main>
        </div>
    );
}

function ActionCard({ icon: Icon, label, href, color }: { icon: any, label: string, href: string, color: 'emerald' | 'blue' | 'slate' }) {
    const colors = {
        emerald: "bg-emerald-500 shadow-emerald-500/20",
        blue: "bg-blue-500 shadow-blue-500/20",
        slate: "bg-slate-800 shadow-slate-800/20 dark:bg-slate-700"
    };

    return (
        <Link href={href}>
            <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${colors[color]} text-white p-6 rounded-3xl flex items-center space-x-4 shadow-xl transition-all`}
            >
                <div className="p-3 bg-white/20 rounded-2xl">
                    <Icon size={24} className="stroke-[2.5]" />
                </div>
                <span className="font-black uppercase tracking-widest text-xs">{label}</span>
                <Plus size={20} className="ml-auto opacity-50" />
            </motion.div>
        </Link>
    );
}
