"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ChevronLeft, 
    Plus, 
    Heart, 
    Ban, 
    Timer, 
    Users, 
    Flame, 
    ChefHat, 
    ListChecks, 
    PieChart as PieChartIcon, 
    Info,
    Printer,
    FileDown,
    Loader2,
    CheckCircle2,
    Clock,
    Scale,
    Activity,
    AlertCircle,
    ShoppingCart,
    Package,
    ChevronRight,
    Calendar
} from "lucide-react";
import { FULL_DISCOVER_DATABASE, FoodItem } from "../../../../lib/discover-db";
import NutritionDetailsModal from "../../../../components/discover/NutritionDetailsModal";
import AddToPlannerModal from "../../../../components/discover/AddToPlannerModal";
import { useGlobalFoodState } from "../../../../lib/contexts/FoodStateContext";
import { useMealState } from "../../../../lib/contexts/MealStateContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

export default function FoodDetailPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    
    const { id } = useParams();
    const router = useRouter();
    const { 
        savedFoods, 
        favoriteFoods, 
        blockedFoods, 
        toggleSaveFood, 
        toggleFavoriteFood, 
        blockFood, 
        unblockFood 
    } = useGlobalFoodState();
    const { mealsMap } = useMealState();
    
    const [food, setFood] = useState<FoodItem | null>(null);
    const [servings, setServings] = useState(1);
    const [isNutritionOpen, setIsNutritionOpen] = useState(false);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [toasts, setToasts] = useState<{ id: string, message: string, type: "success" | "error" }[]>([]);

    useEffect(() => {
        // 1. Try static database
        let found = FULL_DISCOVER_DATABASE.find((f: FoodItem) => f.id === id);
        
        // 2. Try active meal context (for AI generated meals)
        if (!found) {
            Object.values(mealsMap).forEach(dayMeals => {
                dayMeals.forEach(meal => {
                    const item = meal.items.find(i => i.food.id === id);
                    if (item) found = item.food as any;
                });
            });
        }

        if (found) {
            setFood(found);
            setServings(Number(found?.servings || 1));
        }
    }, [id, mealsMap]);

    const isSaved = useMemo(() => savedFoods.includes(id as string), [savedFoods, id]);
    const isFavorite = useMemo(() => favoriteFoods.includes(id as string), [favoriteFoods, id]);
    const isBlocked = useMemo(() => blockedFoods.includes(id as string), [blockedFoods, id]);

    const addToast = (message: string, type: "success" | "error" = "success") => {
        const tid = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id: tid, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== tid)), 3000);
    };

    const scaleValue = (val: number | undefined) => Math.round((val || 0) * servings);

    // Calculate Usage
    const usage = useMemo(() => {
        if (!food) return [];
        const occurrences: { date: string, slot: string }[] = [];
        Object.entries(mealsMap).forEach(([date, meals]) => {
            meals.forEach(meal => {
                if (meal.items.some(item => item.food.id === food.id)) {
                    occurrences.push({ date, slot: meal.slot });
                }
            });
        });
        return occurrences;
    }, [mealsMap, food]);

    if (!mounted || !food) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );


    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        if (!food) return;
        setIsExporting(true);
        
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;

            // --- 1. PREMIUM HEADER ---
            // Gradient Header Bar (Simulated with Rects if needed, or just Solid Emerald)
            doc.setFillColor(16, 185, 129); // Emerald-500 (#10B981)
            doc.rect(0, 0, pageWidth, 40, 'F');

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("CustomDailyDiet", margin, 22);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("AUTOPILOT YOUR DIET", margin, 30);

            doc.setFontSize(8);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, 22);

            // --- 2. TITLE SECTION ---
            let currentY = 60;
            doc.setTextColor(15, 23, 42); // slate-900
            doc.setFont("helvetica", "bold");
            doc.setFontSize(28);
            doc.text(food.name.toUpperCase(), margin, currentY);

            // Stats Row
            currentY += 15;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`${food.category}  |  ${food.servings} Servings  |  ${food.nutrition.calories} kcal per serving`, margin, currentY);

            // Bottom Border for Title
            doc.setDrawColor(226, 232, 240); // slate-200
            doc.line(margin, currentY + 8, pageWidth - margin, currentY + 8);

            // --- 3. BODY (2-COLUMN) ---
            currentY += 25;
            const colWidth = (pageWidth - (margin * 3)) / 2;
            
            // LEFT COLUMN: Ingredients
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(16, 185, 129); // Emerald
            doc.text("INGREDIENTS", margin, currentY);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85); // slate-700
            
            let ingY = currentY + 10;
            food.ingredients.forEach((ing, i) => {
                const text = `${ing.name}: ${ing.amount}`;
                const lines = doc.splitTextToSize(text, colWidth);
                doc.text(lines, margin, ingY);
                ingY += (lines.length * 6) + 2;
            });

            // RIGHT COLUMN: Nutrition Table
            const rightColX = margin + colWidth + margin;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(16, 185, 129);
            doc.text("NUTRITION", rightColX, currentY);

            const tableData = [
                [{ content: 'MACROS', colSpan: 2, styles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'bold' as const, fontSize: 8 } }],
                ['Calories', `${food.nutrition.calories} kcal`],
                ['Protein', `${food.nutrition.protein}g`],
                ['Carbs', `${food.nutrition.carbs}g`],
                ['Fat', `${food.nutrition.fat}g`],
                ['Fiber', `${food.nutrition.fiber}g`],
                [{ content: 'VITAMINS', colSpan: 2, styles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'bold' as const, fontSize: 8 } }],
                ['Vitamin A', food.nutrition.vitamins.vitaminA],
                ['Vitamin C', food.nutrition.vitamins.vitaminC],
                ['Vitamin D', food.nutrition.vitamins.vitaminD],
                [{ content: 'MINERALS', colSpan: 2, styles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'bold' as const, fontSize: 8 } }],
                ['Calcium', food.nutrition.minerals.calcium],
                ['Iron', food.nutrition.minerals.iron],
                ['Magnesium', food.nutrition.minerals.magnesium],
            ];

            autoTable(doc, {
                startY: currentY + 5,
                margin: { left: rightColX - 5 }, // Nudge table to fit column
                head: [],
                body: tableData as any,
                theme: 'striped' as const,
                styles: { fontSize: 9, cellPadding: 3 },
                columnStyles: {
                    0: { fontStyle: 'bold' as const, cellWidth: 35 },
                    1: { halign: 'right' as const, cellWidth: 30 }
                },
                tableWidth: colWidth + 5
            });

            // --- 4. DIRECTIONS ---
            // Calculate where the directions should start (max of ingredients Y or table Y)
            let dirY = Math.max(ingY, (doc as any).lastAutoTable.finalY) + 20;

            // Check for page overflow before directions
            if (dirY > pageHeight - 40) {
                doc.addPage();
                dirY = 30;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(16, 185, 129);
            doc.text("PREPARATION DIRECTIONS", margin, dirY);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(51, 65, 85);
            dirY += 12;

            food.directions.forEach((step, i) => {
                const stepText = `${i + 1}.  ${step}`;
                const lines = doc.splitTextToSize(stepText, pageWidth - (margin * 2));
                
                // Overflow check during steps
                if (dirY + (lines.length * 7) > pageHeight - 20) {
                    doc.addPage();
                    dirY = 30;
                }

                doc.text(lines, margin, dirY);
                dirY += (lines.length * 7) + 6; // Proper spacing and line height
            });

            // --- 5. FOOTER ---
            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setDrawColor(226, 232, 240);
                doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
                
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184); // slate-400
                doc.text(`Generated by CustomDailyDiet AI Platform  |  Page ${i} of ${totalPages}`, margin, pageHeight - 10);
                doc.text("www.customdailydiet.com", pageWidth - margin - 35, pageHeight - 10);
            }

            doc.save(`Recipe-${food.name.replace(/\s+/g, '-')}.pdf`);
            addToast("Recipe exported to PDF successfully!");
        } catch (error) {
            console.error("PDF Export Error:", error);
            addToast("Failed to generate PDF. Please try again.", "error");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-full pb-20 bg-white dark:bg-slate-900 transition-colors relative">
            
            {/* Toast System */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div 
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`flex items-center gap-3 px-6 py-4 rounded-3xl shadow-2xl border-2 pointer-events-auto ${toast.type === "success" ? "bg-emerald-500 border-emerald-400 text-white" : "bg-red-500 border-red-400 text-white"}`}
                        >
                            {toast.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                            <span className="font-bold text-sm tracking-tight">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Header / Nav */}
            <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 no-print flex-wrap gap-4">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold uppercase text-xs tracking-widest"
                >
                    <ChevronLeft size={20} />
                    Back to Previous
                </button>
                <div className="flex gap-4">
                    <button 
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-sm tracking-tight shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                        <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm tracking-tight border border-slate-200 dark:border-slate-700 active:scale-95 transition-transform"
                    >
                        <Printer size={18} />
                        Print Recipe
                    </button>
                    <button 
                        onClick={() => setIsPlannerOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm tracking-tight shadow-lg shadow-emerald-200/50 active:scale-95 transition-transform"
                    >
                        <Plus size={18} />
                        <span>Add to Planner</span>
                    </button>
                </div>
            </div>

            {/* Standard Main View */}
            <div className="max-w-7xl mx-auto px-6 py-12 no-print">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                >
                    
                    {/* LEFT: Image & Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800">
                            <Image 
                                src={food.image} 
                                alt={food.name} 
                                fill 
                                className="object-cover"
                                priority
                            />
                            <div className="absolute top-6 left-6">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-emerald-600 font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest">
                                    {food.category}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <button 
                                onClick={() => toggleSaveFood(food.id)}
                                title={isSaved ? "Remove from Saved" : "Save Food"}
                                className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${isSaved ? "bg-red-500 text-white border-red-500 shadow-lg" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-red-500"}`}
                            >
                                <Heart size={24} fill={isSaved ? "white" : "none"} />
                                <span className="text-[10px] font-bold uppercase mt-2">{isSaved ? "Saved" : "Save"}</span>
                            </button>
                            <button 
                                onClick={() => toggleFavoriteFood(food.id)}
                                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${isFavorite ? "bg-amber-500 text-white border-amber-500 shadow-lg" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-amber-500"}`}
                            >
                                <Plus size={24} className={isFavorite ? "rotate-45" : ""} />
                                <span className="text-[10px] font-bold uppercase mt-2">{isFavorite ? "Favorited" : "Favorite"}</span>
                            </button>
                            <button 
                                onClick={() => isBlocked ? unblockFood(food.id) : blockFood(food.id)}
                                title={isBlocked ? "Unblock Food" : "Block Food"}
                                className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all ${isBlocked ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg" : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-black dark:hover:text-white"}`}
                            >
                                <Ban size={24} />
                                <span className="text-[10px] font-bold uppercase mt-2">{isBlocked ? "Blocked" : "Block"}</span>
                            </button>
                        </div>

                        <button 
                            onClick={() => setIsNutritionOpen(true)}
                            className="w-full flex items-center justify-between p-6 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white transition-all rounded-[2rem] group"
                        >
                            <div className="flex items-center gap-4">
                                <PieChartIcon size={24} />
                                <span className="font-bold text-sm uppercase tracking-wider text-left">Detailed Nutrition Information</span>
                            </div>
                            <ChefHat size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* CENTER: Info & Ingredients */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{food?.name || "Discovery Item"}</h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic pr-6 max-w-2xl">{food?.description || "High-quality nutritional component prepared for your custom plan."}</p>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-y border-slate-100 dark:border-slate-800">
                            {[
                                { icon: Timer, label: "Cook Time", value: `${(food?.prepTime || 0) + (food?.cookTime || 0)} min` },
                                { icon: Users, label: "Servings", value: food?.servings || 1 },
                                { icon: Flame, label: "Calories", value: `${food?.nutrition?.calories ?? food?.calories ?? 0} kcal` }
                            ].map(stat => (
                                <div key={stat.label} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                                        <stat.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ListChecks size={24} className="text-emerald-500" />
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Ingredients</h3>
                                    </div>
                                    
                                    {/* Serving Selector */}
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                        <button 
                                            onClick={() => setServings(Math.max(1, servings - 1))}
                                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center text-sm font-black text-slate-800 dark:text-white px-2 uppercase tracking-tighter">
                                            {servings} SV
                                        </span>
                                        <button 
                                            onClick={() => setServings(servings + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <ul className="space-y-2">
                                        {(food?.ingredients || []).map((ing: { name: string; amount: string }, i: number) => (
                                            <motion.li 
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group/ing"
                                            >
                                                <Link 
                                                    href={`/dashboard/ingredients/${encodeURIComponent(ing?.name || "Unknown")}`}
                                                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40 w-full"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/ing:text-emerald-500 transition-colors uppercase text-[11px] tracking-tight">{ing?.name || "Unknown"}</span>
                                                        <ChevronRight size={12} className="text-slate-300 opacity-0 group-hover/ing:opacity-100 transition-all" />
                                                    </div>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-black italic text-xs">
                                                        {ing?.amount}
                                                    </span>
                                                </Link>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {/* BUY ONLINE MOCK BUTTONS */}
                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Provisions & Sourcing</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#FF9900] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-orange-500/10">
                                                <ShoppingCart size={14} />
                                                Buy on Amazon
                                            </button>
                                            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#0071CE] text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-blue-500/10">
                                                <Package size={14} />
                                                Walmart+
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Activity size={24} className="text-emerald-500" />
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Nutritional Focus</h3>
                                </div>
                                
                                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-8 shadow-2xl shadow-slate-200 dark:shadow-none relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                        <PieChartIcon size={80} />
                                    </div>

                                    <div className="relative flex justify-center mb-4">
                                        <div className="w-40 h-40">
                                            <svg viewBox="0 0 36 36" className="w-full h-full">
                                                <path className="text-emerald-500" stroke="currentColor" strokeWidth="4" strokeDasharray={`${Math.round(((food?.nutrition?.carbs ?? food?.carbs ?? 1) * 4 / (food?.nutrition?.calories ?? food?.calories ?? 1)) * 100)}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="text-blue-500" stroke="currentColor" strokeWidth="4" strokeDashoffset={-Math.round(((food?.nutrition?.carbs ?? food?.carbs ?? 0) * 4 / (food?.nutrition?.calories ?? food?.calories ?? 1)) * 100)} strokeDasharray={`${Math.round(((food?.nutrition?.protein ?? food?.protein ?? 0) * 4 / (food?.nutrition?.calories ?? food?.calories ?? 1)) * 100)}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="text-amber-500" stroke="currentColor" strokeWidth="4" strokeDashoffset={-Math.round((((food?.nutrition?.carbs ?? food?.carbs ?? 0) * 4 + (food?.nutrition?.protein ?? food?.protein ?? 0) * 4) / (food?.nutrition?.calories ?? food?.calories ?? 1)) * 100)} strokeDasharray={`${Math.round(((food?.nutrition?.fat ?? food?.fat ?? 0) * 9 / (food?.nutrition?.calories ?? food?.calories ?? 1)) * 100)}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center font-black">
                                                <span className="text-3xl text-emerald-400 leading-none">{scaleValue(food?.nutrition?.calories ?? food?.calories ?? 0)}</span>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Kcal</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: "Protein", color: "bg-blue-500", value: `${scaleValue(food?.nutrition?.protein ?? food?.protein ?? 0)}g` },
                                            { label: "Carbs", color: "bg-emerald-500", value: `${scaleValue(food?.nutrition?.carbs ?? food?.carbs ?? 0)}g` },
                                            { label: "Fat", color: "bg-amber-500", value: `${scaleValue(food?.nutrition?.fat ?? food?.fat ?? 0)}g` }
                                        ].map(macro => (
                                            <div key={macro.label} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-3 h-3 rounded-full ${macro.color}`} />
                                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{macro.label}</span>
                                                </div>
                                                <span className="text-sm font-black">{macro.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Directions Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <ChefHat size={24} className="text-emerald-500" />
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Preparation Directions</h3>
                            </div>
                            
                            <div className="space-y-8">
                                {food.directions.map((step, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-emerald-500 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                                {i + 1}
                                            </div>
                                            {i < food.directions.length - 1 && (
                                                <div className="absolute top-14 bottom-[-32px] left-1/2 w-0.5 bg-slate-100 dark:bg-slate-800 -translate-x-1/2" />
                                            )}
                                        </div>
                                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium pt-1 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Usage Section */}
                        <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-3 mb-8">
                                <Calendar size={24} className="text-emerald-500" />
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Usage Tracking</h3>
                            </div>
                            
                            {usage.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {usage.map((u, i) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{u.slot}</p>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1 uppercase tracking-tight">{u.date}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Not currently scheduled in your plan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Hidden Print Content (Standard browser print) */}
            <div className="hidden print:block print-container bg-white text-black p-10 font-sans w-full">
                <div className="print-header flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                     <div className="flex-1">
                        <h1 className="text-4xl font-bold uppercase tracking-tighter m-0">{food.name}</h1>
                        <p className="text-sm italic text-gray-600 m-0">{food.category} • {food.servings} Servings</p>
                     </div>
                     <div className="text-right">
                        <div className="text-2xl font-black">{food?.nutrition?.calories || food?.calories || 0} KCAL</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Per Serving</div>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                    <div>
                        <h2 className="text-xl font-bold uppercase border-b border-gray-300 pb-2 mb-4">Ingredients</h2>
                        <ul className="space-y-2">
                            {(food?.ingredients || []).map((ing, i) => (
                                <li key={i} className="flex justify-between text-sm border-b border-gray-100 py-1">
                                    <span className="font-bold">{ing.name}</span>
                                    <span className="font-mono">{ing.amount}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold uppercase border-b border-gray-300 pb-2 mb-4">Nutrition per Serving</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                <NutrientRow key="protein" label="Protein" value={(food?.nutrition?.protein ?? food?.protein ?? 0) * (servings || 1)} unit="g" />,
                                <NutrientRow key="carbs" label="Carbohydrates" value={(food?.nutrition?.carbs ?? food?.carbs ?? 0) * (servings || 1)} unit="g" />,
                                <NutrientRow key="fiber" label="Dietary Fiber" value={(food?.nutrition?.fiber ?? food?.fiber ?? 0) * (servings || 1)} unit="g" />,
                                <NutrientRow key="fat" label="Total Fats" value={(food?.nutrition?.fat ?? food?.fat ?? 0) * (servings || 1)} unit="g" />,
                                <NutrientRow key="sodium" label="Sodium" value={(food?.nutrition?.sodium ?? food?.sodium ?? 0) * (servings || 1)} unit="mg" />,
                                <NutrientRow key="sugar" label="Sugar" value={(food?.nutrition?.sugar?.total ?? food?.sugar ?? 0) * (servings || 1)} unit="g" />
                            ].map(item => (
                                <div key={item.key} className="flex justify-between items-center text-sm border-b border-gray-100 py-1">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-xl font-bold uppercase border-b border-gray-300 pb-2 mb-4">Preparation Directions</h2>
                    <div className="space-y-6">
                        {(food?.directions || []).map((step: string, i: number) => (
                            <div key={i} className="flex gap-4">
                                <span className="font-black text-2xl text-gray-200">{i + 1}</span>
                                <p className="text-sm leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="mt-20 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 uppercase tracking-[0.3em]">
                    Generated by CustomDailyDiet AI Platform
                </footer>
            </div>

            {/* Modals */}
            <NutritionDetailsModal 
                isOpen={isNutritionOpen}
                onClose={() => setIsNutritionOpen(false)}
                food={food}
            />

            <AddToPlannerModal 
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                food={food}
            />
        </div>
    );
}

const NutrientRow = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
    <div className="flex justify-between items-center w-full px-1">
        <span className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">{label}</span>
        <span className="font-black text-sm text-slate-800 dark:text-slate-100">{Math.round(value)}{unit}</span>
    </div>
);

