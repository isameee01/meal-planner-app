"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    ShoppingCart, 
    Trash2, 
    CheckSquare, 
    Plus, 
    RefreshCcw, 
    Search,
    ChevronDown,
    Loader2,
    Package,
    ArrowUpRight,
    Archive,
    Zap,
    X,
    CheckCircle2,
    PlusCircle,
    Info,
    ArrowLeftRight,
    Filter,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../components/dashboard/Header";
import GroceryItemCard, { GroceryItem } from "../../../components/dashboard/GroceryItemCard";
import OrderModal from "../../../components/dashboard/OrderModal";
import { useTheme } from "../../../components/ThemeProvider";
import ClientOnly from "../../../components/common/ClientOnly";
import DataReady from "../../../components/common/DataReady";
import { GridSkeleton, SectionSkeleton } from "../../../components/common/Skeleton";
import { useMealState } from "../../../lib/contexts/MealStateContext";

// --- DEPARTMENT MAPPING ---
const DEPARTMENTS: Record<string, string> = {
    "Proteins": "THE BUTCHER",
    "Beef Products": "THE BUTCHER",
    "Sausages and Meats": "THE BUTCHER",
    "Vegetables": "PRODUCE",
    "Fruits": "PRODUCE",
    "Dairy Products": "DAIRY & EGGS",
    "Fats and Oils": "PANTRY & OILS",
    "Spices and Herbs": "SPICES & BAKING",
    "Nuts and Seeds": "BULK & SNACKS",
    "Pantry": "PANTRY & OILS",
    "Beverages": "BEVERAGES",
    "Sweets": "BULK & SNACKS",
    "Snacks": "BULK & SNACKS"
};

