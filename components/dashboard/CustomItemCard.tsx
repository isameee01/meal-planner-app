"use client";

import { motion } from "framer-motion";
import { Info, Heart, Trash2, Clock, Users, Utensils } from "lucide-react";
import { useFavorites } from "../../lib/hooks/useFavorites";
import { CustomFood, CustomRecipe } from "../../types/custom-recipes";

interface CustomItemCardProps {
    item: (CustomFood & { type: 'food' }) | (CustomRecipe & { type: 'recipe' });
    onDelete: () => void;
    onView: () => void;
}

export default function CustomItemCard({ item, onDelete, onView }: CustomItemCardProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const isFood = item.type === "food";
    const favorited = isFavorite(item.id);
    const fallbackImage = "/placeholder-food.png";

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none group h-full flex flex-col transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={item.image || fallbackImage} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        isFood ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                    }`}>
                        {isFood ? "Food" : "Recipe"}
                    </span>
                </div>

                {/* Favorite Button */}
                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item.id); }}
                    className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all z-10 shadow-lg ${
                        favorited 
                            ? "bg-red-500 text-white" 
                            : "bg-white/90 text-slate-400 hover:text-red-500"
                    }`}
                >
                    <Heart size={18} fill={favorited ? "currentColor" : "none"} />
                </button>

                {/* Delete Button (Overlay) */}
                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                    className="absolute bottom-4 right-4 p-2 bg-white/20 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 
                    onClick={onView}
                    className="text-lg font-black text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-emerald-500 transition-colors cursor-pointer hover:underline"
                >
                    {item.name}
                </h3>
                
                {isFood ? (
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calories</span>
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{(item as CustomFood).calories}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protein</span>
                            <span className="text-sm font-black text-blue-500">{(item as CustomFood).protein}g</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center text-slate-500 space-x-1">
                            <Clock size={14} />
                            <span className="text-xs font-bold">{(item as CustomRecipe).prepTime + (item as CustomRecipe).cookTime}m</span>
                        </div>
                        <div className="flex items-center text-slate-500 space-x-1">
                            <Users size={14} />
                            <span className="text-xs font-bold">{(item as CustomRecipe).yields} sv</span>
                        </div>
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center text-slate-400">
                        <Utensils size={14} className="mr-1" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                            {isFood ? `${(item as CustomFood).servingSize} ${(item as CustomFood).servingUnit}` : (item as CustomRecipe).mealCategory}
                        </span>
                    </div>
                    
                    <button 
                        onClick={(e) => { e.preventDefault(); onView(); }}
                        className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline flex items-center space-x-1"
                    >
                        <Info size={12} />
                        <span>View</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
