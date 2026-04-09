"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Users, Utensils, Salad, ChefHat, Info, Flame, Brain, Droplets, Target, Heart } from "lucide-react";
import { CustomFood, CustomRecipe } from "../../types/custom-recipes";
import { useFavorites } from "../../lib/hooks/useFavorites";

interface CustomItemModalProps {
    item: CustomFood | CustomRecipe;
    onClose: () => void;
}

export default function CustomItemModal({ item, onClose }: CustomItemModalProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    // Structural type detection
    const isFood = "calories" in item;
    const favorited = isFavorite(item.id);
    const fallbackImage = "/placeholder-food.png";

    // UX: Prevent background scroll and handle ESC key
    useEffect(() => {
        document.body.style.overflow = "hidden";
        
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);

        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
                />

                {/* Modal Content Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={stopPropagation}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                    {/* Header Image */}
                    <div className="relative h-56 sm:h-64 w-full overflow-hidden flex-shrink-0">
                        <img 
                            src={item.image || fallbackImage} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = fallbackImage;
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
                                    favorited 
                                        ? "bg-red-500 text-white" 
                                        : "bg-black/20 text-white hover:bg-black/40"
                                }`}
                            >
                                <Heart size={20} fill={favorited ? "currentColor" : "none"} />
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg inline-block mb-2 ${
                                isFood ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                            }`}>
                                {isFood ? "Custom Food" : "Custom Recipe"}
                            </span>
                            <h2 className="text-2xl font-black text-white leading-tight line-clamp-2">{item.name}</h2>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                        {/* Description */}
                        {item.description && (
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Info size={12} />
                                    <span>Description</span>
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic border-l-2 border-emerald-500/20 pl-3">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {isFood ? (
                            <FoodContent food={item as CustomFood} />
                        ) : (
                            <RecipeContent recipe={item as CustomRecipe} />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end flex-shrink-0">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                        >
                            Close View
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function FoodContent({ food }: { food: CustomFood }) {
    return (
        <div className="space-y-8">
            {/* Macro Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <NutritionStat label="Calories" value={food.calories} unit="kcal" icon={Flame} color="orange" />
                <NutritionStat label="Protein" value={food.protein} unit="g" icon={Brain} color="emerald" />
                <NutritionStat label="Carbs" value={food.carbs} unit="g" icon={Droplets} color="blue" />
                <NutritionStat label="Fats" value={food.fats} unit="g" icon={Target} color="yellow" />
            </div>

            {/* Serving Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 dark:border-slate-800">
                    <Utensils size={20} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Serving Dimensions</h4>
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100 capitalize">
                        {food.servingSize} {food.servingUnit}
                    </p>
                </div>
            </div>
        </div>
    );
}

function RecipeContent({ recipe }: { recipe: CustomRecipe }) {
    return (
        <div className="space-y-8">
            {/* Meta Stats */}
            <div className="grid grid-cols-3 gap-3 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div className="text-center">
                    <Clock size={16} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Prep Time</p>
                    <p className="text-xs font-black">{recipe.prepTime}m</p>
                </div>
                <div className="text-center">
                    <Utensils size={16} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Cook Time</p>
                    <p className="text-xs font-black">{recipe.cookTime}m</p>
                </div>
                <div className="text-center">
                    <Users size={16} className="mx-auto text-emerald-500 mb-1" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Yields</p>
                    <p className="text-xs font-black">{recipe.yields} sv</p>
                </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Salad size={14} className="text-emerald-500" />
                    <span className="uppercase tracking-widest">Ingredients List</span>
                </h4>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recipe.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{ing}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] font-bold text-slate-400 italic px-2">No ingredients available</p>
                )}
            </div>

            {/* Preparation Steps */}
            <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ChefHat size={14} className="text-blue-500" />
                    <span className="uppercase tracking-widest">Directions</span>
                </h4>
                {recipe.steps && recipe.steps.length > 0 ? (
                    <div className="space-y-3">
                        {recipe.steps.map((step, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-[10px] text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                    {i + 1}
                                </div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed pt-1.5">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] font-bold text-slate-400 italic px-2">No instructions available</p>
                )}
            </div>
        </div>
    );
}

function NutritionStat({ label, value, unit, icon: Icon, color }: any) {
    const colorStyles: Record<string, string> = {
        orange: "text-orange-500 bg-orange-50 dark:bg-orange-950/20",
        emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
        blue: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
        yellow: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
    };

    return (
        <div className={`p-3 rounded-2xl flex flex-col items-center gap-1 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all ${colorStyles[color]}`}>
            <Icon size={14} strokeWidth={2.5} />
            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</p>
            <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-black tracking-tight">{value}</span>
                <span className="text-[7px] font-black uppercase italic opacity-40">{unit}</span>
            </div>
        </div>
    );
}
