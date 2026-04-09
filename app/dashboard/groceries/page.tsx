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
    ArrowLeftRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import GroceryItemCard, { GroceryItem } from "../../../components/dashboard/GroceryItemCard";
import OrderModal from "../../../components/dashboard/OrderModal";
import { useTheme } from "../../../components/ThemeProvider";
import ClientOnly from "../../../components/common/ClientOnly";
import DataReady from "../../../components/common/DataReady";
import { GridSkeleton, SectionSkeleton } from "../../../components/common/Skeleton";

// --- RICH DATASET ---
const INITIAL_GROCERIES: GroceryItem[] = [
    { id: "d1", name: "Whole Milk", category: "Dairy Products", quantity: 1, unit: "L" },
    { id: "d2", name: "Greek Yogurt", category: "Dairy Products", quantity: 500, unit: "g" },
    { id: "d3", name: "Cheddar Cheese", category: "Dairy Products", quantity: 200, unit: "g" },
    { id: "d5", name: "Eggs", category: "Dairy Products", quantity: 12, unit: "piece" },
    { id: "sp1", name: "Black Pepper", category: "Spices and Herbs", quantity: 50, unit: "g" },
    { id: "sp2", name: "Sea Salt", category: "Spices and Herbs", quantity: 500, unit: "g" },
    { id: "sp3", name: "Garlic Powder", category: "Spices and Herbs", quantity: 100, unit: "g" },
    { id: "fo1", name: "Olive Oil", category: "Fats and Oils", quantity: 500, unit: "ml" },
    { id: "fo2", name: "Coconut Oil", category: "Fats and Oils", quantity: 400, unit: "ml" },
    { id: "fr1", name: "Banana", category: "Fruits", quantity: 6, unit: "piece" },
    { id: "fr2", name: "Avocado", category: "Fruits", quantity: 3, unit: "piece" },
    { id: "fr3", name: "Blueberries", category: "Fruits", quantity: 125, unit: "g" },
    { id: "v1", name: "Broccoli", category: "Vegetables", quantity: 500, unit: "g" },
    { id: "v2", name: "Spinach", category: "Vegetables", quantity: 200, unit: "g" },
    { id: "v3", name: "Garlic", category: "Vegetables", quantity: 3, unit: "piece" },
    { id: "m1", name: "Chicken Breast", category: "Proteins", quantity: 1, unit: "kg" },
    { id: "m3", name: "Ground Beef", category: "Beef Products", quantity: 1, unit: "lb" },
    { id: "m6", name: "Bacon", category: "Sausages and Meats", quantity: 250, unit: "g" },
    { id: "n1", name: "Almonds", category: "Nuts and Seeds", quantity: 250, unit: "g" },
    { id: "py1", name: "Brown Rice", category: "Pantry", quantity: 2, unit: "kg" },
    { id: "bv1", name: "Sparkling Water", category: "Beverages", quantity: 6, unit: "piece" },
    { id: "sw1", name: "Dark Chocolate", category: "Sweets", quantity: 100, unit: "g" },
];

const SUGGESTIONS: GroceryItem[] = [
    { id: "sug1", name: "Kale", category: "Vegetables", quantity: 1, unit: "piece" },
    { id: "sug2", name: "Quinoa", category: "Pantry", quantity: 1, unit: "kg" },
    { id: "sug3", name: "Peanut Butter", category: "Nuts and Seeds", quantity: 1, unit: "piece" },
    { id: "sug4", name: "Oat Milk", category: "Dairy Products", quantity: 1, unit: "L" },
    { id: "sug5", name: "Hummus", category: "Snacks", quantity: 1, unit: "piece" },
];