export default function GroceriesPage() {
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"groceries" | "pantry">("groceries");
    const [searchQuery, setSearchQuery] = useState("");
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const { mealsMap } = useMealState();
    
    const [toasts, setToasts] = useState<{ id: string, message: string, type: "success" | "info" }[]>([]);
    const [groceries, setGroceries] = useState<GroceryItem[]>([]);
    const [pantry, setPantry] = useState<GroceryItem[]>([]);
    const [selection, setSelection] = useState<Set<string>>(new Set());

    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const addToast = useCallback((message: string, type: "success" | "info" = "success") => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    useEffect(() => {
        setMounted(true);
        const savedGroceries = localStorage.getItem("dashboard_groceries");
        const savedPantry = localStorage.getItem("dashboard_pantry");
        
        if (savedGroceries) setGroceries(JSON.parse(savedGroceries));
        if (savedPantry) setPantry(JSON.parse(savedPantry));
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("dashboard_groceries", JSON.stringify(groceries));
            localStorage.setItem("dashboard_pantry", JSON.stringify(pantry));
        }
    }, [groceries, pantry, mounted]);

    const generateFromPlanner = useCallback(() => {
        setIsGenerating(true);
        // Simulate extraction logic from mealsMap
        setTimeout(() => {
            const itemsMap: Record<string, GroceryItem> = {};
            Object.values(mealsMap).forEach((dayMeals) => {
                dayMeals.forEach((meal) => {
                    meal.items.forEach((item) => {
                        const { food, amount } = item;
                        const key = food.name.toLowerCase();
                        if (itemsMap[key]) {
                            itemsMap[key].quantity += amount;
                        } else {
                            itemsMap[key] = { 
                                id: food.id, 
                                name: food.name, 
                                category: food.category || "Pantry", 
                                quantity: amount, 
                                unit: food.serving.split(' ').pop() || "unit" 
                            };
                        }
                    });
                });
            });
            setGroceries(Object.values(itemsMap));
            setIsGenerating(false);
            addToast("Synced with Meal Planner", "success");
        }, 1200);
    }, [mealsMap, addToast]);

    const toggleSelection = useCallback((id: string) => {
        setSelection(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const moveSelected = useCallback(() => {
        const source = activeTab === "groceries" ? groceries : pantry;
        const target = activeTab === "groceries" ? setPantry : setGroceries;
        const sourceSet = activeTab === "groceries" ? setGroceries : setPantry;

        const toMove = source.filter(i => selection.has(i.id));
        target(prev => [...prev, ...toMove]);
        sourceSet(prev => prev.filter(i => !selection.has(i.id)));
        setSelection(new Set());
        addToast(`Moved ${toMove.length} items`, "success");
    }, [activeTab, groceries, pantry, selection, addToast]);

    const deleteSelected = useCallback(() => {
        const setList = activeTab === "groceries" ? setGroceries : setPantry;
        setList(prev => prev.filter(i => !selection.has(i.id)));
        setSelection(new Set());
        addToast("Items removed", "info");
    }, [activeTab, selection, addToast]);

    const updateItem = useCallback((id: string, updates: Partial<GroceryItem>) => {
        const setList = activeTab === "groceries" ? setGroceries : setPantry;
        setList(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }, [activeTab]);

    const filteredItems = useMemo(() => {
        const list = activeTab === "groceries" ? groceries : pantry;
        return list.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [activeTab, groceries, pantry, searchQuery]);

    const groupedByDept = useMemo(() => {
        const groups: Record<string, GroceryItem[]> = {};
        filteredItems.forEach(item => {
            const dept = DEPARTMENTS[item.category] || "MISC";
            if (!groups[dept]) groups[dept] = [];
            groups[dept].push(item);
        });
        return groups;
    }, [filteredItems]);

    return (
        <div className="flex flex-col min-w-0 h-full bg-slate-50 dark:bg-slate-950">
            <Header 
                toggleMobileMenu={() => {}} 
                viewMode="day" 
                setViewMode={() => {}} 
                selectedDate={new Date()} 
                onDateChange={() => {}} 
                theme={theme} 
                onThemeChange={setTheme} 
                isProcessing={isGenerating} 
            />

            <div className="flex-1 p-6 lg:p-12 overflow-y-auto no-scrollbar">
                <div className="max-w-7xl mx-auto pb-32">
                    
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                        <div className="space-y-4">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full"
                            >
                                <ShoppingCart size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Inventory Management</span>
                            </motion.div>
                            <h1 className="text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none italic">
                                Procurement <span className="text-emerald-500">Hub</span>
                            </h1>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                Interactive Logistics Suite
                            </p>
                        </div>

                        <div className="flex items-center space-x-3">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={generateFromPlanner}
                                disabled={isGenerating}
                                className="flex items-center space-x-3 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all shadow-sm"
                            >
                                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                                <span>Sync with Planner</span>
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsOrderModalOpen(true)}
                                className="px-10 py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                            >
                                Bulk Order Details
                            </motion.button>
                        </div>
                    </div>

                    {/* Navigation Tabs & Filters */}
                    <div className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl py-6 mb-12 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                        <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-inner">
                            <button 
                                onClick={() => setActiveTab("groceries")}
                                className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "groceries" ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Shopping List
                            </button>
                            <button 
                                onClick={() => setActiveTab("pantry")}
                                className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "pantry" ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-lg" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Pantry Stocks
                            </button>
                        </div>

                        <div className="flex items-center space-x-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80 group">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 uppercase tracking-wider"
                                />
                            </div>
                            
                            <AnimatePresence>
                                {selection.size > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center space-x-2"
                                    >
                                        <button onClick={moveSelected} className="w-12 h-12 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10">
                                            <ArrowLeftRight size={20} />
                                        </button>
                                        <button onClick={deleteSelected} className="w-12 h-12 flex items-center justify-center bg-red-50 dark:bg-red-900/30 text-red-500 rounded-2xl border border-red-100 dark:border-red-800 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10">
                                            <Trash2 size={20} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-32"
                            >
                                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin border-opacity-20" />
                                <div className="mt-8 text-center space-y-2">
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Analyzing Nutrition Targets</p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase animate-pulse">Building Dynamic Ingredient Manifest</p>
                                </div>
                            </motion.div>
                        ) : filteredItems.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8">
                                    <ShoppingCart size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">No Inventory Items</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Sync from your meal planner to populate your list</p>
                                <button onClick={generateFromPlanner} className="mt-10 px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Start Auto-Procurement</button>
                            </motion.div>
                        ) : (
                            <div className="space-y-20">
                                {Object.entries(groupedByDept).map(([dept, items]) => (
                                    <div key={dept} className="space-y-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="px-6 py-2 bg-slate-900 dark:bg-white rounded-2xl shadow-xl">
                                                <h2 className="text-[10px] font-black text-white dark:text-slate-900 uppercase tracking-widest italic flex items-center">
                                                    {dept} <span className="ml-3 opacity-40 text-[8px]">× {items.length}</span>
                                                </h2>
                                            </div>
                                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {items.map(item => (
                                                <GroceryItemCard 
                                                    key={item.id} 
                                                    item={item} 
                                                    selected={selection.has(item.id)}
                                                    onToggle={toggleSelection}
                                                    onUpdate={updateItem}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div 
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl border-2 pointer-events-auto ${toast.type === "success" ? "bg-emerald-500 border-emerald-400 text-white" : "bg-slate-800 border-slate-700 text-white"}`}
                        >
                            {toast.type === "success" ? <CheckCircle2 size={24} /> : <Info size={24} />}
                            <span className="font-black text-xs uppercase tracking-widest">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <OrderModal 
                isOpen={isOrderModalOpen} 
                onClose={() => setIsOrderModalOpen(false)} 
                selectedItems={Array.from(selection).map(id => groceries.find(i => i.id === id)?.name || "")} 
            />
        </div>
    );
}
