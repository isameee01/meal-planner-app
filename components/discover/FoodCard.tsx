"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MoreHorizontal, Plus, Heart, Ban, AlertCircle, Printer, Copy, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FoodItem, getFoodImage } from "../../lib/discover-db";
import { useGlobalFoodState } from "../../lib/contexts/FoodStateContext";
import { useFavorites } from "../../lib/hooks/useFavorites";

interface FoodCardProps {
    food: FoodItem;
    onAddToPlanner: (food: FoodItem) => void;
    onOpenNutrition: (food: FoodItem) => void;
    viewMode: "grid" | "list";
}

export default function FoodCard({ 
    food, 
    onAddToPlanner, 
    onOpenNutrition,
    viewMode 
}: FoodCardProps) {
    const { blockedFoods, blockFood } = useGlobalFoodState();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [hovered, setHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const favorited = isFavorite(food.id);
    const isBlocked = blockedFoods.includes(food.id);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const macroConfig = [
        { key: "protein", label: "P", color: "bg-blue-500", textColor: "text-blue-500" },
        { key: "carbs", label: "C", color: "bg-emerald-500", textColor: "text-emerald-500" },
        { key: "fat", label: "F", color: "bg-amber-500", textColor: "text-amber-500" }
    ];

    if (isBlocked) return null;

    const imageUrl = food.image || "/placeholder-food.png";

    if (viewMode === "list") {
        return (
            <motion.div 
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-all group no-print"
            >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                        </div>
                    )}
                    <Image 
                        src={imageUrl}
                        alt={food.name}
                        fill
                        className={`object-cover group-hover:scale-105 transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0 scale-110"}`}
                        onLoadingComplete={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/dashboard/discover/${food.id}`} className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate hover:text-emerald-500 transition-colors">
                            {food.name}
                        </Link>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full font-medium uppercase tracking-wider">
                            {food.category}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{food.description}</p>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => onOpenNutrition(food)}
                            className="text-sm font-black text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            {food.nutrition.calories} Cal
                        </button>
                        <div className="flex gap-4">
                            {macroConfig.map(m => (
                                <span key={m.key} className={`flex items-center gap-1.5 text-[11px] font-bold ${m.textColor}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
                                    {m.label}: {food.nutrition[m.key as keyof typeof food.nutrition] as number}g
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onAddToPlanner(food)}
                        className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                    >
                        <Plus size={20} />
                    </button>
                    <button 
                        onClick={() => toggleFavorite(food.id)}
                        className={`p-2.5 rounded-xl border transition-all ${favorited ? "bg-red-500 text-white border-red-500 shadow-md" : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                        <Heart size={20} fill={favorited ? "currentColor" : "none"} />
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full no-print"
        >
            {/* Header Image */}
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                {!imageLoaded && (
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                )}
                
                <Link href={`/dashboard/discover/${food.id}`}>
                    <Image 
                        src={imageUrl}
                        alt={food.name}
                        fill
                        className={`object-cover group-hover:scale-110 transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0 scale-105"}`}
                        onLoadingComplete={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                </Link>
                
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                        onClick={() => onAddToPlanner(food)}
                        className="p-2.5 bg-white/90 backdrop-blur-md text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                    >
                        <Plus size={20} />
                    </button>
                    <button 
                        onClick={() => toggleFavorite(food.id)}
                        className={`p-2.5 rounded-xl transition-all shadow-lg ${favorited ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-md text-slate-500 hover:text-red-500"}`}
                    >
                        <Heart size={20} fill={favorited ? "currentColor" : "none"} />
                    </button>
                </div>

                <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold px-2 py-1 bg-white/90 backdrop-blur-md text-slate-900 rounded-lg shadow-sm uppercase tracking-wider">
                        {food.category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <Link href={`/dashboard/discover/${food.id}`} className="block mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-500 transition-colors">
                        {food.name}
                    </h3>
                </Link>
                
                {/* Calories with Hover Tooltip */}
                <div className="relative mb-6">
                    <button 
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        onClick={() => onOpenNutrition(food)}
                        className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-baseline gap-1 hover:text-emerald-500 transition-colors"
                    >
                        {food.nutrition.calories}
                        <span className="text-xs font-medium text-slate-500">kcal</span>
                    </button>

                    <AnimatePresence>
                        {hovered && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-full left-0 mb-3 z-50 w-56 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl pointer-events-none"
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="opacity-70 font-bold">Protein</span>
                                        </div>
                                        <span className="font-black text-blue-400 dark:text-blue-600">{food.nutrition.protein}g</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="opacity-70 font-bold">Carbs</span>
                                        </div>
                                        <span className="font-black text-emerald-400 dark:text-emerald-600">{food.nutrition.carbs}g</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                            <span className="opacity-70 font-bold">Fat</span>
                                        </div>
                                        <span className="font-black text-amber-400 dark:text-amber-600">{food.nutrition.fat}g</span>
                                    </div>
                                    <div className="pt-2 border-t border-white/10 dark:border-slate-900/10 flex items-center gap-1.5 text-[10px] font-bold uppercase opacity-50">
                                        <Info size={12} />
                                        Click for full breakdown
                                    </div>
                                </div>
                                <div className="absolute top-full left-6 -translate-y-1/2 w-4 h-4 bg-slate-900 dark:bg-white rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Macro Bars UI */}
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex-1 flex gap-2 overflow-hidden">
                        {macroConfig.map((m) => (
                            <div key={m.key} className="flex-1 space-y-1">
                                <div className="flex justify-between text-[10px] font-black uppercase italic tracking-tighter">
                                    <span className="text-slate-400">{m.label}</span>
                                    <span className={m.textColor}>{food.nutrition[m.key as keyof typeof food.nutrition] as number}g</span>
                                </div>
                                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (food.nutrition[m.key as keyof typeof food.nutrition] as number) * 4)}%` }}
                                        className={`h-full ${m.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shadow-sm border border-transparent hover:border-slate-200"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute right-0 bottom-full mb-3 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 z-50 overflow-hidden"
                                >
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all">
                                        <Copy size={16} className="text-emerald-500" /> <span>Copy Recipe</span>
                                    </button>
                                    <button 
                                        onClick={() => window.print()}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all"
                                    >
                                        <Printer size={16} className="text-blue-500" /> <span>Print Recipe</span>
                                    </button>
                                    <button 
                                        onClick={() => { blockFood(food.id); setMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    >
                                        <Ban size={16} /> <span>Block Recipe</span>
                                    </button>
                                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all">
                                        <AlertCircle size={16} /> <span>Report Problem</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