export default function GroceriesPage() {
    const [mounted, setMounted] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"groceries" | "pantry">("groceries");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [toasts, setToasts] = useState<{ id: string, message: string, type: "success" | "info" }[]>([]);
    const [groceries, setGroceries] = useState<GroceryItem[]>([]);
    const [pantry, setPantry] = useState<GroceryItem[]>([]);
    const [selection, setSelection] = useState<Set<string>>(new Set());

    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const addToast = useCallback((message: string, type: "success" | "info" = "success") => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    useEffect(() => {
        setMounted(true);
        const authStatus = localStorage.getItem("isLoggedIn");
        if (authStatus !== "true") {
            router.push("/auth/login");
            return;
        }

        const savedGroceries = localStorage.getItem("dashboard_groceries");
        const savedPantry = localStorage.getItem("dashboard_pantry");
        
        if (savedGroceries) setGroceries(JSON.parse(savedGroceries));
        else setGroceries(INITIAL_GROCERIES);

        if (savedPantry) setPantry(JSON.parse(savedPantry));
    }, [router]);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("dashboard_groceries", JSON.stringify(groceries));
            localStorage.setItem("dashboard_pantry", JSON.stringify(pantry));
        }
    }, [groceries, pantry, mounted]);

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
    }, [searchQuery]);

    const addItemToList = useCallback((item: GroceryItem, target: "groceries" | "pantry") => {
        const setList = target === "groceries" ? setGroceries : setPantry;
        setList(prev => {
            const existingIdx = prev.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
            if (existingIdx > -1) {
                const next = [...prev];
                next[existingIdx] = { ...next[existingIdx], quantity: parseFloat((next[existingIdx].quantity + item.quantity).toFixed(2)) };
                addToast(`Updated ${item.name}`, "info"); return next;
            }
            addToast(`Added ${item.name}`, "success"); return [...prev, item];
        });
    }, [addToast]);

    const generateFromPlanner = useCallback((merge: boolean = false) => {
        setIsGenerating(true);
        setTimeout(() => {
            const cacheRaw = localStorage.getItem("meals_cache");
            if (!cacheRaw) { addToast("No meal plan found", "info"); setIsGenerating(false); return; }
            const cache = JSON.parse(cacheRaw);
            const itemsMap: Record<string, GroceryItem> = {};
            Object.values(cache).forEach((dayMeals: any) => {
                dayMeals.forEach((meal: any) => {
                    meal.items.forEach((item: any) => {
                        const { food, amount } = item;
                        const servingMatch = food.serving.match(/(\d+(?:\.\d+)?)\s*(.*)/);
                        const servingVal = servingMatch ? parseFloat(servingMatch[1]) : 1;
                        const servingUnit = servingMatch ? servingMatch[2] || "serving" : "serving";
                        const totalQty = servingVal * amount;
                        const key = food.name.toLowerCase();
                        if (itemsMap[key]) itemsMap[key].quantity += totalQty;
                        else itemsMap[key] = { id: food.id, name: food.name, category: "Proteins", quantity: totalQty, unit: servingUnit };
                    });
                });
            });
            const newItems = Object.values(itemsMap).map(i => ({ ...i, quantity: parseFloat(i.quantity.toFixed(2)) }));
            if (merge) {
                setGroceries(prev => {
                    const next = [...prev];
                    newItems.forEach(item => {
                        const idx = next.findIndex(n => n.name.toLowerCase() === item.name.toLowerCase());
                        if (idx > -1) next[idx].quantity += item.quantity; else next.push(item);
                    });
                    return next;
                });
                addToast("Merged from Planner", "success");
            } else {
                setGroceries(newItems); addToast("Synced from Planner", "success");
            }
            setIsGenerating(false); setSelection(new Set());
        }, 1000);
    }, [addToast]);

    const toggleSelection = useCallback((id: string) => {
        setSelection(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    }, []);

    const moveBetween = useCallback((direction: "toPantry" | "toGroceries") => {
        if (direction === "toPantry") {
            const toMove = groceries.filter(i => selection.has(i.id));
            setPantry(prev => {
                const next = [...prev];
                toMove.forEach(item => {
                    const idx = next.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
                    if (idx > -1) next[idx].quantity += item.quantity; else next.push(item);
                });
                return next;
            });
            setGroceries(prev => prev.filter(i => !selection.has(i.id)));
            addToast(`Moved ${selection.size} to Pantry`, "success");
        } else {
            const toMove = pantry.filter(i => selection.has(i.id));
            setGroceries(prev => {
                const next = [...prev];
                toMove.forEach(item => {
                    const idx = next.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
                    if (idx > -1) next[idx].quantity += item.quantity; else next.push(item);
                });
                return next;
            });
            setPantry(prev => prev.filter(i => !selection.has(i.id)));
            addToast(`Moved ${selection.size} to Shopping List`, "success");
        }
        setSelection(new Set());
    }, [selection, groceries, pantry, addToast]);

    const removeSelected = useCallback(() => {
        if (!window.confirm("Remove selected items?")) return;
        if (activeTab === "groceries") setGroceries(prev => prev.filter(i => !selection.has(i.id)));
        else setPantry(prev => prev.filter(i => !selection.has(i.id)));
        addToast(`Removed ${selection.size} items`, "info"); setSelection(new Set());
    }, [selection, activeTab, addToast]);

    const updateItem = useCallback((id: string, updates: Partial<GroceryItem>) => {
        const setList = activeTab === "groceries" ? setGroceries : setPantry;
        setList(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }, [activeTab]);

    const displayedItems = useMemo(() => {
        const source = activeTab === "groceries" ? groceries : pantry;
        return source.filter(item => item.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    }, [activeTab, groceries, pantry, debouncedSearch]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, GroceryItem[]> = {};
        displayedItems.forEach(item => { if (!groups[item.category]) groups[item.category] = []; groups[item.category].push(item); });
        return groups;
    }, [displayedItems]);

    const isLoading = !mounted; // Using mounted as a proxy for loading since it loads from localStorage on mount

    return (

        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex overflow-hidden font-sans">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen overflow-hidden ${collapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"}`}>
                <Header toggleMobileMenu={() => setMobileMenuOpen(true)} viewMode="day" setViewMode={() => {}} selectedDate={new Date()} onDateChange={() => {}} theme={theme} onThemeChange={setTheme} isProcessing={isGenerating} />
                <ClientOnly fallback={
                    <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                        <div className="max-w-7xl mx-auto space-y-12">
                            <SectionSkeleton />
                            <GridSkeleton count={8} type="card" />
                        </div>
                    </div>
                }>
                    <DataReady loading={isLoading} fallback={
                        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                            <div className="max-w-7xl mx-auto space-y-12">
                                <SectionSkeleton />
                                <GridSkeleton count={8} type="card" />
                            </div>
                        </div>
                    }>
                        <div className="flex-1 p-4 lg:p-8 overflow-y-auto relative scrollbar-hide">
                            <div className="max-w-7xl mx-auto pb-24">
                                <div className="fixed bottom-8 right-8 z-[110] flex flex-col space-y-3">
                                    <AnimatePresence>
                                        {toasts.map(t => (
                                            <motion.div key={t.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`flex items-center px-4 py-3 rounded-2xl shadow-2xl border ${t.type === "success" ? "bg-emerald-500 text-white border-emerald-400" : "bg-slate-800 text-white border-slate-700"}`}>
                                                {t.type === "success" ? <CheckCircle2 size={16} className="mr-2" /> : <Info size={16} className="mr-2 text-emerald-400" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t.message}</span>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 italic uppercase">Procurement <ShoppingCart size={28} className="inline-block ml-2 text-emerald-500 fill-emerald-500" /></h1>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activeTab === "groceries" ? "Weekly Shopping List" : "Pantry Inventory"}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => generateFromPlanner(groceries.length > 0)} className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500"><RefreshCcw size={14} className={`inline mr-2 ${isGenerating ? "animate-spin" : ""}`} /> Sync Planner</button>
                                        <button disabled={activeTab !== "groceries" || groceries.length === 0} onClick={() => setIsOrderModalOpen(true)} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50">Order Selection <ArrowUpRight size={16} className="inline ml-2" /></button>
                                    </div>
                                </div>
                                <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 rounded-3xl mb-12 border-b border-slate-200/40 dark:border-slate-800/40 px-4 flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex bg-[#f1f5f9] dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/50">
                                        <button onClick={() => { setActiveTab("groceries"); setSelection(new Set()); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === "groceries" ? "bg-slate-800 text-white" : "text-slate-500"}`}><Package size={14} className="inline mr-2" /> Shopping</button>
                                        <button onClick={() => { setActiveTab("pantry"); setSelection(new Set()); }} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === "pantry" ? "bg-slate-800 text-white" : "text-slate-500"}`}><Archive size={14} className="inline mr-2" /> Pantry</button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="relative flex-1 sm:w-64"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder={`Search...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold" /></div>
                                        <button onClick={() => setSelection(new Set(selection.size === displayedItems.length ? [] : displayedItems.map(i => i.id)))} disabled={displayedItems.length === 0} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl text-slate-400"><CheckSquare size={18} /></button>
                                        <AnimatePresence>{selection.size > 0 && (
                                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex space-x-2">
                                                <button onClick={() => moveBetween(activeTab === "groceries" ? "toPantry" : "toGroceries")} className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg"><ArrowLeftRight size={18} /></button>
                                                <button onClick={removeSelected} className="p-3 bg-red-500 text-white rounded-2xl shadow-lg"><Trash2 size={18} /></button>
                                            </motion.div>
                                        )}</AnimatePresence>
                                    </div>
                                </div>
                                {activeTab === "pantry" && (
                                    <div className="mb-16">
                                        <div className="flex items-center space-x-3 mb-6 px-2"><Zap size={18} className="text-yellow-500 fill-yellow-500" /><h2 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest italic">Quick Add Suggestions</h2><div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" /></div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{SUGGESTIONS.map(sug => (
                                            <button key={sug.id} onClick={() => !pantry.some(p => p.name === sug.name) && addItemToList(sug, "pantry")} disabled={pantry.some(p => p.name === sug.name)} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between disabled:opacity-50"><div className="min-w-0"><p className="text-[10px] font-black text-slate-800 dark:text-slate-100 truncate uppercase">{sug.name}</p><p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{sug.category}</p></div><div className={`p-1.5 rounded-lg ${pantry.some(p => p.name === sug.name) ? "text-slate-300" : "text-emerald-600 bg-emerald-50"}`}><PlusCircle size={12} /></div></button>
                                        ))}</div>
                                    </div>
                                )}
                                <AnimatePresence mode="wait">
                                    {isGenerating ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32"><Loader2 size={64} className="text-emerald-500 animate-spin" /><p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-6">Syncing Planner...</p></motion.div>
                                    ) : displayedItems.length === 0 ? (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 shadow-xl"><div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-200 mb-8">{activeTab === "groceries" ? <ShoppingCart size={48} /> : <Archive size={48} />}</div><h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic uppercase">Your {activeTab} is empty</h3><button onClick={() => activeTab === "groceries" ? generateFromPlanner() : setActiveTab("groceries")} className="px-10 py-5 bg-slate-900 dark:bg-emerald-500 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest mt-10 hover:scale-105 active:scale-95 transition-all shadow-2xl">{activeTab === "groceries" ? "Sync From Planner" : "Add From Groceries"}</button></motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">{Object.keys(groupedItems).sort().map(cat => (
                                            <div key={cat}><div className="flex items-center space-x-4 mb-8 px-2"><div className="pl-4 pr-6 py-2 bg-slate-800 rounded-2xl shadow-xl"><h2 className="text-[10px] font-black text-white uppercase tracking-widest italic">{cat} <span className="ml-3 text-emerald-400 opacity-60">[{groupedItems[cat].length}]</span></h2></div><div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" /></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{groupedItems[cat].map(item => (<GroceryItemCard key={item.id} item={item} selected={selection.has(item.id)} onToggle={toggleSelection} onUpdate={updateItem} />))}</div></div>
                                        ))}</motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </DataReady>
                </ClientOnly>
            </main>
            <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} selectedItems={groceries.filter(i => selection.has(i.id)).map(i => i.name)} />
        </div>
    );
}
